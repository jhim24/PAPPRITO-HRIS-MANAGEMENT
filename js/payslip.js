/* ==========================================
   PAPPRITO HRIS
   ADMIN PAYSLIP
   AUTO PAYROLL BASED
========================================== */

import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL
========================================== */

let autoPayrollRecords = [];

let filteredRecords = [];

let selectedRecord = null;


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
   EMPLOYEE DISPLAY
========================================== */

const empIdDisplay =
    document.getElementById(
        "empIdDisplay"
    );

const empNameDisplay =
    document.getElementById(
        "empNameDisplay"
    );


/* ==========================================
   PAYSLIP DISPLAY
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
        "payHourlyRate"
    );

const payTotalDays =
    document.getElementById(
        "payTotalDays"
    );


/* ==========================================
   HOURS
========================================== */

const payRegularHours =
    document.getElementById(
        "payRegularHours"
    );

const payOTHours =
    document.getElementById(
        "payOTHours"
    );

const payHolidayHours =
    document.getElementById(
        "payHolidayHours"
    );

const payNightHours =
    document.getElementById(
        "payNightHours"
    );

const payNightRate =
    document.getElementById(
        "payNightRate"
    );


/* ==========================================
   HOLIDAY
========================================== */

const payHolidayType =
    document.getElementById(
        "payHolidayType"
    );

const payRegularHolidayHours =
    document.getElementById(
        "payRegularHolidayHours"
    );

const payRegularHoliday =
    document.getElementById(
        "payRegularHoliday"
    );

const paySpecialHolidayHours =
    document.getElementById(
        "paySpecialHolidayHours"
    );

const paySpecialHoliday =
    document.getElementById(
        "paySpecialHoliday"
    );


/* ==========================================
   EARNINGS
========================================== */

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

const payNight =
    document.getElementById(
        "payNight"
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


/* ==========================================
   DEDUCTIONS
========================================== */

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


/* ==========================================
   NET PAY
========================================== */

const payNet =
    document.getElementById(
        "payNet"
    );


/* ==========================================
   TABLE ELEMENTS
========================================== */

const payRegularHoursTable =
    document.getElementById(
        "payRegularHoursTable"
    );

const payOTHoursTable =
    document.getElementById(
        "payOTHoursTable"
    );

const payRegularHolidayHoursTable =
    document.getElementById(
        "payRegularHolidayHoursTable"
    );

const payRegularHolidayTable =
    document.getElementById(
        "payRegularHolidayTable"
    );

const paySpecialHolidayHoursTable =
    document.getElementById(
        "paySpecialHolidayHoursTable"
    );

const paySpecialHolidayTable =
    document.getElementById(
        "paySpecialHolidayTable"
    );

const payHolidayHoursTable =
    document.getElementById(
        "payHolidayHoursTable"
    );

const payNightHoursTable =
    document.getElementById(
        "payNightHoursTable"
    );


/* ==========================================
   HELPERS
========================================== */

function num(value){

    const result =
        Number(
            value ?? 0
        );

    return Number.isFinite(result)
        ? result
        : 0;

}


function text(value){

    return String(
        value ?? ""
    ).trim();

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


/* ==========================================
   PAYROLL FIELD COMPATIBILITY
========================================== */

function payrollField(
    record,
    primary,
    secondary,
    third
){

    if(
        record[primary] !== undefined &&
        record[primary] !== null
    ){

        return num(
            record[primary]
        );

    }


    if(
        secondary &&
        record[secondary] !== undefined &&
        record[secondary] !== null
    ){

        return num(
            record[secondary]
        );

    }


    if(
        third &&
        record[third] !== undefined &&
        record[third] !== null
    ){

        return num(
            record[third]
        );

    }


    return 0;

}


/* ==========================================
   HOLIDAY TYPE
========================================== */

function formatHoliday(
    value
){

    switch(
        text(value).toLowerCase()
    ){

        case "regular":

            return "Regular Holiday";

        case "special":

            return "Special Holiday";

        case "regular holiday":

            return "Regular Holiday";

        case "special holiday":

            return "Special Holiday";

        default:

            return "No Holiday";

    }

}


/* ==========================================
   GET REGULAR HOLIDAY HOURS
========================================== */

function getRegularHolidayHours(
    record
){

    return payrollField(
        record,
        "regularHolidayHours",
        "regularholidayhours",
        "regular_holiday_hours"
    );

}


/* ==========================================
   GET SPECIAL HOLIDAY HOURS
========================================== */

function getSpecialHolidayHours(
    record
){

    return payrollField(
        record,
        "specialHolidayHours",
        "specialholidayhours",
        "special_holiday_hours"
    );

}


/* ==========================================
   GET REGULAR HOLIDAY PAY
========================================== */

function getRegularHolidayPay(
    record
){

    return payrollField(
        record,
        "regularHolidayPay",
        "regularholidaypay",
        "regular_holiday_pay"
    );

}


/* ==========================================
   GET SPECIAL HOLIDAY PAY
========================================== */

function getSpecialHolidayPay(
    record
){

    return payrollField(
        record,
        "specialHolidayPay",
        "specialholidaypay",
        "special_holiday_pay"
    );

}


/* ==========================================
   GET TOTAL HOLIDAY PAY
========================================== */

function getTotalHolidayPay(
    record
){

    const regular =
        getRegularHolidayPay(
            record
        );


    const special =
        getSpecialHolidayPay(
            record
        );


    const existing =
        payrollField(
            record,
            "holidayPay",
            "holidaypay"
        );


    /*
     * If Auto Payroll has the
     * separated holiday amounts,
     * use their total.
     *
     * Otherwise use the existing
     * holidayPay field.
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


    return existing;

}


/* ==========================================
   GET NIGHT PAY
========================================== */

function getNightPay(
    record
){

    return payrollField(
        record,
        "nightPay",
        "nightpay",
        "nightDifferential"
    );

}


/* ==========================================
   GET TOTAL HOURS
========================================== */

function getTotalHours(
    record
){

    return (

        num(
            record.regularHours
        )

        +

        num(
            record.overtimeHours
        )

        +

        num(
            record.holidayHours
        )

        +

        num(
            record.nightHours
        )

    );

}


/* ==========================================
   LOAD AUTO PAYROLL
========================================== */

async function loadAutoPayroll(){

    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "autoPayroll"
                )
            );


        autoPayrollRecords = [];


        snapshot.forEach(
            docSnap => {

                autoPayrollRecords.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        /*
         * Latest date first
         */

        autoPayrollRecords.sort(
            (
                a,
                b
            ) => {

                const dateA =
                    text(
                        a.date
                    );

                const dateB =
                    text(
                        b.date
                    );


                if(
                    dateA !==
                    dateB
                ){

                    return dateB.localeCompare(
                        dateA
                    );

                }


                return (

                    num(
                        b.createdAt
                    )

                    -

                    num(
                        a.createdAt
                    )

                );

            }
        );


        filteredRecords =
            [
                ...autoPayrollRecords
            ];


        renderAdminPayslip(
            filteredRecords
        );


    }catch(error){

        console.error(
            "Load Auto Payroll Error:",
            error
        );


        if(
            adminPayslipBody
        ){

            adminPayslipBody.innerHTML = `

<tr>

<td
    colspan="13"
    style="
        text-align:center;
        padding:30px;
        color:#d71920;
        font-weight:800;
    ">

Unable to load Auto Payroll records.

<br><br>

${escapeHTML(
    error.message
)}

</td>

</tr>

`;

        }

    }

}


/* ==========================================
   RENDER ADMIN PAYSLIP
========================================== */

function renderAdminPayslip(
    records
){

    if(
        !adminPayslipBody
    ){

        return;

    }


    adminPayslipBody.innerHTML =
        "";


    let grossTotal =
        0;

    let netTotal =
        0;


    records.forEach(
        record => {

            grossTotal +=
                num(
                    record.gross
                );

            netTotal +=
                num(
                    record.net
                );

        }
    );


    if(totalRecords){

        totalRecords.textContent =
            records.length;

    }


    if(totalGross){

        totalGross.textContent =
            money(
                grossTotal
            );

    }


    if(totalNet){

        totalNet.textContent =
            money(
                netTotal
            );

    }


    if(
        records.length === 0
    ){

        adminPayslipBody.innerHTML = `

<tr>

<td
    colspan="13"
    style="
        text-align:center;
        padding:30px;
        font-weight:800;
    ">

NO AUTO PAYROLL PAYSLIPS FOUND

</td>

</tr>

`;

        return;

    }


    records.forEach(
        record => {

            const row =
                document.createElement(
                    "tr"
                );


            const employeeId =
                record.employeeId
                ||
                record.employeeid
                ||
                "-";


            const employeeName =
                record.employeeName
                ||
                record.employee
                ||
                "-";


            const rate =
                num(
                    record.hourlyRate
                );


            const regularHours =
                num(
                    record.regularHours
                );


            const overtimeHours =
                num(
                    record.overtimeHours
                );


            const regularHolidayHours =
                getRegularHolidayHours(
                    record
                );


            const specialHolidayHours =
                getSpecialHolidayHours(
                    record
                );


            const holidayHours =
                num(
                    record.holidayHours
                )
                ||
                (
                    regularHolidayHours +
                    specialHolidayHours
                );


            const holidayType =
                formatHoliday(
                    record.holidayType
                );


            const nightHours =
                num(
                    record.nightHours
                );


            const gross =
                num(
                    record.gross
                );


            const deductions =
                num(
                    record.deductions
                );


            const net =
                num(
                    record.net
                );


            row.innerHTML = `

<td>

${escapeHTML(
    employeeId
)}

</td>


<td>

${escapeHTML(
    employeeName
)}

</td>


<td>

${escapeHTML(
    record.date || "-"
)}

</td>


<td>

₱ ${money(
    rate
)}

</td>


<td>

${regularHours.toFixed(2)}

</td>


<td>

${overtimeHours.toFixed(2)}

</td>


<td>

${escapeHTML(
    holidayType
)}

</td>


<td>

${holidayHours.toFixed(2)}

</td>


<td>

${nightHours.toFixed(2)}

</td>


<td>

<strong>

₱ ${money(
    gross
)}

</strong>

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
    type="button"
    class="view-payslip-btn"
    onclick="viewPayslip('${escapeHTML(record.id)}')">

<span class="material-icons">
visibility
</span>

VIEW

</button>

</td>

`;


            adminPayslipBody.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   SEARCH / FILTER
========================================== */

window.applyFilter =
function(){

    const search =
        text(
            searchEmployee?.value
        ).toLowerCase();


    const date =
        text(
            filterDate?.value
        );


    filteredRecords =
        autoPayrollRecords.filter(
            record => {

                const employeeId =
                    text(
                        record.employeeId
                        ||
                        record.employeeid
                    ).toLowerCase();


                const employeeName =
                    text(
                        record.employeeName
                        ||
                        record.employee
                    ).toLowerCase();


                const recordDate =
                    text(
                        record.date
                    );


                const matchesSearch =
                    !search
                    ||
                    employeeId.includes(
                        search
                    )
                    ||
                    employeeName.includes(
                        search
                    );


                const matchesDate =
                    !date
                    ||
                    recordDate === date;


                return (

                    matchesSearch &&
                    matchesDate

                );

            }
        );


    renderAdminPayslip(
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
        [
            ...autoPayrollRecords
        ];


    renderAdminPayslip(
        filteredRecords
    );

};


/* ==========================================
   VIEW PAYSLIP
========================================== */

window.viewPayslip =
function(
    id
){

    const record =
        autoPayrollRecords.find(
            item =>
                item.id ===
                id
        );


    if(
        !record
    ){

        alert(
            "Payslip record not found."
        );

        return;

    }


    selectedRecord =
        record;


    /*
     * Employee section
     */

    if(empIdDisplay){

        empIdDisplay.textContent =
            record.employeeId
            ||
            record.employeeid
            ||
            "-";

    }


    if(empNameDisplay){

        empNameDisplay.textContent =
            record.employeeName
            ||
            record.employee
            ||
            "-";

    }


    /*
     * HEADER
     */

    if(payEmpId){

        payEmpId.textContent =
            record.employeeId
            ||
            record.employeeid
            ||
            "-";

    }


    if(payEmp){

        payEmp.textContent =
            record.employeeName
            ||
            record.employee
            ||
            "-";

    }


    if(payDate){

        payDate.textContent =
            record.date
            ||
            "-";

    }


    /*
     * HOURLY RATE
     */

    if(payDailyRate){

        payDailyRate.textContent =
            money(
                record.hourlyRate
            );

    }


    /*
     * HOURS
     */

    const regularHours =
        num(
            record.regularHours
        );


    const overtimeHours =
        num(
            record.overtimeHours
        );


    const regularHolidayHours =
        getRegularHolidayHours(
            record
        );


    const specialHolidayHours =
        getSpecialHolidayHours(
            record
        );


    const holidayHours =
        num(
            record.holidayHours
        )
        ||
        (
            regularHolidayHours +
            specialHolidayHours
        );


    const nightHours =
        num(
            record.nightHours
        );


    const totalHours =
        getTotalHours(
            record
        );


    if(payRegularHours){

        payRegularHours.textContent =
            regularHours.toFixed(2);

    }


    if(payOTHours){

        payOTHours.textContent =
            overtimeHours.toFixed(2);

    }


    if(payHolidayHours){

        payHolidayHours.textContent =
            holidayHours.toFixed(2);

    }


    if(payNightHours){

        payNightHours.textContent =
            nightHours.toFixed(2);

    }


    if(payTotalDays){

        payTotalDays.textContent =
            totalHours.toFixed(2);

    }


    /*
     * NIGHT RATE
     */

    if(payNightRate){

        payNightRate.textContent =
            num(
                record.nightRate
                ??
                record.ndRate
                ??
                10
            ).toFixed(2);

    }


    /*
     * HOLIDAY TYPE
     */

    if(payHolidayType){

        const regular =
            regularHolidayHours > 0;

        const special =
            specialHolidayHours > 0;


        if(
            regular &&
            special
        ){

            payHolidayType.textContent =
                "Regular + Special Holiday";

        }

        else if(regular){

            payHolidayType.textContent =
                "Regular Holiday";

        }

        else if(special){

            payHolidayType.textContent =
                "Special Holiday";

        }

        else{

            payHolidayType.textContent =
                formatHoliday(
                    record.holidayType
                );

        }

    }


    /*
     * REGULAR HOLIDAY
     */

    const regularHolidayPay =
        getRegularHolidayPay(
            record
        );


    if(payRegularHolidayHours){

        payRegularHolidayHours.textContent =
            regularHolidayHours.toFixed(2);

    }


    if(payRegularHoliday){

        payRegularHoliday.textContent =
            money(
                regularHolidayPay
            );

    }


    /*
     * SPECIAL HOLIDAY
     */

    const specialHolidayPay =
        getSpecialHolidayPay(
            record
        );


    if(paySpecialHolidayHours){

        paySpecialHolidayHours.textContent =
            specialHolidayHours.toFixed(2);

    }


    if(paySpecialHoliday){

        paySpecialHoliday.textContent =
            money(
                specialHolidayPay
            );

    }


    /*
     * ======================================
     * EARNINGS
     * ======================================
     */

    const regularPay =
        num(
            record.regularPay
        );


    const overtimePay =
        num(
            record.overtimePay
        );


    const holidayPay =
        getTotalHolidayPay(
            record
        );


    const nightPay =
        getNightPay(
            record
        );


    if(payBasic){

        payBasic.textContent =
            money(
                regularPay
            );

    }


    if(payOvertime){

        payOvertime.textContent =
            money(
                overtimePay
            );

    }


    if(payHoliday){

        payHoliday.textContent =
            money(
                holidayPay
            );

    }


    if(payNight){

        payNight.textContent =
            money(
                nightPay
            );

    }


    /*
     * TABLE HOURS
     */

    if(payRegularHoursTable){

        payRegularHoursTable.textContent =
            regularHours.toFixed(2);

    }


    if(payOTHoursTable){

        payOTHoursTable.textContent =
            overtimeHours.toFixed(2);

    }


    if(payRegularHolidayHoursTable){

        payRegularHolidayHoursTable.textContent =
            regularHolidayHours.toFixed(2);

    }


    if(payRegularHolidayTable){

        payRegularHolidayTable.textContent =
            money(
                regularHolidayPay
            );

    }


    if(paySpecialHolidayHoursTable){

        paySpecialHolidayHoursTable.textContent =
            specialHolidayHours.toFixed(2);

    }


    if(paySpecialHolidayTable){

        paySpecialHolidayTable.textContent =
            money(
                specialHolidayPay
            );

    }


    if(payHolidayHoursTable){

        payHolidayHoursTable.textContent =
            holidayHours.toFixed(2);

    }


    if(payNightHoursTable){

        payNightHoursTable.textContent =
            nightHours.toFixed(2);

    }


    /*
     * OLD LEAVE FIELDS
     *
     * Auto Payroll does not currently
     * use these fields.
     */

    if(paySick){

        paySick.textContent =
            "0.00";

    }


    if(payVacation){

        payVacation.textContent =
            "0.00";

    }


    if(payBirthday){

        payBirthday.textContent =
            "0.00";

    }


    if(payMaternity){

        payMaternity.textContent =
            "0.00";

    }


    if(payPaternity){

        payPaternity.textContent =
            "0.00";

    }


    if(payAllowance){

        payAllowance.textContent =
            "0.00";

    }


    /*
     * GROSS
     */

    if(payGross){

        payGross.textContent =
            money(
                record.gross
            );

    }


    /*
     * ======================================
     * DEDUCTIONS
     * ======================================
     */

    if(paySSS){

        paySSS.textContent =
            money(
                record.sss
            );

    }


    if(payPhilhealth){

        payPhilhealth.textContent =
            money(
                record.philhealth
            );

    }


    if(payPagibig){

        payPagibig.textContent =
            money(
                record.pagibig
            );

    }


    if(payHealth){

        payHealth.textContent =
            money(
                record.healthcard
            );

    }


    if(payOther){

        payOther.textContent =
            money(
                record.others
            );

    }


    if(payDeduction){

        payDeduction.textContent =
            money(
                record.deductions
            );

    }


    /*
     * NET
     */

    if(payNet){

        payNet.textContent =
            money(
                record.net
            );

    }


    /*
     * SHOW PAYSLIP
     */

    if(employeeSection){

        employeeSection.style.display =
            "none";

    }


    if(payslipArea){

        payslipArea.style.display =
            "block";


        payslipArea.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

};


/* ==========================================
   LOAD PAYSLIP BUTTON
========================================== */

window.loadPayslip =
function(){

    if(
        selectedRecord
    ){

        viewPayslip(
            selectedRecord.id
        );

        return;

    }


    alert(
        "Please click VIEW on a payslip record first."
    );

};


/* ==========================================
   CLOSE PAYSLIP
========================================== */

window.closePayslip =
function(){

    selectedRecord =
        null;


    if(payslipArea){

        payslipArea.style.display =
            "none";

    }


    if(employeeSection){

        employeeSection.style.display =
            "block";

    }

};


/* ==========================================
   PRINT SINGLE PAYSLIP
   FIXED - ISOLATED PRINT WINDOW
   PRINTS PAYSLIP ONLY
========================================== */

window.printPayslip =
function(){

    /* ======================================
       CHECK SELECTED PAYSLIP
    ====================================== */

    if(
        !selectedRecord
    ){

        alert(
            "Please select a payslip first."
        );

        return;

    }


    const record =
        selectedRecord;


    /* ======================================
       BASIC INFORMATION
    ====================================== */

    const employeeId =
        record.employeeId
        ||
        record.employeeid
        ||
        "-";


    const employeeName =
        record.employeeName
        ||
        record.employee
        ||
        "-";


    const payrollDate =
        record.date
        ||
        "-";


    const hourlyRate =
        num(
            record.hourlyRate
        );


    /* ======================================
       HOURS
    ====================================== */

    const regularHours =
        num(
            record.regularHours
        );


    const overtimeHours =
        num(
            record.overtimeHours
        );


    const regularHolidayHours =
        getRegularHolidayHours(
            record
        );


    const specialHolidayHours =
        getSpecialHolidayHours(
            record
        );


    const holidayHours =
        num(
            record.holidayHours
        )
        ||
        (
            regularHolidayHours +
            specialHolidayHours
        );


    const nightHours =
        num(
            record.nightHours
        );


    const totalHours =
        getTotalHours(
            record
        );


    /* ======================================
       HOLIDAY PAY
    ====================================== */

    const regularHolidayPay =
        getRegularHolidayPay(
            record
        );


    const specialHolidayPay =
        getSpecialHolidayPay(
            record
        );


    const totalHolidayPay =
        getTotalHolidayPay(
            record
        );


    /* ======================================
       EARNINGS
    ====================================== */

    const regularPay =
        num(
            record.regularPay
        );


    const overtimePay =
        num(
            record.overtimePay
        );


    const nightPay =
        getNightPay(
            record
        );


    const gross =
        num(
            record.gross
        );


    /* ======================================
       DEDUCTIONS
    ====================================== */

    const sss =
        num(
            record.sss
        );


    const philhealth =
        num(
            record.philhealth
        );


    const pagibig =
        num(
            record.pagibig
        );


    const healthcard =
        num(
            record.healthcard
        );


    const others =
        num(
            record.others
        );


    const deductions =
        num(
            record.deductions
        );


    /* ======================================
       NET PAY
    ====================================== */

    const net =
        num(
            record.net
        );


    /* ======================================
       HOLIDAY TYPE
    ====================================== */

    const holidayType =
        formatHoliday(
            record.holidayType
        );


    /* ======================================
       OPEN ISOLATED PRINT WINDOW
    ====================================== */

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=900"
        );


    if(
        !printWindow
    ){

        alert(
            "Please allow pop-ups to print the payslip."
        );

        return;

    }


    /* ======================================
       PRINT HTML
    ====================================== */

    printWindow.document.open();


    printWindow.document.write(`

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0">

<title>
PAPPRITO HRIS - Employee Payslip
</title>


<style>

/* =========================================
   RESET
========================================= */

*{

    margin:0;

    padding:0;

    box-sizing:border-box;

}


/* =========================================
   PAGE
========================================= */

@page{

    size:A4 portrait;

    margin:10mm;

}


html,
body{

    width:100%;

    background:#ffffff;

    color:#111111;

    font-family:
        Arial,
        Helvetica,
        sans-serif;

}


/* =========================================
   PAYSLIP
========================================= */

.payslip{

    width:100%;

    max-width:190mm;

    margin:0 auto;

    background:#ffffff;

}


/* =========================================
   HEADER
========================================= */

.header{

    display:flex;

    align-items:center;

    justify-content:space-between;

    border-bottom:
        3px solid
        #d71920;

    padding-bottom:10px;

    margin-bottom:12px;

}


.company{

    display:flex;

    align-items:center;

    gap:10px;

}


.company img{

    width:55px;

    height:55px;

    object-fit:contain;

}


.company-name{

    font-size:22px;

    font-weight:900;

    color:#d71920;

}


.company-sub{

    font-size:10px;

    font-weight:700;

    color:#555555;

    margin-top:3px;

}


.document-title{

    text-align:right;

}


.document-title h1{

    font-size:18px;

    font-weight:900;

    margin-bottom:4px;

}


.document-title p{

    font-size:10px;

    color:#555555;

}


/* =========================================
   EMPLOYEE INFORMATION
========================================= */

.employee-info{

    display:grid;

    grid-template-columns:
        1fr
        1fr;

    border:
        1px solid
        #cccccc;

    margin-bottom:12px;

}


.info-box{

    padding:8px 10px;

    border-right:
        1px solid
        #cccccc;

    border-bottom:
        1px solid
        #cccccc;

}


.info-box:nth-child(2n){

    border-right:none;

}


.info-box:nth-last-child(-n+2){

    border-bottom:none;

}


.info-label{

    display:block;

    font-size:8px;

    font-weight:800;

    color:#666666;

    text-transform:uppercase;

    margin-bottom:3px;

}


.info-value{

    display:block;

    font-size:11px;

    font-weight:900;

}


/* =========================================
   SECTION
========================================= */

.section-title{

    background:#ffcc00;

    border:
        1px solid
        #d5aa00;

    padding:6px 8px;

    font-size:10px;

    font-weight:900;

    text-transform:uppercase;

    margin-top:10px;

}


/* =========================================
   TABLE
========================================= */

.pay-table{

    width:100%;

    border-collapse:collapse;

    margin-bottom:5px;

}


.pay-table th{

    background:#f1f1f1;

    border:
        1px solid
        #cccccc;

    padding:6px 7px;

    font-size:8px;

    font-weight:900;

    text-align:left;

}


.pay-table td{

    border:
        1px solid
        #cccccc;

    padding:6px 7px;

    font-size:9px;

}


.pay-table td:last-child,
.pay-table th:last-child{

    text-align:right;

}


.pay-table .total-row td{

    font-weight:900;

    background:#fafafa;

}


/* =========================================
   HOURS TABLE
========================================= */

.hours-table{

    width:100%;

    border-collapse:collapse;

    margin-top:6px;

}


.hours-table th{

    background:#eeeeee;

    border:
        1px solid
        #cccccc;

    padding:5px;

    font-size:8px;

    font-weight:900;

}


.hours-table td{

    border:
        1px solid
        #cccccc;

    padding:5px;

    font-size:9px;

    text-align:center;

}


/* =========================================
   GROSS / NET
========================================= */

.summary{

    display:grid;

    grid-template-columns:
        1fr
        1fr;

    gap:10px;

    margin-top:10px;

}


.summary-box{

    border:
        1px solid
        #cccccc;

    padding:10px;

}


.summary-label{

    display:block;

    font-size:9px;

    font-weight:900;

    color:#555555;

    text-transform:uppercase;

    margin-bottom:5px;

}


.summary-value{

    display:block;

    font-size:18px;

    font-weight:900;

}


.gross-box{

    background:#f8f8f8;

}


.net-box{

    background:#fff8d9;

    border:
        2px solid
        #d5aa00;

}


.net-box .summary-value{

    font-size:22px;

}


/* =========================================
   SIGNATURES
========================================= */

.signatures{

    display:grid;

    grid-template-columns:
        1fr
        1fr;

    gap:50px;

    margin-top:35px;

}


.signature{

    text-align:center;

    font-size:9px;

    font-weight:700;

}


.signature-line{

    height:28px;

    border-bottom:
        1px solid
        #222222;

    margin-bottom:5px;

}


/* =========================================
   FOOTER
========================================= */

.footer{

    margin-top:20px;

    padding-top:7px;

    border-top:
        1px solid
        #cccccc;

    text-align:center;

    font-size:7px;

    color:#777777;

}


/* =========================================
   PRINT
========================================= */

@media print{

    body{

        margin:0;

        background:#ffffff;

    }


    .payslip{

        max-width:none;

    }

}

</style>

</head>


<body>


<div class="payslip">


<!-- ======================================
     HEADER
====================================== -->

<div class="header">


<div class="company">


<img
    src="../assets/images/logo.png"
    alt="PAPPRITO">


<div>

<div class="company-name">
PAPPRITO
</div>


<div class="company-sub">
HRIS - HUMAN RESOURCES INFORMATION SYSTEM
</div>

</div>

</div>


<div class="document-title">

<h1>
EMPLOYEE PAYSLIP
</h1>


<p>
Official Payroll Document
</p>

</div>


</div>



<!-- ======================================
     EMPLOYEE INFORMATION
====================================== -->

<div class="employee-info">


<div class="info-box">

<span class="info-label">
Employee ID
</span>

<span class="info-value">
${escapeHTML(employeeId)}
</span>

</div>


<div class="info-box">

<span class="info-label">
Employee Name
</span>

<span class="info-value">
${escapeHTML(employeeName)}
</span>

</div>


<div class="info-box">

<span class="info-label">
Payroll Date
</span>

<span class="info-value">
${escapeHTML(payrollDate)}
</span>

</div>


<div class="info-box">

<span class="info-label">
Hourly Rate
</span>

<span class="info-value">
₱ ${money(hourlyRate)}
</span>

</div>


</div>



<!-- ======================================
     ATTENDANCE / HOURS
====================================== -->

<div class="section-title">

ATTENDANCE / HOURS

</div>


<table class="hours-table">


<thead>

<tr>

<th>
Regular Hours
</th>

<th>
OT Hours
</th>

<th>
Holiday Hours
</th>

<th>
Night Hours
</th>

<th>
Total Hours
</th>

</tr>

</thead>


<tbody>

<tr>

<td>
${regularHours.toFixed(2)}
</td>

<td>
${overtimeHours.toFixed(2)}
</td>

<td>
${holidayHours.toFixed(2)}
</td>

<td>
${nightHours.toFixed(2)}
</td>

<td>
<strong>
${totalHours.toFixed(2)}
</strong>
</td>

</tr>

</tbody>

</table>



<!-- ======================================
     HOLIDAY DETAILS
====================================== -->

<div class="section-title">

HOLIDAY DETAILS

</div>


<table class="pay-table">


<tr>

<td>
Holiday Type
</td>

<td>
${escapeHTML(holidayType)}
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
Regular Holiday Pay
</td>

<td>
₱ ${money(regularHolidayPay)}
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
Special Holiday Pay
</td>

<td>
₱ ${money(specialHolidayPay)}
</td>

</tr>


<tr class="total-row">

<td>
TOTAL HOLIDAY PAY
</td>

<td>
₱ ${money(totalHolidayPay)}
</td>

</tr>


</table>



<!-- ======================================
     EARNINGS
====================================== -->

<div class="section-title">

EARNINGS

</div>


<table class="pay-table">


<tr>

<td>
Regular Pay
</td>

<td>
₱ ${money(regularPay)}
</td>

</tr>


<tr>

<td>
Overtime Pay
</td>

<td>
₱ ${money(overtimePay)}
</td>

</tr>


<tr>

<td>
Holiday Pay
</td>

<td>
₱ ${money(totalHolidayPay)}
</td>

</tr>


<tr>

<td>
Night Differential
</td>

<td>
₱ ${money(nightPay)}
</td>

</tr>


<tr>

<td>
Sick Leave Pay
</td>

<td>
₱ ${money(0)}
</td>

</tr>


<tr>

<td>
Vacation Leave Pay
</td>

<td>
₱ ${money(0)}
</td>

</tr>


<tr>

<td>
Birthday Leave Pay
</td>

<td>
₱ ${money(0)}
</td>

</tr>


<tr>

<td>
Maternity Pay
</td>

<td>
₱ ${money(0)}
</td>

</tr>


<tr>

<td>
Paternity Pay
</td>

<td>
₱ ${money(0)}
</td>

</tr>


<tr>

<td>
Allowance
</td>

<td>
₱ ${money(0)}
</td>

</tr>


<tr class="total-row">

<td>
TOTAL GROSS
</td>

<td>
₱ ${money(gross)}
</td>

</tr>


</table>



<!-- ======================================
     DEDUCTIONS
====================================== -->

<div class="section-title">

DEDUCTIONS

</div>


<table class="pay-table">


<tr>

<td>
SSS
</td>

<td>
₱ ${money(sss)}
</td>

</tr>


<tr>

<td>
PhilHealth
</td>

<td>
₱ ${money(philhealth)}
</td>

</tr>


<tr>

<td>
Pag-IBIG
</td>

<td>
₱ ${money(pagibig)}
</td>

</tr>


<tr>

<td>
Health Card
</td>

<td>
₱ ${money(healthcard)}
</td>

</tr>


<tr>

<td>
Other Deduction
</td>

<td>
₱ ${money(others)}
</td>

</tr>


<tr class="total-row">

<td>
TOTAL DEDUCTION
</td>

<td>
₱ ${money(deductions)}
</td>

</tr>


</table>



<!-- ======================================
     SUMMARY
====================================== -->

<div class="summary">


<div class="summary-box gross-box">

<span class="summary-label">
Total Gross Pay
</span>


<span class="summary-value">

₱ ${money(gross)}

</span>

</div>


<div class="summary-box net-box">

<span class="summary-label">
NET PAY
</span>


<span class="summary-value">

₱ ${money(net)}

</span>

</div>


</div>



<!-- ======================================
     SIGNATURES
====================================== -->

<div class="signatures">


<div class="signature">

<div class="signature-line"></div>

HR / PAYROLL OFFICER

</div>


<div class="signature">

<div class="signature-line"></div>

EMPLOYEE

</div>


</div>



<!-- ======================================
     FOOTER
====================================== -->

<div class="footer">

This payslip is generated by PAPPRITO HRIS.
<br>
Please retain this document for your payroll records.

</div>


</div>


<script>

window.addEventListener(
    "load",
    function(){

        setTimeout(
            function(){

                window.focus();

                window.print();

            },
            500
        );

    }
);

window.addEventListener(
    "afterprint",
    function(){

        setTimeout(
            function(){

                window.close();

            },
            300
        );

    }
);

<\/script>


</body>

</html>

`);


    printWindow.document.close();

};

/* ==========================================
   PRINT ALL PAYSLIPS
   4 PAYSLIPS PER BOND PAPER
========================================== */

window.printAllPayslips =
function(){

    /*
     * IMPORTANT:
     *
     * Use filteredRecords instead of
     * autoPayrollRecords.
     *
     * Therefore, if the user searches
     * or filters the payroll records,
     * PRINT ALL prints only the records
     * currently displayed.
     */

    const recordsToPrint =
        [
            ...filteredRecords
        ];


    if(
        recordsToPrint.length === 0
    ){

        alert(
            "No payslip records available to print."
        );

        return;

    }


    const oldPrint =
        document.getElementById(
            "printAllContainer"
        );


    if(oldPrint){

        oldPrint.remove();

    }


    const container =
        document.createElement(
            "div"
        );


    container.id =
        "printAllContainer";


    recordsToPrint.forEach(
        record => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "print-payslip";


            const regularPay =
                num(
                    record.regularPay
                );


            const overtimePay =
                num(
                    record.overtimePay
                );


            const regularHolidayHours =
                getRegularHolidayHours(
                    record
                );


            const specialHolidayHours =
                getSpecialHolidayHours(
                    record
                );


            const regularHolidayPay =
                getRegularHolidayPay(
                    record
                );


            const specialHolidayPay =
                getSpecialHolidayPay(
                    record
                );


            const holidayPay =
                getTotalHolidayPay(
                    record
                );


            const nightPay =
                getNightPay(
                    record
                );


            const gross =
                num(
                    record.gross
                );


            const deductions =
                num(
                    record.deductions
                );


            const net =
                num(
                    record.net
                );


            const totalHours =
                getTotalHours(
                    record
                );


            card.innerHTML = `

<div class="mini-payslip">


<!-- ==================================
     HEADER
================================== -->

<div class="mini-header">


<div class="mini-company">


<img
    src="../assets/images/logo.png"
    alt="PAPPRITO">


<div>


<strong>
PAPPRITO
</strong>


<span>
OFFICIAL EMPLOYEE PAYSLIP
</span>


</div>


</div>


</div>



<!-- ==================================
     EMPLOYEE INFO
================================== -->

<div class="mini-info">


<div>

<b>
EMPLOYEE ID
</b>

<span>
${escapeHTML(
    record.employeeId
    ||
    record.employeeid
    ||
    "-"
)}
</span>

</div>


<div>

<b>
EMPLOYEE
</b>

<span>
${escapeHTML(
    record.employeeName
    ||
    record.employee
    ||
    "-"
)}
</span>

</div>


<div>

<b>
DATE
</b>

<span>
${escapeHTML(
    record.date
    ||
    "-"
)}
</span>

</div>


<div>

<b>
HOURLY RATE
</b>

<span>
₱ ${money(
    record.hourlyRate
)}
</span>

</div>


<div>

<b>
TOTAL HOURS
</b>

<span>
${totalHours.toFixed(2)}
</span>

</div>


</div>



<!-- ==================================
     EARNINGS
================================== -->

<div class="mini-section-title">

EARNINGS

</div>


<table class="mini-table">


<tr>

<td>
Regular Pay
</td>

<td>
₱ ${money(
    regularPay
)}
</td>

</tr>


<tr>

<td>
Overtime
</td>

<td>
₱ ${money(
    overtimePay
)}
</td>

</tr>


<tr>

<td>
Regular Holiday Pay
<br>
<small>
${regularHolidayHours.toFixed(2)} hrs
</small>
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
<br>
<small>
${specialHolidayHours.toFixed(2)} hrs
</small>
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


<tr class="total-row">

<td>
TOTAL GROSS
</td>

<td>
₱ ${money(
    gross
)}
</td>

</tr>


</table>



<!-- ==================================
     DEDUCTIONS
================================== -->

<div class="mini-section-title">

DEDUCTIONS

</div>


<table class="mini-table">


<tr>

<td>
SSS
</td>

<td>
₱ ${money(
    record.sss
)}
</td>

</tr>


<tr>

<td>
PhilHealth
</td>

<td>
₱ ${money(
    record.philhealth
)}
</td>

</tr>


<tr>

<td>
Pag-IBIG
</td>

<td>
₱ ${money(
    record.pagibig
)}
</td>

</tr>


<tr>

<td>
Health Card
</td>

<td>
₱ ${money(
    record.healthcard
)}
</td>

</tr>


<tr>

<td>
Others
</td>

<td>
₱ ${money(
    record.others
)}
</td>

</tr>


<tr class="total-row">

<td>
TOTAL DEDUCTION
</td>

<td>
₱ ${money(
    deductions
)}
</td>

</tr>


</table>



<!-- ==================================
     NET PAY
================================== -->

<div class="mini-netpay">


<span>
NET PAY
</span>


<strong>
₱ ${money(
    net
)}
</strong>


</div>



<!-- ==================================
     SIGNATURE
================================== -->

<div class="mini-signature">


<div>

<span></span>

HR

</div>


<div>

<span></span>

EMPLOYEE

</div>


</div>


</div>

`;


            container.appendChild(
                card
            );

        }
    );


    document.body.appendChild(
        container
    );


    /*
     * Let browser render
     * all payslips first.
     */

    setTimeout(
        function(){

            window.print();

        },
        300
    );

};


/* ==========================================
   BACK TO DASHBOARD
========================================== */

window.headerAction =
function(){

    /*
     * If payslip is open,
     * close it first.
     */

    if(
        payslipArea &&
        payslipArea.style.display ===
        "block"
    ){

        closePayslip();

        return;

    }


    window.location.href =
        "dashboard.html";

};


/* ==========================================
   SEARCH ENTER
========================================== */

if(searchEmployee){

    searchEmployee.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Enter"
            ){

                event.preventDefault();

                applyFilter();

            }

        }
    );

}


/* ==========================================
   DATE FILTER CHANGE
========================================== */

if(filterDate){

    filterDate.addEventListener(
        "change",
        function(){

            applyFilter();

        }
    );

}


/* ==========================================
   INITIAL UI
========================================== */

if(payslipArea){

    payslipArea.style.display =
        "none";

}


/* ==========================================
   INITIAL DATE
========================================== */

if(filterDate){

    /*
     * Do not automatically filter.
     * Show all Auto Payroll records.
     */

    filterDate.value =
        "";

}


/* ==========================================
   START
========================================== */

async function initializePayslip(){

    await loadAutoPayroll();


    console.log(
        "PAPPRITO HRIS Admin Payslip Ready - Auto Payroll Based"
    );

}


initializePayslip();
