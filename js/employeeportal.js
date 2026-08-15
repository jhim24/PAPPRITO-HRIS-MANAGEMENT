/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE PORTAL JS
   VERSION 4
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


/* ==========================================
   EMPLOYEE
========================================== */

const payEmpId =
    document.getElementById("payEmpId");

const payEmp =
    document.getElementById("payEmp");

const payDate =
    document.getElementById("payDate");


/* ==========================================
   RATE
========================================== */

const payHourlyRate =
    document.getElementById("payHourlyRate");


/* ==========================================
   WORKING HOURS
========================================== */

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


/* ==========================================
   EARNINGS
========================================== */

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


/* ==========================================
   DEDUCTIONS
========================================== */

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


/* ==========================================
   NET PAY
========================================== */

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
        Number(
            value ?? 0
        );

    return Number.isFinite(n)
        ? n
        : 0;

}


function money(value){

    return number(
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
   PAYROLL FIELD COMPATIBILITY
========================================== */

function payrollField(
    pay,
    primary,
    secondary,
    third
){

    if(
        pay &&
        pay[primary] !== undefined &&
        pay[primary] !== null
    ){

        return number(
            pay[primary]
        );

    }


    if(
        pay &&
        secondary &&
        pay[secondary] !== undefined &&
        pay[secondary] !== null
    ){

        return number(
            pay[secondary]
        );

    }


    if(
        pay &&
        third &&
        pay[third] !== undefined &&
        pay[third] !== null
    ){

        return number(
            pay[third]
        );

    }


    return 0;

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
            currentEmployee.position ||
            "-";

    }


    if(infoDepartment){

        infoDepartment.innerText =
            currentEmployee.department ||
            "-";

    }


    if(infoEmployment){

        infoEmployment.innerText =
            currentEmployee.employment ||
            "-";

    }


    if(infoStatus){

        infoStatus.innerText =
            currentEmployee.status ||
            "Active";

    }


    if(infoMobile){

        infoMobile.innerText =
            currentEmployee.mobile ||
            "-";

    }


    if(infoEmail){

        infoEmail.innerText =
            currentEmployee.email ||
            "-";

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

                    number(
                        b.timestamp
                    )

                    -

                    number(
                        a.timestamp
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
        number(days) <= 0
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
                    number(days),

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
   PAYSLIP
   AUTO PAYROLL
   =========================================================
   ========================================================= */


/* ==========================================
   LOAD EMPLOYEE AUTO PAYROLL
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
                 * AUTO PAYROLL PRIMARY ID
                 */

                const payrollEmployeeId =
                    text(
                        pay.employeeId
                    )
                    .toUpperCase();


                /*
                 * Compatibility with
                 * older records.
                 */

                const alternativeEmployeeId =
                    text(
                        pay.empid
                    )
                    .toUpperCase();


                const matched =
                    payrollEmployeeId ===
                    currentId
                    ||
                    alternativeEmployeeId ===
                    currentId;


                if(!matched){

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
         * NEWEST FIRST
         */

        employeePayroll.sort(
            (a,b) => {

                const dateA =
                    text(
                        a.date
                    );

                const dateB =
                    text(
                        b.date
                    );


                const dateCompare =
                    dateB.localeCompare(
                        dateA
                    );


                if(
                    dateCompare !== 0
                ){

                    return dateCompare;

                }


                return (

                    number(
                        b.updatedAt
                        ||
                        b.createdAt
                    )

                    -

                    number(
                        a.updatedAt
                        ||
                        a.createdAt
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
                text(
                    pay.date
                )
                ||
                "NO DATE";


            const net =
                money(
                    pay.net
                );


            option.textContent =
                "PAYROLL - " +
                date +
                " • NET ₱" +
                net;


            payslipSelect.appendChild(
                option
            );

        }
    );


    /*
     * SELECT LATEST
     */

    if(
        employeePayroll[0]
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

    if(
        !isAuthorizedPayslip(
            pay
        )
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
   PAYSLIP AUTHORIZATION
========================================== */

function isAuthorizedPayslip(
    pay
){

    if(
        !currentEmployee ||
        !pay
    ){

        return false;

    }


    const currentId =
        text(
            currentEmployee.employeeid
        )
        .toUpperCase();


    const payrollId =
        text(
            pay.employeeId
            ||
            pay.empid
        )
        .toUpperCase();


    return (

        currentId &&
        payrollId &&
        currentId ===
        payrollId

    );

}


/* ==========================================
   DISPLAY PAYSLIP
========================================== */

function displayPayslip(
    pay
){

    if(!pay){

        return;

    }


    /*
     * ======================================
     * EMPLOYEE
     * ======================================
     */

    if(payEmpId){

        payEmpId.innerText =
            pay.employeeId
            ||
            pay.empid
            ||
            "-";

    }


    if(payEmp){

        payEmp.innerText =
            pay.employeeName
            ||
            pay.employee
            ||
            "-";

    }


    if(payDate){

        payDate.innerText =
            pay.date ||
            "-";

    }


    /*
     * ======================================
     * HOURLY RATE
     * ======================================
     */

    if(payHourlyRate){

        payHourlyRate.innerText =
            money(
                pay.hourlyRate
            );

    }


    /*
     * ======================================
     * WORKING HOURS
     * ======================================
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
            getHolidayType(
                pay
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
     * ======================================
     * EARNINGS
     * ======================================
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
                getHolidayPay(
                    pay
                )
            );

    }


    if(payNight){

        payNight.innerText =
            money(
                getNightPay(
                    pay
                )
            );

    }


    if(payGross){

        payGross.innerText =
            money(
                pay.gross
            );

    }


    /*
     * ======================================
     * DEDUCTIONS
     * ======================================
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
                ||
                pay.health
            );

    }


    if(payOther){

        payOther.innerText =
            money(
                pay.others
                ||
                pay.other
            );

    }


    if(payDeduction){

        payDeduction.innerText =
            money(
                pay.deductions
            );

    }


    /*
     * ======================================
     * NET PAY
     * ======================================
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

function getHolidayType(
    pay
){

    const type =
        text(
            pay.holidayType
        )
        .toLowerCase();


    const regularHours =
        getRegularHolidayHours(
            pay
        );


    const specialHours =
        getSpecialHolidayHours(
            pay
        );


    /*
     * If both exist in the
     * same payroll record.
     */

    if(
        regularHours > 0 &&
        specialHours > 0
    ){

        return "Regular + Special Holiday";

    }


    if(
        type ===
        "regular"
        ||
        type ===
        "regular holiday"
    ){

        return "Regular Holiday";

    }


    if(
        type ===
        "special"
        ||
        type ===
        "special holiday"
    ){

        return "Special Holiday";

    }


    if(
        regularHours > 0
    ){

        return "Regular Holiday";

    }


    if(
        specialHours > 0
    ){

        return "Special Holiday";

    }


    return "No Holiday";

}


/* ==========================================
   REGULAR HOLIDAY HOURS
========================================== */

function getRegularHolidayHours(
    pay
){

    return payrollField(
        pay,
        "regularHolidayHours",
        "regularholidayhours",
        "regular_holiday_hours"
    );

}


/* ==========================================
   SPECIAL HOLIDAY HOURS
========================================== */

function getSpecialHolidayHours(
    pay
){

    return payrollField(
        pay,
        "specialHolidayHours",
        "specialholidayhours",
        "special_holiday_hours"
    );

}


/* ==========================================
   REGULAR HOLIDAY PAY
========================================== */

function getRegularHolidayPay(
    pay
){

    return payrollField(
        pay,
        "regularHolidayPay",
        "regularholidaypay",
        "regular_holiday_pay"
    );

}


/* ==========================================
   SPECIAL HOLIDAY PAY
========================================== */

function getSpecialHolidayPay(
    pay
){

    return payrollField(
        pay,
        "specialHolidayPay",
        "specialholidaypay",
        "special_holiday_pay"
    );

}


/* ==========================================
   HOLIDAY PAY
========================================== */

function getHolidayPay(
    pay
){

    const regular =
        getRegularHolidayPay(
            pay
        );


    const special =
        getSpecialHolidayPay(
            pay
        );


    /*
     * Use separated holiday
     * amounts when available.
     */

    if(
        regular !== 0 ||
        special !== 0
    ){

        return (
            regular +
            special
        );

    }


    /*
     * Fallback to Auto Payroll
     * total holidayPay.
     */

    return payrollField(
        pay,
        "holidayPay",
        "holidaypay"
    );

}


/* ==========================================
   NIGHT DIFFERENTIAL PAY
========================================== */

function getNightPay(
    pay
){

    return payrollField(
        pay,
        "nightPay",
        "nightpay",
        "nightDifferential"
    );

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

    currentPayslip =
        null;


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

    if(
        !isAuthorizedPayslip(
            currentPayslip
        )
    ){

        alert(
            "Hindi ka authorized mag-print ng payslip na ito."
        );

        return;

    }


    /*
     * PRINT ONLY THE SELECTED RECORD
     *
     * No other payroll month will be
     * included.
     */

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

    if(!pay){

        return;

    }


    const regularHolidayHours =
        getRegularHolidayHours(
            pay
        );


    const specialHolidayHours =
        getSpecialHolidayHours(
            pay
        );


    const regularHolidayPay =
        getRegularHolidayPay(
            pay
        );


    const specialHolidayPay =
        getSpecialHolidayPay(
            pay
        );


    const holidayPay =
        getHolidayPay(
            pay
        );


    const nightPay =
        getNightPay(
            pay
        );


    const holidayType =
        getHolidayType(
            pay
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
            "others",
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


@page{

    size:A4;

    margin:7mm;

}


body{

    margin:0;

    padding:0;

    background:#ffffff;

    color:#000000;

    font-family:
        "Segoe UI",
        Tahoma,
        Arial,
        sans-serif;

}


.payslip{

    width:100%;

    max-width:190mm;

    margin:0 auto;

    padding:7mm;

    border:
        2px solid
        #ffcc00;

    border-radius:8px;

    background:#ffffff;

}


/* ==========================================
   COMPANY
========================================== */

.company{

    text-align:center;

    padding-bottom:4mm;

    border-bottom:
        2px solid
        #ffcc00;

}


.logo{

    width:55px;

    height:55px;

    display:block;

    object-fit:contain;

    margin:
        0 auto 3mm;

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

    font-weight:800;

}


.company small{

    font-size:8px;

    font-weight:900;

}


/* ==========================================
   EMPLOYEE INFO
========================================== */

.info{

    display:grid;

    grid-template-columns:
        1fr 1fr;

    gap:2mm;

    margin-top:4mm;

    padding:4mm;

    background:#f5f7fa;

    border:
        1px solid
        #d9dee7;

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
   SECTION
========================================== */

.section-title{

    margin-top:4mm;

    padding:2mm 3mm;

    background:#253044;

    color:#ffcc00;

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

    border:
        1px solid
        #999;

    padding:
        2.5mm;

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

    background:#f1f1f1;

    font-weight:900;

}


/* ==========================================
   NET PAY
========================================== */

.net{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-top:5mm;

    padding:5mm;

    background:#fff8dc;

    border:
        2px solid
        #ffcc00;

    border-radius:5px;

    color:#111111;

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

    gap:30mm;

    margin-top:15mm;

    font-size:8px;

}


.signature-box{

    width:35%;

    text-align:center;

}


.line{

    border-top:
        1px solid
        #000;

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

        border:
            2px solid
            #ffcc00;

    }

}

</style>

</head>


<body>


<div class="payslip">


<!-- ======================================
     COMPANY
====================================== -->

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


<!-- ======================================
     EMPLOYEE INFORMATION
====================================== -->

<div class="info">


<div>

<b>
Employee ID:
</b>

${escapeHTML(
    pay.employeeId ||
    pay.empid ||
    "-"
)}

</div>


<div>

<b>
Employee:
</b>

${escapeHTML(
    pay.employeeName ||
    pay.employee ||
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


<!-- ======================================
     WORKING HOURS
====================================== -->

<div class="section-title">

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
Regular Holiday Hours
</td>

<td>
${regularHolidayHours.toFixed(2)}

</td>

</tr>


<tr>

<td>
Special Holiday Hours
</td>

<td>
${specialHolidayHours.toFixed(2)}

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
Total Holiday Hours
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


<!-- ======================================
     EARNINGS
====================================== -->

<div class="section-title">

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
Regular Holiday Pay
</td>

<td>
₱ ${money(
    regularHolidayPay
)}

</td>

</tr>


<tr>

<td>
Special Holiday Pay
</td>

<td>
₱ ${money(
    specialHolidayPay
)}

</td>

</tr>


<tr>

<td>
Total Holiday Pay
</td>

<td>
₱ ${money(
    holidayPay
)}

</td>

</tr>


<tr>

<td>
Night Differential
</td>

<td>
₱ ${money(
    nightPay
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


<!-- ======================================
     DEDUCTIONS
====================================== -->

<div class="section-title">

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
    health
)}

</td>

</tr>


<tr>

<td>
Others
</td>

<td>
₱ ${money(
    other
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


<!-- ======================================
     NET PAY
====================================== -->

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


<!-- ======================================
     SIGNATURE
====================================== -->

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
         * REQUIRE FIREBASE LOGIN
         */

        if(!user){

            window.location.replace(
                "login.html"
            );

            return;

        }


        /*
         * EMPLOYEE ROLE ONLY
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
