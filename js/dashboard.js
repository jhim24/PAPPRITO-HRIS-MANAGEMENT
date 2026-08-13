/* ==========================================
   PAPPRITO HRIS
   DASHBOARD V3
========================================== */

import {
    auth,
    db
} from "./firebase.js";

import {

    onAuthStateChanged,
    signOut

}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {

    collection,
    getDocs

}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let dashboardLoaded = false;

let clockStarted = false;


/* ==========================================
   PAGE NAVIGATION
========================================== */

window.openPage = function(page){

    window.location.href = page;

};


/* ==========================================
   LOGOUT
========================================== */

window.logout = async function(){

    const confirmLogout =

        confirm(
            "Are you sure you want to logout?"
        );


    if(!confirmLogout){

        return;

    }


    try{

        await signOut(auth);


        /* Clear application session */

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


        /*
           Keep rememberUser only if
           you want the username remembered.
        */


        /* Replace current history */

        window.location.replace(
            "login.html"
        );


    }catch(error){

        console.error(
            "Logout Error:",
            error
        );

        alert(
            "Logout failed."
        );

    }

};


/* ==========================================
   AUTH PROTECTION
========================================== */

onAuthStateChanged(
    auth,
    function(user){

        /* ======================================
           NOT LOGGED IN
        ====================================== */

        if(!user){

            window.location.replace(
                "login.html"
            );

            return;

        }


        /* ======================================
           CHECK ROLE
        ====================================== */

        const userRole =

            localStorage.getItem(
                "userRole"
            );


        /*
           Dashboard is ADMIN area.
           Employee should not access it.
        */

        if(
            userRole !== "admin"
        ){

            if(
                userRole === "employee"
            ){

                window.location.replace(
                    "employeeportal.html"
                );

            }else{

                window.location.replace(
                    "login.html"
                );

            }

            return;

        }


        /* ======================================
           PREVENT BACK TO LOGIN
        ====================================== */

        history.replaceState(
            null,
            "",
            location.href
        );


        history.pushState(
            null,
            "",
            location.href
        );


        window.addEventListener(
            "popstate",
            function(){

                /*
                   Check Firebase session again.
                */

                const currentUser =
                    auth.currentUser;


                if(currentUser){

                    /*
                       Keep Dashboard in history
                       instead of going to Login.
                    */

                    history.pushState(
                        null,
                        "",
                        location.href
                    );

                }else{

                    /*
                       Session is gone.
                       Allow Login.
                    */

                    window.location.replace(
                        "login.html"
                    );

                }

            }
        );


        /* ======================================
           LOGGED USER
        ====================================== */

        const loggedUser =

            localStorage.getItem(
                "loggedInUser"
            )

            ||

            user.email

            ||

            "Administrator";


        const userBox =

            document.getElementById(
                "loggedUser"
            );


        if(userBox){

            userBox.textContent =
                loggedUser;

        }


        /* ======================================
           LOAD DASHBOARD
        ====================================== */

        if(!dashboardLoaded){

            dashboardLoaded = true;

            loadDashboard();

        }


        /* ======================================
           CLOCK
        ====================================== */

        updateClock();

    }
);


/* ==========================================
   LIVE CLOCK
========================================== */

function updateClock(){

    if(clockStarted){

        return;

    }


    clockStarted = true;


    const clock =

        document.getElementById(
            "clock"
        );


    const dateToday =

        document.getElementById(
            "dateToday"
        );


    if(
        !clock ||
        !dateToday
    ){

        return;

    }


    function update(){

        const now =
            new Date();


        clock.textContent =

            now.toLocaleTimeString();


        dateToday.textContent =

            now.toLocaleDateString(

                "en-US",

                {

                    weekday:
                        "long",

                    year:
                        "numeric",

                    month:
                        "long",

                    day:
                        "numeric"

                }

            );

    }


    update();


    setInterval(
        update,
        1000
    );

}


/* ==========================================
   LOAD DASHBOARD
========================================== */

async function loadDashboard(){

    try{

        /* ======================================
           EMPLOYEES
        ====================================== */

        const employeeSnap =

            await getDocs(

                collection(
                    db,
                    "users"
                )

            );


        const employees = [];


        employeeSnap.forEach(
            function(doc){

                employees.push(
                    doc.data()
                );

            }
        );


        const totalEmployees =

            document.getElementById(
                "totalEmployees"
            );


        if(totalEmployees){

            totalEmployees.textContent =
                employees.length;

        }


        /* ======================================
           ATTENDANCE
        ====================================== */

        const attendanceSnap =

            await getDocs(

                collection(
                    db,
                    "attendance"
                )

            );


        const totalAttendance =

            document.getElementById(
                "totalAttendance"
            );


        if(totalAttendance){

            totalAttendance.textContent =
                attendanceSnap.size;

        }


        /* ======================================
           PAYROLL
        ====================================== */

        const payrollSnap =

            await getDocs(

                collection(
                    db,
                    "payroll"
                )

            );


        const totalPayroll =

            document.getElementById(
                "totalPayroll"
            );


        if(totalPayroll){

            totalPayroll.textContent =
                payrollSnap.size;

        }


        /* ======================================
           REQUESTS
        ====================================== */

        const requestSnap =

            await getDocs(

                collection(
                    db,
                    "requests"
                )

            );


        const totalRequests =

            document.getElementById(
                "totalRequests"
            );


        if(totalRequests){

            totalRequests.textContent =
                requestSnap.size;

        }


        /* ======================================
           UPCOMING BIRTHDAYS
        ====================================== */

        const birthdayList =

            document.getElementById(
                "birthdayList"
            );


        const birthdayCount =

            document.getElementById(
                "upcomingBirthdays"
            );


        if(birthdayList){

            birthdayList.innerHTML = "";

        }


        let count = 0;


        const today =
            new Date();


        const currentMonth =

            today.getMonth() + 1;


        employees.forEach(
            function(emp){

                if(!emp.birthdate){

                    return;

                }


                const birth =

                    new Date(
                        emp.birthdate
                    );


                if(
                    birth.getMonth() + 1
                    ===
                    currentMonth
                ){

                    count++;


                    if(birthdayList){

                        birthdayList.innerHTML += `

                            <div class="birthday-item">

                                <strong>

                                    ${emp.firstname || ""}

                                    ${emp.lastname || ""}

                                </strong>

                                <br>

                                ${birth.toLocaleDateString()}

                            </div>

                        `;

                    }

                }

            }
        );


        if(
            count === 0 &&
            birthdayList
        ){

            birthdayList.innerHTML =

                "<p>No upcoming birthdays.</p>";

        }


        if(birthdayCount){

            birthdayCount.textContent =
                count;

        }


        /* ======================================
           PRESENT / LATE / LEAVE
        ====================================== */

        const present =

            document.getElementById(
                "presentToday"
            );


        const late =

            document.getElementById(
                "lateToday"
            );


        const leave =

            document.getElementById(
                "leaveToday"
            );


        if(present){

            present.textContent =
                attendanceSnap.size;

        }


        if(late){

            late.textContent =
                "0";

        }


        if(leave){

            leave.textContent =
                "0";

        }


    }catch(error){

        console.error(
            "Dashboard Error:",
            error
        );

        alert(
            "Dashboard loading failed."
        );

    }

}


/* ==========================================
   RECENT ACTIVITY
========================================== */

function loadRecentActivity(){

    const activity =

        document.getElementById(
            "recentActivity"
        );


    if(!activity){

        return;

    }


    activity.innerHTML = `

        <div class="activity-item">

            <span class="material-icons">

                check_circle

            </span>

            Dashboard Loaded Successfully

        </div>

    `;

}


/* ==========================================
   ANNOUNCEMENTS
========================================== */

function loadAnnouncements(){

    const announcement =

        document.getElementById(
            "announcementList"
        );


    if(!announcement){

        return;

    }


    announcement.innerHTML = `

        <div class="announcement-item">

            📢 Welcome to PAPPRITO HRIS Version 2.0

        </div>

    `;

}


/* ==========================================
   MOBILE SIDEBAR
========================================== */

const menuBtn =

    document.getElementById(
        "menuBtn"
    );


const sidebar =

    document.getElementById(
        "sidebar"
    );


const overlay =

    document.getElementById(
        "overlay"
    );


if(
    menuBtn &&
    sidebar &&
    overlay
){

    menuBtn.onclick = function(){

        sidebar.classList.add(
            "show"
        );

        overlay.classList.add(
            "show"
        );

    };


    overlay.onclick = function(){

        sidebar.classList.remove(
            "show"
        );

        overlay.classList.remove(
            "show"
        );

    };


    window.addEventListener(
        "resize",
        function(){

            if(
                window.innerWidth > 768
            ){

                sidebar.classList.remove(
                    "show"
                );

                overlay.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* ==========================================
   AUTO REFRESH
========================================== */

setInterval(
    function(){

        if(dashboardLoaded){

            loadDashboard();

        }

    },
    60000
);


/* ==========================================
   INITIALIZE
========================================== */

window.addEventListener(
    "load",
    function(){

        loadRecentActivity();

        loadAnnouncements();

        console.log(
            "PAPPRITO HRIS Dashboard Ready"
        );

    }
);
