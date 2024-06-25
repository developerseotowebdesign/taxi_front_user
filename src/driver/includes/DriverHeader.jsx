import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import onlineAudio from '../../assets/audio/online.mp3';
import { useBlogContext } from '../../fetchdata/BlogContext';


const DriverHeader = () => {
  const { walletAmount,showOffline,toggleOffline } = useBlogContext();

    return (
        <>
        {/* Header */}
        <header className="header bg-light py-2 mx-auto ms-auto fs-4 fs-lg-5 card shadow-sm  mb-0 mt-2 main-header"  style={{ minHeight: "auto" }}>
          <div className="header-content"  style={{ minHeight: "auto" }} >
            <div className="left-content">

            <Link to="/profile">
           <img     style={{ width: 40 }} className="rounded" src="/img/2.jpg"/>
            </Link>
     
            </div>
            <div className="mid-content"  >
            <img
        src={showOffline ? "/img/offline-btn.svg" : "/img/online-btn.svg"}
        className="cursor"
        style={{ width: 80}}
        alt={showOffline ? "Offline Button" : "Online Button"}
        onClick={toggleOffline}
      />
</div>
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
      
    )
}

export default DriverHeader