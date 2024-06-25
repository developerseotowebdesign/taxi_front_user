import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { useEffect } from "react";
import Success from "./Success";

const SignupUser = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true); // Add loading state

  const [SubmitLoading, setSubmitLoading] = useState(true); // Add loading state
  const [data, setData] = useState([]);

  const [inputs, setInputs] = useState({
    type: "1",
    username: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    pincode: "",
    Gender: "1",
    DOB: "",
    address: "",
    profile: null, // Changed to null to match file type
    DLfile: null,
    AadhaarFront: null,
    AadhaarBack: null,
    PoliceVerification: null,
    PassPort: null,
    Electricity: null,
    WaterBill: null,
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

  const [showPassword, setShowPassword] = useState(false);

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    setSubmitLoading(false);
    console.log(inputs);
    const fields = [
      { name: "username", message: "Please enter Full Name" },
      { name: "phone", message: "Please enter phone number" },
      { name: "email", message: "Please enter email" },
      { name: "password", message: "Please enter password" },
      { name: "confirm_password", message: "Please enter confirm password" },
      { name: "Gender", message: "Please enter Gender" },
      { name: "DOB", message: "Please enter DOB" },
      { name: "state", message: "Please enter State" },
      { name: "pincode", message: "Please enter pincode" },
      { name: "address", message: "Please enter address" },
      { name: "profile", message: "Please choose profile photo" },
      {
        name: "AadhaarFront",
        message: "Please choose Aadhaar Front photo ",
      },
      {
        name: "AadhaarBack",
        message: "Please choose Aadhaar Back photo ",
      },
      {
        name: "PoliceVerification",
        message: "Please choose Police Verification photo ",
      },
      {
        name: "PassPort",
        message: "Please choose PassPort photo ",
      },
    ];

    for (const field of fields) {
      if (!inputs[field.name]) {
        toast.error(field.message);
        setSubmitLoading(true);
        return;
      }
    }

    try {
      const { data } = await axiosInstance.post(`/signup-user-type`, inputs, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const { success } = data;
      if (success) {
        navigate('/');

        toast.success("Account Created Successfully");
      }
    } catch (error) {
      console.error("Error On Signup:", error);
      toast.error(error.response.data.message);
    } finally {
      setSubmitLoading(true);
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

  return (
    <>
      <main className="page-content dz-gradient-shape">
        <div className="container py-0 bg-white">
          <div className="dz-authentication-area pt-4">
            <div className="main-logo">
              <Link to="/" className="back-btn">
                <i class="ri-arrow-left-line"></i>
              </Link>
            </div>
            <div className="section-head mt-4">
              <h3 className="title mt-2">Create an account</h3>
            </div>
            <div className="account-section">
              <form className="m-b20 row">
                <label className="mb-2">Are you a driver or vender </label>
                <ul className="customradio input-group two-grid  mb-4 px-3">
                  <li>
                    <input
                      type="radio"
                      name="type"
                      onChange={handleChange}
                      value="1"
                      checked={inputs.type === "1"}
                    />
                    <label>Driver</label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      name="type"
                      onChange={handleChange}
                      value="2"
                      checked={inputs.type === "2"}
                    />
                    <label>Vender</label>
                  </li>
                </ul>
                <div className="mb-4">
                  <label className="form-label" htmlFor="name">
                    Full Name
                  </label>
                  <div className="input-group input-mini input-sm">
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
                <div className="mb-4 col-6">
                  <label className="form-label" htmlFor="name">
                    phone
                  </label>
                  <div className="input-group input-mini input-sm">
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
                <div className="mb-4 col-6">
                  <label className="form-label" htmlFor="email">
                    Email
                  </label>
                  <div className="input-group input-mini input-sm">
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      name="email"
                      value={inputs.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="m-b30">
                  <label className="form-label" htmlFor="password">
                    Password
                  </label>
                  <div className="input-group input-mini input-sm">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="form-control dz-password"
                      name="password"
                      value={inputs.password}
                      onChange={handleChange} // Add onChange handler to manage input changes
                    // onKeyPress={(e) => {
                    //   if (e.key === 'Enter' && inputs.phone.length === 10) {
                    //     submitLoginPass();
                    //   }
                    // }}
                    />
                    <span className="input-group-text text-primary p-1">
                      {/* Toggle password visibility button */}
                      <i
                        className={
                          showPassword
                            ? "ri-eye-off-fill cursor"
                            : "ri-eye-fill cursor"
                        }
                        onClick={togglePasswordVisibility}
                      />
                    </span>
                  </div>
                </div>
                <div className="m-b30">
                  <label className="form-label" htmlFor="password">
                    Confirm Password
                  </label>
                  <div className="input-group input-mini input-sm">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="form-control dz-password"
                      name="confirm_password"
                      value={inputs.confirm_password}
                      onChange={handleChange} // Add onChange handler to manage input changes
                    // onKeyPress={(e) => {
                    //   if (e.key === 'Enter' && inputs.phone.length === 10) {
                    //     submitLoginPass();
                    //   }
                    // }}
                    />
                    <span className="input-group-text text-primary p-1">
                      {/* Toggle password visibility button */}
                      <i
                        className={
                          showPassword
                            ? "ri-eye-off-fill cursor"
                            : "ri-eye-fill cursor"
                        }
                        onClick={togglePasswordVisibility}
                      />
                    </span>
                  </div>
                </div>
                <div className="mb-4 col-6 ">
                  <label className="form-label" htmlFor="email">
                    Gender
                  </label>
                  <div className="input-group  input-mini input-sm">
                    <select
                      className="form-control"
                      value={inputs.Gender}
                      name="Gender"
                      onChange={handleChange}
                    >
                      <option selected disabled>
                        {" "}
                        Select Gender
                      </option>
                      <option value="1">Male</option>
                      <option value="2">Female</option>
                      <option value="0">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4 col-6  ">
                  <label className="form-label" htmlFor="email">
                    DOB
                  </label>
                  <div className="input-group  input-mini input-sm">
                    <input
                      type="date"
                      id="username"
                      className="form-control custom-date"
                      name="DOB"
                      value={inputs.DOB}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-4 col-6 ">
                  <label className="form-label" htmlFor="email">
                    State
                  </label>
                  <div className="input-group  input-mini input-sm">
                    <select
                      className="form-control"
                      id="state"
                      name="state"
                      value={inputs.state}
                      onChange={handleChange}
                    >
                      <option selected disabled>
                        {" "}
                        {loading ? "Loading..." : "Select State"}
                      </option>
                      {data.map((item) => (
                        <option value={item._id}>{item.name}</option>
                      ))}{" "}
                      ;
                    </select>
                  </div>
                </div>

                <div className="mb-4 col-6  ">
                  <label className="form-label" htmlFor="email">
                    Pincode
                  </label>
                  <div className="input-group  input-mini input-sm">
                    <input
                      type="number"
                      id="pincode"
                      className="form-control custom-date"
                      name="pincode"
                      value={inputs.pincode}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-4  ">
                  <label className="form-label" htmlFor="email">
                    Address
                  </label>
                  <div className="input-group  input-mini input-sm">
                    <textarea
                      class="form-control"
                      id="address"
                      name="address"
                      onChange={handleChange}
                      rows="2"
                    >
                      {inputs.address}
                    </textarea>
                  </div>
                </div>
                <div className="mb-4 col-6">
                  <label className="form-label" htmlFor="email">
                    Profile Pic
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
                  <div className="input-group input-mini input-sm">
                    <input
                      type="file"
                      id="profile"
                      className="form-control"
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
                          setInputs((prevData) => ({
                            ...prevData,
                            profile: file,
                          })); // Update profile in state
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="mb-4 col-6">
                  <label className="form-label" htmlFor="email">
                    Driving Licence(DL)
                  </label>
                  <img
                    src=""
                    id="DLImage"
                    alt="Driving Licence(DL)"
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
                  <div className="input-group input-mini input-sm">
                    <input
                      type="file"
                      id="DLfile"
                      className="form-control"
                      name="DLfile"
                      onChange={(event) => {
                        const file = event.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const imgElement =
                              document.getElementById("DLImage");
                            if (imgElement) {
                              imgElement.src = e.target.result; // Set the image URL directly on the img element
                            }
                          };
                          reader.readAsDataURL(file); // Read the file as a data URL
                          setInputs((prevData) => ({
                            ...prevData,
                            DLfile: file,
                          })); // Update profile in state
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="mb-4 col-6">
                  <label className="form-label" htmlFor="email">
                    Aadhaar Front
                  </label>
                  <img
                    src=""
                    id="AadhaarFImage"
                    alt="Aadhaar Front"
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
                  <div className="input-group input-mini input-sm">
                    <input
                      type="file"
                      id="AadhaarFront"
                      className="form-control"
                      name="AadhaarFront"
                      onChange={(event) => {
                        const file = event.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const imgElement =
                              document.getElementById("AadhaarFImage");
                            if (imgElement) {
                              imgElement.src = e.target.result; // Set the image URL directly on the img element
                            }
                          };
                          reader.readAsDataURL(file); // Read the file as a data URL
                          setInputs((prevData) => ({
                            ...prevData,
                            AadhaarFront: file,
                          })); // Update profile in state
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="mb-4 col-6">
                  <label className="form-label" htmlFor="email">
                    Aadhaar Back
                  </label>
                  <img
                    src=""
                    id="AadhaarBImage"
                    alt="Aadhaar Back"
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
                  <div className="input-group input-mini input-sm">
                    <input
                      type="file"
                      id="AadhaarBack"
                      className="form-control"
                      name="AadhaarBack"
                      onChange={(event) => {
                        const file = event.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const imgElement =
                              document.getElementById("AadhaarBImage");
                            if (imgElement) {
                              imgElement.src = e.target.result; // Set the image URL directly on the img element
                            }
                          };
                          reader.readAsDataURL(file); // Read the file as a data URL
                          setInputs((prevData) => ({
                            ...prevData,
                            AadhaarBack: file,
                          })); // Update profile in state
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="mb-4 col-6">
                  <label className="form-label" htmlFor="email">
                    Police Verification
                  </label>
                  <img
                    src=""
                    id="PoliceVerificationImage"
                    alt="Police Verification"
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
                  <div className="input-group input-mini input-sm">
                    <input
                      type="file"
                      id="PoliceVerification"
                      className="form-control"
                      name="PoliceVerification"
                      onChange={(event) => {
                        const file = event.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const imgElement = document.getElementById(
                              "PoliceVerificationImage"
                            );
                            if (imgElement) {
                              imgElement.src = e.target.result; // Set the image URL directly on the img element
                            }
                          };
                          reader.readAsDataURL(file); // Read the file as a data URL
                          setInputs((prevData) => ({
                            ...prevData,
                            PoliceVerification: file,
                          })); // Update profile in state
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="mb-4 col-6">
                  <label className="form-label" htmlFor="email">
                    Passport
                  </label>
                  <img
                    src=""
                    id="PassPortImage"
                    alt="Passport"
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
                  <div className="input-group input-mini input-sm">
                    <input
                      type="file"
                      id="PassPort"
                      className="form-control"
                      name="PassPort"
                      onChange={(event) => {
                        const file = event.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const imgElement =
                              document.getElementById("PassPortImage");
                            if (imgElement) {
                              imgElement.src = e.target.result; // Set the image URL directly on the img element
                            }
                          };
                          reader.readAsDataURL(file); // Read the file as a data URL
                          setInputs((prevData) => ({
                            ...prevData,
                            PassPort: file,
                          })); // Update profile in state
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="mb-4 col-6">
                  <label className="form-label" htmlFor="email">
                    Electricity
                  </label>
                  <img
                    src=""
                    id="ElectricityImage"
                    alt="Passport"
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
                  <div className="input-group input-mini input-sm">
                    <input
                      type="file"
                      id="Electricity"
                      className="form-control"
                      name="Electricity"
                      onChange={(event) => {
                        const file = event.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const imgElement =
                              document.getElementById("ElectricityImage");
                            if (imgElement) {
                              imgElement.src = e.target.result; // Set the image URL directly on the img element
                            }
                          };
                          reader.readAsDataURL(file); // Read the file as a data URL
                          setInputs((prevData) => ({
                            ...prevData,
                            Electricity: file,
                          })); // Update profile in state
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="mb-4 col-6">
                  <label className="form-label" htmlFor="email">
                    Water Bill
                  </label>
                  <img
                    src=""
                    id="WaterBillImage"
                    alt="Water Bill "
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
                  <div className="input-group input-mini input-sm">
                    <input
                      type="file"
                      id="WaterBill"
                      className="form-control"
                      name="WaterBill"
                      onChange={(event) => {
                        const file = event.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const imgElement =
                              document.getElementById("WaterBillImage");
                            if (imgElement) {
                              imgElement.src = e.target.result; // Set the image URL directly on the img element
                            }
                          };
                          reader.readAsDataURL(file); // Read the file as a data URL
                          setInputs((prevData) => ({
                            ...prevData,
                            WaterBill: file,
                          })); // Update profile in state
                        }
                      }}
                    />
                  </div>
                </div>
                {SubmitLoading ? (
                  <button
                    href="sign-in.html"
                    className="btn btn-thin btn-lg w-100 btn-primary rounded-xl"
                    type="button"
                    onClick={handleSubmit}
                  >
                    {inputs.type === "1" && "Signup as a driver"}{" "}
                    {inputs.type === "2" && "Signup as a vender"}
                  </button>
                ) : (
                  <button
                    disabled
                    className="btn btn-thin btn-lg w-100 btn-primary rounded-xl"
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
              </form>
              <div className="text-center">
                <p className="form-text">
                  By tapping “Sign Up” you accept our{" "}
                  <a href="javascript:void(0);" className="link">
                    terms
                  </a>{" "}
                  and{" "}
                  <a href="javascript:void(0);" className="link">
                    condition
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default SignupUser;
