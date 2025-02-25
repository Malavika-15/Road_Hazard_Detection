// NotificationComponent.js
import { ToastContainer, toast } from "react-toastify";
import React, { useEffect, useRef } from "react";
import "react-toastify/dist/ReactToastify.css";

const NotificationComponent = ({ notifications = [] }) => {
    const displayedNotifications = useRef(new Set());

    useEffect(() => {
        if (notifications.length > 0) {
            console.log("Notifications received:", notifications);
            
            notifications.forEach((message) => {
                if (!displayedNotifications.current.has(message)) {
                    toast.info(message, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                    // Mark the message as displayed
                    displayedNotifications.current.add(message);
                }
            });
        }
    }, [notifications]);
    

    return <ToastContainer />;
};

export default NotificationComponent;
