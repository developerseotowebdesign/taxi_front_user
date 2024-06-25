import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import DriverNavbar from "./includes/DriverNavbar";
import axiosInstance from "../axiosInstance";
import LiveRides from "./components/LiveRides";
import SlideButton from "react-slide-button";
import { useBlogContext } from "../fetchdata/BlogContext";

const RidesDriverView = () => {
  const [currentLocation, setCurrentLocation] = useState("");

  const calculateTimeDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);

    const difference = endTime - startTime;
    const hours = Math.floor(difference / 1000 / 60 / 60);
    const minutes = Math.floor((difference / 1000 / 60) % 60);

    return { hours, minutes };
  };

  const { Headers, isHeader } = useBlogContext();

  const navigate = useNavigate();

  const [countTotalCal, setcountTotalCal] = useState([]);

  const [Order, setOrder] = useState([]);
  const [IsLoading, setIsLoading] = useState(true);
  const [StartRideStatus, setStartRideStatus] = useState(false);
  const [startOTP, setstartOTP] = useState(0);
  const [endOTP, setendOTP] = useState(0);
  const [EndRideStatus, setEndRideStatus] = useState(false);
  const [reset, setReset] = useState(0);

  const [ClickstartOTP, setClickstartOTP] = useState(false);
  const [ClickendOTP, setClickendOTP] = useState(false);

  const { cId, orderId } = useParams();
  const [SubmitLoading, setSubmitLoading] = useState(false); // Add loading state
  const [DistanceValue, setDistanceValue] = useState(""); // Add loading state

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getUserDriverOrders = async () => {
    try {
      setIsLoading(true); // Set loading state to false in case of an error
      // const id = localStorage.getItem('userId');
      const { data } = await axiosInstance.get(
        `/user-orders-view/${cId}/${orderId}`
      );

      if (data?.success) {
        console.log("order", data);
        setOrder(data?.userOrder);
        const otpStartDate = data?.userOrder[0]?.otpStartDate;
        const otpEndDate = data?.userOrder[0]?.otpEndDate;
        // Usage
        const { hours, minutes } = await calculateTimeDuration(
          data?.userOrder[0]?.otpStartDate,
          data?.userOrder[0]?.otpEndDate
        );

        console.log(`Duration: ${hours} hours and ${minutes} minutes`);
        console.log(`Duration: ${hours} hours and ${minutes} minutes`);

        setcountTotalCal({ hours, minutes });
      }

      setIsLoading(false); // Set loading state to false after fetching data
    } catch (error) {
      console.log(error);
      setIsLoading(false); // Set loading state to false in case of an error
      toast.error("order Not found");
      // navigate('/account');
    }
  };

  //   useEffect(() => {
  // if(Headers.length > 0)
  //   }, [Headers]); // Empty dependency array ensures that the effect runs once after the initial render

  const startRide = async () => {
    setSubmitLoading(true);
    try {
      // const id = localStorage.getItem('userId');
      const { data } = await axiosInstance.get(
        `/start-ride-request/${orderId}`
      );
      console.log("datastart", data);
      const { success, order } = data;
      if (success) {
        toast.success(order.startOTP);
        setstartOTP(order.startOTP);
        setClickstartOTP(true);
      }
    } catch (error) {
      console.log(error);

      // navigate('/account');
    } finally {
      setSubmitLoading(false);
    }

    // toast.success("Ride Start");
  };

  const EndRide = async () => {
    setSubmitLoading(true);
    try {
      if (
        Order[0].bookingTyp === "Outstation" &&
        Order[0].rideTyp === "One Way"
      ) {
        try {
          const updatelocation = {
            pickup: Order?.DestinationLocation,
            dropoff: currentLocation,
          };
          const response = await axiosInstance.post(
            `/api/find-distance/`,
            updatelocation
          );

          const distanceValue =
            response.data.data.rows[0].elements[0].distance.text;
          const durationValue =
            response.data.data.rows[0].elements[0].duration.text;
          const distanceInKM = parseFloat(
            distanceValue.replace(" km", "").replace(",", "")
          );
          console.log("distanceInKM", distanceValue, distanceInKM);
          if (response) setDistanceValue(distanceInKM);
          console.log("response", response);
          // console.log('distanceValue',response.data.data);

          // console.log('distanceValue',distanceValue);

          // console.log('currentLocation',currentLocation);
          // navigate('/account');
        } catch (error) {
          console.log("error", error.response.statusText);
          if (error.response.statusText === "Not Found") {
            setDistanceValue(Order[0].FinalDriveKM);
            console.log("Order[0].FinalDriveKM", Order[0].FinalDriveKM);
          }
        }
      }

      // const id = localStorage.getItem('userId');
      const { data } = await axiosInstance.get(`/end-ride-request/${orderId}`);
      console.log("datastart", data);
      const { success, order } = data;
      if (success) {
        toast.success(order.endOTP);
        setendOTP(order.endOTP);
        setClickendOTP(true);
      }
    } catch (error) {
      console.log(error);

      // navigate('/account');
    } finally {
      setSubmitLoading(false);
    }
  };

  const startCheckOTPRideVerify = async () => {
    if (startOTP.toString() === formData.startOTPinput) {
      startOTPRideVerify();
    } else {
      toast.error("OTP Not Verified");
    }
  };

  const endCheckOTPRideVerify = async () => {
    console.log(endOTP, formData.endOTPinput);
    if (endOTP.toString() === formData.endOTPinput) {
      endOTPRideVerify();
    } else {
      toast.error("OTP Not Verified");
    }
  };

  const startOTPRideVerify = async () => {
    try {
      setSubmitLoading(true);

      const { data } = await axiosInstance.get(`/start-ride-verify/${orderId}`);
      console.log("datastart", data);
      const { success, order } = data;
      if (success) {
        getUserDriverOrders();
      }
    } catch (error) {
      console.log(error);

      // navigate('/account');
    } finally {
      setSubmitLoading(false);
    }
  };

  const endOTPRideVerify = async () => {
    try {
      setSubmitLoading(true);

      // const id = localStorage.getItem('userId');

      const FinalDriveKM = DistanceValue;
      const payload = { FinalDriveKM };
      console.log("payload", payload);
      const { data } = await axiosInstance.post(
        `/end-ride-verify/${orderId}`,
        payload
      );
      console.log("datastart", data);
      const { success, order } = data;
      if (success) {
        getUserDriverOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      // navigate('/account');
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    getUserDriverOrders();
  }, []); // Empty dependency array ensures that the effect runs once after the initial render

  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);

    const difference = endTime - startTime;
    const hours = Math.floor(difference / 1000 / 60 / 60);
    const minutes = Math.floor((difference / 1000 / 60) % 60);

    return { hours, minutes };
  };

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

  useEffect(() => {
    const loadGoogleMaps = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDYsdaR0zrPsBDeuyCKFH_4PuCUyWcQ2mE&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      document.body.appendChild(script);
    };

    const initializeAutocomplete = () => {
      const autocomplete = new window.google.maps.places.Autocomplete(
        document.getElementById("location-input")
      );
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        console.log(place);
      });
    };

    loadGoogleMaps();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDYsdaR0zrPsBDeuyCKFH_4PuCUyWcQ2mE`
          )
            .then((response) => response.json())
            .then((data) => {
              console.log("data", data);
              const address = data.results[0].formatted_address;
              setCurrentLocation(address);
            })
            .catch((error) => {
              console.error("Error fetching current location:", error);
            });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <>
      <header className="header header-fixed">
        <div className="header-content">
          <div className="left-content">
            <Link to="/driver/rides" className="back-btn">
              <i class="ri-arrow-left-line"></i>
            </Link>
          </div>
          <div className="mid-content">
            <h4 className="title">
              {" "}
              {IsLoading ? (
                <div
                  className="skeleton m-auto mb-2"
                  style={{ height: 40, width: "50%" }}
                />
              ) : (
                <span>Booking ID #{Order[0]?.orderId} </span>
              )}{" "}
            </h4>
          </div>
          <div className="right-content d-flex align-items-center gap-4"></div>
        </div>
      </header>

      <main className="page-content space-top p-b40">
        <div className="container">
          {IsLoading ? (
            <>
              <div
                className="skeleton m-auto mb-3 "
                style={{ height: 200, width: "70%" }}
              />

              <div
                className="skeleton m-auto mb-3 "
                style={{ height: 60, width: "100%" }}
              />

              <div
                className="skeleton m-auto mb-3 "
                style={{ height: 80, width: "100%" }}
              />

              <div
                className="skeleton m-auto mb-3 "
                style={{ height: 200, width: "100%" }}
              />
            </>
          ) : (
            <>
              <div className="m-auto d-block mb-3" style={{ maxWidth: 350 }}>
                <div className="position-relative">
                  <img
                    src="/img/ridegif.gif"
                    className="m-auto d-block mb-3"
                    style={{
                      borderRadius: 10,
                      border: "2px solid black",
                      aspectRatio: "347/260",
                      width: "100%",
                    }}
                  />

                  {Order[0]?.startStatusOTP === 0 &&
                    Order[0]?.endStatusOTP === 0 && (
                      <>
                        <span class="badge rounded-pill bg-danger px-2 py-1 ridestatus">
                          {" "}
                          <i class="ri-taxi-line fw-light fs-6"></i> Not Started
                          Yet
                        </span>
                      </>
                    )}

                  {Order[0]?.startStatusOTP === 1 && (
                    <>
                      <span class="badge rounded-pill bg-warning px-2 py-1 ridestatus">
                        {" "}
                        <i class="ri-taxi-line fw-light fs-6"></i> Ride Started
                      </span>
                    </>
                  )}

                  {Order[0]?.endStatusOTP === 1 && (
                    <>
                      <span class="badge rounded-pill bg-success px-2 py-1 ridestatus">
                        {" "}
                        <i class="ri-taxi-line fw-light fs-6"></i> Ride
                        Completed
                      </span>
                    </>
                  )}
                </div>

                {Order[0]?.startStatusOTP === 0 ? (
                  <>
                    <SlideButton
                      mainText="Slide To Start Ride"
                      overlayText={
                        SubmitLoading ? "Loading..." : "Enter OTP To Confirm"
                      }
                      classList="my-class mb-2"
                      caretClassList="my-caret-class"
                      overlayClassList="my-overlay-class"
                      onSlideDone={function () {
                        startRide();
                      }}
                    />

                    {ClickstartOTP && (
                      <>
                        <div className="mb-2 input-group input-group-icon">
                          <span className="input-group-text p-0">
                            <div className="input-icon">
                              <i class="ri-lock-fill"></i>
                            </div>
                          </span>
                          <input
                            type="number"
                            id="startOTPinput"
                            value={formData.startOTPinput}
                            name="startOTPinput"
                            onChange={(e) =>
                              e.target.value.length > 4
                                ? toast.error("Only 4 digits allowed")
                                : handleChange(e)
                            }
                            className="form-control dz-password  form-control-md"
                            placeholder="Please Enter OTP"
                          />
                          <button
                            type="button"
                            class="btn me-2 btn-primary btn-sm"
                            onClick={startCheckOTPRideVerify}
                          >
                            Submit
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {Order[0]?.endStatusOTP === 0 && (
                      <>
                        <SlideButton
                          mainText="Slide To End Ride"
                          overlayText={
                            SubmitLoading
                              ? "Loading..."
                              : "Enter OTP To Confirm"
                          }
                          classList="my-class mb-2 endride"
                          caretClassList="my-caret-class"
                          overlayClassList="my-overlay-class"
                          onSlideDone={function () {
                            EndRide();
                          }}
                        />

                        {ClickendOTP && (
                          <>
                            <div className="mb-2 input-group input-group-icon">
                              <span className="input-group-text p-0">
                                <div className="input-icon">
                                  <i class="ri-lock-fill"></i>
                                </div>
                              </span>
                              <input
                                type="number"
                                id="endOTPinput"
                                value={formData.endOTPinput}
                                name="endOTPinput"
                                onChange={(e) =>
                                  e.target.value.length > 4
                                    ? toast.error("Only 4 digits allowed")
                                    : handleChange(e)
                                }
                                className="form-control dz-password  form-control-md"
                                placeholder="Please Enter OTP"
                              />
                              <button
                                type="button"
                                class="btn me-2 btn-primary btn-sm"
                                onClick={endCheckOTPRideVerify}
                              >
                                Submit
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="d-flex gap-2 d-none">
                <div
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                  data-bs-delay={3982}
                  data-bs-autohide="false"
                  className="toast style-1 fade toast-primary mb-2 w-100 show shadow-none"
                >
                  <div className="toast-body">
                    <i className="ri-key-fill"></i>
                    <div className="toast-content ms-3 me-2">
                      <strong> Start OTP is </strong>
                      <b className="fw-bold h5 text-white"> 7886</b>
                    </div>
                    <button
                      className="btn btn-close position-absolute p-1"
                      type="button"
                      data-bs-dismiss="toast"
                      aria-label="Close"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                </div>

                <div
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                  data-bs-delay={3982}
                  data-bs-autohide="false"
                  className="toast style-1 fade toast-primary mb-2 w-100  show  shadow-none"
                >
                  <div className="toast-body">
                    <i className="ri-key-fill"></i>
                    <div className="toast-content ms-3 me-2">
                      <strong> End OTP is </strong>
                      <b className="fw-bold h5 text-white"> 5670</b>
                    </div>
                    <button
                      className="btn btn-close position-absolute p-1"
                      type="button"
                      data-bs-dismiss="toast"
                      aria-label="Close"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                </div>
              </div>

              {Order[0]?.startStatusOTP === 1 &&
                Order[0]?.endStatusOTP === 1 && (
                  <>
                    <div className="card">
                      <div className="card-body bg-primary text-white rounded-sm">
                        <p className="card-title opacity-1 text-white">
                          {Order[0]?.bookingTyp !== "Outstation" ? (
                            <>
                              Ride Completed in {countTotalCal?.hours} Hr{" "}
                              {countTotalCal.hours
                                ? countTotalCal?.minutes + " Minutes"
                                : ""}
                            </>
                          ) : (
                            <>
                              Ride Completed in{" "}
                              {Math.floor(countTotalCal?.hours / 24)} days{" "}
                              {countTotalCal?.hours % 24} Hr{" "}
                              {countTotalCal?.minutes} Minutes
                            </>
                          )}
                        </p>
                        <h4 className="card-title text-white">
                          {" "}
                          ₹{Order[0]?.totalAmount}{" "}
                        </h4>
                      </div>
                    </div>
                  </>
                )}

              {Order[0]?.startStatusOTP === 0 ? (
                <>
                  <div className="card">
                    <div className="card-body bg-danger text-white rounded-sm">
                      <p className="card-title opacity-1 text-white">
                        Not Started Yet Estimate Time is {Order[0]?.DriveHR}Hr
                      </p>
                      <h4 className="card-title text-white">
                        ₹{Order[0]?.totalAmount}{" "}
                      </h4>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {Order[0]?.endStatusOTP !== 1 && (
                    <>
                      <div className="card">
                        <div className="card-body bg-warning  text-white rounded-sm">
                          <p className="card-title opacity-1 text-white">
                            Ride Started Estimate Time is {Order[0]?.DriveHR}Hr
                          </p>
                          <h4 className="card-title text-white">
                            ₹{Order[0]?.totalAmount}{" "}
                          </h4>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* {formatTimestamp(Order[0]?.otpStartDate) }
 {formatTimestamp(Order[0]?.otpEndDate) } */}

              {!StartRideStatus && <> </>}

              <div className="card p-3">
                <div className="d-flex justify-content-between">
                  <span className="badge badge-primary">
                    Booking ID : {Order[0]?.orderId}
                  </span>
                  <span className="badge badge-primary">
                    Date : May 16, 2024{" "}
                  </span>
                </div>
                <hr />
                <div className="d-flex">
                  <img
                    className="rounded me-2"
                    src="/img/2.jpg"
                    style={{ width: 50, height: "auto" }}
                  />
                  <div className="media-body">
                    <h5 className="mt-2 mb-0">
                      {" "}
                      {Order[0]?.details[0]?.username}{" "}
                    </h5>
                    <div className="d-flex flex-row justify-content-between align-text-center">
                      <small className="text-muted">
                        {Order[0]?.details[0]?.state}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 ms-auto">
                    <a
                      className="dz-icon icon-sm icon-fill"
                      href={`tel:${Order[0]?.details[0]?.phone}`}
                    >
                      <i className="ri-phone-fill" />
                    </a>
                    <Link
                      className="dz-icon icon-sm icon-fill"
                      to={`/driver/chat/${Order[0]?.userId}`}
                    >
                      <i className="ri-message-3-fill" />
                    </Link>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-8">
                    <div className="d-flex">
                      <i className="ri-map-pin-2-fill me-2 text-primary" />
                      <span className="overflowOne hover-text">
                        {" "}
                        {Order[0]?.PickupLocation}
                      </span>
                    </div>
                    <div className="d-flex">
                      <i className="ri-map-pin-range-fill  me-2" />
                      <span className="overflowOne hover-text">
                        {" "}
                        {Order[0]?.DestinationLocation}
                      </span>
                    </div>
                  </div>
                  <div className="col-4 text-end">
                    <h4>₹{Order[0]?.totalAmount}</h4>
                  </div>
                </div>
                <hr />
                <div className="col-12">
                  <div class="fs-6 text-left ">
                    <button className="btn mb-2 btn-xs btn-primary p-2 d-inline me-2">
                      <p className="p-0 m-0">
                        {" "}
                        <b className="fw-bold">Car Type</b>{" "}
                      </p>
                      <p className="p-0 m-0"> {Order[0]?.CarType} </p>{" "}
                    </button>

                    <button className="btn mb-2 btn-xs btn-primary p-2 d-inline text-start me-2">
                      <p className="p-0 m-0">
                        {" "}
                        <b className="fw-bold">Scheduled date : </b>{" "}
                        {Order[0]?.pickupDate}{" "}
                      </p>
                      <p className="p-0 m-0">
                        {" "}
                        <b className="fw-bold">Scheduled Time : </b>{" "}
                        {Order[0]?.pickupTime}{" "}
                      </p>
                    </button>

                    {Order[0]?.DriveHR !== 0 && (
                      <button className="btn mb-2 btn-xs btn-primary p-2 d-inline text-start me-2">
                        <p className="p-0 m-0">
                          {" "}
                          <b className="fw-bold">Driver Service Hours </b>{" "}
                        </p>
                        <p className="p-0 m-0"> {Order[0]?.DriveHR} Hour </p>
                      </button>
                    )}

                    <button className="btn mb-2 btn-xs btn-secondary p-2 d-inline text-start me-2">
                      <p className="p-0 m-0">
                        {" "}
                        <b className="fw-bold"> payment Type</b>{" "}
                      </p>
                      <p className="p-0 m-0"> {Order[0]?.mode} </p>
                    </button>

                    <button className="btn mb-2 btn-xs btn-secondary p-2 d-inline text-start me-2">
                      <p className="p-0 m-0">
                        {" "}
                        <b className="fw-bold"> Ride Type</b>{" "}
                      </p>
                      <p className="p-0 m-0"> {Order[0]?.rideTyp} </p>
                    </button>

                    <button className="btn mb-2 btn-xs btn-primary e p-2 d-inline text-start me-2">
                      <p className="p-0 m-0">
                        {" "}
                        <b className="fw-bold"> Booking Type</b>{" "}
                      </p>
                      <p className="p-0 m-0"> {Order[0]?.bookingTyp} </p>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <LiveRides />
      </main>
    </>
  );
};

export default RidesDriverView;
