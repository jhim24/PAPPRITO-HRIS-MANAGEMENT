/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE PORTAL
========================================== */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   ELEMENTS
========================================== */

const empIdDisplay =
    document.getElementById("empIdDisplay");

const empNameDisplay =
    document.getElementById("empNameDisplay");

const requestType =
    document.getElementById("requestType");

const requestDate =
    document.getElementById("requestDate");

const days =
    document.getElementById("days");

const reason =
    document.getElementById("reason");

const attendanceType =
    document.getElementById("attendanceType");

const attendanceDate =
    document.getElementById("attendanceDate");

const attendanceTime =
    document.getElementById("attendanceTime");

const attendanceReason =
    document.getElementById("attendanceReason");

const requestBody =
    document.getElementById("requestBody");

const attendanceBody =
    document.getElementById("attendanceBody");

const payslipArea =
    document.getElementById("payslipArea");

const payEmpId =
    document.getElementById("payEmpId");

const payEmp =
    document.getElementById("payEmp");

const payDate =
    document.getElementById("payDate");

const payDailyRate =
    document.getElementById("payDailyRate");

const payTotalDays =
    document.getElementById("payTotalDays");

const payOvertime =
    document.getElementById("payOvertime");

const payHoliday =
    document.getElementById("payHoliday");

const paySick =
    document.getElementById("paySick");

const payVacation =
    document.getElementById("payVacation");

const payBirthday =
    document.getElementById("payBirthday");

const payAllowance =
    document.getElementById("payAllowance");

const payGross =
    document.getElementById("payGross");

const paySSS =
    document.getElementById("paySSS");

const payPhilhealth =
    document.getElementById("payPhilhealth");

const payPagibig =
    document.getElementById("payPagibig");

const payHealth =
    document.getElementById("payHealth");

const payOther =
    document.getElementById("payOther");

const payDeduction =
    document.getElementById("payDeduction");

const payNet =
    document.getElementById("payNet");


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let currentUser =
    localStorage.getItem(
        "loggedInUser"
    ) || "";

let currentEmployee = null;

let editId = null;

let attendanceEditId = null;


/* ==========================================
   AUTHENTICATION
========================================== */

onAuthStateChanged(
    auth,
    (user)=>{

        /*
        User must be authenticated.
        */

        if(!user){

            window.location.replace(
                "login.html"
            );

            return;

        }


        /*
        Employee portal only.
        */

        const role =
            localStorage.getItem(
                "userRole"
            );


        if(role === "admin"){

            window.location.replace(
                "dashboard.html"
            );

            return;

        }


        /*
        Employee login is identified
        using the stored Employee ID.
        */

        if(!currentUser){

            currentUser =
                user.email || "";

        }


        loadEmployee();

    }
);


/* ==========================================
   LOAD EMPLOYEE
========================================== */

async function loadEmployee(){

    try{

        let querySnapshot =
            await getDocs(
                collection(
                    db,
                    "employees"
                )
            );


        currentUser =
            (currentUser || "")
                .toString()
                .toUpperCase()
                .trim();


        querySnapshot.forEach(
            docSnap=>{

                const emp =
                    docSnap.data();


                const empId =
                    (emp.employeeid || "")
                        .toString()
                        .toUpperCase()
                        .trim();


                const fullname =
                    (emp.firstname || "") +
                    " " +
                    (emp.lastname || "");


                if(
                    empId === currentUser
                ){

                    currentEmployee = {

                        id:
                            emp.employeeid || "",

                        name:
                            fullname

                    };

                }

            }
        );


        if(currentEmployee){

            if(empIdDisplay){

                empIdDisplay.innerText =
                    currentEmployee.id;

            }


            if(empNameDisplay){

                empNameDisplay.innerText =
                    currentEmployee.name;

            }


            await loadRequests();

            await loadAttendanceRequests();

        }else{

            alert(
                "Employee account not found in masterlist"
            );


            window.location.replace(
                "login.html"
            );

        }

    }catch(error){

        console.error(error);

        alert(
            "Failed to load employee"
        );

    }

}


/* ==========================================
   SUBMIT REQUEST
========================================== */

window.submitRequest =
async function(){

    if(!currentEmployee){

        alert(
            "Employee information not loaded."
        );

        return;

    }


    if(
        !requestType ||
        requestType.value === ""
    ){

        alert(
            "Select Request Type"
        );

        return;

    }


    try{

        if(editId){

            await updateDoc(

                doc(
                    db,
                    "employeeRequests",
                    editId
                ),

                {

                    type:
                        requestType.value,

                    date:
                        requestDate.value,

                    days:
                        days.value,

                    reason:
                        reason.value

                }

            );


            alert(
                "Request Updated"
            );


            editId = null;

        }else{

            await addDoc(

                collection(
                    db,
                    "employeeRequests"
                ),

                {

                    empid:
                        currentEmployee.id,

                    employee:
                        currentEmployee.name,

                    type:
                        requestType.value,

                    date:
                        requestDate.value,

                    days:
                        days.value,

                    reason:
                        reason.value,

                    status:
                        "PENDING"

                }

            );


            alert(
                "Request Submitted"
            );

        }


        clearForm();

        await loadRequests();

    }catch(error){

        console.error(error);

        alert(
            "Submit Error"
        );

    }

};


/* ==========================================
   SUBMIT ATTENDANCE REQUEST
========================================== */

window.submitAttendanceRequest =
async function(){

    if(!currentEmployee){

        alert(
            "Employee information not loaded."
        );

        return;

    }


    if(
        !attendanceType ||
        attendanceType.value === ""
    ){

        alert(
            "Select Attendance Request"
        );

        return;

    }


    if(
        !attendanceDate ||
        attendanceDate.value === ""
    ){

        alert(
            "Select Date"
        );

        return;

    }


    if(
        !attendanceTime ||
        attendanceTime.value === ""
    ){

        alert(
            "Select Time"
        );

        return;

    }


    if(
        !attendanceReason ||
        attendanceReason.value === ""
    ){

        alert(
            "Enter Reason"
        );

        return;

    }


    try{

        if(attendanceEditId){

            await updateDoc(

                doc(
                    db,
                    "attendanceRequests",
                    attendanceEditId
                ),

                {

                    requesttype:
                        attendanceType.value,

                    date:
                        attendanceDate.value,

                    time:
                        attendanceTime.value,

                    reason:
                        attendanceReason.value

                }

            );


            alert(
                "Attendance Request Updated"
            );


            attendanceEditId = null;

        }else{

            await addDoc(

                collection(
                    db,
                    "attendanceRequests"
                ),

                {

                    employeeid:
                        currentEmployee.id,

                    employee:
                        currentEmployee.name,

                    requesttype:
                        attendanceType.value,

                    date:
                        attendanceDate.value,

                    time:
                        attendanceTime.value,

                    reason:
                        attendanceReason.value,

                    status:
                        "PENDING",

                    timestamp:
                        Date.now()

                }

            );


            alert(
                "Attendance Request Submitted"
            );

        }


        attendanceType.value = "";

        attendanceDate.value = "";

        attendanceTime.value = "";

        attendanceReason.value = "";


        await loadAttendanceRequests();

    }catch(error){

        console.error(error);

        alert(
            "Attendance Request Error"
        );

    }

};


/* ==========================================
   LOAD REQUESTS
========================================== */

async function loadRequests(){

    if(!requestBody){

        return;

    }


    requestBody.innerHTML = "";


    try{

        const querySnapshot =
            await getDocs(

                collection(
                    db,
                    "employeeRequests"
                )

            );


        querySnapshot.forEach(
            docSnap=>{

                const req =
                    docSnap.data();

                const id =
                    docSnap.id;


                if(

                    (req.empid || "")
                        .toString()
                        .toUpperCase()
                        .trim()

                    ===

                    (currentEmployee.id || "")
                        .toString()
                        .toUpperCase()
                        .trim()

                ){

                    const statusClass =
                        (req.status || "")
                            .toLowerCase();


                    requestBody.innerHTML += `

                        <tr>

                            <td>
                                ${req.empid || ""}
                            </td>

                            <td>
                                ${req.employee || ""}
                            </td>

                            <td>
                                ${req.type || ""}
                            </td>

                            <td>
                                ${req.date || ""}
                            </td>

                            <td>
                                ${req.days || ""}
                            </td>

                            <td>
                                ${req.reason || ""}
                            </td>

                            <td class="${statusClass}">
                                ${req.status || ""}
                            </td>

                            <td>

                                <button
                                class="btn edit-btn"
                                onclick="editRequest(
                                    '${id}',
                                    '${req.type || ""}',
                                    '${req.date || ""}',
                                    '${req.days || ""}',
                                    '${req.reason || ""}'
                                )">

                                    EDIT

                                </button>


                                <button
                                class="btn delete-btn"
                                onclick="deleteRequest('${id}')">

                                    DELETE

                                </button>

                            </td>

                        </tr>

                    `;

                }

            }
        );

    }catch(error){

        console.error(error);

    }

}


/* ==========================================
   LOAD ATTENDANCE REQUESTS
========================================== */

async function loadAttendanceRequests(){

    if(!attendanceBody){

        return;

    }


    attendanceBody.innerHTML = "";


    try{

        const querySnapshot =
            await getDocs(

                collection(
                    db,
                    "attendanceRequests"
                )

            );


        querySnapshot.forEach(
            docSnap=>{

                const req =
                    docSnap.data();


                if(

                    (req.employeeid || "")
                        .toString()
                        .toUpperCase()
                        .trim()

                    ===

                    (currentEmployee.id || "")
                        .toString()
                        .toUpperCase()
                        .trim()

                ){

                    const statusClass =
                        (req.status || "")
                            .toLowerCase();


                    attendanceBody.innerHTML += `

                        <tr>

                            <td>
                                ${req.employeeid || ""}
                            </td>

                            <td>
                                ${req.employee || ""}
                            </td>

                            <td>
                                ${req.requesttype || ""}
                            </td>

                            <td>
                                ${req.date || ""}
                            </td>

                            <td>
                                ${req.time || ""}
                            </td>

                            <td>
                                ${req.reason || ""}
                            </td>

                            <td class="${statusClass}">
                                ${req.status || ""}
                            </td>

                            <td>

                                <button
                                class="btn edit-btn"
                                onclick="editAttendanceRequest(
                                    '${docSnap.id}',
                                    '${req.requesttype || ""}',
                                    '${req.date || ""}',
                                    '${req.time || ""}',
                                    '${req.reason || ""}'
                                )">

                                    EDIT

                                </button>


                                <button
                                class="btn delete-btn"
                                onclick="deleteAttendanceRequest(
                                    '${docSnap.id}'
                                )">

                                    DELETE

                                </button>

                            </td>

                        </tr>

                    `;

                }

            }
        );

    }catch(error){

        console.error(error);

    }

}


/* ==========================================
   EDIT ATTENDANCE REQUEST
========================================== */

window.editAttendanceRequest =
function(
    id,
    type,
    date,
    time,
    reasonText
){

    attendanceEditId =
        id;


    attendanceType.value =
        type;


    attendanceDate.value =
        date;


    attendanceTime.value =
        time;


    attendanceReason.value =
        reasonText;


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

};


/* ==========================================
   DELETE ATTENDANCE REQUEST
========================================== */

window.deleteAttendanceRequest =
async function(id){

    if(
        !confirm(
            "Delete Attendance Request?"
        )
    ){

        return;

    }


    try{

        await deleteDoc(

            doc(
                db,
                "attendanceRequests",
                id
            )

        );


        await loadAttendanceRequests();

    }catch(error){

        console.error(error);

        alert(
            "Delete Error"
        );

    }

};


/* ==========================================
   EDIT REQUEST
========================================== */

window.editRequest =
function(
    id,
    type,
    date,
    daysValue,
    reasonText
){

    editId =
        id;


    requestType.value =
        type;


    requestDate.value =
        date;


    days.value =
        daysValue;


    reason.value =
        reasonText;


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

};


/* ==========================================
   DELETE REQUEST
========================================== */

window.deleteRequest =
async function(id){

    if(
        !confirm(
            "Delete Request?"
        )
    ){

        return;

    }


    try{

        await deleteDoc(

            doc(
                db,
                "employeeRequests",
                id
            )

        );


        await loadRequests();

    }catch(error){

        console.error(error);

        alert(
            "Delete Error"
        );

    }

};


/* ==========================================
   CLEAR REQUEST FORM
========================================== */

function clearForm(){

    if(requestType){

        requestType.value = "";

    }

    if(requestDate){

        requestDate.value = "";

    }

    if(days){

        days.value = "";

    }

    if(reason){

        reason.value = "";

    }

}


/* ==========================================
   LOAD PAYSLIP
========================================== */

window.loadPayslip =
async function(){

    if(!currentEmployee){

        alert(
            "Employee information not loaded."
        );

        return;

    }


    try{

        const querySnapshot =
            await getDocs(

                collection(
                    db,
                    "payroll"
                )

            );


        let found = false;


        querySnapshot.forEach(
            docSnap=>{

                const pay =
                    docSnap.data();


                if(

                    (pay.empid || "")
                        .toString()
                        .toUpperCase()
                        .trim()

                    ===

                    (currentEmployee.id || "")
                        .toString()
                        .toUpperCase()
                        .trim()

                ){

                    found = true;


                    if(payslipArea){

                        payslipArea.style.display =
                            "block";


                        setTimeout(()=>{

                            payslipArea.scrollIntoView({

                                behavior:"smooth",

                                block:"center"

                            });

                        },300);

                    }


                    payEmpId.innerText =
                        pay.empid || "";


                    payEmp.innerText =
                        pay.employee || "";


                    payDate.innerText =
                        pay.date || "";


                    payDailyRate.innerText =
                        Number(
                            pay.dailyrate || 0
                        ).toFixed(2);


                    payTotalDays.innerText =
                        Number(
                            pay.totaldays || 0
                        );


                    payOvertime.innerText =
                        Number(
                            pay.overtime || 0
                        ).toFixed(2);


                    payHoliday.innerText =
                        Number(
                            pay.holidaypay || 0
                        ).toFixed(2);


                    paySick.innerText =
                        Number(
                            pay.sickleave || 0
                        ).toFixed(2);


                    payVacation.innerText =
                        Number(
                            pay.vacationleave || 0
                        ).toFixed(2);


                    payBirthday.innerText =
                        Number(
                            pay.birthdayleave || 0
                        ).toFixed(2);


                    payAllowance.innerText =
                        Number(
                            pay.allowance || 0
                        ).toFixed(2);


                    payGross.innerText =
                        Number(
                            pay.gross || 0
                        ).toFixed(2);


                    paySSS.innerText =
                        Number(
                            pay.sss || 0
                        ).toFixed(2);


                    payPhilhealth.innerText =
                        Number(
                            pay.philhealth || 0
                        ).toFixed(2);


                    payPagibig.innerText =
                        Number(
                            pay.pagibig || 0
                        ).toFixed(2);


                    payHealth.innerText =
                        Number(
                            pay.health || 0
                        ).toFixed(2);


                    payOther.innerText =
                        Number(
                            pay.other || 0
                        ).toFixed(2);


                    payDeduction.innerText =
                        Number(
                            pay.deductions || 0
                        ).toFixed(2);


                    payNet.innerText =
                        Number(
                            pay.net || 0
                        ).toFixed(2);

                }

            }
        );


        if(!found){

            alert(
                "No Payslip Found"
            );

        }

    }catch(error){

        console.error(error);

        alert(
            "Failed To Load Payslip"
        );

    }

};


/* ==========================================
   CLOSE PAYSLIP
========================================== */

window.closePayslip =
function(){

    if(payslipArea){

        payslipArea.style.display =
            "none";

    }

};


/* ==========================================
   PRINT PAYSLIP
========================================== */

window.printPayslip =
function(){

    const payslip =
        document.getElementById(
            "payslipArea"
        );


    if(
        !payslip
        ||
        payslip.style.display === "none"
        ||
        payslip.innerHTML.trim() === ""
    ){

        alert(
            "Load Payslip First"
        );

        return;

    }


    const printWindow =
        window.open(
            "",
            "",
            "width=900,height=1200"
        );


    if(!printWindow){

        alert(
            "Please allow pop-ups to print the payslip."
        );

        return;

    }


    printWindow.document.write(`

        <html>

        <head>

        <title>
            Print Payslip
        </title>

        <style>

        body{

            font-family:
                Tahoma,sans-serif;

            padding:0;

            margin:0;

            background:white;

            display:flex;

            justify-content:center;

            align-items:flex-start;

        }


        html,
        body{

            height:auto;

            overflow:hidden;

        }


        @page{

            size:auto;

            margin:5mm;

        }


        .payroll-logo{

            width:70px;

            height:70px;

            object-fit:cover;

            border-radius:50%;

            border:3px solid #ffcc00;

            background:white;

            padding:4px;

            margin-bottom:8px;

            display:block;

            margin-left:auto;

            margin-right:auto;

        }


        .payslip{

            display:block !important;

            width:110mm;

            height:auto;

            background:#f9f9f9;

            color:black;

            padding:8px;

            border:2px solid #ffcc00;

            border-radius:10px;

            margin:0 auto;

            box-sizing:border-box;

        }


        table{

            width:100%;

            border-collapse:collapse;

            margin-top:5px;

        }


        th,
        td{

            border:1px solid #999;

            padding:4px;

            font-size:10px;

        }


        th{

            background:#ffcc00;

            color:black;

        }


        .netpay{

            margin-top:10px;

            padding:8px;

            background:#008000;

            color:white;

            font-weight:bold;

            text-align:right;

        }


        .signature{

            margin-top:15px;

            display:flex;

            justify-content:space-between;

            font-size:8px;

        }


        .line{

            margin-top:12px;

            border-top:1px solid black;

            width:75px;

            text-align:center;

            padding-top:3px;

        }

        </style>

        </head>


        <body>


        <div class="payslip">


            <div class="company">

                <img
                src="../assets/images/logo.png"
                class="payroll-logo">


                <h2>
                    PAPPRITO
                </h2>


                <p>
                    OFFICIAL EMPLOYEE PAYSLIP
                </p>

            </div>


            <div class="info">

                <b>ID:</b>
                ${payEmpId.innerText}

                <br><br>

                <b>Name:</b>
                ${payEmp.innerText}

                <br><br>

                <b>Date:</b>
                ${payDate.innerText}

            </div>


            ${payslip.querySelectorAll("table")[0].outerHTML}


            ${payslip.querySelectorAll("table")[1].outerHTML}


            <div class="netpay">

                NET PAY :

                ₱ ${payNet.innerText}

            </div>


            <div class="signature">

                <div class="line">
                    HR
                </div>


                <div class="line">
                    Employee
                </div>

            </div>


        </div>


        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();


    setTimeout(()=>{

        printWindow.print();

        printWindow.close();

    },500);

};


/* ==========================================
   LOGOUT
========================================== */

window.logout =
async function(){

    try{

        await signOut(auth);

    }catch(error){

        console.error(
            "Logout Error:",
            error
        );

    }


    localStorage.removeItem(
        "loggedInUser"
    );


    localStorage.removeItem(
        "userRole"
    );


    sessionStorage.clear();


    window.location.replace(
        "login.html"
    );

};
