import React, { useState, useEffect, useContext, Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../axiosInstance";
import getDecryptData from "../helper/getDecryptData";

const Success = () => {
  const decryptdatajson = getDecryptData();
  const [Order, setOrder] = useState([]);
  const [UserData, setUserData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const isLoginFromLocalStorage = localStorage.getItem("token") ? true : false;
  const [isLogin, setIsLogin] = useState(isLoginFromLocalStorage);

  const [isLoginForm, setIsLoginForm] = useState(true); // State to manage which form to display

  const toggleForm = () => {
    setIsLoginForm((prevState) => !prevState); // Toggle between login and signup forms
  };

  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const getUserOrders = async () => {
    try {
      const id = decryptdatajson._id;

      const { data } = await axiosInstance.get(`/user-orders/${id}`);
      console.log(data);
      if (data?.success) {
        setOrder(data?.userOrder.orders ?? []);
        setUserData(data?.userOrder ?? []);
      }
      setIsLoading(false); // Set loading state to false after fetching data
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserOrders();
  }, []);

  return (
    <>
      <header className="header header-fixed" data-aos="fade-down">
        <div className="header-content">
          <div className="left-content">
            <Link to="/" className="back-btn">
              <i className="ri-arrow-left-line"></i>
            </Link>
          </div>
          <div className="mid-content">
            <h4 className="title">Ride Booked</h4>
          </div>
          <div className="right-content d-flex align-items-center gap-4"></div>
        </div>
      </header>

      <main className="page-content space-top dz-gradient-shape">
        <div className="container">
          <div
            className="location-tracking bg-white"
            style={{ height: "70vh" }}
          >
            {/* Map */}

            {Order && Order.length > 0 ? (
              <>
                <img
                  src="/img/success.gif"
                  className="d-block m-auto"
                  style={{ maxWidth: "300px", width: "100%" }}
                />

                <div className="dz-tracking">
                  <div className="delivery-man bg-primary">
                    <div className="inner-content">
                      <div className="dz-media media-50 rounded-circle">
                        <img src="/img/2.jpg" alt="" />
                      </div>
                      <div className="dz-content">
                        <h6 className="title">{UserData?.username}</h6>
                        <p className="text-white">Booking ID: 2445556</p>
                      </div>

                      <div className="icon-area">
                        <Link
                          className="btn btn-primary btn-xs font-13 btn-thin rounded-xl me-2"
                          to="/rides"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          Track{" "}
                          <span className="d-none d-md-block ms-1">
                            {" "}
                            Booking{" "}
                          </span>{" "}
                        </Link>

                        <Link
                          className="btn btn-secondary btn-xs btn-thin rounded-xl fw-bold px-2"
                          to="/"
                        >
                          <i className="ri-home-3-fill font-18 " />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="fixed-content">
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
                          <p className="p-0 m-0 overflowOne mb-2">
                            {Order[0]?.PickupLocation}
                          </p>
                        </div>
                        <hr className="p-0 m-0" />
                        <div className="mb-2 input-group input-group-icon mt-1">
                          <p className="p-0 m-0 overflowOne mt-2">
                            {Order[0]?.DestinationLocation}
                          </p>

                          <div />
                        </div>
                        <div className="px-3" />
                      </div>
                    </div>

                    <hr className="p-0 m-0" />

                    <div className="mt-2">
                      <div className="row">
                        <div className="col-12">
                          <div className="fs-6 text-left ">
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
                                <b className="fw-bold">
                                  Scheduled date :{" "}
                                </b>{" "}
                                {Order[0]?.pickupDate}{" "}
                              </p>
                              <p className="p-0 m-0">
                                {" "}
                                <b className="fw-bold">
                                  Scheduled Time :{" "}
                                </b>{" "}
                                {Order[0]?.pickupTime}{" "}
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
                                {Order[0]?.pickupTime} Hour{" "}
                              </p>
                            </button>

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

                            <button className="btn mb-2 btn-xs btn-secondary p-2 d-inline text-start me-2">
                              <p className="p-0 m-0">
                                {" "}
                                <b className="fw-bold"> Book Type</b>{" "}
                              </p>
                              <p className="p-0 m-0">
                                {" "}
                                {Order[0]?.bookingTyp}{" "}
                              </p>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="loading-box text-center d-flex flex-column">
                  <i
                    className="ri-loader-2-line spin"
                    style={{ fontSize: 80, color: "white" }}
                  />
                  <h4 className="text-white">
                    {" "}
                    Fetching YOUR ORDER Please wait ....
                  </h4>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Success;
