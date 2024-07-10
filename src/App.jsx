import { useState, useEffect, useContext, Component } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./assets/css/style.css";
import Home from "./user/Home";
import MyLocation from "./user/MyLocation";
import OneWay from "./user/OneWay";
import OutStation from "./user/OutStation";
import Profile from "./user/Profile";
import Login from "./user/Login";
import Ride from "./user/Ride";
import StartRide from "./user/StartRide";
import RideView from "./user/RideView";
import Chat from "./user/Chat";
import Success from "./user/Success";
import Notification from "./user/Notification";
import Valet from "./user/Valet";
import ValetView from "./user/ValetView";
import ProfileEdit from "./user/ProfileEdit";
import ValetUser from "./user/ValeUser";
import ValetUserPark from "./user/ValetUserPark";
import AllValetUser from "./user/AllValetUser";
// driver route
import StartDriverRide from "./driver/StartDriverRide";
import HomeDriver from "./driver/HomeDriver";
import ProfileDriver from "./driver/ProfileDriver";
import RidesDriver from "./driver/RidesDriver";
import RidesDriverView from "./driver/RidesDriverView";
import NotificationDriver from "./driver/NotificationDriver";
import ChatDriver from "./driver/ChatDriver";
import usePreventZoom from "./helper/usePreventZoom";
import { Toaster } from "react-hot-toast";
import { BlogProvider } from "./fetchdata/BlogContext";
import getCookie from "./helper/getCookie";
import { encrypt, decrypt } from "./helper/encryption";
import TokenValidator from "./fetchdata/TokenValidator";
import getDecryptData from "./helper/getDecryptData";
import CheckConnection from "./helper/CheckConnection";
import ErrorPage from "./helper/ErrorPage";
import SignupUser from "./user/SignupUser";
import WalletDriver from "./driver/WalletDriver";
import ValetDriver from "./driver/ValetDriver";
import ValetDriverView from "./driver/ValetDriverView";
import ValetDriverPark from "./driver/ValetDriverPark";
// vendor routes
import HomeVendor from "./vendor/HomeVendor";
import WalletVendor from "./vendor/WalletVendor";
import ValetVendor from "./vendor/ValetVendor";
import ProfileVendor from "./vendor/ProfileVendor";
import NotificationVendor from "./vendor/NotificationVendor";
import ChatVendor from "./vendor/ChatVendor";
import ValetVendorView from "./vendor/ValetVendorView";
import AddDriverVendor from "./vendor/AddDriverVendor";
import ProfileEditVendor from "./vendor/ProfileEditVendor";

function App() {
  const [isError, setIsError] = useState(false);

  // const KEY = import.meta.env.VITE_REACT_APP_LOGIN_KEY;

  // const user = encrypt(getCookie('user'),KEY);

  // console.log('userkey',user);
  // const userwithout = decrypt(user , KEY);
  // const userdata = JSON.parse(userwithout);

  // console.log('userdata',userdata.username);

  const location = useLocation(); // Get the current location from React Router
  const isLoginFromLocalStorage = getCookie("token") ? true : false;
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(
    isLoginFromLocalStorage
  );

  const [isUsertype, setisUsertype] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsUserAuthenticated(isLoginFromLocalStorage);
      const mydata = await getDecryptData();
      if (mydata) {
        const mydatatype = mydata.type;
        setisUsertype(mydatatype);
      }

      console.log("mydata", mydata, isLoginFromLocalStorage);
      // handle mydata if necessary
    };

    fetchData();

    // const timeoutId = setTimeout(() => {
    //   const rootElement = document.getElementById('root');
    //   if (rootElement.innerHTML === '') {
    //     rootElement.innerHTML = "<p>This is some inner HTML content added dynamically</p>";
    //     setIsError(true);
    //     console.log('error found')
    //   }
    //   console.log(' found', rootElement)

    // }, 3000); // Adjust the timeout duration as needed

    // return () => clearTimeout(timeoutId);
    window.scrollTo(0, 0);
  }, [isLoginFromLocalStorage, location.pathname]);

  // usePreventZoom();

  return (
    <>
      <CheckConnection>
        {/* <ErrorPage isError={isError} /> */}
        <BlogProvider>
          <TokenValidator />
          <Toaster />
          <Routes>
            <Route
              path="/"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <Navigate to="/vendor/home" />) ||
                    (isUsertype === 1 && <Navigate to="/driver/home" />))) || (
                  <Home />
                )
              }
            />
            <Route path="/my-location" element={<MyLocation />} />
            <Route
              path="/one-way"
              element={<OneWay updateAuthStatus={setIsUserAuthenticated} />}
            />
            <Route
              path="/out-station"
              element={<OutStation updateAuthStatus={setIsUserAuthenticated} />}
            />
            <Route
              path="/valet"
              element={<Valet updateAuthStatus={setIsUserAuthenticated} />}
            />

            <Route
              path="/valet-view/:ValetId"
              element={<ValetView updateAuthStatus={setIsUserAuthenticated} />}
            />

            <Route
              path="/all-valet"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <ValetUser />) ||
                    (isUsertype === 2 && <Navigate to="/vendor/home/" />) ||
                    (isUsertype === 1 && (
                      <Navigate to="/driver/home/" />
                    )))) || <Navigate to="/login" />
              }
            />

            <Route
              path="/my-valet/:ValetId"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <ValetUserPark />) ||
                    (isUsertype === 2 && <Navigate to="/vendor/home/" />) ||
                    (isUsertype === 1 && (
                      <Navigate to="/driver/home/" />
                    )))) || <Navigate to="/login" />
              }
            />


            <Route
              path="/all-valet-service/"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <AllValetUser />) ||
                    (isUsertype === 2 && <Navigate to="/vendor/home/" />) ||
                    (isUsertype === 1 && (
                      <Navigate to="/driver/home/" />
                    )))) || <Navigate to="/login" />
              }
            />



            <Route
              path="/profile"
              element={
                isUserAuthenticated ? (
                  isUsertype !== 1 ? (
                    <Profile />
                  ) : (
                    <Navigate to="/driver/profile" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/profile/edit/"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <ProfileEdit />) ||
                    (isUsertype === 2 && (
                      <Navigate to="/driver/home/profile/edit/" />
                    )) ||
                    (isUsertype === 1 && (
                      <Navigate to="/vendor/home/profile/edit/" />
                    )))) || <Navigate to="/login" />
              }
            />
            <Route
              path="/login"
              element={
                !isUserAuthenticated ? (
                  <Login updateAuthStatus={setIsUserAuthenticated} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/rides"
              element={
                isUserAuthenticated ? (
                  isUsertype !== 1 ? (
                    <Ride />
                  ) : (
                    <Navigate to="/driver/rides" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/ride/:cId/:orderId"
              element={
                isUserAuthenticated ? (
                  isUsertype !== 1 ? (
                    <RideView />
                  ) : (
                    <Navigate to="/driver/home" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/chat/:senderId/:bookid"
              element={
                isUserAuthenticated ? (
                  isUsertype !== 1 ? (
                    <Chat />
                  ) : (
                    <Navigate to="/driver/home" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/success" element={<Success />} />
            <Route
              path="/notification"
              element={
                isUserAuthenticated ? (
                  isUsertype !== 1 ? (
                    <Notification />
                  ) : (
                    <Navigate to="/driver/notification" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/start-ride"
              element={
                isUserAuthenticated ? <StartRide /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/start-driver-ride"
              element={
                isUserAuthenticated ? (
                  <StartDriverRide />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/signup-user"
              element={
                !isUserAuthenticated ? (
                  <SignupUser />
                ) : isUsertype === 1 ? (
                  <Navigate to="/driver/home" />
                ) : isUsertype === 2 ? (
                  <Navigate to="/vendor/home" />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/driver/home"
              element={
                isUserAuthenticated ? (
                  isUsertype === 0 ? (
                    <Navigate to="/" />
                  ) : isUsertype === 2 ? (
                    <Navigate to="/vendor/home" />
                  ) : (
                    <HomeDriver />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/driver/profile"
              element={
                isUserAuthenticated ? (
                  isUsertype !== 0 ? (
                    <ProfileDriver />
                  ) : (
                    <Navigate to="/profile" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/driver/rides"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && (
                    <Navigate to="/rides" />
                  )) ||
                    (isUsertype === 2 && <Navigate to="/vendor/valet" />) ||
                    (isUsertype === 1 && <RidesDriver />))) || (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/driver/rides/:cId/:orderId"
              element={
                isUserAuthenticated ? (
                  isUsertype !== 0 && <RidesDriverView />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/driver/notification"
              element={
                isUsertype !== 0 ? (
                  <NotificationDriver />
                ) : (
                  <Navigate to="/notification" />
                )
              }
            />
            <Route
              path="/driver/chat/:senderId/:bookid"
              element={
                isUserAuthenticated ? (
                  isUsertype !== 0 ? (
                    <ChatDriver />
                  ) : (
                    <Navigate to="/notification" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/driver/wallet/"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <Navigate to="/vendor/wallet" />) ||
                    (isUsertype === 1 && <WalletDriver />))) || (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/driver/valet/"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <Navigate to="/vendor/wallet" />) ||
                    (isUsertype === 1 && <ValetDriver />))) || (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/driver/valet/:ValetId"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <Navigate to="/vendor/valet" />) ||
                    (isUsertype === 1 && <ValetDriverView />))) || (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/driver/valet/park/:ValetId"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <Navigate to="/vendor/valet" />) ||
                    (isUsertype === 1 && <ValetDriverPark />))) || (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/vendor/Home/"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <HomeVendor />) ||
                    (isUsertype === 1 && <Navigate to="/vendor/home" />))) || (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/vendor/wallet/"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <WalletVendor />) ||
                    (isUsertype === 1 && (
                      <Navigate to="/driver/wallet" />
                    )))) || <Navigate to="/login" />
              }
            />
            <Route
              path="/vendor/valet/"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <ValetVendor />) ||
                    (isUsertype === 1 && <Navigate to="/driver/rides" />))) || (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/vendor/profile/"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <ProfileVendor />) ||
                    (isUsertype === 1 && <Navigate to="/driver/rides" />))) || (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/vendor/notification"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <NotificationVendor />) ||
                    (isUsertype === 1 && (
                      <Navigate to="/driver/notification" />
                    )))) || <Navigate to="/login" />
              }
            />
            <Route
              path="/vendor/chat/:senderId/:bookid"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && (
                    <Navigate to="/rides" />
                  )) ||
                    (isUsertype === 2 && <ChatVendor />) ||
                    (isUsertype === 1 && <Navigate to="/driver/rides" />))) || (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/vendor/valet/:cId/:ValetId"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <ValetVendorView />) ||
                    (isUsertype === 1 && <Navigate to="/driver/home" />))) || (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/vendor/add-driver"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <AddDriverVendor />) ||
                    (isUsertype === 1 && <Navigate to="/driver/home" />))) || (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/vendor/profile/edit"
              element={
                (isUserAuthenticated &&
                  ((isUsertype !== 1 && isUsertype !== 2 && <Home />) ||
                    (isUsertype === 2 && <ProfileEditVendor />) ||
                    (isUsertype === 1 && (
                      <Navigate to="/driver/profile/edit/" />
                    )))) || <Navigate to="/login" />
              }
            />
          </Routes>
        </BlogProvider>
      </CheckConnection>
    </>
  );
}

export default App;
