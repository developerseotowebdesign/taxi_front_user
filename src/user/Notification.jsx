import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import NavBar from './includes/NavBar';
import axiosInstance from '../axiosInstance';
import { useBlogContext } from '../fetchdata/BlogContext';
import {
  SwipeableList,
  SwipeableListItem,
  LeadingActions,
  TrailingActions,
  SwipeAction,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import getDecryptData from '../helper/getDecryptData';
import LiveRides from '../driver/components/LiveRides';

import SideBar from "./includes/SideBar";
import { ToggleButton } from "./includes/SideBar"; // Import ToggleButton from SideBar

const NotificationDriver = () => {

  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const [Loading, setLoading] = useState(true);
  const [Notifications, setAllNotification] = useState([]);
  const { NotificationCount, removeNotificationcount } = useBlogContext();
  const [totalnoti, settotalnoti] = useState(NotificationCount);
  const decryptdatajson = getDecryptData();

  useEffect(() => {
    const fetchNotificationById = async () => {
      const id = decryptdatajson._id;
      try {
        const { data } = await axiosInstance.get(`/get-notification/${id}`);
        const { success, notifications } = data;
        console.log('data noti', data)
        if (success) {
          setAllNotification(notifications.reverse());
          removeNotificationcount();
        }
      } catch (error) {
        console.error('Error during fetching notifications:', error);
        toast.error(error.response?.data?.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationById();
  }, []);

  const handleDeleteNotification = async (notificationId) => {
    try {
      const { data } = await axiosInstance.delete(`/delete-notification/${notificationId}`);
      if (data.success) {
        setAllNotification((prevNotifications) =>
          prevNotifications.filter((notification) => notification._id !== notificationId)
        );
        toast.success('Notification deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const trailingActions = (notificationId) => (
    <TrailingActions>
      <SwipeAction onClick={() => handleDeleteNotification(notificationId)}>
        <div className="swipe-action-content bg-danger d-flex justify-content-center align-items-center">
          <i className="ri-delete-bin-6-fill fs-4 text-white"></i> </div>
      </SwipeAction>
    </TrailingActions>
  );

  return (
    <>
      <header className="header header-fixed">
        <div className="header-content">
          <div className="left-content">
            <Link to="/driver/home" className="back-btn">
              <i className="ri-arrow-left-line"></i>
            </Link>
          </div>
          <div className="mid-content">
            <h4 className="title">Notifications {totalnoti !== 0 && `(${totalnoti})`}</h4>
          </div>
          <div className="right-content d-flex align-items-center gap-4">
            <div className='back-btn'>
              <ToggleButton onClick={toggleSidebar} />

            </div>
          </div>
        </div>
      </header>

      <main className="page-content space-top p-b40">
        <div className="container pt-0">
          <div className="dz-list notification-list">

            <ul>
              {!Loading ? (
                <>     {Notifications && Notifications.length === 0 && (<>
                  <img src="/img/no-notification.jpg" className="mt-4" style={{ maxWidth: "200px", margin: "auto", display: "block" }}
                  />
                </>)}

                  <SwipeableList className='w-100' >
                    {Notifications.map((notification, index) => (
                      <SwipeableListItem className='w-100 cursor'
                        key={notification._id}
                        trailingActions={trailingActions(notification._id)}
                      >
                        <li className="list-items">
                          <div className="media w-100">
                            <div className="list-content w-100">
                              <h5 className="title d-flex justify-content-between w-100 align-items-start gap-2">
                                {notification.text}
                                {index < totalnoti && (
                                  <span className="badge rounded-pill bg-secondary px-2 py-1 text-dark">New</span>
                                )}
                              </h5>
                              <span className="date">{new Date(notification.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </li>
                      </SwipeableListItem>
                    ))}
                  </SwipeableList>
                </>
              ) : (
                <>
                  <li>
                    <div className="skeleton m-auto mb-2" style={{ height: 60, width: '100%' }} />
                  </li>
                  <li>
                    <div className="skeleton m-auto mb-2" style={{ height: 60, width: '100%' }} />
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </main>
      <LiveRides />
      <NavBar />
      <div
        className={`sidebar-container ${sidebarVisible ? "visible" : "d-none"}`}
      >
        <SideBar isVisible={sidebarVisible} toggleSidebar={toggleSidebar} />
      </div>
    </>
  );
};

export default NotificationDriver;
