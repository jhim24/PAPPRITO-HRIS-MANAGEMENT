/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE PORTAL JS
   VERSION 2
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

const payDailyRate =
    document.getElementById("payDailyRate");

const payTotalDays =
    document.getElementById("payTotalDays");

const payBasic =
    document.getElementById("payBasic");

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

const payMaternity =
    document.getElementById("payMaternity");

const payPaternity =
    document.getElementById("payPaternity");

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
        .toFixed(2);

}


function escapeHTML(value){

    return text(value)

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

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

    .filter(Boolean)

    .join(" ")

    .replace(/\s+/g," ")

    .trim();

}


/* ==========================================
   PAYROLL COMPATIBILITY
========================================== */

function payrollField(
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
     * IF DOCUMENT ID DID NOT MATCH,
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

    requestBody.innerHTML = "";


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


    /*
     * REQUEST TYPES
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

        requestType.value = "";

    }


    if(requestDate){

        requestDate.value = "";

    }


    if(requestDays){

        requestDays.value = "";

    }


    if(requestReason){

        requestReason.value = "";

    }

};


/* ==========================================
   LOAD PAYROLL
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


        employeePayroll.sort(
            (a,b) => {

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
   POPULATE PAYSLIP
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


    payslipSelect.value =
        employeePayroll[0].id;

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

                    behavior:"smooth",

                    block:"center"

                });

            },
            100
        );

    }

};


/* ==========================================
   DISPLAY PAYSLIP
========================================== */

function displayPayslip(pay){

    const holiday =
        payrollField(
            pay,
            "holiday",
            "holidaypay"
        );


    const health =
        payrollField(
            pay,
            "healthcard",
            "health"
        );


    const other =
        payrollField(
            pay,
            "otherdeduction",
            "other"
        );


    if(payEmpId){

        payEmpId.innerText =
            pay.empid || "-";

    }


    if(payEmp){

        payEmp.innerText =
            pay.employee || "-";

    }


    if(payDate){

        payDate.innerText =
            pay.date || "-";

    }


    if(payDailyRate){

        payDailyRate.innerText =
            money(
                pay.dailyrate
            );

    }


    if(payTotalDays){

        payTotalDays.innerText =
            number(
                pay.totaldays
            );

    }


    if(payBasic){

        payBasic.innerText =
            money(
                pay.basicpay
            );

    }


    if(payOvertime){

        payOvertime.innerText =
            money(
                pay.overtime
            );

    }


    if(payHoliday){

        payHoliday.innerText =
            money(
                holiday
            );

    }


    if(paySick){

        paySick.innerText =
            money(
                pay.sickleave
            );

    }


    if(payVacation){

        payVacation.innerText =
            money(
                pay.vacationleave
            );

    }


    if(payBirthday){

        payBirthday.innerText =
            money(
                pay.birthdayleave
            );

    }


    if(payMaternity){

        payMaternity.innerText =
            money(
                pay.maternityleave
            );

    }


    if(payPaternity){

        payPaternity.innerText =
            money(
                pay.paternityleave
            );

    }


    if(payAllowance){

        payAllowance.innerText =
            money(
                pay.allowance
            );

    }


    if(payGross){

        payGross.innerText =
            money(
                pay.gross
            );

    }


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
                health
            );

    }


    if(payOther){

        payOther.innerText =
            money(
                other
            );

    }


    if(payDeduction){

        payDeduction.innerText =
            money(
                pay.deductions
            );

    }


    if(payNet){

        payNet.innerText =
            money(
                pay.net
            );

    }

}


/* ==========================================
   PAYSLIP MESSAGE
========================================== */

function showPayslipMessage(message){

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
   PRINT PAYSLIP
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
========================================== */

function createPrintWindow(pay){

    const holiday =
        payrollField(
            pay,
            "holiday",
            "holidaypay"
        );


    const health =
        payrollField(
            pay,
            "healthcard",
            "health"
        );


    const other =
        payrollField(
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


    if(!printWindow){

        alert(
            "Please allow pop-ups for printing."
        );

        return;

    }


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

body{

    margin:0;

    padding:10px;

    background:#fff;

    color:#000;

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

    margin:auto;

    padding:8px;

    border:2px solid #ffcc00;

    border-radius:9px;

    background:#f9f9f9;

}

.logo{

    display:block;

    width:60px;

    height:60px;

    margin:0 auto 5px;

    object-fit:cover;

    border-radius:50%;

    border:2px solid #ffcc00;

    padding:3px;

}

.company{

    text-align:center;

    padding-bottom:5px;

    border-bottom:2px solid #ffcc00;

}

.company h2{

    margin:2px;

    color:#cc0000;

    font-size:18px;

}

.company p{

    margin:2px;

    font-size:8px;

    font-weight:bold;

}

.info{

    margin-top:5px;

    padding:5px;

    background:#fff8dc;

    border:1px solid #ffcc00;

    font-size:8px;

    line-height:1.5;

}

table{

    width:100%;

    margin-top:5px;

    border-collapse:collapse;

}

th,
td{

    border:1px solid #999;

    padding:4px;

    font-size:8px;

}

th{

    background:#ffcc00;

}

td{

    background:#fff;

}

td:last-child{

    text-align:right;

}

.net{

    margin-top:6px;

    padding:7px;

    background:#008000;

    color:#fff;

    font-size:10px;

    font-weight:bold;

    text-align:right;

}

.signature{

    display:flex;

    justify-content:space-between;

    margin-top:18px;

    font-size:7px;

}

.line{

    width:70px;

    padding-top:3px;

    border-top:1px solid #000;

    text-align:center;

}

</style>

</head>

<body>

<div class="payslip">

<img
src="../assets/images/logo.png"
class="logo"
alt="PAPPRITO">

<div class="company">

<h2>
PAPPRITO
</h2>

<p>
OFFICIAL EMPLOYEE PAYSLIP
</p>

</div>

<div class="info">

<b>ID:</b>
${escapeHTML(pay.empid || "-")}

<br>

<b>Name:</b>
${escapeHTML(pay.employee || "-")}

<br>

<b>Date:</b>
${escapeHTML(pay.date || "-")}

<br>

<b>Daily Rate:</b>
₱ ${money(pay.dailyrate)}

<br>

<b>Total Days:</b>
${number(pay.totaldays)}

</div>


<table>

<tr>

<th>EARNINGS</th>

<th>AMOUNT</th>

</tr>

<tr>
<td>Basic Pay</td>
<td>${money(pay.basicpay)}</td>
</tr>

<tr>
<td>Overtime</td>
<td>${money(pay.overtime)}</td>
</tr>

<tr>
<td>Holiday Pay</td>
<td>${money(holiday)}</td>
</tr>

<tr>
<td>Sick Leave</td>
<td>${money(pay.sickleave)}</td>
</tr>

<tr>
<td>Vacation Leave</td>
<td>${money(pay.vacationleave)}</td>
</tr>

<tr>
<td>Birthday Leave</td>
<td>${money(pay.birthdayleave)}</td>
</tr>

<tr>
<td>Maternity Leave</td>
<td>${money(pay.maternityleave)}</td>
</tr>

<tr>
<td>Paternity Leave</td>
<td>${money(pay.paternityleave)}</td>
</tr>

<tr>
<td>Allowance</td>
<td>${money(pay.allowance)}</td>
</tr>

<tr class="total-row">
<td><b>TOTAL GROSS</b></td>
<td><b>${money(pay.gross)}</b></td>
</tr>

</table>


<table>

<tr>

<th>DEDUCTIONS</th>

<th>AMOUNT</th>

</tr>

<tr>
<td>SSS</td>
<td>${money(pay.sss)}</td>
</tr>

<tr>
<td>PhilHealth</td>
<td>${money(pay.philhealth)}</td>
</tr>

<tr>
<td>Pag-IBIG</td>
<td>${money(pay.pagibig)}</td>
</tr>

<tr>
<td>Health Card</td>
<td>${money(health)}</td>
</tr>

<tr>
<td>Others</td>
<td>${money(other)}</td>
</tr>

<tr>
<td><b>TOTAL DEDUCTION</b></td>
<td><b>${money(pay.deductions)}</b></td>
</tr>

</table>


<div class="net">

NET PAY:
₱ ${money(pay.net)}

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
