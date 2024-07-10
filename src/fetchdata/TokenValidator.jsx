// TokenValidator.js
import  { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authActions } from '../redux/store';
import toast from 'react-hot-toast';
import axiosInstance from '../axiosInstance';
import eraseCookie from '../helper/eraseCookie';
import { encrypt,decrypt } from '../helper/encryption';
import getCookie from '../helper/getCookie';
import { useState } from 'react';

const TokenValidator = () => {

    const [online, setOnline] = useState(true);
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


    const KEY = import.meta.env.VITE_REACT_APP_LOGIN_KEY;
    
  

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const validateToken = async () => {
            const usertoken = getCookie('token');


            if (usertoken && online) {
                const userdecrypt = decrypt(usertoken , KEY);

                const userdata = JSON.parse(userdecrypt);

                try {
                    const response = await axiosInstance.get(`/validatetoken/${userdata?._id}`);

                    if (response.data.success) {
                        // Token is valid, dispatch the login action and navigate to the home page
                        dispatch(authActions.login());
                        //  toast.success("Token found");
                    } else {
                        // Token is invalid, clear local storage token
                        
                        eraseCookie('token');
               

                        // localStorage.removeItem('token');
                        // localStorage.removeItem('userId');
                        toast.error("Token expired or invalid");
                    }
                } catch (error) {
                    // Handle error, for example, show an error message
                    console.error('Error validating token:', error);
                    // Optionally, clear local storage token in case of an error

                    eraseCookie('token');


                    // eraseCookie('token');
                    // eraseCookie('userId');
                    // eraseCookie('user');

                    toast.error("Error validating token");
                }
            }
        };

        validateToken();
    }, [dispatch]);

    return null; // This component doesn't render anything visible
};

export default TokenValidator;
