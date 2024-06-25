import { useEffect, useState } from "react";

import Header from "./includes/Header";
import Footer from "./includes/Footer";
import NavBar from "./includes/NavBar";
import { Swiper, SwiperSlide } from "swiper/react";

import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import maplayout from "../helper/MapStyle";

const currentIcon = {
  url: "/img/dot.svg", // URL of the car icon image
  scaledSize: { width: 40, height: 40 }, // Set the desired size here (width, height)
};

const Home = () => {
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    const location = localStorage.getItem("selectedLocation");
    if (location) {
      setSelectedLocation(location);
    } else {
      // toast.error('Please Select Location')
    }
  }, []);

  useEffect(() => {
    const loadMapScript = () => {
      if (selectedLocation !== "") {
        if (
          !document.querySelector(
            `script[src*="https://maps.googleapis.com/maps/api/js"]`
          )
        ) {
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDYsdaR0zrPsBDeuyCKFH_4PuCUyWcQ2mE&libraries=places&callback=initMap`;
          script.async = true;
          script.defer = true;
          window.initMap = initMap;
          document.body.appendChild(script);
        } else {
          initMap();
        }
      }
    };

    loadMapScript();

    return () => {
      window.initMap = null;
    };
  }, [selectedLocation]);

  // Function to initialize the map
  const initMap = () => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 0, lng: 0 }, // Default center
      zoom: 15, // Default zoom level
      disableDefaultUI: true, // Disable default UI controls
      styles: maplayout,
    });
    if (selectedLocation !== "") {
      // Geocode selected location and display marker on the map
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: selectedLocation }, (results, status) => {
        if (status === "OK") {
          map.setCenter(results[0].geometry.location);
          new window.google.maps.Marker({
            map,
            position: results[0].geometry.location,
            icon: currentIcon, // Set the car image as marker icon
            scaledSize: new window.google.maps.Size(0, 0), // Set the size here (width, height)
          });
        } else {
          console.error(
            "Geocode was not successful for the following reason:",
            status
          );
        }
      });
    }
  };

  return (
    <>
      <Header />

      <div className="dz-nav-floting">
        <main className="page-content dz-gradient-shape mypadding">
          <div className="container px-0 ">
            <div
              id="map"
              style={{ height: "50vh", width: "100%" }}
              className="rounded-md"
            >
              <div
                style={{ height: "50vh", width: "100%" }}
                className="d-flex justify-content-center align-items-center flex-column"
              >
                <i className="ri-error-warning-fill fs-1 text-warning"></i>
                <p className="fs-3">Location Not Found</p>
              </div>
            </div>

            <div className="bg-white rounded-md  p-3 shadow-sm mt-3">
              <div className="d-flex align-items-center justify-content-between mb-2 mt-2">
                <div className="d-flex align-items-center gap-3">
                  <div>
                    <p className="m-0 font-size-14 txt-grey"> Hey User</p>
                    <h2 className="fw-bolder mb-1 font-size-22">
                      {/* {" "} {JSON.stringify(import.meta.env.VITE_REACT_APP_LOGIN_KEY)} */}
                      Where are you going?
                    </h2>{" "}
                  </div>
                </div>
              </div>
              <div className="row">
                <Link to="/one-way" className="col-4 text-center text-dark">
                  {" "}
                  <img
                    className="carousel__media"
                    width="50"
                    src="/img/road.svg"
                  />
                  <h5 className="mt-2 mb-0">Local </h5>
                </Link>

                <Link to="/out-station" className="col-4 text-center text-dark">
                  {" "}
                  <img
                    className="carousel__media"
                    width="50"
                    src="/img/outstation.svg"
                  />
                  <h5 className="mt-2 mb-0">OutStation</h5>
                </Link>
                <Link to="/valet" className="col-4 text-center text-dark">
                  {" "}
                  <img
                    className="carousel__media"
                    width="50"
                    src="/img/valet.svg"
                  />
                  <h5 className="mt-2 mb-0">Valet</h5>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <NavBar />
      </div>

      <Footer />
    </>
  );
};

export default Home;
