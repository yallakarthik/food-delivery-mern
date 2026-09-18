import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});

  const url = import.meta.env.VITE_API_URL;

  const [token, setToken] = useState("");

  const [food_list, setFoodList] = useState([]);

  // ADD ITEM TO CART
  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({
        ...prev,
        [itemId]: 1,
      }));
    } else {
      setCartItems((prev) => ({
        ...prev,
        [itemId]: prev[itemId] + 1,
      }));
    }

    if (token) {
      const response = await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Item Added to Cart");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  // REMOVE ITEM FROM CART
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const newCart = { ...prev };

      if (newCart[itemId] > 1) {
        newCart[itemId] = newCart[itemId] - 1;
      } else {
        delete newCart[itemId];
      }

      return newCart;
    });

    if (token) {
      const response = await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Item Removed from Cart");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  // CALCULATE TOTAL CART AMOUNT
  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find(
          (product) => product._id === item
        );

        // Prevent error if product is not found
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }

    return totalAmount;
  };

  // FETCH FOOD LIST
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");

      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        alert("Error! Products are not fetching.");
      }
    } catch (error) {
      console.log("Error fetching food list:", error);
    }
  };

  // LOAD CART DATA
  const loadCartData = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      } else {
        setCartItems({});
      }
    } catch (error) {
      console.log("Error loading cart:", error);
      setCartItems({});
    }
  };

  // LOAD DATA WHEN APP STARTS
  useEffect(() => {
    async function loadData() {
      await fetchFoodList();

      const savedToken = localStorage.getItem("token");

      if (savedToken) {
        setToken(savedToken);
        await loadCartData(savedToken);
      }
    }

    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;