import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance, { weburl } from "../axiosInstance";
import axios from "axios";
import { useDispatch } from "react-redux";
import { authActions } from "../redux/store";
import getCookie from "../helper/getCookie";
import eraseCookie from "../helper/eraseCookie";
import { decrypt, encrypt } from "../helper/encryption";
import getDecryptData from "../helper/getDecryptData";
const ProfileEditVendor = () => {
  const [LoadingState, setLoadingState] = useState(true); // Add loading state
  const [SubmitLoading, setSubmitLoading] = useState(true); // Add loading state
  const [data, setData] = useState([]);

  let initialUserData = {
    username: "",
    phone: "",
    pincode: "",
    state: "",
    address: "",
    profile: null, // Changed to null to match file type
    profileImg: "",
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/get-all-zones");
      console.log(response.data.Zones);
      setData(response.data.Zones);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const [Orderinputs, setOrderInputs] = useState(initialUserData);
  const [Loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  //state
  const [value, setValue] = useState();

  const isLoginFromLocalStorage = getCookie("token") ? true : false;
  const [isLogin, setIsLogin] = useState(isLoginFromLocalStorage);

  useEffect(() => {
    setIsLogin(isLoginFromLocalStorage);
  }, [isLoginFromLocalStorage]);

  //logout
  const handleLogout = () => {
    try {
      dispatch(authActions.logout());
      toast.success("Logout Successfully");
      navigate("/");
      // localStorage.clear();
      eraseCookie("token");
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserById = async () => {
    const decryptdatajson = await getDecryptData();

    console.log("decryptdatajson", decryptdatajson);
    const credentials = {
      id: decryptdatajson._id,
    };

    try {
      const { data } = await axiosInstance.post("/auth-user", credentials);
      const { success, token, existingUser, message } = data;
      const storedLocation = localStorage.getItem("selectedLocation");
      if (success) {
        setOrderInputs((prevData) => ({
          ...prevData,
          username: existingUser.username || "",
          phone: existingUser.phone || "",
          email: existingUser.email || "",
          address: storedLocation,
          pincode: existingUser.pincode || "",
          state: existingUser.state || "",
          profileImg: existingUser.profile || "",
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

  useEffect(() => {
    //form handle

    fetchUserById();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOrderInputs((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitData = async () => {
    setLoading(true);
    const decryptdatajson = await getDecryptData();
    try {
      if (decryptdatajson._id) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(Orderinputs.email)) {
          toast.error("Invalid email format");
          return; // Stop further execution
        }

        await toast.promise(
          axiosInstance.put(
            `/update-profile/${decryptdatajson._id}`,
            Orderinputs,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          ),
          {
            loading: "Profile Updating...", // Loading message
            success: "Profile Updated!", // Success message
            error: "Failed to Profile Update.", // Error message
          }
        );
      }
    } catch (error) {
      console.error("Error On Profile:", error);
      console.log(Orderinputs);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
      fetchUserById();
    }
  };

  return (
    <>
      <header className="header header-fixed">
        <div className="header-content">
          <div className="left-content">
            <Link to="/vendor/profile" className="back-btn">
              <i className="ri-arrow-left-line"></i>
            </Link>
          </div>
          <div className="mid-content">
            <h4 className="title">Profie</h4>
          </div>
          <div className="right-content d-flex align-items-center gap-4">
            <Link to="/">
              <svg
                enableBackground="new 0 0 461.75 461.75"
                height={24}
                viewBox="0 0 461.75 461.75"
                width={24}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m23.099 461.612c2.479-.004 4.941-.401 7.296-1.177l113.358-37.771c3.391-1.146 6.472-3.058 9.004-5.587l226.67-226.693 75.564-75.541c9.013-9.016 9.013-23.63 0-32.645l-75.565-75.565c-9.159-8.661-23.487-8.661-32.645 0l-75.541 75.565-226.693 226.67c-2.527 2.53-4.432 5.612-5.564 9.004l-37.794 113.358c-4.029 12.097 2.511 25.171 14.609 29.2 2.354.784 4.82 1.183 7.301 1.182zm340.005-406.011 42.919 42.919-42.919 42.896-42.896-42.896zm-282.056 282.056 206.515-206.492 42.896 42.896-206.492 206.515-64.367 21.448z"
                  fill="#4A3749"
                />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="page-content space-top dz-gradient-shape">
        {!Loading ? (
          <div className="container">
            <div className="edit-profile">
              <div className="profile-image">
                <div className="avatar-upload">
                  <div className="avatar-preview">
                    <img
                      src={
                        Orderinputs && Orderinputs.profileImg !== ""
                          ? weburl +
                            Orderinputs.profileImg
                              .replace(/\\/g, "/")
                              .replace(/^public\//, "")
                          : "/img/user.svg"
                      }
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "100%",
                      }}
                      id="profileimg"
                    />
                    <div className="change-btn">
                      <input
                        type="file"
                        className="form-control d-none"
                        id="profile"
                        name="profile"
                        onChange={(event) => {
                          const file = event.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const imgElement =
                                document.getElementById("profileimg");
                              if (imgElement) {
                                imgElement.src = e.target.result; // Set the image URL directly on the img element
                              }
                            };
                            reader.readAsDataURL(file); // Read the file as a data URL
                            setOrderInputs((prevData) => ({
                              ...prevData,
                              profile: file,
                            })); // Update profile in state
                          }
                        }}
                      />

                      <label htmlFor="profile">
                        <i class="ri-pencil-fill"></i>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label  text-dark" htmlFor="name">
                  Full Name
                </label>
                <div className="input-group  input-sm">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    value={Orderinputs.username}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      if (name === "username") {
                        if (/\d/.test(value)) {
                          toast.error(
                            "Numbers are not allowed in the Full Name"
                          );

                          return; // Stop further execution
                        }
                      }
                      // Call handleChange with the event object
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label  text-dark" htmlFor="phone">
                  Mobile Number
                </label>
                <div className="input-group  input-sm">
                  <input
                    type="tel"
                    id="phone"
                    className="form-control"
                    value={Orderinputs.phone}
                    disabled
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label  text-dark" htmlFor="email">
                  Email
                </label>
                <div className="input-group input-sm">
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    name="email"
                    value={Orderinputs.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label text-dark" htmlFor="state">
                  State
                </label>{" "}
                <div className="input-group input-sm">
                  {" "}
                  <select
                    class="form-select border bg-white p-2"
                    id="state"
                    name="state"
                    value={Orderinputs.state}
                    onChange={handleChange}
                  >
                    <option selected>
                      {" "}
                      {LoadingState ? "Loading..." : "Select State"}
                    </option>
                    {data.map((item) => (
                      <option value={item._id}>{item.name}</option>
                    ))}
                    ;
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label  text-dark" htmlFor="email">
                  Address
                </label>
                <div className=" mb-2 input-group input-group-icon input-md">
                  <input
                    type="address"
                    id="Address"
                    className="form-control "
                    disabled
                    value={Orderinputs.address}
                  />
                  <Link
                    to="/my-location"
                    className="input-group-text text-primary p-2 cursor bg-primary text-white"
                  >
                    <i class="ri-navigation-fill text-white"></i>{" "}
                    <div className="ms-2 text-white"> Change </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container pt-0">
            <div className="profile-area">
              <div className="author-bx">
                <div className="dz-media">
                  <div
                    className="skeleton"
                    style={{ height: 200, width: 200 }}
                  />
                </div>
              </div>
              <div className="widget_getintuch pb-15">
                <ul>
                  <li>
                    <div
                      className="skeleton mb-2 mt-1"
                      style={{ height: 60, width: "100%" }}
                    />
                  </li>

                  <li>
                    <div
                      className="skeleton mb-2 mt-1"
                      style={{ height: 60, width: "100%" }}
                    />
                  </li>

                  <li>
                    <div
                      className="skeleton mb-2 mt-1"
                      style={{ height: 60, width: "100%" }}
                    />
                  </li>
                  <li>
                    <div
                      className="skeleton mb-2 mt-1"
                      style={{ height: 60, width: "100%" }}
                    />
                  </li>

                  <li>
                    <div
                      className="skeleton mb-2 mt-1"
                      style={{ height: 60, width: "100%" }}
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
        <br /> <br /> <br /> <br />
      </main>

      <div class="footer-fixed-btn bottom-0 bg-white">
        <button
          type="button"
          class="btn btn-lg btn-thin btn-primary rounded-xl w-100"
          onClick={submitData}
        >
          Update Profile
        </button>
      </div>
    </>
  );
};

export default ProfileEditVendor;
