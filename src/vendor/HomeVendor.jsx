import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import VendorHeader from "./includes/VendorHeader";
import VendorNavbar from "./includes/VendorNavbar";
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

const HomeVendor = () => {
  // ride code start

  const { AllRideReq, removeRide, getUserData } = useBlogContext();
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
        const response = await axiosInstance.get(`/get-all-valet/${userId}`);
        const { success, Valet } = response.data;
        console.log("live data", response);

        if (success) {
          const reversedBookings = Valet.reverse();
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

  const AcceptRide = async (valetId) => {
    const vendorId = decryptdatajson._id;
    setButtonLoading(true);
    const Ridedata = { valetId, vendorId };
    try {
      const response = await toast.promise(
        axiosInstance.post("/accept-valet", Ridedata),
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
      <VendorHeader />

      <main className="page-content mypadding bg-white p-b60">
        <div className="container px-0 ">
          <h4 className="mt-3">
            {" "}
            All Valet Request <i className="ri-route-fill"></i>{" "}
            <Link
              to="/vendor/add-driver"
              className="btn btn-primary cursor btn-sm ms-2 px-2"
            >
              <i className="ri-steering-2-fill me-2"></i> Add Driver
            </Link>
          </h4>

          <div className="col-12">
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
                      <h5 className="mt-2 mb-0">{booking?.userId?.username}</h5>
                      <div className="d-flex flex-row justify-content-between align-text-center">
                        <span className="overflowOne">
                          {booking.ValetLocation}
                        </span>
                      </div>
                    </div>

                    <div className=" ms-auto">
                      <p
                        className="fs-4 fw-bold"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        ₹{booking.totalAmount}
                      </p>
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
                          {booking?.ValetCount === 1 && "0 - 100"}
                          {booking?.ValetCount === 2 && "100 - 200"}
                          {booking?.ValetCount === 3 && "200 - 300"}
                          {booking?.ValetCount === 4 && "300 - 400"}
                        </p>{" "}
                      </button>
                      <button className="btn mb-2 btn-xs btn-primary p-2 d-inline me-2">
                        <p className="p-0 m-0">
                          {" "}
                          <b className="fw-bold"> Driver Requirement</b>{" "}
                        </p>
                        <p className="p-0 m-0"> {booking?.ValetCount * 5}</p>{" "}
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
                <div
                  className=" p-4 border rounded text-center"
                  style={{ background: "#fbfbfb" }}
                >
                  <img src="/img/Valet.gif" width="300" />
                  {!Loading ? (
                    <p className="text-muted fs-4 text-center mt-4">
                      <i className="ri-error-warning-fill text-danger"></i> No
                      Valet Found
                    </p>
                  ) : (
                    <p className="text-muted fs-4 text-center mt-4">
                      <i className="ri-search-2-line"></i>
                      Searching Valet Request
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <VendorNavbar />
    </>
  );
};

export default HomeVendor;
