import React from 'react'

const getCookie = (name) => {
    // Split the document.cookie string into an array of cookies
    const cookies = document.cookie.split(';');
    
    // Loop through the cookies array to find the one with the specified name
    for (let cookie of cookies) {
      // Trim any leading or trailing whitespace from the cookie
      cookie = cookie.trim();
      // Check if the cookie starts with the specified name
      if (cookie.startsWith(name + '=')) {
        // Extract and return the cookie value
        return cookie.substring(name.length + 1);
      }
    }
    
    // If the cookie with the specified name is not found, return null
    return null;
  };
  

export default getCookie
