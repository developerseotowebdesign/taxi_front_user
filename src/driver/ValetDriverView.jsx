import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import DriverNavbar from "./includes/DriverNavbar";
import axiosInstance, { weburl } from "../axiosInstance";
import LiveRides from "./components/LiveRides";
import SlideButton from "react-slide-button";
import { useBlogContext } from "../fetchdata/BlogContext";
import Select from "react-select";
import getDecryptData from "../helper/getDecryptData";
import QRCode from "qrcode.react";

const ValetDriverView = () => {
  const { getUserData } = useBlogContext();
  const decryptdatajson = getDecryptData();
  const { ValetId } = useParams();

  const [DriversAssign, setDriversAssign] = useState([]);

  const [EditDriver, setEditDriver] = useState(false);

  const HandleEditDriver = async () => {
    if (EditDriver) {
      setEditDriver(false);
    } else {
      setEditDriver(true);
    }
  };

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

  const navigate = useNavigate();

  const [countTotalCal, setcountTotalCal] = useState([]);

  const [Order, setOrder] = useState([]);

  const [MatchedDriversList, setMatchedDriversList] = useState([]);
  const [UnmatchedDriversList, setUnmatchedDriversList] = useState([]);

  const [IsDLoading, setIsDLoading] = useState(true);

  const [IsLoading, setIsLoading] = useState(true);
  const [StartRideStatus, setStartRideStatus] = useState(false);

  const [SubmitLoading, setSubmitLoading] = useState(false); // Add loading state

  const [ValetRideUser, setValetRideUser] = useState([]); // Add loading state

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  const getUserVendorValet = async () => {
    try {
      setIsLoading(true); // Set loading state to false in case of an error
      const driverId = decryptdatajson._id;
      const { data } = await axiosInstance.get(
        `/driver-valet-view/${driverId}/${ValetId}`
      );

      if (data?.success) {
        console.log("order", data);
        setOrder(data?.valet);
        setEditDriver(false);
      }

      setIsLoading(false); // Set loading state to false after fetching data
    } catch (error) {
      console.log(error);
      setIsLoading(false); // Set loading state to false in case of an error
      toast.error("order Not found");
      // navigate('/account');
    }
  };

  const getUserRideDriverValet = async () => {
    const driverId = decryptdatajson._id;
    try {
      setIsLoading(true); // Set loading state to false in case of an error
      // const id = localStorage.getItem('userId');
      const { data } = await axiosInstance.get(
        `/user-valet-ride-view/${driverId}/${ValetId}`
      );

      if (data?.success) {
        console.log("Valet Ride user", data);
        setValetRideUser(data.valet.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error("Valet Ride user not found");
      // navigate('/account');
    }
  };

  //   useEffect(() => {
  // if(Headers.length > 0)
  //   }, [Headers]); // Empty dependency array ensures that the effect runs once after the initial render

  // /update-valet-cost/;

  useEffect(() => {
    getUserVendorValet();
    getUserRideDriverValet();
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

  const [loading, setLoading] = useState(true); // Add loading state

  const [data, setData] = useState([]);

  const [inputs, setInputs] = useState({
    type: "0",
    username: "",
    phone: "",
    carNumber: "",
    VendorId: null,
    driverId: null,
    Valet_Model: null,
  });

  const [Updateinputs, setUpdateInputs] = useState({
    type: "0",
    username: "",
    phone: "",
    carNumber: "",
    VendorId: null,
    driverId: null,
    Valet_Model: null,
    carimageSet: "",
  });

  //handle input change
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setInputs((prevData) => ({
      ...prevData,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleUpdateChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setUpdateInputs((prevData) => ({
      ...prevData,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const [showPassword, setShowPassword] = useState(false);
  const [UpdateLoading, setUpdateLoading] = useState(false);

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    const Driverid = decryptdatajson._id;

    setSubmitLoading(true);

    const fields = [
      { name: "phone", message: "Please enter phone number" },
      { name: "username", message: "Please enter Full Name" },
      { name: "carImage", message: "Please Chooose Car Image" },
      { name: "carName", message: "Please Enter Car Name With Model" },
      { name: "carNumber", message: "Please Enter Car Number" },
    ];

    for (const field of fields) {
      if (!inputs[field.name]) {
        toast.error(field.message);
        setSubmitLoading(false);
        return;
      }
    }

    const updatedFormData = {
      ...inputs,
      VendorId: Order.VendorId._id,
      driverId: Driverid,
      Valet_Model: ValetId,
    };

    try {
      const { data } = await axiosInstance.post(
        `/signup-user-car-type`,
        updatedFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const { success } = data;
      if (success) {
        getUserVendorValet();
        toast.success("Account Created Successfully");
        getUserRideDriverValet();
      }
    } catch (error) {
      console.error("Error On Signup:", error);
      toast.error(error.response.data.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateSubmit = async () => {
    const Driverid = decryptdatajson._id;

    setSubmitLoading(true);

    const fields = [
      { name: "username", message: "Please enter Full Name" },
      // { name: "carImage", message: "Please Chooose Car Image" },
      { name: "carName", message: "Please Enter Car Name With Model" },
      { name: "carNumber", message: "Please Enter Car Number" },
    ];

    for (const field of fields) {
      if (!Updateinputs[field.name]) {
        toast.error(field.message);
        setSubmitLoading(false);
        return;
      }
    }

    // const updatedFormData = {
    //   ...Updateinputs,
    // };

    try {
      const { data } = await axiosInstance.post(
        `/update-user-car-type`,
        Updateinputs,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const { success } = data;
      if (success) {
        getUserVendorValet();
        toast.success("Account Created Successfully");
        getUserRideDriverValet();
      }
    } catch (error) {
      console.error("Error On Signup:", error);
      toast.error(error.response.data.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getValetData = async (ValetId) => {
    console.log(ValetId);

    const dId = decryptdatajson._id;
    try {
      setUpdateLoading(false);
      const { data } = await axiosInstance.get(
        `/driver-valet-ride-view/${dId}/${ValetId}`
      );

      if (data?.success) {
        console.log("Valet Ride driver", data);

        setUpdateInputs((prevData) => ({
          ...prevData,
          username: data.valet.userId.username,
          phone: data.valet.userId.phone,
          carNumber: data.valet.userId.carNumber,
          carName: data.valet.userId.carName,
          carimageSet: data.valet.userId.carImage || "",
        }));
      }
    } catch (error) {
      console.log(error);
      toast.error("Valet Not found");
      // navigate('/account');
    } finally {
      setUpdateLoading(true);
    }
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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      month: "long", // Use 'long' to display the full month name
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",

      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  };

  return (
    <>
      <div className="modal fade" id="addUserModal">
        <div className="bg-dark-shadow-fix "></div>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add User</h5>
              <button className="btn-close" data-bs-dismiss="modal">
                <i class="ri-close-large-line fw-bold text-dark"></i>
              </button>
            </div>
            <div className="modal-body p-4 border-bottom ">
              <form className="m-b20 row">
                <div className="mb-4 col-12">
                  <label className="form-label text-dark" htmlFor="name">
                    Phone
                  </label>
                  <div className="input-group  input-sm">
                    <input
                      type="number"
                      id="phone"
                      className="form-control"
                      name="phone"
                      value={inputs.phone}
                      onChange={(e) => {
                        if (e.target.value.length <= 10) {
                          // Check input length before updating
                          handleChange(e); // Call handleChange if length is within limit
                        }
                      }}
                      onInput={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue.length <= 10) {
                          setInputs({ ...inputs, phone: inputValue });
                        }
                      }}
                      // onChange={() => {
                      //   handleChange();
                      // }}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label text-dark" htmlFor="name">
                    Full Name
                  </label>
                  <div className="input-group  input-sm">
                    <input
                      type="text"
                      id="username"
                      className="form-control"
                      name="username"
                      value={inputs.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-4 col-md-4">
                  <label className="form-label text-dark" htmlFor="email">
                    Car Image
                  </label>
                  <img
                    src=""
                    id="profileimg"
                    alt="Profile"
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      background: "#f8f9fa",
                      display: "block",
                      textAlign: "center",
                      lineHeight: "40vh",
                      borderRadius: 5,
                      objectFit: "contain",
                      border: "1px solid grey",
                    }}
                  />
                  <div className="input-group  input-sm">
                    <input
                      type="file"
                      id="carImage"
                      className="form-control"
                      name="carImage"
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
                          setInputs((prevData) => ({
                            ...prevData,
                            carImage: file,
                          })); // Update profile in state
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="mb-4 col-md-8">
                  <div className="mb-5">
                    <label className="form-label text-dark" htmlFor="name">
                      Car Name With Model
                    </label>
                    <div className="input-group  input-sm">
                      <input
                        type="text"
                        id="carName"
                        className="form-control"
                        name="carName"
                        value={inputs.carName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-dark" htmlFor="name">
                      Car No.
                    </label>
                    <div className="input-group  input-sm">
                      <input
                        type="text"
                        id="carNumber"
                        className="form-control"
                        name="carNumber"
                        value={inputs.carNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm bg-danger text-white"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              {!SubmitLoading ? (
                <button
                  className="btn btn-sm bg-primary text-white"
                  data-bs-dismiss="modal"
                  onClick={handleSubmit}
                >
                  Add User
                </button>
              ) : (
                <button
                  disabled
                  className="btn btn-sm bg-primary text-white"
                  type="button"
                >
                  <span class="ms-1">Loading...</span>
                  <span
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="UpdateUserModal">
        <div className="bg-dark-shadow-fix "></div>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update User</h5>
              <button className="btn-close" data-bs-dismiss="modal">
                <i class="ri-close-large-line fw-bold text-dark"></i>
              </button>
            </div>
            <div className="modal-body p-4 border-bottom ">
              {UpdateLoading ? (
                <form className="m-b20 row">
                  <div className="mb-4 col-12">
                    <label className="form-label text-dark" htmlFor="name">
                      Phone
                    </label>
                    <div className="input-group  input-sm">
                      <input
                        type="number"
                        id="phone"
                        className="form-control"
                        name="phone"
                        value={Updateinputs.phone}
                        readOnly
                        onChange={(e) => {
                          if (e.target.value.length <= 10) {
                            // Check input length before updating
                            handleUpdateChange(e); // Call handleChange if length is within limit
                          }
                        }}
                        onInput={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue.length <= 10) {
                            setUpdateInputs({ ...inputs, phone: inputValue });
                          }
                        }}
                        // onChange={() => {
                        //   handleChange();
                        // }}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-dark" htmlFor="name">
                      Full Name
                    </label>
                    <div className="input-group  input-sm">
                      <input
                        type="text"
                        id="username"
                        className="form-control"
                        name="username"
                        value={Updateinputs.username}
                        onChange={handleUpdateChange}
                      />
                    </div>
                  </div>

                  <div className="mb-4 col-md-4">
                    <label className="form-label text-dark" htmlFor="email">
                      Car Image
                    </label>
                    <div
                      className="openimage-container"
                      style={{ maxWidth: 200 }}
                    >
                      <img
                        src={
                          Updateinputs.carimageSet &&
                          Updateinputs.carimageSet !== ""
                            ? weburl +
                              Updateinputs.carimageSet
                                .replace(/\\/g, "/")
                                .replace(/^public\//, "")
                            : "/img/car-png.webp"
                        }
                        id="profileCarimg"
                        alt="Profile"
                        style={{
                          width: "100%",
                          aspectRatio: "1/1",
                          background: "#f8f9fa",
                          display: "block",
                          textAlign: "center",
                          lineHeight: "40vh",
                          borderRadius: 5,
                          objectFit: "contain",
                          border: "1px solid grey",
                        }}
                      />

                      <input
                        type="file"
                        id="carImage"
                        className="form-control"
                        name="carImage"
                        onChange={(event) => {
                          const file = event.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const imgElement =
                                document.getElementById("profileCarimg");
                              if (imgElement) {
                                imgElement.src = e.target.result; // Set the image URL directly on the img element
                              }
                            };
                            reader.readAsDataURL(file); // Read the file as a data URL
                            setUpdateInputs((prevData) => ({
                              ...prevData,
                              carImage: file,
                            })); // Update profile in state
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-4 col-md-8">
                    <div className="mb-5">
                      <label className="form-label text-dark" htmlFor="name">
                        Car Name With Model
                      </label>
                      <div className="input-group  input-sm">
                        <input
                          type="text"
                          id="carName"
                          className="form-control"
                          name="carName"
                          value={Updateinputs.carName}
                          onChange={handleUpdateChange}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-dark" htmlFor="name">
                        Car No.
                      </label>
                      <div className="input-group  input-sm">
                        <input
                          type="text"
                          id="carNumber"
                          className="form-control"
                          name="carNumber"
                          value={Updateinputs.carNumber}
                          onChange={handleUpdateChange}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  <div className=" p-2">
                    <div
                      className="skeleton  mb-4 "
                      style={{ height: 60, width: "100%" }}
                    />
                    <div
                      className="skeleton  mb-4 "
                      style={{ height: 60, width: "100%" }}
                    />

                    <div className="d-flex gap-4  p-0 mb-2">
                      <div
                        className="skeleton  mb-2 "
                        style={{ height: 60, width: "50%" }}
                      />

                      <div
                        className="skeleton mb-2 "
                        style={{ height: 60, width: "100%" }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm bg-danger text-white"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              {!SubmitLoading ? (
                <button
                  className="btn btn-sm bg-primary text-white"
                  data-bs-dismiss="modal"
                  onClick={handleUpdateSubmit}
                >
                  Update User
                </button>
              ) : (
                <button
                  disabled
                  className="btn btn-sm bg-primary text-white"
                  type="button"
                >
                  <span class="ms-1">Loading...</span>
                  <span
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="addQRModal">
        <div className="bg-dark-shadow-fix "></div>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add User Via QR</h5>
              <button className="btn-close" data-bs-dismiss="modal">
                <i class="ri-close-large-line fw-bold text-dark"></i>
              </button>
            </div>
            <div className="modal-body p-4 border-bottom ">
              <QRCode
                value={`https://api.whatsapp.com/send/?phone=%2B91${
                  import.meta.env.VITE_REACT_APP_ADMIN_NO
                }&text=newuser,VendorId=${Order.VendorId?._id},driverId=${
                  decryptdatajson._id
                },Valet_Model=${ValetId}`}
                className="w-100 h-auto p-5"
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm bg-danger text-white"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <header className="header header-fixed">
        <div className="header-content">
          <div className="left-content">
            <Link to="/driver/valet" className="back-btn">
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
              </div>

              <div className="card p-3 d-block bg-light">
                <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                  <p className="fw-bold p-0 m-0 fs-5">Valet Customer List</p>{" "}
                  <button
                    type="button"
                    className="btn btn-sm btn-primary rounded-sm p-0 mb-2"
                    data-bs-toggle="modal"
                    data-bs-target="#addQRModal"
                    style={{ transform: "scale(0.9)" }}
                  >
                    <i class="ri-qr-code-line fs-2"></i>
                  </button>
                  {Order?.startStatusOTP === 1 && Order?.endStatusOTP === 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary mb-2"
                      data-bs-toggle="modal"
                      data-bs-target="#addUserModal"
                      style={{ transform: "scale(0.9)" }}
                    >
                      Add Ride
                    </button>
                  )}
                </div>
                <div className=" d-block ">
                  {ValetRideUser.map((item) => (
                    <div
                      key={item._id}
                      className={`card m-0 p-3 mb-3 ${
                        (item.userId.carName === "") &
                          (item.userId.carNumber === "") && "bg-danger-light"
                      }`}
                    >
                      <div className="d-md-flex gap-2">
                        <div className=" me-2 ">
                          <img
                            className="rounded bg-white border d-sm-none d-md-block"
                            src={
                              item.userId.carImage &&
                              item.userId.carImage !== ""
                                ? weburl +
                                  item.userId?.carImage
                                    .replace(/\\/g, "/")
                                    .replace(/^public\//, "")
                                : "/img/car-png.webp"
                            }
                            style={{
                              width: 100,
                              height: 100,
                              aspectRatio: "1 / 1",
                              objectFit: "contain",
                            }}
                          />
                          <img
                            className="rounded bg-white border d-md-none  d-sm-block "
                            src={
                              item.userId.carImage &&
                              item.userId.carImage !== ""
                                ? weburl +
                                  item.userId?.carImage
                                    .replace(/\\/g, "/")
                                    .replace(/^public\//, "")
                                : "/img/car-png.webp"
                            }
                            style={{
                              width: "100%",
                              height: 100,
                              aspectRatio: "1 / 1",
                              objectFit: "contain",
                            }}
                          />

                          <div className="text-center mt-2 ">
                            <Link
                              to={`/driver/valet/park/${item._id}`}
                              className="badge badge-primary m-auto fw-light text-white"
                            >
                              <i className="ri-car-fill fw-light"></i> View
                            </Link>
                          </div>
                        </div>
                        <div className="d-md-none d-sm-block mb-2" />
                        <div className=" row col">
                          <div className="col-5 ">
                            <p className="p-0 mb-2  ">Cutomer Name</p>
                            <p className="p-0 mb-2  ">Car Name</p>
                            <p className=" p-0 mb-2   ">Car Number</p>
                            <p className=" p-0 mb-2   ">Valet Date</p>
                            <p className=" p-0 mb-2   ">Parking Status</p>
                          </div>
                          <div className="col-7 ">
                            <p className="fw-bold  p-0 m-0 mb-2 ">
                              {item.userId?.username}{" "}
                              <Link
                                to={`tel:+91${item.userId.phone}`}
                                className="badge badge-primary m-auto fw-light   text-white ms-2"
                              >
                                <i className="ri-phone-fill"></i> Call
                              </Link>
                            </p>
                            <p className="fw-bold  p-0 m-0 mb-2 ">
                              {item.userId?.carName
                                ? item.userId?.carName
                                : "NA"}
                            </p>
                            <p className="fw-bold  p-0 m-0 mb-2 ">
                              {item.userId?.carNumber
                                ? item.userId?.carNumber
                                : "NA"}
                            </p>
                            <p className="fw-bold  p-0 m-0 mb-2 ">
                              {formatDate(item?.createdAt)}
                            </p>
                            <p className="fw-bold  p-0 m-0 mb-2 ">
                              {item.userId.carName !== "" &&
                                item.userId.carNumber !== "" && (
                                  <span
                                    className={`badge mb-2 ${
                                      (item.userId.carName === "") &
                                      (item.userId.carNumber === "")
                                        ? "badge-danger cursor"
                                        : !item.PickupStartLocation
                                        ? " badge-danger"
                                        : !item.PickupEndLocation
                                        ? "badge-warning"
                                        : !item.DropStartLocation
                                        ? "badge-primary"
                                        : !item.DropEndLocation
                                        ? "badge-warning"
                                        : "badge-primary"
                                    }
                                
                                fw-light `}
                                  >
                                    {!item.PickupStartLocation
                                      ? "Waiting for Driver.."
                                      : !item.PickupEndLocation
                                      ? "Driver started towards parking "
                                      : !item.DropStartLocation
                                      ? "Driver parked the car"
                                      : !item.DropEndLocation
                                      ? "Driver picked the car from parking"
                                      : "Driver delivered the car"}
                                  </span>
                                )}

                              {!item.PickupStartLocation && (
                                <span
                                  className="badge  badge-dark cursor ms-2"
                                  onClick={() => getValetData(item._id)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#UpdateUserModal"
                                >
                                  <i className="ri-pencil-fill" /> Edit{" "}
                                </span>
                              )}
                            </p>
                          </div>
                          {item.noti !== 0 && (
                            <div className="col-12">
                              <div className="alert alert-warning solid solid alert-dismissible fade show p-1 d-flex">
                                <i class="ri-alarm-warning-fill me-2"></i>
                                <div>
                                  <strong>Customer!</strong> Request to pick a
                                  car
                                </div>
                                <i
                                  className="ri-close-large-line cursor fw-bold ms-auto"
                                  data-bs-dismiss="alert"
                                  aria-label="btn-close"
                                ></i>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
                    <h5 className="mt-2 mb-0"> {Order?.VendorId?.username} </h5>
                    <div className="d-flex flex-row justify-content-between align-text-center">
                      <small className="text-muted">
                        {Order?.ValetLocation}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 ms-auto">
                    <a
                      className="dz-icon icon-sm icon-fill"
                      href={`tel:${Order?.VendorId?.phone}`}
                    >
                      <i className="ri-phone-fill" />
                    </a>
                    <Link
                      className="dz-icon icon-sm icon-fill"
                      to={`/vendor/chat/${Order?.VendorId._id}/${Order._id}`}
                    >
                      <i className="ri-message-3-fill" />
                    </Link>
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
                    <h4>₹{Order.dailyCost}</h4>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <LiveRides />
      </main>
    </>
  );
};

export default ValetDriverView;
