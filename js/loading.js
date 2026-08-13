/* ==========================================
   PAPPRITO HRIS
   LOADING SYSTEM V3
========================================== */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";


/* ==========================================
   ELEMENTS
========================================== */

const percent =
document.getElementById("percent");

const progressBar =
document.getElementById("progressBar");

const circleProgress =
document.getElementById("circleProgress");

const loadingTitle =
document.getElementById("loadingTitle");

const authStatus =
document.getElementById("authStatus");

const databaseStatus =
document.getElementById("databaseStatus");

const roleStatus =
document.getElementById("roleStatus");

const sessionStatus =
document.getElementById("sessionStatus");

const systemStatus =
document.getElementById("systemStatus");

const footerStatus =
document.getElementById("footerStatus");

const moduleAuth =
document.getElementById("moduleAuth");

const moduleDatabase =
document.getElementById("moduleDatabase");

const moduleSession =
document.getElementById("moduleSession");

const moduleSystem =
document.getElementById("moduleSystem");


/* ==========================================
   PROGRESS
========================================== */

const CIRCLE_LENGTH = 597;

if(circleProgress){

    circleProgress.style.strokeDasharray =
    CIRCLE_LENGTH;

    circleProgress.style.strokeDashoffset =
    CIRCLE_LENGTH;

}


/* ==========================================
   UPDATE PROGRESS
========================================== */

function updateProgress(value){

    value =
    Math.max(
        0,
        Math.min(
            100,
            value
        )
    );


    if(percent){

        percent.textContent =
        Math.round(value) + "%";

    }


    if(progressBar){

        progressBar.style.width =
        value + "%";

    }


    if(circleProgress){

        const offset =

        CIRCLE_LENGTH -
        (
            CIRCLE_LENGTH *
            value /
            100
        );


        circleProgress.style.strokeDashoffset =
        offset;

    }

}


/* ==========================================
   STATUS TEXT
========================================== */

function setTitle(text){

    if(loadingTitle){

        loadingTitle.textContent =
        text;

    }

}


function setFooter(text){

    if(footerStatus){

        footerStatus.textContent =
        text;

    }

}


/* ==========================================
   MODULE DONE
========================================== */

function moduleDone(element){

    if(element){

        element.classList.add(
            "done"
        );

    }

}


/* ==========================================
   AUTHENTICATION CHECK
========================================== */

function checkAuthentication(){

    return new Promise(
        resolve => {

            let finished = false;


            const unsubscribe =

            onAuthStateChanged(

                auth,

                user => {

                    if(finished){

                        return;

                    }


                    finished = true;


                    unsubscribe();


                    if(user){

                        if(authStatus){

                            authStatus.textContent =
                            "ONLINE";

                        }


                        moduleDone(
                            moduleAuth
                        );


                        resolve(user);

                    }else{

                        if(authStatus){

                            authStatus.textContent =
                            "FAILED";

                            authStatus.classList.remove(
                                "online"
                            );

                        }


                        resolve(null);

                    }

                }

            );

        }
    );

}


/* ==========================================
   GET ROLE
========================================== */

function getUserRole(){

    const role =

    localStorage.getItem(
        "userRole"
    );


    if(
        role === "admin" ||
        role === "employee"
    ){

        return role;

    }


    return null;

}


/* ==========================================
   SESSION CHECK
========================================== */

function checkSession(user){

    if(!user){

        return false;

    }


    if(sessionStatus){

        sessionStatus.textContent =
        "ACTIVE";

    }


    moduleDone(
        moduleSession
    );


    return true;

}


/* ==========================================
   DATABASE STATUS
========================================== */

function checkDatabase(){

    return new Promise(
        resolve => {

            try{

                if(db){

                    if(databaseStatus){

                        databaseStatus.textContent =
                        "READY";

                    }


                    moduleDone(
                        moduleDatabase
                    );


                    resolve(true);

                }else{

                    if(databaseStatus){

                        databaseStatus.textContent =
                        "FAILED";

                    }


                    resolve(false);

                }

            }catch(error){

                console.error(
                    error
                );


                if(databaseStatus){

                    databaseStatus.textContent =
                    "FAILED";

                }


                resolve(false);

            }

        }
    );

}


/* ==========================================
   ROUTE USER
========================================== */

function routeUser(role){

    if(
        role === "admin"
    ){

        if(roleStatus){

            roleStatus.textContent =
            "ADMIN";

        }


        setTitle(
            "LOADING ADMIN DASHBOARD..."
        );


        setFooter(
            "ADMIN SESSION READY"
        );


        moduleDone(
            moduleSystem
        );


        updateProgress(100);


        setTimeout(
            ()=>{

                window.location.replace(
                    "dashboard.html"
                );

            },
            500
        );


        return;

    }


    if(
        role === "employee"
    ){

        if(roleStatus){

            roleStatus.textContent =
            "EMPLOYEE";

        }


        setTitle(
            "LOADING EMPLOYEE PORTAL..."
        );


        setFooter(
            "EMPLOYEE SESSION READY"
        );


        moduleDone(
            moduleSystem
        );


        updateProgress(100);


        setTimeout(
            ()=>{

                window.location.replace(
                    "employeeportal.html"
                );

            },
            500
        );


        return;

    }


    /* ======================================
       INVALID ROLE
    ====================================== */

    if(roleStatus){

        roleStatus.textContent =
        "UNKNOWN";

    }


    setTitle(
        "INVALID USER SESSION"
    );


    setFooter(
        "PLEASE LOGIN AGAIN"
    );


    setTimeout(
        ()=>{

            localStorage.removeItem(
                "userRole"
            );

            localStorage.removeItem(
                "loggedInUser"
            );

            window.location.replace(
                "login.html"
            );

        },
        1000
    );

}


/* ==========================================
   MAIN LOADING PROCESS
========================================== */

async function startLoading(){

    updateProgress(5);

    setTitle(
        "CHECKING AUTHENTICATION..."
    );

    setFooter(
        "AUTHENTICATING USER..."
    );


    /* ======================================
       AUTH
    ====================================== */

    const user =
    await checkAuthentication();


    if(!user){

        setTitle(
            "AUTHENTICATION FAILED"
        );

        setFooter(
            "REDIRECTING TO LOGIN..."
        );


        updateProgress(0);


        setTimeout(
            ()=>{

                window.location.replace(
                    "login.html"
                );

            },
            1000
        );


        return;

    }


    updateProgress(35);


    /* ======================================
       SESSION
    ====================================== */

    setTitle(
        "VERIFYING SESSION..."
    );


    const sessionValid =
    checkSession(user);


    if(!sessionValid){

        window.location.replace(
            "login.html"
        );

        return;

    }


    updateProgress(55);


    /* ======================================
       DATABASE
    ====================================== */

    setTitle(
        "CONNECTING TO DATABASE..."
    );


    await checkDatabase();


    updateProgress(75);


    /* ======================================
       ROLE
    ====================================== */

    setTitle(
        "VERIFYING USER ROLE..."
    );


    const role =
    getUserRole();


    if(!role){

        routeUser(null);

        return;

    }


    updateProgress(90);


    /* ======================================
       FINAL
    ====================================== */

    setTitle(
        "SYSTEM READY..."
    );


    setFooter(
        "PAPPRITO HRIS READY"
    );


    routeUser(
        role
    );

}


/* ==========================================
   START
========================================== */

window.addEventListener(
    "load",
    ()=>{

        startLoading();

    }
);
