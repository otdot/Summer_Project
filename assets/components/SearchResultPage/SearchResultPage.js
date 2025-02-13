import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BsHeartFill } from "react-icons/bs";

import Card from "../Card/Card";
import Loading from "../Loading/Loading";
import "./SearchResultPage.scss";

const SearchResultPage = () => {
  const searchResult = useLocation().state.response;
  const [events, setEvents] = useState(searchResult.data);
  const [meta, setMeta] = useState(searchResult.meta);
  const [tags, setTags] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getTagsAndLikes(events);
  }, []);

  const getTagsAndLikes = (array) => {
    setLoading(true);
    const getTags = array.map((tag, i) => {
      return tag.keywords.map((singleEvent) => {
        if (!singleEvent["@id"]) {
          return;
        }
        return axios.get(singleEvent["@id"]);
      });
    });
    const allTags = axios.all(
      getTags.map((tagArr) => {
        return axios.all(tagArr);
      })
    );
    allTags
      .then(axios.spread((...res) => setTags(res)))
      .catch((err) => console.log("loading tags returned: ", err))
      .finally(() =>
        axios
          .get("http://127.0.0.1:8000/spa/getlikes")
          .then((res) => setLikes(res.data))
          .catch((err) =>
            console.log("getting event likes returned an error: ", err)
          )
          .then(() => setLoading(false))
      );
  };

  const changePage = (fetch) => {
    setLoading(true);
    axios
      .get(fetch)
      .then((res) => {
        setEvents(res.data.data);
        setMeta(res.data.meta);
        getTagsAndLikes(res.data.data);
      })
      .catch((err) => console.log("loading new events returned: ", err))
      .then(() => setLoading(false));
  };

  const getEventsByCategory = (e) => {
    axios
      .get(
        `https://api.hel.fi/linkedevents/v1/event/?keyword=${e.target.dataset.id}&start=today&sort=end_time`
      )
      .then((response) => {
        navigate(`/search/${e.target.textContent.replaceAll(" ", "_")}`, {
          state: { response: response.data },
        });
        window.location.reload();
      })
      .catch((err) => console.log("loading events by tag returned: ", err));
  };

  const handleLike = (id, endTime, addLike, addInterest) => {
    const eventHasLikes = likes.filter((like) => like.eventId.includes(id));
    if (eventHasLikes.length > 0) {
      axios
        .put(`http://127.0.0.1:8000/spa/updatelike/${eventHasLikes[0].id}`, {
          eventId: id,
          endDate: endTime,
          likeCount: addLike,
          interestCount: addInterest,
        })
        .then((res) => console.log("res: ", res))
        .catch((err) =>
          console.log("updating likes or interestCount returned error: ", err)
        );
    } else {
      if (!id || !endTime) {
        console.log(
          "id: ",
          id,
          "or endtime: ",
          endTime,
          "is falsy. Could not add interestCount"
        );
        return;
      }
      let postForm = new FormData();
      postForm.append("eventId", id);
      postForm.append("endDate", endTime);
      postForm.append("likeCount", addLike);
      postForm.append("interestCount", addInterest);
      axios
        .post("http://127.0.0.1:8000/spa/addlikes", postForm)
        .then((res) => console.log("interestCountposted posted", res))
        .catch((err) =>
          console.log("error occurred when posting interestCount: ", err)
        )
        .finally(() => {
          axios
            .get("http://127.0.0.1:8000/spa/getlikes")
            .then((res) => setLikes(res.data));
        });
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (events.length === 0) {
    return (
      <div>
        <p>no results</p>
      </div>
    );
  }

  return (
    <div className="eventContainer">
      {events.map((event, i) => {
        const likeData = likes.find((like) => like.eventId === event.id);
        const singleEventTags = tags[i]?.map((tag, i) => {
          return (
            <li
              onClick={(e) => getEventsByCategory(e)}
              key={i}
              data-id={tag.data.id}
              className="tag"
            >
              {tag.data.name.en || tag.data.name.fi || tag.data.name.sv}
            </li>
          );
        });

        let image;
        try {
          image = event.images[0].url;
        } catch {
          image = "http://source.unsplash.com/afW1hht0NSs";
        }
        return (
          <Card
            eventImage={image}
            key={event.id}
            id={event.id}
            name={
              event.name.en || event.name.fi || event.name.sv || event.name.ru
            }
            locationCall={event.location ? event.location["@id"] : ""}
            startDate={new Date(event?.start_time).toLocaleDateString()}
            startTime={new Date(event?.start_time).toLocaleTimeString()}
            endDate={
              new Date(event?.end_time).toLocaleDateString() ===
                new Date(event?.start_time).toLocaleDateString() ||
              new Date(event?.start_time).toLocaleDateString() >
                new Date(event?.end_time).toLocaleDateString()
                ? ""
                : new Date(event?.end_time).toLocaleDateString()
            }
            endTime={new Date(event?.end_time).toLocaleTimeString()}
            description={
              event.short_description?.en ||
              event.short_description?.fi ||
              event.short_description?.sv ||
              event.short_description?.ru
            }
            addInterest={() => {
              handleLike(event.id, event.end_time, 0, 1);
              navigate(`/events/${event.id}`, {
                state: { response: likeData },
              });
            }}
          >
            {<ul>{singleEventTags}</ul>}
            <div className="like">
              <BsHeartFill
                onClick={() => handleLike(event.id, event.end_time, 1, 0)}
              />
              <p>{likeData?.interestCount || "0"}</p>
            </div>
          </Card>
        );
      })}
      <div className="cardListNav">
        {meta.previous && (
          <button
            className="prevButton "
            onClick={() => changePage(meta.previous)}
          >
            Previous
          </button>
        )}
        {meta.next && (
          <button className="nextButton" onClick={() => changePage(meta.next)}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchResultPage;
