import React, {
  //useState,
  useEffect,
  useCallback,
  useReducer,
  useMemo,
} from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import useHttp from "../../hooks/http";



// NB: ingredientReducer function is decleared outside the function
const ingredientReducer = (currentIngredients, action) => {
  //using switch() to define different cases of action
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error("Should not get there!");
  }
};

function Ingredients() {
  // useReducer() can be used in-place of the useState() used below
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  /*
  const [userIngredients, setUserIngredients] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState();
  */

  // using object distructuring the imported useHttp() in order to have access to its values
  const { 
    isLoading, 
    data, 
    error, 
    sendRequest, 
    reqExtra, 
    reqIdentifer, 
    clear 
  } = useHttp();

  // Fetching/getting data from back end server
  /* This is commented out since we are also fetching data in the Search.js file
  useEffect(() => {
    fetch(
      "https://react-hook-ingredients-39fd9-default-rtdb.firebaseio.com/ingredients.json")
      .then((response) => {
        response.json()
      }).then((responseData) => {
        const loadedIngredients = [];
        for (const key in responseData) {
          loadedIngredients.push({
            id: key,
            title: responseData[key].title,
            amount: responseData[key].amount
          });
        };
        props.onLoadIngredients(loadedIngredients);
      });
  }, []);
  */

  // useCallback() used below hinders the function from getting reloaded
  const filteredIngredientsHandler = useCallback((filterdIngredients) => {
    // setUserIngredients(filterdIngredients);
    dispatch({ type: "SET", ingredients: filterdIngredients });
  }, []);

  useEffect(() => {
    if (!isLoading && error && reqIdentifer === "REMOVE_INGREDIENT") {
      dispatch({ type: "DELETE", id: reqExtra });
    } else if (!isLoading && !error && reqIdentifer === "ADD_INGREDIENT") {
      dispatch({
        type: "ADD",
        ingredient: { id: data.name, ...reqExtra },
      });
    }
  }, [data, reqExtra, reqIdentifer, isLoading, error]);

  const addIngredientHandler = useCallback(
    (ingredient) => {
      sendRequest(
        "https://react-hook-ingredients-39fd9-default-rtdb.firebaseio.com/ingredients.json",
        "POST",
        JSON.stringify(ingredient),
        ingredient,
        "ADD_INGREDIENT"
      );
      // /* Sending data to the backend server
      //  backend server used is firebase: https://console.firebase.google.com/u/0/
      //  and  https://firebase.google.com/docs/reference for document reference
      // */
      // dispatchHttp({ type: "SEND" });
      // //setIsLoading(true); // same as the above when using useState() instead of useReducer()
      // fetch(
      //   "https://react-hook-ingredients-39fd9-default-rtdb.firebaseio.com/ingredients.json",
      //   {
      //     method: "POST",
      //     body: JSON.stringify(ingredient),
      //     headers: { "Content-Type": "application/json" },
      //   }
      // )
      //   .then((response) => {
      //     dispatchHttp({ type: "RESPONSE" });
      //     //setIsLoading(false);
      //     // Extracting the body/data and converting from json to normal Javascript code
      //     return response.json();
      //   })
      //   .then((responseData) => {
      //     /*setUserIngredients((prevIngredients) => [
      //       ...prevIngredients,
      //       { id: responseData.name, ...ingredient },
      //     ]);*/
      //     dispatch({ type: "ADD", id: responseData.name, ...ingredient });
      //   });
    },
    [sendRequest]
  );

  const removeIngredientHandler = useCallback(
    (ingredientId) => {
      //setIsLoading(true);
      sendRequest(
        `https://react-hook-ingredients-39fd9-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
        "DELETE",
        null,
        ingredientId,
        "REMOVE_INGREDIENT"
      );
    },
    [sendRequest]
  );

  const clearError = useCallback(() => {
    clear();
    //dispatchHttp({ type: "CLEAR" });
    //setError(null);
  }, [clear]);

  const ingredientLIst = useMemo(() => {
    return (
      <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler}
        //loading={isLoading}
      />
    );
  }, [userIngredients, removeIngredientHandler]);

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientLIst}
      </section>
    </div>
  );
}
export default Ingredients;
