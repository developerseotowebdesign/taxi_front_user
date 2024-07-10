import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import onlineAudio from "../../assets/audio/online.mp3";
import { useBlogContext } from "../../fetchdata/BlogContext";
import { weburl } from "../../axiosInstance";
const VendorHeader = () => {
  const { walletAmount, UserProfile } = useBlogContext();

  return (
    <>
      {/* Header */}
      <header
        className="header bg-light py-2 mx-auto ms-auto fs-4 fs-lg-5 card shadow-sm  mb-0 mt-2 main-header"
        style={{ minHeight: "auto" }}
      >
        <div className="header-content" style={{ minHeight: "auto" }}>
          <div className="left-content">
            <Link to="/profile">
              {UserProfile ? (
                <img
                  style={{ width: 40 }}
                  className="rounded"
                  src={
                    UserProfile !== ""
                      ? weburl +
                        UserProfile.replace(/\\/g, "/").replace(/^public\//, "")
                      : "/img/user.svg"
                  }
                />
              ) : (
                <div
                  className="spinner-border spinner-border-lg"
                  role="status"
                />
              )}
            </Link>
          </div>
          <div className="mid-content" />
          <div className="right-content d-flex align-items-center gap-4">
            <Link to="/driver/wallet">
              <div class="bg-success text-white fs-6 px-2 py-1 rounded-lg">
                <i class="ri-wallet-line"></i> ₹ {walletAmount}
              </div>
            </Link>
          </div>
        </div>
      </header>
      {/* Header */}
    </>
  );
};

export default VendorHeader;
