import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../axiosInstance';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { authActions } from '../redux/store';
import DriverNavbar from './includes/DriverNavbar';
import getCookie from '../helper/getCookie';
import eraseCookie from '../helper/eraseCookie';
import { decrypt,encrypt } from '../helper/encryption';
import getDecryptData from '../helper/getDecryptData';
import LiveRides from './components/LiveRides';

const ProfileDriver = () => {    

  let initialUserData = {
    username: '',
    phone: '',
    pincode: '',
    state: '',
    address: ''
  };
  

  const [Orderinputs, setOrderInputs] = useState(initialUserData);
  const [Loading, setLoading] = useState(true);


     
  const dispatch = useDispatch();
  const navigate = useNavigate();
  //state
  const [value, setValue] = useState();
  
  const isLoginFromLocalStorage = getCookie('token') ? true : false;
  const [isLogin, setIsLogin] = useState(isLoginFromLocalStorage);

  useEffect(() => {
    setIsLogin(isLoginFromLocalStorage);
  }, [isLoginFromLocalStorage]);
  
  //logout
  const handleLogout = () => {
    try {
      dispatch(authActions.logout());
      toast.success("Logout Successfully");
      navigate("/");
      // localStorage.clear();  
      eraseCookie('token');
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {

      //form handle
      const fetchUserById = async () => {

        const decryptdatajson = await getDecryptData();

        console.log('decryptdatajson',decryptdatajson);
        const credentials = {
          id: decryptdatajson._id,
        };

        try {
          const { data } = await axiosInstance.post('/auth-user', credentials);
          const { success, token, existingUser, message } = data;

          if (success) {

            setOrderInputs((prevData) => ({
              ...prevData,
              username: existingUser.username || '',
              phone: existingUser.phone || '',
              email: existingUser.email || '',
              address: existingUser.address || '',
              pincode: existingUser.pincode || '',
              state: existingUser.state || '',
              
            }));
           
            console.log("Message from backend:", existingUser);
          }


        } catch (error) {
          console.error('Error during login:', error);
          // Handle network errors, API issues, etc.
          toast.error(error.response.data.message);

        }finally{
          setLoading(false)
        }
      };
      fetchUserById();

  }, []);


  return (
    <>
    
    <header className="header header-fixed" >
  <div className="header-content">
    <div className="left-content">
      <Link to="/" className="back-btn">
      <i class="ri-arrow-left-line"></i>
      </Link>
    </div>
    <div className="mid-content">
      <h4 className="title">Profie</h4>
    </div>
    <div className="right-content d-flex align-items-center gap-4">
    <Link to="/" >
        <svg
          enableBackground="new 0 0 461.75 461.75"
          height={24}
          viewBox="0 0 461.75 461.75"
          width={24}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m23.099 461.612c2.479-.004 4.941-.401 7.296-1.177l113.358-37.771c3.391-1.146 6.472-3.058 9.004-5.587l226.67-226.693 75.564-75.541c9.013-9.016 9.013-23.63 0-32.645l-75.565-75.565c-9.159-8.661-23.487-8.661-32.645 0l-75.541 75.565-226.693 226.67c-2.527 2.53-4.432 5.612-5.564 9.004l-37.794 113.358c-4.029 12.097 2.511 25.171 14.609 29.2 2.354.784 4.82 1.183 7.301 1.182zm340.005-406.011 42.919 42.919-42.919 42.896-42.896-42.896zm-282.056 282.056 206.515-206.492 42.896 42.896-206.492 206.515-64.367 21.448z"
            fill="#4A3749"
          />
        </svg>
        </Link>
    </div>
  </div>
</header>

    <main className="page-content space-top p-b40">
      {!Loading ?(<>
  <div className="container pt-0">
    <div className="profile-area">
      <div className="author-bx">
        <div className="dz-media">
          <img src="/img/2.jpg" alt="" />
        </div>
        <div className="dz-content">
          <h2 className="name">{Orderinputs?.username}</h2>
          <p className="text-primary">{Orderinputs?.pincode}</p>
        </div>
      </div>
      <div className="widget_getintuch pb-15">
        <ul>
          <li>
            <div className="icon-bx">
              <svg
                className="svg-primary"
                enableBackground="new 0 0 507.983 507.983"
                height={24}
                viewBox="0 0 507.983 507.983"
                width={24}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m200.75 148.678c11.79-27.061 5.828-58.58-15.03-79.466l-48.16-48.137c-15.999-16.19-38.808-23.698-61.296-20.178-22.742 3.34-42.496 17.4-53.101 37.794-23.286 43.823-29.276 94.79-16.784 142.817 30.775 121.9 198.319 289.559 320.196 320.104 16.452 4.172 33.357 6.297 50.33 6.326 32.253-.021 64.009-7.948 92.487-23.087 35.138-18.325 48.768-61.665 30.443-96.803-3.364-6.451-7.689-12.352-12.828-17.502l-48.137-48.16c-20.894-20.862-52.421-26.823-79.489-15.03-12.631 5.444-24.152 13.169-33.984 22.787-11.774 11.844-55.201-5.31-98.675-48.76s-60.581-86.877-48.876-98.698c9.658-9.834 17.422-21.361 22.904-34.007zm-6.741 165.397c52.939 52.893 124.14 88.562 163.919 48.76 5.859-5.609 12.688-10.108 20.155-13.275 9.59-4.087 20.703-1.9 28.028 5.518l48.137 48.137c5.736 5.672 8.398 13.754 7.157 21.725-1.207 8.191-6.286 15.298-13.645 19.093-33.711 18.115-73.058 22.705-110.033 12.836-104.724-26.412-260.078-181.765-286.489-286.627-9.858-37.009-5.26-76.383 12.86-110.126 3.823-7.318 10.924-12.358 19.093-13.552 1.275-.203 2.564-.304 3.856-.3 6.714-.002 13.149 2.683 17.869 7.457l48.137 48.137c7.407 7.321 9.595 18.421 5.518 28.005-3.153 7.516-7.652 14.394-13.275 20.294-39.804 39.686-4.18 110.817 48.713 163.918z" />
              </svg>
            </div>
            <div className="dz-content">
              <p className="sub-title">Mobile Phone</p>
              <h6 className="title">+91 {Orderinputs?.phone}</h6>
            </div>
          </li>
          <li>
            <div className="icon-bx">
              <svg
                className="svg-primary"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 3H2C1.73478 3 1.48043 3.10536 1.29289 3.29289C1.10536 3.48043 1 3.73478 1 4V20C1 20.2652 1.10536 20.5196 1.29289 20.7071C1.48043 20.8946 1.73478 21 2 21H22C22.2652 21 22.5196 20.8946 22.7071 20.7071C22.8946 20.5196 23 20.2652 23 20V4C23 3.73478 22.8946 3.48043 22.7071 3.29289C22.5196 3.10536 22.2652 3 22 3ZM21 19H3V9.477L11.628 12.929C11.867 13.0237 12.133 13.0237 12.372 12.929L21 9.477V19ZM21 7.323L12 10.923L3 7.323V5H21V7.323Z"
                  fill="#4A3749"
                />
              </svg>
            </div>
            <div className="dz-content">
              <p className="sub-title">Email Address</p>
              <h6 className="title">{Orderinputs?.email}</h6>
            </div>
          </li>
          <li>
            <div className="icon-bx">
              <svg
                className="svg-primary"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.9993 5.48404C9.59314 5.48404 7.64258 7.4346 7.64258 9.84075C7.64258 12.2469 9.59314 14.1975 11.9993 14.1975C14.4054 14.1975 16.356 12.2469 16.356 9.84075C16.356 7.4346 14.4054 5.48404 11.9993 5.48404ZM11.9993 12.0191C10.7962 12.0191 9.82096 11.0438 9.82096 9.84075C9.82096 8.6377 10.7962 7.66242 11.9993 7.66242C13.2023 7.66242 14.1776 8.6377 14.1776 9.84075C14.1776 11.0438 13.2023 12.0191 11.9993 12.0191Z"
                  fill="#4A3749"
                />
                <path
                  d="M21.793 9.81896C21.8074 4.41054 17.4348 0.0144869 12.0264 5.09008e-05C6.61797 -0.0143851 2.22191 4.35827 2.20748 9.76664C2.16044 15.938 5.85106 21.5248 11.546 23.903C11.6884 23.9674 11.8429 24.0005 11.9991 24C12.1565 24.0002 12.3121 23.9668 12.4555 23.9019C18.1324 21.5313 21.8191 15.9709 21.793 9.81896ZM11.9992 21.7127C7.30495 19.646 4.30485 14.9691 4.38364 9.84071C4.38364 5.63477 7.79323 2.22518 11.9992 2.22518C16.2051 2.22518 19.6147 5.63477 19.6147 9.84071V9.91152C19.6686 15.0154 16.672 19.6591 11.9992 21.7127Z"
                  fill="#4A3749"
                />
              </svg>
            </div>
            <div className="dz-content">
              <p className="sub-title">Address</p>
              <h6 className="title">
              {Orderinputs?.address}
              </h6>
            </div>
          </li>

          <li className='cursor' onClick={handleLogout}>
            <div className="icon-bx">
              

              <svg    className="svg-primary"
                width={24}
                height={24}  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 22C4.44772 22 4 21.5523 4 21V3C4 2.44772 4.44772 2 5 2H19C19.5523 2 20 2.44772 20 3V6H18V4H6V20H18V18H20V21C20 21.5523 19.5523 22 19 22H5ZM18 16V13H11V11H18V8L23 12L18 16Z"></path></svg>

            </div>
            <div className="dz-content">
            <p className="sub-title">Log Out Account </p>
              <h6 className="title">
              Log Out
              </h6>
            </div>
          </li>


        </ul>
      </div>
      {/* Most Ordered */}
     
    </div>
  </div>
  </>):(<>

    <div className="container pt-0">
  <div className="profile-area">
    <div className="author-bx">
      <div className="dz-media">
 
       <div className="skeleton" style={{ height: 150, width: 150 }} />
       
      </div>
      <div className="dz-content">
        <div className="skeleton m-auto mb-2" style={{ height: 40, width: '50%' }} />
        <div className="skeleton m-auto mb-2" style={{ height: 20, width: '50%' }} />

      </div>
    </div>
    <div className="widget_getintuch pb-15">
      <ul>
        <li>
          
       <div className="skeleton mb-2 me-2 rounded-xl" style={{ height: 50, width: 50 }} />
                  <div className="skeleton mb-2 mt-1" style={{ height: 40, width: '50%' }} />

        </li>
       
        <li>
          
          <div className="skeleton mb-2 me-2 rounded-xl" style={{ height: 50, width: 50 }} />
                     <div className="skeleton mb-2 mt-1" style={{ height: 40, width: '50%' }} />
   
           </li>


            <li>
          
       <div className="skeleton mb-2 me-2 rounded-xl" style={{ height: 50, width: 50 }} />
                  <div className="skeleton mb-2 mt-1" style={{ height: 40, width: '50%' }} />

        </li>
          
      </ul>
    </div>
  </div>
</div>


  </>)}

</main>
<LiveRides/>
<DriverNavbar/>

</>


  )
}

export default ProfileDriver