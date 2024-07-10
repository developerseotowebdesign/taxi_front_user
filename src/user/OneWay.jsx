import { useEffect, useState } from "react";
import Footer from "./includes/Footer";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import axiosInstance from "../axiosInstance";
import { useBlogContext } from "../fetchdata/BlogContext";
import maplayout from "../helper/MapStyle";
import LoginComponent from "./includes/LoginComponent";
import getCookie from "../helper/getCookie";
import getDecryptData from "../helper/getDecryptData";
import PropTypes from "prop-types"; // Import PropTypes

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

const OneWay = ({ updateAuthStatus }) => {
  const decryptdatajson = getDecryptData();

  const [AppSettings, setAppSettings] = useState([]);

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

  const [selectedLocation, setSelectedLocation] = useState("");
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

  let myzoom = 15;
  useEffect(() => {
    const location = localStorage.getItem("selectedLocation");
    if (location) {
      setSelectedLocation(location);
      setPickupLocation(location);
    }
  }, []);

  // Function to initialize the map
  const initMap = (myzoom) => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 0, lng: 0 }, // Default center
      zoom: myzoom ? myzoom : 15, // Default zoom level
      disableDefaultUI: true, // Disable default UI controls
      styles: maplayout,
    });

    if (selectedLocation !== "" && dropoffLocation !== "") {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        polylineOptions: {
          strokeColor: "#0D1722", // Blue color
        },
        suppressMarkers: true, // Suppress default markers
      });

      const request = {
        origin: selectedLocation,
        destination: dropoffLocation,
        travelMode: "DRIVING",
      };

      directionsService.route(request, (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);

          // Custom markers for start and end
          const startMarker = new window.google.maps.Marker({
            position: result.routes[0].legs[0].start_location,

            map,
            icon: currentIcon,
          });

          const endMarker = new window.google.maps.Marker({
            position:
              result.routes[0].legs[result.routes[0].legs.length - 1]
                .end_location,
            map,
            // label: 'E', // Custom label for end marker
            icon: dropIcon,
          });

          // Calculate total distance
          let totalDistance = 0;
          result.routes[0].legs.forEach((leg) => {
            totalDistance += leg.distance.value;
          });
          totalDistance /= 1000; // Convert meters to kilometers

          // Create custom overlay for total distance
          const distanceOverlay = new window.google.maps.OverlayView();
          distanceOverlay.onAdd = function () {
            const div = document.createElement("div");
            div.style.backgroundColor = "#0D1722";
            div.style.color = "white";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.style.position = "absolute";
            div.style.top = "10px"; // Adjust top position as needed
            div.style.left = "10px"; // Adjust left position as needed
            div.textContent = `Total Distance: ${totalDistance.toFixed(2)} km`;
            this.getPanes().floatPane.appendChild(div);
            this.div_ = div;
          };
          distanceOverlay.draw = function () { };
          distanceOverlay.setMap(map);
        } else {
          console.error("Error rendering directions:", status);
        }
      });
    }

    if (selectedLocation !== "") {
      // Geocode selected location and display marker on the map
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: selectedLocation }, (results, status) => {
        if (status === "OK") {
          map.setCenter(results[0].geometry.location);
          new window.google.maps.Marker({
            map,
            position: results[0].geometry.location,
            icon: taxiIcon, // Set the car image as marker icon
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

    //    // Add marker for drop-off location
    //    if (dropoffLocation !== '') {
    //     const geocoder = new window.google.maps.Geocoder();
    //     geocoder.geocode({ address: dropoffLocation }, (results, status) => {
    //         if (status === 'OK') {
    //             new window.google.maps.Marker({
    //                 map,
    //                 position: results[0].geometry.location,
    //                 icon: dropIcon, // Set the car image as marker icon
    //                 scaledSize: new window.google.maps.Size(0, 0), // Set the size here (width, height)
    //               });
    //         } else {
    //             console.error('Geocode was not successful for the following reason:', status);
    //         }
    //     });
    // }
  };

  const loadMapScript = (zoom) => {
    if (selectedLocation !== "") {
      const scriptId = "google-maps-script";

      if (
        !document.getElementById(scriptId) ||
        !document.querySelector(
          `script[src*="https://maps.googleapis.com/maps/api/js"]`
        )
      ) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDYsdaR0zrPsBDeuyCKFH_4PuCUyWcQ2mE&libraries=geometry,places`;
        script.onload = () => {
          initMap(zoom);
        };
        document.body.appendChild(script);
      } else {
        initMap(zoom);
      }
    }
  };

  const ChangeConfirm = () => {
    setConfirmLocation(false);
    console.log(ConfirmLocation);
  };

  const handlePickupChange = (e) => {
    const value = e.target.value;
    setPickupLocation(value);
    if (value.trim() !== "") {
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

  const handleSearchLocationClick = async () => {
    setConfirmLocation(true);

    try {
      const updatelocation = {
        pickup: selectedLocation,
        dropoff: dropoffLocation,
      };
      const response = await axiosInstance.post(
        `/api/find-distance/`,
        updatelocation
      );

      const distanceValue =
        response.data.data.rows[0].elements[0].distance.text;
      const durationValue =
        response.data.data.rows[0].elements[0].duration.text;
      setTotalDistance(distanceValue);
      setDuration(durationValue);

      setZoomLevel(15);

      console.log("distanceValue", response.data.data);

      const distanceInKM = parseFloat(
        distanceValue.replace(" km", "").replace(",", "")
      );

      // Calculate zoom level based on distance
      const scale = Math.pow(2, 20);
      let zoomLevel = Math.round(
        Math.log(scale / (distanceInKM * 1000)) / Math.LN2
      );

      // Add a fixed value to the calculated zoom level for more zoom
      zoomLevel += 5; // Adjust this value as needed to achieve the desired zoom level

      loadMapScript(zoomLevel);

      console.log("zoomLevelclick", zoomLevel);
    } catch (error) {
      console.error("Error fetching distance:", error);
      toast.error("Error Please Choose Another Locaction");
      setConfirmLocation(false);
    }
  };

  useEffect(() => {
    loadMapScript(getZoomLevel);
  }, []);

  // Function to handle click on search result
  const handleSearchPickupClick = (result) => {
    toast.success("Location Update");
    setPickupSuggestions([]);
    setSelectedLocation(result.description);
    setPickupLocation(result.description);
    // localStorage.setItem("selectedLocation", result.description);
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
    loadMapScript();
  }, [selectedLocation]);

  const clearPickup = () => {
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
    pickupTime: selectedTime,
    pickupDate: selectedDate,
    bookingTyp: "Local",
    CarType: Orderinputs.CarType,
    rideTyp: Orderinputs.rideTyp,
    PickupLocation: pickupLocation,
    DestinationLocation: dropoffLocation,
    BookingDistance: Totaldistance,
    DriveHR: Orderinputs.DriveHR,
    primary: getPrimaryName,
  };

  useEffect(() => {
    console.log("Orderinputs.DriveHR", Orderinputs.DriveHR);
    if (Orderinputs.DriveHR >= 1 && Orderinputs.DriveHR <= 3) {
      setTotalPrice(
        Number(Headers.localCharges13 ? Headers.localCharges13 : 400)
      );
    } else if (Orderinputs.DriveHR > 3) {
      // Calculate the extra count beyond 4
      let extraCount = Orderinputs.DriveHR - 3;
      // Add 100 for each extra count beyond 4
      let totalPrice =
        Number(Headers.localCharges13 ? Headers.localCharges13 : 400) +
        extraCount *
        Number(Headers.localHrCharges ? Headers.localHrCharges : 100);

      setTotalPrice(totalPrice);
    }
  }, [Orderinputs]);

  const isValidEmail = (email) => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (!Orderinputs.username || !Orderinputs.phone || !Orderinputs.email) {
      toast.error("Please fill all details correctly");

      return;
    }

    if (!isValidEmail(Orderinputs.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!Orderinputs.state) {
      toast.error("Please select a state");
      return;
    }

    if (!Orderinputs.mode) {
      toast.error("Please choose a payment mode");
      return;
    }

    const userId = decryptdatajson._id;

    const updatedFormData = {
      ...Ordercredentials,
      userId: userId,
      totalAmount: TotalPrice,
      payment: 1,
    };

    console.log(updatedFormData);

    try {
      setbookRide(true);

      const response = await axiosInstance.post(
        `/create-order/${userId}`,
        updatedFormData
      );

      const { success, order } = response.data;
      if (success) {
        const sendmsg = { userId: order.id, type: "ride" };
        sendMessage(sendmsg);
        navigate("/success");
      } else {
        toast.error("Failed to create order");
      }
    } catch (error) {
      console.error("Error during order creation:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setbookRide(false);
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
  useEffect(() => {
    fetchData();
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
    const { name, value } = e.target;

    // Split the value into words, capitalize each word, and join them back
    const capitalizedValue = value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    setOrderInputs((prevState) => ({
      ...prevState,
      [name]: capitalizedValue,
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
    if (getStateId !== false) {
      const status = data.find((data) => data._id === getStateId)?.primary;
      const Sname = data.find((data) => data._id === getStateId)?.name;

      if (status === "true" || status === "false") {
        setPrimaryName(status);
        setStateName(Sname);
      }
    }
  }, [getStateId]);

  return (
    <>
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
          </div>{" "}
        </>
      )}

      <main className="page-content dz-gradient-shape">
        <div className="container">
          <div className="location-tracking">
            {ConfirmLocation ? (
              <Link
                className="icon btn bg-dark btn-sm gap-1 py-2 px-3 rounded-xl text-white fixback d-md-none"
                to="/"
              >
                <i className="ri-arrow-left-line" />
                <span>Back</span>
              </Link>
            ) : (
              <div className="col-12 tracking-header  m-t80">
                <div className="card flex-row p-2">
                  <div
                    className="text-center d-flex flex-column  align-items-center  justify-content-start pt-3"
                    style={{ width: 30 }}
                  >
                    <i className="ri-map-pin-2-fill fs-4 text-primary"></i>
                    <span
                      style={{ height: 30, borderLeft: "2px dashed grey" }}
                      className="my-1"
                    />

                    <i className="ri-record-circle-fill fs-4 text-dark"></i>
                  </div>

                  <div className="card-body p-0 ">
                    <div className="mb-2 input-group input-group-icon mt-1">
                      <input
                        type="text"
                        className="form-control border-0 "
                        placeholder="Enter Pickup Location"
                        value={pickupLocation}
                        onChange={handlePickupChange}
                      />

                      <div className="d-flex align-items-center">
                        <i
                          className="ri-close-circle-fill fs-3 cursor"
                          onClick={clearPickup}
                        ></i>
                      </div>
                    </div>

                    <hr className="p-0 m-0" />
                    <div className="mb-2 input-group input-group-icon mt-1">
                      <input
                        type="text"
                        className="form-control border-0"
                        placeholder="Enter Drop Location"
                        value={dropoffLocation}
                        onChange={handleDropoffChange}
                      />

                      <div className="d-flex align-items-center">
                        <i
                          className="ri-close-circle-fill fs-3 cursor"
                          onClick={clearDrop}
                        ></i>
                      </div>

                      {/* onClick={handleSearchLocationClick}  */}
                      <div></div>
                    </div>

                    {!ConfirmLocation && (
                      <button
                        type="button"
                        onClick={handleSearchLocationClick}
                        className="input-group-text show-pass border-0 bg-primary text-center px-3 ms-1 text-white cursor searchbtnfloat"
                        style={{ borderRadius: 48, fontSize: 14 }}
                      >
                        <i
                          className="ri-search-line text-white me-1  "
                          style={{ fontSize: 14 }}
                        ></i>
                        <span className=" "> Local Ride </span>
                      </button>
                    )}

                    <div className="px-3">
                      {pickupSuggestions.length !== 0 && pickupSuggestions && (
                        <>
                          <div className="recent-search-list">
                            <ul>
                              {pickupSuggestions.map((suggestion, index) => (
                                <li
                                  className="search-content cursor"
                                  key={index}
                                  onClick={() =>
                                    handleSearchPickupClick(suggestion)
                                  }
                                >
                                  <div className="left-content">
                                    <i className="ri-map-pin-2-fill me-2"></i>
                                    <div>
                                      <p className="fw-bold mb-0">
                                        {
                                          suggestion.structured_formatting
                                            .main_text
                                        }{" "}
                                      </p>
                                      <span>
                                        {" "}
                                        {
                                          suggestion.structured_formatting
                                            .secondary_text
                                        }{" "}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="remove ">
                                    <i className="feather icon-chevron-right" />
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {dropoffSuggestions &&
                        dropoffSuggestions.length !== 0 && (
                          <>
                            <div className="recent-search-list">
                              <ul>
                                {dropoffSuggestions.map((suggestion, index) => (
                                  <li
                                    className="search-content cursor"
                                    key={index}
                                    onClick={() =>
                                      handleSearchDropClick(suggestion)
                                    }
                                  >
                                    <div className="left-content">
                                      <i className="ri-map-pin-2-fill me-2"></i>
                                      <div>
                                        <p className="fw-bold mb-0">
                                          {
                                            suggestion.structured_formatting
                                              .main_text
                                          }{" "}
                                        </p>
                                        <span>
                                          {" "}
                                          {
                                            suggestion.structured_formatting
                                              .secondary_text
                                          }{" "}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="remove ">
                                      <i className="feather icon-chevron-right" />
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              id="map"
              style={{ height: "100vh", width: "100%" }}
              className={`${ConfirmLocation && "open-map"}`}
            ></div>
            <div className="footer-content">
              {ConfirmLocation ? (
                <button
                  type="button"
                  onClick={ChangeConfirm}
                  className="icon btn bg-dark btn-sm gap-1 p-3 px-3 rounded-xl text-white"
                >
                  <i className="ri-arrow-left-line"></i> <span>Customse</span>
                </button>
              ) : (
                <Link
                  to={"/"}
                  className="icon btn bg-dark btn-sm gap-1   px-3 rounded-xl text-white"
                >
                  <i className="ri-arrow-left-line"></i>

                  <span>Back</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* {ConfirmLocation && (<>
<div className='bg-dark-shadow-fix desk-none'>
</div>
</>
)} */}

      <div className={`${!ConfirmLocation && "d-none"}`}>
        <div
          className={`offcanvas  shadow-sm border offcanvas-bottom ${ConfirmLocation && "show"
            }`}
        >
          <div className="offcanvas-header p-2">
            <h5 className="offcanvas-title" id="offcanvasBottomLabel">
              Trip Option
            </h5>
            <button
              type="button"
              onClick={ChangeConfirm}
              className="btn btn-sm bg-secondary"
            >
              <i className="ri-road-map-fill me-2"></i> Change
            </button>
          </div>
          <div className="offcanvas-body small">
            <div className="card border-0 flex-row p-0">
              <div
                className="text-center d-flex flex-column  align-items-center  justify-content-start "
                style={{ width: 30 }}
              >
                <i className="ri-map-pin-2-fill fs-4 text-primary" />
                <span
                  className="my-1"
                  style={{ height: 10, borderLeft: "2px dashed grey" }}
                />
                <i className="ri-record-circle-fill fs-4 text-dark" />
              </div>
              <div className="card-body p-0 ">
                <div className="mb-2 input-group input-group-icon mt-1">
                  <p className="p-0 m-0 overflowOne mb-2">{pickupLocation}</p>
                </div>
                <hr className="p-0 m-0" />
                <div className="mb-2 input-group input-group-icon mt-1">
                  <p className="p-0 m-0 overflowOne mt-2">{dropoffLocation}</p>
                  <div />
                </div>
                <div className="px-3" />
              </div>
            </div>

            {TotalPrice !== 0 && (
              <div
                className="bg-success p-2 text-center text-white mb-3 w-100 position-sticky sticky-top rounded-sm col-12"
                style={{ top: "-10px" }}
              >
                <h4 className="text-white fs-6 m-0 fw-light">
                  Estimated Price{" "}
                  <span className="fw-bold fs-5">₹{TotalPrice} </span>{" "}
                </h4>
              </div>
            )}

            <div className="row mb-2">
              <div className="col-6 text-center">
                <div className="bg-primary py-2 text-white px-1 border rounded fs-7">
                  {" "}
                  Estimate Distance <br /> {Totaldistance}{" "}
                </div>
              </div>
              <div className="col-6 text-center">
                <div className="bg-primary text-white px-1  py-2 border rounded fs-7">
                  {" "}
                  Estimate Time <br /> {duration}{" "}
                </div>
              </div>
            </div>

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
                      Scheduled Ride <i className="ri-timer-line"></i>
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
                                  <span className="fs-6 py-2">{dayOfWeek}</span>
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

            <div className="mt-2">
              <p className="fs-5 fw-bold"> Car Type</p>

              <ul id="CarTypeList" className="customradio">
                <li>
                  <input
                    type="radio"
                    name="CarType"
                    value="Sedan"
                    onChange={handleOrderChange}
                  />
                  <label>
                    {" "}
                    <img
                      src="/img/car.png"
                      className="w-100 px-lg-2"
                    /> <br /> <span> Sedan </span>
                  </label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="CarType"
                    value="Suv"
                    onChange={handleOrderChange}
                  />
                  <label>
                    {" "}
                    <img
                      src="/img/car.png"
                      className="w-100 px-lg-2"
                    /> <br /> <span> Suv </span>
                  </label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="CarType"
                    value="Luxury"
                    onChange={handleOrderChange}
                  />
                  <label>
                    {" "}
                    <img
                      src="/img/car.png"
                      className="w-100 px-lg-2"
                    /> <br /> <span> Luxury </span>
                  </label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="CarType"
                    value="Mini"
                    onChange={handleOrderChange}
                  />
                  <label>
                    {" "}
                    <img
                      src="/img/car.png"
                      className="w-100 px-lg-2"
                    /> <br /> <span> Mini </span>
                  </label>
                </li>
              </ul>
            </div>

            <div className="mt-3">
              <p className="fs-5 fw-bold"> Ride Type </p>
              <ul id="RideType" className="customradio two">
                <li>
                  <input
                    type="radio"
                    name="rideTyp"
                    onChange={handleOrderChange}
                    value="Round Trip"
                  />
                  <label>Round Trip</label>
                </li>

                <li>
                  <input
                    type="radio"
                    name="rideTyp"
                    onChange={handleOrderChange}
                    value="One Way"
                  />
                  <label>One Way</label>
                </li>
              </ul>
            </div>

            <div className="mt-3">
              <p className="fs-5 fw-bold"> Driver Service Hours </p>
              <ul id="DriverServiceHours" className="customradio">
                {" "}
                <li>
                  <input
                    type="radio"
                    name="DriveHR"
                    onChange={handleOrderChange}
                    value="3"
                  />
                  <label>1-3 Hour</label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="DriveHR"
                    onChange={handleOrderChange}
                    value="4"
                  />
                  <label>4 Hour</label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="DriveHR"
                    onChange={handleOrderChange}
                    value="5"
                  />
                  <label>5 Hour</label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="DriveHR"
                    onChange={handleOrderChange}
                    value="6"
                  />
                  <label>6 Hour</label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="DriveHR"
                    onChange={handleOrderChange}
                    value="7"
                  />
                  <label>7 Hour</label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="DriveHR"
                    onChange={handleOrderChange}
                    value="8"
                  />
                  <label>8 Hour</label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="DriveHR"
                    onChange={handleOrderChange}
                    value="9"
                  />
                  <label>9 Hour</label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="DriveHR"
                    onChange={handleOrderChange}
                    value="9"
                  />
                  <label>10 Hour</label>
                </li>
                <li>
                  <input
                    type="radio"
                    name="DriveHR"
                    onChange={handleOrderChange}
                    value="10"
                  />
                  <label>11 Hour</label>
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
                          <label
                            className="form-label text-dark"
                            htmlFor="username"
                          >
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
                          <label
                            className="form-label text-dark"
                            htmlFor="phone"
                          >
                            Phone No.
                          </label>
                          <input
                            readOnly
                            className="form-control form-control-sm bg-light"
                            type="number"
                            id="phone"
                            name="phone"
                            value={Orderinputs.phone}
                          // onChange={handleOrderChange}
                          />
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="mb-4">
                          <label
                            className="form-label text-dark"
                            htmlFor="Email"
                          >
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
                            {/* {!EmailVerify && (
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
                            )} */}
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
                          <label
                            className="form-label text-dark"
                            htmlFor="state"
                          >
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
                      <div className="profile-main-loader">
                        <div className="loader">
                          <svg className="circular-loader" viewBox="25 25 50 50">
                            <circle
                              className="loader-path"
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
          </div>
        </div>
      </div>

      {bookRide && (
        <>
          <div className="loading-box text-center d-flex flex-column">
            <i
              className="ri-loader-2-line spin"
              style={{ fontSize: 80, color: "white" }}
            />
            <h4 className="text-white"> Please wait ....</h4>
          </div>
        </>
      )}

      <Footer />
    </>
  );
};


OneWay.propTypes = {
  updateAuthStatus: PropTypes.bool.isRequired,
};


export default OneWay;
