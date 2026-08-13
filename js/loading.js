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


    /*
    Fallback:
    If Firebase user exists but no role
    was saved, treat as admin.
    */

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

        return "dashboard.html";

    }

    if(role === "employee"){

        return "employeeportal.html";

    }

    return "login.html";

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


    /*
    Mark all modules as completed.
    */

    moduleItems.forEach(item=>{

        item.classList.add("done");

    });


    /*
    Give the HUD a short moment to
    display 100% before redirect.
    */

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


            /*
            Mark modules progressively.
            */

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

        /*
        User is NOT logged in.
        */

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
                    "login.html"
                );

            },500);


            return;

        }


        /*
        User is authenticated.
        */

        authChecked = true;


        const role =
            getUserRole(user);


        /*
        Save authenticated user.
        */

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


        /*
        If role is missing,
        use admin fallback.
        */

        if(!role){

            localStorage.setItem(
                "userRole",
                "admin"
            );

        }


        const finalRole =
            role || "admin";


        /*
        Start loading.
        */

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
