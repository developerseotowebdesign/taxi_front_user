import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance, { weburl } from "../axiosInstance";
import SlideButton from "react-slide-button";
import getDecryptData from "../helper/getDecryptData";
import maplayout from "../helper/MapStyle";
const currentIcon = {
  url: "/img/dot.svg",
  scaledSize: { width: 40, height: 40 }, // Set the desired size here (width, height)
};

const dropIcon = {
  url: "/img/dotactive.svg",
  scaledSize: { width: 40, height: 40 }, // Set the desired size here (width, height)
};

const taxiIcon = {
  url: "/img/taxi.webp",
  scaledSize: { width: 30, height: 66 }, // Set the desired size here (width, height)
};


const ValetUserPark = () => {
  const MAPKEY = import.meta.env.VITE_REACT_APP_MAP_KEY;

  const decryptdatajson = getDecryptData();
  const [ValetData, setValetData] = useState([]);

  const [SubmitLoading, setSubmitLoading] = useState(false);
  const [SubmitLoadingRide, setSubmitLoadingRide] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");

  const [locationLoading, setLocationLoading] = useState(false);

  const isMounted = useRef(true); // To track if component is mounted

  const { ValetId } = useParams(); // Assuming you have valetId as a param




  const fetchvaletDetails = async () => {
    const dId = decryptdatajson._id;
    try {
      setSubmitLoadingRide(false);
      const { data } = await axiosInstance.get(
        `/user-valet-parking-view/${dId}/${ValetId}`
      );

      if (data?.success) {
        console.log("Valet Ride driver", data);
        setValetData(data?.valet[0]);
        if (!data.valet[0].DropStartLocation && !data?.valet[0]?.DropEndLocation) {
          setSelectedLocation(data?.valet[0]?.PickupStartLocation);
          setDropoffLocation(data?.valet[0]?.PickupEndLocation || '');
        }
        else {
          setSelectedLocation(data?.valet[0]?.DropStartLocation);
          setDropoffLocation(data?.valet[0]?.DropEndLocation);
        }

      }
    } catch (error) {
      console.log(error);
      toast.error("Valet Not found");
      // navigate('/account');
    } finally {
      setSubmitLoadingRide(true);

    }

  };

  const loadMapScript = (zoom) => {
    if (selectedLocation !== "") {
      const scriptId = "google-maps-script";

      if (
        !document.getElementById(scriptId) ||
        !document.querySelector(
          `script[src*="https://maps.googleapis.com/maps/api/js"]`
        )
      ) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDYsdaR0zrPsBDeuyCKFH_4PuCUyWcQ2mE&libraries=geometry,places`;
        script.onload = () => {
          initMap(zoom);
        };
        document.body.appendChild(script);
      } else {
        initMap(zoom);
      }
    }
    return () => {
      window.initMap = null;
    };
  };


  useEffect(() => {
    loadMapScript();
    return () => {
      window.initMap = null;
    };
  }, [selectedLocation, dropoffLocation]);


  // Function to initialize the map
  const initMap = (myzoom) => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 0, lng: 0 }, // Default center
      zoom: myzoom ? myzoom : 15, // Default zoom level
      disableDefaultUI: true, // Disable default UI controls
      styles: maplayout,
    });

    if (selectedLocation !== "" && dropoffLocation !== "") {

      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        polylineOptions: {
          strokeColor: "#0D1722", // Blue color
        },
        suppressMarkers: true, // Suppress default markers
      });

      const request = {
        origin: selectedLocation,
        destination: dropoffLocation,
        travelMode: "DRIVING",
      };

      directionsService.route(request, (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);

          // Custom markers for start and end
          const startMarker = new window.google.maps.Marker({
            position: result.routes[0].legs[0].start_location,

            map,
            icon: currentIcon,
          });

          const endMarker = new window.google.maps.Marker({
            position:
              result.routes[0].legs[result.routes[0].legs.length - 1]
                .end_location,
            map,
            // label: 'E', // Custom label for end marker
            icon: dropIcon,
          });

          // Calculate total distance
          let totalDistance = 0;
          result.routes[0].legs.forEach((leg) => {
            totalDistance += leg.distance.value;
          });
          totalDistance /= 1000; // Convert meters to kilometers

          // Create custom overlay for total distance
          const distanceOverlay = new window.google.maps.OverlayView();
          distanceOverlay.onAdd = function () {
            const div = document.createElement("div");
            div.style.backgroundColor = "#0D1722";
            div.style.color = "white";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.style.position = "absolute";
            div.style.top = "10px"; // Adjust top position as needed
            div.style.left = "10px"; // Adjust left position as needed
            div.textContent = `Total Distance: ${totalDistance.toFixed(2)} km`;
            this.getPanes().floatPane.appendChild(div);
            this.div_ = div;
          };
          distanceOverlay.draw = function () { };
          distanceOverlay.setMap(map);
        } else {
          console.error("Error rendering directions:", status);
        }
      });
    }

    if (selectedLocation !== "") {
      // Geocode selected location and display marker on the map
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: dropoffLocation }, (results, status) => {
        if (status === "OK") {
          map.setCenter(results[0].geometry.location);
          new window.google.maps.Marker({
            map,
            position: results[0].geometry.location,
            icon: taxiIcon, // Set the car image as marker icon
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

    //    // Add marker for drop-off location
    //    if (dropoffLocation !== '') {
    //     const geocoder = new window.google.maps.Geocoder();
    //     geocoder.geocode({ address: dropoffLocation }, (results, status) => {
    //         if (status === 'OK') {
    //             new window.google.maps.Marker({
    //                 map,
    //                 position: results[0].geometry.location,
    //                 icon: dropIcon, // Set the car image as marker icon
    //                 scaledSize: new window.google.maps.Size(0, 0), // Set the size here (width, height)
    //               });
    //         } else {
    //             console.error('Geocode was not successful for the following reason:', status);
    //         }
    //     });
    // }
  };


  useEffect(() => {

    fetchvaletDetails();
  }, []); // Fetch location on initial render

  return (
    <>
      <header className="header header-fixed">
        <div className="header-content">
          <div className="left-content">
            <Link
              to={'/all-valet-service'}
              className="back-btn"
            >
              <i className="ri-arrow-left-line"></i>
            </Link>
          </div>
          <div className="mid-content">
            <h5 className="title d-flex px-2 justify-content-center">
              {" "}
              {SubmitLoadingRide ? (
                <>
                  <span className="overflowOne ">
                    {" "}
                    {ValetData.userId?.carName}{" "}
                  </span>
                </>
              ) : (
                <>
                  <div
                    className="skeleton m-auto mb-3 "
                    style={{ height: 35, width: "80%" }}
                  />
                </>
              )}
            </h5>
          </div>
          <div className="right-content d-flex align-items-center gap-4"></div>
        </div>
      </header>
      <main className="page-content space-top p-b40">
        <div className="container bg-light rounded-md">
          {SubmitLoadingRide ? (
            <>

              <div className="row">

                <div className="col-md-6 col-12">
                  <img src={
                    ValetData && ValetData.userId?.carImage !== ""
                      ? weburl +
                      ValetData.userId.carImage
                        .replace(/\\/g, "/")
                        .replace(/^public\//, "")
                      : "/img/user.svg"
                  } className="border rounded-md" />
                </div>


                <div className="col-md-6 col-12">
                  <div className="bg-light">
                    <table className="table table-bordered mt-2 ">
                      <thead className="thead-dark">
                        <tr>
                          <th className="bg-primary text-white" scope="col">
                            Car Name
                          </th>

                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td scope="row">{ValetData.userId?.carName}</td>

                        </tr>

                        <tr>
                          <th className="bg-primary  text-white" scope="col">
                            Car Status
                          </th>
                        </tr>
                        <tr>
                          <td>
                            <td>
                              {" "}
                              <span
                                className={`badge mb-2 fs-14 ms-2 ${(ValetData && ValetData.userId?.carName === "") &
                                  (ValetData && ValetData.userId?.carNumber === "")
                                  ? "badge-danger cursor"
                                  : !ValetData.PickupStartLocation
                                    ? " badge-danger"
                                    : !ValetData.PickupEndLocation
                                      ? "badge-warning"
                                      : !ValetData.DropStartLocation
                                        ? "badge-primary"
                                        : !ValetData.DropEndLocation
                                          ? "badge-warning"
                                          : "badge-primary"
                                  }
                                
                                fw-light `}
                              >
                                {!ValetData.PickupStartLocation
                                  ? "Waiting for Driver.."
                                  : !ValetData.PickupEndLocation
                                    ? "Driver started towards parking "
                                    : !ValetData.DropStartLocation
                                      ? "Driver parked the car"
                                      : !ValetData.DropEndLocation
                                        ? "Driver picked the car from parking"
                                        : "Driver delivered the car"}
                              </span>
                            </td>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="col-12 mt-4">
                  <h5 className="title">Parking History</h5>
                  <ul className="dz-timeline timeline-number">
                    {ValetData.PickupStartLocation !== '' && (
                      <li className="timeline-item">
                        <div className="line-content-box">
                          <h5>Pickup Start Location</h5>
                          <p className={`${!ValetData.PickupStartLocation && 'text-danger'}`}>
                            {ValetData.PickupStartLocation || 'Waiting For driver'}
                            {ValetData.PickupStartLocation && (
                              <Link
                                to={`https://www.google.co.in/maps/place/${ValetData.PickupStartLocation && ValetData.PickupStartLocation.replace(/ /g, '+').replace('/', '%2')}`}
                                target="_blank"
                                className="badge mb-2 ms-2 badge-primary fw-light mt-1 text-white"
                              >
                                <i className="ri-navigation-fill"></i> View
                              </Link>

                            )}
                          </p>
                        </div>
                        <div className="line-num">1</div>
                      </li>
                    )}

                    {ValetData.PickupEndLocation !== '' && ValetData.PickupEndLocation && (
                      <li className="timeline-item">
                        <div className="line-content-box">
                          <h5>Pickup End Location</h5>
                          <p>
                            {ValetData.PickupEndLocation}
                            <Link
                              to={`https://www.google.co.in/maps/place/${ValetData.PickupEndLocation && ValetData.PickupEndLocation.replace(/ /g, '+')}`}
                              target="_blank"
                              className="badge mb-2 ms-2 badge-primary fw-light mt-1 text-white"
                            >
                              <i className="ri-navigation-fill"></i> View
                            </Link>

                          </p>
                        </div>
                        <div className="line-num">2</div>
                      </li>
                    )}

                    {ValetData.DropStartLocation !== '' && ValetData.DropStartLocation && (
                      <li className="timeline-item">
                        <div className="line-content-box">
                          <h5>Drop Start Location</h5>
                          <p>
                            {ValetData.DropStartLocation}
                            <Link
                              to={`https://www.google.co.in/maps/place/${ValetData.DropStartLocation && ValetData.DropStartLocation.replace(/ /g, '+')}`}
                              target="_blank"
                              className="badge mb-2 ms-2 badge-primary fw-light mt-1 text-white"
                            >
                              <i className="ri-navigation-fill"></i> View
                            </Link>

                          </p>
                        </div>
                        <div className="line-num">3</div>
                      </li>
                    )}

                    {ValetData.DropEndLocation !== '' && ValetData.DropEndLocation && (
                      <li className="timeline-item">
                        <div className="line-content-box">
                          <h5>Drop End Location</h5>
                          <p>
                            {ValetData.DropEndLocation}
                            <Link
                              to={`https://www.google.co.in/maps/place/${ValetData.DropEndLocation && ValetData.DropEndLocation.replace(/ /g, '+')}`}
                              target="_blank"
                              className="badge mb-2 ms-2 badge-primary fw-light mt-1 text-white"
                            >
                              <i className="ri-navigation-fill"></i> View
                            </Link>

                          </p>
                        </div>
                        <div className="line-num">4</div>
                      </li>
                    )}



                  </ul>
                </div>
                <div className="col-12 text-center">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm mb-2"
                    data-bs-toggle="modal"
                    data-bs-target="#basicModal" onClick={loadMapScript}
                  >
                    <i className="ri-map-2-fill me-2"></i>   Show in Map
                  </button>
                </div>

                <div
                  className="modal fade"
                  id="basicModal"

                  aria-hidden="true"
                >
                  <div className="bg-dark-shadow-fix " />
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Map View</h5>
                        <button className="btn-close" data-bs-dismiss="modal">
                          <i className="ri-close-large-line"></i>
                        </button>
                      </div>
                      <div className="modal-body">
                        <div id="map" className=" rounded-md" style={{ height: "40vh " }} />
                      </div>

                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-sm btn-danger light"
                          data-bs-dismiss="modal"
                        >
                          Close
                        </button>

                      </div>
                    </div>
                  </div>
                </div>



              </div>




            </>
          ) : (
            <>
              <div
                className="skeleton m-auto mb-3 "
                style={{ height: "60vh", width: "95%" }}
              />

              <div
                className="skeleton m-auto mb-3 "
                style={{ height: 45, width: "95%", maxWidth: "300px" }}
              />
            </>
          )}
        </div>

      </main >
    </>
  );
};

export default ValetUserPark;
