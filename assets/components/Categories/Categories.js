import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./categories.scss";

const categories = [
  { id: "yso:p4354", eventName: "Children", category: "groupSegment" },
  { id: "yso:p13050", eventName: "Families", category: "groupSegment" },
  { id: "yso:p6165", eventName: "Migrants", category: "groupSegment" },
  { id: "yso:p5590", eventName: "Adults", category: "groupSegment" },
  { id: "yso:p2433", eventName: "Elderly", category: "groupSegment" },
  { id: "yso:p2625", eventName: "Theatre", category: "arts" },
  { id: "yso:p2739", eventName: "Fine Arts", category: "arts" },
  { id: "yso:p1235", eventName: "Films", category: "arts" },
  { id: "yso:p11185", eventName: "Conserts", category: "arts" },
  { id: "yso:p1808", eventName: "Music", category: "arts" },
  { id: "yso:p14004", eventName: "Conversation", category: "seeAndDo" },
  { id: "yso:p360", eventName: "Culture", category: "seeAndDo" },
  { id: "yso:p5121", eventName: "Exhibitions", category: "seeAndDo" },
  { id: "yso:p3670", eventName: "Food", category: "seeAndDo" },
  { id: "yso:p1278", eventName: "Dance", category: "seeAndDo" },
  { id: "yso:p1947", eventName: "Well-beign", category: "activities" },
  { id: "yso:p916", eventName: "Exercise", category: "activities" },
  { id: "yso:p6062", eventName: "Games", category: "activies" },
  { id: "yso:p2771", eventName: "Outdoor", category: "activities" },
  { id: "yso:p965", eventName: "Sports", category: "activities" },
  { id: "yso:p16486", eventName: "Students", category: "workAndStudy" },
  { id: "yso:p15875", eventName: "Lectures", category: "workAndStudy" },
  { id: "yso:p19245", eventName: "Workshops", category: "workAndStudy" },
  { id: "yso:p26626", eventName: "Remote", category: "workAndStudy" },
];

const CategoryList = ({ category }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    axios
      .get(
        `https://api.hel.fi/linkedevents/v1/event/?sort=end_time&keyword=${e.target.dataset.id}&start=today`
      )
      .then((response) => {
        navigate(`/search/${e.target.textContent.replaceAll(" ", "_")}`, {
          state: { response: response.data },
        });
        window.location.reload();
      })
      .catch((err) => console.log(err));
  };

  return (
    <ul className="categoryItems">
      {category.map((item, i) => {
        return (
          <li data-id={item.id} onClick={(e) => handleClick(e)} key={i}>
            {item.eventName}
          </li>
        );
      })}
    </ul>
  );
};

export const Categories = ({ showCategory, showCategories }) => {
  const CategoryItem = ({ text, showCategory, children }) => {
    return (
      <li onClick={showCategory}>
        {text}
        <span className="arrow">&#8964;</span>
        {children}
      </li>
    );
  };

  return (
    <nav role="navigation" className="categories">
      <ul className="broadCategories">
        <CategoryItem
          text="Activities"
          showCategory={() => showCategory("activities")}
        >
          {showCategories.category === "activities" && (
            <CategoryList
              category={categories.filter(
                (category) => category.category === showCategories.category
              )}
            />
          )}
        </CategoryItem>
        <CategoryItem text="Arts" showCategory={() => showCategory("arts")}>
          {showCategories.category === "arts" && (
            <CategoryList
              category={categories.filter(
                (category) => category.category === showCategories.category
              )}
            />
          )}
        </CategoryItem>
        <CategoryItem
          text="Groups"
          showCategory={() => showCategory("groupSegment")}
        >
          {showCategories.category === "groupSegment" && (
            <CategoryList
              category={categories.filter(
                (category) => category.category === showCategories.category
              )}
            />
          )}
        </CategoryItem>
        <CategoryItem
          text="See & Do"
          showCategory={() => showCategory("seeAndDo")}
        >
          {showCategories.category === "seeAndDo" && (
            <CategoryList
              category={categories.filter(
                (category) => category.category === showCategories.category
              )}
            />
          )}
        </CategoryItem>
        <CategoryItem
          text="Work & Study"
          showCategory={() => showCategory("workAndStudy")}
        >
          {showCategories.category === "workAndStudy" && (
            <CategoryList
              category={categories.filter(
                (category) => category.category === showCategories.category
              )}
            />
          )}
        </CategoryItem>
      </ul>
    </nav>
  );
};
