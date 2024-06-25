import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance, { weburl } from "../axiosInstance";
import LiveRides from "./components/LiveRides";
import SlideButton from "react-slide-button";
import getDecryptData from "../helper/getDecryptData";

const ValetDriverPark = () => {
  const MAPKEY = import.meta.env.VITE_REACT_APP_MAP_KEY;

  const decryptdatajson = getDecryptData();
  const [ValetData, setValetData] = useState([]);

  const [SubmitLoading, setSubmitLoading] = useState(false);
  const [SubmitLoadingRide, setSubmitLoadingRide] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const isMounted = useRef(true); // To track if component is mounted

  const { ValetId } = useParams(); // Assuming you have valetId as a param

  useEffect(() => {
    // Cleanup function to set isMounted to false when unmounting
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      setLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAPKEY}`
          )
            .then((response) => response.json())
            .then((data) => {
              if (isMounted.current) {
                const address = data.results[0].formatted_address;
                setCurrentLocation(address);
                setLocationLoading(false);
                resolve(address); // Resolve with the fetched address
              }
            })
            .catch((error) => {
              console.error("Error fetching current location:", error);
              setLocationLoading(false);
              reject(error); // Reject the promise with the error
            });
        },
        (error) => {
          console.error("Error getting user location:", error);
          setLocationLoading(false);
          reject(error); // Reject the promise with the error
        }
      );
    });
  };

  const fetchvaletDetails = async () => {
    const dId = decryptdatajson._id;
    try {
      setSubmitLoadingRide(false);
      const { data } = await axiosInstance.get(
        `/driver-valet-ride-view/${dId}/${ValetId}`
      );

      if (data?.success) {
        console.log("Valet Ride driver", data);
        setValetData(data.valet);
      }
    } catch (error) {
      console.log(error);
      toast.error("Valet Not found");
      // navigate('/account');
    } finally {
      setSubmitLoadingRide(true);
    }
  };

  const handleStartParking = async () => {
    const location = await fetchCurrentLocation();

    try {
      if (ValetData.PickupStartLocation) {
        if (ValetData.PickupEndLocation) {
          if (ValetData.DropStartLocation) {
            await toast.promise(
              axiosInstance.put(`/update-valet-ride/${ValetId}`, {
                // Assuming you need to send `location` to the server
                DropEndLocation: location,
              }),
              {
                loading: "Start delivered the car...", // Loading message
                success: "Driver delivered the car!", // Success message
                error: "Failed To driver delivered the car.", // Error message
              }
            );
          } else {
            await toast.promise(
              axiosInstance.put(`/update-valet-ride/${ValetId}`, {
                // Assuming you need to send `location` to the server
                DropStartLocation: location,
              }),
              {
                loading: "Start picked the car...", // Loading message
                success: "Driver picked the car from parking", // Success message
                error: "Failed To Bring Back.", // Error message
              }
            );
          }
        } else {
          await toast.promise(
            axiosInstance.put(`/update-valet-ride/${ValetId}`, {
              // Assuming you need to send `location` to the server
              PickupEndLocation: location,
            }),
            {
              loading: "Start Parking Now...", // Loading message
              success: "Car Parked!", // Success message
              error: "Failed To Car Parking.", // Error message
            }
          );
        }
      } else {
        await toast.promise(
          axiosInstance.put(`/update-valet-ride/${ValetId}`, {
            // Assuming you need to send `location` to the server
            PickupStartLocation: location,
          }),
          {
            loading: "Staring Parking...", // Loading message
            success: "Parking Mode Start!", // Success message
            error: "Failed To Staring Parking.", // Error message
          }
        );
      }
      fetchCurrentLocation();
      fetchvaletDetails();
    } catch (error) {
      console.log(error);
      toast.error("Valet Not found");
      // navigate('/account');
    }
  };

  useEffect(() => {
    fetchCurrentLocation();
    fetchvaletDetails();
  }, []); // Fetch location on initial render

  return (
    <>
      <header className="header header-fixed">
        <div className="header-content">
          <div className="left-content">
            <Link
              to={
                ValetData
                  ? `/driver/valet/${ValetData?.Valet_Model?._id}`
                  : `/driver/valet`
              }
              className="back-btn"
            >
              <i className="ri-arrow-left-line"></i>
            </Link>
          </div>
          <div className="mid-content">
            <h5 className="title d-flex px-2 justify-content-center">
              {" "}
              {SubmitLoadingRide ? (
                <>
                  <span className="overflowOne ">
                    {" "}
                    {ValetData.userId?.carName}{" "}
                  </span>
                </>
              ) : (
                <>
                  <div
                    className="skeleton m-auto mb-3 "
                    style={{ height: 35, width: "80%" }}
                  />
                </>
              )}
            </h5>
          </div>
          <div className="right-content d-flex align-items-center gap-4"></div>
        </div>
      </header>
      <main className="page-content space-top p-b40">
        <div className="container">
          {SubmitLoadingRide ? (
            <>
              <div className="tag-road">
                <div
                  className={`roadbg ${
                    (ValetData.PickupStartLocation !== "") &
                      (ValetData.PickupEndLocation === "") ||
                    ((ValetData.DropStartLocation !== "") &
                      (ValetData.DropEndLocation === "") &&
                      "move")
                  }   ${
                    !ValetData.PickupStartLocation
                      ? " "
                      : !ValetData.PickupEndLocation
                      ? "move "
                      : !ValetData.DropStartLocation
                      ? "parked"
                      : !ValetData.DropEndLocation
                      ? "move"
                      : "delivered"
                  }`}
                />
                <div className="car-container">
                  <img src="/img/car-png.webp" alt="car" className="carimg" />
                  <div className="plate"> {ValetData.userId?.carNumber} </div>
                </div>

                {/* <div className="pole text-white bg-danger "> No Parking</div> */}

                <div className="fade"></div>
              </div>
              <div className="bg-light">
                <table className="table table-bordered mt-2 ">
                  <thead className="thead-dark">
                    <tr>
                      <th className="bg-primary text-white" scope="col">
                        Car Name
                      </th>
                      <th className="bg-primary  text-white" scope="col">
                        Car Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td scope="row">{ValetData.userId?.carName}</td>
                      <td>
                        {" "}
                        <span
                          className={`badge mb-2 fs-10 ms-2 ${
                            (ValetData && ValetData.userId?.carName === "") &
                            (ValetData && ValetData.userId?.carNumber === "")
                              ? "badge-danger cursor"
                              : !ValetData.PickupStartLocation
                              ? " badge-danger"
                              : !ValetData.PickupEndLocation
                              ? "badge-warning"
                              : !ValetData.DropStartLocation
                              ? "badge-primary"
                              : !ValetData.DropEndLocation
                              ? "badge-warning"
                              : "badge-primary"
                          }
                                
                                fw-light `}
                        >
                          {!ValetData.PickupStartLocation
                            ? "Waiting for Driver.."
                            : !ValetData.PickupEndLocation
                            ? "Driver started towards parking "
                            : !ValetData.DropStartLocation
                            ? "Driver parked the car"
                            : !ValetData.DropEndLocation
                            ? "Driver picked the car from parking"
                            : "Driver delivered the car"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="col-8 m-auto mt-2">
                {!ValetData.DropEndLocation && (
                  <SlideButton
                    mainText={
                      ValetData.PickupStartLocation
                        ? ValetData.PickupEndLocation
                          ? ValetData.DropStartLocation
                            ? "Slide To Delivered The Car"
                            : "Slide To Bring Back"
                          : "Slide To End Parked"
                        : "Slide To start Parking"
                    }
                    overlayText={
                      SubmitLoading
                        ? "Loading..."
                        : ValetData.PickupStartLocation
                        ? ValetData.PickupEndLocation
                          ? ValetData.DropStartLocation
                            ? "Driver Delivered The Car"
                            : "Driver bring back the car"
                          : "Driver End Parked"
                        : "Driver start Parking"
                    }
                    classList="my-class mb-2 startride"
                    caretClassList="my-caret-class"
                    overlayClassList="my-overlay-class"
                    onSlideDone={handleStartParking}
                  />
                )}
              </div>

              <button
                className="btn btn-primary mt-3 d-none"
                onClick={fetchCurrentLocation}
                disabled={locationLoading}
              >
                {locationLoading
                  ? "Fetching Location..."
                  : "Refetch Current Location"}
              </button>

              <p className="mt-2 d-none">Current Location: {currentLocation}</p>
            </>
          ) : (
            <>
              <div
                className="skeleton m-auto mb-3 "
                style={{ height: "60vh", width: "95%" }}
              />

              <div
                className="skeleton m-auto mb-3 "
                style={{ height: 45, width: "95%", maxWidth: "300px" }}
              />
            </>
          )}
        </div>

        <LiveRides />
      </main>
    </>
  );
};

export default ValetDriverPark;
