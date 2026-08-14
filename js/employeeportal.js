/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE PORTAL JS
   VERSION 3
   AUTO PAYROLL PAYSLIP
========================================== */

import {
    db,
    auth
} from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc
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
    document.getElementById("employeeName");

const employeeId =
    document.getElementById("employeeId");

const infoEmployeeId =
    document.getElementById("infoEmployeeId");

const infoName =
    document.getElementById("infoName");

const infoPosition =
    document.getElementById("infoPosition");

const infoDepartment =
    document.getElementById("infoDepartment");

const infoEmployment =
    document.getElementById("infoEmployment");

const infoStatus =
    document.getElementById("infoStatus");

const infoMobile =
    document.getElementById("infoMobile");

const infoEmail =
    document.getElementById("infoEmail");


/* ==========================================
   REQUEST ELEMENTS
========================================== */

const requestType =
    document.getElementById("requestType");

const requestDate =
    document.getElementById("requestDate");

const requestDays =
    document.getElementById("requestDays");

const requestReason =
    document.getElementById("requestReason");

const requestBody =
    document.getElementById("requestBody");


/* ==========================================
   PAYSLIP ELEMENTS
   AUTO PAYROLL
========================================== */

const payslipSelect =
    document.getElementById("payslipSelect");

const payslipArea =
    document.getElementById("payslipArea");

const payslipMessage =
    document.getElementById("payslipMessage");


const payEmpId =
    document.getElementById("payEmpId");

const payEmp =
    document.getElementById("payEmp");

const payDate =
    document.getElementById("payDate");


/* HOURLY RATE */

const payHourlyRate =
    document.getElementById("payHourlyRate");


/* WORKING HOURS */

const payRegularHours =
    document.getElementById("payRegularHours");

const payOvertimeHours =
    document.getElementById("payOvertimeHours");

const payHolidayType =
    document.getElementById("payHolidayType");

const payHolidayHours =
    document.getElementById("payHolidayHours");

const payNightHours =
    document.getElementById("payNightHours");

const payNightRate =
    document.getElementById("payNightRate");


/* EARNINGS */

const payBasic =
    document.getElementById("payBasic");

const payOvertime =
    document.getElementById("payOvertime");

const payHoliday =
    document.getElementById("payHoliday");

const payNight =
    document.getElementById("payNight");


const payGross =
    document.getElementById("payGross");


/* DEDUCTIONS */

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


/* NET */

const payNet =
    document.getElementById("payNet");


/* ==========================================
   HELPER
========================================== */

function text(value){

    return String(
        value ?? ""
    ).trim();

}


function number(value){

    const n =
        Number(value || 0);

    return Number.isFinite(n)
        ? n
        : 0;

}


function money(value){

    return number(value)
        .toLocaleString(
            "en-PH",
            {
                minimumFractionDigits:2,
                maximumFractionDigits:2
            }
        );

}


function escapeHTML(value){

    return text(value)

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
   FULL NAME
========================================== */

function getFullName(employee){

    return [

        employee.firstname,

        employee.middlename,

        employee.lastname

    ]

    .filter(
        value =>
            text(value)
    )

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


    const savedEmployeeId =
        text(
            localStorage.getItem(
                "employeeId"
            )
        )
        .toUpperCase();


    if(
        !employeeDocId &&
        !savedEmployeeId
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


    let foundEmployee = null;


    snapshot.forEach(
        docSnap => {

            const employee =
                docSnap.data();


            /*
             * MATCH FIRESTORE DOCUMENT ID
             */

            if(
                employeeDocId &&
                docSnap.id ===
                employeeDocId
            ){

                foundEmployee = {

                    id:
                        docSnap.id,

                    ...employee

                };

            }

        }
    );


    /*
     * MATCH EMPLOYEE ID
     */

    if(!foundEmployee){

        snapshot.forEach(
            docSnap => {

                const employee =
                    docSnap.data();


                const empId =
                    text(
                        employee.employeeid
                    )
                    .toUpperCase();


                if(
                    savedEmployeeId &&
                    empId ===
                    savedEmployeeId
                ){

                    foundEmployee = {

                        id:
                            docSnap.id,

                        ...employee

                    };

                }

            }
        );

    }


    if(!foundEmployee){

        throw new Error(
            "EMPLOYEE_NOT_FOUND"
        );

    }


    currentEmployee =
        foundEmployee;


    displayEmployeeInformation();

}


/* ==========================================
   DISPLAY EMPLOYEE
========================================== */

function displayEmployeeInformation(){

    if(!currentEmployee){

        return;

    }


    const name =
        getFullName(
            currentEmployee
        );


    const id =
        text(
            currentEmployee.employeeid
        );


    if(employeeName){

        employeeName.innerText =
            name || "Employee";

    }


    if(employeeId){

        employeeId.innerText =
            "Employee ID: " +
            (id || "-");

    }


    if(infoEmployeeId){

        infoEmployeeId.innerText =
            id || "-";

    }


    if(infoName){

        infoName.innerText =
            name || "-";

    }


    if(infoPosition){

        infoPosition.innerText =
            currentEmployee.position || "-";

    }


    if(infoDepartment){

        infoDepartment.innerText =
            currentEmployee.department || "-";

    }


    if(infoEmployment){

        infoEmployment.innerText =
            currentEmployee.employment || "-";

    }


    if(infoStatus){

        infoStatus.innerText =
            currentEmployee.status || "Active";

    }


    if(infoMobile){

        infoMobile.innerText =
            currentEmployee.mobile || "-";

    }


    if(infoEmail){

        infoEmail.innerText =
            currentEmployee.email || "-";

    }

}


/* ==========================================
   LOAD REQUESTS
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


                const requestId =
                    text(
                        request.empid
                    )
                    .toUpperCase();


                if(
                    requestId !==
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


        requests.sort(
            (a,b) => {

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
                )
                .toUpperCase();


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
    request.type || "-"
)}
</td>

<td>
${escapeHTML(
    request.date || "-"
)}
</td>

<td>
${escapeHTML(
    request.days ?? "-"
)}
</td>

<td>
${escapeHTML(
    request.reason || "-"
)}
</td>

<td>

<span class="status ${statusClass}">

${escapeHTML(status)}

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
   SUBMIT REQUEST
========================================== */

window.submitLeaveRequest =
async function(){

    if(!currentEmployee){

        alert(
            "Hindi pa loaded ang employee information."
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
            "Pumili muna ng Request Type."
        );

        return;

    }


    if(!date){

        alert(
            "Pumili muna ng date."
        );

        return;

    }


    if(
        !days ||
        Number(days) <= 0
    ){

        alert(
            "Ilagay ang number of days."
        );

        return;

    }


    if(!reason){

        alert(
            "Ilagay ang reason."
        );

        return;

    }


    try{

        const fullName =
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
                    fullName,

                type:
                    type,

                date:
                    date,

                days:
                    Number(days),

                reason:
                    reason,

                status:
                    "PENDING",

                timestamp:
                    Date.now()

            }

        );


        alert(
            "Successfully submitted ang request."
        );


        clearRequestForm();


        await loadRequests();


    }catch(error){

        console.error(
            "Submit Request Error:",
            error
        );


        alert(
            "Hindi na-submit ang request.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   CLEAR REQUEST FORM
========================================== */

window.clearRequestForm =
function(){

    if(requestType){

        requestType.value =
            "";

    }


    if(requestDate){

        requestDate.value =
            "";

    }


    if(requestDays){

        requestDays.value =
            "";

    }


    if(requestReason){

        requestReason.value =
            "";

    }

};


/* =========================================================
   =========================================================
   PAYSLIP SECTION
   AUTO PAYROLL ONLY
   =========================================================
   ========================================================= */


/* ==========================================
   LOAD AUTO PAYROLL
========================================== */

async function loadEmployeePayroll(){

    if(!currentEmployee){

        return;

    }


    employeePayroll = [];


    if(payslipSelect){

        payslipSelect.innerHTML = `

<option value="">

Loading payslips...

</option>

`;

    }


    try{

        /*
         * IMPORTANT
         *
         * Payslip now reads ONLY from:
         *
         * autoPayroll
         */

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "autoPayroll"
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


                /*
                 * AUTO PAYROLL USES
                 *
                 * employeeId
                 */

                const payrollId =
                    text(
                        pay.employeeId
                    )
                    .toUpperCase();


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
         * SORT NEWEST FIRST
         */

        employeePayroll.sort(
            (a,b) => {

                const dateCompare =
                    String(
                        b.date || ""
                    )
                    .localeCompare(
                        String(
                            a.date || ""
                        )
                    );


                if(
                    dateCompare !== 0
                ){

                    return dateCompare;

                }


                return (
                    Number(
                        b.updatedAt ||
                        b.createdAt ||
                        0
                    )

                    -

                    Number(
                        a.updatedAt ||
                        a.createdAt ||
                        0
                    )
                );

            }
        );


        populatePayslipSelect();


    }catch(error){

        console.error(
            "Auto Payroll Load Error:",
            error
        );


        if(payslipSelect){

            payslipSelect.innerHTML = `

<option value="">

Unable to load payslips

</option>

`;

        }

    }

}


/* ==========================================
   POPULATE PAYSLIP SELECT
========================================== */

function populatePayslipSelect(){

    if(!payslipSelect){

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


    hidePayslipMessage();


    employeePayroll.forEach(
        pay => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                pay.id;


            const date =
                pay.date ||
                "No Date";


            const gross =
                money(
                    pay.gross
                );


            const net =
                money(
                    pay.net
                );


            option.textContent =
                date +
                " • Gross ₱" +
                gross +
                " • Net ₱" +
                net;


            payslipSelect.appendChild(
                option
            );

        }
    );


    /*
     * Select newest payroll
     * automatically.
     */

    if(
        employeePayroll[0]
    ){

        payslipSelect.value =
            employeePayroll[0].id;

    }

}


/* ==========================================
   VIEW PAYSLIP
========================================== */

window.viewSelectedPayslip =
function(){

    if(!payslipSelect){

        return;

    }


    const selectedId =
        payslipSelect.value;


    if(!selectedId){

        alert(
            "Pumili muna ng payroll period."
        );

        return;

    }


    const pay =
        employeePayroll.find(
            item =>
                item.id ===
                selectedId
        );


    if(!pay){

        alert(
            "Payslip not found."
        );

        return;

    }


    /*
     * SECURITY CHECK
     */

    const currentId =
        text(
            currentEmployee.employeeid
        )
        .toUpperCase();


    const payrollId =
        text(
            pay.employeeId
        )
        .toUpperCase();


    if(
        !payrollId ||
        currentId !==
        payrollId
    ){

        alert(
            "Hindi ka authorized makita ang payslip na ito."
        );

        return;

    }


    currentPayslip =
        pay;


    displayPayslip(
        pay
    );


    hidePayslipMessage();


    if(payslipArea){

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
   AUTO PAYROLL DATA
========================================== */

function displayPayslip(pay){

    if(!pay){

        return;

    }


    /*
     * EMPLOYEE
     */

    if(payEmpId){

        payEmpId.innerText =
            pay.employeeId ||
            "-";

    }


    if(payEmp){

        payEmp.innerText =
            pay.employeeName ||
            "-";

    }


    if(payDate){

        payDate.innerText =
            pay.date ||
            "-";

    }


    /*
     * HOURLY RATE
     */

    if(payHourlyRate){

        payHourlyRate.innerText =
            money(
                pay.hourlyRate
            );

    }


    /*
     * WORKING HOURS
     */

    if(payRegularHours){

        payRegularHours.innerText =
            number(
                pay.regularHours
            ).toFixed(2);

    }


    if(payOvertimeHours){

        payOvertimeHours.innerText =
            number(
                pay.overtimeHours
            ).toFixed(2);

    }


    if(payHolidayType){

        payHolidayType.innerText =
            formatHolidayType(
                pay.holidayType
            );

    }


    if(payHolidayHours){

        payHolidayHours.innerText =
            number(
                pay.holidayHours
            ).toFixed(2);

    }


    if(payNightHours){

        payNightHours.innerText =
            number(
                pay.nightHours
            ).toFixed(2);

    }


    if(payNightRate){

        payNightRate.innerText =
            number(
                pay.nightRate
            ).toFixed(2);

    }


    /*
     * EARNINGS
     */

    if(payBasic){

        payBasic.innerText =
            money(
                pay.regularPay
            );

    }


    if(payOvertime){

        payOvertime.innerText =
            money(
                pay.overtimePay
            );

    }


    if(payHoliday){

        payHoliday.innerText =
            money(
                pay.holidayPay
            );

    }


    if(payNight){

        payNight.innerText =
            money(
                pay.nightPay
            );

    }


    /*
     * GROSS
     */

    if(payGross){

        payGross.innerText =
            money(
                pay.gross
            );

    }


    /*
     * DEDUCTIONS
     */

    if(paySSS){

        paySSS.innerText =
            money(
                pay.sss
            );

    }


    if(payPhilhealth){

        payPhilhealth.innerText =
            money(
                pay.philhealth
            );

    }


    if(payPagibig){

        payPagibig.innerText =
            money(
                pay.pagibig
            );

    }


    if(payHealth){

        payHealth.innerText =
            money(
                pay.healthcard
            );

    }


    if(payOther){

        payOther.innerText =
            money(
                pay.others
            );

    }


    if(payDeduction){

        payDeduction.innerText =
            money(
                pay.deductions
            );

    }


    /*
     * NET
     */

    if(payNet){

        payNet.innerText =
            money(
                pay.net
            );

    }

}


/* ==========================================
   HOLIDAY TYPE
========================================== */

function formatHolidayType(
    type
){

    switch(
        text(type).toLowerCase()
    ){

        case "regular":

            return "Regular Holiday";


        case "special":

            return "Special Holiday";


        default:

            return "No Holiday";

    }

}


/* ==========================================
   PAYSLIP MESSAGE
========================================== */

function showPayslipMessage(
    message
){

    if(!payslipMessage){

        return;

    }


    payslipMessage.innerText =
        message;


    payslipMessage.style.display =
        "block";

}


function hidePayslipMessage(){

    if(!payslipMessage){

        return;

    }


    payslipMessage.style.display =
        "none";

}


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
   PRINT SELECTED PAYSLIP
========================================== */

window.printSelectedPayslip =
function(){

    if(!currentPayslip){

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


    if(!currentPayslip){

        alert(
            "View a payslip first."
        );

        return;

    }


    /*
     * SECURITY CHECK
     */

    const currentId =
        text(
            currentEmployee.employeeid
        )
        .toUpperCase();


    const payrollId =
        text(
            currentPayslip.employeeId
        )
        .toUpperCase();


    if(
        !payrollId ||
        currentId !==
        payrollId
    ){

        alert(
            "Hindi ka authorized mag-print ng payslip na ito."
        );

        return;

    }


    createPrintWindow(
        currentPayslip
    );

};


/* ==========================================
   CREATE PRINT WINDOW
   AUTO PAYROLL FORMAT
========================================== */

function createPrintWindow(
    pay
){

    if(!pay){

        return;

    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=1200"
        );


    if(!printWindow){

        alert(
            "Please allow pop-ups for printing."
        );

        return;

    }


    const holidayType =
        formatHolidayType(
            pay.holidayType
        );


    printWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
PAPPRITO Payslip
</title>


<style>

*{
    box-sizing:border-box;
}


@page{

    size:A4;

    margin:8mm;

}


body{

    margin:0;

    padding:0;

    background:#ffffff;

    color:#000000;

    font-family:
        Arial,
        Tahoma,
        sans-serif;

}


/* ==========================================
   PAYSLIP
========================================== */

.payslip{

    width:100%;

    max-width:190mm;

    margin:0 auto;

    padding:8mm;

    border:2px solid #ffcc00;

    border-radius:8px;

    background:#ffffff;

}


/* ==========================================
   HEADER
========================================== */

.company{

    text-align:center;

    padding-bottom:5mm;

    border-bottom:2px solid #ffcc00;

}


.logo{

    width:55px;

    height:55px;

    object-fit:contain;

    display:block;

    margin:0 auto 3mm;

}


.company h2{

    margin:0;

    color:#c8102e;

    font-size:20px;

    font-weight:900;

}


.company p{

    margin:2px 0;

    font-size:9px;

    font-weight:700;

}


.company small{

    font-size:8px;

    font-weight:800;

}


/* ==========================================
   INFO
========================================== */

.info{

    display:grid;

    grid-template-columns:
        1fr 1fr;

    gap:2mm;

    margin-top:4mm;

    padding:4mm;

    background:#fff8dc;

    border:1px solid #ffcc00;

    border-radius:5px;

    font-size:9px;

}


.info div{

    padding:1mm;

}


.info b{

    font-weight:900;

}


/* ==========================================
   SECTION TITLE
========================================== */

.subtitle{

    margin-top:4mm;

    padding:2mm 3mm;

    background:#c8102e;

    color:#ffffff;

    font-size:9px;

    font-weight:900;

}


/* ==========================================
   TABLE
========================================== */

table{

    width:100%;

    margin-top:2mm;

    border-collapse:collapse;

}


th,
td{

    border:1px solid #888;

    padding:2.5mm;

    font-size:8.5px;

}


th{

    background:#ffcc00;

    color:#111111;

    font-weight:900;

}


td:last-child{

    text-align:right;

}


.total td{

    font-weight:900;

    background:#f1f1f1;

}


/* ==========================================
   NET
========================================== */

.net{

    margin-top:5mm;

    padding:5mm;

    display:flex;

    justify-content:space-between;

    align-items:center;

    background:#008f4d;

    color:#ffffff;

    border-radius:5px;

    font-size:12px;

    font-weight:900;

}


.net strong{

    font-size:15px;

}


/* ==========================================
   SIGNATURE
========================================== */

.signature{

    display:flex;

    justify-content:space-between;

    margin-top:15mm;

    font-size:8px;

}


.signature-box{

    width:35%;

    text-align:center;

}


.line{

    border-top:1px solid #000;

    margin-bottom:2mm;

}


/* ==========================================
   PRINT
========================================== */

@media print{

    body{

        padding:0;

    }


    .payslip{

        border:2px solid #ffcc00;

    }

}

</style>

</head>


<body>


<div class="payslip">


<!-- COMPANY -->

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


<small>
AUTO PAYROLL
</small>


</div>


<!-- EMPLOYEE INFO -->

<div class="info">


<div>

<b>
Employee ID:
</b>

${escapeHTML(
    pay.employeeId ||
    "-"
)}

</div>


<div>

<b>
Employee:
</b>

${escapeHTML(
    pay.employeeName ||
    "-"
)}

</div>


<div>

<b>
Payroll Date:
</b>

${escapeHTML(
    pay.date ||
    "-"
)}

</div>


<div>

<b>
Hourly Rate:
</b>

₱ ${money(
    pay.hourlyRate
)}

</div>


</div>


<!-- WORKING HOURS -->

<div class="subtitle">

WORKING HOURS

</div>


<table>

<tr>

<th>
DESCRIPTION
</th>

<th>
HOURS
</th>

</tr>


<tr>

<td>
Regular Hours
</td>

<td>
${number(
    pay.regularHours
).toFixed(2)}

</td>

</tr>


<tr>

<td>
Overtime Hours
</td>

<td>
${number(
    pay.overtimeHours
).toFixed(2)}

</td>

</tr>


<tr>

<td>
Holiday Type
</td>

<td>
${escapeHTML(
    holidayType
)}

</td>

</tr>


<tr>

<td>
Holiday Hours
</td>

<td>
${number(
    pay.holidayHours
).toFixed(2)}

</td>

</tr>


<tr>

<td>
Night Differential Hours
</td>

<td>
${number(
    pay.nightHours
).toFixed(2)}

</td>

</tr>


<tr>

<td>
Night Differential Rate
</td>

<td>
${number(
    pay.nightRate
).toFixed(2)
}%

</td>

</tr>

</table>


<!-- EARNINGS -->

<div class="subtitle">

EARNINGS

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
Regular Pay
</td>

<td>
₱ ${money(
    pay.regularPay
)}

</td>

</tr>


<tr>

<td>
Overtime Pay
</td>

<td>
₱ ${money(
    pay.overtimePay
)}

</td>

</tr>


<tr>

<td>
Holiday Pay
</td>

<td>
₱ ${money(
    pay.holidayPay
)}

</td>

</tr>


<tr>

<td>
Night Differential
</td>

<td>
₱ ${money(
    pay.nightPay
)}

</td>

</tr>


<tr class="total">

<td>
TOTAL GROSS
</td>

<td>
₱ ${money(
    pay.gross
)}

</td>

</tr>

</table>


<!-- DEDUCTIONS -->

<div class="subtitle">

DEDUCTIONS

</div>


<table>

<tr>

<th>
DEDUCTION
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
₱ ${money(
    pay.sss
)}

</td>

</tr>


<tr>

<td>
PhilHealth
</td>

<td>
₱ ${money(
    pay.philhealth
)}

</td>

</tr>


<tr>

<td>
Pag-IBIG
</td>

<td>
₱ ${money(
    pay.pagibig
)}

</td>

</tr>


<tr>

<td>
Health Card
</td>

<td>
₱ ${money(
    pay.healthcard
)}

</td>

</tr>


<tr>

<td>
Other Deduction
</td>

<td>
₱ ${money(
    pay.others
)}

</td>

</tr>


<tr class="total">

<td>
TOTAL DEDUCTION
</td>

<td>
₱ ${money(
    pay.deductions
)}

</td>

</tr>

</table>


<!-- NET -->

<div class="net">

<span>
NET PAY
</span>


<strong>
₱ ${money(
    pay.net
)}
</strong>

</div>


<!-- SIGNATURE -->

<div class="signature">


<div class="signature-box">

<div class="line"></div>

HR

</div>


<div class="signature-box">

<div class="line"></div>

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
   AUTH CHECK
========================================== */

onAuthStateChanged(

    auth,

    async function(user){

        /*
         * Require Firebase login
         */

        if(!user){

            window.location.replace(
                "login.html"
            );

            return;

        }


        /*
         * Employee role only
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

            /*
             * LOAD AUTO PAYROLL PAYSLIP
             */

            await loadEmployeePayroll();


            console.log(
                "PAPPRITO Employee Portal Ready"
            );


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
