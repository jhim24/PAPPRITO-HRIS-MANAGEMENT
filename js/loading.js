/* ==========================================
   PAPPRITO HRIS
   LOADING SYSTEM V4
   STABLE LOGIN LOADING
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
                Number(value) || 0
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
   STATUS
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
   AUTHENTICATION
========================================== */

function checkAuthentication(){

    return new Promise(
        resolve => {

            let resolved =
                false;

            let unsubscribe =
                null;


            const finish =
            user => {

                if(resolved){

                    return;

                }


                resolved =
                    true;


                if(
                    typeof unsubscribe ===
                    "function"
                ){

                    unsubscribe();

                }


                if(user){

                    if(authStatus){

                        authStatus.textContent =
                            "ONLINE";

                    }


                    if(authStatus){

                        authStatus.classList.add(
                            "online"
                        );

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

            };


            unsubscribe =
                onAuthStateChanged(
                    auth,
                    user => {

                        finish(
                            user
                        );

                    }
                );


            /*
             * SAFETY TIMEOUT
             *
             * Prevents loading screen
             * from staying forever.
             */

            setTimeout(
                () => {

                    if(!resolved){

                        console.error(
                            "Authentication check timeout."
                        );


                        finish(
                            auth.currentUser
                        );

                    }

                },
                8000
            );

        }
    );

}


/* ==========================================
   GET USER ROLE
========================================== */

function getUserRole(){

    const role =
        String(
            localStorage.getItem(
                "userRole"
            ) || ""
        )
        .trim()
        .toLowerCase();


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


    if(sessionStatus){

        sessionStatus.classList.add(
            "online"
        );

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


                    if(databaseStatus){

                        databaseStatus.classList.add(
                            "online"
                        );

                    }


                    moduleDone(
                        moduleDatabase
                    );


                    resolve(true);

                    return;

                }


                if(databaseStatus){

                    databaseStatus.textContent =
                        "FAILED";

                    databaseStatus.classList.remove(
                        "online"
                    );

                }


                resolve(false);

            }catch(error){

                console.error(
                    "Database Check Error:",
                    error
                );


                if(databaseStatus){

                    databaseStatus.textContent =
                        "FAILED";

                    databaseStatus.classList.remove(
                        "online"
                    );

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

    /*
     * ======================================
     * ADMIN
     * ======================================
     */

    if(
        role ===
        "admin"
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


        if(systemStatus){

            systemStatus.textContent =
                "ONLINE";

        }


        moduleDone(
            moduleSystem
        );


        updateProgress(
            100
        );


        setTimeout(
            () => {

                window.location.replace(
                    "dashboard.html"
                );

            },
            500
        );


        return;

    }


    /*
     * ======================================
     * EMPLOYEE
     * ======================================
     */

    if(
        role ===
        "employee"
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


        if(systemStatus){

            systemStatus.textContent =
                "ONLINE";

        }


        moduleDone(
            moduleSystem
        );


        updateProgress(
            100
        );


        setTimeout(
            () => {

                window.location.replace(
                    "employeeportal.html"
                );

            },
            500
        );


        return;

    }


    /*
     * ======================================
     * INVALID ROLE
     * ======================================
     */

    if(roleStatus){

        roleStatus.textContent =
            "UNKNOWN";

    }


    if(systemStatus){

        systemStatus.textContent =
            "OFFLINE";

        systemStatus.classList.remove(
            "online"
        );

    }


    setTitle(
        "INVALID USER SESSION"
    );


    setFooter(
        "PLEASE LOGIN AGAIN"
    );


    setTimeout(
        () => {

            localStorage.removeItem(
                "userRole"
            );

            localStorage.removeItem(
                "loggedInUser"
            );

            localStorage.removeItem(
                "employeeDocId"
            );

            localStorage.removeItem(
                "employeeId"
            );

            localStorage.removeItem(
                "employeeName"
            );


            window.location.replace(
                "login.html"
            );

        },
        1000
    );

}


/* ==========================================
   WAIT FOR ROLE
========================================== */

async function waitForRole(){

    /*
     * First check immediately.
     */

    let role =
        getUserRole();


    if(role){

        return role;

    }


    /*
     * Sometimes login script writes
     * localStorage just after Firebase
     * authentication completes.
     *
     * Give it a short time to appear.
     */

    for(
        let i = 0;
        i < 20;
        i++
    ){

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    100
                )
        );


        role =
            getUserRole();


        if(role){

            return role;

        }

    }


    return null;

}


/* ==========================================
   MAIN LOADING PROCESS
========================================== */

async function startLoading(){

    try{

        /*
         * START
         */

        updateProgress(
            5
        );


        setTitle(
            "CHECKING AUTHENTICATION..."
        );


        setFooter(
            "AUTHENTICATING USER..."
        );


        /* ==================================
           AUTHENTICATION
        ================================== */

        const user =
            await checkAuthentication();


        if(!user){

            setTitle(
                "AUTHENTICATION FAILED"
            );


            setFooter(
                "REDIRECTING TO LOGIN..."
            );


            updateProgress(
                0
            );


            setTimeout(
                () => {

                    window.location.replace(
                        "login.html"
                    );

                },
                1000
            );


            return;

        }


        updateProgress(
            30
        );


        /* ==================================
           SESSION
        ================================== */

        setTitle(
            "VERIFYING SESSION..."
        );


        const sessionValid =
            checkSession(
                user
            );


        if(!sessionValid){

            setTitle(
                "SESSION INVALID"
            );


            setFooter(
                "REDIRECTING TO LOGIN..."
            );


            setTimeout(
                () => {

                    window.location.replace(
                        "login.html"
                    );

                },
                800
            );


            return;

        }


        updateProgress(
            50
        );


        /* ==================================
           DATABASE
        ================================== */

        setTitle(
            "CONNECTING TO DATABASE..."
        );


        setFooter(
            "CONNECTING TO FIREBASE..."
        );


        await checkDatabase();


        updateProgress(
            70
        );


        /* ==================================
           ROLE
        ================================== */

        setTitle(
            "VERIFYING USER ROLE..."
        );


        setFooter(
            "VERIFYING ACCESS..."
        );


        const role =
            await waitForRole();


        if(!role){

            routeUser(
                null
            );

            return;

        }


        updateProgress(
            90
        );


        /* ==================================
           FINAL
        ================================== */

        setTitle(
            "SYSTEM READY..."
        );


        setFooter(
            "PAPPRITO HRIS READY"
        );


        updateProgress(
            100
        );


        /*
         * Small delay so user can
         * actually see 100%.
         */

        setTimeout(
            () => {

                routeUser(
                    role
                );

            },
            300
        );


    }catch(error){

        console.error(
            "Loading System Error:",
            error
        );


        /*
         * Never leave the user
         * stuck on the loading screen.
         */

        setTitle(
            "LOADING ERROR"
        );


        setFooter(
            "REDIRECTING TO LOGIN..."
        );


        updateProgress(
            0
        );


        setTimeout(
            () => {

                window.location.replace(
                    "login.html"
                );

            },
            1200
        );

    }

}


/* ==========================================
   START
========================================== */

window.addEventListener(
    "load",
    () => {

        startLoading();

    }
);
