/* eslint-disable react/no-unknown-property */
/* eslint-disable no-constant-condition */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import Header from "./includes/Header";
import Footer from "./includes/Footer";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch } from "react-redux";
// eslint-disable-next-line no-unused-vars
import { authActions } from "../redux/store";
import axiosInstance from "../axiosInstance";
import { useBlogContext } from "../fetchdata/BlogContext";
import maplayout from "../helper/MapStyle";
import LoginComponent from "./includes/LoginComponent";
import getCookie from "../helper/getCookie";
import getDecryptData from "../helper/getDecryptData";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation, Autoplay } from "swiper/modules";


const currentIcon = {
  url: "/img/dot.svg",
  scaledSize: { width: 40, height: 40 }, // Set the desired size here (width, height)
};

const dropIcon = {
  url: "/img/dotactive.svg",
  scaledSize: { width: 40, height: 40 }, // Set the desired size here (width, height)
};

const taxiIcon = {
  url: "/img/taxi.webp",
  scaledSize: { width: 30, height: 66 }, // Set the desired size here (width, height)
};

// eslint-disable-next-line react/prop-types
const Valet = ({ updateAuthStatus }) => {

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [selectedLocation, setSelectedLocation] = useState("");
  const [CurrentLocation, setCurrentLocation] = useState("");

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    console.log(lat1, lon1, lat2, lon2)
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return 'Distance: N/A';
    }

    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c; // Distance in km
    const distanceM = distanceKm * 1000; // Distance in meters

    if (distanceKm < 1) {
      return {
        m: distanceM.toFixed(0)
      };
    } else {
      return {
        // km: Math.round(distanceKm)
        km: distanceKm.toFixed(2)

      };
    }
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };


  useEffect(() => {
    const location = localStorage.getItem("selectedLocation");
    if (location) {
      setCurrentLocation(location);
    }
    const longitude = localStorage.getItem("longitude");
    if (longitude) {
      setLongitude(longitude);
    }
    const latitude = localStorage.getItem("latitude");
    if (latitude) {
      setLatitude(latitude);
    }

  }, []);

  const swiperRefLocal = useRef();

  const handleMouseEnter = () => {
    swiperRefLocal?.current?.swiper?.autoplay?.stop();
  };

  const handleMouseLeave = () => {
    swiperRefLocal?.current?.swiper?.autoplay?.start();
  };

  const decryptdatajson = getDecryptData();

  const [AppSettings, setAppSettings] = useState([]);

  const [FinalDriveKM, setFinalDriveKM] = useState(0); // Default to 7 days

  const [numDays, setNumDays] = useState(7); // Default to 7 days
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [timeOptions, setTimeOptions] = useState([]);
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("7:00 PM");
  const [TimeGap, setTimeGap] = useState(1);

  const formatDate = (date) => {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  const { sendMessage, sendRideReq, Headers, isHeader } = useBlogContext();

  useEffect(() => {
    setCurrentDate(new Date());
    console.log("Headers", Headers);
  }, []);

  useEffect(() => {
    const generateTimeOptions = () => {
      const currentTime = new Date();

      if (currentTime.getHours() < startTime.split(":")[0]) {
        currentTime.setHours(startTime.split(":")[0], 0, 0);
      } else {
        // Set initial time to the current time
        currentTime.setHours(
          currentTime.getHours(),
          currentTime.getMinutes(),
          0,
          0
        );
      }

      if (selectedDate) {
        const currentlogdate = formatDate(currentDate).toString(); // Call the formatDate function and convert the result to a string
        if (currentlogdate !== selectedDate) {
          currentTime.setHours(startTime.split(":")[0], 0, 0);
          setSelectedTime(null);
        }
      }

      const endOfDay = new Date();
      endOfDay.setHours(19, 0, 0); // 7:00 PM

      const options = [];

      // Add current time if it's within the specified range
      if (
        currentTime >= formatTime(new Date(startTime)) &&
        currentTime <= formatTime(new Date(endTime))
      ) {
        options.push(formatTime(currentTime));
      }

      // Increment time by one hour and add options until the end time
      while (currentTime < endOfDay && formatTime(currentTime) < endTime) {
        currentTime.setHours(
          currentTime.getHours() + TimeGap,
          currentTime.getMinutes(),
          0,
          0
        );
        if (formatTime(currentTime) <= endTime) {
          options.push(formatTime(currentTime));
        }
      }

      setTimeOptions(options);
    };

    generateTimeOptions();
  }, [startTime, endTime, currentDate, selectedDate]); // Add startTime and endTime as dependencies

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };

  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [distance, setDistance] = useState(0); // State to hold the calculated distance
  const [getZoomLevel, setZoomLevel] = useState(15); // State to hold the calculated distance
  const [ConfirmLocation, setConfirmLocation] = useState(false);
  const [bookRide, setbookRide] = useState(false);
  const [Totaldistance, setTotalDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [TotalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const location = localStorage.getItem("selectedLocation");
    if (location) {
      setSelectedLocation("");
      setPickupLocation("");
    }
  }, []);

  const ChangeConfirm = () => {
    setConfirmLocation(false);
    console.log(ConfirmLocation);
  };

  const handlePickupChange = (e) => {
    const value = e.target.value;
    setPickupLocation(value);

    if (value.trim() !== "" && pickupLocation !== "") {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: value }, (predictions) => {
        if (predictions) {
          const suggestedPlaces = predictions.map((prediction) => prediction);
          setPickupSuggestions(suggestedPlaces);
          console.log(suggestedPlaces);
        }
      });
    } else {
      setPickupSuggestions([]);
    }
    setConfirmLocation(true);
  };

  const handleDropoffChange = (e) => {
    console.log();
    const value = e.target.value;
    setDropoffLocation(value);

    if (value.trim() !== "") {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: value }, (predictions) => {
        if (predictions) {
          const suggestedPlaces = predictions.map((prediction) => prediction);
          setDropoffSuggestions(suggestedPlaces);
        }
      });
    } else {
      setDropoffSuggestions([]);
    }
  };

  const handleSearchLocationClick = (result) => { };
  // Function to handle click on search result
  const handleSearchPickupClick = (result) => {
    // toast.success('Location Update');
    setPickupSuggestions([]);
    setSelectedLocation(result.description);
    setPickupLocation(result.description);
    // localStorage.setItem('selectedLocation', result.description);
  };

  // Function to handle click on search result
  const handleSearchDropClick = async (result) => {
    // toast.success('Location Update');
    setDropoffSuggestions([]);
    setDropoffLocation(result.description);
    // calculateDistanceBetweenLocations(result.description);
    //  initMap();
    // useEffect to trigger distance calculation when pickupLocation or dropoffLocation changes
  };

  useEffect(() => {
    // loadMapScript();
  }, [selectedLocation]);

  const clearPickup = () => {
    setConfirmLocation(false);
    setPickupLocation("");
  };

  const clearDrop = () => {
    setDropoffLocation("");
  };

  // Order Code start

  const [LoginOTPinputs, SetLoginOTPinputs] = useState({
    phone: "",
    Gtoken: "sddwdwdwdd",
  });

  const [promoCode, setPromoCode] = useState(""); // State to hold the entered promo code

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleForm = () => {
    setIsLoginForm((prevState) => !prevState); // Toggle between login and signup forms
  };

  const isLoginFromLocalStorage = getCookie("token") ? true : false;

  const [isLogin, setIsLogin] = useState(isLoginFromLocalStorage);

  const [isLoginForm, setIsLoginForm] = useState(true); // State to manage which form to display

  const [getStateName, setStateName] = useState("");
  const [getPrimaryName, setPrimaryName] = useState(false);
  const [getStateId, setStateId] = useState(false);

  const [GetEmailOTP, setEmailOTP] = useState(null); // Add loading state
  const [EmailVerify, setEmailVerify] = useState(false); // Add loading state

  // Set initial state using retrieved user information
  const [Orderinputs, setOrderInputs] = useState([]);

  const Ordercredentials = {
    email: Orderinputs.email,
    username: Orderinputs.username,
    phone: Orderinputs.phone,
    pincode: Orderinputs.pincode,
    mode: Orderinputs.mode,
    details: {
      username: Orderinputs.username,
      phone: Orderinputs.phone,
      state: getStateName,
      email: Orderinputs.email,
    },
    ValetTime: selectedTime,
    ValetDate: selectedDate,
    ValetLocation: pickupLocation,
    ValetAddress: Orderinputs.ValetAddress,
    ValetCount: Orderinputs.ValetCount,
  };

  useEffect(() => {
    if (Orderinputs.ValetCount) {
      const totalPrice = Number(Orderinputs.ValetCount) * 1000;
      setTotalPrice(totalPrice);
    }
  }, [Orderinputs.ValetCount]);

  //form handle
  const handleOrderSubmit = async (e) => {
    // toast.success("order done")

    if (!Orderinputs.username || !Orderinputs.phone || !Orderinputs.email) {
      if (!Orderinputs.state) {
        toast.error("Please Select State");
      } else {
        toast.error("Please Fill All Details");
      }
    } else {
      const userId = decryptdatajson._id;

      e.preventDefault();

      const updatedFormData = {
        ...Ordercredentials,
        userId: userId,
        totalAmount: TotalPrice,
        payment: 1,
        state: Orderinputs.state,
      };

      const handleFinalSubmit = async () => {
        try {
          setbookRide(true);

          const response = await axiosInstance.post(
            `/create-valet-order`,
            updatedFormData
          );

          const { success, order } = response.data;
          if (success) {
            const sendmsg = { userId: order.id, type: "ride" };
            sendMessage(sendmsg);
          }
          console.log(response);
          navigate("/success");
        } catch (error) {
          console.error("Error during Order:", error);
          // Handle network errors, API issues, etc.
          toast.error(error.response.data.message);
        } finally {
          setbookRide(false);
        }
      };

      if (!updatedFormData.mode) {
        toast.error("Please Choose Payment Mode");
      } else if (
        !updatedFormData.ValetAddress ||
        !updatedFormData.ValetAddress ||
        !updatedFormData.ValetDate ||
        !updatedFormData.ValetTime ||
        !updatedFormData.totalAmount ||
        !updatedFormData.userId ||
        !updatedFormData.email ||
        !updatedFormData.phone ||
        !updatedFormData.state ||
        !updatedFormData.ValetCount
      ) {
        toast.error("Please Choose All Fields");
      } else {
        handleFinalSubmit();
      }

      console.log("updatedFormData", updatedFormData);
    }
  };

  const [loading, setLoading] = useState(false); // Add loading state
  const [data, setData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/get-all-zones");
      console.log(response.data.Zones);
      setData(response.data.Zones);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [AdminvaletLoading, setAdminvaletLoading] = useState(false); // Add loading state
  const [AdminvaletData, setAdminvaletData] = useState([]); // Add loading state

  const fetchValetAdminData = async () => {

    setAdminvaletLoading(true);
    try {
      const response = await axiosInstance.get(`/user-admin-valet`);
      const { valet, success } = response.data;
      if (success) {
        setAdminvaletData(valet);
      }
      console.log('valetvalet', valet)
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setAdminvaletLoading(false);
    }

  }


  useEffect(() => {
    fetchData();
    fetchValetAdminData();
  }, []);

  //form handle
  const verifyemail = async () => {
    toast.success("OTP Send to your email address");
    try {
      const { data, success } = await axiosInstance.post(
        "/email-verify",
        Orderinputs
      );
      if (data) {
        setEmailOTP(data.OTP);
      }
    } catch (error) {
      console.error("Error during verifyemail:", error);
      toast.error("Error while Sending OTP");
    }
  };

  const CheckEmail = async () => {
    if (GetEmailOTP === null) {
      toast.error("OTP Not Verifed");
    } else if (Orderinputs.EmailOTP.toString() === GetEmailOTP.toString()) {
      toast.success("OTP Verifed");
      setEmailVerify(true);
    } else {
      toast.error("OTP Not Verifed");
    }
  };

  //handle input change
  const handleOrderChange = (e) => {
    setOrderInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    setIsLogin(isLoginFromLocalStorage);
  }, [isLoginFromLocalStorage, dispatch]);

  useEffect(() => {
    if (isLogin === true) {
      //form handle
      const fetchUserById = async () => {
        const id = decryptdatajson._id;

        const credentials = {
          id: id,
        };

        try {
          const { data } = await axiosInstance.post("/auth-user", credentials);
          const { success, token, existingUser, message } = data;

          if (success) {
            setOrderInputs((prevData) => ({
              ...prevData,
              username: existingUser.username || "",
              phone: existingUser.phone || "",
              email: existingUser.email || "",
              address: existingUser.address || "",
              pincode: existingUser.pincode || "",
              state: existingUser.state || "",
            }));

            if (existingUser && existingUser.verified === 1) {
              setEmailVerify(true);
            }
            setStateId(existingUser.state);
            console.log("Message from backend:", existingUser);
          }
        } catch (error) {
          console.error("Error during login:", error);
          // Handle network errors, API issues, etc.
          toast.error(error.response.data.message);
        }
      };
      fetchUserById();
    }
  }, [isLogin]);

  const handleSaveCurrentLocation = () => {
    const location = localStorage.getItem("selectedLocation");
    if (location) {
      setSelectedLocation(location);
      setPickupLocation(location);
      setPickupSuggestions([]);
    }
    setConfirmLocation(false);
  };

  useEffect(() => {
    if (updateAuthStatus === true) {
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.classList.add("d-none");
      }
      setIsLogin(true);
    }
    console.log("updateAuthStatus", updateAuthStatus);
  }, [updateAuthStatus]);

  useEffect(() => {
    const loadMapScript = () => {
      if (
        !document.querySelector(
          `script[src*="https://maps.googleapis.com/maps/api/js"]`
        )
      ) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDYsdaR0zrPsBDeuyCKFH_4PuCUyWcQ2mE&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        window.initMap = initMap;
        document.body.appendChild(script);
      } else {
        initMap();
      }
    };

    loadMapScript();

    return () => {
      window.initMap = null;
    };
  }, [selectedLocation]);

  // Function to initialize the map
  const initMap = () => {
    if (selectedLocation !== "" && ConfirmLocation) {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 0, lng: 0 }, // Default center
        zoom: 15, // Default zoom level
        disableDefaultUI: true, // Disable default UI controls
        styles: maplayout,
      });

      // Geocode selected location and display marker on the map
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: selectedLocation }, (results, status) => {
        if (status === "OK") {
          map.setCenter(results[0].geometry.location);
          new window.google.maps.Marker({
            map,
            position: results[0].geometry.location,
            icon: currentIcon, // Set the car image as marker icon
            scaledSize: new window.google.maps.Size(0, 0), // Set the size here (width, height)
          });
        } else {
          console.error(
            "Geocode was not successful for the following reason:",
            status
          );
        }
      });
    }
  };

  return (
    <>
      <header className="header header-fixed m-auto bg-light style-2">
        <div className="header-content">
          <div className="search-area">
            <Link className="back-btn border-0" to="/">
              <i className="ri-arrow-left-line" />
            </Link>
            <div className="mb-2 input-group input-group-icon input-rounded">
              <input
                type="text"
                id="pickupLocation"
                className="form-control dz-password"
                placeholder="Search your valet location..."
                value={pickupLocation}
                onChange={handlePickupChange}
                autoFocus
              />

              <span className="input-group-text show-pass py-0 px-2 cursor ">
                {pickupLocation !== "" ? (
                  <i
                    className="ri-close-circle-fill fs-2 fs-lg-3"
                    onClick={clearPickup}
                  />
                ) : (
                  <i
                    className="ri-search-line fs-3 fs-lg-5"
                    onClick={clearPickup}
                  />
                )}
              </span>
            </div>
          </div>
        </div>

        {pickupSuggestions.length !== 0 && pickupSuggestions && (
          <>
            <div className="recent-search-list header">
              <ul>
                {pickupSuggestions.map((suggestion, index) => (
                  <li
                    className="search-content cursor"
                    key={index}
                    onClick={() => handleSearchPickupClick(suggestion)}
                  >
                    <div className="left-content">
                      <i className="ri-map-pin-2-fill me-2"></i>
                      <div>
                        <p className="fw-bold mb-0">
                          {suggestion.structured_formatting.main_text}{" "}
                        </p>
                        <span>
                          {" "}
                          {suggestion.structured_formatting.secondary_text}{" "}
                        </span>
                      </div>
                    </div>
                    <div className="remove ">
                      <i className="feather icon-chevron-right" />
                    </div>
                  </li>
                ))}

                <li>
                  <div
                    className="left-content cursor text-success"
                    onClick={handleSaveCurrentLocation}
                  >
                    <i className="ri-crosshair-2-fill"></i>
                    <span> My Current Location </span>
                  </div>
                </li>
              </ul>
            </div>
          </>
        )}
      </header>

      {!isLogin && (
        <>
          <div className="modal fade" id="basicModal">
            <div className="bg-dark-shadow-fix "></div>
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Login Or Signup</h5>
                  <button className="btn-close" data-bs-dismiss="modal">
                    <i className="ri-close-large-line fw-bold text-dark"></i>
                  </button>
                </div>
                <div className="modal-body p-4 border-bottom ">
                  <LoginComponent updateAuth={updateAuthStatus} />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-sm bg-danger text-white"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <main className="page-content dz-gradient-shape space-top">
        <div className="container">
          <div className="location-tracking">
            <div className="formbody bg-white p-3">
              <div className="mt-2" />

              {ConfirmLocation && pickupLocation !== "" && (
                <div
                  id="map"
                  style={{ height: "50vh", maxHeight: "200px", width: "100%" }}
                  className={`mx-auto py-2 rounded-md bg-white d-flex align-items-center justify-content-center`}
                >
                  <p>Searching For Location...</p>
                </div>
              )}

              <div className="mb-4 mt-3 ">
                <label className="form-label" htmlFor="email">
                  Full Address (optional)
                </label>
                <div className="input-group  input-mini input-sm">
                  <textarea
                    className="form-control"
                    id="ValetAddress"
                    name="ValetAddress"
                    rows={2}
                    onChange={handleOrderChange}
                    value={Orderinputs.ValetAddress}
                  />
                </div>
              </div>

              {!isNaN(TotalPrice) && TotalPrice !== 0 && (
                <div
                  className="bg-success p-2 text-center text-white mb-3 w-100 position-sticky sticky-top rounded-sm col-12"
                  style={{ top: "15px" }}
                >
                  <h4 className="text-white fs-6 m-0 fw-light">
                    Estimated Price{" "}
                    <span className="fw-bold fs-5">₹{TotalPrice} </span>{" "}
                  </h4>
                </div>
              )}

              {/* {selectedDate && (
<p>You selected: {selectedDate}</p>
)}

{selectedTime && (
<p>You selected: {selectedTime}</p>
)} */}

              <div className="accordion dz-accordion mt-4" id="accordionTime">
                <div className="accordion-item">
                  <div
                    className="accordion-header acco-select"
                    id="headingOneTime"
                  >
                    <button
                      className="accordion-button "
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseOneTime"
                      aria-expanded="true"
                      aria-controls="collapseOneTime"
                    >
                      <span className="dz-icon">
                        <i className="fi fi-rr-rupees" />
                      </span>
                      <span className="acco-title">
                        Scheduled Valet <i className="ri-timer-line"></i>
                      </span>
                      <span className="checkmark" />
                    </button>
                  </div>
                  <div
                    id="collapseOneTime"
                    className="accordion-collapse collapse show"
                    aria-labelledby="headingOne"
                    data-bs-parent="#accordionTime"
                  >
                    <div className="accordion-body">
                      <div className="mt-3">
                        <ul id="dateList" className="customradio">
                          {[...Array(numDays).keys()].map((index) => {
                            const newDate = new Date(currentDate);
                            newDate.setDate(currentDate.getDate() + index);
                            const formattedDate = formatDate(newDate);
                            const daysOfWeek = [
                              "Sun",
                              "Mon",
                              "Tue",
                              "Wed",
                              "Thu",
                              "Fri",
                              "Sat",
                            ];
                            const dayOfWeek =
                              index === 0
                                ? "Today"
                                : daysOfWeek[newDate.getDay()];

                            return (
                              <li key={formattedDate}>
                                <input
                                  type="radio"
                                  name="selectedDate"
                                  value={formattedDate}
                                  id={formattedDate}
                                  onChange={handleDateChange}
                                />

                                <label htmlFor={formattedDate}>
                                  {dayOfWeek === "Today" ? (
                                    <span className="fs-6 py-2">
                                      {dayOfWeek}
                                    </span>
                                  ) : (
                                    <>
                                      {" "}
                                      {dayOfWeek}
                                      <span> {newDate.getDate()}</span>{" "}
                                    </>
                                  )}
                                </label>
                              </li>
                            );
                          })}
                        </ul>

                        <hr />
                        <b className="mb-2 d-block font-size-15">
                          Select start time of service
                        </b>

                        {"dayOfWeek" !== "Today" ? (
                          <ul id="timeList" className="customradio">
                            {timeOptions.map((time, index) => (
                              <li key={index}>
                                <input
                                  type="radio"
                                  name="selectedTime"
                                  value={time}
                                  id={`time${index}`}
                                  onChange={handleTimeChange}
                                  checked={time === selectedTime}
                                />
                                <label htmlFor={`time${index}`}>{time}</label>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul id="timeList2" className="customradio">
                            <li>
                              <input
                                type="radio"
                                name="selectedTime"
                                defaultValue="9:00 AM"
                                onChange={handleTimeChange}
                              />
                              <label>9:00 AM</label>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="selectedTime"
                                defaultValue="10:00 AM"
                                onChange={handleTimeChange}
                              />
                              <label>10:00 AM</label>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="selectedTime"
                                defaultValue="11:00 AM"
                                onChange={handleTimeChange}
                              />
                              <label>11:00 AM</label>
                            </li>
                            {/* Add more hours as needed */}
                            <li>
                              <input
                                type="radio"
                                name="selectedTime"
                                defaultValue="12:00 PM"
                                onChange={handleTimeChange}
                              />
                              <label>12:00 PM</label>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="selectedTime"
                                defaultValue="1:00 PM"
                                onChange={handleTimeChange}
                              />
                              <label>1:00 PM</label>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="selectedTime"
                                defaultValue="2:00 PM"
                                onChange={handleTimeChange}
                              />
                              <label>2:00 PM</label>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="selectedTime"
                                defaultValue="3:00 PM"
                                onChange={handleTimeChange}
                              />
                              <label>3:00 PM</label>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="selectedTime"
                                defaultValue="4:00 PM"
                                onChange={handleTimeChange}
                              />
                              <label>4:00 PM</label>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="selectedTime"
                                defaultValue="5:00 PM"
                                onChange={handleTimeChange}
                              />
                              <label>5:00 PM</label>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="selectedTime"
                                defaultValue="6:00 PM"
                                onChange={handleTimeChange}
                              />
                              <label>6:00 PM</label>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="selectedTime"
                                defaultValue="7:00 PM"
                                onChange={handleTimeChange}
                              />
                              <label>7:00 PM</label>
                            </li>
                            <li>
                              <input
                                type="radio"
                                name="selectedTime"
                                defaultValue="8:00 PM"
                                onChange={handleTimeChange}
                              />
                              <label>8:00 PM</label>
                            </li>
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <p className="fs-5 fw-bold"> Valet for how many people? </p>
                <ul id="RideType" className="customradio">
                  <li>
                    <input
                      type="radio"
                      name="ValetCount"
                      onChange={handleOrderChange}
                      value="1"
                    />
                    <label>1-100</label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      name="ValetCount"
                      onChange={handleOrderChange}
                      value="2"
                    />
                    <label>200-300</label>
                  </li>

                  <li>
                    <input
                      type="radio"
                      name="ValetCount"
                      onChange={handleOrderChange}
                      value="3"
                    />
                    <label>300-400</label>
                  </li>

                  <li>
                    <input
                      type="radio"
                      name="ValetCount"
                      onChange={handleOrderChange}
                      value="4"
                    />
                    <label>400-500</label>
                  </li>
                </ul>
              </div>

              <div className="mt-3">
                <p className="fs-5 fw-bold"> Allotted number of drivers </p>
                <ul id="RideType" className="customradio">
                  <li>
                    <input
                      type="radio"
                      checked={
                        Orderinputs.ValetCount === "1" ||
                        Orderinputs.ValetCount === 1
                      }
                    />
                    <label>5</label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      checked={
                        Orderinputs.ValetCount === "2" ||
                        Orderinputs.ValetCount === 2
                      }
                    />
                    <label>10</label>
                  </li>

                  <li>
                    <input
                      type="radio"
                      checked={
                        Orderinputs.ValetCount === "3" ||
                        Orderinputs.ValetCount === 3
                      }
                    />
                    <label>20</label>
                  </li>

                  <li>
                    <input
                      type="radio"
                      checked={
                        Orderinputs.ValetCount === "4" ||
                        Orderinputs.ValetCount === 4
                      }
                    />
                    <label>40</label>
                  </li>
                </ul>
              </div>

              {isLogin ? (
                <>
                  <hr />
                  <h4 className="CapiTaliZed ">
                    Welcome Back {Orderinputs?.username}
                  </h4>

                  {Orderinputs.phone ? (
                    <>
                      <div className="row bg-light pt-3 rounded-sm">
                        <div className="col-md-12">
                          <div className="mb-4">
                            <label className="form-label" htmlFor="username">
                              Full Name
                            </label>
                            <input
                              className="form-control form-control-sm"
                              type="text"
                              id="username"
                              name="username"
                              value={Orderinputs.username}
                              onChange={handleOrderChange}
                            />
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="mb-4">
                            <label className="form-label" htmlFor="phone">
                              Phone No.
                            </label>
                            <input
                              className="form-control form-control-sm"
                              type="number"
                              id="phone"
                              name="phone"
                              value={Orderinputs.phone}
                              onChange={handleOrderChange}
                            />
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="mb-4">
                            <label className="form-label" htmlFor="Email">
                              Email
                            </label>
                            <div className="input-group">
                              <input
                                className="form-control form-control-sm"
                                type="email"
                                id="Email"
                                name="email"
                                value={Orderinputs.email}
                                onChange={handleOrderChange}
                              />
                              {!EmailVerify && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={verifyemail}
                                  type="button"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={15}
                                    height={15}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <circle cx={12} cy={12} r={10} />
                                    <line x1={12} y1={8} x2={12} y2={12} />
                                    <line x1={12} y1={16} x2="12.01" y2={16} />
                                  </svg>
                                  <span className="ms-1"> Verify </span>
                                </button>
                              )}
                            </div>
                          </div>
                          {!EmailVerify && GetEmailOTP && (
                            <>
                              <div className="bg-light p-2 mb-2 rounded">
                                <label> OTP Send to your email address </label>

                                <div className="input-group my-3">
                                  <input
                                    type="number"
                                    className="form-control form-control-sm "
                                    placeholder="Enter OTP"
                                    name="EmailOTP"
                                    value={Orderinputs.EmailOTP}
                                    onChange={handleOrderChange}
                                    onKeyPress={(e) => {
                                      if (e.target.value.length === 4)
                                        e.preventDefault();
                                    }}
                                  />
                                  <button
                                    className="btn btn-success btn-sm"
                                    type="button"
                                    onClick={CheckEmail}
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="col-md-12">
                          <div className="mb-4">
                            <label className="form-label" htmlFor="state">
                              State
                              {/* {getStateName} */}
                            </label>
                            <select
                              className="form-select form-control-xl w-100 border"
                              id="state"
                              style={{ height: 45 }}
                              name="state"
                              value={Orderinputs.state}
                              onChange={(e) => {
                                handleOrderChange(e);
                                setStateName(
                                  e.target.options[
                                    e.target.selectedIndex
                                  ].getAttribute("name")
                                );
                                setPrimaryName(
                                  e.target.options[
                                    e.target.selectedIndex
                                  ].getAttribute("primary")
                                );
                              }}
                            >
                              <option selected>
                                {" "}
                                {loading ? "Loading..." : "Select State"}
                              </option>
                              {data.map((item) => (
                                <option
                                  key={item.id}
                                  value={item._id}
                                  name={item.name}
                                  primary={item.primary}
                                >
                                  {item.name}
                                </option>
                              ))}
                              ;
                            </select>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div id="wrapper">
                        <div class="profile-main-loader">
                          <div class="loader">
                            <svg class="circular-loader" viewBox="25 25 50 50">
                              <circle
                                class="loader-path"
                                cx="50"
                                cy="50"
                                r="20"
                                fill="none"
                                stroke="#70c542"
                                stroke-width="2"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <></>
              )}

              <br />

              {!isLogin ? (
                <button
                  type="button"
                  className="btn w-100 btn-primary mb-2"
                  data-bs-toggle="modal"
                  data-bs-target="#basicModal"
                >
                  Continue
                </button>
              ) : (
                <>
                  <p className="fs-5 fw-bold"> Choose payment Method </p>

                  <div
                    className="accordion dz-accordion mt-2"
                    id="accordionExample"
                  >
                    <div className="accordion-item">
                      <div
                        className="accordion-header acco-select"
                        id="headingOne"
                      >
                        <label
                          for="cash"
                          className={`cursor accordion-button ${Orderinputs.mode === "Cash" ? "" : "collapsed"
                            } `}
                        >
                          <span className="dz-icon">
                            <i className="fi fi-rr-rupees" />
                          </span>
                          <div className="acco-title">
                            Cash on Delivery(Cash/UPI)
                          </div>
                          <input
                            value="Cash"
                            id="cash"
                            name="mode"
                            type="radio"
                            onChange={handleOrderChange}
                            className="d-none"
                          />
                          <span className="checkmark" />
                        </label>
                      </div>
                      <div
                        id="collapseOne"
                        className={`accordion-collapse collapse ${Orderinputs.mode === "Cash" && "show"
                          }`}
                      >
                        <div className="accordion-body">
                          Carry on your cash payment..
                          <br />
                          Thanx!
                          <button
                            onClick={handleOrderSubmit}
                            className="btn btn-primary rounded-xl btn-thin w-100 mt-3"
                            type="button"
                            to="/ride"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <div
                        className="accordion-header acco-select"
                        id="headingOne"
                      >
                        <label
                          for="Online"
                          className={`cursor accordion-button ${Orderinputs.mode === "Online" ? "" : "collapsed"
                            } `}
                        >
                          <span className="dz-icon">
                            <i className="fi fi-rr-rupees" />
                          </span>
                          <div className="acco-title">
                            Online Payment (Cash/UPI)
                          </div>
                          <input
                            value="Online"
                            id="Online"
                            name="mode"
                            type="radio"
                            onChange={handleOrderChange}
                            className="d-none"
                          />
                          <span className="checkmark" />
                        </label>
                      </div>
                      <div
                        id="collapseOne"
                        className={`accordion-collapse collapse ${Orderinputs.mode === "Online" && "show"
                          }`}
                      >
                        <div className="accordion-body">
                          Online Payment ....
                          <br />
                          Thanx!
                          <button
                            onClick={handleOrderSubmit}
                            className="btn btn-primary rounded-xl btn-thin w-100 mt-3"
                            type="button"
                            to="/ride"
                          >
                            Pay Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}


              <hr className="mt-4" />

              <div className="row">
                <div className="col-md-8 col-9">
                  <h4 className="CapiTaliZed h5">
                    <i class="ri-parking-box-line text-success fw-medium me-2 h3" />
                    Valet parkings Near You
                    <p className="overflowOne fw-light ">
                      Near  {CurrentLocation && CurrentLocation !== '' && CurrentLocation}</p></h4>

                </div>
                <div className="col-md-4 col-3 text-end">
                  <br />
                  <Link to="/" className="fw-bold text-primary">View All <i className="ri-arrow-right-s-line"></i>
                  </Link>
                </div>
              </div>

              <div className="row">
                {AdminvaletData && AdminvaletData.length !== 0 &&
                  AdminvaletData.map((valet, index) => {
                    // Calculate distance
                    const distance = calculateDistance(
                      parseFloat(latitude),
                      parseFloat(longitude),
                      parseFloat(valet.latitude),
                      parseFloat(valet.longitude)
                    );

                    // Determine how to display the distance
                    let distanceDisplay = '';
                    if (distance.km !== 'Distance: N/A') {
                      if (distance.km === undefined) {
                        distanceDisplay = `${distance.m} M`;
                      } else {
                        distanceDisplay = `${distance.km} KM`;
                      }
                    }

                    return (
                      <div key={index} className="card col-6 p-0 overflow-hidden" style={{ transform: "scale(0.95)" }}>
                        {valet.ValetImage &&
                          <Swiper
                            pagination={{ clickable: true }}
                            navigation
                            loop
                            modules={[Pagination, Navigation, Autoplay]}
                            className="swiper-wrapper"
                            ref={swiperRefLocal}
                          >
                            {valet.ValetImage.map((image, imageIndex) => (
                              <SwiperSlide key={imageIndex}>
                                <img
                                  className="img-fluid w-100"
                                  src={image}
                                  alt="Product"
                                  style={{ width: "100%", aspectRatio: "2/1.2", objectFit: "cover" }}
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        }

                        <div className="card-body">
                          <h5 className="card-title overflowOne">{valet?.ValetName}</h5>
                          <p className="overflowOne mb-0">
                            <i class="ri-direction-fill me-2 h5 text-primary"></i> <b className="fw-bold"> {distanceDisplay} </b> from   {CurrentLocation && CurrentLocation !== '' && CurrentLocation}
                          </p>
                        </div>

                        <Link to={`/valet-view/${valet._id}`} className="btn btn-primary rounded-0 opacity- text-white">
                          View Location <i className="ri-arrow-right-s-line fw-light ms-2"></i>
                        </Link>

                        {/* Display distance */}

                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </main >

      {/* {ConfirmLocation && (<>
<div className='bg-dark-shadow-fix desk-none'>
</div>
</>
)} */}

      {
        bookRide && (
          <>
            <div className="loading-box text-center d-flex flex-column">
              <i
                className="ri-loader-2-line spin"
                style={{ fontSize: 80, color: "white" }}
              />
              <h4 className="text-white"> Please wait ....</h4>
            </div>
          </>
        )
      }

      <Footer />
    </>
  );
};

export default Valet;
