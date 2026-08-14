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
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const menuBtn =
    document.getElementById("menuBtn");

const currentDate =
    document.getElementById("currentDate");

const currentUserName =
    document.getElementById("currentUserName");

const sidebarUser =
    document.getElementById("sidebarUser");

const totalEmployees =
    document.getElementById("totalEmployees");

const activeEmployees =
    document.getElementById("activeEmployees");

const todayAttendance =
    document.getElementById("todayAttendance");

const leaveRequestsElement =
    document.getElementById("leaveRequests");

const pendingLeaves =
    document.getElementById("pendingLeaves");

const totalPayroll =
    document.getElementById("totalPayroll");

const presentCount =
    document.getElementById("presentCount");

const lateCount =
    document.getElementById("lateCount");

const onLeaveCount =
    document.getElementById("onLeaveCount");

const absentCount =
    document.getElementById("absentCount");

const notificationBadge =
    document.getElementById("notificationBadge");

const recentActivity =
    document.getElementById("recentActivity");

const logoutBtn =
    document.getElementById("logoutBtn");


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
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

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
        ).padStart(2,"0");

    const day =
        String(
            date.getDate()
        ).padStart(2,"0");

    return `${year}-${month}-${day}`;

}


/* ==========================================
   CURRENT DATE
========================================== */

function displayCurrentDate(){

    if(!currentDate){
        return;
    }

    currentDate.textContent =
        new Date().toLocaleDateString(
            "en-US",
            {
                weekday:"short",
                month:"short",
                day:"numeric",
                year:"numeric"
            }
        );

}


/* ==========================================
   USER
========================================== */

function getCurrentUserName(){

    const stored =
        text(
            localStorage.getItem(
                "loggedInUser"
            )
        );

    if(stored){
        return stored;
    }

    if(
        currentUser &&
        currentUser.email
    ){
        return currentUser.email;
    }

    return "HR Administrator";

}


function displayUser(){

    const name =
        getCurrentUserName();

    if(currentUserName){
        currentUserName.textContent =
            name;
    }

    if(sidebarUser){
        sidebarUser.textContent =
            name;
    }

}


/* ==========================================
   NUMBER ANIMATION
========================================== */

function animateNumber(
    element,
    target
){

    if(!element){
        return;
    }

    const finalValue =
        Number(target || 0);

    if(finalValue === 0){

        element.textContent =
            "0";

        return;
    }

    let current = 0;

    const steps = 25;

    const increment =
        finalValue / steps;

    const timer =
        setInterval(
            () => {

                current += increment;

                if(
                    current >=
                    finalValue
                ){

                    current =
                        finalValue;

                    clearInterval(timer);

                }

                element.textContent =
                    Math.floor(current);

            },
            20
        );

}


/* ==========================================
   EMPLOYEES
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

                    id:docSnap.id,

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


function updateEmployeeStats(){

    const total =
        employees.length;

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
   ATTENDANCE
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

                    id:docSnap.id,

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


function getAttendanceDate(record){

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
                date.getMonth()+1
            ).padStart(2,"0");

        const day =
            String(
                date.getDate()
            ).padStart(2,"0");

        return `${year}-${month}-${day}`;

    }

    return text(

        record.date ||
        record.attendanceDate ||
        record.workDate ||
        record.day ||
        ""

    );

}


function getAttendanceEmployeeId(record){

    return text(

        record.employeeid ||
        record.employeeId ||
        record.empid ||
        record.empID ||
        record.employeeID ||
        ""

    ).toUpperCase();

}


function updateAttendanceStats(){

    const today =
        getToday();

    const records =
        attendanceRecords.filter(
            record =>
                getAttendanceDate(
                    record
                ) === today
        );


    const employeeIds =
        new Set();


    const presentIds =
        new Set();


    const lateIds =
        new Set();


    records.forEach(
        record => {

            const id =
                getAttendanceEmployeeId(
                    record
                );

            const timeIn =
                text(
                    record.timeIn ||
                    record.timein ||
                    ""
                );

            const status =
                text(
                    record.status
                ).toLowerCase();


            if(id){

                employeeIds.add(id);

                if(timeIn){
                    presentIds.add(id);
                }

                if(
                    status.includes(
                        "late"
                    )
                ){

                    lateIds.add(id);

                }

            }

        }
    );


    const total =
        employeeIds.size ||
        records.length;


    animateNumber(
        todayAttendance,
        total
    );


    animateNumber(
        presentCount,
        presentIds.size
    );


    animateNumber(
        lateCount,
        lateIds.size
    );


    const activeIds =
        new Set();


    employees
        .filter(
            employee =>
                text(
                    employee.status
                )
                .toLowerCase()
                ===
                "active"
        )
        .forEach(
            employee => {

                const id =
                    text(

                        employee.employeeid ||
                        employee.employeeId ||
                        employee.empid ||
                        ""

                    ).toUpperCase();

                if(id){
                    activeIds.add(id);
                }

            }
        );


    let absent = 0;


    activeIds.forEach(
        id => {

            if(
                !employeeIds.has(id)
            ){

                absent++;

            }

        }
    );


    animateNumber(
        absentCount,
        absent
    );

}


/* ==========================================
   LEAVE REQUESTS
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

                    id:docSnap.id,

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


function updateLeaveStats(){

    const pending =
        leaveRequests.filter(
            request =>
                text(
                    request.status
                )
                .toUpperCase()
                ===
                "PENDING"
        ).length;


    animateNumber(
        leaveRequestsElement,
        pending
    );


    if(notificationBadge){

        notificationBadge.textContent =
            pending;

        notificationBadge.style.display =
            pending > 0
            ? "flex"
            : "none";

    }


    const today =
        getToday();


    const approvedToday =
        leaveRequests.filter(
            request => {

                return (

                    text(
                        request.status
                    )
                    .toUpperCase()
                    ===
                    "APPROVED"

                    &&

                    text(
                        request.date
                    )
                    ===
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
   RECENT ACTIVITY
========================================== */

function renderRecentActivity(){

    if(!recentActivity){
        return;
    }


    const requests =
        [
            ...leaveRequests
        ]
        .slice(0,5);


    if(!requests.length){

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


    recentActivity.innerHTML = "";


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


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "activity-item";


            item.innerHTML = `

                <div class="activity-icon">

                    <span class="material-icons">
                        event
                    </span>

                </div>


                <div class="activity-info">

                    <strong>
                        ${escapeHTML(name)}
                    </strong>

                    <span>
                        ${escapeHTML(type)}
                        •
                        ${escapeHTML(date)}
                        •
                        ${escapeHTML(days)}
                        day(s)
                    </span>

                </div>


                <span
                    class="
                        activity-status
                        ${status.toLowerCase()}
                    ">

                    ${escapeHTML(status)}

                </span>

            `;


            recentActivity.appendChild(
                item
            );

        }
    );

}


/* ==========================================
   SIDEBAR
========================================== */

function openSidebar(){

    if(sidebar){
        sidebar.classList.add("open");
    }

    if(sidebarOverlay){
        sidebarOverlay.classList.add("show");
    }

}


function closeSidebar(){

    if(sidebar){
        sidebar.classList.remove("open");
    }

    if(sidebarOverlay){
        sidebarOverlay.classList.remove("show");
    }

}


if(menuBtn){

    menuBtn.addEventListener(
        "click",
        () => {

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


if(sidebarOverlay){

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


document
    .querySelectorAll(".nav-item")
    .forEach(
        item => {

            item.addEventListener(
                "click",
                closeSidebar
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


    if(!confirmed){
        return;
    }


    try{

        await signOut(auth);

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


if(logoutBtn){

    logoutBtn.addEventListener(
        "click",
        logout
    );

}


window.logout =
    logout;


/* ==========================================
   AUTH
========================================== */

onAuthStateChanged(
    auth,
    async user => {

        if(!user){

            window.location.replace(
                "login.html"
            );

            return;

        }


        currentUser =
            user;


        const role =
            text(
                localStorage.getItem(
                    "userRole"
                )
            )
            .toLowerCase();


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


        await Promise.all([

            loadEmployees(),

            loadAttendance(),

            loadLeaveRequests()

        ]);


        updateAttendanceStats();


        console.log(
            "PAPPRITO HRIS Dashboard Ready"
        );

    }
);


/* ==========================================
   INITIAL
========================================== */

displayCurrentDate();
