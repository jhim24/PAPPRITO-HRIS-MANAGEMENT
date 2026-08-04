/* ==========================================
   PAPPRITO HRIS
   LOADING ENGINE V2
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

const cpu =
document.getElementById("cpuUsage");

const ram =
document.getElementById("ramUsage");

const radius = 95;

const circumference =
2 * Math.PI * radius;

/* ==========================================
SVG INIT
========================================== */

if(circle){

circle.style.strokeDasharray =
circumference;

circle.style.strokeDashoffset =
circumference;

}

/* ==========================================
CPU / RAM ANIMATION
========================================== */

let cpuValue = 15;
let ramValue = 28;

setInterval(()=>{

cpuValue += Math.floor(Math.random()*6)-2;
ramValue += Math.floor(Math.random()*6)-2;

cpuValue = Math.max(10,Math.min(cpuValue,45));
ramValue = Math.max(20,Math.min(ramValue,65));

if(cpu){

cpu.textContent =
cpuValue + "%";

}

if(ram){

ram.textContent =
ramValue + "%";

}

},500);

/* ==========================================
PROGRESS
========================================== */

function updateProgress(value){

if(circle){

const offset =

circumference -

(value/100)*circumference;

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
COMPLETE STEP
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

function wait(ms){

return new Promise(resolve=>{

setTimeout(resolve,ms);

});

}

/* ==========================================
INITIALIZE SYSTEM
========================================== */

async function initializeSystem(){

try{

const role =

localStorage.getItem("userRole");

if(!role){

window.location.replace("login.html");

return;

}

/* ==========================================
STEP 1
========================================== */

title.textContent =
"Connecting to Firebase...";

updateProgress(10);

await wait(400);

completeStep(

"step1",

"Firebase Connected"

);

/* ==========================================
STEP 2
========================================== */

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

await wait(500);

/* ==========================================
STEP 3
========================================== */

title.textContent =
"Loading Attendance...";

const attendanceSnap =

await getDocs(

collection(db,"attendance")

);

updateProgress(50);

completeStep(

"step3",

attendanceSnap.size +

" Attendance Loaded"

);

await wait(500);
   /* ==========================================
STEP 4
========================================== */

title.textContent =
"Loading Payroll...";

const payrollSnap =

await getDocs(

collection(db,"payroll")

);

updateProgress(70);

completeStep(

"step4",

payrollSnap.size +

" Payroll Records Loaded"

);

await wait(500);

/* ==========================================
STEP 5
========================================== */

title.textContent =
"Initializing Dashboard...";

updateProgress(90);

completeStep(

"step5",

"Dashboard Initialized"

);

await wait(700);

/* ==========================================
STEP 6
========================================== */

title.textContent =
"System Ready...";

updateProgress(100);

completeStep(

"step6",

"System Ready"

);

await wait(1000);

/* ==========================================
REDIRECT
========================================== */

if(role==="admin"){

window.location.replace("dashboard.html");

}else if(role==="employee"){

window.location.replace("employeeportal.html");

}else{

window.location.replace("login.html");

}

}catch(error){

console.error(error);

title.textContent="Initialization Failed";

alert(error.message);

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
PREVENT BACK BUTTON
========================================== */

history.pushState(null,null,location.href);

window.onpopstate=function(){

history.go(1);

};

/* ==========================================
START INITIALIZATION
========================================== */

initializeSystem();

});
