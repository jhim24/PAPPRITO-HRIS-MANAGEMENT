/* ==========================================
   PAPPRITO HRIS
   DASHBOARD V2
========================================== */

import { auth, db } from "./firebase.js";

import {

onAuthStateChanged,
signOut

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {

collection,
getDocs

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ==========================================
GLOBAL VARIABLES
========================================== */

let dashboardLoaded=false;

let clockStarted=false;

/* ==========================================
PAGE NAVIGATION
========================================== */

window.openPage=function(page){

window.location.href=page;

};

/* ==========================================
LOGOUT
========================================== */

window.logout=async function(){

if(!confirm("Are you sure you want to logout?")) return;

try{

await signOut(auth);

localStorage.clear();

sessionStorage.clear();

window.location.replace("login.html");

}catch(error){

alert(error.message);

}

};

/* ==========================================
AUTH PROTECTION
========================================== */

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location.replace("login.html");

return;

}

/* Prevent Back Button */

history.pushState(null,null,location.href);

window.onpopstate=function(){

history.go(1);

};

const loggedUser=

localStorage.getItem("loggedInUser")

||

user.email

||

"Administrator";

const userBox=

document.getElementById("loggedUser");

if(userBox){

userBox.textContent=

loggedUser;

}

/* Prevent duplicate loading */

if(!dashboardLoaded){

dashboardLoaded=true;

loadDashboard();

}

updateClock();

});

/* ==========================================
LIVE CLOCK
========================================== */

function updateClock(){

if(clockStarted) return;

clockStarted=true;

const clock=

document.getElementById("clock");

const dateToday=

document.getElementById("dateToday");

if(!clock || !dateToday) return;

setInterval(()=>{

const now=new Date();

clock.textContent=

now.toLocaleTimeString();

dateToday.textContent=

now.toLocaleDateString(

"en-US",

{

weekday:"long",

year:"numeric",

month:"long",

day:"numeric"

}

);

},1000);

}
/* ==========================================
   LOAD DASHBOARD
========================================== */

async function loadDashboard(){

try{

/* ==========================
EMPLOYEES
========================== */

const employeeSnap=

await getDocs(

collection(db,"users")

);

const employees=[];

employeeSnap.forEach(doc=>{

employees.push(doc.data());

});

const totalEmployees=

document.getElementById("totalEmployees");

if(totalEmployees){

totalEmployees.textContent=

employees.length;

}

/* ==========================
ATTENDANCE
========================== */

const attendanceSnap=

await getDocs(

collection(db,"attendance")

);

const totalAttendance=

document.getElementById("totalAttendance");

if(totalAttendance){

totalAttendance.textContent=

attendanceSnap.size;

}

/* ==========================
PAYROLL
========================== */

const payrollSnap=

await getDocs(

collection(db,"payroll")

);

const totalPayroll=

document.getElementById("totalPayroll");

if(totalPayroll){

totalPayroll.textContent=

payrollSnap.size;

}

/* ==========================
REQUESTS
========================== */

const requestSnap=

await getDocs(

collection(db,"requests")

);

const totalRequests=

document.getElementById("totalRequests");

if(totalRequests){

totalRequests.textContent=

requestSnap.size;

}

/* ==========================
UPCOMING BIRTHDAYS
========================== */

const birthdayList=

document.getElementById("birthdayList");

const birthdayCount=

document.getElementById("upcomingBirthdays");

if(birthdayList){

birthdayList.innerHTML="";

}

let count=0;

const today=new Date();

const currentMonth=

today.getMonth()+1;

employees.forEach(emp=>{

if(!emp.birthdate) return;

const birth=

new Date(emp.birthdate);

if(

birth.getMonth()+1===currentMonth

){

count++;

if(birthdayList){

birthdayList.innerHTML+=`

<div class="birthday-item">

<strong>

${emp.firstname||""}

${emp.lastname||""}

</strong>

<br>

${birth.toLocaleDateString()}

</div>

`;

}

}

});

if(count===0 && birthdayList){

birthdayList.innerHTML=

"<p>No upcoming birthdays.</p>";

}

if(birthdayCount){

birthdayCount.textContent=count;

}

/* ==========================
SAMPLE VALUES
========================== */

const present=

document.getElementById("presentToday");

const late=

document.getElementById("lateToday");

const leave=

document.getElementById("leaveToday");

if(present){

present.textContent=

attendanceSnap.size;

}

if(late){

late.textContent="0";

}

if(leave){

leave.textContent="0";

}

}catch(error){

console.error(error);

alert("Dashboard loading failed.");

}

}
