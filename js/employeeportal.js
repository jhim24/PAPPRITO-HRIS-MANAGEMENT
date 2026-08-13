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
    getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";


/* ==========================================
   GLOBAL
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

const payslipSelect =
    document.getElementById("payslipSelect");

const payslipArea =
    document.getElementById("payslipArea");

const payslipMessage =
    document.getElementById("payslipMessage");


/* ==========================================
   PAYSLIP ELEMENTS
========================================== */

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


function rawMoney(value){

    return number(value)
        .toFixed(2);

}


/* ==========================================
   COMPATIBLE FIELD
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
   FULL EMPLOYEE NAME
========================================== */

function getFullName(emp){

    return [

        emp.firstname || "",

        emp.middlename || "",

        emp.lastname || ""

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
   FIND EMPLOYEE
========================================== */

async function findCurrentEmployee(){

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

            const emp =
                docSnap.data();


            /*
             * First priority:
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

                    ...emp

                };

                return;

            }


            /*
             * Second priority:
             * Employee ID
             */

            const empId =
                text(
                    emp.employeeid
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

                    ...emp

                };

            }

        }
    );


    return found;

}


/* ==========================================
   LOAD EMPLOYEE
========================================== */

async function loadEmployee(){

    currentEmployee =
        await findCurrentEmployee();


    if(
        !currentEmployee
    ){

        throw new Error(
            "EMPLOYEE_NOT_FOUND"
        );

    }


    /*
     * Verify portal access
     */

    if(
        currentEmployee.portalEnabled !==
        true
    ){

        throw new Error(
            "PORTAL_NOT_ENABLED"
        );

    }


    /*
     * Verify employee status
     */

    const status =
        text(
            currentEmployee.status ||
            "Active"
        )
        .toLowerCase();


    if(
        status !==
        "active"
    ){

        throw new Error(
            "EMPLOYEE_INACTIVE"
        );

    }


    const fullName =
        getFullName(
            currentEmployee
        );


    const empId =
        text(
            currentEmployee.employeeid
        );


    /*
     * Welcome
     */

    if(
        employeeName
    ){

        employeeName.innerText =
            fullName ||
            empId ||
            "Employee";

    }


    if(
        employeeId
    ){

        employeeId.innerText =
            "Employee ID: " +
            empId;

    }


    /*
     * Information
     */

    if(
        infoEmployeeId
    ){

        infoEmployeeId.innerText =
            empId || "-";

    }


    if(
        infoName
    ){

        infoName.innerText =
            fullName || "-";

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
   LOAD EMPLOYEE PAYROLL
========================================== */

async function loadEmployeePayroll(){

    if(
        !currentEmployee
    ){

        return;

    }


    employeePayroll = [];


    const currentId =
        text(
            currentEmployee.employeeid
        )
        .toUpperCase();


    if(
        !currentId
    ){

        showMessage(
            "Employee ID is missing."
        );

        return;

    }


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "payroll"
                )
            );


        snapshot.forEach(
            docSnap => {

                const pay =
                    docSnap.data();


                /*
                 * IMPORTANT SECURITY LOGIC
                 *
                 * Only payroll with the same
                 * employee ID is accepted.
                 */

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


        populatePayslipList();


    }catch(error){

        console.error(
            "Payroll Load Error:",
            error
        );


        showMessage(
            "Unable to load payslips."
        );

    }

}


/* ==========================================
   POPULATE PAYSLIP SELECT
========================================== */

function populatePayslipList(){

    if(
        !payslipSelect
    ){

        return;

    }


    payslipSelect.innerHTML = `

<option value="">

Select Payroll Period

</option>

`;


    if(
        employeePayroll.length === 0
    ){

        showMessage(
            "No payslip available."
        );

        return;

    }


    employeePayroll.forEach(
        (
            pay,
            index
        ) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                pay.id;


            const date =
                text(
                    pay.date
                );


            option.textContent =

                date

                ?

                "Payroll - " +
                date

                :

                "Payroll Record " +
                (index + 1);


            payslipSelect.appendChild(
                option
            );

        }
    );


    /*
     * Automatically select latest
     */

    if(
        employeePayroll.length > 0
    ){

        payslipSelect.value =
            employeePayroll[0].id;

    }


    showMessage(
        "Select a payroll period to view your payslip."
    );

}


/* ==========================================
   SHOW MESSAGE
========================================== */

function showMessage(
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


/* ==========================================
   HIDE MESSAGE
========================================== */

function hideMessage(){

    if(
        payslipMessage
    ){

        payslipMessage.style.display =
            "none";

    }

}


/* ==========================================
   FIND PAYSLIP BY ID
========================================== */

function findPayslip(
    id
){

    return employeePayroll.find(
        pay =>
            pay.id === id
    );

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


    const id =
        payslipSelect.value;


    if(
        !id
    ){

        showMessage(
            "Please select a payroll period."
        );

        return;

    }


    const pay =
        findPayslip(
            id
        );


    if(
        !pay
    ){

        showMessage(
            "Payslip not found."
        );

        return;

    }


    currentPayslip =
        pay;


    displayPayslip(
        pay
    );


    hideMessage();


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
   PRINT SELECTED PAYSLIP
========================================== */

window.printSelectedPayslip =
function(){

    if(
        !currentPayslip
    ){

        /*
         * If nothing has been viewed yet,
         * automatically use selected record.
         */

        if(
            payslipSelect &&
            payslipSelect.value
        ){

            currentPayslip =
                findPayslip(
                    payslipSelect.value
                );

        }

    }


    if(
        !currentPayslip
    ){

        alert(
            "Please select and view a payslip first."
        );

        return;

    }


    printPayslip(
        currentPayslip
    );

};


/* ==========================================
   PRINT PAYSLIP
========================================== */

function printPayslip(
    pay
){

    /*
     * Extra protection:
     * make sure the payroll belongs
     * to the logged-in employee.
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
            "You are not authorized to print this payslip."
        );

        return;

    }


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

}


td{

    background:#fff;

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

<b>ID:</b>
${escapeHTML(pay.empid)}

<br>

<b>Name:</b>
${escapeHTML(pay.employee)}

<br>

<b>Date:</b>
${escapeHTML(pay.date)}

<br>

<b>Daily Rate:</b>
₱ ${rawMoney(pay.dailyrate)}

<br>

<b>Total Days:</b>
${number(pay.totaldays)}

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
${rawMoney(pay.basicpay)}
</td>

</tr>


<tr>

<td>
Overtime
</td>

<td>
${rawMoney(pay.overtime)}
</td>

</tr>


<tr>

<td>
Holiday Pay
</td>

<td>
${rawMoney(holiday)}
</td>

</tr>


<tr>

<td>
Sick Leave
</td>

<td>
${rawMoney(pay.sickleave)}
</td>

</tr>


<tr>

<td>
Vacation Leave
</td>

<td>
${rawMoney(pay.vacationleave)}
</td>

</tr>


<tr>

<td>
Birthday Leave
</td>

<td>
${rawMoney(pay.birthdayleave)}
</td>

</tr>


<tr>

<td>
Maternity Leave
</td>

<td>
${rawMoney(pay.maternityleave)}
</td>

</tr>


<tr>

<td>
Paternity Leave
</td>

<td>
${rawMoney(pay.paternityleave)}
</td>

</tr>


<tr>

<td>
Allowance
</td>

<td>
${rawMoney(pay.allowance)}
</td>

</tr>


<tr>

<td>
<b>TOTAL GROSS</b>
</td>

<td>
<b>${rawMoney(pay.gross)}</b>
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
${rawMoney(pay.sss)}
</td>

</tr>


<tr>

<td>
PhilHealth
</td>

<td>
${rawMoney(pay.philhealth)}
</td>

</tr>


<tr>

<td>
Pag-IBIG
</td>

<td>
${rawMoney(pay.pagibig)}
</td>

</tr>


<tr>

<td>
Health Card
</td>

<td>
${rawMoney(health)}
</td>

</tr>


<tr>

<td>
Others
</td>

<td>
${rawMoney(other)}
</td>

</tr>


<tr>

<td>
<b>TOTAL DEDUCTION</b>
</td>

<td>
<b>${rawMoney(pay.deductions)}</b>
</td>

</tr>

</table>


<div class="net">

NET PAY :

₱ ${rawMoney(pay.net)}

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
        500
    );

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(
value
){

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


    localStorage.removeItem(
        "employeePortalEmail"
    );


    window.location.replace(
        "login.html"
    );

};


/* ==========================================
   INITIALIZE
========================================== */

async function initializePortal(){

    try{

        /*
         * Make sure user is logged in
         */

        if(
            !auth.currentUser
        ){

            /*
             * Firebase may still be restoring
             * the session, so this is handled
             * by onAuthStateChanged below.
             */

            return;

        }


        /*
         * Must be employee role
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


        await loadEmployee();

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


        else if(
            error.message ===
            "PORTAL_NOT_ENABLED"
        ){

            alert(
                "Employee Portal access is not enabled."
            );

        }


        else if(
            error.message ===
            "EMPLOYEE_INACTIVE"
        ){

            alert(
                "Your employee account is inactive."
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


/* ==========================================
   AUTH STATE
========================================== */

onAuthStateChanged(

    auth,

    async function(user){

        if(
            !user
        ){

            window.location.replace(
                "login.html"
            );

            return;

        }


        await initializePortal();

    }

);
