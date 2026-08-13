/* ==========================================
   PAPPRITO HRIS
   PREMIUM DASHBOARD JS
   MATCHED WITH CURRENT dashboard.html
========================================== */

import {
    db,
    auth
} from "./firebase.js";


import {
    collection,
    getDocs
} from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


import {
    onAuthStateChanged,
    signOut
} from
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
    document.querySelector(
        ".sidebar"
    );


const menuBtn =
    document.getElementById(
        "menuBtn"
    );


const currentDate =
    document.getElementById(
        "currentDate"
    );


const currentUserName =
    document.getElementById(
        "currentUserName"
    );


const totalEmployees =
    document.getElementById(
        "totalEmployees"
    );


const todayAttendance =
    document.getElementById(
        "todayAttendance"
    );


const leaveRequestsElement =
    document.getElementById(
        "leaveRequests"
    );


const totalPayroll =
    document.getElementById(
        "totalPayroll"
    );


const recentActivity =
    document.getElementById(
        "recentActivity"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


/* ==========================================
   OPTIONAL ELEMENTS
   These may exist in future
========================================== */

const sidebarUser =
    document.getElementById(
        "sidebarUser"
    );


const welcomeUser =
    document.getElementById(
        "welcomeUser"
    );


const activeEmployees =
    document.getElementById(
        "activeEmployees"
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


/* ==========================================
   HELPERS
========================================== */

function text(value){

    return String(
        value ?? ""
    ).trim();

}


/* ==========================================
   ESCAPE HTML
========================================== */

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
   TODAY
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


    return "HR Administrator";

}


/* ==========================================
   DISPLAY USER
========================================== */

function displayUser(){

    const name =
        getCurrentUserName();


    if(
        currentUserName
    ){

        currentUserName.textContent =
            name;

    }


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


    }
    catch(error){

        console.error(
            "Employee Load Error:",
            error
        );


        updateEmployeeStats();

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

    }
    catch(error){

        console.error(
            "Attendance Load Error:",
            error
        );


        updateAttendanceStats();

    }

}


/* ==========================================
   ATTENDANCE DATE
========================================== */

function getAttendanceDate(
    record
){

    let value =
        text(

            record.date ||

            record.attendanceDate ||

            record.workDate ||

            record.day ||

            ""

        );


    /*
     * Handle Firestore Timestamp
     */

    if(
        record.date &&
        typeof record.date ===
        "object" &&
        typeof record.date.toDate ===
        "function"
    ){

        const date =
            record.date.toDate();


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


        value =
            `${year}-${month}-${day}`;

    }


    return value;

}


/* ==========================================
   EMPLOYEE ID
========================================== */

function getAttendanceEmployeeId(
    record
){

    return text(

        record.employeeid ||

        record.employeeId ||

        record.empid ||

        record.empID ||

        record.employeeID ||

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

            return (
                getAttendanceDate(
                    record
                ) ===
                today
            );

        }
    );

}


/* ==========================================
   ATTENDANCE STATS
========================================== */

function updateAttendanceStats(){

    const records =
        getTodayAttendance();


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
        uniqueEmployees.size ||
        records.length;


    let present =
        0;


    let late =
        0;


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
                id &&
                timeIn
            ){

                uniquePresent.add(
                    id
                );

            }


            if(
                id &&
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


    if(
        uniqueEmployees.size > 0
    ){

        present =
            uniquePresent.size;


        late =
            uniqueLate.size;

    }
    else{

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
                    timeIn
                ){

                    present++;

                }


                if(
                    status.includes(
                        "late"
                    )
                ){

                    late++;

                }

            }
        );

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
     * ABSENT
     */

    const active =
        employees.filter(
            employee => {

                return (
                    text(
                        employee.status
                    )
                    .toLowerCase()
                    ===
                    "active"
                );

            }
        );


    const activeIds =
        new Set();


    active.forEach(
        employee => {

            const id =
                text(

                    employee.employeeid ||

                    employee.employeeId ||

                    employee.empid ||

                    ""

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

        renderRecentActivity();

    }
    catch(error){

        console.error(
            "Leave Request Load Error:",
            error
        );


        updateLeaveStats();

        renderRecentActivity();

    }

}


/* ==========================================
   LEAVE STATS
========================================== */

function updateLeaveStats(){

    const pending =
        leaveRequests.filter(
            request => {

                return (
                    text(
                        request.status
                    )
                    .toUpperCase()
                    ===
                    "PENDING"
                );

            }
        ).length;


    /*
     * Current HTML uses leaveRequests
     */

    animateNumber(
        leaveRequestsElement,
        pending
    );


    /*
     * Optional old/new element
     */

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
     * Approved leave today
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
                    a.createdAt ||
                    0
                );


            const bTime =
                Number(
                    b.timestamp ||
                    b.createdAt ||
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
   RENDER RECENT ACTIVITY
========================================== */

function renderRecentActivity(){

    if(
        !recentActivity
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

        recentActivity.innerHTML = `

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


    recentActivity.innerHTML =
        "";


    requests.forEach(
        request => {

            const name =
                text(

                    request.employeeName ||

                    request.employee ||

                    request.name ||

                    request.empid ||

                    "Employee"

                );


            const type =
                text(

                    request.type ||

                    request.leaveType ||

                    "Leave Request"

                );


            const date =
                text(
                    request.date ||
                    "-"
                );


            const days =
                request.days ??
                request.numberOfDays ??
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
                "dashboard-activity-item";


            item.innerHTML = `

<div
    style="
        width:42px;
        height:42px;
        min-width:42px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:10px;
        background:#fff4bf;
        color:#a77f00;
    "
>

<span class="material-icons">
event
</span>

</div>


<div
    style="
        min-width:0;
        flex:1;
        display:flex;
        flex-direction:column;
    "
>

<strong
    style="
        color:#111111;
        font-size:11px;
        font-weight:1000;
    "
>
${escapeHTML(
    name
)}
</strong>


<span
    style="
        color:#555555;
        font-size:8px;
        font-weight:800;
        margin-top:4px;
    "
>
${escapeHTML(
    type
)}
&nbsp; • &nbsp;
${escapeHTML(
    date
)}
&nbsp; • &nbsp;
${escapeHTML(
    days
)}
day(s)
</span>

</div>


<span
    style="
        padding:5px 8px;
        border-radius:20px;
        font-size:7px;
        font-weight:1000;
        background:
            ${
                statusClass === "approved"
                ?
                "#e9f7ef"
                :
                statusClass === "rejected"
                ?
                "#fff0f0"
                :
                "#fff5c8"
            };
        color:
            ${
                statusClass === "approved"
                ?
                "#16803c"
                :
                statusClass === "rejected"
                ?
                "#d71920"
                :
                "#a77f00"
            };
    "
>
${escapeHTML(
    status
)}
</span>

`;


            recentActivity.appendChild(
                item
            );

        }
    );

}


/* ==========================================
   SIDEBAR OPEN
========================================== */

function openSidebar(){

    if(
        !sidebar
    ){

        return;

    }


    sidebar.classList.add(
        "open"
    );


    createSidebarOverlay();

}


/* ==========================================
   SIDEBAR CLOSE
========================================== */

function closeSidebar(){

    if(
        sidebar
    ){

        sidebar.classList.remove(
            "open"
        );

    }


    const overlay =
        document.querySelector(
            ".sidebar-overlay"
        );


    if(
        overlay
    ){

        overlay.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "sidebar-open"
    );

}


/* ==========================================
   CREATE OVERLAY
========================================== */

function createSidebarOverlay(){

    let overlay =
        document.querySelector(
            ".sidebar-overlay"
        );


    if(
        !overlay
    ){

        overlay =
            document.createElement(
                "div"
            );


        overlay.className =
            "sidebar-overlay";


        document.body.appendChild(
            overlay
        );


        overlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    overlay.classList.add(
        "show"
    );


    document.body.classList.add(
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
   NAVIGATION
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
   QUICK ACTIONS
========================================== */

document
    .querySelectorAll(
        ".quick-action"
    )
    .forEach(
        button => {

            button.addEventListener(
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

async function logout(){

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

    }
    catch(error){

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

}


/* ==========================================
   LOGOUT BUTTON
========================================== */

if(
    logoutBtn
){

    logoutBtn.addEventListener(
        "click",
        logout
    );

}


/* ==========================================
   GLOBAL LOGOUT
========================================== */

window.logout =
    logout;


/* ==========================================
   OPTIONAL NOTIFICATION
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
                    "trackleaves.html";

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
         * Require login
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
         * Check role
         */

        const role =
            text(
                localStorage.getItem(
                    "userRole"
                )
            )
            .toLowerCase();


        /*
         * If role is missing but
         * Firebase user is logged in,
         * keep dashboard available.
         *
         * If explicitly non-admin,
         * redirect.
         */

        if(
            role &&
            role !== "admin"
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
         * Load all dashboard data
         */

        await Promise.all([

            loadEmployees(),

            loadAttendance(),

            loadLeaveRequests()

        ]);


        /*
         * Recalculate after
         * employees are loaded.
         */

        updateAttendanceStats();


        console.log(
            "PAPPRITO HRIS Dashboard Ready"
        );

    }

);


/* ==========================================
   INITIAL DATE
========================================== */

displayCurrentDate();


/* ==========================================
   END
========================================== */
