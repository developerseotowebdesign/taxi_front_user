import { useState, useEffect, useContext, Component } from "react";
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

const LoginComponent = ({ updateAuth }) => {
  const { getUserData } = useBlogContext();

  const KEY = import.meta.env.VITE_REACT_APP_LOGIN_KEY;

  //   const user = encrypt(getCookie('user'),KEY);

  //   console.log('userkey',user);
  //   const userwithout = decrypt(user , KEY);
  //   const userdata = JSON.parse(userwithout);

  //   console.log('userdata',userdata.username);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoginFromLocalStorage = getCookie("token") ? true : false;

  if (isLoginFromLocalStorage) {
    const userdata = decrypt(isLoginFromLocalStorage, KEY);
  }
  const [isLogin, setIsLogin] = useState(isLoginFromLocalStorage);

  const [SubmitLoading, setSubmitLoading] = useState(true); // Add loading state
  const [GetOtpRes, setOtpRes] = useState([]); // Add loading state
  const [GetOtpTyp, setOtpTyp] = useState([]); // Add loading state
  const [hasPassword, setPassword] = useState(false); // Add loading state
  const [NewUser, setNewUser] = useState(false); // Add loading state

  const [formData, setFormData] = useState({
    phone: "",
    Gtoken: "sddwdwdwdd",
    password: "",
  });

  const [inputs, setInputs] = useState({
    phone: "",
    Gtoken: "sddwdwdwdd",
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

      //   const user = encrypt(getCookie('user'),KEY);

      //   console.log('userkey',user);
      //   const userwithout = decrypt(user , KEY);
      //   const userdata = JSON.parse(userwithout);

      //   console.log('userdata',userdata.username);

      const usertoken = getCookie("token");

      if (usertoken) {
        console.log("Token found in local storage"); // Check if this is printed multiple times

        // navigate('/');

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

  // otp start

  const otpInputs = [];

  // Function to handle input change
  // Function to handle input change
  const handleInputChange = async (index, event) => {
    const input = event.target;
    const maxLength = parseInt(input.getAttribute("maxlength"));
    const currentLength = input.value.length;

    // Move focus to the previous input field if backspace is pressed on an empty input
    if (
      event.nativeEvent.inputType === "deleteContentBackward" &&
      currentLength === 0 &&
      index > 0
    ) {
      otpInputs[index - 1].focus();
    }

    // Move focus to the next input field if the current input is filled
    else if (currentLength === maxLength && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }

    // Check if all OTP fields are filled and if the last input field is the one being typed
    const allFilled = otpInputs.every((input) => input.value.trim() !== ""); // Check if all inputs have non-empty values
    if (allFilled && index === otpInputs.length - 1) {
      // Check if the last OTP field is filled
      const combinedValue = otpInputs
        .map((input) => input.value.trim())
        .join(""); // Combine all values into a single string
      if (String(GetOtpRes.otp) === String(combinedValue)) {
        if (GetOtpRes.password === false) {
          toast.success("Otp Verfied successfully!");
          getUserData();
          // Save token and user ID to localStorage
          setCookie("token", GetOtpRes.token, 7); // Expires in 7 days
          setCookie("userId", GetOtpRes.existingUser._id, 7); // Expires in 7 days

          if (GetOtpRes) {
            const { _id, username, email, type, profile } =
              GetOtpRes.existingUser;
            const userToStore = { _id, username, email, type, profile };
            setCookie("user", JSON.stringify(userToStore), 7); // Expires in 7 days
          }

          updateAuth(true);
          // Dispatch login action if you're using Redux
          dispatch(authActions.login());
          setIsLogin(true); // Set isLogin to true when token is found
          //   navigate('/');
          getUserData();
        } else if (GetOtpRes.newUser === true) {
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

              //   navigate('/');
            }
          } catch (error) {
            console.error("Error On Signup:", error);
            toast.error(error.response.data.message);
          } finally {
            setSubmitLoading(true); // Set loading to false after request completion
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
      } else {
        toast.error("Please enter Valid OTP");
      }
    }
  };

  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const submitOTP = async () => {
    setSubmitLoading(false); // Set loading to true before making the request

    try {
      const response = await axiosInstance.post(`/signup-login-otp/`, inputs); // Await the axios post request
      console.log("responseresponse", response);
      if (response.data.password === true) {
        setPassword(true);
      } else {
        handleNext();
        setOtpRes(response.data); // Set the response data to state
        // toast.success('Otp Send successfully!');
        // setTimeout(function () { toast.success(`Your OTP  is ${response.data.otp}`); }, 1000);
      }
      // console.log('dataotp', response.data.password);
    } catch (error) {
      console.error("Error On taxes:", error);
      toast.error(error.response.data.message);
    } finally {
      setSubmitLoading(true); // Set loading to false after request completion
    }
  };

  const submitLoginOTP = async () => {
    setSubmitLoading(false); // Set loading to true before making the request

    try {
      const response = await toast.promise(
        axiosInstance.post("/login-with-otp/", inputs),
        {
          loading: "Sending OTP...", // Loading message
          success: "OTP Send Successfully!", // Success message
          error: "Failed to Send OTP.", // Error message
        }
      );
      setOtpRes(response.data); // Set the response data to state

      // toast.success('Otp Send successfully!');
      // setTimeout(function () { toast.success(`Your OTP  is ${response.data.otp}`); }, 1000);
    } catch (error) {
      console.error("Error On taxes:", error);
      toast.error(error.response.data.message);
    } finally {
      setSubmitLoading(true); // Set loading to false after request completion
    }
  };

  const submitLoginPass = async () => {
    setSubmitLoading(false); // Set loading to true before making the request

    try {
      const response = await axiosInstance.post(`/login-with-pass/`, inputs); // Await the axios post request
      setOtpRes(response.data); // Set the response data to state
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
        // navigate('/');
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
                            className="input-group-text bg-primary text-white"
                            style={{
                              borderTopRightRadius: 0,
                              borderBottomRightRadius: 0,
                            }}
                          >
                            +91
                          </div>
                        </div>
                        <input
                          type="number"
                          className="form-control"
                          id="phone"
                          name="phone"
                          placeholder="Mobile Number*"
                          value={inputs.phone}
                          maxlength={10}
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
                          onKeyPress={(e) => {
                            if (
                              e.key === "Enter" &&
                              inputs.phone.length === 10
                            ) {
                              submitOTP();
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-12 ">
                    <p>
                      By continuing, I agree to the Terms of Use & Privacy
                      Policy
                    </p>

                    {SubmitLoading ? (
                      <button
                        disabled={inputs.phone.length !== 10}
                        className="btn btn-thin btn-md w-100 btn-primary rounded-xl mb-3"
                        onClick={() => {
                          submitOTP();
                        }}
                        type="button"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        className="btn btn-thin btn-md w-100 btn-primary rounded-xl mb-3 d-flex align-items-center justify-content-center w-100"
                        type="button"
                        disabled
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
            </>
          ) : (
            <>
              <h4 className="border-bottom pb-4 mb-4 text-center">
                OTP <span className=""> or</span> Password
              </h4>

              <div className="col-8 m-auto mt-10">
                <button
                  className="btn btn-thin btn-md w-100 btn-primary rounded-xl "
                  type="button"
                  onClick={() => {
                    handleNext();
                    submitLoginOTP();
                  }}
                >
                  Login With OTP
                </button>
                <hr class="or" />
                <button
                  className="btn btn-thin btn-md w-100 btn-primary rounded-xl mb-3"
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
                  Send to {inputs.phone}{" "}
                  <span
                    onClick={handlePrevious}
                    className="badge badge-secondary text-dark cursor"
                  >
                    Edit{" "}
                  </span>{" "}
                </p>

                <div className="d-flex gap-3 m-auto mb-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="col">
                      <input
                        type="number"
                        name="otp"
                        className="form-control text-center OTPInput"
                        placeholder=""
                        maxLength={1} // Set the maximum length to 1 character
                        onInput={(event) => handleInputChange(index, event)} // Handle input change
                        ref={(input) => otpInputs.push(input)} // Add a reference to the input field
                      />
                    </div>
                  ))}
                </div>

                <p className="resend text-muted mb-0">
                  Didn't receive code?{" "}
                  <a href="#" className="text-success" onClick={submitLoginOTP}>
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
                  <span
                    onClick={handlePrevious}
                    className="badge badge-secondary text-dark cursor"
                  >
                    Edit{" "}
                  </span>{" "}
                  {inputs.phone}
                </p>

                <div className="d-flex gap-3 m-auto mb-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="col">
                      <input
                        type="number"
                        name="otp"
                        className="form-control text-center"
                        placeholder=""
                        maxLength={1} // Set the maximum length to 1 character
                        onInput={(event) => handleInputChange(index, event)} // Handle input change
                        ref={(input) => otpInputs.push(input)} // Add a reference to the input field
                      />
                    </div>
                  ))}
                </div>

                <p className="resend text-muted mb-0">
                  Didn't receive code?{" "}
                  <a href="#" className="text-success" onClick={submitLoginOTP}>
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
            Please enter password that is linked to <br />
            <b> {inputs.phone} </b>
            <span
              previewlistener="true"
              className="badge badge-secondary text-dark cursor"
              onClick={() => {
                setPassword(false);
                setCurrentStep(1);
              }}
            >
              Edit{" "}
            </span>{" "}
          </p>

          <div className="needs-validation" noValidate="">
            <div className="row g-4">
              <div className="col-12">
                <div className="col-auto">
                  <div className="input-group mb-2">
                    <input
                      type="text"
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
              className="btn btn-thin btn-md w-100 btn-primary rounded-xl mb-3 mt-2"
              onClick={() => {
                submitLoginPass();
              }}
              type="button"
            >
              Continue
            </button>
          ) : (
            <button
              className="btn btn-accent d-flex align-items-center justify-content-center w-100"
              type="button"
              disabled
            >
              <span class="ms-1">Loading...</span>
              <span
                class="spinner-border spinner-border-sm"
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

export default LoginComponent;
