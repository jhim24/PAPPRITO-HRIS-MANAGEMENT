/* ==========================================
   PAPPRITO HRIS
   PAYSLIP MANAGEMENT
   PRINT ALL BY SELECTED MONTH
========================================== */


/* ==========================================
   FIREBASE
========================================== */

import {

    initializeApp

}

from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


import {

    getFirestore,

    collection,

    getDocs,

    deleteDoc,

    doc

}

from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* ==========================================
   FIREBASE CONFIG
========================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyAehoq0teVYHiJ4bkKOgBqIgJZrQpce3k8",

    authDomain:
        "hr-system-38fc3.firebaseapp.com",

    projectId:
        "hr-system-38fc3",

    storageBucket:
        "hr-system-38fc3.firebasestorage.app",

    messagingSenderId:
        "615471610834",

    appId:
        "1:615471610834:web:a0d671d4e3f4c1b57b660b"

};


const app =
    initializeApp(
        firebaseConfig
    );


const db =
    getFirestore(
        app
    );


/* ==========================================
   ELEMENTS
========================================== */

const searchEmployee =
    document.getElementById(
        "searchEmployee"
    );


const filterDate =
    document.getElementById(
        "filterDate"
    );


const adminPayslipBody =
    document.getElementById(
        "adminPayslipBody"
    );


const totalRecords =
    document.getElementById(
        "totalRecords"
    );


const totalGross =
    document.getElementById(
        "totalGross"
    );


const totalNet =
    document.getElementById(
        "totalNet"
    );


const employeeSection =
    document.getElementById(
        "employeeSection"
    );


const payslipArea =
    document.getElementById(
        "payslipArea"
    );


/* ==========================================
   GLOBAL
========================================== */

let payrollRecords = [];

let filteredRecords = [];

let currentPayslip = null;


/* ==========================================
   HELPERS
========================================== */

function text(value){

    return String(
        value ?? ""
    ).trim();

}


function num(value){

    const n =
        Number(
            value || 0
        );


    return Number.isFinite(n)
        ? n
        : 0;

}


function money(value){

    return num(
        value
    ).toLocaleString(
        "en-PH",
        {

            minimumFractionDigits:2,

            maximumFractionDigits:2

        }
    );

}


function escapeHTML(value){

    return String(
        value ?? ""
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


function escapeJS(value){

    return String(
        value ?? ""
    )

    .replace(
        /\\/g,
        "\\\\"
    )

    .replace(
        /'/g,
        "\\'"
    )

    .replace(
        /\r/g,
        "\\r"
    )

    .replace(
        /\n/g,
        "\\n"
    );

}


/* ==========================================
   PAYROLL FIELD COMPATIBILITY
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
   LOAD PAYROLL
========================================== */

async function loadPayslips(){

    if(!adminPayslipBody){

        return;

    }


    adminPayslipBody.innerHTML = `

<tr>

<td
    colspan="8"
    style="
        text-align:center;
        padding:25px;
    ">

    LOADING PAYSLIPS...

</td>

</tr>

`;


    try{

        payrollRecords = [];


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "payroll"
                )
            );


        snapshot.forEach(
            docSnap => {

                payrollRecords.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        payrollRecords.sort(
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


        filteredRecords =
            [...payrollRecords];


        renderPayslips(
            filteredRecords
        );


    }catch(error){

        console.error(
            "Load Payslip Error:",
            error
        );


        adminPayslipBody.innerHTML = `

<tr>

<td
    colspan="8"
    style="
        text-align:center;
        padding:25px;
        color:#c8102e;
    ">

    ERROR LOADING PAYSLIPS

</td>

</tr>

`;


        alert(
            "Unable to load payslips.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   RENDER PAYSLIPS
========================================== */

function renderPayslips(
    records
){

    if(!adminPayslipBody){

        return;

    }


    adminPayslipBody.innerHTML =
        "";


    if(
        !records ||
        records.length === 0
    ){

        adminPayslipBody.innerHTML = `

<tr>

<td
    colspan="8"
    style="
        text-align:center;
        padding:25px;
    ">

    NO PAYSLIPS FOUND

</td>

</tr>

`;


        updateSummary(
            []
        );

        return;

    }


    records.forEach(
        pay => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

<td>

${escapeHTML(
    pay.empid || "-"
)}

</td>


<td>

${escapeHTML(
    pay.employee || "-"
)}

</td>


<td>

${escapeHTML(
    pay.date || "-"
)}

</td>


<td>

₱ ${money(
    pay.basicpay
)}

</td>


<td>

₱ ${money(
    pay.gross
)}

</td>


<td>

₱ ${money(
    pay.deductions
)}

</td>


<td>

<strong>

₱ ${money(
    pay.net
)}

</strong>

</td>


<td>

<button
    type="button"
    class="btn view-btn"
    onclick="
        viewPayslip(
            '${escapeJS(pay.id)}'
        )
    ">

    VIEW

</button>


<button
    type="button"
    class="btn print-btn"
    onclick="
        printSinglePayslip(
            '${escapeJS(pay.id)}'
        )
    ">

    PRINT

</button>


<button
    type="button"
    class="btn close-btn"
    onclick="
        deletePayslip(
            '${escapeJS(pay.id)}'
        )
    ">

    DELETE

</button>

</td>

`;


            adminPayslipBody.appendChild(
                row
            );

        }
    );


    updateSummary(
        records
    );

}


/* ==========================================
   SUMMARY
========================================== */

function updateSummary(
    records
){

    const gross =
        records.reduce(
            (
                total,
                pay
            ) => {

                return total +
                    num(
                        pay.gross
                    );

            },
            0
        );


    const net =
        records.reduce(
            (
                total,
                pay
            ) => {

                return total +
                    num(
                        pay.net
                    );

            },
            0
        );


    if(totalRecords){

        totalRecords.innerText =
            records.length;

    }


    if(totalGross){

        totalGross.innerText =
            money(
                gross
            );

    }


    if(totalNet){

        totalNet.innerText =
            money(
                net
            );

    }

}


/* ==========================================
   APPLY FILTER
========================================== */

window.applyFilter =
function(){

    const search =
        text(
            searchEmployee?.value
        )
        .toLowerCase();


    const selectedDate =
        text(
            filterDate?.value
        );


    filteredRecords =
        payrollRecords.filter(
            pay => {

                const employeeId =
                    text(
                        pay.empid
                    )
                    .toLowerCase();


                const employee =
                    text(
                        pay.employee
                    )
                    .toLowerCase();


                const payrollDate =
                    text(
                        pay.date
                    );


                /*
                 * SEARCH EMPLOYEE
                 */

                const matchesEmployee =

                    !search

                    ||

                    employeeId.includes(
                        search
                    )

                    ||

                    employee.includes(
                        search
                    );


                /*
                 * DATE FILTER
                 *
                 * The selected date is
                 * matched exactly here.
                 */

                const matchesDate =

                    !selectedDate

                    ||

                    payrollDate ===
                    selectedDate;


                return (
                    matchesEmployee &&
                    matchesDate
                );

            }
        );


    renderPayslips(
        filteredRecords
    );

};


/* ==========================================
   SHOW ALL
========================================== */

window.showAllPayslips =
function(){

    if(searchEmployee){

        searchEmployee.value =
            "";

    }


    if(filterDate){

        filterDate.value =
            "";

    }


    filteredRecords =
        [...payrollRecords];


    renderPayslips(
        filteredRecords
    );

};


/* ==========================================
   VIEW PAYSLIP
========================================== */

window.viewPayslip =
function(id){

    const pay =
        payrollRecords.find(
            item =>
                item.id === id
        );


    if(!pay){

        alert(
            "Payslip not found."
        );

        return;

    }


    currentPayslip =
        pay;


    displayPayslip(
        pay
    );


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

function displayPayslip(
    pay
){

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


    const set =
    (
        id,
        value
    ) => {

        const element =
            document.getElementById(
                id
            );


        if(element){

            element.innerText =
                value;

        }

    };


    set(
        "payEmpId",
        pay.empid || "-"
    );


    set(
        "payEmp",
        pay.employee || "-"
    );


    set(
        "payDate",
        pay.date || "-"
    );


    set(
        "payDailyRate",
        money(
            pay.dailyrate
        )
    );


    set(
        "payTotalDays",
        num(
            pay.totaldays
        )
    );


    set(
        "payBasic",
        money(
            pay.basicpay
        )
    );


    set(
        "payOvertime",
        money(
            pay.overtime
        )
    );


    set(
        "payHoliday",
        money(
            holiday
        )
    );


    set(
        "paySick",
        money(
            pay.sickleave
        )
    );


    set(
        "payVacation",
        money(
            pay.vacationleave
        )
    );


    set(
        "payBirthday",
        money(
            pay.birthdayleave
        )
    );


    set(
        "payMaternity",
        money(
            pay.maternityleave
        )
    );


    set(
        "payPaternity",
        money(
            pay.paternityleave
        )
    );


    set(
        "payAllowance",
        money(
            pay.allowance
        )
    );


    set(
        "payGross",
        money(
            pay.gross
        )
    );


    set(
        "paySSS",
        money(
            pay.sss
        )
    );


    set(
        "payPhilhealth",
        money(
            pay.philhealth
        )
    );


    set(
        "payPagibig",
        money(
            pay.pagibig
        )
    );


    set(
        "payHealth",
        money(
            health
        )
    );


    set(
        "payOther",
        money(
            other
        )
    );


    set(
        "payDeduction",
        money(
            pay.deductions
        )
    );


    set(
        "payNet",
        money(
            pay.net
        )
    );

}


/* ==========================================
   PRINT SINGLE
========================================== */

window.printSinglePayslip =
function(id){

    const pay =
        payrollRecords.find(
            item =>
                item.id === id
        );


    if(!pay){

        alert(
            "Payslip not found."
        );

        return;

    }


    currentPayslip =
        pay;


    createSinglePrintWindow(
        pay
    );

};


/* ==========================================
   PRINT CURRENT PAYSLIP
========================================== */

window.printPayslip =
function(){

    if(!currentPayslip){

        alert(
            "Please view a payslip first."
        );

        return;

    }


    createSinglePrintWindow(
        currentPayslip
    );

};


/* ==========================================
   SINGLE PRINT WINDOW
========================================== */

function createSinglePrintWindow(
    pay
){

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
            "width=900,height=1100"
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

    padding:10mm;

    background:#fff;

    color:#000;

    font-family:
        Tahoma,
        Arial,
        sans-serif;

}

@page{

    size:A4 portrait;

    margin:8mm;

}

.payslip{

    width:110mm;

    margin:0 auto;

    padding:7mm;

    border:2px solid #ffcc00;

    border-radius:8px;

    background:#fff;

}

.logo{

    display:block;

    width:55px;

    height:55px;

    margin:0 auto 5px;

    object-fit:contain;

}

.company{

    text-align:center;

    border-bottom:2px solid #ffcc00;

    padding-bottom:5px;

}

.company h2{

    margin:2px;

    color:#c8102e;

    font-size:18px;

}

.company p{

    margin:2px;

    font-size:8px;

    font-weight:bold;

}

.info{

    margin-top:6px;

    padding:6px;

    background:#f3f3f3;

    border:1px solid #ccc;

    font-size:8px;

    line-height:1.6;

}

table{

    width:100%;

    margin-top:6px;

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

    color:#111;

}

td:last-child{

    text-align:right;

}

.total-row td{

    background:#fff3b0;

    font-weight:bold;

}

.net{

    margin-top:7px;

    padding:8px;

    background:#168a4a;

    color:#fff;

    font-size:11px;

    font-weight:bold;

    text-align:right;

}

.signature{

    display:flex;

    justify-content:space-between;

    margin-top:25px;

    font-size:7px;

}

.line{

    width:75px;

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
${num(pay.totaldays)}

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

<td>
TOTAL GROSS
</td>

<td>
${money(pay.gross)}
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

<tr class="total-row">

<td>
TOTAL DEDUCTION
</td>

<td>
${money(pay.deductions)}
</td>

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
   PRINT ALL PAYSLIPS
   SELECTED MONTH ONLY
========================================== */

window.printAllPayslips =
async function(){

    /*
     * IMPORTANT:
     *
     * filterDate is used as the
     * selected month reference.
     *
     * Example:
     *
     * 2026-07-15
     *
     * means:
     *
     * JULY 2026 ONLY
     *
     */

    const selectedDate =
        text(
            filterDate?.value
        );


    /* ======================================
       REQUIRE DATE
    ====================================== */

    if(!selectedDate){

        alert(

            "Please select a date/month first.\n\n" +

            "Example:\n" +

            "Select any date in July 2026 to print " +

            "July 2026 payslips only."

        );

        return;

    }


    /*
     * Get YYYY-MM
     */

    const selectedMonth =
        selectedDate.substring(
            0,
            7
        );


    /*
     * ======================================
     * FILTER MONTH ONLY
     * ======================================
     */

    const monthRecords =
        payrollRecords.filter(
            pay => {

                const payrollDate =
                    text(
                        pay.date
                    );


                if(!payrollDate){

                    return false;

                }


                return (

                    payrollDate.substring(
                        0,
                        7
                    )

                    ===

                    selectedMonth

                );

            }
        );


    /*
     * ======================================
     * NO RECORDS
     * ======================================
     */

    if(
        monthRecords.length === 0
    ){

        alert(

            "No payroll records found for " +

            selectedMonth +

            "."

        );

        return;

    }


    /*
     * ======================================
     * SORT EMPLOYEES
     * ======================================
     */

    monthRecords.sort(
        (a,b) => {

            return text(
                a.employee
            ).localeCompare(
                text(
                    b.employee
                )
            );

        }
    );


    /*
     * ======================================
     * CREATE PRINT WINDOW
     * ======================================
     */

    createPrintAllWindow(
        monthRecords,
        selectedMonth
    );

};


/* ==========================================
   PRINT ALL WINDOW
   4 PAYSLIPS PER A4
========================================== */

function createPrintAllWindow(
    records,
    selectedMonth
){

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1000,height=1200"
        );


    if(!printWindow){

        alert(
            "Please allow pop-ups for printing."
        );

        return;

    }


    /*
     * ======================================
     * CREATE PAYSLIPS
     * ======================================
     */

    let payslipsHTML =
        "";


    records.forEach(
        pay => {

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


            payslipsHTML += `

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
${num(pay.totaldays)}

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
${money(pay.basicpay)}
</td>

</tr>

<tr>

<td>
Overtime
</td>

<td>
${money(pay.overtime)}
</td>

</tr>

<tr>

<td>
Holiday Pay
</td>

<td>
${money(holiday)}
</td>

</tr>

<tr>

<td>
Sick Leave
</td>

<td>
${money(pay.sickleave)}
</td>

</tr>

<tr>

<td>
Vacation Leave
</td>

<td>
${money(pay.vacationleave)}
</td>

</tr>

<tr>

<td>
Birthday Leave
</td>

<td>
${money(pay.birthdayleave)}
</td>

</tr>

<tr>

<td>
Maternity Leave
</td>

<td>
${money(pay.maternityleave)}
</td>

</tr>

<tr>

<td>
Paternity Leave
</td>

<td>
${money(pay.paternityleave)}
</td>

</tr>

<tr>

<td>
Allowance
</td>

<td>
${money(pay.allowance)}
</td>

</tr>

<tr class="total-row">

<td>
TOTAL GROSS
</td>

<td>
${money(pay.gross)}
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
${money(pay.sss)}
</td>

</tr>

<tr>

<td>
PhilHealth
</td>

<td>
${money(pay.philhealth)}
</td>

</tr>

<tr>

<td>
Pag-IBIG
</td>

<td>
${money(pay.pagibig)}
</td>

</tr>

<tr>

<td>
Health Card
</td>

<td>
${money(health)}
</td>

</tr>

<tr>

<td>
Others
</td>

<td>
${money(other)}
</td>

</tr>

<tr class="total-row">

<td>
TOTAL DEDUCTION
</td>

<td>
${money(pay.deductions)}
</td>

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

`;

        }
    );


    /*
     * ======================================
     * PRINT HTML
     * ======================================
     */

    printWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>

PAPPRITO Payslips -
${escapeHTML(selectedMonth)}

</title>


<style>

*{

    box-sizing:border-box;

}


html,
body{

    margin:0;

    padding:0;

}


body{

    background:#fff;

    color:#000;

    font-family:
        Tahoma,
        Arial,
        sans-serif;

}


/* ==========================================
   A4
========================================== */

@page{

    size:A4 portrait;

    margin:5mm;

}


/* ==========================================
   PRINT PAGE
   4 PAYSLIPS
========================================== */

.print-page{

    width:100%;

    height:287mm;

    display:grid;

    grid-template-columns:
        1fr 1fr;

    grid-template-rows:
        1fr 1fr;

    gap:3mm;

    page-break-after:always;

    overflow:hidden;

}


/* ==========================================
   PAYSLIP
========================================== */

.payslip{

    width:100%;

    height:141mm;

    padding:4mm;

    border:
        1.5px solid
        #ffcc00;

    border-radius:5px;

    background:#fff;

    overflow:hidden;

    page-break-inside:avoid;

}


/* ==========================================
   LOGO
========================================== */

.logo{

    display:block;

    width:32px;

    height:32px;

    object-fit:contain;

    margin:
        0 auto 2px;

}


/* ==========================================
   COMPANY
========================================== */

.company{

    text-align:center;

    border-bottom:
        1px solid
        #ffcc00;

    padding-bottom:2px;

}


.company h2{

    margin:0;

    color:#c8102e;

    font-size:11px;

    line-height:1.1;

}


.company p{

    margin:1px 0 0;

    font-size:5px;

    font-weight:bold;

}


/* ==========================================
   INFO
========================================== */

.info{

    margin-top:2px;

    padding:3px;

    background:#f3f3f3;

    border:
        1px solid
        #ccc;

    font-size:5.5px;

    line-height:1.35;

}


/* ==========================================
   TABLE
========================================== */

table{

    width:100%;

    margin-top:2px;

    border-collapse:collapse;

}


th,
td{

    border:
        1px solid
        #999;

    padding:
        1.5px 2px;

    font-size:5.5px;

    line-height:1.15;

}


th{

    background:#ffcc00;

    color:#111;

    font-weight:bold;

}


td:last-child{

    text-align:right;

}


.total-row td{

    background:#fff3b0;

    font-weight:bold;

}


/* ==========================================
   NET
========================================== */

.net{

    margin-top:3px;

    padding:4px;

    background:#168a4a;

    color:#fff;

    font-size:7px;

    font-weight:bold;

    text-align:right;

}


/* ==========================================
   SIGNATURE
========================================== */

.signature{

    display:flex;

    justify-content:space-between;

    margin-top:8px;

    padding:0 8px;

    font-size:5px;

}


.line{

    width:42px;

    padding-top:2px;

    border-top:
        1px solid
        #000;

    text-align:center;

}


/* ==========================================
   PAGE BREAK
========================================== */

@media print{

    .print-page{

        page-break-after:always;

    }

}

</style>

</head>


<body>


<div class="print-page">

${payslipsHTML}

</div>


<script>

window.onload = function(){

    window.focus();

    setTimeout(
        function(){

            window.print();

        },
        800
    );

};

window.onafterprint = function(){

    setTimeout(
        function(){

            window.close();

        },
        300
    );

};

</script>


</body>

</html>

`);


    printWindow.document.close();

}


/* ==========================================
   DELETE PAYSLIP
========================================== */

window.deletePayslip =
async function(id){

    const pay =
        payrollRecords.find(
            item =>
                item.id === id
        );


    if(!pay){

        alert(
            "Payslip not found."
        );

        return;

    }


    const confirmed =
        confirm(

            "Delete this payslip?\n\n" +

            (
                pay.employee ||
                "-"
            )

            +

            "\n"

            +

            (
                pay.date ||
                "-"
            )

        );


    if(!confirmed){

        return;

    }


    try{

        await deleteDoc(

            doc(
                db,
                "payroll",
                id
            )

        );


        alert(
            "Payslip deleted successfully."
        );


        await loadPayslips();


    }catch(error){

        console.error(
            "Delete Payslip Error:",
            error
        );


        alert(
            "Unable to delete payslip.\n\n" +
            error.message
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


    currentPayslip =
        null;

};


/* ==========================================
   HEADER ACTION
========================================== */

window.headerAction =
function(){

    window.location.href =
        "dashboard.html";

};


/* ==========================================
   BACK TO DASHBOARD
========================================== */

window.backToDashboard =
function(){

    window.location.href =
        "dashboard.html";

};


/* ==========================================
   PRINT PAYSLIP
========================================== */

window.printPayslip =
function(){

    if(!currentPayslip){

        alert(
            "Please view a payslip first."
        );

        return;

    }


    createSinglePrintWindow(
        currentPayslip
    );

};


/* ==========================================
   SEARCH ENTER
========================================== */

if(searchEmployee){

    searchEmployee.addEventListener(
        "keydown",
        event => {

            if(
                event.key ===
                "Enter"
            ){

                window.applyFilter();

            }

        }
    );

}


/* ==========================================
   FILTER DATE CHANGE
========================================== */

if(filterDate){

    filterDate.addEventListener(
        "change",
        () => {

            /*
             * Only refresh the admin table.
             *
             * PRINT ALL will independently
             * use the selected month.
             */

            window.applyFilter();

        }
    );

}


/* ==========================================
   INITIALIZE
========================================== */

async function initialize(){

    await loadPayslips();

}


initialize();
