import React, { useState, useEffect, useRef } from "react";

import Card from "../UI/Card";
import "./Search.css";
import useHttp from "../../hooks/http";
import ErrorModal from "../UI/ErrorModal";

const Search = React.memo((props) => {
  const [enteredFilter, setEnteredFilter] = useState("");
  const inputRef = useRef();
  const { isloading, data, error, sendRequest, clear } = useHttp();

  //Object Distructuring(which is similar to array distructuring)
  const { onLoadIngredients } = props;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (enteredFilter === inputRef.current.value) {
        const query =
          enteredFilter.length === 0
            ? ""
            : `?orderBy="title"&equalTo="${enteredFilter}"`;
        sendRequest(
          "https://react-hook-ingredients-39fd9-default-rtdb.firebaseio.com/ingredients.json" + query,
          "GET"
        );
      }
    }, 500);
    //The returned function clears the timer before the useEffect() function runs again
    return () => {
      clearTimeout(timer);
    };
  }, [enteredFilter, sendRequest, inputRef]);

  useEffect(() => {
    if (!isloading && !error && data) {
      const loadedIngredients = [];
      for (const key in data) {
        loadedIngredients.push({
          id: key,
          title: data[key].title,
          amount: data[key].amount,
        });
      }
      onLoadIngredients(loadedIngredients);
    }
  }, [data, error, isloading, onLoadIngredients]);

  const enteredSearchHandler = (event) => {
    setEnteredFilter(event.target.value);
  };

  return (
    <section className="search">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          {isloading && <span>Loading...</span>}
          <input
            type="text"
            value={enteredFilter}
            ref={inputRef}
            onChange={enteredSearchHandler}
          />
        </div>
      </Card>
    </section>
  );
});

export default Search;
