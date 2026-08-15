/* ==========================================
   PAPPRITO HRIS
   AUTO PAYROLL SYSTEM
   HOURLY COMPUTATION ONLY
========================================== */

import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let employees = [];

let autoPayrollRecords = [];

let editingId = null;


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

const salaryRate =
    document.getElementById(
        "salaryRate"
    );

const payrollDate =
    document.getElementById(
        "payrollDate"
    );

const totalHours =
    document.getElementById(
        "totalHours"
    );

const overtimeHours =
    document.getElementById(
        "overtimeHours"
    );

const holidayType =
    document.getElementById(
        "holidayType"
    );

const holidayHours =
    document.getElementById(
        "holidayHours"
    );


/* ==========================================
   NEW HOLIDAY ELEMENTS
========================================== */

const regularHolidayHours =
    document.getElementById(
        "regularHolidayHours"
    );

const specialHolidayHours =
    document.getElementById(
        "specialHolidayHours"
    );


const nightHours =
    document.getElementById(
        "nightHours"
    );

const nightRate =
    document.getElementById(
        "nightRate"
    );

const sss =
    document.getElementById(
        "sss"
    );

const philhealth =
    document.getElementById(
        "philhealth"
    );

const pagibig =
    document.getElementById(
        "pagibig"
    );

const healthcard =
    document.getElementById(
        "healthcard"
    );

const others =
    document.getElementById(
        "others"
    );


/* ==========================================
   COMPUTATION ELEMENTS
========================================== */

const displayBasicPay =
    document.getElementById(
        "displayBasicPay"
    );

const displayOvertimePay =
    document.getElementById(
        "displayOvertimePay"
    );

const displayHolidayPay =
    document.getElementById(
        "displayHolidayPay"
    );


const displayRegularHolidayPay =
    document.getElementById(
        "displayRegularHolidayPay"
    );


const displaySpecialHolidayPay =
    document.getElementById(
        "displaySpecialHolidayPay"
    );


const displayNightPay =
    document.getElementById(
        "displayNightPay"
    );

const grossSalary =
    document.getElementById(
        "grossSalary"
    );

const totalDeduction =
    document.getElementById(
        "totalDeduction"
    );

const netSalary =
    document.getElementById(
        "netSalary"
    );


/* ==========================================
   RECORD ELEMENTS
========================================== */

const filterDate =
    document.getElementById(
        "filterDate"
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

const autoPayrollTable =
    document.getElementById(
        "autoPayrollTable"
    );


/* ==========================================
   HELPERS
========================================== */

function text(value){

    return String(
        value ?? ""
    ).trim();

}


function num(value){

    const result =
        Number(
            value || 0
        );

    return Number.isFinite(result)
        ? result
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


function moneyValue(value){

    return num(value).toFixed(2);

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


function getToday(){

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


function getEmployeeName(
    employee
){

    return [

        employee.firstname || "",

        employee.middlename || "",

        employee.lastname || ""

    ]

    .filter(
        value =>
            text(value) !== ""
    )

    .join(" ")

    .replace(
        /\s+/g,
        " "
    )

    .trim();

}


/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    try{

        employees = [];


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "employees"
                )
            );


        snapshot.forEach(
            docSnap => {

                employees.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        populateEmployeeDropdown();


    }catch(error){

        console.error(
            "Load Employees Error:",
            error
        );


        alert(
            "Unable to load Employee Masterlist.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   EMPLOYEE DROPDOWN
========================================== */

function populateEmployeeDropdown(){

    if(
        !employeeName
    ){

        return;

    }


    employeeName.innerHTML = `

<option value="">

Select Employee

</option>

`;


    employees

    .filter(
        employee => {

            const status =
                text(
                    employee.status
                );


            return (
                status === "" ||
                status.toUpperCase() ===
                "ACTIVE"
            );

        }
    )

    .sort(
        (
            a,
            b
        ) => {

            return getEmployeeName(
                a
            ).localeCompare(
                getEmployeeName(
                    b
                )
            );

        }
    )

    .forEach(
        employee => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                employee.id;


            option.textContent =

                (
                    employee.employeeid
                    ||
                    ""
                )

                +

                " - "

                +

                getEmployeeName(
                    employee
                );


            employeeName.appendChild(
                option
            );

        }
    );

}


/* ==========================================
   SELECT EMPLOYEE
========================================== */

if(
    employeeName
){

    employeeName.addEventListener(
        "change",
        function(){

            const selectedId =
                this.value;


            const employee =
                employees.find(
                    item =>
                        item.id ===
                        selectedId
                );


            if(
                !employee
            ){

                employeeId.value =
                    "";

                salaryRate.value =
                    "";

                return;

            }


            employeeId.value =
                employee.employeeid
                ||
                "";


            salaryRate.value =
                employee.salary
                ||
                "";

        }
    );

}


/* ==========================================
   HOLIDAY MULTIPLIER
========================================== */

function getHolidayMultiplier(){

    if(
        !holidayType
    ){

        return 0;

    }


    switch(
        holidayType.value
    ){

        case "regular":

            return 2.00;


        case "special":

            return 1.30;


        default:

            return 0;

    }

}


/* ==========================================
   COMPUTE AUTO PAYROLL
========================================== */

window.computeAutoPayroll =
function(){

    const rate =
        num(
            salaryRate?.value
        );


    const regularHours =
        num(
            totalHours?.value
        );


    const overtime =
        num(
            overtimeHours?.value
        );


    /*
     * ======================================
     * OLD HOLIDAY HOURS
     * ======================================
     *
     * Kept for compatibility with
     * existing records / old form.
     */

    const oldHolidayHrs =
        num(
            holidayHours?.value
        );


    /*
     * ======================================
     * NEW HOLIDAY HOURS
     * ======================================
     */

    let regularHolidayHrs =
        num(
            regularHolidayHours?.value
        );


    let specialHolidayHrs =
        num(
            specialHolidayHours?.value
        );


    /*
     * ======================================
     * BACKWARD COMPATIBILITY
     * ======================================
     *
     * If the NEW fields are empty,
     * use the old Holiday Type +
     * Holiday Hours fields.
     */

    if(
        regularHolidayHrs <= 0 &&
        specialHolidayHrs <= 0 &&
        oldHolidayHrs > 0
    ){

        if(
            holidayType?.value ===
            "regular"
        ){

            regularHolidayHrs =
                oldHolidayHrs;

        }


        else if(
            holidayType?.value ===
            "special"
        ){

            specialHolidayHrs =
                oldHolidayHrs;

        }

    }


    const nightHrs =
        num(
            nightHours?.value
        );


    const ndRate =
        num(
            nightRate?.value
        );


    /* ======================================
       REGULAR PAY
    ====================================== */

    const regularPay =
        rate *
        regularHours;


    /* ======================================
       OVERTIME
       
       Hourly Rate × 125%
    ====================================== */

    const overtimePay =
        rate *
        1.25 *
        overtime;


    /* ======================================
       REGULAR HOLIDAY PAY
       
       Hourly Rate × 200%
       ====================================== */

    const regularHolidayPay =
        rate *
        2.00 *
        regularHolidayHrs;


    /* ======================================
       SPECIAL HOLIDAY PAY
       
       Hourly Rate × 130%
       ====================================== */

    const specialHolidayPay =
        rate *
        1.30 *
        specialHolidayHrs;


    /* ======================================
       TOTAL HOLIDAY PAY
    ====================================== */

    const holidayPay =
        regularHolidayPay +
        specialHolidayPay;


    /* ======================================
       NIGHT DIFFERENTIAL
       
       Hourly Rate × ND% × ND Hours
    ====================================== */

    const nightPay =
        rate *
        (
            ndRate / 100
        ) *
        nightHrs;


    /* ======================================
       GROSS
    ====================================== */

    const gross =
        regularPay +
        overtimePay +
        holidayPay +
        nightPay;


    /* ======================================
       DEDUCTIONS
    ====================================== */

    const sssAmount =
        num(
            sss?.value
        );


    const philhealthAmount =
        num(
            philhealth?.value
        );


    const pagibigAmount =
        num(
            pagibig?.value
        );


    const healthAmount =
        num(
            healthcard?.value
        );


    const otherAmount =
        num(
            others?.value
        );


    const deductions =
        sssAmount +
        philhealthAmount +
        pagibigAmount +
        healthAmount +
        otherAmount;


    /* ======================================
       NET PAY
    ====================================== */

    const net =
        gross -
        deductions;


    /* ======================================
       DISPLAY BASIC
    ====================================== */

    if(
        displayBasicPay
    ){

        displayBasicPay.innerText =
            "₱ " +
            money(
                regularPay
            );

    }


    /* ======================================
       DISPLAY OVERTIME
    ====================================== */

    if(
        displayOvertimePay
    ){

        displayOvertimePay.innerText =
            "₱ " +
            money(
                overtimePay
            );

    }


    /* ======================================
       DISPLAY REGULAR HOLIDAY
    ====================================== */

    if(
        displayRegularHolidayPay
    ){

        displayRegularHolidayPay.innerText =
            "₱ " +
            money(
                regularHolidayPay
            );

    }


    /* ======================================
       DISPLAY SPECIAL HOLIDAY
    ====================================== */

    if(
        displaySpecialHolidayPay
    ){

        displaySpecialHolidayPay.innerText =
            "₱ " +
            money(
                specialHolidayPay
            );

    }


    /* ======================================
       DISPLAY TOTAL HOLIDAY
    ====================================== */

    if(
        displayHolidayPay
    ){

        displayHolidayPay.innerText =
            "₱ " +
            money(
                holidayPay
            );

    }


    /* ======================================
       DISPLAY NIGHT
    ====================================== */

    if(
        displayNightPay
    ){

        displayNightPay.innerText =
            "₱ " +
            money(
                nightPay
            );

    }


    /* ======================================
       DISPLAY GROSS
    ====================================== */

    if(
        grossSalary
    ){

        grossSalary.innerText =
            "₱ " +
            money(
                gross
            );

    }


    /* ======================================
       DISPLAY DEDUCTION
    ====================================== */

    if(
        totalDeduction
    ){

        totalDeduction.innerText =
            "₱ " +
            money(
                deductions
            );

    }


    /* ======================================
       DISPLAY NET
    ====================================== */

    if(
        netSalary
    ){

        netSalary.innerText =
            "₱ " +
            money(
                net
            );

    }


    /* ======================================
       RETURN COMPUTATION
    ====================================== */

    return {

        rate:

            rate,


        regularHours:

            regularHours,


        overtimeHours:

            overtime,


        holidayType:

            holidayType
            ?
            holidayType.value
            :
            "none",


        /*
         * OLD FIELD
         */

        holidayHours:

            oldHolidayHrs,


        /*
         * NEW FIELDS
         */

        regularHolidayHours:

            regularHolidayHrs,


        specialHolidayHours:

            specialHolidayHrs,


        nightHours:

            nightHrs,


        nightRate:

            ndRate,


        regularPay:

            regularPay,


        overtimePay:

            overtimePay,


        regularHolidayPay:

            regularHolidayPay,


        specialHolidayPay:

            specialHolidayPay,


        holidayPay:

            holidayPay,


        nightPay:

            nightPay,


        gross:

            gross,


        sss:

            sssAmount,


        philhealth:

            philhealthAmount,


        pagibig:

            pagibigAmount,


        healthcard:

            healthAmount,


        others:

            otherAmount,


        deductions:

            deductions,


        net:

            net

    };

};


/* ==========================================
   SAVE AUTO PAYROLL
========================================== */

window.saveAutoPayroll =
async function(){

    const selectedEmployee =
        employeeName
        ?
        employees.find(
            employee =>
                employee.id ===
                employeeName.value
        )
        :
        null;


    if(
        !selectedEmployee
    ){

        alert(
            "Please select an employee."
        );

        return;

    }


    const rate =
        num(
            salaryRate?.value
        );


    if(
        rate <= 0
    ){

        alert(
            "Please enter a valid hourly rate."
        );

        return;

    }


    const date =
        payrollDate?.value
        ||
        getToday();


    if(
        !date
    ){

        alert(
            "Please select the computation date."
        );

        return;

    }


    const calculation =
        computeAutoPayroll();


    /*
     * ======================================
     * CHECK WORKING HOURS
     * ======================================
     */

    if(

        calculation.regularHours <= 0 &&

        calculation.overtimeHours <= 0 &&

        calculation.holidayHours <= 0 &&

        calculation.regularHolidayHours <= 0 &&

        calculation.specialHolidayHours <= 0 &&

        calculation.nightHours <= 0

    ){

        alert(
            "Please enter at least one working hour."
        );

        return;

    }


    const employeeFullName =
        getEmployeeName(
            selectedEmployee
        );


    /*
     * ======================================
     * AUTO PAYROLL DATA
     * ======================================
     */

    const data = {

        employeeDocId:
            selectedEmployee.id,


        employeeId:
            selectedEmployee.employeeid
            ||
            "",


        employeeName:
            employeeFullName,


        hourlyRate:
            calculation.rate,


        date:
            date,


        regularHours:
            calculation.regularHours,


        overtimeHours:
            calculation.overtimeHours,


        /*
         * ==================================
         * HOLIDAY INFORMATION
         * ==================================
         */

        holidayType:
            calculation.holidayType,


        /*
         * OLD FIELD
         */

        holidayHours:
            calculation.holidayHours,


        /*
         * NEW FIELDS
         */

        regularHolidayHours:
            calculation.regularHolidayHours,


        specialHolidayHours:
            calculation.specialHolidayHours,


        /*
         * ==================================
         * PAYMENTS
         * ==================================
         */

        regularPay:
            calculation.regularPay,


        overtimePay:
            calculation.overtimePay,


        regularHolidayPay:
            calculation.regularHolidayPay,


        specialHolidayPay:
            calculation.specialHolidayPay,


        holidayPay:
            calculation.holidayPay,


        nightHours:
            calculation.nightHours,


        nightRate:
            calculation.nightRate,


        nightPay:
            calculation.nightPay,


        /*
         * ==================================
         * GROSS
         * ==================================
         */

        gross:
            calculation.gross,


        /*
         * ==================================
         * DEDUCTIONS
         * ==================================
         */

        sss:
            calculation.sss,


        philhealth:
            calculation.philhealth,


        pagibig:
            calculation.pagibig,


        healthcard:
            calculation.healthcard,


        others:
            calculation.others,


        deductions:
            calculation.deductions,


        /*
         * ==================================
         * NET
         * ==================================
         */

        net:
            calculation.net,


        updatedAt:
            Date.now()

    };


    try{

        /*
         * ==================================
         * UPDATE
         * ==================================
         */

        if(
            editingId
        ){

            await updateDoc(

                doc(
                    db,
                    "autoPayroll",
                    editingId
                ),

                data

            );


            alert(
                "Auto Payroll updated successfully."
            );


            editingId =
                null;

        }


        /*
         * ==================================
         * NEW RECORD
         * ==================================
         */

        else{

            data.createdAt =
                Date.now();


            await addDoc(

                collection(
                    db,
                    "autoPayroll"
                ),

                data

            );


            alert(
                "Auto Payroll saved successfully."
            );

        }


        await loadAutoPayroll();

        clearAutoPayrollForm();


    }catch(error){

        console.error(
            "Auto Payroll Save Error:",
            error
        );


        alert(
            "Failed to save Auto Payroll.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   LOAD AUTO PAYROLL
========================================== */

window.loadAutoPayroll =
async function(){

    try{

        autoPayrollRecords = [];


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "autoPayroll"
                )
            );


        snapshot.forEach(
            docSnap => {

                autoPayrollRecords.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        autoPayrollRecords.sort(
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


        renderAutoPayroll(
            autoPayrollRecords
        );


    }catch(error){

        console.error(
            "Load Auto Payroll Error:",
            error
        );


        const tbody =
            autoPayrollTable
            ?
            autoPayrollTable.querySelector(
                "tbody"
            )
            :
            null;


        if(
            tbody
        ){

            tbody.innerHTML = `

<tr>

<td
colspan="13"
class="empty-row">

Unable to load Auto Payroll records.

</td>

</tr>

`;

        }

    }

};


/* ==========================================
   RENDER TABLE
========================================== */

function renderAutoPayroll(
    records
){

    if(
        !autoPayrollTable
    ){

        return;

    }


    const tbody =
        autoPayrollTable.querySelector(
            "tbody"
        );


    if(
        !tbody
    ){

        return;

    }


    tbody.innerHTML =
        "";


    if(
        records.length === 0
    ){

        tbody.innerHTML = `

<tr>

<td
colspan="13"
class="empty-row">

No Auto Payroll records available.

</td>

</tr>

`;

        updateRecordSummary(
            []
        );

        return;

    }


    records.forEach(
        record => {

            const regularHolidayHrs =
                num(
                    record.regularHolidayHours
                );


            const specialHolidayHrs =
                num(
                    record.specialHolidayHours
                );


            /*
             * ==================================
             * BACKWARD COMPATIBILITY
             * ==================================
             */

            let oldHolidayHrs =
                num(
                    record.holidayHours
                );


            if(
                regularHolidayHrs <= 0 &&
                specialHolidayHrs <= 0 &&
                oldHolidayHrs > 0
            ){

                /*
                 * Old regular holiday record
                 */

                if(
                    record.holidayType ===
                    "regular"
                ){

                    oldHolidayHrs =
                        oldHolidayHrs;

                }

            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

<td>

${escapeHTML(
    record.date ||
    "-"
)}

</td>


<td>

${escapeHTML(
    record.employeeId ||
    "-"
)}

</td>


<td>

${escapeHTML(
    record.employeeName ||
    "-"
)}

</td>


<td>

₱ ${money(
    record.hourlyRate
)}

</td>


<td>

${money(
    record.regularHours
)}

</td>


<td>

${money(
    record.overtimeHours
)}

</td>


<td>

${escapeHTML(
    formatHolidayType(
        record
    )
)}

</td>


<td>

${money(
    regularHolidayHrs +
    specialHolidayHrs +
    oldHolidayHrs
)}

</td>


<td>

${money(
    record.nightHours
)}

</td>


<td>

₱ ${money(
    record.gross
)}

</td>


<td>

₱ ${money(
    record.deductions
)}

</td>


<td>

<strong>

₱ ${money(
    record.net
)}

</strong>

</td>


<td>


<button
type="button"
class="table-icon-btn"
title="Edit"
onclick="editAutoPayroll(
    '${record.id}'
)">

<span class="material-icons">
edit
</span>

</button>


<button
type="button"
class="table-icon-btn"
title="Delete"
onclick="deleteAutoPayroll(
    '${record.id}'
)">

<span class="material-icons">
delete
</span>

</button>


</td>

`;


            tbody.appendChild(
                row
            );

        }
    );


    updateRecordSummary(
        records
    );

}


/* ==========================================
   HOLIDAY DISPLAY
========================================== */

function formatHolidayType(
    record
){

    /*
     * ======================================
     * NEW RECORD
     * ======================================
     */

    const regular =
        num(
            record.regularHolidayHours
        );


    const special =
        num(
            record.specialHolidayHours
        );


    if(
        regular > 0 &&
        special > 0
    ){

        return "Regular + Special";

    }


    if(
        regular > 0
    ){

        return "Regular Holiday";

    }


    if(
        special > 0
    ){

        return "Special Holiday";

    }


    /*
     * ======================================
     * OLD RECORD
     * ======================================
     */

    switch(
        text(
            record.holidayType
        )
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
   SUMMARY
========================================== */

function updateRecordSummary(
    records
){

    const gross =
        records.reduce(
            (
                total,
                record
            ) => {

                return total +
                    num(
                        record.gross
                    );

            },
            0
        );


    const net =
        records.reduce(
            (
                total,
                record
            ) => {

                return total +
                    num(
                        record.net
                    );

            },
            0
        );


    if(
        totalRecords
    ){

        totalRecords.innerText =
            records.length;

    }


    if(
        totalGross
    ){

        totalGross.innerText =
            "₱ " +
            money(
                gross
            );

    }


    if(
        totalNet
    ){

        totalNet.innerText =
            "₱ " +
            money(
                net
            );

    }

}


/* ==========================================
   FILTER
========================================== */

window.filterAutoPayroll =
function(){

    const date =
        filterDate
        ?
        filterDate.value
        :
        "";


    if(
        !date
    ){

        renderAutoPayroll(
            autoPayrollRecords
        );

        return;

    }


    const filtered =
        autoPayrollRecords.filter(
            record =>
                record.date ===
                date
        );


    renderAutoPayroll(
        filtered
    );

};


/* ==========================================
   EDIT
========================================== */

window.editAutoPayroll =
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
            "Auto Payroll record not found."
        );

        return;

    }


    editingId =
        id;


    /* ======================================
       EMPLOYEE
    ====================================== */

    if(
        employeeName
    ){

        employeeName.value =
            record.employeeDocId
            ||
            "";

    }


    /* ======================================
       EMPLOYEE ID
    ====================================== */

    if(
        employeeId
    ){

        employeeId.value =
            record.employeeId
            ||
            "";

    }


    /* ======================================
       RATE
    ====================================== */

    if(
        salaryRate
    ){

        salaryRate.value =
            record.hourlyRate
            ||
            "";

    }


    /* ======================================
       DATE
    ====================================== */

    if(
        payrollDate
    ){

        payrollDate.value =
            record.date
            ||
            "";

    }


    /* ======================================
       REGULAR HOURS
    ====================================== */

    if(
        totalHours
    ){

        totalHours.value =
            record.regularHours
            ||
            "";

    }


    /* ======================================
       OVERTIME HOURS
    ====================================== */

    if(
        overtimeHours
    ){

        overtimeHours.value =
            record.overtimeHours
            ||
            "";

    }


    /* ======================================
       OLD HOLIDAY
    ====================================== */

    if(
        holidayType
    ){

        holidayType.value =
            record.holidayType
            ||
            "none";

    }


    if(
        holidayHours
    ){

        holidayHours.value =
            record.holidayHours
            ||
            "";

    }


    /* ======================================
       NEW REGULAR HOLIDAY
    ====================================== */

    if(
        regularHolidayHours
    ){

        regularHolidayHours.value =
            record.regularHolidayHours
            ||
            "";

    }


    /* ======================================
       NEW SPECIAL HOLIDAY
    ====================================== */

    if(
        specialHolidayHours
    ){

        specialHolidayHours.value =
            record.specialHolidayHours
            ||
            "";

    }


    /* ======================================
       NIGHT DIFFERENTIAL
    ====================================== */

    if(
        nightHours
    ){

        nightHours.value =
            record.nightHours
            ||
            "";

    }


    if(
        nightRate
    ){

        nightRate.value =
            record.nightRate ??
            10;

    }


    /* ======================================
       DEDUCTIONS
    ====================================== */

    if(
        sss
    ){

        sss.value =
            record.sss
            ||
            "";

    }


    if(
        philhealth
    ){

        philhealth.value =
            record.philhealth
            ||
            "";

    }


    if(
        pagibig
    ){

        pagibig.value =
            record.pagibig
            ||
            "";

    }


    if(
        healthcard
    ){

        healthcard.value =
            record.healthcard
            ||
            "";

    }


    if(
        others
    ){

        others.value =
            record.others
            ||
            "";

    }


    /* ======================================
       RECALCULATE
    ====================================== */

    computeAutoPayroll();


    /* ======================================
       SCROLL TOP
    ====================================== */

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

};


/* ==========================================
   DELETE
========================================== */

window.deleteAutoPayroll =
async function(
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

        return;

    }


    const confirmed =
        confirm(

            "Delete this Auto Payroll record?\n\n" +

            (
                record.employeeName ||
                "-"
            )

            +

            "\n"

            +

            (
                record.date ||
                "-"
            )

        );


    if(
        !confirmed
    ){

        return;

    }


    try{

        await deleteDoc(

            doc(
                db,
                "autoPayroll",
                id
            )

        );


        autoPayrollRecords =
            autoPayrollRecords.filter(
                item =>
                    item.id !==
                    id
            );


        renderAutoPayroll(
            autoPayrollRecords
        );


        alert(
            "Auto Payroll deleted successfully."
        );


    }catch(error){

        console.error(
            "Delete Auto Payroll Error:",
            error
        );


        alert(
            "Failed to delete Auto Payroll.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   CLEAR FORM
========================================== */

window.clearAutoPayrollForm =
function(){

    editingId =
        null;


    if(
        employeeName
    ){

        employeeName.value =
            "";

    }


    if(
        employeeId
    ){

        employeeId.value =
            "";

    }


    if(
        salaryRate
    ){

        salaryRate.value =
            "";

    }


    if(
        payrollDate
    ){

        payrollDate.value =
            getToday();

    }


    if(
        totalHours
    ){

        totalHours.value =
            "";

    }


    if(
        overtimeHours
    ){

        overtimeHours.value =
            "";

    }


    if(
        holidayType
    ){

        holidayType.value =
            "none";

    }


    if(
        holidayHours
    ){

        holidayHours.value =
            "";

    }


    /* ======================================
       NEW HOLIDAY FIELDS
    ====================================== */

    if(
        regularHolidayHours
    ){

        regularHolidayHours.value =
            "";

    }


    if(
        specialHolidayHours
    ){

        specialHolidayHours.value =
            "";

    }


    if(
        nightHours
    ){

        nightHours.value =
            "";

    }


    if(
        nightRate
    ){

        nightRate.value =
            "10";

    }


    if(
        sss
    ){

        sss.value =
            "";

    }


    if(
        philhealth
    ){

        philhealth.value =
            "";

    }


    if(
        pagibig
    ){

        pagibig.value =
            "";

    }


    if(
        healthcard
    ){

        healthcard.value =
            "";

    }


    if(
        others
    ){

        others.value =
            "";

    }


    resetComputationDisplay();

};


/* ==========================================
   RESET COMPUTATION
========================================== */

function resetComputationDisplay(){

    if(
        displayBasicPay
    ){

        displayBasicPay.innerText =
            "₱ 0.00";

    }


    if(
        displayOvertimePay
    ){

        displayOvertimePay.innerText =
            "₱ 0.00";

    }


    if(
        displayHolidayPay
    ){

        displayHolidayPay.innerText =
            "₱ 0.00";

    }


    if(
        displayRegularHolidayPay
    ){

        displayRegularHolidayPay.innerText =
            "₱ 0.00";

    }


    if(
        displaySpecialHolidayPay
    ){

        displaySpecialHolidayPay.innerText =
            "₱ 0.00";

    }


    if(
        displayNightPay
    ){

        displayNightPay.innerText =
            "₱ 0.00";

    }


    if(
        grossSalary
    ){

        grossSalary.innerText =
            "₱ 0.00";

    }


    if(
        totalDeduction
    ){

        totalDeduction.innerText =
            "₱ 0.00";

    }


    if(
        netSalary
    ){

        netSalary.innerText =
            "₱ 0.00";

    }

}


/* ==========================================
   REFRESH
========================================== */

window.refreshAutoPayroll =
async function(){

    await loadEmployees();

    await loadAutoPayroll();

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
   PRINT
========================================== */

window.printAutoPayroll =
function(){

    window.print();

};


/* ==========================================
   AUTO COMPUTE ON INPUT
========================================== */

[
    salaryRate,

    totalHours,

    overtimeHours,

    holidayHours,

    regularHolidayHours,

    specialHolidayHours,

    nightHours,

    nightRate,

    sss,

    philhealth,

    pagibig,

    healthcard,

    others

]

.forEach(
    element => {

        if(
            element
        ){

            element.addEventListener(
                "input",
                function(){

                    computeAutoPayroll();

                }
            );

        }

    }
);


/* ==========================================
   HOLIDAY TYPE CHANGE
========================================== */

if(
    holidayType
){

    holidayType.addEventListener(
        "change",
        function(){

            computeAutoPayroll();

        }
    );

}


/* ==========================================
   INITIALIZE
========================================== */

async function initialize(){

    if(
        payrollDate
    ){

        payrollDate.value =
            getToday();

    }


    if(
        filterDate
    ){

        filterDate.value =
            getToday();

    }


    await loadEmployees();

    await loadAutoPayroll();

}


/* ==========================================
   START
========================================== */

initialize();
