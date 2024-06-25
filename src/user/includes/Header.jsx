import { useEffect,useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
    

  
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    const location = localStorage.getItem('selectedLocation');
    if (location) {
      setSelectedLocation(location);
    }
  }, []);


    return (
        <>
        <div className="dz-gradient-shape">
  
        {/* Header */}
        <header className="header py-2 mx-auto ms-auto fs-4 fs-lg-5 card shadow-sm  mb-0 mt-2 main-header"  style={{ minHeight: "auto" }}>
          <div className="header-content"  style={{ minHeight: "auto" }} >
            <div className="left-content">

            <a href="#" className="icon dz-floating-toggler">
            <i className="ri-menu-2-line"></i>
              </a>

            </div>
            <div className="mid-content"  >
                
     <Link to="/my-location" className="m-0  cursor fs-5 d-block  d-lg-none"> <span className="overflowOne"> {selectedLocation?selectedLocation: 'Select Location' } </span> 
         </Link>

         <Link to="/my-location" className="m-0 overflowOne cursor d-none  d-lg-block"> <span className="overflowOne"> {selectedLocation?selectedLocation: 'Select Location' } </span>
         </Link>
</div>
            <div className="right-content d-flex align-items-center gap-4">
            <Link to="/profile">
            <i className="ri-user-fill"></i>
            </Link>
     
            
            </div>
          </div>
        </header>
        {/* Header */}
                
        </div>
        
      </>
      
    )
}

export default Header