import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DriverNavbar from "./includes/DriverNavbar";
import LiveRides from "./components/LiveRides";
import axiosInstance from "../axiosInstance";
import getCookie from "../helper/getCookie";
import getDecryptData from "../helper/getDecryptData";

import { useBlogContext } from "../fetchdata/BlogContext";

const WalletDriver = () => {
  const { getUserData } = useBlogContext();

  const [Loading, setLoading] = useState(true);
  const [SubmitLoading, setSubmitLoading] = useState(true); // Add loading state
  const [Transaction, setTransaction] = useState([]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const [sortOrder, setSortOrder] = useState(1); // 1 for Newest, 2 for Oldest
  const [filterRange, setFilterRange] = useState("all"); // 'all', 'today', '7days', '1month'

  const handleSortChange = (event) => {
    setSortOrder(parseInt(event.target.value));
  };

  const handleFilterChange = (event) => {
    setFilterRange(event.target.value);
  };

  const [formData, setFormData] = useState({
    userId: null,
    type: 0,
    note: "Add Funds By Driver ",
    amount: 0,
    wallet: 0,
    trans: 0,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //form handle
  //form handle
  const fetchUserById = async () => {
    const decryptdatajson = await getDecryptData();

    const id = decryptdatajson._id;
    const credentials = {
      id: id,
    };

    try {
      setLoading(true);

      const { data } = await axiosInstance.post("/auth-user", credentials);
      const { success, existingUser, message } = data;

      if (success) {
        setFormData((prevData) => ({
          ...prevData,
          amount: existingUser.wallet,
          userId: existingUser._id,
        }));

        console.log("Message from backend:", existingUser);
      }
    } catch (error) {
      console.error("Error during login:", error);
      // Handle network errors, API issues, etc.
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchtransactionById = async () => {
    const decryptdatajson = await getDecryptData();

    const id = decryptdatajson._id;

    try {
      setLoading(true);

      const { data } = await axiosInstance.get(`/all-transaction/${id}`);
      const { success } = data;

      if (success) {
        setTransaction(data.transactions.reverse());
      }
    } catch (error) {
      console.error("Error during login:", error);
      // Handle network errors, API issues, etc.
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchtransactionById();
    fetchUserById();
    getUserData();
  }, []);

  useEffect(() => {
    if (formData.trans) {
      setTransaction(Transaction.reverse());
      console.log("formData.trans", formData.trans);
    }
  }, [formData.trans]);

  const submitData = async () => {
    setSubmitLoading(false);

    const updatedFormData = {
      ...formData,
      wallet: Number(formData.wallet),
    };
    console.log("updatedFormData", updatedFormData);

    if (Number(formData.wallet) < 99) {
      toast.error("Minimum wallet amount is 100");
      setSubmitLoading(true);
    } else {
      try {
        const token = getCookie("token");
        if (token) {
          toast.promise(axiosInstance.post("/add-wallet", updatedFormData), {
            loading: "Adding funds on wallet...", // Loading message
            success: "Wallet added successfully!", // Success message
            error: "Failed to added funds.", // Error message
          });

          // toast.success("Wallet Add successfully!");
          getUserData();
          fetchtransactionById();
          setFormData((prevData) => ({ ...prevData, wallet: 0 }));
        } else {
          toast.success("Please login First!");
        }
      } catch (error) {
        console.error("Error On Wallet", error);
        toast.error(error.response.data.message);
      } finally {
        setSubmitLoading(true);
        fetchUserById();
      }
    }
  };

  const RefreshAllData = async () => {
    fetchtransactionById();
    fetchUserById();
    toast.success("Data Refreshed");
  };

  useEffect(() => {
    let filtered = [...Transaction];

    // Apply date range filter
    const now = new Date();
    if (filterRange === "today") {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate.toDateString() === now.toDateString();
      });
    } else if (filterRange === "7days") {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter(
        (transaction) => new Date(transaction.createdAt) >= sevenDaysAgo
      );
    } else if (filterRange === "1month") {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filtered = filtered.filter(
        (transaction) => new Date(transaction.createdAt) >= oneMonthAgo
      );
    }

    // Apply sorting
    if (sortOrder === 1) {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first
    } else {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first
    }

    setTransaction(filtered);
  }, [sortOrder, filterRange]);

  return (
    <>
      <header className="header header-fixed">
        <div className="header-content">
          <div className="left-content">
            <Link to="/" className="back-btn">
              <i className="ri-arrow-left-line"></i>
            </Link>
          </div>
          <div className="mid-content">
            <h4 className="title">Wallet</h4>
          </div>
          <div className="right-content d-flex align-items-center gap-4">
            <Link to="/"></Link>
          </div>
        </div>
      </header>

      <main className="page-content space-top">
        {!Loading ? (
          <>
            <div className="container">
              <div className="rewards-box">
                <h5 className="sub-title">
                  My Funds
                  <span className="icon-bx">
                    <i className="feather icon-info" />
                  </span>
                </h5>
                <h2 className="title">
                  {SubmitLoading ? (
                    formData.amount
                  ) : (
                    <>
                      <div className="bg-white rounded">
                        <div
                          className="skeleton m-auto"
                          style={{ height: 80, width: "100%" }}
                        />
                      </div>
                    </>
                  )}
                </h2>

                {SubmitLoading ? (
                  <>
                    <button
                      type="button"
                      className="btn redeem-btn px-1 me-2"
                      onClick={RefreshAllData}
                    >
                      <i className="ri-restart-line fs-2"></i>
                    </button>
                    <button
                      type="button"
                      className="btn redeem-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#walletModal"
                    >
                      Add Funds
                    </button>
                  </>
                ) : (
                  <button className="btn redeem-btn" type="button" disabled>
                    <span className="ms-1">Loading...</span>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  </button>
                )}

                <div className="bg-icon">
                  <img src="assets/images/svg/rewards.svg" alt="images" />
                </div>
              </div>
              <div className="title-bar">
                <h5 className="title">History Reward</h5>
                <select
                  className="form-select"
                  name="filter"
                  onChange={handleFilterChange}
                  value={filterRange}
                >
                  <option value="all">All</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="1month">Last 1 Month</option>
                </select>
                <select
                  className="form-select"
                  name="sort"
                  onChange={handleSortChange}
                  value={sortOrder}
                >
                  <option value={1}>Newest</option>
                  <option value={2}>Oldest</option>
                </select>
              </div>
              <div className="rewards-list">
                <ul>
                  {Transaction.map((transaction) => (
                    <li key={transaction._id}>
                      <div className="item-head">
                        <h6 className="title">
                          <span
                            className={`${
                              transaction?.type === 1 && "text-danger "
                            }`}
                          >
                            {" "}
                            {transaction?.note}{" "}
                          </span>
                        </h6>
                        <div className="dz-meta">
                          <ul>
                            <li>{formatDate(transaction?.createdAt)}</li>
                            <li>{formatTime(transaction?.createdAt)}</li>
                          </ul>
                        </div>
                      </div>
                      <div className="pts-bx">
                        <h4
                          className={`points text-${
                            transaction.type !== 1 ? "primary" : "danger"
                          }`}
                        >
                          {transaction.amount >= 0 ? "+" : "-"}
                          {Math.abs(transaction.amount)}
                        </h4>

                        <p>Funds</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="modal fade" id="walletModal">
              <div className="bg-dark-shadow-fix "></div>
              <div className="modal-dialog " role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add Money</h5>
                    <button className="btn-close" data-bs-dismiss="modal">
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                  <div className="modal-body bg-light">
                    <div className="mb-2 input-group input-group-icon">
                      <span className="input-group-text">
                        <div className="input-icon">
                          <i className="ri-wallet-fill"></i>
                        </div>
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter Amount"
                        id="wallet"
                        value={formData.wallet !== 0 ? formData.wallet : ""}
                        name="wallet"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-sm btn-danger light"
                      data-bs-dismiss="modal"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      data-bs-dismiss="modal"
                      className="btn btn-sm btn-primary"
                      onClick={submitData}
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <br /> <br /> <br />
          </>
        ) : (
          <>
            <div className="container pt-0">
              <div
                className="skeleton mb-4 me-4"
                style={{ height: 197, width: "100%" }}
              />
              <div
                className="skeleton m-auto mb-4"
                style={{ height: 80, width: "100%" }}
              />
              <div
                className="skeleton m-auto mb-4"
                style={{ height: 80, width: "100%" }}
              />
              <div
                className="skeleton m-auto mb-4"
                style={{ height: 80, width: "100%" }}
              />
              <div
                className="skeleton m-auto mb-4"
                style={{ height: 80, width: "100%" }}
              />
              <br /> <br /> <br />
            </div>
          </>
        )}
      </main>

      <LiveRides />

      <DriverNavbar />
    </>
  );
};

export default WalletDriver;
