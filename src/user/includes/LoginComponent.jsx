import { useState, useEffect, useRef, useContext, Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import axiosInstance from "../../axiosInstance";
import { useDispatch } from "react-redux";
import { authActions } from "../../redux/store";
import getCookie from "../../helper/getCookie";
import setCookie from "../../helper/setCookie";
import { encrypt, decrypt } from "../../helper/encryption";
import { useBlogContext } from "../../fetchdata/BlogContext";
import PropTypes from "prop-types"; // Import PropTypes

const LoginComponent = ({ updateAuth }) => {
  const { getUserData } = useBlogContext();

  const KEY = import.meta.env.VITE_REACT_APP_LOGIN_KEY;

  // Assuming countdown state is managed using useState hook
  const [countdown, setCountdown] = useState(0);

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // const isLoginFromLocalStorage = localStorage.getItem('token') ? true : false;
  const isLoginFromLocalStorage = getCookie("token") ? true : false;

  const [isLogin, setIsLogin] = useState(isLoginFromLocalStorage);

  const [SubmitLoading, setSubmitLoading] = useState(true); // Add loading state
  const [GetOtpRes, setOtpRes] = useState([]); // Add loading state
  const [GetOtpTyp, setOtpTyp] = useState([]); // Add loading state
  const [hasPassword, setPassword] = useState(false); // Add loading state
  const [NewUser, setNewUser] = useState(false); // Add loading state

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const [inputs, setInputs] = useState({
    phone: "",
    password: "",
  });

  const credentials = {
    email: inputs.email,
    password: inputs.password,
  };
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const checkUserToken = async () => {
      console.log("Effect is running");
      // Check if this is printed multiple times

      // const usertoken = localStorage.getItem('token');
      const usertoken = getCookie("token");

      if (usertoken) {
        console.log("Token found in local storage"); // Check if this is printed multiple times

        navigate("/");

        toast.success("Welcome back");
      }
    };
    checkUserToken();
  }, [dispatch, navigate]);

  //handle input change
  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  //form handle
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/login", credentials);
      const { success, token, user, message } = data;

      if (success) {
        // Save token and user ID to localStorage

        // localStorage.setItem('token', user.token);
        setCookie("token", user.token, 7); // Expires in 7 days

        //  localStorage.setItem('userId', user._id);
        setCookie("userId", user._id, 7); // Expires in 7 days

        toast.success("login sucesssfully");

        // Dispatch login action if you're using Redux
        dispatch(authActions.login());

        navigate("/");
      }
      console.log("Message from backend:", message);
    } catch (error) {
      console.error("Error during login:", error);
      // Handle network errors, API issues, etc.
      toast.error(error.response.data.message);
    }
  };

  const [combinedOTP, setcombinedOTP] = useState(""); // Add loading state

  // otp start

  const otpInputs = [];

  const handleInputChange = async (index, event) => {
    const input = event.target;
    const maxLength = parseInt(input.getAttribute("maxlength"));
    const currentLength = input.value.length;

    if (
      event.nativeEvent.inputType === "deleteContentBackward" &&
      currentLength === 0 &&
      index > 0
    ) {
      otpInputs[index - 1].focus();
    } else if (currentLength === maxLength && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }

    const allFilled = otpInputs.every((input) => input.value.trim() !== "");
    if (allFilled && index === otpInputs.length - 1) {
      const combinedValue = otpInputs
        .map((input) => input.value.trim())
        .join("");
      setcombinedOTP(combinedValue);
    }
  };

  const verifyOTPFinal = async () => {
    setSubmitLoading(false);

    const MYOTPinputs = { OTP: Number(combinedOTP), HASHOTP: GetOtpRes.otp };

    // if (MYOTPinputs.OTP === MYOTPinputs.HASHOTP) {
    // }

    try {
      const response = await axiosInstance.post(
        `/login-verify-otp`,
        MYOTPinputs
      ); // Await the axios post request
      console.log("responseresponse", response);
      const { success } = response.data;
      if (success) {
        if (GetOtpRes.password === false) {
          toast.success("Otp Verfied successfully!");

          setCookie("token", GetOtpRes.token, 7); // Expires in 7 days

          setCookie("userId", GetOtpRes.existingUser._id, 7); // Expires in 7 days

          if (GetOtpRes) {
            const { _id, username, email } = GetOtpRes.existingUser;
            const userToStore = { _id, username, email };

            setCookie("user", JSON.stringify(userToStore), 7); // Expires in 7 days
          }

          updateAuth(true);

          dispatch(authActions.login());
          setIsLogin(true); // Set isLogin to true when token is found
          navigate("/");
        } else if (GetOtpRes.newUser === true) {
          console.log("GetOtpResGetOtpRes", GetOtpRes);
          try {
            const response = await axiosInstance.post(
              `/signup-new-user/`,
              inputs
            ); // Await the axios post request

            if (response) {
              toast.success("Otp Verfied New successfully!");

              const { _id, username, email, type, profile } =
                response.data.existingUser;
              const userToStore = { _id, username, email, type, profile };

              const encrptdata = encrypt(JSON.stringify(userToStore), KEY);
              // Save token and user ID to localStorage
              setCookie("token", encrptdata, 7); // Expires in 7 days

              updateAuth(true);
              // Dispatch login action if you're using Redux
              dispatch(authActions.login());
              setIsLogin(true); // Set isLogin to true when token is found
              getUserData();

              navigate("/");
            }
          } catch (error) {
            console.error("Error On Signup:", error);
            toast.error(error.response.data.message);
          } finally {
            setSubmitLoading(true);
          }
        } else {
          toast.success("Otp Verfied successfully!");
          getUserData();
          const { _id, username, email, type, profile } =
            GetOtpRes.existingUser;
          const userToStore = { _id, username, email, type, profile };

          const encrptdata = encrypt(JSON.stringify(userToStore), KEY);
          // Save token and user ID to localStorage
          setCookie("token", encrptdata, 7); // Expires in 7 days

          updateAuth(true);
          // Dispatch login action if you're using Redux
          dispatch(authActions.login());
          setIsLogin(true); // Set isLogin to true when token is found
          //   navigate('/');
          getUserData();
        }
        setSubmitLoading(true);
      }
    } catch (error) {
      console.error("Error On OTP Verify:", error);
      toast.error(error.response.data.message);
    } finally {
      setSubmitLoading(true);
    }
  };

  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  useEffect(() => {
    setIsChecked(false);
  }, [currentStep]);

  const submitOTP = async () => {
    setSubmitLoading(false);

    try {
      const response = await axiosInstance.post(`/signup-login-otp/`, inputs);
      console.log("responseresponse", response);
      if (response.data.password === true) {
        setPassword(true);
      } else {
        handleNext();
        setOtpRes(response.data);
      }
    } catch (error) {
      console.error("Error On taxes:", error);
      toast.error(error.response.data.message);
    } finally {
      setSubmitLoading(true);
    }
  };

  const [isRequesting, setIsRequesting] = useState(false);
  const lastRequestTimeRef = useRef(null);

  const submitResOTP = async () => {
    if (isRequesting) {
      return;
    }

    setSubmitLoading(false);
    setIsRequesting(true);
    lastRequestTimeRef.current = Date.now();

    try {
      const response = await axiosInstance.post(`/login-with-otp/`, inputs);
      setOtpRes(response.data);
      toast.success("Otp Sent successfully!");
    } catch (error) {
      console.error("Error On taxes:", error);
      toast.error(error.response.data.message);
    } finally {
      setSubmitLoading(true);
      setIsRequesting(false);
    }
  };

  const handleRequestAgainClick = () => {
    const currentTime = Date.now();
    if (
      !isRequesting &&
      (!lastRequestTimeRef.current ||
        currentTime - lastRequestTimeRef.current >= 30000)
    ) {
      submitResOTP();
      setCountdown(30);
      const interval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            clearInterval(interval);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    } else {
      const timeLeft = Math.ceil(
        (lastRequestTimeRef.current + 30000 - currentTime) / 1000
      );

      toast.error(
        `Please wait for ${timeLeft} seconds before requesting again.`
      );
    }
  };

  const submitLoginOTP = async () => {
    setSubmitLoading(false);

    try {
      const response = await axiosInstance.post(`/login-with-otp/`, inputs);
      setOtpRes(response.data);

      toast.success("Otp Send successfully!");
    } catch (error) {
      console.error("Error On taxes:", error);
      toast.error(error.response.data.message);
    } finally {
      setSubmitLoading(true);
    }
  };

  const submitLoginPass = async () => {
    setSubmitLoading(false);

    try {
      const response = await axiosInstance.post(`/login-with-pass/`, inputs); // Await the axios post request
      setOtpRes(response.data);
      console.log("dataotp", response.data);
      if (response.data.checkpass === true) {
        toast.success("Login successfully!");

        const { _id, username, email, type, profile } =
          response.data.existingUser;
        const userToStore = { _id, username, email, type, profile };

        const encrptdata = encrypt(JSON.stringify(userToStore), KEY);
        // Save token and user ID to localStorage
        setCookie("token", encrptdata, 7); // Expires in 7 days

        updateAuth(true);
        // Dispatch login action if you're using Redux
        dispatch(authActions.login());
        setIsLogin(true); // Set isLogin to true when token is found
        navigate("/");
        getUserData();
      }
    } catch (error) {
      console.error("Error On taxes:", error);
      toast.error(error.response.data.message);
    } finally {
      setSubmitLoading(true); // Set loading to false after request completion
    }
  };

  useEffect(() => {
    console.log("GetOtpResGetOtpRes", GetOtpRes);
    console.log("countdown", countdown);
  }, [GetOtpRes, countdown]);

  useEffect(() => {
    console.log("GetOtpResGetOtpRes", GetOtpRes);
    if (GetOtpRes.otp !== null && GetOtpRes.otp !== undefined) {
      toast.success(GetOtpRes.otp);
    }
  }, [GetOtpRes]);

  return (
    <>
      {currentStep === 1 && (
        <>
          {!hasPassword ? (
            <>
              <div className="needs-validation" noValidate="">
                <div className="row g-4">
                  <div className="col-12">
                    <div className="col-auto">
                      <div className="input-group mb-2">
                        <div className="input-group-prepend">
                          <div
                            className="input-group-text btn-primary bg-primary text-white"
                            style={{
                              borderTopRightRadius: 0,
                              borderBottomRightRadius: 0,
                            }}
                          >
                            +91
                          </div>
                        </div>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          placeholder="Mobile Number*"
                          value={inputs.phone}
                          // maxlength={10}
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
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-12 ">
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={isChecked}
                        id="flexCheckDefault"
                        onChange={handleCheckboxChange}
                      />
                      <label className="me-1" htmlFor="flexCheckDefault">
                        I agree
                      </label>{" "}
                      <span>
                        {" "}
                        to the{" "}
                        <Link to="/page/65f84522dabc2fa9d8b6d96d">
                          {" "}
                          Terms of Use
                        </Link>{" "}
                        &amp;
                        <Link to="/page/663476f4313dc333e67eceed">
                          {" "}
                          Privacy Policy{" "}
                        </Link>{" "}
                      </span>
                    </div>

                    {SubmitLoading ? (
                      <button
                        disabled={!isChecked || inputs.phone.length !== 10}
                        className="btn btn-primary d-flex align-items-center justify-content-center w-100 mt-4"
                        onClick={() => {
                          submitOTP();
                        }}
                        type="button"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary d-flex align-items-center justify-content-center w-100"
                        type="button"
                        disabled
                      >
                        <span className="ms-1">Loading...</span>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h4 className="border-bottom pb-4 mb-4 text-center">
                OTP <span className=""> or</span> Password
              </h4>

              <div className="col-8 m-auto mt-10">
                <button
                  className="btn btn-primary btn-shadow d-block w-100 mt-10"
                  type="button"
                  onClick={() => {
                    handleNext();
                    handleRequestAgainClick();
                    // submitLoginOTP();
                  }}
                >
                  Login With OTP
                </button>
                <hr className="or" />
                <button
                  className="btn btn-primary btn-shadow d-block w-100"
                  type="button"
                  onClick={() => setCurrentStep(3)}
                >
                  Login With Password
                </button>
              </div>
            </>
          )}
        </>
      )}

      {currentStep === 2 && (
        <>
          <div className="card-body p-5 text-center">
            {!hasPassword ? (
              <>
                <h4>Verify with OTP</h4>
                <p>
                  Send to{" "}
                  <a
                    onClick={handlePrevious}

                    className="text-success fw-bold"
                    href="#"
                  >
                    Edit{" "}
                  </a>{" "}
                  {inputs.phone}
                </p>

                <div className="d-flex gap-3  col-12 m-auto mb-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="col">
                      <input
                        type="tel"
                        name="otp"
                        className="form-control text-center"
                        placeholder=""
                        maxLength={1} // Set the maximum length to 1 character
                        // onInput={(event) => handleInputChange(index, event)} // Handle input change
                        onInput={(event) => {
                          const value = event.target.value;
                          if (value.length > 1) {
                            console.log("Input length is greater than 1");
                          } else {
                            handleInputChange(index, event);
                          }
                        }} // Handle input change
                        ref={(input) => otpInputs.push(input)} // Add a reference to the input field
                      />
                    </div>
                  ))}
                </div>
                {countdown > 0 && (
                  <p>
                    Resend OTP in{" "}
                    <span className="text-success">00.{countdown} </span>
                  </p>
                )}

                {SubmitLoading ? (
                  <button
                    className="btn btn-primary d-flex align-items-center justify-content-center w-100"
                    onClick={() => {
                      verifyOTPFinal();
                    }}
                    type="button"
                  >
                    Verify OTP
                  </button>
                ) : (
                  <button
                    className="btn btn-primary d-flex align-items-center justify-content-center w-100"
                    type="button"
                    disabled
                  >
                    <span className="ms-1">Loading...</span>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  </button>
                )}

                <p className="resend text-muted mb-0 mt-2">
                  {"Didn't"} receive code?{" "}
                  <a
                    href="#"
                    onClick={handleRequestAgainClick}
                    className="text-success fw-bold"
                  >
                    Request again
                  </a>
                </p>
                {/* <hr></hr>
  <p className="resend text-muted mb-0">
   Login Using{" "}
    <a href="" previewlistener="true">
  Password
    </a>
  </p> */}
              </>
            ) : (
              <>
                <h4>Verify with OTP</h4>
                <p>
                  Send to{" "}
                  <a
                    onClick={handlePrevious}
                    href="#"
                    className="text-success fw-bold"
                  >
                    Edit{" "}
                  </a>{" "}
                  {inputs.phone}
                </p>

                <div className="d-flex gap-3  col-12 m-auto mb-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="col">
                      <input
                        type="tel"
                        name="otp"
                        className="form-control text-center"
                        placeholder=""
                        maxLength={1} // Set the maximum length to 1 character
                        onInput={(event) => {
                          const value = event.target.value;
                          if (value.length > 1) {
                            console.log("Input length is greater than 1");
                          } else {
                            handleInputChange(index, event);
                          }
                        }} // Handle input change
                        ref={(input) => otpInputs.push(input)} // Add a reference to the input field
                      />
                    </div>
                  ))}
                </div>

                {countdown > 0 && (
                  <p>
                    Resend OTP in{" "}
                    <span className="text-success">00.{countdown} </span>
                  </p>
                )}

                {SubmitLoading ? (
                  <button
                    className="btn btn-primary d-flex align-items-center justify-content-center w-100"
                    onClick={() => {
                      verifyOTPFinal();
                    }}
                    type="button"
                  >
                    Verify OTP
                  </button>
                ) : (
                  <button
                    className="btn btn-primary d-flex align-items-center justify-content-center w-100"
                    type="button"
                    disabled
                  >
                    <span className="ms-1">Loading...</span>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  </button>
                )}

                <p className="resend text-muted mb-0">
                  {"Didn't"} receive code?{" "}
                  <a
                    href="#"
                    onClick={handleRequestAgainClick}
                    className="text-success fw-bold"
                  >
                    Request again
                  </a>
                </p>
              </>
            )}
          </div>
        </>
      )}
      {currentStep === 3 && (
        <>
          <h4 className="border-bottom pb-4 mb-4 text-center">
            Login With Password
          </h4>
          <p className="mb-2">
            {" "}
            Please enter password that is linked to <br />{" "}
            <b> {inputs.phone} </b>{" "}
            <a
              className="text-success fw-bold"
              href="#"
              onClick={() => {
                setPassword(false);
                setCurrentStep(1);
              }}
            >
              Edit{" "}
            </a>{" "}
          </p>

          <div className="needs-validation" noValidate="">
            <div className="row g-4">
              <div className="col-12">
                <div className="col-auto">
                  <div className="input-group mb-2">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      placeholder="Enter Password*"
                      value={inputs.password}
                      onChange={handleChange} // Add onChange handler to manage input changes
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && inputs.phone.length === 10) {
                          submitLoginPass();
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {SubmitLoading ? (
            <button
              disabled={inputs.phone.length !== 10}
              className="btn btn-primary d-flex align-items-center justify-content-center w-100"
              onClick={() => {
                submitLoginPass();
              }}
              type="button"
            >
              Continue
            </button>
          ) : (
            <button
              className="btn btn-primary d-flex align-items-center justify-content-center w-100"
              type="button"
              disabled
            >
              <span className="ms-1">Loading...</span>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            </button>
          )}
        </>
      )}
    </>
  );
};



LoginComponent.propTypes = {
  updateAuth: PropTypes.bool.isRequired,
};


export default LoginComponent;
