/* ==========================================
   PAPPRITO HRIS
   AUTO PAYROLL SYSTEM JS
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
   GLOBAL
========================================== */

let employees = [];

let attendanceRecords = [];

let payrollRecords = [];

let editingPayrollId = null;


/* ==========================================
   ELEMENTS
========================================== */

const employeeName =
    document.getElementById("employeeName");

const employeeId =
    document.getElementById("employeeId");

const salaryRate =
    document.getElementById("salaryRate");

const totalHours =
    document.getElementById("totalHours");

const overtimeHours =
    document.getElementById("overtimeHours");

const holidayType =
    document.getElementById("holidayType");

const holidayHours =
    document.getElementById("holidayHours");

const nightHours =
    document.getElementById("nightHours");

const sss =
    document.getElementById("sss");

const philhealth =
    document.getElementById("philhealth");

const pagibig =
    document.getElementById("pagibig");

const healthcard =
    document.getElementById("healthcard");

const others =
    document.getElementById("others");

const grossSalary =
    document.getElementById("grossSalary");

const netSalary =
    document.getElementById("netSalary");

const filterDate =
    document.getElementById("filterDate");

const totalPayroll =
    document.getElementById("totalPayroll");

const payrollTable =
    document.getElementById("payrollTable");


/* ==========================================
   HELPERS
========================================== */

function text(value){

    return String(
        value ?? ""
    ).trim();

}


function number(value){

    const result =
        Number(value || 0);

    return Number.isFinite(result)
        ? result
        : 0;

}


function money(value){

    return number(value)
        .toFixed(2);

}


function escapeHTML(value){

    return String(
        value ?? ""
    )

    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


function getToday(){

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2,"0");

    const day =
        String(
            date.getDate()
        ).padStart(2,"0");

    return `${year}-${month}-${day}`;

}


function getEmployeeFullName(employee){

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
   HOLIDAY MULTIPLIERS
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


        employees.sort(
            (a,b) => {

                const nameA =
                    getEmployeeFullName(
                        a
                    ).toLowerCase();

                const nameB =
                    getEmployeeFullName(
                        b
                    ).toLowerCase();

                return nameA.localeCompare(
                    nameB
                );

            }
        );


        populateEmployees();


    }catch(error){

        console.error(
            "Employee Load Error:",
            error
        );

        alert(
            "Failed to load employees.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   POPULATE EMPLOYEE DROPDOWN
========================================== */

function populateEmployees(){

    if(!employeeName){

        return;

    }


    employeeName.innerHTML = `

<option value="">
Select Employee
</option>

`;


    employees.forEach(
        employee => {

            if(
                employee.status &&
                employee.status !== "Active"
            ){

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                employee.id;


            option.textContent =

                `${employee.employeeid || ""} - ` +
                `${getEmployeeFullName(employee)}`;


            employeeName.appendChild(
                option
            );

        }
    );

}


/* ==========================================
   EMPLOYEE SELECT
========================================== */

if(employeeName){

    employeeName.addEventListener(
        "change",
        async function(){

            const id =
                this.value;


            const employee =
                employees.find(
                    item =>
                        item.id === id
                );


            if(!employee){

                clearEmployeeFields();

                return;

            }


            employeeId.value =
                employee.employeeid || "";


            /*
             * Employee masterlist salary
             */

            if(
                employee.salary !== undefined &&
                employee.salary !== null
            ){

                salaryRate.value =
                    number(
                        employee.salary
                    );

            }


            /*
             * Load attendance
             */

            await loadEmployeeAttendance();

            /*
             * Automatically calculate
             */

            computePayroll();

        }
    );

}


/* ==========================================
   CLEAR EMPLOYEE FIELDS
========================================== */

function clearEmployeeFields(){

    if(employeeId)
        employeeId.value = "";

    if(salaryRate)
        salaryRate.value = "";

    if(totalHours)
        totalHours.value = "";

    if(overtimeHours)
        overtimeHours.value = "";

    if(holidayHours)
        holidayHours.value = "";

    if(nightHours)
        nightHours.value = "";

    if(grossSalary)
        grossSalary.value = "";

    if(netSalary)
        netSalary.value = "";

}


/* ==========================================
   LOAD ATTENDANCE
========================================== */

async function loadEmployeeAttendance(){

    const selectedEmployee =
        employeeName
        ?
        employees.find(
            item =>
                item.id ===
                employeeName.value
        )
        :
        null;


    if(!selectedEmployee){

        return;

    }


    const empId =
        text(
            selectedEmployee.employeeid
        )
        .toUpperCase();


    attendanceRecords = [];


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "attendance"
                )
            );


        snapshot.forEach(
            docSnap => {

                const attendance =
                    docSnap.data();


                const attendanceId =
                    text(
                        attendance.employeeid ||
                        attendance.empid
                    )
                    .toUpperCase();


                if(
                    attendanceId ===
                    empId
                ){

                    attendanceRecords.push({

                        id:
                            docSnap.id,

                        ...attendance

                    });

                }

            }
        );


        /*
         * Get latest attendance period
         */

        attendanceRecords.sort(
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


        calculateAttendanceTotals();


    }catch(error){

        console.error(
            "Attendance Load Error:",
            error
        );

    }

}


/* ==========================================
   CALCULATE ATTENDANCE TOTALS
========================================== */

function calculateAttendanceTotals(){

    let regular = 0;

    let overtime = 0;

    let holiday = 0;

    let night = 0;


    attendanceRecords.forEach(
        record => {

            regular +=
                number(
                    record.regularHours
                );


            overtime +=
                number(
                    record.overtimeHours
                );


            /*
             * Compatible with
             * different attendance fields
             */

            if(
                record.holidayHours
            ){

                holiday +=
                    number(
                        record.holidayHours
                    );

            }


            if(
                record.nightHours
            ){

                night +=
                    number(
                        record.nightHours
                    );

            }


            /*
             * If the attendance JS
             * stores calculated fields
             */

            if(
                record.regularhours
            ){

                regular +=
                    number(
                        record.regularhours
                    );

            }


            if(
                record.overtime
            ){

                overtime +=
                    number(
                        record.overtime
                    );

            }

        }
    );


    /*
     * If no saved calculated values,
     * calculate from time fields.
     */

    if(
        regular === 0 &&
        overtime === 0
    ){

        attendanceRecords.forEach(
            record => {

                const work =
                    calculateWorkHours(
                        record
                    );


                if(work <= 8){

                    regular +=
                        work;

                }else{

                    regular += 8;

                    overtime +=
                        work - 8;

                }

            }
        );

    }


    if(totalHours){

        totalHours.value =
            regular.toFixed(2);

    }


    if(overtimeHours){

        overtimeHours.value =
            overtime.toFixed(2);

    }


    if(holidayHours){

        holidayHours.value =
            holiday.toFixed(2);

    }


    if(nightHours){

        nightHours.value =
            night.toFixed(2);

    }

}


/* ==========================================
   CALCULATE WORK HOURS
========================================== */

function calculateWorkHours(record){

    if(
        !record.timeIn ||
        !record.timeOut
    ){

        return 0;

    }


    const start =
        timeToMinutes(
            record.timeIn
        );


    const end =
        timeToMinutes(
            record.timeOut
        );


    if(
        start === null ||
        end === null
    ){

        return 0;

    }


    let minutes =
        end - start;


    if(minutes < 0){

        minutes +=
            1440;

    }


    /*
     * Deduct break
     */

    if(
        record.breakOut &&
        record.breakIn
    ){

        const breakOut =
            timeToMinutes(
                record.breakOut
            );


        const breakIn =
            timeToMinutes(
                record.breakIn
            );


        if(
            breakOut !== null &&
            breakIn !== null &&
            breakIn > breakOut
        ){

            minutes -=
                breakIn -
                breakOut;

        }

    }


    if(minutes < 0){

        minutes = 0;

    }


    return minutes / 60;

}


/* ==========================================
   TIME TO MINUTES
========================================== */

function timeToMinutes(time){

    if(!time){

        return null;

    }


    const parts =
        String(
            time
        ).split(":");


    if(parts.length < 2){

        return null;

    }


    const hours =
        Number(
            parts[0]
        );


    const minutes =
        Number(
            parts[1]
        );


    if(
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ){

        return null;

    }


    return (
        hours * 60
    )
    +
    minutes;

}


/* ==========================================
   COMPUTE PAYROLL
========================================== */

window.computePayroll =
function(){

    const rate =
        number(
            salaryRate?.value
        );


    const regularHours =
        number(
            totalHours?.value
        );


    const overtime =
        number(
            overtimeHours?.value
        );


    const holidayHrs =
        number(
            holidayHours?.value
        );


    const nightHrs =
        number(
            nightHours?.value
        );


    const holidayMultiplier =
        getHolidayMultiplier();


    /*
     * BASIC PAY
     */

    const basicPay =
        rate *
        regularHours;


    /*
     * OVERTIME
     *
     * 125%
     */

    const overtimePay =
        rate *
        1.25 *
        overtime;


    /*
     * HOLIDAY
     */

    const holidayPay =
        holidayMultiplier > 0
        ?
        rate *
        holidayMultiplier *
        holidayHrs
        :
        0;


    /*
     * NIGHT DIFFERENTIAL
     *
     * 10%
     */

    const nightPay =
        rate *
        0.10 *
        nightHrs;


    /*
     * GROSS
     */

    const gross =
        basicPay +
        overtimePay +
        holidayPay +
        nightPay;


    /*
     * DEDUCTIONS
     */

    const sssAmount =
        number(
            sss?.value
        );


    const philhealthAmount =
        number(
            philhealth?.value
        );


    const pagibigAmount =
        number(
            pagibig?.value
        );


    const healthAmount =
        number(
            healthcard?.value
        );


    const othersAmount =
        number(
            others?.value
        );


    const deductions =
        sssAmount +
        philhealthAmount +
        pagibigAmount +
        healthAmount +
        othersAmount;


    /*
     * NET
     */

    const net =
        gross -
        deductions;


    if(grossSalary){

        grossSalary.value =
            money(
                gross
            );

    }


    if(netSalary){

        netSalary.value =
            money(
                net
            );

    }


    return {

        rate,

        regularHours,

        overtime,

        holidayHrs,

        nightHrs,

        basicPay,

        overtimePay,

        holidayPay,

        nightPay,

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
            othersAmount,

        deductions,

        net

    };

};


/* ==========================================
   SAVE PAYROLL
========================================== */

window.savePayroll =
async function(){

    const selectedEmployee =
        employeeName
        ?
        employees.find(
            item =>
                item.id ===
                employeeName.value
        )
        :
        null;


    if(!selectedEmployee){

        alert(
            "Please select an employee."
        );

        return;

    }


    const payroll =
        computePayroll();


    if(
        payroll.rate <= 0
    ){

        alert(
            "Please enter a valid salary rate."
        );

        return;

    }


    if(
        payroll.regularHours <= 0 &&
        payroll.overtime <= 0 &&
        payroll.holidayHrs <= 0
    ){

        alert(
            "No working hours found."
        );

        return;

    }


    const employeeFullName =
        getEmployeeFullName(
            selectedEmployee
        );


    const payrollDate =
        filterDate?.value
        ||
        getToday();


    const payrollData = {

        empid:
            selectedEmployee.employeeid || "",

        employee:
            employeeFullName,

        employeeDocId:
            selectedEmployee.id,

        dailyrate:
            number(
                selectedEmployee.salary
            ),

        hourlyrate:
            payroll.rate,

        totaldays:
            payroll.regularHours / 8,

        totalhours:
            payroll.regularHours,

        overtime:
            payroll.overtime,

        holiday:
            payroll.holidayPay,

        holidayhours:
            payroll.holidayHrs,

        holidaytype:
            holidayType?.value ||
            "none",

        nightHours:
            payroll.nightHrs,

        nightdifferential:
            payroll.nightPay,

        basicpay:
            payroll.basicPay,

        overtimepay:
            payroll.overtimePay,

        holidaypay:
            payroll.holidayPay,

        gross:
            payroll.gross,

        sss:
            payroll.sss,

        philhealth:
            payroll.philhealth,

        pagibig:
            payroll.pagibig,

        healthcard:
            payroll.healthcard,

        otherdeduction:
            payroll.others,

        deductions:
            payroll.deductions,

        net:
            payroll.net,

        date:
            payrollDate,

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()

    };


    try{

        if(
            editingPayrollId
        ){

            await updateDoc(

                doc(
                    db,
                    "payroll",
                    editingPayrollId
                ),

                payrollData

            );


            alert(
                "Payroll updated successfully."
            );


            editingPayrollId =
                null;

        }else{

            await addDoc(

                collection(
                    db,
                    "payroll"
                ),

                payrollData

            );


            alert(
                "Payroll saved successfully."
            );

        }


        await loadPayroll();

        clearPayrollForm();


    }catch(error){

        console.error(
            "Save Payroll Error:",
            error
        );


        alert(
            "Failed to save payroll.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   LOAD PAYROLL
========================================== */

window.loadPayroll =
async function(){

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


        renderPayroll();

        updateTotalPayroll();


    }catch(error){

        console.error(
            "Payroll Load Error:",
            error
        );


        alert(
            "Failed to load payroll.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   RENDER PAYROLL
========================================== */

function renderPayroll(
    records =
        payrollRecords
){

    if(!payrollTable){

        return;

    }


    const tbody =
        payrollTable.querySelector(
            "tbody"
        );


    if(!tbody){

        return;

    }


    tbody.innerHTML =
        "";


    if(records.length === 0){

        tbody.innerHTML = `

<tr>

<td
colspan="17"
class="empty-row">

<span class="material-icons">
receipt_long
</span>

<p>
No payroll records available.
</p>

</td>

</tr>

`;

        return;

    }


    records.forEach(
        payroll => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

<td>

${escapeHTML(
    payroll.empid ||
    "-"
)}

</td>


<td>

${escapeHTML(
    payroll.employee ||
    "-"
)}

</td>


<td>

₱ ${money(
    payroll.hourlyrate
)}

</td>


<td>

${money(
    payroll.totalhours
)}

</td>


<td>

${money(
    payroll.overtime
)}

</td>


<td>

${escapeHTML(
    payroll.holidaytype ||
    "none"
)}

</td>


<td>

${money(
    payroll.holidayhours
)}

</td>


<td>

${money(
    payroll.nightHours
)}

</td>


<td>

₱ ${money(
    payroll.gross
)}

</td>


<td>

₱ ${money(
    payroll.sss
)}

</td>


<td>

₱ ${money(
    payroll.philhealth
)}

</td>


<td>

₱ ${money(
    payroll.pagibig
)}

</td>


<td>

₱ ${money(
    payroll.healthcard
)}

</td>


<td>

₱ ${money(
    payroll.otherdeduction
)}

</td>


<td>

<strong>

₱ ${money(
    payroll.net
)}

</strong>

</td>


<td>

${escapeHTML(
    payroll.date ||
    "-"
)}

</td>


<td>

<button
type="button"
class="table-icon-btn edit"
title="Edit Payroll"
onclick="editPayroll(
    '${payroll.id}'
)">

<span class="material-icons">
edit
</span>

</button>


<button
type="button"
class="table-icon-btn delete"
title="Delete Payroll"
onclick="deletePayroll(
    '${payroll.id}'
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

}


/* ==========================================
   FILTER PAYROLL
========================================== */

window.filterPayroll =
function(){

    const date =
        filterDate
        ?
        filterDate.value
        :
        "";


    if(!date){

        renderPayroll();

        updateTotalPayroll();

        return;

    }


    const filtered =
        payrollRecords.filter(
            payroll =>
                payroll.date ===
                date
        );


    renderPayroll(
        filtered
    );


    updateTotalPayroll(
        filtered
    );

};


/* ==========================================
   TOTAL PAYROLL
========================================== */

function updateTotalPayroll(
    records =
        payrollRecords
){

    const total =
        records.reduce(
            (
                sum,
                payroll
            ) => {

                return sum +
                    number(
                        payroll.net
                    );

            },
            0
        );


    if(totalPayroll){

        totalPayroll.innerText =
            money(
                total
            );

    }

}


/* ==========================================
   EDIT PAYROLL
========================================== */

window.editPayroll =
function(
    id
){

    const payroll =
        payrollRecords.find(
            item =>
                item.id === id
        );


    if(!payroll){

        alert(
            "Payroll record not found."
        );

        return;

    }


    editingPayrollId =
        id;


    /*
     * Employee
     */

    if(employeeName){

        employeeName.value =
            payroll.employeeDocId ||
            "";

    }


    /*
     * If employeeDocId is missing,
     * find employee using Employee ID.
     */

    if(
        employeeName &&
        !employeeName.value
    ){

        const employee =
            employees.find(
                item =>

                    String(
                        item.employeeid ||
                        ""
                    )
                    .toUpperCase()

                    ===

                    String(
                        payroll.empid ||
                        ""
                    )
                    .toUpperCase()

            );


        if(employee){

            employeeName.value =
                employee.id;

        }

    }


    if(employeeId){

        employeeId.value =
            payroll.empid ||
            "";

    }


    if(salaryRate){

        salaryRate.value =
            payroll.hourlyrate ||
            "";

    }


    if(totalHours){

        totalHours.value =
            payroll.totalhours ||
            "";

    }


    if(overtimeHours){

        overtimeHours.value =
            payroll.overtime ||
            "";

    }


    if(holidayType){

        holidayType.value =
            payroll.holidaytype ||
            "none";

    }


    if(holidayHours){

        holidayHours.value =
            payroll.holidayhours ||
            "";

    }


    if(nightHours){

        nightHours.value =
            payroll.nightHours ||
            "";

    }


    if(sss){

        sss.value =
            payroll.sss ||
            "";

    }


    if(philhealth){

        philhealth.value =
            payroll.philhealth ||
            "";

    }


    if(pagibig){

        pagibig.value =
            payroll.pagibig ||
            "";

    }


    if(healthcard){

        healthcard.value =
            payroll.healthcard ||
            "";

    }


    if(others){

        others.value =
            payroll.otherdeduction ||
            "";

    }


    if(grossSalary){

        grossSalary.value =
            money(
                payroll.gross
            );

    }


    if(netSalary){

        netSalary.value =
            money(
                payroll.net
            );

    }


    if(filterDate){

        filterDate.value =
            payroll.date ||
            "";

    }


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

};


/* ==========================================
   DELETE PAYROLL
========================================== */

window.deletePayroll =
async function(
    id
){

    const payroll =
        payrollRecords.find(
            item =>
                item.id === id
        );


    if(!payroll){

        return;

    }


    const confirmed =
        confirm(

            "Delete this payroll record?\n\n" +

            (
                payroll.employee ||
                "-"
            ) +

            "\n" +

            (
                payroll.date ||
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


        payrollRecords =
            payrollRecords.filter(
                item =>
                    item.id !== id
            );


        renderPayroll();

        updateTotalPayroll();


        alert(
            "Payroll deleted successfully."
        );


    }catch(error){

        console.error(
            "Delete Payroll Error:",
            error
        );


        alert(
            "Failed to delete payroll.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   CLEAR FORM
========================================== */

window.clearPayrollForm =
function(){

    editingPayrollId =
        null;


    if(employeeName){

        employeeName.value =
            "";

    }


    clearEmployeeFields();


    if(holidayType){

        holidayType.value =
            "none";

    }


    if(sss){

        sss.value =
            "";

    }


    if(philhealth){

        philhealth.value =
            "";

    }


    if(pagibig){

        pagibig.value =
            "";

    }


    if(healthcard){

        healthcard.value =
            "";

    }


    if(others){

        others.value =
            "";

    }


    if(filterDate){

        filterDate.value =
            getToday();

    }

};


/* ==========================================
   REFRESH
========================================== */

window.refreshPayroll =
async function(){

    await loadEmployees();

    await loadPayroll();

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
   PRINT PAYROLL
========================================== */

window.printPayroll =
function(){

    window.print();

};


/* ==========================================
   INITIALIZE
========================================== */

async function initialize(){

    if(filterDate){

        filterDate.value =
            getToday();

    }


    await loadEmployees();

    await loadPayroll();

}


/* ==========================================
   START
========================================== */

initialize();
