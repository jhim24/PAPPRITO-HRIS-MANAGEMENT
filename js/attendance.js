/* ==========================================
   PAPPRITO HRIS
   ATTENDANCE v2
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
   VARIABLES
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

let employees = [];

let attendance = [];

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
   DATE HELPERS
========================================== */

function getToday(){

    return new Date()
    .toLocaleDateString("en-US");

}

function getCurrentTime(){

    return new Date()
    .toLocaleTimeString("en-US");

}

function formatDate(date){

    if(!date) return "";

    const d = new Date(date);

    if(isNaN(d)) return "";

    return d
    .toISOString()
    .split("T")[0];

}

/* ==========================================
   TIME HELPERS
========================================== */

function convertTimeToDate(time){

    const now = new Date();

    if(!time || time === "-"){

        return now;

    }

    const parts =
    time.match(/(\d+):(\d+):?(\d+)?\s?(AM|PM)/i);

    if(!parts){

        return now;

    }

    let hour =
    parseInt(parts[1]);

    const minute =
    parseInt(parts[2]);

    const second =
    parseInt(parts[3] || 0);

    const ampm =
    parts[4].toUpperCase();

    if(ampm === "PM" && hour !== 12){

        hour += 12;

    }

    if(ampm === "AM" && hour === 12){

        hour = 0;

    }

    now.setHours(
        hour,
        minute,
        second,
        0
    );

    return now;

}
/* ==========================================
   TIME IN
========================================== */

async function timeIn(){

    if(!employeeSelect.value){

        alert("Please select an employee.");

        return;

    }

    const employee =
    employees.find(emp=>emp.id===employeeSelect.value);

    if(!employee){

        alert("Employee not found.");

        return;

    }

    const existing =
    attendance.find(att=>

        att.empDocId===employee.id &&

        att.date===getToday() &&

        (!att.timeout || att.timeout==="-")


    );

    if(existing){

        alert("Employee already timed in today.");

        return;

    }

    const now = new Date();

    const shift = new Date();

    shift.setHours(8,0,0,0);

    let lateMinutes = 0;

    if(now > shift){

        lateMinutes =
        Math.floor(
            (now-shift)/60000
        );

    }

    await addDoc(

        collection(db,"attendance"),

        {

            empDocId:employee.id,

            empid:employee.employeeid || "",

            name:[

                employee.firstname,

                employee.middlename,

                employee.lastname

            ]

            .filter(Boolean)

            .join(" ")

            .replace(/\s+/g," ")

            .trim(),

            date:getToday(),

            timein:getCurrentTime(),

            breakout:"-",

            breakin:"-",

            timeout:"-",

            breakminutes:"0 mins",

            totalhours:"0.00",

            regularhours:"0.00",

            overtime:"0.00",

            late:lateMinutes+" mins",

            status:

            lateMinutes>0

            ?

            "LATE"

            :

            "PRESENT"

        }

    );

    await loadAttendance();

    alert("Time In Successful.");

}

/* ==========================================
   BREAK OUT
========================================== */

async function breakOut(){

    const record =
    attendance.find(att=>

        att.empDocId===employeeSelect.value &&

        att.date===getToday() &&

        (!att.timeout || att.timeout==="-")


    );

    if(!record){

        alert("No active Time In.");

        return;

    }

    if(record.breakout!=="-"){

        alert("Already Break Out.");

        return;

    }

    await updateDoc(

        doc(db,"attendance",record.id),

        {

            breakout:getCurrentTime()

        }

    );

    await loadAttendance();

}

/* ==========================================
   BREAK IN
========================================== */

async function breakIn(){

    const record =
    attendance.find(att=>

        att.empDocId===employeeSelect.value &&

        att.date===getToday() &&

        (!att.timeout || att.timeout==="-")


    );

    if(!record){

        alert("No active attendance.");

        return;

    }

    if(record.breakout==="-" ){

        alert("Break Out first.");

        return;

    }

    if(record.breakin!=="-"){

        alert("Already Break In.");

        return;

    }

    await updateDoc(

        doc(db,"attendance",record.id),

        {

            breakin:getCurrentTime()

        }

    );

    await loadAttendance();

}

/* ==========================================
   TIME OUT
========================================== */

async function timeOut(){

    const record =
    attendance.find(att=>

        att.empDocId===employeeSelect.value &&

        att.date===getToday() &&

        (!att.timeout || att.timeout==="-")

    );

    if(!record){

        alert("No active attendance.");

        return;

    }

    const outTime =
    new Date();

    const inTime =
    convertTimeToDate(record.timein);

    let breakMinutes = 0;

    if(

        record.breakout !== "-" &&

        record.breakin !== "-"

    ){

        breakMinutes =

        Math.floor(

            (

                convertTimeToDate(record.breakin)

                -

                convertTimeToDate(record.breakout)

            )

            /60000

        );

    }

    let totalHours =

    (outTime-inTime)/3600000;

    totalHours -= breakMinutes/60;

    const late =

    parseFloat(

        (record.late||"0")

        .replace(" mins","")

    ) || 0;

    totalHours -= late/60;

    if(totalHours<0){

        totalHours=0;

    }

    const regular =

    Math.min(totalHours,8);

    const overtime =

    Math.max(totalHours-8,0);

    await updateDoc(

        doc(db,"attendance",record.id),

        {

            timeout:getCurrentTime(),

            breakminutes:breakMinutes+" mins",

            totalhours:totalHours.toFixed(2),

            regularhours:regular.toFixed(2),

            overtime:overtime.toFixed(2)

        }

    );

    await loadAttendance();

    alert("Time Out Successful.");

}
/* ==========================================
   DEFAULT DATE
========================================== */

const today = new Date()
.toISOString()
.split("T")[0];

fromDate.value = today;
toDate.value = today;

/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    employeeSelect.innerHTML =
    '<option value="">Select Employee</option>';

    employees = [];

    const snapshot =
    await getDocs(
        collection(db,"employees")
    );

    snapshot.forEach(docSnap=>{

        const emp = {

            id:docSnap.id,

            ...docSnap.data()

        };

        employees.push(emp);

        const fullname = [

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

${emp.employeeid || "NO-ID"} - ${fullname}

</option>

`;

    });

}

/* ==========================================
   LOAD ATTENDANCE
========================================== */

async function loadAttendance(){

    attendance = [];

    const snapshot =
    await getDocs(
        collection(db,"attendance")
    );

    snapshot.forEach(docSnap=>{

        attendance.push({

            id:docSnap.id,

            ...docSnap.data()

        });

    });

    attendance.sort((a,b)=>{

        return new Date(b.date) -
               new Date(a.date);

    });

    filterAttendance();

}
/* ==========================================
   FILTER ATTENDANCE
========================================== */

function filterAttendance(){

    let filtered = [...attendance];

    // Employee Filter
    if(employeeSelect.value){

        filtered = filtered.filter(att=>

            att.empDocId === employeeSelect.value

        );

    }

    // From Date
    if(fromDate.value){

        filtered = filtered.filter(att=>{

            const d = formatDate(att.date);

            return d >= fromDate.value;

        });

    }

    // To Date
    if(toDate.value){

        filtered = filtered.filter(att=>{

            const d = formatDate(att.date);

            return d <= toDate.value;

        });

    }

    renderAttendanceTable(filtered);

}

/* ==========================================
   RENDER TABLE
========================================== */

function renderAttendanceTable(records){

    attendanceBody.innerHTML = "";

    if(records.length===0){

        attendanceBody.innerHTML=`

<tr>

<td colspan="13">

No attendance record found.

</td>

</tr>

`;

        return;

    }

    records.forEach(att=>{

        attendanceBody.innerHTML += `

<tr>

<td>${att.date || "-"}</td>

<td>${att.empid || "-"}</td>

<td>${att.name || "-"}</td>

<td>${att.timein || "-"}</td>

<td>${att.breakout || "-"}</td>

<td>${att.breakin || "-"}</td>

<td>${att.timeout || "-"}</td>

<td>${att.breakminutes || "0 mins"}</td>

<td>${att.totalhours || "0.00"}</td>

<td>${att.overtime || "0.00"}</td>

<td>${att.late || "0 mins"}</td>

<td>${att.status || "-"}</td>

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

window.deleteAttendance = async function(id){

    if(!confirm("Delete this attendance record?")){

        return;

    }

    await deleteDoc(

        doc(db,"attendance",id)

    );

    await loadAttendance();

}
/* ==========================================
   INITIALIZE
========================================== */

async function initialize(){

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

function printAttendance(){

    filterAttendance();

    setTimeout(()=>{

        window.print();

    },200);

}

document
.getElementById("printBtn")
.addEventListener(
    "click",
    printAttendance
);

/* ==========================================
   BACK BUTTON
========================================== */

document
.getElementById("backBtn")
.addEventListener(
    "click",
    ()=>{

        window.location.href =
        "index.html";

    }
);
