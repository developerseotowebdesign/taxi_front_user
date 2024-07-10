import React, { useState, useEffect } from 'react';
import { Detector } from "react-detect-offline";
import toast from 'react-hot-toast';

const CheckConnection = ({ children }) => {
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [Show, setshow] = useState(false);

  useEffect(() => {
    // Set the initial online status on component mount
    setOnline(navigator.onLine);

    // Define the event listeners for online and offline events
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup the event listeners on component unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    console.log('onlineonline',online)
  if(!online){
    setTimeout(() => {
      setshow(true);
    }, 100); // Simulate a delay for loading animation

  }else{
    setshow(false);

  }
}, [online]);

  const refreshStatus = () => {
    setLoading(true);
    setTimeout(() => {
      const currentStatus = navigator.onLine;
      setOnline(currentStatus);
      setLoading(false);
      if (!currentStatus) {
        // alert("Connection not found. Please try again.");
      }
    }, 2000); // Simulate a delay for loading animation
  };
  
  return (
    <Detector
      render={({ online }) => (
       
        online ? children :

        <>
             
        <div
className={`toast mytoast style-1 fade toast-danger mb-2 ${Show && 'show'} m-auto bg-white mx600`}  style={{ zIndex: 9999999 }}

role="alert"
aria-live="assertive"
aria-atomic="true"
data-bs-delay={3982}
data-bs-autohide="false"
>
<div className="toast-header bg-danger text-white ">
<svg
xmlns="http://www.w3.org/2000/svg"
width={20}
height={20}
viewBox="0 0 24 24"
id="wifi-off" fill="white"
>
<path fill="none" d="M0 0h24v24H0V0z" />
<path d="M21 11l2-2c-3.73-3.73-8.87-5.15-13.7-4.31l2.58 2.58c3.3-.02 6.61 1.22 9.12 3.73zm-2 2c-1.08-1.08-2.36-1.85-3.72-2.33l3.02 3.02.7-.69zM9 17l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zM3.41 1.64L2 3.05 5.05 6.1C3.59 6.83 2.22 7.79 1 9l2 2c1.23-1.23 2.65-2.16 4.17-2.78l2.24 2.24C7.79 10.89 6.27 11.74 5 13l2 2c1.35-1.35 3.11-2.04 4.89-2.06l7.08 7.08 1.41-1.41L3.41 1.64z" />
</svg>
<strong className="me-auto ms-2">No Connetion</strong>
<small>
<button  onClick={refreshStatus}  class="badge badge-dark">
{loading && (<span
className="spinner-border spinner-border-sm me-2"
role="status"
aria-hidden="true"
/>

)} 
 Retry</button>
</small>
<button
 className="btn btn-close position-relative p-1"
 type="button"
 data-bs-dismiss="toast"
 aria-label="Close"
>
<svg
  xmlns="http://www.w3.org/2000/svg"
  width={28}
  height={28}
  viewBox="0 0 24 24"
  fill="none"
  stroke="#383838"
  strokeWidth="3"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <line x1={18} y1={6} x2={6} y2={18} />
  <line x1={6} y1={6} x2={18} y2={18} />
</svg>

</button>
</div>
<div className="toast-body bg-danger opacity-75">Please check your internet connection</div>
</div>



     
       {children}
     </>

      
      )}
    />
  );
}

export default CheckConnection;
