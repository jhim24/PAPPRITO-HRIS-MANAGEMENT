/* ==========================================
   PAPPRITO HRIS
   LOADING SYSTEM
========================================== */

import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";


/* ==========================================
   ELEMENTS
========================================== */

const progressBar =
    document.getElementById("progressBar");

const percent =
    document.getElementById("percent");

const loadingText =
    document.getElementById("loadingText");

const systemStatus =
    document.getElementById("systemStatus");

const moduleItems =
    document.querySelectorAll(".module-item");


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let progress = 0;

let authChecked = false;

let loadingFinished = false;


/* ==========================================
   GET USER ROLE
========================================== */

function getUserRole(user){

    const savedRole =
        localStorage.getItem("userRole");

    if(savedRole === "admin"){

        return "admin";

    }

    if(savedRole === "employee"){

        return "employee";

    }

    if(user){

        return "admin";

    }

    return null;

}


/* ==========================================
   GET HOME PAGE
========================================== */

function getHomePage(role){

    if(role === "admin"){

        return "../pages/dashboard.html";

    }

    if(role === "employee"){

        return "../pages/employeeportal.html";

    }

    return "../pages/login.html";

}


/* ==========================================
   UPDATE PROGRESS
========================================== */

function updateProgress(value){

    progress = Math.min(
        100,
        Math.max(0,value)
    );


    if(progressBar){

        progressBar.style.width =
            progress + "%";

    }


    if(percent){

        percent.textContent =
            Math.floor(progress) + "%";

    }

}


/* ==========================================
   UPDATE STATUS
========================================== */

function updateStatus(text){

    if(loadingText){

        loadingText.textContent =
            text;

    }

}


/* ==========================================
   COMPLETE LOADING
========================================== */

function completeLoading(role){

    if(loadingFinished) return;

    loadingFinished = true;


    updateProgress(100);


    updateStatus(
        "SYSTEM READY"
    );


    if(systemStatus){

        systemStatus.textContent =
            "🟢 Online";

    }


    moduleItems.forEach(item=>{

        item.classList.add("done");

    });


    setTimeout(()=>{

        const homePage =
            getHomePage(role);


        window.location.replace(
            homePage
        );

    },700);

}


/* ==========================================
   SIMULATED LOADING
========================================== */

function startLoading(role){

    updateProgress(5);

    updateStatus(
        "Initializing HR System..."
    );


    const steps = [

        {
            progress:15,
            text:"Connecting to Firebase..."
        },

        {
            progress:30,
            text:"Loading Employee Module..."
        },

        {
            progress:45,
            text:"Loading Attendance Module..."
        },

        {
            progress:60,
            text:"Loading Payroll Module..."
        },

        {
            progress:75,
            text:"Loading HR Modules..."
        },

        {
            progress:90,
            text:"Preparing Dashboard..."
        },

        {
            progress:100,
            text:"System Ready"
        }

    ];


    let index = 0;


    const timer =
        setInterval(()=>{

            if(index >= steps.length){

                clearInterval(timer);

                completeLoading(role);

                return;

            }


            const step =
                steps[index];


            updateProgress(
                step.progress
            );


            updateStatus(
                step.text
            );


            if(
                moduleItems[index]
            ){

                moduleItems[index]
                    .classList.add("done");

            }


            index++;

        },350);

}


/* ==========================================
   AUTHENTICATION
========================================== */

onAuthStateChanged(
    auth,
    (user)=>{

        if(!user){

            authChecked = true;


            updateProgress(100);


            updateStatus(
                "SESSION EXPIRED"
            );


            if(systemStatus){

                systemStatus.textContent =
                    "🔴 Offline";

            }


            setTimeout(()=>{

                window.location.replace(
                    "../pages/login.html"
                );

            },500);


            return;

        }


        authChecked = true;


        const role =
            getUserRole(user);


        if(
            !localStorage.getItem(
                "loggedInUser"
            )
        ){

            localStorage.setItem(
                "loggedInUser",
                user.email || ""
            );

        }


        if(!role){

            localStorage.setItem(
                "userRole",
                "admin"
            );

        }


        const finalRole =
            role || "admin";


        startLoading(
            finalRole
        );

    }
);


/* ==========================================
   PAGE LOAD
========================================== */

window.addEventListener(
    "load",
    ()=>{

        console.log(
            "PAPPRITO HRIS Loading System Ready"
        );

    }
);
