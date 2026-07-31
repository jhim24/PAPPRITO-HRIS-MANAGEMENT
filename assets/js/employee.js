import { db } from "../../database/firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE MODULE
========================================== */

const modal = document.getElementById("employeeModal");

const addBtn = document.getElementById("addEmployeeBtn");

const closeBtn = document.getElementById("closeModal");

const cancelBtn = document.getElementById("cancelModal");

/* OPEN MODAL */

addBtn.addEventListener("click",()=>{

    modal.style.display="flex";

});

/* CLOSE MODAL */

closeBtn.addEventListener("click",()=>{

    modal.style.display="none";

});

cancelBtn.addEventListener("click",()=>{

    modal.style.display="none";

});

/* CLICK OUTSIDE */

window.addEventListener("click",(e)=>{

    if(e.target===modal){

        modal.style.display="none";

    }

});

/* ==========================================
   FIRESTORE
========================================== */

const employeeCollection = collection(db, "employees");

/* MOBILE SIDEBAR */

const sidebar = document.querySelector(".sidebar");

window.toggleSidebar=function(){

    sidebar.classList.toggle("active");

};
