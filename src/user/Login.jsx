import { useState, useEffect, useContext, Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import axiosInstance from '../axiosInstance';
import { useDispatch } from 'react-redux';
import { authActions } from '../redux/store';
import getCookie from '../helper/getCookie';
import setCookie from '../helper/setCookie';
import LoginComponent from './includes/LoginComponent';
const Login = ({ updateAuthStatus }) => {    
 

  return (
    <>
    
    <header className="header header-fixed bg-transparent" data-aos="fade-down" >
  <div className="header-content">
    <div className="left-content">
      <Link to="/" className="back-btn">
      <i class="ri-arrow-left-line"></i>
      </Link>
    </div>       

    <div className="mid-content">
      <h4 className="title">Login or Signup</h4>
    </div>
    <div className="right-content d-flex align-items-center gap-4">
  
    </div>
  </div>
</header>


<main className="page-content space-top dz-gradient-shape">


<div className="container py-0">
<div className="col-12 m-auto rounded-3 shadow p-5 bg-white" style={{ maxWidth: 450, minHeight: 400 }}>

<LoginComponent updateAuth={updateAuthStatus} />

</div>

</div>


</main>


</>


  )
}

export default Login
