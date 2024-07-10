// BlogContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import axiosInstance, { weburl } from "../axiosInstance";
import io from "socket.io-client";
const socket = io(weburl);
import messageAlertSound from "../assets/audio/message.mp3"; // Import the sound file
import getDecryptData from "../helper/getDecryptData";
import onlineAudio from "../assets/audio/online.mp3";
import getCookie from "../helper/getCookie";

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [blogs, setBlogs] = useState([]);

  const [AllProducts, setAllProducts] = useState([]);
  const [AllCategoriess, setAllCategoriess] = useState([]);

  const clearAllItemsInCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  const [isLoading, setIsLoading] = useState(true);

  const [Headers, setHeaders] = useState([]);

  const [isHeader, setIsHeader] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  const [promoCodeInfo, setPromoCodeInfo] = useState([]); // State to hold promo code information

  const [promoCode, setPromoCode] = useState(""); // State variable for promo code
  const [discount, setDiscount] = useState(0); // State variable for discount amount

  const [mypromoCode, setmyPromoCode] = useState(""); // State variable for promo code

  const [totalAmount, setTotalAmount] = useState(""); // Initialize with null
  const [PromoLoading, setPromoLoading] = useState(false); // Initialize with null

  const applyPromoCode = async (promoCode) => {
    setPromoLoading(true);
    try {
      // Make an API call to validate the promo code
      const response = await axiosInstance.post("/apply-promo", { promoCode });

      const { discount } = response.data; // Extract discount directly from response.data
      console.log("response.data", response.data);

      // Assuming success since a discount value is returned
      // Promo code is valid, apply discount
      setPromoCode(promoCode);
      setmyPromoCode(promoCode);
      setDiscount(discount);
      setPromoCodeInfo((prevState) => ({
        ...prevState, // Copy existing state
        ...response.data, // Merge with new data from response
      }));
      getTotalAmount(response.data);
      toast.success("Promo code applied successfully");

      console.log("Promo code applied successfully");
      console.log("promoCodeInfo", promoCodeInfo); // Log promoCodeInfo here
    } catch (error) {
      toast.error("Error applying promo code");

      // Handle errors
      console.error("Error applying promo code:", error);
    } finally {
      setPromoLoading(false);
    }
  };

  const base64Encode = (data) => {
    return btoa(JSON.stringify(data));
  };

  const base64Decode = (encodedData) => {
    return JSON.parse(atob(encodedData));
  };

  const getHeader = async () => {
    try {
      const { data } = await axiosInstance.get(`/home-data`);
      setHeaders(data.homeData);
      console.log("data", data.homeData);

      setIsHeader(false);
    } catch (error) {
      console.log(error);
      setIsHeader(false);
    }
  };

  const [NotificationCount, setNotificationCount] = useState(0);
  const [walletAmount, setwalletAmount] = useState(0);
  const [UserProfile, setUserProfile] = useState("");

  const getUserData = async () => {
    const decryptdatajson = await getDecryptData();
    const id = decryptdatajson?._id;

    const credentials = {
      id: id,
    };
    const authuser = getCookie("token");
    if (!authuser) {
      return;
    }

    try {
      const { data } = await axiosInstance.post("/auth-user", credentials);

      const { success, existingUser } = data;
      if (success) {
        setNotificationCount(existingUser.notifications);
        setwalletAmount(existingUser.wallet);
        setUserProfile(existingUser.profile);
        console.log("wallet start ");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addItemToCart = (item) => {
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex !== -1) {
      // Item already exists in cart, update its quantity
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += 1;
      setCartItems(updatedCartItems);
      localStorage.setItem("cartItems", base64Encode(updatedCartItems));
    } else {
      // Item doesn't exist in cart, add it with quantity 1
      const itemWithQuantity = { ...item, quantity: 1 };
      const newCartItems = [...cartItems, itemWithQuantity];
      setCartItems(newCartItems);
      localStorage.setItem("cartItems", base64Encode(newCartItems));
    }
  };

  const removeItemFromCart = (itemId) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCartItems);
    localStorage.setItem("cartItems", base64Encode(updatedCartItems));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  const updateItemQuantity = (itemId, quantity) => {
    const updatedCartItems = cartItems.map((item) => {
      if (item.id === itemId) {
        // Ensure quantity doesn't go below 1
        const newQuantity = Math.max(quantity, 1);
        getTotalAmount(promoCodeInfo);
        return { ...item, quantity: newQuantity };
      }
      getTotalAmount(promoCodeInfo);
      return item;
    });
    setCartItems(updatedCartItems);
    localStorage.setItem("cartItems", base64Encode(updatedCartItems));
  };

  const getTotalUniqueItems = () => {
    const uniqueItems = new Set(cartItems.map((item) => item.id));
    return uniqueItems.size;
  };

  const getTotalAmount = (promoCodeInfo) => {
    const total = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    let discountedAmount = total;

    if (promoCodeInfo) {
      if (String(promoCodeInfo.type) === "percentage") {
        discountedAmount = Math.round(
          total * ((promoCodeInfo.discount * 100) / 100)
        );
        discountedAmount = total - discountedAmount;
      } else if (String(promoCodeInfo.type) === "fixed") {
        discountedAmount = total - promoCodeInfo.discount;
        if (discountedAmount < 0) {
          discountedAmount = 0;
        }
      }
    }

    setTotalAmount(discountedAmount);
    console.log("total", total);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  useEffect(() => {
    const storedCartItems = localStorage.getItem("cartItems");

    if (storedCartItems) {
      setCartItems(base64Decode(storedCartItems));
    } else {
      setCartItems([]);
    }
  }, []);

  const removePromoCode = () => {
    setPromoCode("");
    setDiscount(0);
    setPromoCodeInfo(null);
  };

  const getUserAllPro = async () => {
    try {
      const response = await axiosInstance.get(`/all-products/`);

      setAllProducts(response.data.products);
      console.log("setAllProducts", response.data.products);
    } catch (error) {
      console.error("Error fetching user products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserAllCat = async () => {
    try {
      const response = await axiosInstance.get(`/all-category/`);

      setAllCategoriess(response.data.categories);
    } catch (error) {
      console.error("Error fetching user category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize state from local storage or default to true
  const [showOffline, setShowOffline] = useState(() => {
    const storedShowOffline = localStorage.getItem("showOffline");
    return storedShowOffline ? JSON.parse(storedShowOffline) : true;
  });

  // Function to toggle showOffline state
  const toggleOffline = () => {
    const updatedShowOffline = !showOffline;
    // Update state
    setShowOffline(updatedShowOffline);
    // Update local storage
    localStorage.setItem("showOffline", JSON.stringify(updatedShowOffline));
    if (showOffline) {
      const sound = new Audio(onlineAudio);
      sound.play();
    }
  };

  const getUserBlogs = async () => {
    // try {
    //     const userId = localStorage.getItem('userId');
    //     const response = await axiosInstance.get(`http://localhost:8000/user-blogs/${userId}`);
    //     const { success, userBlog, message } = response.data;
    //     if (success) {
    //         setUserBlogs(userBlog.blogs);
    //     } else {
    //     }
    // } catch (error) {
    //     console.error('Error fetching user blogs:', error);
    // } finally {
    //     setIsLoading(false);
    // }
  };

  // const [audio] = useState(new Audio(messageAlertSound)); // Create an Audio object with the sound file
  const [notification, setNotification] = useState([]);
  const [AllMessages, setAllMessages] = useState([]);
  const [AllRideReq, setRideReq] = useState([]);

  const [AllValetReq, setValetReq] = useState([]);

  useEffect(() => {
    const decryptdatajson = getDecryptData();
    const userId = decryptdatajson?._id;

    socket.on("chat message", (message) => {
      console.log("messagemessagemessagemessage", message);
      if (message.type === "message") {
        console.log("get message");
        // Add date and time to the message object before updating state
        const messageWithDateTime = {
          ...message,
          time: formatTimestamp(new Date()),
        };

        setAllMessages((prevMessages) => {
          const newMessages = [...prevMessages, messageWithDateTime];
          return newMessages;
        });
        // if (message.userId !== userId) {
        //     playMessageAlert(); // Play sound alert if the message sender is the current user

        //    }
      }
      if (message.type === "notification") {
        setNotification((prevMessages) => {
          const newMessages = [...prevMessages];
          return newMessages;
        });
      }
      if (message.type === "ride") {
        // Add date and time to the message object before updating state
        const messageWithDateTime = { ...message };
        setRideReq((prevMessages) => {
          const newMessages = [...prevMessages, messageWithDateTime];
          return newMessages;
        });
      }
      if (message.type === "valet") {
        // Add date and time to the message object before updating state
        const messageWithDateTime = { ...message };
        setValetReq((prevMessages) => {
          const newMessages = [...prevMessages, messageWithDateTime];
          return newMessages;
        });
      }
    });

    return () => {
      socket.off("chat message");
    };
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      month: "long", // Use 'long' to display the full month name
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  };

  const playMessageAlert = () => {
    const sound = new Audio(messageAlertSound);
    sound.play();
  };

  const removeNotification = () => {
    setNotification([]);
  };

  const removeRide = () => {
    setRideReq([]);
  };

  const removeNotificationcount = () => {
    setNotificationCount(0);
  };

  const sendMessage = (message) => {
    socket.emit("chat message", message);
  };

  const sendNotification = (notification) => {
    socket.emit("notification message", notification);
  };

  const sendRideReq = (ridereq) => {
    console.log("ridereq", ridereq);
    socket.emit("ride notification", ridereq);
  };

  useEffect(() => {
    getUserAllPro();
    getUserAllCat();
    getUserBlogs();
    getHeader();
    getTotalAmount();
    getUserData();
  }, []);

  return (
    <BlogContext.Provider
      value={{
        NotificationCount,
        removeNotificationcount,
        isLoading,
        Headers,
        isHeader,
        cartItems,
        getTotalUniqueItems,
        addItemToCart,
        removeItemFromCart,
        clearCart,
        updateItemQuantity,
        getTotalAmount,
        AllCategoriess,
        getTotalItems,
        applyPromoCode,
        AllProducts,
        clearAllItemsInCart,
        promoCodeInfo,
        removePromoCode,
        showOffline,
        toggleOffline,
        mypromoCode,
        walletAmount,
        getUserData,
        totalAmount,
        notification,
        removeNotification,
        sendMessage,
        AllMessages,
        sendRideReq,
        sendNotification,
        AllRideReq,
        playMessageAlert,
        removeRide,
        UserProfile,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlogContext = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("useBlogContext must be used within a BlogProvider");
  }
  return context;
};
