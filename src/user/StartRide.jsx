import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, LoadScript, DirectionsRenderer } from '@react-google-maps/api';


const taxiIcon = {
  url: '/img/taxi.webp',
  scaledSize: { width: 30, height: 66 } // Set the desired size here (width, height)
};

const StartRide = () => {
  const [startPosition] = useState({ lat: 28.6009921, lng: 77.0795096 });
  const [endPosition] = useState({ lat: 28.6011237, lng: 77.0762686 });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markerRef = useRef(null); // Ref for the marker

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
      },
      error => {
        console.error('Error getting user location:', error);
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    if (startPosition && endPosition && mapLoaded) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: startPosition,
          destination: endPosition,
          travelMode: 'DRIVING',
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
          } else {
            console.error('Error fetching directions:', status);
          }
        }
      );
    }
  }, [startPosition, endPosition, mapLoaded]);

  useEffect(() => {
    // Rotate the marker icon when the device rotation changes
    if (markerRef.current && currentLocation) {
      const angle = markerRef.current.getRotation();
      markerRef.current.setIcon(
        RotateIcon.makeIcon('/img/taxi.webp')
          .setRotation({ deg: angle })
          .getUrl()
      );
    }
  }, [currentLocation]);

  return (
    <LoadScript
      googleMapsApiKey="YOUR_API_KEY"
      onLoad={() => setMapLoaded(true)}
    >
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100vh' }}
        center={currentLocation || startPosition}
        zoom={20}
      >
        <Marker position={startPosition} />
        <Marker position={endPosition} />
        {currentLocation && (
          <Marker
            position={currentLocation}
            ref={markerRef}
            icon={{
              url: RotateIcon.makeIcon('/img/taxi.webp')
                .setRotation({ deg: 0 })
                .getUrl()
            }}
          />
        )}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default StartRide;