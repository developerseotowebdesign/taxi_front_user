import {  useState, useEffect } from 'react';
import { Link,useNavigate,useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../axiosInstance';
import SlideButton from 'react-slide-button';
import { useBlogContext } from '../fetchdata/BlogContext';

const RideView = () => {    

  
  const calculateTimeDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
  
    const difference = endTime - startTime;
    const hours = Math.floor(difference / 1000 / 60 / 60);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
  
    return { hours, minutes };
  };
  
  
  
    const { Headers ,isHeader} = useBlogContext();
  
  
    const navigate = useNavigate();
  
    const [countTotalCal, setcountTotalCal] = useState([]);
  
  
    const [Order, setOrder] = useState([]);
    const [IsLoading, setIsLoading] = useState(true);
    const [StartRideStatus, setStartRideStatus] = useState(false);
    const [startOTP, setstartOTP] = useState(0);
    const [endOTP, setendOTP] = useState(0);
    const [EndRideStatus, setEndRideStatus] = useState(false);
    const [reset, setReset] = useState(0);
  
  
    const [ClickstartOTP, setClickstartOTP] = useState(false);
    const [ClickendOTP, setClickendOTP] = useState(false);
  
  
    const { cId,orderId } = useParams();
    const [SubmitLoading, setSubmitLoading] = useState(false); // Add loading state
  
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    });
  
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prevData) => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
    };
  
  
  
    const getUserOrders = async () => {
  
      try {
        setIsLoading(true); // Set loading state to false in case of an error
        // const id = localStorage.getItem('userId');
        const { data } = await axiosInstance.get(`/user-orders-view/${cId}/${orderId}`);
  
        if (data?.success) {
          console.log('order', data)
          setOrder(data?.userOrder);
          const otpStartDate = data?.userOrder[0]?.otpStartDate;
          const otpEndDate = data?.userOrder[0]?.otpEndDate;
                    // Usage
  const {hours,minutes} =  await calculateTimeDuration(data?.userOrder[0]?.otpStartDate, data?.userOrder[0]?.otpEndDate );
  
  console.log(`Duration: ${hours} hours and ${minutes} minutes`);
  console.log(`Duration: ${hours} hours and ${minutes} minutes`);
  
  setcountTotalCal({hours,minutes})
  
        }
   
        setIsLoading(false); // Set loading state to false after fetching data
       } catch (error) {
        console.log(error);
        setIsLoading(false); // Set loading state to false in case of an error
        toast.error("order Not found");
        // navigate('/account');
      }
    };
  

//   useEffect(() => {
// if(Headers.length > 0)
//   }, [Headers]); // Empty dependency array ensures that the effect runs once after the initial render



  const startRide = async () => {
    setSubmitLoading(true);
    try {
    
      // const id = localStorage.getItem('userId');
      const { data } = await axiosInstance.get(`/start-ride-request/${orderId}`);
   console.log('datastart',data) ;
   const {success, order} = data;
   if(success){
    toast.success(order.startOTP);
    setstartOTP(order.startOTP);
    setClickstartOTP(true);
   
   }
      } catch (error) {
      console.log(error);
      
      // navigate('/account');
    }finally{
      setSubmitLoading(false);
    }

  
   // toast.success("Ride Start");
  }

  const EndRide = async () => {
    setSubmitLoading(true);
    try {
    
      // const id = localStorage.getItem('userId');
      const { data } = await axiosInstance.get(`/end-ride-request/${orderId}`);
   console.log('datastart',data) ;
   const {success, order} = data;
   if(success){
    toast.success(order.endOTP);
    setendOTP(order.endOTP)
    setClickendOTP(true);
   
   }
      } catch (error) {
      console.log(error);
      
      // navigate('/account');
    }finally{
      setSubmitLoading(false);
    }

  }

  const startCheckOTPRideVerify = async () => {
if(startOTP.toString() === formData.startOTPinput){
  
  startOTPRideVerify();
 }else{
  toast.error('OTP Not Verified')
 }

  }

  const endCheckOTPRideVerify = async () => {
    console.log(endOTP,formData.endOTPinput);
    if(endOTP.toString() === formData.endOTPinput){
      endOTPRideVerify();
    }else{
     toast.error('OTP Not Verified')
    }
   
  }

  const startOTPRideVerify = async () => {


    try {
      setSubmitLoading(true);
 
      const { data } = await axiosInstance.get(`/start-ride-verify/${orderId}`);
   console.log('datastart',data) ;
   const {success, order} = data;
   if(success){
    getUserOrders();
   }
      } catch (error) {
      console.log(error);
      
      // navigate('/account');
    }finally{
      setSubmitLoading(false);
    }

  }
  
  

  const endOTPRideVerify = async () => {


    try {
      setSubmitLoading(true);
      // const id = localStorage.getItem('userId');
      const { data } = await axiosInstance.get(`/end-ride-verify/${orderId}`);
   console.log('datastart',data) ;
   const {success, order} = data;
   if(success){
    getUserOrders();
   }
      } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      // navigate('/account');
    }finally{
      setSubmitLoading(false);
    }

 
  }

  useEffect(() => {

    getUserOrders();
  }, []); // Empty dependency array ensures that the effect runs once after the initial render


  const refeshdata = () => {

    getUserOrders();

  }

  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);

    const difference = endTime - startTime;
    const hours = Math.floor(difference / 1000 / 60 / 60);
    const minutes = Math.floor((difference / 1000 / 60) % 60);

    return { hours, minutes };
};




  
  
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const options = { 
    month: 'long', // Use 'long' to display the full month name
    day: 'numeric', 
    year: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric', 
    hour12: true 
  };
  return date.toLocaleString('en-US', options);
};






  return (
    <>


<header className="header header-fixed" >
  <div className="header-content">
    <div className="left-content">
      <Link to="/rides" className="back-btn">
      <i class="ri-arrow-left-line"></i>
      </Link>
    </div>
    <div className="mid-content">
      <h4 className="title"> {IsLoading? (<div className="skeleton m-auto mb-2" style={{ height: 40, width: '50%' }} />):(<span>Booking ID #{Order[0]?.orderId} </span>)}   </h4>
    </div>
    <div className="right-content d-flex align-items-center gap-4">
   

    </div>
  </div>
</header>



    <main className="page-content space-top p-b40">

    <div className="container">
 
    {IsLoading? (<>
      <div className="skeleton m-auto mb-3 " style={{ height: 'auto', width: 347,  aspectRatio: "347/260", }} />

      <div className="skeleton m-auto mb-3 " style={{ height: 60, width: '100%' }} />

      <div className="skeleton m-auto mb-3 " style={{ height: 80, width: '100%' }} />

      <div className="skeleton m-auto mb-3 " style={{ height: 200, width: '100%' }} />


    </>):(<>


<div className="m-auto d-block mb-3"  style={{ maxWidth: 350 }} >

 <div className='position-relative'>

<img
  src="/img/ridegif.gif"
  className="m-auto d-block mb-3"
  style={{
    borderRadius: 10,
    border: "2px solid black",
    aspectRatio: "347/260",
    width: "100%"
  }}
/>


{Order[0]?.startStatusOTP === 0 && Order[0]?.endStatusOTP === 0 && (<>
  <span class="badge rounded-pill bg-danger px-2 py-1 ridestatus"> <i class="ri-taxi-line fw-light fs-6"></i> Not Started Yet</span>
 </>)}

 {Order[0]?.startStatusOTP === 1 && (<>
  <span class="badge rounded-pill bg-warning px-2 py-1 ridestatus"> <i class="ri-taxi-line fw-light fs-6"></i> Ride Started</span>
 </>)}

 {Order[0]?.endStatusOTP === 1 && (<>
  <span class="badge rounded-pill bg-success px-2 py-1 ridestatus"> <i class="ri-taxi-line fw-light fs-6"></i> Ride Completed</span>
 </>)}

</div>





</div>




 <div className='d-flex gap-2 '>
 {Order[0]?.startOTP !== 0 && (
  <div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  data-bs-delay={3982}
  data-bs-autohide="false"
  className="toast style-1 fade toast-primary mb-2 w-100 show shadow-none"
>
  <div className="toast-body">
  <i className="ri-key-fill"></i> 
    <div className="toast-content ms-3 me-2">
      <strong>  Start OTP is </strong>
      <b className='fw-bold h5 text-white'> {Order[0]?.startOTP}</b>
    </div>
    <button
      className="btn btn-close position-absolute p-1"
      type="button" onClick={refeshdata}
 
    >
<i className="ri-restart-line fs-3"></i>
    </button>
  </div>
</div>
 )}

{Order[0]?.endOTP !== 0 && (
  <div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  data-bs-delay={3982}
  data-bs-autohide="false"
  className="toast style-1 fade toast-primary mb-2 w-100 show shadow-none"
>
  <div className="toast-body">
  <i className="ri-key-fill"></i> 
    <div className="toast-content ms-3 me-2">
      <strong>  End OTP is </strong>
      <b className='fw-bold h5 text-white'> {Order[0]?.endOTP}</b>
    </div>
    <button
      className="btn btn-close position-absolute p-1"
      type="button"
      onClick={refeshdata}
    >
 <i className="ri-restart-line"></i>
    </button>
  </div>
</div>
 )}
</div>

{ (Order[0]?.startStatusOTP === 1 && Order[0]?.endStatusOTP === 1) && (
  <>
<div className="card"  >
  <div className="card-body bg-primary text-white rounded-sm">
    <p className="card-title opacity-1 text-white">
    


     Ride Completed in {countTotalCal?.hours} Hr  {countTotalCal.hours ? countTotalCal?.minutes + ' Minutes' : ''}
   
      </p>
    <h4 className="card-title text-white" > ₹{Order[0]?.totalAmount} </h4>
  
  </div>
</div>
  </>)}

  {Order[0]?.startStatusOTP === 0 ? (
    <>
    <div className="card"  >
  <div className="card-body bg-danger text-white rounded-sm">
    <p className="card-title opacity-1 text-white">
    


    Not Started Yet Estimate Time is {Order[0]?.DriveHR}Hr
   
      </p>
    <h4 className="card-title text-white" >₹{Order[0]?.totalAmount} </h4>
  
  </div>
</div>
</>
    ):(
      <>
      { Order[0]?.endStatusOTP !== 1 && (
        <>
            <div className="card"  >
  <div className="card-body bg-warning  text-white rounded-sm">
    <p className="card-title opacity-1 text-white">
    


    Ride Started Estimate Time is {Order[0]?.DriveHR}Hr
   
      </p>
    <h4 className="card-title text-white" >₹{Order[0]?.totalAmount} </h4>
  
  </div>
</div>
        </>
      )}
  
</>
    )}
 


{!StartRideStatus && (<> </>) }

<div className="card p-3">
  <div className="d-flex justify-content-between">
    <span className="badge badge-primary">Booking ID : {Order[0]?.orderId}</span>
    <span className="badge badge-primary">Date : May 16, 2024 </span>
  </div>
  <hr />
  <div className="d-flex">
    <img
      className="rounded me-2"
      src="/img/2.jpg"
      style={{ width: 50, height: "auto" }}
    />
    <div className="media-body">
      <h5 className="mt-2 mb-0"> {Order[0]?.driverId?.username} </h5>
      <div className="d-flex flex-row justify-content-between align-text-center">
        <small className="text-muted">{Order[0]?.driverId[0]?.state}</small>
      </div>
    </div>
    <div className="d-flex gap-2 ms-auto">
      <a className="dz-icon icon-sm icon-fill" href={`tel:${Order[0]?.driverId?.phone}`}>
        <i className="ri-phone-fill" />
      </a>
      <Link
        className="dz-icon icon-sm icon-fill"
        to={`/chat/${Order[0]?.driverId._id}`}
      >
        <i className="ri-message-3-fill" />
      </Link>
    </div>
  </div>
  <div className="row mt-2">
    <div className="col-8">
      <div className="d-flex">
        <i className="ri-map-pin-2-fill me-2 text-primary" />
        <span className="overflowOne hover-text">
          {" "}
          {Order[0]?.PickupLocation}
        </span>
      </div>
      <div className="d-flex">
        <i className="ri-map-pin-range-fill  me-2" />
        <span className="overflowOne hover-text">
          {" "}
          {Order[0]?.DestinationLocation}
        </span>
      </div>
    </div>
    <div className="col-4 text-end">
      <h4>₹{Order[0]?.totalAmount}</h4>
    </div>
  </div>
  <hr />
  <div className="col-12">
  <div class="fs-6 text-left " > 

<button className='btn mb-2 btn-xs btn-primary p-2 d-inline me-2'> 

<p className='p-0 m-0'>    <b className='fw-bold'>Car Type</b>    </p> 
<p className='p-0 m-0'>    {Order[0]?.CarType}   </p>  </button>

  <button className='btn mb-2 btn-xs btn-primary p-2 d-inline text-start me-2'> 

<p className='p-0 m-0'>    <b  className='fw-bold' >Scheduled date : </b>   {Order[0]?.pickupDate}    </p> 
<p className='p-0 m-0'>  <b className='fw-bold' >Scheduled Time : </b>   {Order[0]?.pickupTime}   </p>
</button> 

<button className='btn mb-2 btn-xs btn-primary p-2 d-inline text-start me-2'> 

<p className='p-0 m-0'>    <b  className='fw-bold' >Driver Service Hours </b>   </p> 
<p className='p-0 m-0'>  {Order[0]?.DriveHR} Hour </p>
</button> 

<button className='btn mb-2 btn-xs btn-secondary p-2 d-inline text-start me-2'> 

<p className='p-0 m-0'>    <b  className='fw-bold' > payment Type</b>   </p> 
<p className='p-0 m-0'>   {Order[0]?.mode} </p>
</button> 

<button className='btn mb-2 btn-xs btn-secondary p-2 d-inline text-start me-2'> 

<p className='p-0 m-0'>    <b  className='fw-bold' > Ride Type</b>   </p> 
<p className='p-0 m-0'> {Order[0]?.rideTyp} </p>
</button> 


</div>
  </div>
 
</div>



</>)}

</div>


</main>
</>


  )
}

export default RideView

