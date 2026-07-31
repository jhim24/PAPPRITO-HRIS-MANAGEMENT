/* ==========================================
   PAPPRITO HRIS
   DASHBOARD.JS
   PART 1
========================================== */

import { auth, db } from "../../database/firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ==========================
   ELEMENTS
========================== */

const adminName = document.getElementById("adminName");

const totalEmployees = document.getElementById("totalEmployees");

const presentToday = document.getElementById("presentToday");

const leaveToday = document.getElementById("leaveToday");

const payrollReady = document.getElementById("payrollReady");

const recentAttendance = document.getElementById("recentAttendance");

/* ==========================
   AUTH CHECK
========================== */

onAuthStateChanged(auth, (user)=>{

    if(user){

        adminName.textContent = user.email;

        loadDashboard();

    }else{

        window.location.href="../index.html";

    }

});

/* ==========================
   LOAD DASHBOARD
========================== */

async function loadDashboard(){

    await loadEmployees();

    await loadAttendance();

    await loadLeave();

    await loadPayroll();

}
/* ==========================
   EMPLOYEE COUNT
========================== */

async function loadEmployees(){

    try{

        const snapshot = await getDocs(
            collection(db,"employees")
        );

        totalEmployees.textContent = snapshot.size;

    }catch(error){

        console.error(error);

        totalEmployees.textContent = "0";

    }

}

/* ==========================
   ATTENDANCE
========================== */

async function loadAttendance(){

    try{

        const snapshot = await getDocs(
            query(
                collection(db,"attendance"),
                orderBy("timein","desc"),
                limit(5)
            )
        );

        presentToday.textContent = snapshot.size;

        recentAttendance.innerHTML="";

        if(snapshot.empty){

            recentAttendance.innerHTML=`
                <tr>
                    <td colspan="3">
                        No attendance records.
                    </td>
                </tr>
            `;

            return;

        }

        snapshot.forEach(doc=>{

            const data=doc.data();

            recentAttendance.innerHTML+=`
                <tr>

                    <td>${data.name ?? "-"}</td>

                    <td>${data.timein ?? "-"}</td>

                    <td>${data.status ?? "Present"}</td>

                </tr>
            `;

        });

    }catch(error){

        console.error(error);

    }

}

/* ==========================
   LEAVE COUNT
========================== */

async function loadLeave(){

    try{

        const snapshot=await getDocs(
            collection(db,"leave")
        );

        leaveToday.textContent=snapshot.size;

    }catch(error){

        console.error(error);

        leaveToday.textContent="0";

    }

}

/* ==========================
   PAYROLL COUNT
========================== */

async function loadPayroll(){

    try{

        const snapshot=await getDocs(
            collection(db,"payroll")
        );

        payrollReady.textContent=snapshot.size;

    }catch(error){

        console.error(error);

        payrollReady.textContent="0";

    }

}

/* ==========================
   LOGOUT
========================== */

window.logout = async function(){

    try{

        await signOut(auth);

        window.location.href="../index.html";

    }catch(error){

        alert(error.message);

    }

};
/* ==========================================
   MOBILE SIDEBAR
========================================== */

window.toggleSidebar = function(){

    document
        .querySelector(".sidebar")
        .classList
        .toggle("active");

};
