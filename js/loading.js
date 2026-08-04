/* ==========================================
   PAPPRITO HRIS
   HUD LOADING ENGINE
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

const circle=document.getElementById("progressCircle");

const bar=document.getElementById("progressBar");

const percent=document.getElementById("percent");

const title=document.getElementById("loadingTitle");

const radius=95;

const circumference=2*Math.PI*radius;

circle.style.strokeDasharray=circumference;

circle.style.strokeDashoffset=circumference;

/* ==========================================
UPDATE PROGRESS
========================================== */

function setProgress(value){

const offset=

circumference-

(value/100)*circumference;

circle.style.strokeDashoffset=offset;

bar.style.width=value+"%";

percent.innerHTML=value+"%";

}

/* ==========================================
MODULE COMPLETE
========================================== */

function finish(id,text){

const item=document.getElementById(id);

item.classList.add("done");

item.innerHTML="✔ "+text;

}

/* ==========================================
DELAY
========================================== */

function wait(ms){

return new Promise(resolve=>setTimeout(resolve,ms));

}

/* ==========================================
START INITIALIZATION
========================================== */

async function initializeSystem(){

try{

/* STEP 1 */

title.innerHTML="Connecting to Firebase...";

setProgress(10);

await wait(400);

finish(

"step1",

"Firebase Connected"

);

/* STEP 2 */

title.innerHTML="Loading Employees...";

const employees=

await getDocs(

collection(db,"users")

);

setProgress(30);

finish(

"step2",

employees.size+" Employees Loaded"

);

await wait(500);

/* STEP 3 */

title.innerHTML="Loading Attendance...";

const attendance=

await getDocs(

collection(db,"attendance")

);

setProgress(50);

finish(

"step3",

attendance.size+" Attendance Records"

);

await wait(500);

/* STEP 4 */

title.innerHTML="Loading Payroll...";

const payroll=

await getDocs(

collection(db,"payroll")

);

setProgress(70);

finish(

"step4",

payroll.size+" Payroll Records"

);

await wait(500);

/* STEP 5 */

title.innerHTML="Loading Dashboard...";

setProgress(90);

finish(

"step5",

"Dashboard Ready"

);

await wait(500);

/* STEP 6 */

title.innerHTML="Preparing User Interface...";

setProgress(100);

finish(

"step6",

"System Ready"

);

await wait(1200);

/* ==========================================
REDIRECT
========================================== */

const role=

localStorage.getItem("userRole");

if(role==="employee"){

window.location.replace(

"employeeportal.html"

);

}else{

window.location.replace(

"dashboard.html"

);

}

}catch(error){

console.error(error);

title.innerHTML=

"Initialization Failed";

alert(error.message);

}

}

/* ==========================================
AUTH CHECK
========================================== */

onAuthStateChanged(

auth,

(user)=>{

if(!user){

window.location.replace(

"login.html"

);

return;

}

initializeSystem();

});
