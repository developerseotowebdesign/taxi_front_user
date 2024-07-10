import React from 'react'

const setCookie = (name, value) => {
  const days = 7;
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    const cookieValue = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    document.cookie = cookieValue;
  };
  

export default setCookie
