import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import NavBar from "./includes/NavBar";
import axiosInstance from "../axiosInstance";
import getCookie from "../helper/getCookie";
import getDecryptData from "../helper/getDecryptData";

const Ride = () => {
  const [Order, setOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [OrderPlace, setOrderPlace] = useState("");
  const [MYuser, setMYuser] = useState("");

  const [RideView, setRideView] = useState(0);

  const ClickView0 = async () => {
    setRideView(0);
    window.scrollTo(0, 0);
  };

  const ClickView1 = async () => {
    setRideView(1);
    window.scrollTo(0, 0);
  };

  const ClickView2 = async () => {
    setRideView(2);
    window.scrollTo(0, 0);
  };

  const ClickView3 = async () => {
    setRideView(3);
    window.scrollTo(0, 0);
  };

  const decryptdatajson = getDecryptData();
  const id = decryptdatajson._id;

  const getUserOrders = async () => {
    try {
      const { data } = await axiosInstance.get(`/user-orders/${id}`);
      if (data?.success) {
        setOrder(data?.userOrder.orders);
        setOrderPlace(data?.userOrder.orders.length);
        console.log(data);
      }
      setIsLoading(false); // Set loading state to false after fetching data
    } catch (error) {
      console.log(error);
      setIsLoading(false); // Set loading state to false in case of an error
    }
  };

  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  useEffect(() => {
    getUserOrders();
  }, []); // Empty dependency array ensures that the effect runs once after the initial render

  const OrderCard = ({ order }) => (
    <li>
      <div className="card p-3">
        <div className="d-flex justify-content-between">
          <span className="badge badge-primary">
            Booking ID :{order.orderId}{" "}
          </span>

          <span className="badge badge-primary">
            Date : {formatDate(order.createdAt)}{" "}
          </span>
        </div>

        <hr />
        {order.driverId !== undefined ? (
          <div className="d-flex">
            <img
              className="rounded me-2"
              src="/img/2.jpg"
              style={{ width: 50, height: "auto" }}
            />

            <div className="media-body">
              <h5 className="mt-2 mb-0"> {order.driverId?.username} </h5>
              <div className="d-flex flex-row justify-content-between align-text-center">
                {(() => {
                  const { startStatusOTP, endStatusOTP } = order;
                  const statusMap = [
                    {
                      condition: startStatusOTP === 0 && endStatusOTP === 0,
                      class: "bg-danger",
                      text: "Not Started Yet",
                    },
                    {
                      condition: startStatusOTP === 1 && endStatusOTP === 0,
                      class: "bg-warning",
                      text: "Ride Started",
                    },
                    {
                      condition: startStatusOTP === 1 && endStatusOTP === 1,
                      class: "bg-success",
                      text: "Ride Completed",
                    },
                  ];

                  const status = statusMap.find((status) => status.condition);
                  return status ? (
                    <span
                      className={`badge rounded-pill ${status.class} px-2 py-1`}
                    >
                      <i className="ri-taxi-line fw-light fs-6"></i>{" "}
                      {status.text}
                    </span>
                  ) : null;
                })()}
              </div>
            </div>

            <div className="d-flex gap-2 ms-auto">
              <Link
                to={`tel:${order.driverId?.phone}`}
                className="dz-icon icon-sm icon-fill"
              >
                <i className="ri-phone-fill"></i>
              </Link>

              <Link
                to={`/chat/${order.driverId?._id}/${order._id}`}
                className="dz-icon icon-sm icon-fill"
              >
                <i className="ri-message-3-fill"></i>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="alert alert-warning solid alert-dismissible fade show">
              <i className="ri-error-warning-fill text-white fs-4"></i>
              <strong className="fs-6">
                {" "}
                Waiting For Driver To Accept ....
              </strong>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
                aria-label="btn-close"
              >
                <i className="ri-close-line text-white"></i>
              </button>
            </div>
          </>
        )}

        <div className="row mt-2">
          <div className="col-8">
            <div className="d-flex">
              <i className="ri-map-pin-2-fill me-2 text-primary"></i>
              <span className="overflowOne hover-text">
                {" "}
                {order.PickupLocation}{" "}
              </span>
            </div>

            <div className="d-flex">
              <i className="ri-map-pin-range-fill  me-2"></i>
              <span className="overflowOne hover-text">
                {" "}
                {order.DestinationLocation}{" "}
              </span>
            </div>
          </div>

          <div className="col-4 text-end">
            <h4>₹{order.totalAmount}</h4>
          </div>
        </div>
        <hr />
        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-sm mb-2 me-2 btn-danger">
            Cancel
          </button>

          <Link
            to={`/ride/${id}/${order._id}/`}
            className="btn btn-sm mb-2 me-2 btn-primary"
          >
            View <i className="ri-arrow-right-line ms-2"></i>
          </Link>
        </div>
      </div>
    </li>
  );

  const navTabs = [
    { label: "All", view: 0, onClick: ClickView0 },
    { label: "Pending", view: 1, onClick: ClickView1 },
    { label: "Ongoing", view: 2, onClick: ClickView2 },
    { label: "Completed", view: 3, onClick: ClickView3 },
  ];

  const filteredOrders = (view) => {
    switch (view) {
      case 1:
        return Order.filter(
          (order) => order?.startStatusOTP === 0 && order?.endStatusOTP === 0
        );
      case 2:
        return Order.filter(
          (order) => order?.startStatusOTP === 1 && order?.endStatusOTP === 0
        );
      case 3:
        return Order.filter(
          (order) => order?.startStatusOTP === 1 && order?.endStatusOTP === 1
        );
      default:
        console.log("Order", Order);
        return Order;
    }
  };

  return (
    <>
      <header className="header header-fixed ">
        <div className="header-content">
          <div className="left-content">
            <Link to="/" className="back-btn">
              <i className="ri-arrow-left-line"></i>
            </Link>
          </div>
          <div className="mid-content">
            <h4 className="title">My Rides</h4>
          </div>
          <div className="right-content d-flex align-items-center gap-4">
            <Link to="/"></Link>
          </div>
        </div>
      </header>
      <main className="page-content  pt-5  mypadding">
        <div className="container pt-0">
          <div className="default-tab style-2 mt-1">
            {/* <ul className="nav nav-tabs bg-white" role="tablist">
          <li className="nav-item bg-white rounded-xl" role="presentation">
            <a
              className="nav-link active"
              data-bs-toggle="tab"
              href="#home"
              aria-selected="true"
              role="tab"
            >
              Ongoing
            </a>
          </li>
          <li className="nav-item bg-white rounded-xl" role="presentation">
            <a
              className=" nav-link"
              data-bs-toggle="tab"
              href="#profile"
              aria-selected="false"
              role="tab"
              tabIndex={-1}
            >
              Completed
            </a>
          </li>
        </ul> */}

            <ul className="nav nav-tabs " role="tablist">
              {navTabs.map((tab, index) => (
                <li
                  key={index}
                  className="nav-item bg-white rounded-xl"
                  role="presentation"
                >
                  <button
                    type="button"
                    onClick={tab.onClick}
                    className={`btn-sm fs-7 nav-link ${
                      RideView === tab.view && "active"
                    } w-100`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="tab-content pt-5 mt-5">
              <div
                className="tab-pane mt-2 fade active show"
                id="home"
                role="tabpanel"
              >
                <ul className="featured-list mt-5 pt-3">
                  {isLoading ? (
                    // Display loading skeletons while data is being fetched
                    Array.from({ length: 4 }).map((_, index) => (
                      <li>
                        {" "}
                        <div className="col-md-12" key={index}>
                          <div
                            className="skeleton mb-3"
                            style={{ height: 154, borderRadius: 10 }}
                          />
                        </div>{" "}
                      </li>
                    ))
                  ) : (
                    <>
                      {filteredOrders(RideView).map((order) => (
                        <OrderCard key={order._id} order={order} />
                      ))}
                    </>
                  )}
                </ul>
              </div>
              <div className="tab-pane mt-2 fade " id="profile" role="tabpanel">
                <ul className="featured-list mt-5 pt-3">
                  <li>
                    <div className="card p-3">
                      <div className="d-flex">
                        <img
                          className="rounded me-2"
                          src="/img/2.jpg"
                          style={{ width: 50, height: "auto" }}
                        />

                        <div className="media-body">
                          <h5 className="mt-2 mb-0">Karan Yadav</h5>
                          <div className="d-flex flex-row justify-content-between align-text-center">
                            <small className="text-muted">Delhi India</small>
                          </div>
                        </div>

                        <div className="d-flex gap-2 ms-auto"></div>
                      </div>
                      <div className="row mt-2">
                        <div className="col-6">
                          <div className="d-flex">
                            <i className="ri-map-pin-2-fill me-2 text-primary"></i>
                            <span className="overflowOne">
                              {" "}
                              2, Janta Market, Rajouri Garden, New Delhi, Delhi,
                              110027, India{" "}
                            </span>
                          </div>

                          <div className="d-flex">
                            <i className="ri-map-pin-range-fill   me-2"></i>
                            <span className="overflowOne">
                              {" "}
                              New Delhi, Delhi, 110027, India{" "}
                            </span>
                          </div>
                        </div>

                        <div className="col-6 text-end">
                          <h4>₹400</h4>
                        </div>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <button
                          type="button"
                          className="btn btn-sm mb-2 me-2 btn-danger"
                        >
                          Complian
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm mb-2 me-2 btn-primary"
                        >
                          Write A Review <i className="ri-chat-1-fill ms-2"></i>
                        </button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <br />
              <br />
            </div>
          </div>
        </div>
      </main>

      <NavBar />
    </>
  );
};

export default Ride;
