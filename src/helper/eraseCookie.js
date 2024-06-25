import React from 'react'

// Function to erase a cookie by name
const eraseCookie = (name) => {
    console.log(name)
    document.cookie = name + '=; Max-Age=-99999999; path=/;'; // Also specify the path to ensure it works across all paths
  };

export default eraseCookie
