import React, { useEffect, useState, useRef } from "react";
import { useBlogContext } from "../../fetchdata/BlogContext";
import axiosInstance from "../../axiosInstance";
import messageAlertSound from "../../assets/audio/message.mp3";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import getDecryptData from "../../helper/getDecryptData";

const LiveValet = () => {
  const decryptdatajson = getDecryptData();

  const DriverId = decryptdatajson._id;

  const { AllRideReq, removeRide, showOffline } = useBlogContext();
  const [Loading, setLoading] = useState(true);
  const [Mybooking, setMybooking] = useState([]);
  const [FoundRide, setFoundRide] = useState(false);

  useEffect(() => {
    const fetchLiveRides = async () => {
      if (AllRideReq && AllRideReq.length !== 0) {
        const sound = new Audio(messageAlertSound);
        sound.play();

        setFoundRide(true);
        setLoading(true);
        try {
          const response = await axiosInstance.get(
            `/get-all-valet/${DriverId}`
          );
          const { success, Bookings } = response.data;
          console.log("live data", Bookings);
          const reversedBookings = Bookings.reverse();

          setMybooking(Bookings);
        } catch (error) {
          console.error("Error during login:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLiveRides();
  }, [AllRideReq]);

  const navigate = useNavigate();

  const AcceptRide = async (orderId) => {
    const driverId = decryptdatajson._id;
    const Ridedata = { orderId, driverId };
    try {
      const response = await axiosInstance.post("/accept-valet", Ridedata);
      const { success } = response.data;
      console.log("accept data", response);
      if (success) {
        removeRide();
        navigate("/driver/rides");
      }
    } catch (error) {
      console.error("Error accept Order:", error);
      toast.error(error.response.data.message);
    }
  };

  const CloseFoundRide = () => {
    console.log("close");
    setFoundRide(false);
    removeRide();
  };

  return (
    <>
      {!showOffline && FoundRide && (
        <>
          <div
            className="toast fade show my-toast-ride bg-light"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            data-bs-delay={3000}
            data-bs-autohide="false"
          >
            <div className="toast-header ">
              <i class="ri-taxi-fill text-primary fs-5"></i>
              <strong className="me-auto ms-2">Ride Request</strong>
              <small>1 min ago</small>
              <button
                className="btn btn-close position-relative p-1"
                type="button"
                onClick={CloseFoundRide} // Change onclick to onClick
              >
                <i class="ri-close-line"></i>
              </button>
            </div>
            <div className="toast-body">
              {Loading ? (
                <>
                  <div className="card p-3">
                    <h4>Searching Ride.....</h4>
                  </div>
                </>
              ) : (
                <>
                  {Mybooking.slice(-1).map((booking, index) => (
                    <div className="card p-3" key={index}>
                      <div className="d-flex">
                        <img
                          className="rounded me-2"
                          src="/img/2.jpg"
                          style={{ width: 50, height: "auto" }}
                        />
                        <div className="media-body">
                          <h5 className="mt-2 mb-0">
                            {booking?.userId[0]?.username}
                          </h5>
                          <div className="d-flex flex-row justify-content-between align-text-center">
                            <small className="text-muted">
                              {booking.PickupLocation}
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="row mt-2">
                        <div className="col-6">
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
                        <div className="col-6 text-end">
                          <h4>₹{booking.totalAmount}</h4>
                        </div>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <button
                          type="button"
                          className="btn btn-sm mb-2 me-2 btn-danger"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => AcceptRide(booking._id)}
                          className="btn btn-sm mb-2 me-2 btn-primary"
                        >
                          Accept <i className="ri-arrow-right-line ms-2" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="text-center">
                    <Link
                      className="btn btn-primary btn-sm m-auto"
                      to="/driver/home"
                      onClick={CloseFoundRide} // Change onclick to onClick
                    >
                      {" "}
                      <i class="ri-route-fill me-1"></i> All Rides
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default LiveValet;
