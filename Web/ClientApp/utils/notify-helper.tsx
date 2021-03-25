import ReactDOM from "react-dom";
import { ToastContainer, toast } from "react-toastify";
import React from "react";

export class NotifyHelper {

    public static sendNotif(notifContent: string) {
        const notify = () => toast.success(notifContent, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        const element =
            <div onLoad={ notify }>
                <ToastContainer position="top-center"
        autoClose = { 5000}
        hideProgressBar = { false}
        newestOnTop = { false}
        closeOnClick
        rtl = { false}
        pauseOnFocusLoss
        draggable
        pauseOnHover />
            </div>;
        ReactDOM.render(element, document.getElementById('toast'));
        notify();
    }
    public static sendErrorNotif(notifContent: string) {
        const notify = () => toast.error(notifContent, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        const element =
            <div onLoad={ notify }>
                <ToastContainer position="top-center"
        autoClose = { 5000}
        hideProgressBar = { false}
        newestOnTop = { false}
        closeOnClick
        rtl = { false}
        pauseOnFocusLoss
        draggable
        pauseOnHover />
            </div>;
        ReactDOM.render(element, document.getElementById('toasterror'));
        notify();
    }
    public static sendInfoNotif(notifContent: string) {
        const notify = () => toast.info(notifContent, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        const element =
            <div onLoad={ notify }>
                <ToastContainer position="top-center"
        autoClose = { 5000}
        hideProgressBar = { false}
        newestOnTop = { false}
        closeOnClick
        rtl = { false}
        pauseOnFocusLoss
        draggable
        pauseOnHover />
            </div>;
        ReactDOM.render(element, document.getElementById('toastinfo'));
        notify();
    }

}