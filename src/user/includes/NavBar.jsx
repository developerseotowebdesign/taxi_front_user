import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useBlogContext } from "../../fetchdata/BlogContext";
const NavBar = () => {
  const { notification } = useBlogContext();

  const [TotalNoti, setTotalNoti] = useState(0);

  useEffect(() => {
    setTotalNoti(notification.length);
  }, [notification]);

  return (
    <>
      {/* Menubar */}
      <div className="menubar-area footer-fixed">
        <div className="toolbar-inner menubar-nav">
          <NavLink to="/" className="nav-link ">
            <i className="ri-home-3-line  fs-3"></i>
          </NavLink>
          <NavLink to="/notification" className="nav-link notificationbox">
            <i className="ri-notification-3-fill"></i>
            {TotalNoti !== 0 && (
              <sup className="px-2 py-2 bg-secondary text-dark rounded-xl fs-6">
                {TotalNoti}
              </sup>
            )}
          </NavLink>

          <NavLink className="nav-link " to="/all-valet">
            <i className="ri-parking-box-line fs-3" />
          </NavLink>

          <NavLink to="/rides" className="nav-link ">
            <i className="ri-taxi-wifi-fill  fs-3"></i>
          </NavLink>

          <NavLink to="/profile" className="nav-link  ">
            <i className="ri-user-3-line fs-3"></i>
          </NavLink>
        </div>
      </div>
      {/* Menubar */}
      {/* Nav Floting End */}
    </>
  );
};

export default NavBar;
