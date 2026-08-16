/* ==========================================
   PAPPRITO HRIS
   LOADING SYSTEM V5
   STABLE LOGIN LOADING
========================================== */


/* ==========================================
   FIREBASE
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
    document.getElementById(
        "percent"
    );


const progressBar =
    document.getElementById(
        "progressBar"
    );


const loadingTitle =
    document.getElementById(
        "loadingTitle"
    );


const authStatus =
    document.getElementById(
        "authStatus"
    );


const databaseStatus =
    document.getElementById(
        "databaseStatus"
    );


const roleStatus =
    document.getElementById(
        "roleStatus"
    );


const sessionStatus =
    document.getElementById(
        "sessionStatus"
    );


const systemStatus =
    document.getElementById(
        "systemStatus"
    );


const footerStatus =
    document.getElementById(
        "footerStatus"
    );


const moduleAuth =
    document.getElementById(
        "moduleAuth"
    );


const moduleDatabase =
    document.getElementById(
        "moduleDatabase"
    );


const moduleSession =
    document.getElementById(
        "moduleSession"
    );


const moduleSystem =
    document.getElementById(
        "moduleSystem"
    );


/* ==========================================
   START TIME
========================================== */

const loadingStartTime =
    Date.now();


/* ==========================================
   MINIMUM LOADING TIME
========================================== */

const MIN_LOADING_TIME =
    2500;


/* ==========================================
   UPDATE PROGRESS
========================================== */

function updateProgress(
    value
){

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
            Math.round(
                value
            ) +
            "%";

    }


    if(progressBar){

        progressBar.style.width =
            value +
            "%";

    }

}


/* ==========================================
   UPDATE TITLE
========================================== */

function setTitle(
    text
){

    if(
        loadingTitle
    ){

        loadingTitle.textContent =
            text;

    }

}


/* ==========================================
   UPDATE FOOTER
========================================== */

function setFooter(
    text
){

    if(
        footerStatus
    ){

        footerStatus.textContent =
            text;

    }

}


/* ==========================================
   STATUS ONLINE
========================================== */

function setOnline(
    element
){

    if(!element){

        return;

    }


    element.textContent =
        "ONLINE";


    element.classList.add(
        "online"
    );

}


/* ==========================================
   MODULE DONE
========================================== */

function moduleDone(
    element
){

    if(!element){

        return;

    }


    element.classList.add(
        "done"
    );


    element.classList.remove(
        "active"
    );


    element.classList.remove(
        "error"
    );

}


/* ==========================================
   MODULE ACTIVE
========================================== */

function moduleActive(
    element
){

    if(!element){

        return;

    }


    element.classList.add(
        "active"
    );

}


/* ==========================================
   MODULE ERROR
========================================== */

function moduleError(
    element
){

    if(!element){

        return;

    }


    element.classList.add(
        "error"
    );


    element.classList.remove(
        "active"
    );

}


/* ==========================================
   DELAY
========================================== */

function delay(
    milliseconds
){

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


/* ==========================================
   WAIT MINIMUM LOADING TIME
========================================== */

async function waitMinimumLoadingTime(){

    const elapsed =
        Date.now() -
        loadingStartTime;


    const remaining =
        Math.max(
            0,
            MIN_LOADING_TIME -
            elapsed
        );


    if(
        remaining > 0
    ){

        await delay(
            remaining
        );

    }

}


/* ==========================================
   AUTHENTICATION
========================================== */

function checkAuthentication(){

    return new Promise(
        resolve => {

            let finished =
                false;


            let unsubscribe =
                null;


            const finish =
            async function(
                user
            ){

                if(
                    finished
                ){

                    return;

                }


                finished =
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

                        authStatus.classList.add(
                            "online"
                        );

                    }


                    moduleDone(
                        moduleAuth
                    );


                    updateProgress(
                        25
                    );


                    resolve(
                        user
                    );

                }

                else{

                    if(authStatus){

                        authStatus.textContent =
                            "FAILED";

                        authStatus.classList.remove(
                            "online"
                        );

                    }


                    moduleError(
                        moduleAuth
                    );


                    resolve(
                        null
                    );

                }

            };


            moduleActive(
                moduleAuth
            );


            unsubscribe =
                onAuthStateChanged(

                    auth,

                    function(user){

                        finish(
                            user
                        );

                    }

                );


            /*
             * SAFETY TIMEOUT
             */

            setTimeout(
                function(){

                    if(
                        !finished
                    ){

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
        role === "admin"
        ||
        role === "employee"
    ){

        return role;

    }


    return null;

}


/* ==========================================
   SESSION CHECK
========================================== */

function checkSession(
    user
){

    if(!user){

        if(sessionStatus){

            sessionStatus.textContent =
                "FAILED";

        }


        moduleError(
            moduleSession
        );


        return false;

    }


    moduleActive(
        moduleSession
    );


    if(sessionStatus){

        sessionStatus.textContent =
            "ACTIVE";

        sessionStatus.classList.add(
            "online"
        );

    }


    moduleDone(
        moduleSession
    );


    updateProgress(
        45
    );


    return true;

}


/* ==========================================
   DATABASE CHECK
========================================== */

function checkDatabase(){

    return new Promise(
        async resolve => {

            moduleActive(
                moduleDatabase
            );


            try{

                /*
                 * Firebase db object
                 * must exist.
                 */

                if(!db){

                    throw new Error(
                        "Firebase database is unavailable."
                    );

                }


                /*
                 * Small delay so the
                 * database status is
                 * visually noticeable.
                 */

                await delay(
                    350
                );


                if(databaseStatus){

                    databaseStatus.textContent =
                        "READY";

                    databaseStatus.classList.add(
                        "online"
                    );

                }


                moduleDone(
                    moduleDatabase
                );


                updateProgress(
                    65
                );


                resolve(
                    true
                );


            }

            catch(error){

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


                moduleError(
                    moduleDatabase
                );


                resolve(
                    false
                );

            }

        }
    );

}


/* ==========================================
   WAIT FOR ROLE
========================================== */

async function waitForRole(){

    /*
     * Immediate check.
     */

    let role =
        getUserRole();


    if(role){

        return role;

    }


    /*
     * Wait for login.js
     * localStorage update.
     */

    for(
        let i = 0;
        i < 30;
        i++
    ){

        await delay(
            100
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
   ROLE STATUS
========================================== */

function setRoleStatus(
    role
){

    if(!roleStatus){

        return;

    }


    if(
        role ===
        "admin"
    ){

        roleStatus.textContent =
            "ADMIN";

        roleStatus.classList.add(
            "online"
        );

        return;

    }


    if(
        role ===
        "employee"
    ){

        roleStatus.textContent =
            "EMPLOYEE";

        roleStatus.classList.add(
            "online"
        );

        return;

    }


    roleStatus.textContent =
        "UNKNOWN";

    roleStatus.classList.remove(
        "online"
    );

}


/* ==========================================
   ROUTE USER
========================================== */

async function routeUser(
    role
){

    /*
     * ======================================
     * INVALID ROLE
     * ======================================
     */

    if(
        role !== "admin"
        &&
        role !== "employee"
    ){

        setRoleStatus(
            null
        );


        if(systemStatus){

            systemStatus.textContent =
                "OFFLINE";

            systemStatus.classList.remove(
                "online"
            );

        }


        moduleError(
            moduleSystem
        );


        setTitle(
            "INVALID USER SESSION"
        );


        setFooter(
            "PLEASE LOGIN AGAIN"
        );


        updateProgress(
            0
        );


        await delay(
            1000
        );


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


        return;

    }


    /*
     * ======================================
     * ROLE
     * ======================================
     */

    setRoleStatus(
        role
    );


    updateProgress(
        85
    );


    /*
     * ======================================
     * SYSTEM
     * ======================================
     */

    moduleActive(
        moduleSystem
    );


    setTitle(
        "INITIALIZING SYSTEM..."
    );


    setFooter(
        "STARTING PAPPRITO HRIS..."
    );


    if(systemStatus){

        systemStatus.textContent =
            "STARTING";

    }


    await delay(
        500
    );


    if(systemStatus){

        systemStatus.textContent =
            "ONLINE";

        systemStatus.classList.add(
            "online"
        );

    }


    moduleDone(
        moduleSystem
    );


    updateProgress(
        100
    );


    /*
     * ======================================
     * FINAL MESSAGE
     * ======================================
     */

    if(
        role ===
        "admin"
    ){

        setTitle(
            "LOADING ADMIN DASHBOARD..."
        );


        setFooter(
            "ADMIN SESSION READY"
        );

    }


    if(
        role ===
        "employee"
    ){

        setTitle(
            "LOADING EMPLOYEE PORTAL..."
        );


        setFooter(
            "EMPLOYEE SESSION READY"
        );

    }


    /*
     * ======================================
     * KEEP 100% VISIBLE
     * ======================================
     */

    await delay(
        900
    );


    /*
     * ======================================
     * REDIRECT
     * ======================================
     */

    if(
        role ===
        "admin"
    ){

        window.location.replace(
            "dashboard.html"
        );

        return;

    }


    if(
        role ===
        "employee"
    ){

        window.location.replace(
            "employeeportal.html"
        );

        return;

    }

}


/* ==========================================
   MAIN LOADING PROCESS
========================================== */

async function startLoading(){

    try{

        /*
         * ==================================
         * RESET
         * ==================================
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


        /*
         * ==================================
         * AUTHENTICATION
         * ==================================
         */

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


            await delay(
                1000
            );


            window.location.replace(
                "login.html"
            );


            return;

        }


        /*
         * ==================================
         * SESSION
         * ==================================
         */

        setTitle(
            "VERIFYING SESSION..."
        );


        setFooter(
            "VERIFYING ACTIVE SESSION..."
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


            updateProgress(
                0
            );


            await delay(
                900
            );


            window.location.replace(
                "login.html"
            );


            return;

        }


        /*
         * ==================================
         * DATABASE
         * ==================================
         */

        setTitle(
            "CONNECTING TO DATABASE..."
        );


        setFooter(
            "CONNECTING TO FIREBASE..."
        );


        const databaseReady =
            await checkDatabase();


        if(!databaseReady){

            /*
             * We don't immediately
             * destroy the session.
             *
             * Show the error first.
             */

            setTitle(
                "DATABASE CONNECTION WARNING"
            );


            setFooter(
                "CONTINUING WITH LIMITED CONNECTION..."
            );


            await delay(
                700
            );

        }


        /*
         * ==================================
         * ROLE
         * ==================================
         */

        setTitle(
            "VERIFYING USER ROLE..."
        );


        setFooter(
            "VERIFYING ACCESS PERMISSIONS..."
        );


        const role =
            await waitForRole();


        if(!role){

            await routeUser(
                null
            );

            return;

        }


        setRoleStatus(
            role
        );


        updateProgress(
            85
        );


        /*
         * ==================================
         * FINAL SYSTEM
         * ==================================
         */

        await routeUser(
            role
        );


    }

    catch(error){

        console.error(
            "Loading System Error:",
            error
        );


        setTitle(
            "LOADING ERROR"
        );


        setFooter(
            "REDIRECTING TO LOGIN..."
        );


        updateProgress(
            0
        );


        await delay(
            1200
        );


        window.location.replace(
            "login.html"
        );

    }

}


/* ==========================================
   START
========================================== */

window.addEventListener(
    "load",
    function(){

        /*
         * Make sure the loading
         * screen is actually visible
         * before starting the process.
         */

        document.body.style.visibility =
            "visible";


        startLoading();

    }
);
