import React, { useState, useEffect } from 'react';
import onlineAudio from '../../assets/audio/online.mp3';

const useToggleOffline = () => {
  const [showOffline, setShowOffline] = useState(() => {
    return JSON.parse(localStorage.getItem("showOffline")) ?? true;
  });

  const toggleOffline = () => {
    const updatedShowOffline = !showOffline;
    setShowOffline(updatedShowOffline);
    localStorage.setItem("showOffline", JSON.stringify(updatedShowOffline));

    if (showOffline) {
      const sound = new Audio(onlineAudio);
      sound.play();
    }
  };

  return { showOffline, toggleOffline };
};

export default useToggleOffline;
