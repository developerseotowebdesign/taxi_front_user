import React, { useState } from 'react';
import { useEffect } from 'react';

const StartDriverRide = () => {
  const [endPosition] = useState({ lat: 28.6011237, lng: 77.0762686 });
  const [rideStarted, setRideStarted] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);

  const getMapUrl = (start, end) => {
    if (rideStarted) {
        return `https://www.google.com/maps/embed/v1/directions?key=AIzaSyDYsdaR0zrPsBDeuyCKFH_4PuCUyWcQ2mE&origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&mode=driving`;
    } else {
        return `https://www.google.com/maps/embed/v1/view?key=AIzaSyDYsdaR0zrPsBDeuyCKFH_4PuCUyWcQ2mE&center=${start.lat},${start.lng}&zoom=14`;
    }
  };

  const startRide = () => {
    if (currentPosition) {
      setRideStarted(true);
    } else {
      // If current location is not available, show error or handle accordingly
      console.log("Current location not available.");
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported.');
    }
  };



  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div>
      <div>
        <iframe
          width="600"
          height="450"
          frameBorder="0"
          style={{ border: 0,width:'100%',height:'95vh' }}
          src={getMapUrl(currentPosition || {}, endPosition)}
          allowFullScreen
          aria-hidden="false"
          tabIndex="0"
        ></iframe>
      </div>
      <div>
        {!rideStarted && (
          <button onClick={() => { getLocation(); startRide(); }}>
            Start Ride (Car Mode)
          </button>
        )}
        {rideStarted && <p>Ride in progress...</p>}
      </div>
    </div>
  );
};

export default StartDriverRide;
