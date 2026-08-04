/* ==========================================
   PAPPRITO HRIS
   DASHBOARD
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

localStorage.removeItem("userRole");

localStorage.removeItem("loggedInUser");

window.location.replace("login.html");

}catch(error){

alert(error.message);

}

};

/* ==========================================
LOGIN PROTECTION
========================================== */

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location.replace("login.html");

return;

}

const loggedUser=

localStorage.getItem("loggedInUser") || "Administrator";

const userBox=document.getElementById("loggedUser");

if(userBox){

userBox.innerHTML=loggedUser;

}

loadDashboard();

updateClock();

});
/* ==========================================
   LOAD DASHBOARD
========================================== */

async function loadDashboard(){

try{

/* EMPLOYEES */

const employeeSnap=

await getDocs(

collection(db,"users")

);

const employees=[];

employeeSnap.forEach(doc=>{

employees.push(doc.data());

});

document.getElementById("totalEmployees").innerHTML=

employees.length;

/* ATTENDANCE */

const attendanceSnap=

await getDocs(

collection(db,"attendance")

);

document.getElementById("totalAttendance").innerHTML=

attendanceSnap.size;

/* PAYROLL */

const payrollSnap=

await getDocs(

collection(db,"payroll")

);

document.getElementById("totalPayroll").innerHTML=

payrollSnap.size;

/* REQUESTS */

const requestSnap=

await getDocs(

collection(db,"requests")

);

document.getElementById("totalRequests").innerHTML=

requestSnap.size;

/* BIRTHDAY */

let birthdayCount=0;

const birthdayList=document.getElementById("birthdayList");

birthdayList.innerHTML="";

const today=new Date();

const month=today.getMonth()+1;

employees.forEach(emp=>{

if(!emp.birthdate) return;

const birth=new Date(emp.birthdate);

if((birth.getMonth()+1)===month){

birthdayCount++;

birthdayList.innerHTML+=`

<div class="birthday-item">

<strong>${emp.firstname||""} ${emp.lastname||""}</strong>

<br>

${birth.toLocaleDateString()}

</div>

`;

}

});

if(birthdayCount===0){

birthdayList.innerHTML=

"<p>No upcoming birthdays.</p>";

}

document.getElementById("upcomingBirthdays").innerHTML=

birthdayCount;

/* SAMPLE VALUES */

document.getElementById("presentToday").innerHTML=

attendanceSnap.size;

document.getElementById("lateToday").innerHTML=

0;

document.getElementById("leaveToday").innerHTML=

0;

}catch(error){

console.error(error);

alert("Dashboard loading failed.");

}

}
/* ==========================================
   LIVE CLOCK
========================================== */

function updateClock(){

const clock=document.getElementById("clock");

const dateToday=document.getElementById("dateToday");

if(!clock || !dateToday) return;

setInterval(()=>{

const now=new Date();

clock.innerHTML=now.toLocaleTimeString();

dateToday.innerHTML=now.toLocaleDateString(

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
   RECENT ACTIVITY
========================================== */

function loadRecentActivity(){

const activity=document.getElementById("recentActivity");

if(!activity) return;

activity.innerHTML=`

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

const announcement=document.getElementById("announcementList");

if(!announcement) return;

announcement.innerHTML=`

<div class="announcement-item">

📢 Welcome to PAPPRITO HRIS Version 2.0

</div>

`;

}

/* ==========================================
   MOBILE MENU
========================================== */

const menuBtn=document.getElementById("menuBtn");

const sidebar=document.getElementById("sidebar");

const overlay=document.getElementById("overlay");

if(menuBtn){

menuBtn.onclick=function(){

sidebar.classList.add("show");

overlay.classList.add("show");

};

}

if(overlay){

overlay.onclick=function(){

sidebar.classList.remove("show");

overlay.classList.remove("show");

};

}

window.addEventListener("resize",()=>{

if(window.innerWidth>768){

sidebar.classList.remove("show");

overlay.classList.remove("show");

}

});

/* ==========================================
   AUTO REFRESH
========================================== */

setInterval(()=>{

loadDashboard();

},60000);

/* ==========================================
   INITIALIZE
========================================== */

window.addEventListener("load",()=>{

loadRecentActivity();

loadAnnouncements();

console.log("PAPPRITO HRIS Dashboard Ready");

});
