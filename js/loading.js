/* ==========================================
   PAPPRITO HRIS
   LOADING ENGINE V3
========================================== */

import { auth, db } from "./firebase.js";

import {

onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {

collection,
getDocs

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ==========================================
ELEMENTS
========================================== */

const circle =
document.getElementById("progressCircle");

const progressBar =
document.getElementById("progressBar");

const percent =
document.getElementById("percent");

const title =
document.getElementById("loadingTitle");

const radius = 95;

const circumference = 2 * Math.PI * radius;

/* ==========================================
INIT SVG
========================================== */

if(circle){

circle.style.strokeDasharray =
circumference;

circle.style.strokeDashoffset =
circumference;

}

/* ==========================================
PROGRESS
========================================== */

function updateProgress(value){

if(circle){

const offset =

circumference -

(value / 100) * circumference;

circle.style.strokeDashoffset =
offset;

}

if(progressBar){

progressBar.style.width =
value + "%";

}

if(percent){

percent.textContent =
value + "%";

}

}

/* ==========================================
MODULE COMPLETE
========================================== */

function completeStep(id,text){

const item =
document.getElementById(id);

if(!item) return;

item.classList.add("done");

item.innerHTML =
"✔ " + text;

}

/* ==========================================
WAIT
========================================== */

function delay(ms){

return new Promise(resolve=>{

setTimeout(resolve,ms);

});

}

/* ==========================================
LOAD MODULES
========================================== */

async function initializeSystem(){

try{

const role =

localStorage.getItem("userRole");

if(!role){

window.location.replace("login.html");

return;

}

title.textContent =
"Connecting to Firebase...";

updateProgress(10);

await delay(400);

completeStep(

"step1",

"Firebase Connected"

);

/* ==========================
EMPLOYEES
========================== */

title.textContent =
"Loading Employees...";

const employeeSnap =

await getDocs(

collection(db,"users")

);

updateProgress(30);

completeStep(

"step2",

employeeSnap.size +

" Employees Loaded"

);

await delay(500);

/* ==========================
ATTENDANCE
========================== */

title.textContent =
"Loading Attendance...";

const attendanceSnap =

await getDocs(

collection(db,"attendance")

);

updateProgress(55);

completeStep(

"step3",

attendanceSnap.size +

" Attendance Records"

);

await delay(500);

/* ==========================
PAYROLL
========================== */

title.textContent =
"Loading Payroll...";

const payrollSnap =

await getDocs(

collection(db,"payroll")

);

updateProgress(75);

completeStep(

"step4",

payrollSnap.size +

" Payroll Records"

);

await delay(500);

/* ==========================
DASHBOARD
========================== */

title.textContent =
"Loading Dashboard...";

updateProgress(90);

completeStep(

"step5",

"Dashboard Ready"

);

await delay(500);

/* ==========================
FINALIZE
========================== */

title.textContent =
"Preparing User Interface...";

updateProgress(100);

completeStep(

"step6",

"System Ready"

);

await delay(1000);

/* ==========================================
REDIRECT
========================================== */

if(role==="admin"){

window.location.replace(

"dashboard.html"

);

}else if(role==="employee"){

window.location.replace(

"employeeportal.html"

);

}else{

window.location.replace(

"login.html"

);

}

}catch(error){

console.error(error);

alert(error.message);

title.textContent="Initialization Failed";

}

}

/* ==========================================
AUTH CHECK
========================================== */

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location.replace("login.html");

return;

}

/* ==========================================
BACK BUTTON PROTECTION
========================================== */

history.pushState(null,null,location.href);

window.onpopstate=function(){

history.go(1);

};

initializeSystem();

});
