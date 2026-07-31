/* ==========================================
   PAPPRITO HRIS
   ATTENDANCE
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

const clock =
document.getElementById("clock");

const todayDate =
document.getElementById("todayDate");

let employees = [];

let attendance = [];
const attendanceBody =
document.getElementById("attendanceBody");
/* ==========================================
   LIVE CLOCK
========================================== */

function updateClock(){

const now = new Date();

clock.textContent = now.toLocaleTimeString();

todayDate.textContent = now.toLocaleDateString("en-US",{

weekday:"long",

year:"numeric",

month:"long",

day:"numeric"

});

}

setInterval(updateClock,1000);

updateClock();
/* ==========================================
   DATE & TIME HELPERS
========================================== */

function getToday(){

    const now = new Date();

    return now.toLocaleDateString("en-US");

}

function getCurrentTime(){

    return new Date().toLocaleTimeString("en-US");

}
/* ==========================================
   TIME IN
========================================== */

async function timeIn(){

    if(employeeSelect.value === ""){

        alert("Please select an employee.");

        return;

    }

    const employee =
    employees.find(emp => emp.id === employeeSelect.value);

    if(!employee){

        alert("Employee not found.");

        return;

    }

    const existing = attendance.find(att =>

        att.empDocId === employee.id &&

        att.date === getToday() &&

        (!att.timeout || att.timeout === "-")

    );

    if(existing){

        alert("Employee already Time In today.");

        return;

    }

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

        date: getToday(),

        timein: getCurrentTime(),

        breakout: "-",

        breakin: "-",

        timeout: "-",

        breakminutes: "0 mins",

        totalhours: "0.00",

        late: "0 mins",

        status: "PRESENT"

    };

    await addDoc(

        collection(db,"attendance"),

        data

    );

    await loadAttendance();

    alert("Time In Successful.");

}
/* ==========================================
   DEFAULT DATE
========================================== */

const today = new Date().toISOString().split("T")[0];

fromDate.value = today;

toDate.value = today;
/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

const snapshot = await getDocs(collection(db,"employees"));

employees = [];

employeeSelect.innerHTML =
'<option value="">Select Employee</option>';

snapshot.forEach(docSnap=>{

const emp = docSnap.data();

employees.push({

id:docSnap.id,

...emp

});

const fullName = [

emp.firstname || "",

emp.middlename || "",

emp.lastname || ""

]

.join(" ")

.replace(/\s+/g," ")

.trim();

employeeSelect.innerHTML += `

<option value="${docSnap.id}">

${emp.employeeid || "NO-ID"} - ${fullName}

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
    await getDocs(collection(db,"attendance"));

    snapshot.forEach(docSnap=>{

        attendance.push({

            id:docSnap.id,

            ...docSnap.data()

        });

    });

   filterAttendance();

}
/* ==========================================
   RENDER ATTENDANCE TABLE
========================================== */

function renderAttendanceTable(records = attendance){

    attendanceBody.innerHTML = "";

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

<td>${att.late || "0 mins"}</td>

<td>${att.status || "-"}</td>

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
   DELETE ATTENDANCE
========================================== */

window.deleteAttendance = async function(id){

    const confirmDelete = confirm(
        "Delete this attendance record?"
    );

    if(!confirmDelete){
        return;
    }

    await deleteDoc(
        doc(db,"attendance",id)
    );

    await loadAttendance();

}
/* ==========================================
   FILTER ATTENDANCE
========================================== */

function filterAttendance(){

    const selectedEmployee = employeeSelect.value;

    const startDate = fromDate.value;

    const endDate = toDate.value;

    attendanceBody.innerHTML = "";

    let filtered = attendance.filter(att=>{

        let employeeMatch = true;

        if(selectedEmployee !== ""){

            employeeMatch =
                att.employeeDocId === selectedEmployee ||
                att.empDocId === selectedEmployee;

        }

        let dateMatch = true;

        if(startDate && endDate){

            const attDate = formatDate(att.date);

            dateMatch =
                attDate >= startDate &&
                attDate <= endDate;

        }

        return employeeMatch && dateMatch;

    });

    renderAttendanceTable(filtered);

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

employeeSelect.addEventListener("change", filterAttendance);

fromDate.addEventListener("change", filterAttendance);

toDate.addEventListener("change", filterAttendance);
/* ==========================================
   BUTTON EVENTS
========================================== */

document
.getElementById("timeInBtn")
.addEventListener("click", timeIn);
