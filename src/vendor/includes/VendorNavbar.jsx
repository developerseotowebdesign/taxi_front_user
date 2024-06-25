import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useBlogContext } from "../../fetchdata/BlogContext";

const VendorNavbar = () => {
  const { NotificationCount } = useBlogContext();

  useEffect(() => {
    console.log("NotificationCount", NotificationCount);
  }, [NotificationCount]);

  return (
    <>
      {/* Menubar */}
      <div className="menubar-area footer-fixed">
        <div className="toolbar-inner menubar-nav">
          <NavLink to="/vendor/home" className="nav-link ">
            <i className="ri-home-3-line  fs-3"></i>
          </NavLink>
          <NavLink to="/vendor/valet" className="nav-link ">
            <i className="ri-parking-box-line fs-3" />
          </NavLink>

          <NavLink to="/vendor/notification" className="nav-link count ">
            <i class="ri-notification-fill fs-3">
              {" "}
              {NotificationCount !== 0 && (
                <span className="bg-secondary">
                  {NotificationCount > 99 ? "99+" : NotificationCount}
                </span>
              )}
            </i>
          </NavLink>

          <NavLink to="/vendor/profile" className="nav-link  ">
            <i className="ri-user-3-line fs-3"></i>
          </NavLink>
        </div>
      </div>
      {/* Menubar */}
      {/* Nav Floting End */}
    </>
  );
};

export default VendorNavbar;
