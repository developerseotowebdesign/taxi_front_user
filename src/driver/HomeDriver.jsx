import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import DriverHeader from "./includes/DriverHeader";
import DriverNavbar from "./includes/DriverNavbar";
import LiveRides from "./components/LiveRides";
import maplayout from "../helper/MapStyle";
import { useBlogContext } from "../fetchdata/BlogContext";
import axiosInstance from "../axiosInstance";
import messageAlertSound from "../assets/audio/message.mp3";
import Swal from "sweetalert2"; // Import SweetAlert2
import withReactContent from "sweetalert2-react-content"; // Import React components for SweetAlert2
import getDecryptData from "../helper/getDecryptData";

const MySwal = withReactContent(Swal); // Create a SweetAlert2 instance with React components

const currentIcon = {
  url: "/img/dot.svg", // URL of the car icon image
  scaledSize: { width: 40, height: 40 }, // Set the desired size here (width, height)
};

const HomeDriver = () => {
  const { getUserData, showOffline } = useBlogContext();

  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    const location = localStorage.getItem("selectedLocation");
    if (location) {
      setSelectedLocation(location);
    } else {
      // toast.error('Please Select Location')
    }
  }, []);

  useEffect(() => {
    const loadMapScript = () => {
      if (selectedLocation !== "") {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDYsdaR0zrPsBDeuyCKFH_4PuCUyWcQ2mE&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        window.initMap = initMap;
        document.body.appendChild(script);
      }
    };

    loadMapScript();

    return () => {
      window.initMap = null;
    };
  }, [selectedLocation]);

  // Function to initialize the map
  const initMap = () => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 0, lng: 0 }, // Default center
      zoom: 15, // Default zoom level
      disableDefaultUI: true, // Disable default UI controls
      styles: maplayout,
    });
    if (selectedLocation !== "") {
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

  // ride code start

  const { AllRideReq, removeRide } = useBlogContext();
  const [Loading, setLoading] = useState(true);
  const [Mybooking, setMybooking] = useState([]);

  const decryptdatajson = getDecryptData();

  const [ButtonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchLiveRides = async () => {
      const userId = decryptdatajson._id;

      if (AllRideReq && AllRideReq.length !== 0) {
        toast.success("New Ride Request ");
        const sound = new Audio(messageAlertSound);
        sound.play();
        removeRide();
      }

      setLoading(true);
      try {
        const response = await axiosInstance.get(`/get-all-ride/${userId}`);
        const { success, Bookings } = response.data;
        console.log("live data", Bookings);

        if (success) {
          const reversedBookings = Bookings.reverse();
          setMybooking(reversedBookings);
        } else {
          setMybooking([]);
        }
      } catch (error) {
        console.error("Error during login:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveRides();
  }, [AllRideReq]);

  const navigate = useNavigate();

  const AcceptRide = async (orderId) => {
    const driverId = decryptdatajson._id;
    setButtonLoading(true);
    const Ridedata = { orderId, driverId };
    try {
      const response = await toast.promise(
        axiosInstance.post("/accept-order", Ridedata),
        {
          loading: "Accepting ride...", // Loading message
          success: "Ride accepted!", // Success message
          error: "Failed to accept ride.", // Error message
        }
      );
      if (response) {
        const { success } = response.data;
        console.log("accept data", response);
        if (success) {
          removeRide();
          navigate("/driver/rides");
          getUserData();
        }
      }
    } catch (error) {
      console.error("Error accept Order:", error);
      toast.error(error.response.data.message);
    } finally {
      setButtonLoading(false);
    }
  };

  // Function to handle delete
  const RejectRide = (orderId) => {
    const driverId = decryptdatajson._id;
    const Ridedata = { orderId, driverId };

    MySwal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this Booking!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
      customClass: {
        popup: "custom-swal-popup", // Add a class to the entire dialog
        confirmButton: "btn-danger", // Add a class to the confirm button
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance
          .post("/reject-order", Ridedata)

          .then(() => {
            // Refresh the data or update the state after successful deletion
            toast.success("Booking Reject success!");
            removeRide();
          })
          .catch((error) => {
            console.error("Error Taxes data:", error);
            toast.error(error.response.data.message);
          });
      }
    });
  };

  return (
    <>
      <DriverHeader />

      <main className="page-content mypadding bg-white p-b60">
        <div className="container px-0 ">
          <div
            id="map"
            style={{ height: "40vh", width: "100%" }}
            className="rounded-md"
          >
            <div
              style={{ height: "50vh", width: "100%" }}
              className="d-flex justify-content-center align-items-center flex-column"
            >
              <i className="ri-error-warning-fill fs-1 text-warning"></i>
              <p className="fs-3">Location Not Found</p>
            </div>
          </div>

          <h4 className="mt-3">
            {" "}
            All Rides Request <i className="ri-route-fill"></i>
          </h4>

          <div className="col-12">
            {showOffline ? (
              <>
                <div className="bg-light p-4 border rounded">
                  <img
                    src="/img/pin.png"
                    width="50px"
                    className="m-auto d-block drop-shadow opacity-75"
                  />
                  <p className="text-muted fs-4 text-center mt-4">
                    You Seems To be Offline
                  </p>
                </div>
              </>
            ) : Loading || ButtonLoading ? (
              <>
                <div
                  className="skeleton mb-2"
                  style={{ height: 150, width: "100%" }}
                />
                <div
                  className="skeleton mb-2"
                  style={{ height: 150, width: "100%" }}
                />

                <div
                  className="skeleton mb-2"
                  style={{ height: 150, width: "100%" }}
                />

                <div
                  className="skeleton mb-2"
                  style={{ height: 150, width: "100%" }}
                />
              </>
            ) : (
              <>
                {Mybooking.length !== 0 ? (
                  Mybooking !== undefined &&
                  Mybooking.map((booking, index) => (
                    <div className="card p-3 col-12" key={index}>
                      <div className="d-flex gap-2">
                        <img
                          className="rounded me-2"
                          src="/img/2.jpg"
                          style={{ width: 50, height: "auto" }}
                        />
                        <div className="media-body">
                          <h5 className="mt-2 mb-0">
                            {booking?.userId?.username}
                          </h5>
                          <div className="d-flex flex-row justify-content-between align-text-center">
                            <small className="text-muted">
                              {booking.PickupLocation}
                            </small>
                          </div>
                        </div>

                        <div className=" ms-auto">
                          <p style={{ whiteSpace: "nowrap" }}>
                            <i className="ri-road-map-fill"></i>{" "}
                            {booking.BookingDistance}{" "}
                          </p>
                        </div>
                      </div>
                      <div className="row mt-2">
                        <div className="col-8">
                          <div className="d-flex">
                            <i className="ri-map-pin-2-fill me-2 text-primary" />
                            <span className="overflowOne">
                              {booking.PickupLocation}
                            </span>
                          </div>
                          <div className="d-flex">
                            <i className="ri-map-pin-range-fill  me-2" />
                            <span className="overflowOne">
                              {booking.DestinationLocation}
                            </span>
                          </div>
                        </div>
                        <div className="col-4 text-end">
                          <h4 className="fs-6">₹{booking.totalAmount}</h4>
                        </div>
                      </div>
                      <hr />

                      <div className="col-12">
                        <div className="fs-6 text-left ">
                          <button className="btn mb-2 btn-xs btn-primary p-2 d-inline me-2">
                            <p className="p-0 m-0">
                              {" "}
                              <b className="fw-bold">Car Type</b>{" "}
                            </p>
                            <p className="p-0 m-0"> {booking?.CarType} </p>{" "}
                          </button>

                          <button className="btn mb-2 btn-xs btn-primary p-2 d-inline text-start me-2">
                            <p className="p-0 m-0">
                              {" "}
                              <b className="fw-bold">Scheduled date : </b>{" "}
                              {booking?.pickupDate}{" "}
                            </p>
                            <p className="p-0 m-0">
                              {" "}
                              <b className="fw-bold">Scheduled Time : </b>{" "}
                              {booking?.pickupTime}{" "}
                            </p>
                          </button>

                          <button className="btn mb-2 btn-xs btn-primary p-2 d-inline text-start me-2">
                            <p className="p-0 m-0">
                              {" "}
                              <b className="fw-bold">
                                Driver Service Hours{" "}
                              </b>{" "}
                            </p>
                            <p className="p-0 m-0">
                              {" "}
                              {booking?.DriveHR || 0} Hour{" "}
                            </p>
                          </button>

                          <button className="btn mb-2 btn-xs btn-secondary p-2 d-inline text-start me-2">
                            <p className="p-0 m-0">
                              {" "}
                              <b className="fw-bold"> payment Type</b>{" "}
                            </p>
                            <p className="p-0 m-0"> {booking?.mode} </p>
                          </button>

                          <button className="btn mb-2 btn-xs btn-secondary p-2 d-inline text-start me-2">
                            <p className="p-0 m-0">
                              {" "}
                              <b className="fw-bold"> Ride Type</b>{" "}
                            </p>
                            <p className="p-0 m-0"> {booking?.rideTyp} </p>
                          </button>
                        </div>
                      </div>

                      <hr />
                      <div className="d-flex justify-content-between">
                        <button
                          type="button"
                          className="btn btn-sm mb-2 me-2 btn-danger"
                          onClick={() => RejectRide(booking._id)}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => AcceptRide(booking._id)}
                          type="button"
                          className="btn btn-sm mb-2 me-2 btn-primary"
                        >
                          Accept <i className="ri-arrow-right-line ms-2" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-light p-4 border rounded text-center">
                      <i class="ri-phone-find-line fs-2"></i>
                      <p className="text-muted fs-4 text-center mt-4">
                        No Ride Found
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <DriverNavbar />
    </>
  );
};

export default HomeDriver;
