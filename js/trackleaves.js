/* =========================================================
   PAPPRITO HRIS
   TRACK LEAVES
   LEAVE BALANCE MANAGEMENT
========================================================= */

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* =========================================================
   DATA
========================================================= */

let employees = [];

let leaveRequests = [];

let filteredEmployees = [];


/* =========================================================
   ELEMENTS
========================================================= */

const leaveBody =
    document.getElementById("leaveBody");

const leaveSearch =
    document.getElementById("leaveSearch");

const departmentFilter =
    document.getElementById("departmentFilter");

const leaveTypeFilter =
    document.getElementById("leaveTypeFilter");

const employeeCount =
    document.getElementById("employeeCount");

const loading =
    document.getElementById("loading");

const grandTotalLeaves =
    document.getElementById("grandTotalLeaves");

const grandTotalUsed =
    document.getElementById("grandTotalUsed");

const grandTotalUnused =
    document.getElementById("grandTotalUnused");

const grandRemaining =
    document.getElementById("grandRemaining");


/* =========================================================
   HELPERS
========================================================= */

function clean(value) {

    return String(
        value ?? ""
    ).trim();

}


function number(value) {

    const n =
        Number(value);

    return Number.isFinite(n)
        ? n
        : 0;

}


function escapeHTML(value) {

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


/* =========================================================
   EMPLOYEE NAME
========================================================= */

function getEmployeeName(emp) {

    if (!emp) {

        return "";

    }

    const fullName = [

        emp.firstname,

        emp.middlename,

        emp.lastname

    ]

    .map(
        value =>
            clean(value)
    )

    .filter(
        value =>
            value !== ""
    )

    .join(" ");

    return (

        fullName ||

        clean(emp.name) ||

        clean(emp.fullname) ||

        ""

    );

}


/* =========================================================
   EMPLOYEE ID
========================================================= */

function getEmployeeId(emp) {

    return clean(

        emp.employeeid ??

        emp.empid ??

        emp.employeeId ??

        ""

    );

}


/* =========================================================
   DEPARTMENT
========================================================= */

function getDepartment(emp) {

    return clean(

        emp.department ??

        emp.dept ??

        ""

    );

}


/* =========================================================
   LEAVE TOTAL FROM EMPLOYEE MASTERLIST
========================================================= */

function getVacationTotal(emp) {

    return Math.max(

        0,

        number(

            emp.vacationleave ??

            emp.vacationLeave ??

            emp.vacation ??

            0

        )

    );

}


function getSickTotal(emp) {

    return Math.max(

        0,

        number(

            emp.sickleave ??

            emp.sickLeave ??

            emp.sick ??

            0

        )

    );

}


function getBirthdayTotal(emp) {

    return Math.max(

        0,

        number(

            emp.birthdayleave ??

            emp.birthdayLeave ??

            emp.birthday ??

            0

        )

    );

}


/* =========================================================
   LEAVE TYPE NORMALIZATION
========================================================= */

function normalizeLeaveType(type) {

    const value =
        clean(type)
        .toLowerCase()
        .replace(
            /[_-]+/g,
            " "
        );


    if (
        value.includes("vacation")
    ) {

        return "Vacation";

    }


    if (
        value.includes("sick")
    ) {

        return "Sick";

    }


    if (
        value.includes("birthday")
    ) {

        return "Birthday";

    }


    return "Other";

}


/* =========================================================
   REQUEST EMPLOYEE ID
========================================================= */

function getRequestEmployeeId(req) {

    return clean(

        req.empid ??

        req.employeeid ??

        req.employeeId ??

        req.empDocId ??

        ""

    );

}


/* =========================================================
   REQUEST EMPLOYEE NAME
========================================================= */

function getRequestEmployeeName(req) {

    return clean(

        req.employee ??

        req.employeeName ??

        req.name ??

        ""

    );

}


/* =========================================================
   REQUEST DAYS
========================================================= */

function getRequestDays(req) {

    const days =
        number(
            req.days ??
            req.leaveDays ??
            0
        );


    return days > 0
        ? days
        : 0;

}


/* =========================================================
   REQUEST STATUS
========================================================= */

function isApproved(req) {

    return (

        clean(
            req.status
        ).toUpperCase() ===
        "APPROVED"

    );

}


/* =========================================================
   LOAD EMPLOYEES
========================================================= */

async function loadEmployees() {

    employees = [];

    try {

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

            (a, b) => {

                return getEmployeeName(a)
                    .localeCompare(
                        getEmployeeName(b)
                    );

            }

        );


        loadDepartments();


    } catch (error) {

        console.error(
            "LOAD EMPLOYEES ERROR:",
            error
        );

        throw error;

    }

}


/* =========================================================
   LOAD DEPARTMENTS
========================================================= */

function loadDepartments() {

    if (!departmentFilter) {

        return;

    }


    const departments =
        new Set();


    employees.forEach(
        emp => {

            const department =
                getDepartment(emp);

            if (department) {

                departments.add(
                    department
                );

            }

        }
    );


    departmentFilter.innerHTML = `

        <option value="">
            All Departments
        </option>

    `;


    [...departments]

    .sort(
        (a, b) =>
            a.localeCompare(b)
    )

    .forEach(
        department => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                department;

            option.textContent =
                department;

            departmentFilter.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   LOAD LEAVE REQUESTS
========================================================= */

async function loadLeaveRequests() {

    leaveRequests = [];

    try {

        const snapshot =
            await getDocs(

                collection(
                    db,
                    "employeeRequests"
                )

            );


        snapshot.forEach(
            docSnap => {

                leaveRequests.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


    } catch (error) {

        console.error(
            "LOAD LEAVE REQUESTS ERROR:",
            error
        );

        throw error;

    }

}


/* =========================================================
   GET APPROVED USED LEAVE
========================================================= */

function getUsedLeave(
    employee,
    type
) {

    const employeeId =
        getEmployeeId(
            employee
        );

    const employeeName =
        getEmployeeName(
            employee
        )
        .toLowerCase();


    let totalUsed = 0;


    leaveRequests.forEach(
        request => {

            if (
                !isApproved(request)
            ) {

                return;

            }


            const requestType =
                normalizeLeaveType(
                    request.type ??
                    request.leaveType
                );


            if (
                requestType !==
                type
            ) {

                return;

            }


            const requestId =
                getRequestEmployeeId(
                    request
                );


            const requestName =
                getRequestEmployeeName(
                    request
                )
                .toLowerCase();


            let employeeMatch =
                false;


            /*
               FIRST:
               Match Employee ID
            */

            if (
                employeeId &&
                requestId
            ) {

                employeeMatch =
                    employeeId.toLowerCase() ===
                    requestId.toLowerCase();

            }


            /*
               SECOND:
               Match Employee Name
            */

            if (
                !employeeMatch &&
                employeeName &&
                requestName
            ) {

                employeeMatch =
                    employeeName ===
                    requestName;

            }


            if (
                !employeeMatch
            ) {

                return;

            }


            totalUsed +=
                getRequestDays(
                    request
                );

        }
    );


    return totalUsed;

}


/* =========================================================
   BUILD EMPLOYEE BALANCE
========================================================= */

function buildLeaveBalance(emp) {

    const vacationTotal =
        getVacationTotal(
            emp
        );


    const sickTotal =
        getSickTotal(
            emp
        );


    const birthdayTotal =
        getBirthdayTotal(
            emp
        );


    const vacationUsed =
        getUsedLeave(
            emp,
            "Vacation"
        );


    const sickUsed =
        getUsedLeave(
            emp,
            "Sick"
        );


    const birthdayUsed =
        getUsedLeave(
            emp,
            "Birthday"
        );


    const vacationUnused =
        Math.max(
            vacationTotal -
            vacationUsed,
            0
        );


    const sickUnused =
        Math.max(
            sickTotal -
            sickUsed,
            0
        );


    const birthdayUnused =
        Math.max(
            birthdayTotal -
            birthdayUsed,
            0
        );


    /*
       REMAINING = UNUSED

       This makes the terminology
       consistent:

       TOTAL
       USED
       UNUSED
       REMAINING
    */

    const vacationRemaining =
        vacationUnused;


    const sickRemaining =
        sickUnused;


    const birthdayRemaining =
        birthdayUnused;


    const overallTotal =
        vacationTotal +
        sickTotal +
        birthdayTotal;


    const overallUsed =
        vacationUsed +
        sickUsed +
        birthdayUsed;


    const overallUnused =
        Math.max(
            overallTotal -
            overallUsed,
            0
        );


    const overallRemaining =
        overallUnused;


    return {

        vacation: {

            total:
                vacationTotal,

            used:
                vacationUsed,

            unused:
                vacationUnused,

            remaining:
                vacationRemaining

        },

        sick: {

            total:
                sickTotal,

            used:
                sickUsed,

            unused:
                sickUnused,

            remaining:
                sickRemaining

        },

        birthday: {

            total:
                birthdayTotal,

            used:
                birthdayUsed,

            unused:
                birthdayUnused,

            remaining:
                birthdayRemaining

        },

        overall: {

            total:
                overallTotal,

            used:
                overallUsed,

            unused:
                overallUnused,

            remaining:
                overallRemaining

        }

    };

}


/* =========================================================
   FILTER EMPLOYEES
========================================================= */

function getFilteredEmployees() {

    const search =
        clean(
            leaveSearch?.value
        )
        .toLowerCase();


    const department =
        clean(
            departmentFilter?.value
        );


    const leaveType =
        clean(
            leaveTypeFilter?.value
        );


    return employees.filter(
        emp => {

            const employeeId =
                getEmployeeId(
                    emp
                )
                .toLowerCase();


            const employeeName =
                getEmployeeName(
                    emp
                )
                .toLowerCase();


            const empDepartment =
                getDepartment(
                    emp
                );


            /*
               SEARCH
            */

            if (
                search &&
                !employeeId.includes(search) &&
                !employeeName.includes(search)
            ) {

                return false;

            }


            /*
               DEPARTMENT
            */

            if (
                department &&
                empDepartment !==
                department
            ) {

                return false;

            }


            /*
               LEAVE TYPE
               Only display employee if
               that type has allocation.
            */

            if (
                leaveType &&
                leaveType !== "ALL"
            ) {

                const balance =
                    buildLeaveBalance(
                        emp
                    );


                if (
                    leaveType ===
                    "Vacation" &&
                    balance.vacation.total <= 0
                ) {

                    return false;

                }


                if (
                    leaveType ===
                    "Sick" &&
                    balance.sick.total <= 0
                ) {

                    return false;

                }


                if (
                    leaveType ===
                    "Birthday" &&
                    balance.birthday.total <= 0
                ) {

                    return false;

                }

            }


            return true;

        }
    );

}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(value) {

    const n =
        number(value);


    if (
        Number.isInteger(n)
    ) {

        return String(n);

    }


    return n.toFixed(2);

}


/* =========================================================
   BALANCE CELL
========================================================= */

function balanceCell(
    value,
    className
) {

    return `

        <td
            class="leave-number ${className}">

            ${formatNumber(value)}

        </td>

    `;

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable() {

    if (!leaveBody) {

        return;

    }


    filteredEmployees =
        getFilteredEmployees();


    leaveBody.innerHTML =
        "";


    /*
       EMPLOYEE COUNT
    */

    if (employeeCount) {

        employeeCount.innerHTML = `

            Employees:
            <strong>
                ${filteredEmployees.length}
            </strong>

        `;

    }


    /*
       NO DATA
    */

    if (
        filteredEmployees.length ===
        0
    ) {

        leaveBody.innerHTML = `

            <tr>

                <td
                    colspan="19"
                    class="empty-message">

                    <span
                        class="material-icons">

                        person_off

                    </span>

                    <div>

                        No employee leave records found.

                    </div>

                </td>

            </tr>

        `;


        updateGrandTotals();

        return;

    }


    /*
       EMPLOYEES
    */

    filteredEmployees.forEach(
        employee => {

            const balance =
                buildLeaveBalance(
                    employee
                );


            const employeeId =
                getEmployeeId(
                    employee
                );


            const employeeName =
                getEmployeeName(
                    employee
                );


            const department =
                getDepartment(
                    employee
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <!-- EMPLOYEE ID -->

                <td
                    class="employee-id">

                    ${escapeHTML(
                        employeeId ||
                        "-"
                    )}

                </td>


                <!-- EMPLOYEE NAME -->

                <td
                    class="employee-name">

                    ${escapeHTML(
                        employeeName ||
                        "-"
                    )}

                </td>


                <!-- DEPARTMENT -->

                <td
                    class="department">

                    ${escapeHTML(
                        department ||
                        "-"
                    )}

                </td>


                <!-- ====================
                     VACATION
                ==================== -->

                ${balanceCell(
                    balance.vacation.total,
                    "total-cell"
                )}

                ${balanceCell(
                    balance.vacation.used,
                    "used-cell"
                )}

                ${balanceCell(
                    balance.vacation.unused,
                    "unused-cell"
                )}

                ${balanceCell(
                    balance.vacation.remaining,
                    "remaining-cell"
                )}


                <!-- ====================
                     SICK
                ==================== -->

                ${balanceCell(
                    balance.sick.total,
                    "total-cell"
                )}

                ${balanceCell(
                    balance.sick.used,
                    "used-cell"
                )}

                ${balanceCell(
                    balance.sick.unused,
                    "unused-cell"
                )}

                ${balanceCell(
                    balance.sick.remaining,
                    "remaining-cell"
                )}


                <!-- ====================
                     BIRTHDAY
                ==================== -->

                ${balanceCell(
                    balance.birthday.total,
                    "total-cell"
                )}

                ${balanceCell(
                    balance.birthday.used,
                    "used-cell"
                )}

                ${balanceCell(
                    balance.birthday.unused,
                    "unused-cell"
                )}

                ${balanceCell(
                    balance.birthday.remaining,
                    "remaining-cell"
                )}


                <!-- ====================
                     OVERALL
                ==================== -->

                ${balanceCell(
                    balance.overall.total,
                    "overall-total-cell"
                )}

                ${balanceCell(
                    balance.overall.used,
                    "overall-used-cell"
                )}

                ${balanceCell(
                    balance.overall.unused,
                    "overall-unused-cell"
                )}

                ${balanceCell(
                    balance.overall.remaining,
                    "overall-remaining-cell"
                )}

            `;


            leaveBody.appendChild(
                row
            );

        }
    );


    updateGrandTotals();

}


/* =========================================================
   GRAND TOTALS
========================================================= */

function updateGrandTotals() {

    let totalLeaves = 0;

    let totalUsed = 0;

    let totalUnused = 0;

    let totalRemaining = 0;


    filteredEmployees.forEach(
        employee => {

            const balance =
                buildLeaveBalance(
                    employee
                );


            totalLeaves +=
                balance.overall.total;


            totalUsed +=
                balance.overall.used;


            totalUnused +=
                balance.overall.unused;


            totalRemaining +=
                balance.overall.remaining;

        }
    );


    if (grandTotalLeaves) {

        grandTotalLeaves.textContent =
            formatNumber(
                totalLeaves
            );

    }


    if (grandTotalUsed) {

        grandTotalUsed.textContent =
            formatNumber(
                totalUsed
            );

    }


    if (grandTotalUnused) {

        grandTotalUnused.textContent =
            formatNumber(
                totalUnused
            );

    }


    if (grandRemaining) {

        grandRemaining.textContent =
            formatNumber(
                totalRemaining
            );

    }

}


/* =========================================================
   FILTER EVENTS
========================================================= */

leaveSearch?.addEventListener(
    "input",
    renderTable
);


departmentFilter?.addEventListener(
    "change",
    renderTable
);


leaveTypeFilter?.addEventListener(
    "change",
    renderTable
);


/* =========================================================
   REFRESH
========================================================= */

window.loadLeaveData =
async function() {

    showLoading();


    try {

        await loadEmployees();

        await loadLeaveRequests();

        renderTable();


    } catch (error) {

        console.error(
            "LOAD LEAVE DATA ERROR:",
            error
        );


        if (leaveBody) {

            leaveBody.innerHTML = `

                <tr>

                    <td
                        colspan="19"
                        class="empty-message error">

                        <span
                            class="material-icons">

                            error_outline

                        </span>

                        <div>

                            Unable to load leave records.

                        </div>

                    </td>

                </tr>

            `;

        }


        alert(
            "Unable to load leave records.\n\n" +
            error.message
        );


    } finally {

        hideLoading();

    }

};


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    if (loading) {

        loading.classList.add(
            "show"
        );

    }

}


function hideLoading() {

    if (loading) {

        loading.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initialize() {

    showLoading();


    try {

        await loadEmployees();

        await loadLeaveRequests();

        renderTable();


    } catch (error) {

        console.error(
            "TRACK LEAVES INITIALIZATION ERROR:",
            error
        );


        if (leaveBody) {

            leaveBody.innerHTML = `

                <tr>

                    <td
                        colspan="19"
                        class="empty-message error">

                        <span
                            class="material-icons">

                            error_outline

                        </span>

                        <div>

                            Error loading employee leave data.

                        </div>

                    </td>

                </tr>

            `;

        }


        alert(
            "Track Leaves could not be loaded.\n\n" +
            error.message
        );


    } finally {

        hideLoading();

    }

}


/* =========================================================
   START
========================================================= */

initialize();
