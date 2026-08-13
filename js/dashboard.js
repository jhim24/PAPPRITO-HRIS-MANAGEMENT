/* ==========================================
   PAPPRITO HRIS
   PREMIUM DASHBOARD JS
========================================== */

import {
    db,
    auth
} from "./firebase.js";


import {
    collection,
    getDocs
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


import {
    onAuthStateChanged,
    signOut
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";


/* ==========================================
   GLOBAL
========================================== */

let employees = [];

let attendanceRecords = [];

let leaveRequests = [];

let currentUser = null;


/* ==========================================
   ELEMENTS
========================================== */

const sidebar =
    document.getElementById(
        "sidebar"
    );


const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


const menuBtn =
    document.getElementById(
        "menuBtn"
    );


const currentDate =
    document.getElementById(
        "currentDate"
    );


const sidebarUser =
    document.getElementById(
        "sidebarUser"
    );


const welcomeUser =
    document.getElementById(
        "welcomeUser"
    );


const totalEmployees =
    document.getElementById(
        "totalEmployees"
    );


const activeEmployees =
    document.getElementById(
        "activeEmployees"
    );


const todayAttendance =
    document.getElementById(
        "todayAttendance"
    );


const pendingLeaves =
    document.getElementById(
        "pendingLeaves"
    );


const presentCount =
    document.getElementById(
        "presentCount"
    );


const lateCount =
    document.getElementById(
        "lateCount"
    );


const onLeaveCount =
    document.getElementById(
        "onLeaveCount"
    );


const absentCount =
    document.getElementById(
        "absentCount"
    );


const notificationBadge =
    document.getElementById(
        "notificationBadge"
    );


const recentLeaves =
    document.getElementById(
        "recentLeaves"
    );


/* ==========================================
   HELPERS
========================================== */

function text(value){

    return String(
        value ?? ""
    ).trim();

}


function escapeHTML(value){

    return String(
        value ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


/* ==========================================
   DATE FORMAT
========================================== */

function getToday(){

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* ==========================================
   DISPLAY DATE
========================================== */

function displayCurrentDate(){

    if(
        !currentDate
    ){

        return;

    }


    const date =
        new Date();


    currentDate.textContent =
        date.toLocaleDateString(
            "en-US",
            {

                weekday:
                    "short",

                month:
                    "short",

                day:
                    "numeric",

                year:
                    "numeric"

            }
        );

}


/* ==========================================
   USER NAME
========================================== */

function getCurrentUserName(){

    const storedName =
        text(
            localStorage.getItem(
                "loggedInUser"
            )
        );


    if(
        storedName
    ){

        return storedName;

    }


    if(
        currentUser &&
        currentUser.email
    ){

        return currentUser.email;

    }


    return "Admin";

}


/* ==========================================
   DISPLAY USER
========================================== */

function displayUser(){

    const name =
        getCurrentUserName();


    if(
        sidebarUser
    ){

        sidebarUser.textContent =
            name;

    }


    if(
        welcomeUser
    ){

        welcomeUser.textContent =
            name;

    }

}


/* ==========================================
   ANIMATE NUMBER
========================================== */

function animateNumber(
    element,
    target
){

    if(
        !element
    ){

        return;

    }


    const finalValue =
        Number(
            target || 0
        );


    if(
        finalValue === 0
    ){

        element.textContent =
            "0";

        return;

    }


    let current =
        0;


    const duration =
        500;


    const steps =
        25;


    const increment =
        finalValue /
        steps;


    const interval =
        duration /
        steps;


    const timer =
        setInterval(
            () => {

                current +=
                    increment;


                if(
                    current >=
                    finalValue
                ){

                    current =
                        finalValue;

                    clearInterval(
                        timer
                    );

                }


                element.textContent =
                    Math.floor(
                        current
                    );

            },
            interval
        );

}


/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    employees = [];


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "employees"
                )
            );


        snapshot.forEach(
            docSnap => {

                employees.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        updateEmployeeStats();


    }catch(error){

        console.error(
            "Employee Load Error:",
            error
        );

    }

}


/* ==========================================
   EMPLOYEE STATS
========================================== */

function updateEmployeeStats(){

    const total =
        employees.length;


    const active =
        employees.filter(
            employee => {

                const status =
                    text(
                        employee.status
                    )
                    .toLowerCase();


                return (
                    status ===
                    "active"
                );

            }
        ).length;


    animateNumber(
        totalEmployees,
        total
    );


    animateNumber(
        activeEmployees,
        active
    );

}


/* ==========================================
   LOAD ATTENDANCE
========================================== */

async function loadAttendance(){

    attendanceRecords = [];


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "attendance"
                )
            );


        snapshot.forEach(
            docSnap => {

                attendanceRecords.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        updateAttendanceStats();


    }catch(error){

        console.error(
            "Attendance Load Error:",
            error
        );


        /*
         * Keep dashboard working
         * even if collection does
         * not exist yet.
         */

        updateAttendanceStats();

    }

}


/* ==========================================
   ATTENDANCE DATE
========================================== */

function getAttendanceDate(
    record
){

    return text(

        record.date ||

        record.attendanceDate ||

        record.workDate ||

        record.day ||

        ""

    );

}


/* ==========================================
   ATTENDANCE EMPLOYEE ID
========================================== */

function getAttendanceEmployeeId(
    record
){

    return text(

        record.employeeid ||

        record.employeeId ||

        record.empid ||

        record.empID ||

        ""

    )
    .toUpperCase();

}


/* ==========================================
   TODAY ATTENDANCE
========================================== */

function getTodayAttendance(){

    const today =
        getToday();


    return attendanceRecords.filter(
        record => {

            const date =
                getAttendanceDate(
                    record
                );


            return date ===
                today;

        }
    );

}


/* ==========================================
   ATTENDANCE STATS
========================================== */

function updateAttendanceStats(){

    const records =
        getTodayAttendance();


    /*
     * Unique employees
     */

    const uniqueEmployees =
        new Set();


    records.forEach(
        record => {

            const id =
                getAttendanceEmployeeId(
                    record
                );


            if(
                id
            ){

                uniqueEmployees.add(
                    id
                );

            }

        }
    );


    const attendanceTotal =
        uniqueEmployees.size
        ||
        records.length;


    let present =
        0;


    let late =
        0;


    records.forEach(
        record => {

            const status =
                text(
                    record.status
                )
                .toLowerCase();


            const timeIn =
                text(
                    record.timeIn ||
                    record.timein ||
                    ""
                );


            if(
                status.includes(
                    "late"
                )
            ){

                late++;

                present++;

                return;

            }


            if(
                timeIn
            ){

                present++;

            }

        }
    );


    /*
     * Avoid counting duplicate
     * records as multiple employees
     */

    if(
        uniqueEmployees.size > 0
    ){

        const uniquePresent =
            new Set();


        const uniqueLate =
            new Set();


        records.forEach(
            record => {

                const id =
                    getAttendanceEmployeeId(
                        record
                    );


                if(
                    !id
                ){

                    return;

                }


                const status =
                    text(
                        record.status
                    )
                    .toLowerCase();


                const timeIn =
                    text(
                        record.timeIn ||
                        record.timein ||
                        ""
                    );


                if(
                    timeIn
                ){

                    uniquePresent.add(
                        id
                    );

                }


                if(
                    status.includes(
                        "late"
                    )
                ){

                    uniqueLate.add(
                        id
                    );

                }

            }
        );


        present =
            uniquePresent.size;


        late =
            uniqueLate.size;

    }


    animateNumber(
        todayAttendance,
        attendanceTotal
    );


    animateNumber(
        presentCount,
        present
    );


    animateNumber(
        lateCount,
        late
    );


    /*
     * Absent is based on active
     * employees without attendance.
     */

    const active =
        employees.filter(
            employee =>
                text(
                    employee.status
                )
                .toLowerCase()
                ===
                "active"
        );


    const activeIds =
        new Set();


    active.forEach(
        employee => {

            const id =
                text(
                    employee.employeeid
                )
                .toUpperCase();


            if(
                id
            ){

                activeIds.add(
                    id
                );

            }

        }
    );


    const presentIds =
        new Set();


    records.forEach(
        record => {

            const id =
                getAttendanceEmployeeId(
                    record
                );


            if(
                id
            ){

                presentIds.add(
                    id
                );

            }

        }
    );


    let absent =
        0;


    if(
        activeIds.size > 0
    ){

        activeIds.forEach(
            id => {

                if(
                    !presentIds.has(
                        id
                    )
                ){

                    absent++;

                }

            }
        );

    }


    animateNumber(
        absentCount,
        absent
    );

}


/* ==========================================
   LOAD LEAVE REQUESTS
========================================== */

async function loadLeaveRequests(){

    leaveRequests = [];


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "employeeRequests"
                )
            );


        snapshot.forEach(
            docSnap => {

                leaveRequests.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        updateLeaveStats();

        renderRecentLeaves();


    }catch(error){

        console.error(
            "Leave Request Load Error:",
            error
        );


        updateLeaveStats();

        renderRecentLeaves();

    }

}


/* ==========================================
   LEAVE STATS
========================================== */

function updateLeaveStats(){

    const pending =
        leaveRequests.filter(
            request => {

                return text(
                    request.status
                )
                .toUpperCase()
                ===
                "PENDING";

            }
        ).length;


    animateNumber(
        pendingLeaves,
        pending
    );


    if(
        notificationBadge
    ){

        notificationBadge.textContent =
            pending;

        notificationBadge.style.display =
            pending > 0
            ?
            "flex"
            :
            "none";

    }


    /*
     * Approved leaves today
     */

    const today =
        getToday();


    const approvedToday =
        leaveRequests.filter(
            request => {

                const status =
                    text(
                        request.status
                    )
                    .toUpperCase();


                const date =
                    text(
                        request.date
                    );


                return (
                    status ===
                    "APPROVED"
                    &&
                    date ===
                    today
                );

            }
        ).length;


    animateNumber(
        onLeaveCount,
        approvedToday
    );

}


/* ==========================================
   SORT LEAVES
========================================== */

function sortLeaves(){

    return [
        ...leaveRequests
    ]
    .sort(
        (
            a,
            b
        ) => {

            const aTime =
                Number(
                    a.timestamp ||
                    0
                );


            const bTime =
                Number(
                    b.timestamp ||
                    0
                );


            return (
                bTime -
                aTime
            );

        }
    );

}


/* ==========================================
   RECENT LEAVES
========================================== */

function renderRecentLeaves(){

    if(
        !recentLeaves
    ){

        return;

    }


    const requests =
        sortLeaves()
        .slice(
            0,
            5
        );


    if(
        requests.length === 0
    ){

        recentLeaves.innerHTML = `

<div class="empty-state">

<span class="material-icons">
event_available
</span>

<p>
No leave requests yet.
</p>

</div>

`;

        return;

    }


    recentLeaves.innerHTML =
        "";


    requests.forEach(
        request => {

            const name =
                text(
                    request.employee ||
                    request.employeeName ||
                    request.empid ||
                    "Employee"
                );


            const type =
                text(
                    request.type ||
                    "Leave Request"
                );


            const date =
                text(
                    request.date ||
                    "-"
                );


            const days =
                request.days ??
                "-";


            const status =
                text(
                    request.status ||
                    "PENDING"
                )
                .toUpperCase();


            let statusClass =
                "pending";


            if(
                status ===
                "APPROVED"
            ){

                statusClass =
                    "approved";

            }

            else if(
                status ===
                "REJECTED"
            ){

                statusClass =
                    "rejected";

            }


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "leave-item";


            item.innerHTML = `

<div class="leave-item-icon">

<span class="material-icons">
event
</span>

</div>


<div class="leave-item-info">

<strong>
${escapeHTML(
    name
)}
</strong>

<span>
${escapeHTML(
    type
)}
•
${escapeHTML(
    date
)}
•
${escapeHTML(
    days
)} day(s)
</span>

</div>


<span class="leave-status ${statusClass}">

${escapeHTML(
    status
)}

</span>

`;


            recentLeaves.appendChild(
                item
            );

        }
    );

}


/* ==========================================
   MOBILE SIDEBAR
========================================== */

function openSidebar(){

    if(
        sidebar
    ){

        sidebar.classList.add(
            "open"
        );

    }


    if(
        sidebarOverlay
    ){

        sidebarOverlay.classList.add(
            "show"
        );

    }


    document.body.classList.add(
        "sidebar-open"
    );

}


function closeSidebar(){

    if(
        sidebar
    ){

        sidebar.classList.remove(
            "open"
        );

    }


    if(
        sidebarOverlay
    ){

        sidebarOverlay.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "sidebar-open"
    );

}


/* ==========================================
   MENU BUTTON
========================================== */

if(
    menuBtn
){

    menuBtn.addEventListener(
        "click",
        function(){

            if(
                sidebar &&
                sidebar.classList.contains(
                    "open"
                )
            ){

                closeSidebar();

            }

            else{

                openSidebar();

            }

        }
    );

}


/* ==========================================
   OVERLAY
========================================== */

if(
    sidebarOverlay
){

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


/* ==========================================
   CLOSE SIDEBAR ON NAV
========================================== */

document
    .querySelectorAll(
        ".nav-item"
    )
    .forEach(
        item => {

            item.addEventListener(
                "click",
                function(){

                    closeSidebar();

                }
            );

        }
    );


/* ==========================================
   LOGOUT
========================================== */

window.logout =
async function(){

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if(
        !confirmed
    ){

        return;

    }


    try{

        await signOut(
            auth
        );

    }catch(error){

        console.error(
            "Logout Error:",
            error
        );

    }


    localStorage.removeItem(
        "loggedInUser"
    );


    localStorage.removeItem(
        "userRole"
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

};


/* ==========================================
   NOTIFICATION BUTTON
========================================== */

const notificationButton =
    document.querySelector(
        ".notification-button"
    );


if(
    notificationButton
){

    notificationButton.addEventListener(
        "click",
        function(){

            if(
                leaveRequests.length > 0
            ){

                window.location.href =
                    "track-leaves.html";

            }

            else{

                alert(
                    "No pending notifications."
                );

            }

        }
    );

}


/* ==========================================
   AUTH STATE
========================================== */

onAuthStateChanged(

    auth,

    async function(user){

        /*
         * Require Firebase login
         */

        if(
            !user
        ){

            window.location.replace(
                "login.html"
            );

            return;

        }


        currentUser =
            user;


        /*
         * Verify dashboard role
         */

        const role =
            text(
                localStorage.getItem(
                    "userRole"
                )
            )
            .toLowerCase();


        if(
            role !==
            "admin"
        ){

            alert(
                "Administrator access only."
            );


            window.location.replace(
                "login.html"
            );

            return;

        }


        displayCurrentDate();

        displayUser();


        /*
         * Load dashboard data
         */

        await Promise.all([

            loadEmployees(),

            loadAttendance(),

            loadLeaveRequests()

        ]);


        /*
         * Recalculate attendance
         * after employees are loaded.
         */

        updateAttendanceStats();


        console.log(
            "PAPPRITO HRIS Premium Dashboard Ready"
        );

    }

);
