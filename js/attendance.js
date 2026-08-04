/* ==========================================
   PAPPRITO HRIS
   ATTENDANCE SYSTEM v3
========================================== */

import { db } from "./firebase.js";

import {

collection,
getDocs,
addDoc,
updateDoc,
deleteDoc,
doc

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ==========================================
   ELEMENTS
========================================== */

const employeeSelect =
document.getElementById("employeeSelect");

const fromDate =
document.getElementById("fromDate");

const toDate =
document.getElementById("toDate");

const employeeId =
document.getElementById("employeeId");

const employeeName =
document.getElementById("employeeName");

const attendanceBody =
document.getElementById("attendanceBody");

const clock =
document.getElementById("clock");

const todayDate =
document.getElementById("todayDate");

/* ==========================================
   ARRAYS
========================================== */

let employees = [];

let attendance = [];

/* ==========================================
   DATE HELPERS
========================================== */

function getToday(){

    const d = new Date();

    const year = d.getFullYear();

    const month =
    String(d.getMonth()+1).padStart(2,"0");

    const day =
    String(d.getDate()).padStart(2,"0");

    return `${year}-${month}-${day}`;

}

function getCurrentTime(){

    return new Date().toLocaleTimeString(
        "en-US",
        {
            hour12:true
        }
    );

}

/* ==========================================
   FORMAT DATE
========================================== */

function displayDate(date){

    if(!date) return "-";

    const d = new Date(date);

    if(isNaN(d.getTime())){

        return date;

    }

    return d.toLocaleDateString(
        "en-US"
    );

}

/* ==========================================
   TIME TO DATE
========================================== */

function timeStringToDate(time){

    const now = new Date();

    if(!time || time=="-"){

        return now;

    }

    const date =
    new Date(`${getToday()} ${time}`);

    if(isNaN(date.getTime())){

        return now;

    }

    return date;

}
/* ==========================================
   LIVE CLOCK
========================================== */

function updateClock(){

    const now = new Date();

    clock.textContent =
    now.toLocaleTimeString(
        "en-US",
        {
            hour12:true
        }
    );

    todayDate.textContent =
    now.toLocaleDateString(
        "en-US",
        {
            weekday:"long",
            year:"numeric",
            month:"long",
            day:"numeric"
        }
    );

}

setInterval(updateClock,1000);

updateClock();

/* ==========================================
   SHIFT SETTINGS
========================================== */

const SHIFT_START_HOUR = 8;
const SHIFT_START_MINUTE = 0;

const REGULAR_HOURS = 8;

/* ==========================================
   COMPUTE LATE
========================================== */

function computeLateMinutes(){

    const now = new Date();

    const shift = new Date();

    shift.setHours(

        SHIFT_START_HOUR,

        SHIFT_START_MINUTE,

        0,

        0

    );

    if(now <= shift){

        return 0;

    }

    return Math.floor(

        (now - shift) / 60000

    );

}

/* ==========================================
   COMPUTE BREAK
========================================== */

function computeBreakMinutes(

    breakOut,

    breakIn

){

    if(

        !breakOut ||

        !breakIn ||

        breakOut=="-" ||

        breakIn=="-"

    ){

        return 0;

    }

    const out =
    timeStringToDate(breakOut);

    const back =
    timeStringToDate(breakIn);

    return Math.max(

        0,

        Math.floor(

            (back-out)/60000

        )

    );

}
/* ==========================================
   TIME IN
========================================== */

async function timeIn(){

    if(!employeeSelect.value){

        alert("Please select an employee.");

        return;

    }

    const employee = employees.find(

        emp => emp.id === employeeSelect.value

    );

    if(!employee){

        alert("Employee not found.");

        return;

    }

    // Check duplicate attendance today
    const existing = attendance.find(att =>

        att.empDocId === employee.id &&

        att.date === getToday() &&

        (!att.timeout || att.timeout === "-")

    );

    if(existing){

        alert("Employee already timed in today.");

        return;

    }

    const lateMinutes = computeLateMinutes();

    const data = {

        empDocId: employee.id,

        empid: employee.employeeid || "",

        name: [

            employee.firstname,

            employee.middlename,

            employee.lastname

        ]

        .filter(Boolean)

        .join(" ")

        .replace(/\s+/g," ")

        .trim(),

        // ISO DATE (YYYY-MM-DD)
        date: getToday(),

        timein: getCurrentTime(),

        breakout: "-",

        breakin: "-",

        timeout: "-",

        breakminutes: 0,

        totalhours: 0,

        regularhours: 0,

        overtime: 0,

        late: lateMinutes,

        status: lateMinutes > 0 ? "LATE" : "PRESENT"

    };

    await addDoc(

        collection(db,"attendance"),

        data

    );

    await loadAttendance();

    alert("Time In Successful.");

}
/* ==========================================
   BREAK OUT
========================================== */

async function breakOut(){

    if(!employeeSelect.value){

        alert("Please select an employee.");

        return;

    }

    const record = attendance.find(att=>

        att.empDocId===employeeSelect.value &&

        att.date===getToday() &&

        (!att.timeout || att.timeout==="-")


    );

    if(!record){

        alert("No active attendance found.");

        return;

    }

    if(record.breakout!=="-"){

        alert("Employee already Break Out.");

        return;

    }

    await updateDoc(

        doc(db,"attendance",record.id),

        {

            breakout:getCurrentTime()

        }

    );

    await loadAttendance();

    alert("Break Out Successful.");

}

/* ==========================================
   BREAK IN
========================================== */

async function breakIn(){

    if(!employeeSelect.value){

        alert("Please select an employee.");

        return;

    }

    const record = attendance.find(att=>

        att.empDocId===employeeSelect.value &&

        att.date===getToday() &&

        (!att.timeout || att.timeout==="-")


    );

    if(!record){

        alert("No active attendance found.");

        return;

    }

    if(record.breakout==="-" ){

        alert("Please Break Out first.");

        return;

    }

    if(record.breakin!=="-"){

        alert("Employee already Break In.");

        return;

    }

    await updateDoc(

        doc(db,"attendance",record.id),

        {

            breakin:getCurrentTime()

        }

    );

    await loadAttendance();

    alert("Break In Successful.");

}
/* ==========================================
   TIME OUT
========================================== */

async function timeOut(){

    if(!employeeSelect.value){

        alert("Please select an employee.");

        return;

    }

    const record = attendance.find(att=>

        att.empDocId===employeeSelect.value &&

        att.date===getToday() &&

        (!att.timeout || att.timeout==="-")


    );

    if(!record){

        alert("No active attendance found.");

        return;

    }

    const outTime = new Date();

    const inTime = timeStringToDate(record.timein);

    const breakMinutes = computeBreakMinutes(

        record.breakout,

        record.breakin

    );

    const lateMinutes = Number(record.late || 0);

    let totalHours =

        (outTime - inTime) / 3600000;

    // Deduct Break
    totalHours -= breakMinutes / 60;

    // Deduct Late
    totalHours -= lateMinutes / 60;

    if(totalHours < 0){

        totalHours = 0;

    }

    const regularHours =

        Math.min(totalHours,8);

    const overtime =

        Math.max(totalHours-8,0);

    await updateDoc(

        doc(db,"attendance",record.id),

        {

            timeout:getCurrentTime(),

            breakminutes:breakMinutes,

            totalhours:Number(totalHours.toFixed(2)),

            regularhours:Number(regularHours.toFixed(2)),

            overtime:Number(overtime.toFixed(2))

        }

    );

    await loadAttendance();

    alert("Time Out Successful.");

}
/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    employees = [];

    employeeSelect.innerHTML =
    '<option value="">Select Employee</option>';

    const snapshot =
    await getDocs(collection(db,"employees"));

    snapshot.forEach(docSnap=>{

        const emp = {

            id:docSnap.id,

            ...docSnap.data()

        };

        employees.push(emp);

        const fullname=[

            emp.firstname,

            emp.middlename,

            emp.lastname

        ]

        .filter(Boolean)

        .join(" ")

        .replace(/\s+/g," ")

        .trim();

        employeeSelect.innerHTML += `

<option value="${emp.id}">

${emp.employeeid || ""}

-

${fullname}

</option>

`;

    });

}

/* ==========================================
   LOAD ATTENDANCE
========================================== */

async function loadAttendance(){

    attendance=[];

    const snapshot=

    await getDocs(

        collection(db,"attendance")

    );

    snapshot.forEach(docSnap=>{

        attendance.push({

            id:docSnap.id,

            ...docSnap.data()

        });

    });

    attendance.sort(

        (a,b)=>

        b.date.localeCompare(a.date)

    );

    filterAttendance();

}

/* ==========================================
   FILTER ATTENDANCE
========================================== */

function filterAttendance(){

    let records=[...attendance];

    // Employee
    if(employeeSelect.value){

        records=records.filter(r=>

            r.empDocId===employeeSelect.value

        );

    }

    // From
    if(fromDate.value){

        records=records.filter(r=>

            r.date>=fromDate.value

        );

    }

    // To
    if(toDate.value){

        records=records.filter(r=>

            r.date<=toDate.value

        );

    }

    renderAttendanceTable(records);

}

/* ==========================================
   RENDER TABLE
========================================== */

function renderAttendanceTable(records){

    attendanceBody.innerHTML="";

    if(records.length===0){

        attendanceBody.innerHTML=`

<tr>

<td colspan="13">

No Attendance Record

</td>

</tr>

`;

        return;

    }

    records.forEach(att=>{

attendanceBody.innerHTML +=`

<tr>

<td>${displayDate(att.date)}</td>

<td>${att.empid||""}</td>

<td>${att.name||""}</td>

<td>${att.timein||"-"}</td>

<td>${att.breakout||"-"}</td>

<td>${att.breakin||"-"}</td>

<td>${att.timeout||"-"}</td>

<td>${att.breakminutes||0}</td>

<td>${Number(att.totalhours||0).toFixed(2)}</td>

<td>${Number(att.overtime||0).toFixed(2)}</td>

<td>${att.late||0}</td>

<td>${att.status||""}</td>

<td>

<button

class="action-btn timeout"

onclick="deleteAttendance('${att.id}')">

DELETE

</button>

</td>

</tr>

`;

    });

}

/* ==========================================
   DELETE
========================================== */

window.deleteAttendance=

async function(id){

if(

!confirm(

"Delete this attendance record?"

)

){

return;

}

await deleteDoc(

doc(db,"attendance",id)

);

loadAttendance();

}
/* ==========================================
   INITIALIZE
========================================== */

async function initialize(){

    fromDate.value = getToday();
    toDate.value = getToday();

    await loadEmployees();

    await loadAttendance();

}

initialize();

/* ==========================================
   FILTER EVENTS
========================================== */

employeeSelect.addEventListener(
    "change",
    filterAttendance
);

fromDate.addEventListener(
    "change",
    filterAttendance
);

toDate.addEventListener(
    "change",
    filterAttendance
);

document
.getElementById("filterBtn")
.addEventListener(
    "click",
    filterAttendance
);

/* ==========================================
   BUTTON EVENTS
========================================== */

document
.getElementById("timeInBtn")
.addEventListener(
    "click",
    timeIn
);

document
.getElementById("breakOutBtn")
.addEventListener(
    "click",
    breakOut
);

document
.getElementById("breakInBtn")
.addEventListener(
    "click",
    breakIn
);

document
.getElementById("timeOutBtn")
.addEventListener(
    "click",
    timeOut
);

/* ==========================================
   PRINT
========================================== */

document
.getElementById("printBtn")
.addEventListener(
    "click",
    ()=>{

        filterAttendance();

        setTimeout(()=>{

            window.print();

        },200);

    }
);

/* ==========================================
   SUMMARY
========================================== */

document
.getElementById("summaryBtn")
.addEventListener(
    "click",
    ()=>{

        alert(
`Attendance Records : ${attendance.length}`
        );

    }
);

/* ==========================================
   BACK
========================================== */

document
.getElementById("backBtn")
.addEventListener(
    "click",
    ()=>{

        window.location.href="index.html";

    }
);
