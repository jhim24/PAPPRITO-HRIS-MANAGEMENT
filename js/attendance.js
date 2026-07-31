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
   DEFAULT DATE
========================================== */

const today = new Date().toISOString().split("T")[0];

fromDate.value = today;

toDate.value = today;
