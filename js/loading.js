/* ==========================================
   PAPPRITO HRIS
   LOADING SCREEN
========================================== */

import { auth, db } from "./firebase.js";

import { onAuthStateChanged }

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {

collection,

getDocs

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ==========================================
ELEMENTS
========================================== */

const progressBar=document.getElementById("progressBar");

const percent=document.getElementById("percent");

const title=document.getElementById("loadingTitle");

const steps=[

document.getElementById("step1"),

document.getElementById("step2"),

document.getElementById("step3"),

document.getElementById("step4"),

document.getElementById("step5"),

document.getElementById("step6")

];

/* ==========================================
UPDATE STEP
========================================== */

function finishStep(index,text){

steps[index].classList.add("done");

steps[index].innerHTML="✔ "+text;

}

/* ==========================================
PROGRESS
========================================== */

function setProgress(value){

progressBar.style.width=value+"%";

percent.innerHTML=value+"%";

}

/* ==========================================
START LOADING
========================================== */

async function startLoading(){

try{

title.innerHTML="Connecting to Firebase...";

setProgress(10);

await new Promise(r=>setTimeout(r,500));

finishStep(0,"Connected to Firebase");

/* EMPLOYEES */

title.innerHTML="Loading Employees...";

await getDocs(collection(db,"users"));

setProgress(30);

finishStep(1,"Employee Database Loaded");

await new Promise(r=>setTimeout(r,500));

/* ATTENDANCE */

title.innerHTML="Loading Attendance...";

await getDocs(collection(db,"attendance"));

setProgress(50);

finishStep(2,"Attendance Module Loaded");

await new Promise(r=>setTimeout(r,500));

/* PAYROLL */

title.innerHTML="Loading Payroll...";

await getDocs(collection(db,"payroll"));

setProgress(70);

finishStep(3,"Payroll Module Loaded");

await new Promise(r=>setTimeout(r,500));

/* DASHBOARD */

title.innerHTML="Loading Dashboard...";

setProgress(90);

finishStep(4,"Dashboard Ready");

await new Promise(r=>setTimeout(r,500));

/* FINALIZE */

title.innerHTML="Preparing Interface...";

setProgress(100);

finishStep(5,"System Ready");

await new Promise(r=>setTimeout(r,1000));

window.location.replace("dashboard.html");

}catch(error){

console.error(error);

title.innerHTML="Initialization Failed";

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

startLoading();

});
