/* ==========================================
   PAPPRITO HRIS
   PAYSLIP JAVASCRIPT
========================================== */

import {
    initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   FIREBASE CONFIG
========================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyAehoq0teVYHiJ4bkKOgBqIgJZrQpce3k",

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
   LOGIN
========================================== */

const loggedInUser =
    String(
        localStorage.getItem(
            "loggedInUser"
        ) || ""
    ).trim();


const userRole =
    String(
        localStorage.getItem(
            "userRole"
        ) || ""
    )
    .trim()
    .toLowerCase();


/* ==========================================
   GLOBAL DATA
========================================== */

let currentEmployee = null;

let currentPayroll = null;

let allPayroll = [];

let filteredPayroll = [];

let editId = null;

let attendanceEditId = null;


/* ==========================================
   ELEMENTS
========================================== */

const pageTitle =
    document.getElementById(
        "pageTitle"
    );

const adminControls =
    document.getElementById(
        "adminControls"
    );

const adminSummary =
    document.getElementById(
        "adminSummary"
    );

const adminTableWrapper =
    document.getElementById(
        "adminTableWrapper"
    );

const adminPayslipBody =
    document.getElementById(
        "adminPayslipBody"
    );

const employeeSection =
    document.getElementById(
        "employeeSection"
    );

const payslipArea =
    document.getElementById(
        "payslipArea"
    );

const headerActionText =
    document.getElementById(
        "headerActionText"
    );

const headerActionIcon =
    document.getElementById(
        "headerActionIcon"
    );


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

    return num(value).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    );
}


function rawMoney(value){

    return num(value).toFixed(2);
}


function text(value){

    return String(
        value ?? ""
    );
}


function escapeHTML(value){

    return text(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


function escapeJS(value){

    return text(value)
        .replace(/\\/g,"\\\\")
        .replace(/'/g,"\\'")
        .replace(/"/g,'\\"')
        .replace(/\n/g,"\\n")
        .replace(/\r/g,"\\r");
}


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
   HEADER ACTION
========================================== */

/* ==========================================
   BACK TO DASHBOARD
========================================== */

window.headerAction = function(){

    window.location.href = "dashboard.html";

};

/* ==========================================
   INITIALIZE
========================================== */

async function initializePage(){

    if(!loggedInUser){

        window.location.href =
            "login.html";

        return;
    }


    if(
        userRole === "admin" ||
        userRole === "hr" ||
        userRole === "administrator"
    ){

        initializeAdmin();

        return;
    }


    initializeEmployee();

}


/* ==========================================
   ADMIN MODE
========================================== */

function initializeAdmin(){

    pageTitle.innerHTML = `

        <span class="material-icons">
            receipt_long
        </span>

        ADMIN PAYSLIP

    `;


    headerActionText.innerText =
        "BACK TO DASHBOARD";

    headerActionIcon.innerText =
        "dashboard";


    adminControls.style.display =
        "block";

    adminSummary.style.display =
        "grid";

    adminTableWrapper.style.display =
        "block";

    employeeSection.style.display =
        "none";


    loadAdminPayroll();

}


/* ==========================================
   LOAD ADMIN PAYROLL
========================================== */

async function loadAdminPayroll(){

    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "payroll"
                )
            );


        allPayroll = [];


        snapshot.forEach(
            docSnap => {

                allPayroll.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        allPayroll.sort(
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


        filteredPayroll =
            [...allPayroll];


        renderAdminPayroll();


    }catch(error){

        console.error(
            "Admin Payroll Error:",
            error
        );


        adminPayslipBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="
                    padding:30px;
                    color:#ff4444;
                    ">

                    FAILED TO LOAD PAYROLL

                </td>

            </tr>

        `;

    }

}


/* ==========================================
   RENDER ADMIN
========================================== */

function renderAdminPayroll(){

    adminPayslipBody.innerHTML =
        "";


    let grossTotal = 0;

    let netTotal = 0;


    if(
        filteredPayroll.length === 0
    ){

        adminPayslipBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="padding:30px;">

                    NO PAYSLIP FOUND

                </td>

            </tr>

        `;


        document.getElementById(
            "totalRecords"
        ).innerText = "0";


        document.getElementById(
            "totalGross"
        ).innerText = "0.00";


        document.getElementById(
            "totalNet"
        ).innerText = "0.00";


        return;
    }


    filteredPayroll.forEach(
        pay => {

            const gross =
                num(pay.gross);

            const deductions =
                num(pay.deductions);

            const net =
                num(pay.net);


            grossTotal += gross;

            netTotal += net;


            adminPayslipBody.innerHTML += `

                <tr>

                    <td>
                        ${escapeHTML(
                            pay.empid || ""
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            pay.employee || ""
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            pay.date || ""
                        )}
                    </td>

                    <td>
                        ₱ ${money(
                            pay.basicpay
                        )}
                    </td>

                    <td>
                        ₱ ${money(
                            gross
                        )}
                    </td>

                    <td>
                        ₱ ${money(
                            deductions
                        )}
                    </td>

                    <td>
                        <strong>
                            ₱ ${money(
                                net
                            )}
                        </strong>
                    </td>

                    <td>

                        <button
                            class="btn view-btn"
                            onclick="
                                viewAdminPayslip(
                                    '${escapeJS(pay.id)}'
                                )
                            ">

                            <span class="material-icons">
                                visibility
                            </span>

                            VIEW

                        </button>

                    </td>

                </tr>

            `;

        }
    );


    document.getElementById(
        "totalRecords"
    ).innerText =
        filteredPayroll.length;


    document.getElementById(
        "totalGross"
    ).innerText =
        money(grossTotal);


    document.getElementById(
        "totalNet"
    ).innerText =
        money(netTotal);

}


/* ==========================================
   FILTER
========================================== */

window.applyFilter =
function(){

    const search =
        document.getElementById(
            "searchEmployee"
        )
        .value
        .trim()
        .toUpperCase();


    const date =
        document.getElementById(
            "filterDate"
        ).value;


    filteredPayroll =
        allPayroll.filter(
            pay => {

                const id =
                    text(
                        pay.empid
                    )
                    .toUpperCase();


                const name =
                    text(
                        pay.employee
                    )
                    .toUpperCase();


                const searchMatch =
                    !search ||
                    id.includes(search) ||
                    name.includes(search);


                const dateMatch =
                    !date ||
                    pay.date === date;


                return
                    searchMatch &&
                    dateMatch;

            }
        );


    renderAdminPayroll();

};


/* ==========================================
   SHOW ALL
========================================== */

window.showAllPayslips =
function(){

    document.getElementById(
        "searchEmployee"
    ).value = "";


    document.getElementById(
        "filterDate"
    ).value = "";


    filteredPayroll =
        [...allPayroll];


    renderAdminPayroll();

};


/* ==========================================
   ADMIN VIEW
========================================== */

window.viewAdminPayslip =
function(id){

    const pay =
        allPayroll.find(
            item =>
                item.id === id
        );


    if(!pay){

        alert(
            "Payslip not found."
        );

        return;
    }


    currentPayroll =
        pay;


    displayPayslip(
        pay
    );


    payslipArea.style.display =
        "block";


    setTimeout(
        () => {

            payslipArea.scrollIntoView({

                behavior:"smooth",

                block:"center"

            });

        },
        200
    );

};


/* ==========================================
   EMPLOYEE MODE
========================================== */

async function initializeEmployee(){

    pageTitle.innerHTML = `

        <span class="material-icons">
            badge
        </span>

        EMPLOYEE PORTAL

    `;


    headerActionText.innerText =
        "LOGOUT";

    headerActionIcon.innerText =
        "logout";


    adminControls.style.display =
        "none";

    adminSummary.style.display =
        "none";

    adminTableWrapper.style.display =
        "none";

    employeeSection.style.display =
        "block";


    await loadEmployee();

}


/* ==========================================
   LOAD EMPLOYEE
========================================== */

async function loadEmployee(){

    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "employees"
                )
            );


        const loginValue =
            loggedInUser
            .trim()
            .toUpperCase();


        currentEmployee =
            null;


        snapshot.forEach(
            docSnap => {

                const emp =
                    docSnap.data();


                const employeeId =
                    text(
                        emp.employeeid
                    )
                    .trim()
                    .toUpperCase();


                const username =
                    text(
                        emp.username
                    )
                    .trim()
                    .toUpperCase();


                const fullName = [

                    emp.firstname || "",

                    emp.middlename || "",

                    emp.lastname || ""

                ]
                .filter(Boolean)
                .join(" ")
                .replace(/\s+/g," ")
                .trim();


                if(
                    employeeId === loginValue ||
                    username === loginValue
                ){

                    currentEmployee = {

                        id:
                            emp.employeeid || "",

                        name:
                            fullName,

                        username:
                            emp.username || "",

                        firestoreId:
                            docSnap.id

                    };

                }

            }
        );


        if(!currentEmployee){

            alert(
                "Employee account not found in masterlist."
            );

            return;
        }


        document.getElementById(
            "empIdDisplay"
        ).innerText =
            currentEmployee.id;


        document.getElementById(
            "empNameDisplay"
        ).innerText =
            currentEmployee.name;


        await loadRequests();

        await loadAttendanceRequests();


    }catch(error){

        console.error(
            "Employee Error:",
            error
        );


        alert(
            "Failed to load employee.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   EMPLOYEE PAYSLIP
========================================== */

window.loadPayslip =
async function(){

    if(!currentEmployee){

        alert(
            "Employee information is not loaded."
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


        let foundPayroll = [];


        snapshot.forEach(
            docSnap => {

                const pay =
                    docSnap.data();


                const payrollEmployeeId =
                    text(
                        pay.empid
                    )
                    .trim()
                    .toUpperCase();


                const currentId =
                    text(
                        currentEmployee.id
                    )
                    .trim()
                    .toUpperCase();


                if(
                    payrollEmployeeId === currentId
                ){

                    foundPayroll.push({

                        id:
                            docSnap.id,

                        ...pay

                    });

                }

            }
        );


        if(
            foundPayroll.length === 0
        ){

            alert(
                "No Payslip Found."
            );

            return;
        }


        foundPayroll.sort(
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


        currentPayroll =
            foundPayroll[0];


        displayPayslip(
            currentPayroll
        );


        payslipArea.style.display =
            "block";


        setTimeout(
            () => {

                payslipArea.scrollIntoView({

                    behavior:"smooth",

                    block:"center"

                });

            },
            200
        );


    }catch(error){

        console.error(
            "Payslip Error:",
            error
        );


        alert(
            "Failed To Load Payslip."
        );

    }

};


/* ==========================================
   DISPLAY PAYSLIP
========================================== */

function displayPayslip(pay){

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


    payEmpId.innerText =
        pay.empid || "";


    payEmp.innerText =
        pay.employee || "";


    payDate.innerText =
        pay.date || "";


    payDailyRate.innerText =
        rawMoney(
            pay.dailyrate
        );


    payTotalDays.innerText =
        num(
            pay.totaldays
        );


    payBasic.innerText =
        rawMoney(
            pay.basicpay
        );


    payOvertime.innerText =
        rawMoney(
            pay.overtime
        );


    payHoliday.innerText =
        rawMoney(
            holiday
        );


    paySick.innerText =
        rawMoney(
            pay.sickleave
        );


    payVacation.innerText =
        rawMoney(
            pay.vacationleave
        );


    payBirthday.innerText =
        rawMoney(
            pay.birthdayleave
        );


    payMaternity.innerText =
        rawMoney(
            pay.maternityleave
        );


    payPaternity.innerText =
        rawMoney(
            pay.paternityleave
        );


    payAllowance.innerText =
        rawMoney(
            pay.allowance
        );


    payGross.innerText =
        rawMoney(
            pay.gross
        );


    paySSS.innerText =
        rawMoney(
            pay.sss
        );


    payPhilhealth.innerText =
        rawMoney(
            pay.philhealth
        );


    payPagibig.innerText =
        rawMoney(
            pay.pagibig
        );


    payHealth.innerText =
        rawMoney(
            health
        );


    payOther.innerText =
        rawMoney(
            other
        );


    payDeduction.innerText =
        rawMoney(
            pay.deductions
        );


    payNet.innerText =
        rawMoney(
            pay.net
        );

}


/* ==========================================
   CLOSE PAYSLIP
========================================== */

window.closePayslip =
function(){

    payslipArea.style.display =
        "none";

};


/* ==========================================
   PRINT CURRENT PAYSLIP
========================================== */

window.printPayslip =
function(){

    if(!currentPayroll){

        alert(
            "Load Payslip First."
        );

        return;
    }


    const html =
        createPrintablePayslip(
            currentPayroll
        );


    openPrintWindow(
        html
    );

};


/* ==========================================
   PRINT LOGO URL
========================================== */

function getLogoURL(){

    return new URL(
        "../logo.png",
        window.location.href
    ).href;

}


/* ==========================================
   SINGLE PRINT
========================================== */

function createPrintablePayslip(pay){

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


    const logoURL =
        getLogoURL();


    return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>PAPPRITO Payslip</title>

<style>

*{
    box-sizing:border-box;
}

html,
body{
    margin:0;
    padding:0;
    background:#ffffff;
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

    color:#000000;

    border:
        2px solid #ffcc00;

    border-radius:10px;

}

.payroll-logo{

    width:70px;

    height:70px;

    object-fit:cover;

    border-radius:50%;

    border:
        3px solid #ffcc00;

    background:#ffffff;

    padding:4px;

    display:block;

    margin:0 auto 8px auto;

}

.company{

    text-align:center;

    margin-bottom:6px;

    padding-bottom:5px;

    border-bottom:
        2px solid #ffcc00;

}

.company h2{

    font-size:18px;

    color:#cc0000;

    margin:2px;

}

.company p{

    font-size:9px;

    font-weight:bold;

}

.info{

    font-size:10px;

    line-height:1.6;

    margin-bottom:6px;

    background:#fff8dc;

    padding:6px;

    border-radius:6px;

    border:
        1px solid #ffcc00;

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

    font-size:9px;

}

th{

    background:#ffcc00;

    color:#000000;

}

td{

    background:#ffffff;

    color:#000000;

}

.netpay{

    margin-top:8px;

    padding:8px;

    background:#008000;

    color:#ffffff;

    font-weight:bold;

    text-align:right;

    font-size:10px;

}

.signature{

    margin-top:15px;

    display:flex;

    justify-content:space-between;

    font-size:8px;

}

.line{

    margin-top:12px;

    border-top:
        1px solid #000000;

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
src="${logoURL}"
class="payroll-logo">

<h2>PAPPRITO</h2>

<p>
OFFICIAL EMPLOYEE PAYSLIP
</p>

</div>

<div class="info">

<b>ID:</b>
${escapeHTML(pay.empid || "")}

<br><br>

<b>Name:</b>
${escapeHTML(pay.employee || "")}

<br><br>

<b>Date:</b>
${escapeHTML(pay.date || "")}

<br><br>

<b>Daily Rate:</b>
₱ ${rawMoney(pay.dailyrate)}

<br><br>

<b>Total Days:</b>
${num(pay.totaldays)}

</div>


<table>

<tr>
<th>EARNINGS</th>
<th>AMOUNT</th>
</tr>

<tr>
<td>Basic Pay</td>
<td>${rawMoney(pay.basicpay)}</td>
</tr>

<tr>
<td>Overtime</td>
<td>${rawMoney(pay.overtime)}</td>
</tr>

<tr>
<td>Holiday Pay</td>
<td>${rawMoney(holiday)}</td>
</tr>

<tr>
<td>Sick Leave</td>
<td>${rawMoney(pay.sickleave)}</td>
</tr>

<tr>
<td>Vacation Leave</td>
<td>${rawMoney(pay.vacationleave)}</td>
</tr>

<tr>
<td>Birthday Leave</td>
<td>${rawMoney(pay.birthdayleave)}</td>
</tr>

<tr>
<td>Maternity Leave</td>
<td>${rawMoney(pay.maternityleave)}</td>
</tr>

<tr>
<td>Paternity Leave</td>
<td>${rawMoney(pay.paternityleave)}</td>
</tr>

<tr>
<td>Allowance</td>
<td>${rawMoney(pay.allowance)}</td>
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
<th>DEDUCTIONS</th>
<th>AMOUNT</th>
</tr>

<tr>
<td>SSS</td>
<td>${rawMoney(pay.sss)}</td>
</tr>

<tr>
<td>PhilHealth</td>
<td>${rawMoney(pay.philhealth)}</td>
</tr>

<tr>
<td>Pag-IBIG</td>
<td>${rawMoney(pay.pagibig)}</td>
</tr>

<tr>
<td>Health Card</td>
<td>${rawMoney(health)}</td>
</tr>

<tr>
<td>Others</td>
<td>${rawMoney(other)}</td>
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


<div class="netpay">

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

`;

}


/* ==========================================
   PRINT WINDOW
========================================== */

function openPrintWindow(html){

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=1200"
        );


    if(!printWindow){

        alert(
            "Please allow pop-ups for this HRIS website."
        );

        return;
    }


    printWindow.document.open();

    printWindow.document.write(
        html
    );

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
   PRINT ALL
   FOUR PAYSLIPS PER BOND PAPER
========================================== */

window.printAllPayslips =
function(){

    if(
        userRole !== "admin" &&
        userRole !== "hr" &&
        userRole !== "administrator"
    ){

        return;
    }


    if(
        filteredPayroll.length === 0
    ){

        alert(
            "No Payslips Found."
        );

        return;
    }


    let pages = "";


    for(
        let i = 0;

        i < filteredPayroll.length;

        i += 4
    ){

        const group =
            filteredPayroll.slice(
                i,
                i + 4
            );


        pages += `

            <div class="print-page">

        `;


        group.forEach(
            pay => {

                pages +=
                    createFourPayslip(
                        pay
                    );

            }
        );


        while(
            group.length < 4
        ){

            pages += `

                <div class="empty-slot"></div>

            `;

            group.push(null);

        }


        pages += `

            </div>

        `;

    }


    const html = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
PAPPRITO - All Payslips
</title>

<style>

*{
    box-sizing:border-box;
}

html,
body{

    margin:0;

    padding:0;

    background:#ffffff;

}

body{

    font-family:
        Tahoma,
        Arial,
        sans-serif;

}

.print-page{

    width:100%;

    height:100vh;

    display:grid;

    grid-template-columns:
        1fr 1fr;

    grid-template-rows:
        1fr 1fr;

    page-break-after:
        always;

    break-after:
        page;

}

.print-page:last-child{

    page-break-after:
        auto;

    break-after:
        auto;

}

.four-payslip{

    width:100%;

    height:100%;

    padding:6px;

    border:
        1px dashed #555555;

    overflow:hidden;

    background:#f9f9f9;

    color:#000000;

}

.logo{

    width:38px;

    height:38px;

    object-fit:cover;

    border-radius:50%;

    border:
        2px solid #ffcc00;

    display:block;

    margin:0 auto 2px auto;

}

.company{

    text-align:center;

    border-bottom:
        1px solid #ffcc00;

    padding-bottom:2px;

}

.company h2{

    color:#cc0000;

    font-size:11px;

    margin:1px;

}

.company p{

    font-size:5px;

    font-weight:bold;

    margin:1px;

}

.info{

    background:#fff8dc;

    border:
        1px solid #ffcc00;

    padding:2px;

    font-size:6px;

    line-height:1.25;

    margin-top:2px;

}

table{

    width:100%;

    border-collapse:collapse;

    margin-top:2px;

}

th,
td{

    border:
        1px solid #999999;

    padding:1.5px;

    font-size:5.5px;

}

th{

    background:#ffcc00;

    color:#000000;

}

td{

    background:#ffffff;

    color:#000000;

}

.net{

    margin-top:2px;

    padding:3px;

    background:#008000;

    color:#ffffff;

    font-size:7px;

    font-weight:bold;

    text-align:right;

}

.signature{

    display:flex;

    justify-content:space-between;

    margin-top:5px;

    font-size:4.5px;

}

.line{

    border-top:
        1px solid #000000;

    width:40px;

    text-align:center;

    padding-top:1px;

}

.empty-slot{

    visibility:hidden;

}

@page{

    size:letter portrait;

    margin:5mm;

}

</style>

</head>

<body>

${pages}

</body>

</html>

`;


    openPrintWindow(
        html
    );

};


/* ==========================================
   FOUR-UP PAYSLIP
========================================== */

function createFourPayslip(pay){

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


    const logoURL =
        getLogoURL();


    return `

<div class="four-payslip">

<div class="company">

<img
src="${logoURL}"
class="logo">

<h2>
PAPPRITO
</h2>

<p>
OFFICIAL EMPLOYEE PAYSLIP
</p>

</div>


<div class="info">

<b>ID:</b>
${escapeHTML(pay.empid || "")}

<br>

<b>Name:</b>
${escapeHTML(pay.employee || "")}

<br>

<b>Date:</b>
${escapeHTML(pay.date || "")}

<br>

<b>Rate:</b>
₱ ${rawMoney(pay.dailyrate)}

&nbsp;

<b>Days:</b>
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
<td>${rawMoney(pay.basicpay)}</td>
</tr>

<tr>
<td>Overtime</td>
<td>${rawMoney(pay.overtime)}</td>
</tr>

<tr>
<td>Holiday</td>
<td>${rawMoney(holiday)}</td>
</tr>

<tr>
<td>Sick Leave</td>
<td>${rawMoney(pay.sickleave)}</td>
</tr>

<tr>
<td>Vacation Leave</td>
<td>${rawMoney(pay.vacationleave)}</td>
</tr>

<tr>
<td>Birthday Leave</td>
<td>${rawMoney(pay.birthdayleave)}</td>
</tr>

<tr>
<td>Maternity Leave</td>
<td>${rawMoney(pay.maternityleave)}</td>
</tr>

<tr>
<td>Paternity Leave</td>
<td>${rawMoney(pay.paternityleave)}</td>
</tr>

<tr>
<td>Allowance</td>
<td>${rawMoney(pay.allowance)}</td>
</tr>

<tr>

<td>
<b>GROSS</b>
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
<td>SSS</td>
<td>${rawMoney(pay.sss)}</td>
</tr>

<tr>
<td>PhilHealth</td>
<td>${rawMoney(pay.philhealth)}</td>
</tr>

<tr>
<td>Pag-IBIG</td>
<td>${rawMoney(pay.pagibig)}</td>
</tr>

<tr>
<td>Health Card</td>
<td>${rawMoney(health)}</td>
</tr>

<tr>
<td>Others</td>
<td>${rawMoney(other)}</td>
</tr>

<tr>

<td>
<b>DEDUCTION</b>
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

`;

}


/* ==========================================
   EMPLOYEE REQUESTS
========================================== */

async function loadRequests(){

    const body =
        document.getElementById(
            "requestBody"
        );


    if(
        !body ||
        !currentEmployee
    ){

        return;
    }


    body.innerHTML = "";


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "employeeRequests"
                )
            );


        let found = false;


        snapshot.forEach(
            docSnap => {

                const req =
                    docSnap.data();


                if(
                    text(req.empid)
                    .trim()
                    .toUpperCase()
                    !==
                    text(currentEmployee.id)
                    .trim()
                    .toUpperCase()
                ){

                    return;
                }


                found = true;


                const status =
                    text(
                        req.status ||
                        "PENDING"
                    )
                    .toLowerCase();


                body.innerHTML += `

<tr>

<td>
${escapeHTML(req.empid)}
</td>

<td>
${escapeHTML(req.employee)}
</td>

<td>
${escapeHTML(req.type)}
</td>

<td>
${escapeHTML(req.date)}
</td>

<td>
${escapeHTML(req.days)}
</td>

<td>
${escapeHTML(req.reason)}
</td>

<td class="${escapeHTML(status)}">
${escapeHTML(req.status)}
</td>

<td>

<button
class="btn edit-btn"
onclick="
editRequest(
'${escapeJS(docSnap.id)}',
'${escapeJS(req.type)}',
'${escapeJS(req.date)}',
'${escapeJS(req.days)}',
'${escapeJS(req.reason)}'
)">

EDIT

</button>

<button
class="btn delete-btn"
onclick="
deleteRequest(
'${escapeJS(docSnap.id)}'
)">

DELETE

</button>

</td>

</tr>

`;

            }
        );


        if(!found){

            body.innerHTML = `

<tr>

<td
colspan="8"
style="padding:20px;">

NO LEAVE REQUESTS YET

</td>

</tr>

`;

        }


    }catch(error){

        console.error(
            "Requests Error:",
            error
        );

    }

}


/* ==========================================
   SUBMIT LEAVE REQUEST
========================================== */

window.submitRequest =
async function(){

    if(!currentEmployee){

        return;
    }


    const type =
        document.getElementById(
            "requestType"
        ).value;


    const date =
        document.getElementById(
            "requestDate"
        ).value;


    const days =
        document.getElementById(
            "days"
        ).value;


    const reason =
        document.getElementById(
            "reason"
        ).value.trim();


    if(!type || !date){

        alert(
            "Please complete the leave request."
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
                    type,
                    date,
                    days,
                    reason
                }

            );


            alert(
                "Request Updated."
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

                    type,
                    date,
                    days,
                    reason,

                    status:
                        "PENDING"

                }

            );


            alert(
                "Request Submitted."
            );

        }


        clearLeaveForm();

        await loadRequests();


    }catch(error){

        console.error(error);

        alert(
            "Request Error."
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

    editId = id;


    document.getElementById(
        "requestType"
    ).value = type;


    document.getElementById(
        "requestDate"
    ).value = date;


    document.getElementById(
        "days"
    ).value = daysValue;


    document.getElementById(
        "reason"
    ).value = reasonText;


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
            "Delete Error."
        );

    }

};


/* ==========================================
   CLEAR LEAVE
========================================== */

function clearLeaveForm(){

    document.getElementById(
        "requestType"
    ).value = "";


    document.getElementById(
        "requestDate"
    ).value = "";


    document.getElementById(
        "days"
    ).value = "";


    document.getElementById(
        "reason"
    ).value = "";


    editId = null;

}


/* ==========================================
   ATTENDANCE REQUESTS
========================================== */

async function loadAttendanceRequests(){

    const body =
        document.getElementById(
            "attendanceBody"
        );


    if(
        !body ||
        !currentEmployee
    ){

        return;
    }


    body.innerHTML = "";


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "attendanceRequests"
                )
            );


        let found = false;


        snapshot.forEach(
            docSnap => {

                const req =
                    docSnap.data();


                if(
                    text(req.employeeid)
                    .trim()
                    .toUpperCase()
                    !==
                    text(currentEmployee.id)
                    .trim()
                    .toUpperCase()
                ){

                    return;
                }


                found = true;


                const status =
                    text(
                        req.status ||
                        "PENDING"
                    )
                    .toLowerCase();


                body.innerHTML += `

<tr>

<td>
${escapeHTML(req.employeeid)}
</td>

<td>
${escapeHTML(req.employee)}
</td>

<td>
${escapeHTML(req.requesttype)}
</td>

<td>
${escapeHTML(req.date)}
</td>

<td>
${escapeHTML(req.time)}
</td>

<td>
${escapeHTML(req.reason)}
</td>

<td class="${escapeHTML(status)}">
${escapeHTML(req.status)}
</td>

<td>

<button
class="btn edit-btn"
onclick="
editAttendanceRequest(
'${escapeJS(docSnap.id)}',
'${escapeJS(req.requesttype)}',
'${escapeJS(req.date)}',
'${escapeJS(req.time)}',
'${escapeJS(req.reason)}'
)">

EDIT

</button>

<button
class="btn delete-btn"
onclick="
deleteAttendanceRequest(
'${escapeJS(docSnap.id)}'
)">

DELETE

</button>

</td>

</tr>

`;

            }
        );


        if(!found){

            body.innerHTML = `

<tr>

<td
colspan="8"
style="padding:20px;">

NO ATTENDANCE REQUESTS YET

</td>

</tr>

`;

        }


    }catch(error){

        console.error(error);

    }

}


/* ==========================================
   SUBMIT ATTENDANCE
========================================== */

window.submitAttendanceRequest =
async function(){

    if(!currentEmployee){

        return;
    }


    const type =
        document.getElementById(
            "attendanceType"
        ).value;


    const date =
        document.getElementById(
            "attendanceDate"
        ).value;


    const time =
        document.getElementById(
            "attendanceTime"
        ).value;


    const reason =
        document.getElementById(
            "attendanceReason"
        ).value.trim();


    if(
        !type ||
        !date ||
        !time ||
        !reason
    ){

        alert(
            "Please complete the attendance request."
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
                        type,

                    date,
                    time,
                    reason

                }

            );


            alert(
                "Attendance Request Updated."
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
                        type,

                    date,
                    time,
                    reason,

                    status:
                        "PENDING",

                    timestamp:
                        Date.now()

                }

            );


            alert(
                "Attendance Request Submitted."
            );

        }


        clearAttendanceForm();

        await loadAttendanceRequests();


    }catch(error){

        console.error(error);

        alert(
            "Attendance Request Error."
        );

    }

};


/* ==========================================
   EDIT ATTENDANCE
========================================== */

window.editAttendanceRequest =
function(
    id,
    type,
    date,
    time,
    reasonText
){

    attendanceEditId = id;


    document.getElementById(
        "attendanceType"
    ).value = type;


    document.getElementById(
        "attendanceDate"
    ).value = date;


    document.getElementById(
        "attendanceTime"
    ).value = time;


    document.getElementById(
        "attendanceReason"
    ).value = reasonText;


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

};


/* ==========================================
   DELETE ATTENDANCE
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
            "Delete Error."
        );

    }

};


/* ==========================================
   CLEAR ATTENDANCE
========================================== */

function clearAttendanceForm(){

    document.getElementById(
        "attendanceType"
    ).value = "";


    document.getElementById(
        "attendanceDate"
    ).value = "";


    document.getElementById(
        "attendanceTime"
    ).value = "";


    document.getElementById(
        "attendanceReason"
    ).value = "";


    attendanceEditId = null;

}


/* ==========================================
   LOGOUT
========================================== */

window.logout =
function(){

    localStorage.removeItem(
        "loggedInUser"
    );

    localStorage.removeItem(
        "userRole"
    );

    window.location.href =
        "login.html";

};


/* ==========================================
   START
========================================== */

initializePage();
