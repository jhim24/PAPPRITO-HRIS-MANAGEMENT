/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE PORTAL JS
========================================== */

import {
    db,
    auth
} from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let currentEmployee = null;

let employeePayroll = [];

let currentPayslip = null;


/* ==========================================
   ELEMENTS
========================================== */

const employeeName =
    document.getElementById(
        "employeeName"
    );


const employeeId =
    document.getElementById(
        "employeeId"
    );


const infoEmployeeId =
    document.getElementById(
        "infoEmployeeId"
    );


const infoName =
    document.getElementById(
        "infoName"
    );


const infoPosition =
    document.getElementById(
        "infoPosition"
    );


const infoDepartment =
    document.getElementById(
        "infoDepartment"
    );


const infoEmployment =
    document.getElementById(
        "infoEmployment"
    );


const infoStatus =
    document.getElementById(
        "infoStatus"
    );


const infoMobile =
    document.getElementById(
        "infoMobile"
    );


const infoEmail =
    document.getElementById(
        "infoEmail"
    );


const requestType =
    document.getElementById(
        "requestType"
    );


const requestDate =
    document.getElementById(
        "requestDate"
    );


const requestDays =
    document.getElementById(
        "requestDays"
    );


const requestReason =
    document.getElementById(
        "requestReason"
    );


const requestBody =
    document.getElementById(
        "requestBody"
    );


const payslipSelect =
    document.getElementById(
        "payslipSelect"
    );


const payslipArea =
    document.getElementById(
        "payslipArea"
    );


const payslipMessage =
    document.getElementById(
        "payslipMessage"
    );


/* ==========================================
   PAYSLIP ELEMENTS
========================================== */

const payEmpId =
    document.getElementById(
        "payEmpId"
    );


const payEmp =
    document.getElementById(
        "payEmp"
    );


const payDate =
    document.getElementById(
        "payDate"
    );


const payDailyRate =
    document.getElementById(
        "payDailyRate"
    );


const payTotalDays =
    document.getElementById(
        "payTotalDays"
    );


const payBasic =
    document.getElementById(
        "payBasic"
    );


const payOvertime =
    document.getElementById(
        "payOvertime"
    );


const payHoliday =
    document.getElementById(
        "payHoliday"
    );


const paySick =
    document.getElementById(
        "paySick"
    );


const payVacation =
    document.getElementById(
        "payVacation"
    );


const payBirthday =
    document.getElementById(
        "payBirthday"
    );


const payMaternity =
    document.getElementById(
        "payMaternity"
    );


const payPaternity =
    document.getElementById(
        "payPaternity"
    );


const payAllowance =
    document.getElementById(
        "payAllowance"
    );


const payGross =
    document.getElementById(
        "payGross"
    );


const paySSS =
    document.getElementById(
        "paySSS"
    );


const payPhilhealth =
    document.getElementById(
        "payPhilhealth"
    );


const payPagibig =
    document.getElementById(
        "payPagibig"
    );


const payHealth =
    document.getElementById(
        "payHealth"
    );


const payOther =
    document.getElementById(
        "payOther"
    );


const payDeduction =
    document.getElementById(
        "payDeduction"
    );


const payNet =
    document.getElementById(
        "payNet"
    );


/* ==========================================
   HELPERS
========================================== */

function text(value){

    return String(
        value ?? ""
    ).trim();

}


function number(value){

    const n =
        Number(
            value || 0
        );


    return Number.isFinite(n)
        ? n
        : 0;

}


function rawMoney(value){

    return number(
        value
    ).toFixed(2);

}


function escapeHTML(value){

    return text(
        value
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


/* ==========================================
   COMPATIBLE PAYROLL FIELD
========================================== */

function field(
    pay,
    primary,
    secondary,
    third
){

    if(
        pay[primary] !== undefined &&
        pay[primary] !== null
    ){

        return pay[primary];

    }


    if(
        secondary &&
        pay[secondary] !== undefined &&
        pay[secondary] !== null
    ){

        return pay[secondary];

    }


    if(
        third &&
        pay[third] !== undefined &&
        pay[third] !== null
    ){

        return pay[third];

    }


    return 0;

}


/* ==========================================
   FULL NAME
========================================== */

function getFullName(
    employee
){

    return [

        employee.firstname || "",

        employee.middlename || "",

        employee.lastname || ""

    ]

    .filter(Boolean)

    .join(" ")

    .replace(
        /\s+/g,
        " "
    )

    .trim();

}


/* ==========================================
   LOAD CURRENT EMPLOYEE
========================================== */

async function loadCurrentEmployee(){

    const employeeDocId =
        text(
            localStorage.getItem(
                "employeeDocId"
            )
        );


    const employeeId =
        text(
            localStorage.getItem(
                "employeeId"
            )
        )
        .toUpperCase();


    if(
        !employeeDocId &&
        !employeeId
    ){

        throw new Error(
            "EMPLOYEE_SESSION_MISSING"
        );

    }


    const snapshot =
        await getDocs(
            collection(
                db,
                "employees"
            )
        );


    let found =
        null;


    snapshot.forEach(
        docSnap => {

            const employee =
                docSnap.data();


            /*
             * First:
             * Firestore document ID
             */

            if(
                employeeDocId &&
                docSnap.id ===
                employeeDocId
            ){

                found = {

                    id:
                        docSnap.id,

                    ...employee

                };

                return;

            }


            /*
             * Second:
             * Employee ID
             */

            const empId =
                text(
                    employee.employeeid
                )
                .toUpperCase();


            if(
                employeeId &&
                empId ===
                employeeId
            ){

                found = {

                    id:
                        docSnap.id,

                    ...employee

                };

            }

        }
    );


    if(
        !found
    ){

        throw new Error(
            "EMPLOYEE_NOT_FOUND"
        );

    }


    currentEmployee =
        found;


    displayEmployeeInformation();

}


/* ==========================================
   DISPLAY EMPLOYEE INFORMATION
========================================== */

function displayEmployeeInformation(){

    const fullName =
        getFullName(
            currentEmployee
        );


    const empId =
        text(
            currentEmployee.employeeid
        );


    if(
        employeeName
    ){

        employeeName.innerText =
            fullName ||
            "Employee";

    }


    if(
        employeeId
    ){

        employeeId.innerText =
            "Employee ID: " +
            (
                empId ||
                "-"
            );

    }


    if(
        infoEmployeeId
    ){

        infoEmployeeId.innerText =
            empId ||
            "-";

    }


    if(
        infoName
    ){

        infoName.innerText =
            fullName ||
            "-";

    }


    if(
        infoPosition
    ){

        infoPosition.innerText =
            currentEmployee.position ||
            "-";

    }


    if(
        infoDepartment
    ){

        infoDepartment.innerText =
            currentEmployee.department ||
            "-";

    }


    if(
        infoEmployment
    ){

        infoEmployment.innerText =
            currentEmployee.employment ||
            "-";

    }


    if(
        infoStatus
    ){

        infoStatus.innerText =
            currentEmployee.status ||
            "Active";

    }


    if(
        infoMobile
    ){

        infoMobile.innerText =
            currentEmployee.mobile ||
            "-";

    }


    if(
        infoEmail
    ){

        infoEmail.innerText =
            currentEmployee.email ||
            "-";

    }

}


/* ==========================================
   LOAD REQUEST HISTORY
========================================== */

async function loadRequests(){

    if(
        !currentEmployee ||
        !requestBody
    ){

        return;

    }


    requestBody.innerHTML = `

<tr>

<td
    colspan="5"
    class="empty-message">

    Loading requests...

</td>

</tr>

`;


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "employeeRequests"
                )
            );


        const requests = [];


        const currentId =
            text(
                currentEmployee.employeeid
            )
            .toUpperCase();


        snapshot.forEach(
            docSnap => {

                const request =
                    docSnap.data();


                const requestEmployeeId =
                    text(
                        request.empid
                    )
                    .toUpperCase();


                /*
                 * ONLY current employee
                 */

                if(
                    requestEmployeeId !==
                    currentId
                ){

                    return;

                }


                requests.push({

                    id:
                        docSnap.id,

                    ...request

                });

            }
        );


        /*
         * Latest first
         */

        requests.sort(
            (
                a,
                b
            ) => {

                return (
                    Number(
                        b.timestamp || 0
                    )
                    -
                    Number(
                        a.timestamp || 0
                    )
                );

            }
        );


        renderRequests(
            requests
        );


    }catch(error){

        console.error(
            "Request Load Error:",
            error
        );


        requestBody.innerHTML = `

<tr>

<td
    colspan="5"
    class="empty-message">

    Failed to load requests.

</td>

</tr>

`;

    }

}


/* ==========================================
   RENDER REQUESTS
========================================== */

function renderRequests(
    requests
){

    if(
        !requestBody
    ){

        return;

    }


    requestBody.innerHTML =
        "";


    if(
        requests.length === 0
    ){

        requestBody.innerHTML = `

<tr>

<td
    colspan="5"
    class="empty-message">

    NO REQUESTS YET

</td>

</tr>

`;

        return;

    }


    requests.forEach(
        request => {

            const status =
                text(
                    request.status ||
                    "PENDING"
                );


            const statusClass =
                status
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

<td>

${escapeHTML(
    request.type ||
    "-"
)}

</td>


<td>

${escapeHTML(
    request.date ||
    "-"
)}

</td>


<td>

${escapeHTML(
    request.days ??
    "-"
)}

</td>


<td>

${escapeHTML(
    request.reason ||
    "-"
)}

</td>


<td>

<span
    class="status ${statusClass}">

    ${escapeHTML(
        status
    )}

</span>

</td>

`;


            requestBody.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   SUBMIT LEAVE REQUEST
========================================== */

window.submitLeaveRequest =
async function(){

    if(
        !currentEmployee
    ){

        alert(
            "Employee information is not loaded."
        );

        return;

    }


    const type =
        requestType
        ?
        requestType.value.trim()
        :
        "";


    const date =
        requestDate
        ?
        requestDate.value
        :
        "";


    const days =
        requestDays
        ?
        requestDays.value
        :
        "";


    const reason =
        requestReason
        ?
        requestReason.value.trim()
        :
        "";


    /*
     * Allowed requests only
     */

    const allowedRequests = [

        "DAY OFF",

        "BIRTHDAY LEAVE",

        "VACATION LEAVE",

        "SICK LEAVE",

        "MATERNITY LEAVE",

        "PATERNITY LEAVE",

        "EMERGENCY LEAVE",

        "UNPAID LEAVE",

        "OTHER REQUEST"

    ];


    if(
        !allowedRequests.includes(
            type
        )
    ){

        alert(
            "Please select a valid request type."
        );

        return;

    }


    if(
        !date
    ){

        alert(
            "Please select the date."
        );

        return;

    }


    if(
        !days ||
        Number(days) <= 0
    ){

        alert(
            "Please enter the number of days."
        );

        return;

    }


    if(
        !reason
    ){

        alert(
            "Please enter the reason."
        );

        return;

    }


    try{

        const employeeFullName =
            getFullName(
                currentEmployee
            );


        await addDoc(

            collection(
                db,
                "employeeRequests"
            ),

            {

                empid:
                    currentEmployee.employeeid,

                employee:
                    employeeFullName,

                type:
                    type,

                date:
                    date,

                days:
                    Number(
                        days
                    ),

                reason:
                    reason,

                status:
                    "PENDING",

                timestamp:
                    Date.now()

            }

        );


        alert(
            "Request submitted successfully."
        );


        clearRequestForm();


        await loadRequests();


    }catch(error){

        console.error(
            "Submit Request Error:",
            error
        );


        alert(
            "Failed to submit request.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   CLEAR REQUEST FORM
========================================== */

window.clearRequestForm =
function(){

    if(
        requestType
    ){

        requestType.value =
            "";

    }


    if(
        requestDate
    ){

        requestDate.value =
            "";

    }


    if(
        requestDays
    ){

        requestDays.value =
            "";

    }


    if(
        requestReason
    ){

        requestReason.value =
            "";

    }

};


/* ==========================================
   LOAD EMPLOYEE PAYROLL
========================================== */

async function loadEmployeePayroll(){

    if(
        !currentEmployee
    ){

        return;

    }


    employeePayroll = [];


    if(
        payslipSelect
    ){

        payslipSelect.innerHTML = `

<option value="">

Loading payslips...

</option>

`;

    }


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "payroll"
                )
            );


        const currentId =
            text(
                currentEmployee.employeeid
            )
            .toUpperCase();


        snapshot.forEach(
            docSnap => {

                const pay =
                    docSnap.data();


                const payrollId =
                    text(
                        pay.empid
                    )
                    .toUpperCase();


                /*
                 * ONLY CURRENT EMPLOYEE
                 */

                if(
                    payrollId !==
                    currentId
                ){

                    return;

                }


                employeePayroll.push({

                    id:
                        docSnap.id,

                    ...pay

                });

            }
        );


        /*
         * Latest payroll first
         */

        employeePayroll.sort(
            (
                a,
                b
            ) => {

                return String(
                    b.date || ""
                )
                .localeCompare(
                    String(
                        a.date || ""
                    )
                );

            }
        );


        populatePayslipSelect();


    }catch(error){

        console.error(
            "Payroll Load Error:",
            error
        );


        if(
            payslipSelect
        ){

            payslipSelect.innerHTML = `

<option value="">

Unable to load payslips

</option>

`;

        }

    }

}


/* ==========================================
   PAYSLIP SELECT
========================================== */

function populatePayslipSelect(){

    if(
        !payslipSelect
    ){

        return;

    }


    payslipSelect.innerHTML = `

<option value="">

SELECT PAYROLL PERIOD

</option>

`;


    if(
        employeePayroll.length === 0
    ){

        showPayslipMessage(
            "NO PAYSLIP AVAILABLE"
        );

        return;

    }


    employeePayroll.forEach(
        pay => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                pay.id;


            option.textContent =

                pay.date

                ?

                "Payroll - " +
                pay.date

                :

                "Payroll Record";


            payslipSelect.appendChild(
                option
            );

        }
    );


    /*
     * Latest payslip automatically selected
     */

    if(
        employeePayroll.length > 0
    ){

        payslipSelect.value =
            employeePayroll[0].id;

    }

}


/* ==========================================
   VIEW SELECTED PAYSLIP
========================================== */

window.viewSelectedPayslip =
function(){

    if(
        !payslipSelect
    ){

        return;

    }


    const selectedId =
        payslipSelect.value;


    if(
        !selectedId
    ){

        alert(
            "Please select a payroll period."
        );

        return;

    }


    const pay =
        employeePayroll.find(
            item =>
                item.id ===
                selectedId
        );


    if(
        !pay
    ){

        alert(
            "Payslip not found."
        );

        return;

    }


    /*
     * Extra protection
     */

    const currentId =
        text(
            currentEmployee.employeeid
        )
        .toUpperCase();


    const payrollId =
        text(
            pay.empid
        )
        .toUpperCase();


    if(
        currentId !==
        payrollId
    ){

        alert(
            "You are not authorized to view this payslip."
        );

        return;

    }


    currentPayslip =
        pay;


    displayPayslip(
        pay
    );


    hidePayslipMessage();


    if(
        payslipArea
    ){

        payslipArea.style.display =
            "block";


        setTimeout(
            () => {

                payslipArea.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "center"

                });

            },
            100
        );

    }

};


/* ==========================================
   DISPLAY PAYSLIP
========================================== */

function displayPayslip(
    pay
){

    const holiday =
        field(
            pay,
            "holiday",
            "holidaypay"
        );


    const health =
        field(
            pay,
            "healthcard",
            "health"
        );


    const other =
        field(
            pay,
            "otherdeduction",
            "other"
        );


    if(
        payEmpId
    ){

        payEmpId.innerText =
            pay.empid || "-";

    }


    if(
        payEmp
    ){

        payEmp.innerText =
            pay.employee || "-";

    }


    if(
        payDate
    ){

        payDate.innerText =
            pay.date || "-";

    }


    if(
        payDailyRate
    ){

        payDailyRate.innerText =
            rawMoney(
                pay.dailyrate
            );

    }


    if(
        payTotalDays
    ){

        payTotalDays.innerText =
            number(
                pay.totaldays
            );

    }


    if(
        payBasic
    ){

        payBasic.innerText =
            rawMoney(
                pay.basicpay
            );

    }


    if(
        payOvertime
    ){

        payOvertime.innerText =
            rawMoney(
                pay.overtime
            );

    }


    if(
        payHoliday
    ){

        payHoliday.innerText =
            rawMoney(
                holiday
            );

    }


    if(
        paySick
    ){

        paySick.innerText =
            rawMoney(
                pay.sickleave
            );

    }


    if(
        payVacation
    ){

        payVacation.innerText =
            rawMoney(
                pay.vacationleave
            );

    }


    if(
        payBirthday
    ){

        payBirthday.innerText =
            rawMoney(
                pay.birthdayleave
            );

    }


    if(
        payMaternity
    ){

        payMaternity.innerText =
            rawMoney(
                pay.maternityleave
            );

    }


    if(
        payPaternity
    ){

        payPaternity.innerText =
            rawMoney(
                pay.paternityleave
            );

    }


    if(
        payAllowance
    ){

        payAllowance.innerText =
            rawMoney(
                pay.allowance
            );

    }


    if(
        payGross
    ){

        payGross.innerText =
            rawMoney(
                pay.gross
            );

    }


    if(
        paySSS
    ){

        paySSS.innerText =
            rawMoney(
                pay.sss
            );

    }


    if(
        payPhilhealth
    ){

        payPhilhealth.innerText =
            rawMoney(
                pay.philhealth
            );

    }


    if(
        payPagibig
    ){

        payPagibig.innerText =
            rawMoney(
                pay.pagibig
            );

    }


    if(
        payHealth
    ){

        payHealth.innerText =
            rawMoney(
                health
            );

    }


    if(
        payOther
    ){

        payOther.innerText =
            rawMoney(
                other
            );

    }


    if(
        payDeduction
    ){

        payDeduction.innerText =
            rawMoney(
                pay.deductions
            );

    }


    if(
        payNet
    ){

        payNet.innerText =
            rawMoney(
                pay.net
            );

    }

}


/* ==========================================
   PAYSLIP MESSAGE
========================================== */

function showPayslipMessage(
    message
){

    if(
        payslipMessage
    ){

        payslipMessage.innerText =
            message;

        payslipMessage.style.display =
            "block";

    }

}


function hidePayslipMessage(){

    if(
        payslipMessage
    ){

        payslipMessage.style.display =
            "none";

    }

}


/* ==========================================
   CLOSE PAYSLIP
========================================== */

window.closePayslip =
function(){

    if(
        payslipArea
    ){

        payslipArea.style.display =
            "none";

    }

};


/* ==========================================
   PRINT SELECTED PAYSLIP
========================================== */

window.printSelectedPayslip =
function(){

    if(
        !currentPayslip
    ){

        if(
            payslipSelect &&
            payslipSelect.value
        ){

            currentPayslip =
                employeePayroll.find(
                    pay =>
                        pay.id ===
                        payslipSelect.value
                );

        }

    }


    if(
        !currentPayslip
    ){

        alert(
            "Please view a payslip first."
        );

        return;

    }


    /*
     * Verify employee ownership
     */

    const currentId =
        text(
            currentEmployee.employeeid
        )
        .toUpperCase();


    const payrollId =
        text(
            currentPayslip.empid
        )
        .toUpperCase();


    if(
        currentId !==
        payrollId
    ){

        alert(
            "You are not authorized to print this payslip."
        );

        return;

    }


    createPrintWindow(
        currentPayslip
    );

};


/* ==========================================
   CREATE PRINT WINDOW
========================================== */

function createPrintWindow(
    pay
){

    const holiday =
        field(
            pay,
            "holiday",
            "holidaypay"
        );


    const health =
        field(
            pay,
            "healthcard",
            "health"
        );


    const other =
        field(
            pay,
            "otherdeduction",
            "other"
        );


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=1200"
        );


    if(
        !printWindow
    ){

        alert(
            "Please allow pop-ups for printing."
        );

        return;

    }


    printWindow.document.open();


    printWindow.document.write(`

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<title>
PAPPRITO Payslip
</title>


<style>

*{

    box-sizing:border-box;

}


html,
body{

    margin:0;

    padding:0;

    background:#fff;

}


body{

    font-family:
        Tahoma,
        Arial,
        sans-serif;

}


@page{

    size:auto;

    margin:5mm;

}


.payslip{

    width:110mm;

    margin:0 auto;

    padding:8px;

    background:#f9f9f9;

    color:#000;

    border:
        2px solid #ffcc00;

    border-radius:10px;

}


.logo{

    width:60px;

    height:60px;

    object-fit:cover;

    border-radius:50%;

    border:
        2px solid #ffcc00;

    display:block;

    margin:0 auto 5px auto;

}


.company{

    text-align:center;

    border-bottom:
        2px solid #ffcc00;

    padding-bottom:4px;

}


.company h2{

    color:#cc0000;

    font-size:18px;

    margin:2px;

}


.company p{

    font-size:8px;

    font-weight:bold;

    margin:2px;

}


.info{

    font-size:9px;

    line-height:1.5;

    background:#fff8dc;

    border:
        1px solid #ffcc00;

    padding:5px;

    margin-top:5px;

}


table{

    width:100%;

    border-collapse:collapse;

    margin-top:5px;

}


th,
td{

    border:
        1px solid #999;

    padding:4px;

    font-size:8px;

}


th{

    background:#ffcc00;

    color:#000;

}


td{

    background:#fff;

    color:#000;

}


.net{

    margin-top:6px;

    padding:7px;

    background:#008000;

    color:#fff;

    font-weight:bold;

    font-size:10px;

    text-align:right;

}


.signature{

    display:flex;

    justify-content:space-between;

    margin-top:15px;

    font-size:7px;

}


.line{

    border-top:
        1px solid #000;

    width:70px;

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
class="logo"
alt="PAPPRITO">


<h2>
PAPPRITO
</h2>


<p>
OFFICIAL EMPLOYEE PAYSLIP
</p>


</div>



<div class="info">


<b>
ID:
</b>

${escapeHTML(
    pay.empid
)}


<br>


<b>
Name:
</b>

${escapeHTML(
    pay.employee
)}


<br>


<b>
Date:
</b>

${escapeHTML(
    pay.date
)}


<br>


<b>
Daily Rate:
</b>

₱ ${rawMoney(
    pay.dailyrate
)}


<br>


<b>
Total Days:
</b>

${number(
    pay.totaldays
)}

</div>



<table>


<tr>

<th>
EARNINGS
</th>

<th>
AMOUNT
</th>

</tr>


<tr>

<td>
Basic Pay
</td>

<td>
${rawMoney(
    pay.basicpay
)}
</td>

</tr>


<tr>

<td>
Overtime
</td>

<td>
${rawMoney(
    pay.overtime
)}
</td>

</tr>


<tr>

<td>
Holiday Pay
</td>

<td>
${rawMoney(
    holiday
)}
</td>

</tr>


<tr>

<td>
Sick Leave
</td>

<td>
${rawMoney(
    pay.sickleave
)}
</td>

</tr>


<tr>

<td>
Vacation Leave
</td>

<td>
${rawMoney(
    pay.vacationleave
)}
</td>

</tr>


<tr>

<td>
Birthday Leave
</td>

<td>
${rawMoney(
    pay.birthdayleave
)}
</td>

</tr>


<tr>

<td>
Maternity Leave
</td>

<td>
${rawMoney(
    pay.maternityleave
)}
</td>

</tr>


<tr>

<td>
Paternity Leave
</td>

<td>
${rawMoney(
    pay.paternityleave
)}
</td>

</tr>


<tr>

<td>
Allowance
</td>

<td>
${rawMoney(
    pay.allowance
)}
</td>

</tr>


<tr>

<td>

<b>
TOTAL GROSS
</b>

</td>

<td>

<b>

${rawMoney(
    pay.gross
)}

</b>

</td>

</tr>


</table>



<table>


<tr>

<th>
DEDUCTIONS
</th>

<th>
AMOUNT
</th>

</tr>


<tr>

<td>
SSS
</td>

<td>
${rawMoney(
    pay.sss
)}
</td>

</tr>


<tr>

<td>
PhilHealth
</td>

<td>
${rawMoney(
    pay.philhealth
)}
</td>

</tr>


<tr>

<td>
Pag-IBIG
</td>

<td>
${rawMoney(
    pay.pagibig
)}
</td>

</tr>


<tr>

<td>
Health Card
</td>

<td>
${rawMoney(
    health
)}
</td>

</tr>


<tr>

<td>
Others
</td>

<td>
${rawMoney(
    other
)}
</td>

</tr>


<tr>

<td>

<b>
TOTAL DEDUCTION
</b>

</td>

<td>

<b>

${rawMoney(
    pay.deductions
)}

</b>

</td>

</tr>


</table>



<div class="net">


NET PAY :

₱ ${rawMoney(
    pay.net
)}


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


    setTimeout(
        () => {

            printWindow.print();

        },
        700
    );

}


/* ==========================================
   BACK TO DASHBOARD
========================================== */

window.backToDashboard =
function(){

    /*
     * Employee portal is inside
     * the pages folder.
     *
     * dashboard.html is in
     * the same pages folder.
     */

    window.location.href =
        "dashboard.html";

};


/* ==========================================
   LOGOUT
========================================== */

window.logout =
async function(){

    try{

        await signOut(
            auth
        );

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


    localStorage.removeItem(
        "employeeDocId"
    );


    localStorage.removeItem(
        "employeeId"
    );


    localStorage.removeItem(
        "employeeName"
    );


    window.location.replace(
        "login.html"
    );

};


/* ==========================================
   AUTH STATE
========================================== */

onAuthStateChanged(

    auth,

    async function(user){

        /*
         * Firebase session is required.
         */

        if(
            !user
        ){

            window.location.replace(
                "login.html"
            );

            return;

        }


        /*
         * Check role.
         */

        const role =
            text(
                localStorage.getItem(
                    "userRole"
                )
            )
            .toLowerCase();


        if(
            role !==
            "employee"
        ){

            alert(
                "Employee Portal access only."
            );


            window.location.replace(
                "dashboard.html"
            );


            return;

        }


        try{

            await loadCurrentEmployee();

            await loadRequests();

            await loadEmployeePayroll();


        }catch(error){

            console.error(
                "Employee Portal Error:",
                error
            );


            if(
                error.message ===
                "EMPLOYEE_SESSION_MISSING"
            ){

                alert(
                    "Employee session not found. Please login again."
                );

            }

            else if(
                error.message ===
                "EMPLOYEE_NOT_FOUND"
            ){

                alert(
                    "Employee record not found."
                );

            }

            else{

                alert(
                    "Unable to load Employee Portal."
                );

            }


            window.location.replace(
                "login.html"
            );

        }

    }

);
