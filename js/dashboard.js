/* ==========================================
   PAPPRITO HRIS
   PREMIUM DASHBOARD JS
   + EMPLOYEE REQUEST NOTIFICATION SOUND
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
   NOTIFICATION SOUND
========================================== */

const notificationSound =
    new Audio(
        "../assets/sounds/notification.mp3"
    );


notificationSound.preload =
    "auto";


notificationSound.volume =
    0.8;


let notificationSoundEnabled =
    false;


let knownPendingRequests =
    new Set();


let firstRequestCheck =
    true;


/* ==========================================
   ENABLE SOUND AFTER USER INTERACTION
========================================== */

function enableNotificationSound(){

    if(
        notificationSoundEnabled
    ){

        return;

    }


    notificationSoundEnabled =
        true;


    /*
     * Browser audio permission
     * is unlocked after user interaction.
     *
     * We play muted once so the
     * browser allows future sounds.
     */

    try{

        notificationSound.muted =
            true;


        const promise =
            notificationSound.play();


        if(
            promise &&
            typeof promise.then ===
            "function"
        ){

            promise
                .then(
                    () => {

                        notificationSound.pause();

                        notificationSound.currentTime =
                            0;

                        notificationSound.muted =
                            false;

                    }
                )
                .catch(
                    error => {

                        notificationSound.muted =
                            false;

                        console.log(
                            "Notification sound waiting for permission:",
                            error
                        );

                    }
                );

        }

        else{

            notificationSound.pause();

            notificationSound.currentTime =
                0;

            notificationSound.muted =
                false;

        }

    }catch(error){

        notificationSound.muted =
            false;

        console.log(
            "Notification sound initialization error:",
            error
        );

    }

}


/* ==========================================
   USER INTERACTION
========================================== */

document.addEventListener(
    "click",
    enableNotificationSound,
    {
        once:true
    }
);


document.addEventListener(
    "touchstart",
    enableNotificationSound,
    {
        once:true,
        passive:true
    }
);


/* ==========================================
   PLAY NOTIFICATION
========================================== */

function playNotificationSound(){

    if(
        !notificationSoundEnabled
    ){

        console.log(
            "Notification sound is waiting for user interaction."
        );

        return;

    }


    try{

        notificationSound.pause();

        notificationSound.currentTime =
            0;


        const promise =
            notificationSound.play();


        if(
            promise &&
            typeof promise.catch ===
            "function"
        ){

            promise.catch(
                error => {

                    console.log(
                        "Notification sound could not play:",
                        error
                    );

                }
            );

        }

    }catch(error){

        console.error(
            "Notification Sound Error:",
            error
        );

    }

}


/* ==========================================
   CHECK NEW REQUESTS
========================================== */

function checkNewEmployeeRequests(){

    const pendingRequests =
        leaveRequests.filter(
            request => {

                return text(
                    request.status
                )
                .toUpperCase()
                ===
                "PENDING";

            }
        );


    const currentPendingIds =
        new Set();


    pendingRequests.forEach(
        request => {

            currentPendingIds.add(
                request.id
            );

        }
    );


    /*
     * First load:
     * establish current requests
     * without playing sound.
     */

    if(
        firstRequestCheck
    ){

        knownPendingRequests =
            currentPendingIds;

        firstRequestCheck =
            false;

        return;

    }


    /*
     * Find requests that were not
     * present during the previous check.
     */

    let hasNewRequest =
        false;


    currentPendingIds.forEach(
        id => {

            if(
                !knownPendingRequests.has(
                    id
                )
            ){

                hasNewRequest =
                    true;

            }

        }
    );


    knownPendingRequests =
        currentPendingIds;


    if(
        hasNewRequest
    ){

        playNotificationSound();

        showNewRequestNotification();

    }

}


/* ==========================================
   NEW REQUEST VISUAL NOTIFICATION
========================================== */

function showNewRequestNotification(){

    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if(
        badge
    ){

        badge.style.display =
            "flex";

        badge.classList.add(
            "notification-pulse"
        );


        setTimeout(
            () => {

                badge.classList.remove(
                    "notification-pulse"
                );

            },
            1500
        );

    }


    /*
     * Browser notification is optional.
     * It only works when permission
     * has already been granted.
     */

    if(
        "Notification" in window &&
        Notification.permission ===
        "granted"
    ){

        try{

            new Notification(
                "PAPPRITO HRIS",
                {

                    body:
                        "A new employee request has been submitted.",

                    icon:
                        "../assets/images/icon-192.png"

                }
            );

        }catch(error){

            console.log(
                "Browser notification error:",
                error
            );

        }

    }

}


/* ==========================================
   REQUEST POLLING
========================================== */

let requestPollingTimer =
    null;


function startRequestPolling(){

    if(
        requestPollingTimer
    ){

        clearInterval(
            requestPollingTimer
        );

    }


    /*
     * Check for new employee
     * requests every 15 seconds.
     */

    requestPollingTimer =
        setInterval(
            async function(){

                try{

                    await loadLeaveRequests(
                        true
                    );

                }catch(error){

                    console.error(
                        "Request polling error:",
                        error
                    );

                }

            },
            15000
        );

}


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


/*
 * Supports both IDs:
 *
 * recentLeaves
 * recentActivity
 *
 * so existing dashboard HTML
 * continues to work.
 */

const recentLeaves =
    document.getElementById(
        "recentLeaves"
    )
    ||
    document.getElementById(
        "recentActivity"
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


    const currentUserName =
        document.getElementById(
            "currentUserName"
        );


    if(
        currentUserName
    ){

        currentUserName.textContent =
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

async function loadLeaveRequests(
    fromPolling = false
){

    const previousRequests =
        leaveRequests;


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


        /*
         * Only check new requests
         * after the first normal load.
         */

        if(
            fromPolling
        ){

            checkNewEmployeeRequests();

        }

    }catch(error){

        console.error(
            "Leave Request Load Error:",
            error
        );


        leaveRequests =
            previousRequests;


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


    /*
     * Existing dashboard ID
     */

    animateNumber(
        pendingLeaves,
        pending
    );


    /*
     * Current dashboard HTML
     * uses leaveRequests.
     */

    const leaveRequestsElement =
        document.getElementById(
            "leaveRequests"
        );


    if(
        leaveRequestsElement
    ){

        animateNumber(
            leaveRequestsElement,
            pending
        );

    }


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
                    request.employeeId ||
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
                request.leaveDays ??
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

            enableNotificationSound();


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
   LOGOUT BUTTON
========================================== */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if(
    logoutBtn
){

    logoutBtn.addEventListener(
        "click",
        window.logout
    );

}


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

            enableNotificationSound();


            if(
                leaveRequests.length > 0
            ){

                window.location.href =
                    "hrapproval.html";

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
   REQUEST BADGE CLICK
========================================== */

if(
    notificationBadge
){

    notificationBadge.style.cursor =
        "pointer";


    notificationBadge.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            event.stopPropagation();

            enableNotificationSound();

            window.location.href =
                "hrapproval.html";

        }
    );

}


/* ==========================================
   REQUEST SOUND CSS
   Injects only the small animation
   needed for the notification badge.
========================================== */

const notificationStyle =
    document.createElement(
        "style"
    );


notificationStyle.textContent = `

.notification-pulse{

    animation:
        pappritoNotificationPulse
        .35s ease-in-out
        4;

}


@keyframes pappritoNotificationPulse{

    0%{
        transform:scale(1);
    }

    50%{
        transform:scale(1.25);
    }

    100%{
        transform:scale(1);
    }

}

`;


document.head.appendChild(
    notificationStyle
);


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


        /*
         * Start automatic request checking.
         *
         * Every 15 seconds the dashboard
         * checks employeeRequests.
         */

        startRequestPolling();


        console.log(
            "PAPPRITO HRIS Premium Dashboard Ready"
        );


        console.log(
            "Employee request notification sound enabled after user interaction."
        );

    }

);
