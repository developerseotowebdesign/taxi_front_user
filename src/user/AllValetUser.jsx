import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import NavBar from "./includes/NavBar";
import axiosInstance, { weburl } from "../axiosInstance";
import getDecryptData from "../helper/getDecryptData";
import PropTypes from "prop-types"; // Import PropTypes


const AllValetUser = () => {
  const [IfLogin, setIfLogin] = useState(true); // State to manage which form to display

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

  const getUserOrders = async () => {
    try {
      const decryptdatajson = await getDecryptData();

      const id = decryptdatajson._id;
      const { data } = await axiosInstance.get(`/all-valet-service-user/${id}`);
      console.log("getUserOrders", data);
      if (data?.Valet) {
        const myValet = data?.Valet;
        setOrder(myValet.reverse());
        setOrderPlace(data?.Valet.length);
      }
      setIsLoading(false); // Set loading state to false after fetching data
      setIfLogin(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false); // Set loading state to false in case of an error
    }
  };

  useEffect(() => {
    // This useEffect runs whenever the 'blog' state variable changes
    console.log(Order); // Log the updated 'blog' state
  }, [Order]); // Dependency array with 'blog' ensures the effect runs when 'blog' state changes

  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  useEffect(() => {
    if (!IfLogin) {
      const getUsernameAndEmailFromLocalStorage = () => {
        const userString = localStorage.getItem("user");
        if (userString) {
          const { username, email } = JSON.parse(userString);
          return { username, email };
        }
        return null;
      };

      // Retrieve username and email from local storage user data
      const { username, email } = getUsernameAndEmailFromLocalStorage();
      setMYuser(username);
    }
    getUserOrders();
  }, []); // Empty dependency array ensures that the effect runs once after the initial render

  const OrderCard = ({ order }) => (
    <li>
      <div className="card p-3">
        <div className="d-flex justify-content-between">
          <span className="badge badge-primary">
            Booking ID: {order?.ValetRide_Id}
          </span>
          <span className="badge badge-primary">
            Date: {formatDate(order.createdAt)}
          </span>
        </div>
        <hr />
        {order.userId.length !== 0 ? (
          <div className="d-flex">
            <img
              className="rounded me-2"

              src={
                order && order.driverId.profile !== ""
                  ? weburl +
                  order.driverId.profile
                    .replace(/\\/g, "/")
                    .replace(/^public\//, "")
                  : "/img/user.svg"
              }

              style={{
                width: 50,
                height: 50,
                aspectRatio: "1/1",
                objectFit: "cover",
              }}
            />
            <div className="media-body">
              <h5 className="mt-1 mb-0">{order.driverId?.username}</h5>
              <div className="d-flex flex-row justify-content-between align-text-center">

                <span
                  className={`badge mb-2  ms-2 ${(order && order.userId?.carName === "") &
                    (order && order.userId?.carNumber === "")
                    ? "badge-danger cursor"
                    : !order.PickupStartLocation
                      ? " badge-danger"
                      : !order.PickupEndLocation
                        ? "badge-warning"
                        : !order.DropStartLocation
                          ? "badge-primary"
                          : !order.DropEndLocation
                            ? "badge-warning"
                            : "badge-primary"
                    }
                                
                                fw-light `}
                >
                  {!order.PickupStartLocation
                    ? "Waiting for Driver.."
                    : !order.PickupEndLocation
                      ? "Driver started towards parking "
                      : !order.DropStartLocation
                        ? "Driver parked the car"
                        : !order.DropEndLocation
                          ? "Driver picked the car from parking"
                          : "Driver delivered the car"}
                </span>

              </div>


            </div>
            <div className="d-flex gap-2 ms-auto">
              <Link
                to={`tel:${order.driverId?.phone}`}
                className="dz-icon icon-sm icon-fill"
              >
                <i className="ri-phone-fill"></i>
              </Link>
              {/* <Link
                to={`/vendor/chat/${order.VendorId?._id}/${order._id}/`}
                className="dz-icon icon-sm icon-fill"
              >
                <i className="ri-message-3-fill"></i>
              </Link> */}
            </div>
          </div>
        ) : (
          <div className="alert alert-warning solid alert-dismissible fade show">
            <i className="ri-error-warning-fill text-white fs-4"></i>
            <strong className="fs-6"> Waiting For User To Accept ....</strong>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="btn-close"
            >
              <i className="ri-close-line text-white"></i>
            </button>
          </div>
        )}



        <hr />
        <div className="d-flex justify-content-end">
          <button disabled type="button" className="btn btn-sm mb-2 me-2 bg-light  d-none">
            <i className="ri-roadster-fill me-2"></i>   {order.userId?.carName}
          </button>
          <Link
            to={`/my-valet/${order?.Valet_Model}`}
            className="btn btn-sm mb-2  btn-primary ml-auto d-block"
          >
            View Parking Details<i className="ri-arrow-right-line ms-2"></i>
          </Link>
        </div>
      </div>
    </li>
  );

  OrderCard.propTypes = {
    order: PropTypes.object.isRequired, // Define PropTypes for order prop
  };

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
          (order) => order?.PickupStartLocation === '' && order?.PickupEndLocation === '' && order?.DropStartLocation === '' && order?.DropEndLocation === ''
        );
      case 2:
        return Order.filter(
          (order) => order?.DropEndLocation === '' && (order?.PickupStartLocation !== '' || order?.PickupEndLocation !== '' || order?.DropStartLocation !== '')
        );
      case 3:
        return Order.filter(
          (order) => order?.PickupStartLocation !== '' && order?.PickupEndLocation !== '' && order?.DropStartLocation !== '' && order?.DropEndLocation !== ''
        );
      default:
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
            <h4 className="title">My Parkings</h4>
          </div>
          <div className="right-content d-flex align-items-center gap-4">
            <Link to="/"></Link>
          </div>
        </div>
      </header>
      <main className="page-content  pt-5 ">
        <div className="container pt-0">
          <div className="default-tab style-2 mt-1">
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
                    className={`btn-sm fs-7 nav-link ${RideView === tab.view && "active"
                      } w-100`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="tab-content pt-5 mt-5">
              <br />
              <ul className="featured-list mt-5">
                {isLoading ? (
                  // Display loading skeletons while data is being fetched
                  Array.from({ length: 4 }).map((_, index) => (
                    <li key={index}> {/* Add key prop here */}
                      <div className="col-md-12">
                        <div
                          className="skeleton mb-3"
                          style={{ height: 154, borderRadius: 10 }}
                        />
                      </div>
                    </li>
                  ))
                ) : (
                  filteredOrders(RideView).map((order) => (
                    <li key={order._id}> {/* Ensure each list item has a unique key */}
                      <OrderCard order={order} />
                    </li>
                  ))
                )}
              </ul>


              <div className="tab-pane mt-2 fade " id="profile" role="tabpanel">
                <ul className="featured-list">
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

export default AllValetUser;
