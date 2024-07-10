import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import VendorNavbar from "./includes/VendorNavbar";
import axiosInstance, { weburl } from "../axiosInstance";
import LiveValet from "./components/LiveValet";
import SlideButton from "react-slide-button";
import { useBlogContext } from "../fetchdata/BlogContext";
import Select from "react-select";
import getDecryptData from "../helper/getDecryptData";

const ValetVendorView = () => {
  const { cId, ValetId } = useParams();

  const [DriversAssign, setDriversAssign] = useState([]);

  const [EditDriver, setEditDriver] = useState(false);

  const HandleEditDriver = async () => {
    if (EditDriver) {
      setEditDriver(false);
    } else {
      setEditDriver(true);
    }
  };

  const decryptdatajson = getDecryptData();
  const [Dloading, setDLoading] = useState(true);

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

  const [MatchedDriversList, setMatchedDriversList] = useState([]);
  const [UnmatchedDriversList, setUnmatchedDriversList] = useState([]);

  const [IsDLoading, setIsDLoading] = useState(true);

  const [IsLoading, setIsLoading] = useState(true);
  const [StartRideStatus, setStartRideStatus] = useState(false);
  const [startOTP, setstartOTP] = useState(0);
  const [endOTP, setendOTP] = useState(0);
  const [EndRideStatus, setEndRideStatus] = useState(false);
  const [reset, setReset] = useState(0);

  const [ClickstartOTP, setClickstartOTP] = useState(false);
  const [ClickendOTP, setClickendOTP] = useState(false);

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

  const getUserVendorValet = async () => {
    try {
      setIsLoading(true); // Set loading state to false in case of an error
      // const id = localStorage.getItem('userId');
      const { data } = await axiosInstance.get(
        `/user-valet-view/${cId}/${ValetId}`
      );

      if (data?.success) {
        console.log("order", data);
        setOrder(data?.valet);
        setDriversAssign(data?.valet.driverId);
        const otpStartDate = data?.userOrder?.otpStartDate;
        const otpEndDate = data?.userOrder?.otpEndDate;
        // Usage
        const { hours, minutes } = await calculateTimeDuration(
          data?.userOrder?.otpStartDate,
          data?.userOrder?.otpEndDate
        );

        console.log(`Duration: ${hours} hours and ${minutes} minutes`);
        console.log(`Duration: ${hours} hours and ${minutes} minutes`);

        setcountTotalCal({ hours, minutes });
        setEditDriver(false);
        const AlldriversByVendor = async (filterIds, driversLists) => {
          setIsDLoading(true); // Set loading state to false in case of an error

          try {
            const vid = decryptdatajson._id;
            const { data } = await axiosInstance.get(
              `/all-drivers-vendor/${vid}`
            );

            if (data?.success) {
              console.log("setDriversList", data.Driver);

              const matchedDrivers = data.Driver.filter((driver) =>
                filterIds.includes(driver._id)
              );
              const unmatchedDrivers = data.Driver.filter(
                (driver) => !filterIds.includes(driver._id)
              );
              setMatchedDriversList(matchedDrivers);
              setUnmatchedDriversList(unmatchedDrivers);
              console.log("filterIds", filterIds);
              console.log("unmatchedDrivers", unmatchedDrivers);
            }
          } catch (error) {
            console.log(error);
            toast.error("order Not found");
            // navigate('/account');
          } finally {
            setIsDLoading(false); // Set loading state to false in case of an error
          }
        };
        AlldriversByVendor(data?.valet.driverId);
      }

      setIsLoading(false); // Set loading state to false after fetching data
    } catch (error) {
      console.log(error);
      setIsLoading(false); // Set loading state to false in case of an error
      toast.error("order Not found");
      // navigate('/account');
    }
  };

  const handleClickDriverChange = async (DriverId) => {
    setDLoading(true);
    console.log("DriverId", DriverId);
    try {
      await toast.promise(
        axiosInstance.put(`/update-valet-driver/${ValetId}`, {
          driverId: DriverId,
        }),
        {
          loading: "Driver assigning...", // Loading message
          success: "Driver assign success!", // Success message
          error: "Error Updated Driver", // Error message
        }
      );
    } catch (error) {
      console.error("Error Updated Driver", error);
      setDLoading(false);
    } finally {
      getUserVendorValet();
      setDLoading(false);
    }
  };

  const handleRemoveClickDriverChange = async (DriverId) => {
    setDLoading(true);
    console.log("DriverId", DriverId);
    try {
      const data = await toast.promise(
        axiosInstance.put(`/update-valet-driver/${ValetId}`, {
          driverId: DriverId,
        }),
        {
          loading: "Driver assigning...", // Loading message
          success: "Driver is not assign success!", // Success message
          error: "Error Updated Driver", // Error message
        }
      );
    } catch (error) {
      console.error("Error Updated Driver", error);
      setDLoading(false);
    } finally {
      getUserVendorValet();
      setDLoading(false);
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
        `/start-valet-request/${ValetId}`
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
      if (Order.bookingTyp === "Outstation" && Order.rideTyp === "One Way") {
        try {
          const response = await axiosInstance.get(
            `/api/find-distance/punjab/${currentLocation}`
          );

          const distanceValue = response.data.data.rows.elements.distance.text;
          const durationValue = response.data.data.rows.elements.duration.text;
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
            setDistanceValue(Order.FinalDriveKM);
            console.log("Order.FinalDriveKM", Order.FinalDriveKM);
          }
        }
      }

      // const id = localStorage.getItem('userId');
      const { data } = await axiosInstance.get(`/end-valet-request/${ValetId}`);

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

      const { data } = await axiosInstance.get(
        `/start-valet-verify/${ValetId}`
      );
      console.log("datastart", data);
      const { success, order } = data;
      if (success) {
        getUserVendorValet();
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

      const { data } = await toast.promise(
        axiosInstance.get(`/end-valet-verify/${ValetId}`),
        {
          loading: "Ending Valet...", // Loading message
          success: "Valet End Successfully!", // Success message
          error: "Failed to accept ride.", // Error message
        }
      );
      if (data) {
        console.log("datastart", data);
        const { success, order } = data;
        if (success) {
          getUserVendorValet();
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      // navigate('/account');
    } finally {
      setSubmitLoading(false);
    }
  };

  const updateValetCost = async () => {
    try {
      setSubmitLoading(true);

      await toast.promise(
        axiosInstance.put(`/update-valet-cost/${ValetId}`, formData),
        {
          loading: "Updating Valet...", // Loading message
          success: "Valet Updated!", // Success message
          error: "Failed to updated valet.", // Error message
        }
      );
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      // navigate('/account');
    } finally {
      getUserVendorValet();
      setSubmitLoading(false);
    }
  };

  // /update-valet-cost/;

  useEffect(() => {
    getUserVendorValet();
  }, []); // Empty dependency array ensures that the effect runs once after the initial render

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
                <span>Valet ID #{Order?.Valet_Id} </span>
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
                    src="/img/Valet.gif"
                    className="m-auto d-block mb-3"
                    style={{
                      borderRadius: 10,
                      border: "2px solid black",
                      aspectRatio: "347/260",
                      width: "100%",
                    }}
                  />

                  {Order?.startStatusOTP === 0 && Order?.endStatusOTP === 0 && (
                    <>
                      <span class="badge rounded-pill bg-danger px-2 py-1 ridestatus">
                        {" "}
                        <i class="ri-taxi-line fw-light fs-6"></i> Not Started
                        Yet
                      </span>
                    </>
                  )}

                  {Order?.startStatusOTP === 1 && (
                    <>
                      <span class="badge rounded-pill bg-warning px-2 py-1 ridestatus">
                        {" "}
                        <i class="ri-taxi-line fw-light fs-6"></i> Ride Started
                      </span>
                    </>
                  )}

                  {Order?.endStatusOTP === 1 && (
                    <>
                      <span class="badge rounded-pill bg-success px-2 py-1 ridestatus">
                        {" "}
                        <i class="ri-taxi-line fw-light fs-6"></i> Ride
                        Completed
                      </span>
                    </>
                  )}
                </div>
                {Order.dailyCost === 0 && (
                  <div className="mb-2 input-group input-group-icon">
                    <input
                      type="number"
                      id="dailyCost"
                      value={formData.dailyCost}
                      name="dailyCost"
                      onChange={(e) => handleChange(e)}
                      className="form-control dz-password  form-control-md"
                      placeholder="Please Enter Driver Amount"
                    />
                    <button
                      type="button"
                      class="btn me-2 btn-primary btn-sm"
                      onClick={updateValetCost}
                      disabled={SubmitLoading}
                    >
                      {!SubmitLoading ? "Submit" : "Loading..."}
                    </button>
                  </div>
                )}

                {Order.dailyCost !== 0 && Order?.startStatusOTP === 0 ? (
                  <>
                    <SlideButton
                      mainText="Slide To Start Valet"
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
                    {Order.dailyCost !== 0 && Order?.endStatusOTP === 0 && (
                      <>
                        <SlideButton
                          mainText="Slide To End Valet"
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

              <div className="card p-3 d-block bg-light">
                {!Order.driverId.length === 0 && (
                  <p className="fw-bold">
                    Not assign any driver yet <i className="ri-user-2-fill" />
                  </p>
                )}
                {IsDLoading ? (
                  <div
                    className="skeleton m-2"
                    style={{ height: 40, width: "150px" }}
                  />
                ) : (
                  Order.dailyCost !== 0 && (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <p className="fw-bold p-0 m-0">Asign Driver List</p>
                        {EditDriver ? (
                          <span
                            className="badge badge-danger cursor"
                            type="button"
                            onClick={HandleEditDriver}
                          >
                            <i className="ri-pencil-fill" /> Cancel
                          </span>
                        ) : (
                          <span
                            className="badge badge-primary cursor"
                            type="button"
                            onClick={HandleEditDriver}
                          >
                            <i className="ri-pencil-fill" /> Edit
                          </span>
                        )}
                      </div>

                      <div className="row ">
                        {MatchedDriversList.length !== 0 &&
                          MatchedDriversList.map((driver) => (
                            <div
                              key={driver.driverId}
                              className="card m-0 p-3 col-md-6"
                              style={{ transform: "scale(0.9)" }}
                            >
                              <div className="d-flex">
                                <img
                                  className="rounded me-2"
                                  src={
                                    driver.profile !== ""
                                      ? weburl +
                                        driver.profile
                                          .replace(/\\/g, "/")
                                          .replace(/^public\//, "")
                                      : "/img/user.svg"
                                  }
                                  style={{
                                    width: 50,
                                    height: 50,
                                    aspectRatio: "1 / 1",
                                    objectFit: "cover",
                                  }}
                                />
                                <div className="media-body">
                                  <p className="mt-1 mb-0 fw-bold overflowOne hover-text">
                                    {driver.username}
                                  </p>
                                  <div className="d-flex flex-row justify-content-between align-text-center" />
                                  <div className="d-flex flex-row justify-content-between align-text-center">
                                    <span className="overflowOne hover-text">
                                      {driver.address}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {EditDriver && (
                                <>
                                  <hr />
                                  <div className="d-flex justify-content-between">
                                    <button
                                      className="btn btn-sm mb-2 me-2 btn-danger w-100"
                                      type="button"
                                      onClick={() =>
                                        handleRemoveClickDriverChange(
                                          driver._id
                                        )
                                      }
                                    >
                                      Remove Driver
                                      <i className="ri-user-add-fill ms-2 " />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                      </div>
                    </>
                  )
                )}{" "}
                {EditDriver && (
                  <>
                    <hr />
                    <p className="fw-bold">Add More Driver</p>
                    <div className="row ">
                      {UnmatchedDriversList.length !== 0 ? (
                        UnmatchedDriversList.map((driver) => (
                          <div
                            key={driver.driverId}
                            className="card m-0 p-3 col-6"
                            style={{ transform: "scale(0.9)" }}
                          >
                            <div className="d-flex">
                              <img
                                className="rounded me-2"
                                src={
                                  driver.profile !== ""
                                    ? weburl +
                                      driver.profile
                                        .replace(/\\/g, "/")
                                        .replace(/^public\//, "")
                                    : "/img/user.svg"
                                }
                                style={{
                                  width: 50,
                                  height: 50,
                                  aspectRatio: "1 / 1",
                                  objectFit: "cover",
                                }}
                              />
                              <div className="media-body">
                                <p className="mt-1 mb-0 fw-bold overflowOne hover-text">
                                  {driver.username}
                                </p>
                                <div className="d-flex flex-row justify-content-between align-text-center" />
                                <div className="d-flex flex-row justify-content-between align-text-center">
                                  <span className="overflowOne hover-text">
                                    {driver.address}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between">
                              <button
                                className="btn btn-sm mb-2 me-2 btn-primary w-100"
                                type="button"
                                onClick={() =>
                                  handleClickDriverChange(driver._id)
                                }
                              >
                                Add Driver
                                <i className="ri-user-add-fill ms-2 " />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          <div>
                            <span className="badge badge-danger cursor">
                              No Driver Found...
                            </span>
                          </div>
                        </>
                      )}
                    </div>
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

              {Order.dailyCost !== 0 && (
                <div className="card">
                  <div className="card-body bg-primary text-white rounded-sm">
                    <p className="card-title opacity-1 text-white">
                      Driver Per day costing
                    </p>
                    <h4 className="card-title text-white">
                      ₹{Order.dailyCost}
                    </h4>
                  </div>
                </div>
              )}

              {/* {formatTimestamp(Order?.otpStartDate) }
 {formatTimestamp(Order?.otpEndDate) } */}

              {!StartRideStatus && <> </>}

              <div className="card p-3">
                <div className="d-flex justify-content-between">
                  <span className="badge badge-primary">
                    Valet ID : {Order?.Valet_Id}
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
                    <h5 className="mt-2 mb-0"> {Order?.userId?.username} </h5>
                    <div className="d-flex flex-row justify-content-between align-text-center">
                      <small className="text-muted">
                        {Order?.ValetLocation}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 ms-auto">
                    <a
                      className="dz-icon icon-sm icon-fill"
                      href={`tel:${Order?.details?.phone}`}
                    >
                      <i className="ri-phone-fill" />
                    </a>
                    {/* <Link
                      className="dz-icon icon-sm icon-fill"
                      to={`/vendor/chat/${Order?.userId}/${Order._id}`}
                    >
                      <i className="ri-message-3-fill" />
                    </Link> */}
                  </div>
                </div>
                <div className="row mt-2">
                  {Order.ValetAddress && (
                    <div className="col-8">
                      <b className="mb-0 fw-bold">
                        {" "}
                        <i className="ri-map-pin-2-fill text-primary" /> Full
                        Address
                      </b>
                      <p> {Order.ValetAddress} </p>
                    </div>
                  )}
                  <div className="col-4 text-end">
                    <h4>₹{Order.totalAmount}</h4>
                  </div>
                </div>
                <hr />

                <div className="col-12">
                  <div className="fs-6 text-left ">
                    <button className="btn mb-2 btn-xs btn-primary p-2 d-inline me-2">
                      <p className="p-0 m-0">
                        {" "}
                        <b className="fw-bold">No. of people</b>{" "}
                      </p>
                      <p className="p-0 m-0">
                        {Order?.ValetCount === 1 && "0 - 100"}
                        {Order?.ValetCount === 2 && "100 - 200"}
                        {Order?.ValetCount === 3 && "200 - 300"}
                        {Order?.ValetCount === 4 && "300 - 400"}
                      </p>{" "}
                    </button>
                    <button className="btn mb-2 btn-xs btn-primary p-2 d-inline me-2">
                      <p className="p-0 m-0">
                        {" "}
                        <b className="fw-bold"> Driver Requirement</b>{" "}
                      </p>
                      <p className="p-0 m-0"> {Order?.ValetCount * 5}</p>{" "}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <LiveValet />
      </main>
    </>
  );
};

export default ValetVendorView;
