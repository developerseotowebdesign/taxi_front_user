import { useEffect, useState } from "react";
import Header from "./includes/Header";
import Footer from "./includes/Footer";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const MyLocation = () => {
  const MAPKEY = import.meta.env.VITE_REACT_APP_MAP_KEY;

  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const storedLocation = localStorage.getItem("selectedLocation");
    if (storedLocation) {
      setSearchValue(storedLocation);
    }
  }, []);

  const [searchResults, setSearchResults] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (
        !document.querySelector(
          `script[src*="https://maps.googleapis.com/maps/api/js"]`
        )
      ) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPKEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeAutocomplete;
        document.body.appendChild(script);
      }
    };

    const initializeAutocomplete = () => {
      const autocomplete = new window.google.maps.places.Autocomplete(
        document.getElementById("location-input")
      );
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        console.log(place);
      });
    };

    loadGoogleMaps();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAPKEY}`
          )
            .then((response) => response.json())
            .then((data) => {
              console.log("data", data);
              const address = data.results[0].formatted_address;
              setCurrentLocation(address);
            })
            .catch((error) => {
              console.error("Error fetching current location:", error);
            });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (e.target.value.trim() === "") {
      setSearchResults([]);
      return;
    }
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      { input: e.target.value },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSearchResults(predictions);
        } else {
          setSearchResults([]);
        }
      }
    );
  };

  const handleSearchResultClick = (result) => {
    setSearchValue(result.description);
    toast.success("Location Update");

    // Save selected location description in local storage
    localStorage.setItem("selectedLocation", result.description);

    // Example: You may need to fetch additional details to get latitude and longitude
    // This depends on your API and how you retrieve location details

    // For example, if you have a place_id, you might fetch details using Google Maps Places API
    // Here's a basic example, assuming you have access to a Places API service

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    service.getDetails({ placeId: result.place_id }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const { lat, lng } = place.geometry.location;

        // Store latitude and longitude in localStorage
        localStorage.setItem("latitude", lat());
        localStorage.setItem("longitude", lng());

        // Optionally, you can update the state or perform other actions here
      } else {
        console.error('Error fetching place details:', status);
      }
    });

    navigate("/");
  };

  const handleSaveCurrentLocation = () => {
    if (currentLocation && latitude && longitude) {
      setSearchValue(currentLocation);
      localStorage.setItem("selectedLocation", currentLocation);
      localStorage.setItem("latitude", latitude);
      localStorage.setItem("longitude", longitude);

      toast.success("Current location saved");
      navigate("/");
    } else {
      toast.error("Unable to fetch current location");
    }
  };

  const clearAll = () => {
    setSearchResults([]);
    setSearchValue("");
  };

  return (
    <>
      <header className="header header-fixed bg-transparent style-2">
        <div className="header-content">
          <div className="search-area">
            <Link to={"/"} className="back-btn border-0">
              <i className="ri-arrow-left-line"></i>
            </Link>

            <div className="mb-2 input-group input-group-icon input-rounded">
              <input
                type="text"
                id="location-input"
                className="form-control dz-password"
                placeholder="Search for a location..."
                value={searchValue}
                onChange={handleSearchChange}
              />
              <span
                className="input-group-text show-pass py-0 px-2 cursor "
                onClick={clearAll}
              >
                {searchValue !== "" && (
                  <i className="ri-close-circle-fill fs-2 fs-lg-3"></i>
                )}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="page-content space-top dz-gradient-shape">
        <div className="container">
          <div id="search-list " className="px-4">
            <div
              className="left-content cursor text-success"
              onClick={handleSaveCurrentLocation}
            >
              <i className="ri-crosshair-2-fill"></i>
              <span> My Current Location </span>
            </div>

            {searchResults && searchResults.length > 0 && (
              <div className="container">
                <div className="title-bar mb-4">
                  <h5 className="title mb-0">Search history</h5>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="font-w500 font-12 border-0"
                  >
                    Clear All
                  </button>
                </div>
                <div className="recent-search-list">
                  <ul>
                    {searchResults.map((result) => (
                      <li
                        className="search-content cursor"
                        key={result.place_id}
                        onClick={() => handleSearchResultClick(result)}
                      >
                        <div className="left-content">
                          <i className="ri-map-pin-2-fill"></i>
                          <div>
                            <p className="fw-bold mb-0">
                              {result.structured_formatting.main_text}{" "}
                            </p>
                            <span>
                              {result.structured_formatting.secondary_text}{" "}
                            </span>
                          </div>
                        </div>
                        <div className="remove ">
                          <i className="feather icon-chevron-right" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default MyLocation;
