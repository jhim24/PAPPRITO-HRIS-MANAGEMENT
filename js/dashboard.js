/* ==========================================
   PAPPRITO HRIS
   DASHBOARD V3
========================================== */

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let dashboardLoaded = false;

let clockStarted = false;


/* ==========================================
   PAGE NAVIGATION
========================================== */

window.openPage = function(page){

    if(!page) return;

    window.location.href = page;

};


/* ==========================================
   LOGOUT
========================================== */

window.logout = async function(){

    if(
        !confirm(
            "Are you sure you want to logout?"
        )
    ){

        return;

    }


    try{

        await signOut(auth);


        localStorage.clear();

        sessionStorage.clear();


        window.location.replace(
            "login.html"
        );


    }catch(error){

        console.error(error);

        alert(
            error.message
        );

    }

};


/* ==========================================
   AUTH PROTECTION
========================================== */

onAuthStateChanged(
    auth,
    (user)=>{

        if(!user){

            window.location.replace(
                "login.html"
            );

            return;

        }


        /* ======================================
           ADMIN ROLE CHECK
        ====================================== */

        const role =
            localStorage.getItem(
                "userRole"
            );


        /*
        Dashboard is ADMIN only.

        If an employee somehow opens
        dashboard.html directly, send them
        to their Employee Portal.
        */

        if(role === "employee"){

            window.location.replace(
                "employeeportal.html"
            );

            return;

        }


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
           START CLOCK
        ====================================== */

        updateClock();

    }
);


/* ==========================================
   LIVE CLOCK
========================================== */

function updateClock(){

    if(clockStarted) return;

    clockStarted = true;


    const clock =
        document.getElementById(
            "clock"
        );


    const dateToday =
        document.getElementById(
            "dateToday"
        );


    const mobileClock =
        document.getElementById(
            "mobileClock"
        );


    const mobileDate =
        document.getElementById(
            "mobileDate"
        );


    function refreshClock(){

        const now =
            new Date();


        /* ======================================
           TIME
        ====================================== */

        const timeText =

            now.toLocaleTimeString(
                "en-US",
                {
                    hour:"numeric",
                    minute:"2-digit",
                    second:"2-digit"
                }
            );


        /* ======================================
           DATE
        ====================================== */

        const dateText =

            now.toLocaleDateString(
                "en-US",
                {
                    weekday:"long",
                    year:"numeric",
                    month:"long",
                    day:"numeric"
                }
            );


        /* ======================================
           DESKTOP CLOCK
        ====================================== */

        if(clock){

            clock.textContent =
                timeText;

        }


        if(dateToday){

            dateToday.textContent =
                dateText;

        }


        /* ======================================
           MOBILE CLOCK
        ====================================== */

        if(mobileClock){

            mobileClock.textContent =
                timeText;

        }


        if(mobileDate){

            mobileDate.textContent =
                dateText;

        }

    }


    refreshClock();


    setInterval(
        refreshClock,
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


        employeeSnap.forEach(doc=>{

            employees.push({

                id:doc.id,

                ...doc.data()

            });

        });


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

            birthdayList.innerHTML =
                "";

        }


        let count = 0;


        const today =
            new Date();


        const currentMonth =
            today.getMonth() + 1;


        employees.forEach(emp=>{

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

        });


        if(
            count === 0
            &&
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
           PRESENT
        ====================================== */

        const present =
            document.getElementById(
                "presentToday"
            );


        const summaryPresent =
            document.getElementById(
                "summaryPresent"
            );


        if(present){

            present.textContent =
                attendanceSnap.size;

        }


        if(summaryPresent){

            summaryPresent.textContent =
                attendanceSnap.size;

        }


        /* ======================================
           LATE
        ====================================== */

        const late =
            document.getElementById(
                "lateToday"
            );


        const summaryLate =
            document.getElementById(
                "summaryLate"
            );


        if(late){

            late.textContent =
                "0";

        }


        if(summaryLate){

            summaryLate.textContent =
                "0";

        }


        /* ======================================
           LEAVE
        ====================================== */

        const leave =
            document.getElementById(
                "leaveToday"
            );


        const summaryLeave =
            document.getElementById(
                "summaryLeave"
            );


        if(leave){

            leave.textContent =
                "0";

        }


        if(summaryLeave){

            summaryLeave.textContent =
                "0";

        }


        /* ======================================
           SYSTEM STATUS
        ====================================== */

        const systemStatus =
            document.getElementById(
                "systemStatus"
            );


        if(systemStatus){

            systemStatus.textContent =
                "🟢 Online";

        }


        console.log(
            "PAPPRITO HRIS Dashboard Updated"
        );


    }catch(error){

        console.error(
            "Dashboard loading failed:",
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


    if(!activity) return;


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


    if(!announcement) return;


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
    menuBtn
    &&
    sidebar
    &&
    overlay
){

    /* ======================================
       OPEN SIDEBAR
    ====================================== */

    menuBtn.onclick = function(){

        sidebar.classList.add(
            "show"
        );

        overlay.classList.add(
            "show"
        );

    };


    /* ======================================
       CLOSE SIDEBAR
    ====================================== */

    overlay.onclick = function(){

        sidebar.classList.remove(
            "show"
        );

        overlay.classList.remove(
            "show"
        );

    };


    /* ======================================
       CLOSE ON DESKTOP
    ====================================== */

    window.addEventListener(
        "resize",
        ()=>{

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

setInterval(()=>{

    if(dashboardLoaded){

        loadDashboard();

    }

},60000);


/* ==========================================
   INITIALIZE
========================================== */

window.addEventListener(
    "load",
    ()=>{

        loadRecentActivity();

        loadAnnouncements();

        updateClock();

        console.log(
            "PAPPRITO HRIS Dashboard Ready"
        );

    }
);
