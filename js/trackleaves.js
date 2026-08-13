/* ==========================================
   PAPPRITO HRIS
   TRACK LEAVES JS
========================================== */

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL DATA
========================================== */

let employees = [];

let requests = [];

let filteredEmployees = [];


/* ==========================================
   ELEMENTS
========================================== */

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

const grandTotalLeaves =
    document.getElementById("grandTotalLeaves");

const grandTotalUsed =
    document.getElementById("grandTotalUsed");

const grandTotalUnused =
    document.getElementById("grandTotalUnused");

const grandRemaining =
    document.getElementById("grandRemaining");

const loading =
    document.getElementById("loading");


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
        Number(value);

    return Number.isFinite(n)
        ? n
        : 0;

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
   GET FULL NAME
========================================== */

function getFullName(employee){

    return [

        employee.firstname,

        employee.middlename,

        employee.lastname

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
   SHOW LOADING
========================================== */

function showLoading(){

    if(loading){

        loading.style.display =
            "flex";

    }

}


/* ==========================================
   HIDE LOADING
========================================== */

function hideLoading(){

    if(loading){

        loading.style.display =
            "none";

    }

}


/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    const snapshot =
        await getDocs(
            collection(
                db,
                "employees"
            )
        );


    employees = [];


    snapshot.forEach(
        docSnap => {

            employees.push({

                id:
                    docSnap.id,

                ...docSnap.data()

            });

        }
    );


    /*
     * Only active employees
     *
     * Inactive employees are not
     * included in current leave
     * tracking.
     */

    employees =
        employees.filter(
            employee => {

                const status =
                    text(
                        employee.status ||
                        "Active"
                    ).toLowerCase();


                return (
                    status ===
                    "active"
                );

            }
        );


    employees.sort(
        (a,b) => {

            const nameA =
                getFullName(a)
                .toLowerCase();

            const nameB =
                getFullName(b)
                .toLowerCase();

            return nameA.localeCompare(
                nameB
            );

        }
    );


    filteredEmployees =
        [...employees];


    populateDepartments();

}


/* ==========================================
   LOAD REQUESTS
========================================== */

async function loadRequests(){

    const snapshot =
        await getDocs(
            collection(
                db,
                "employeeRequests"
            )
        );


    requests = [];


    snapshot.forEach(
        docSnap => {

            requests.push({

                id:
                    docSnap.id,

                ...docSnap.data()

            });

        }
    );

}


/* ==========================================
   POPULATE DEPARTMENTS
========================================== */

function populateDepartments(){

    if(
        !departmentFilter
    ){

        return;

    }


    const departments =
        new Set();


    employees.forEach(
        employee => {

            const department =
                text(
                    employee.department
                );


            if(
                department
            ){

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


    Array.from(departments)

        .sort(
            (a,b) =>
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


/* ==========================================
   GET EMPLOYEE ID
========================================== */

function getEmployeeId(employee){

    return text(
        employee.employeeid
    )
    .toUpperCase();

}


/* ==========================================
   NORMALIZE REQUEST TYPE
========================================== */

function normalizeLeaveType(type){

    const value =
        text(type)
        .toUpperCase();


    if(
        value.includes(
            "VACATION"
        )
    ){

        return "Vacation";

    }


    if(
        value.includes(
            "SICK"
        )
    ){

        return "Sick";

    }


    if(
        value.includes(
            "BIRTHDAY"
        )
    ){

        return "Birthday";

    }


    return "";

}


/* ==========================================
   CHECK APPROVED REQUEST
========================================== */

function isApproved(request){

    const status =
        text(
            request.status
        )
        .toUpperCase();


    return (
        status ===
        "APPROVED"
    );

}


/* ==========================================
   GET USED LEAVES
========================================== */

function getUsedLeaves(
    employee,
    leaveType
){

    const employeeId =
        getEmployeeId(
            employee
        );


    if(
        !employeeId
    ){

        return 0;

    }


    let used = 0;


    requests.forEach(
        request => {

            const requestEmployeeId =
                text(
                    request.empid
                )
                .toUpperCase();


            /*
             * Must belong to employee
             */

            if(
                requestEmployeeId !==
                employeeId
            ){

                return;

            }


            /*
             * Only APPROVED requests
             */

            if(
                !isApproved(
                    request
                )
            ){

                return;

            }


            const type =
                normalizeLeaveType(
                    request.type
                );


            if(
                type !==
                leaveType
            ){

                return;

            }


            used +=
                number(
                    request.days
                );

        }
    );


    return used;

}


/* ==========================================
   GET LEAVE BALANCE
========================================== */

function getLeaveBalance(
    employee,
    leaveType
){

    let total = 0;


    /*
     * IMPORTANT:
     *
     * These values come directly
     * from Employee Masterlist.
     */

    if(
        leaveType ===
        "Vacation"
    ){

        total =
            number(
                employee.vacationleave
            );

    }


    if(
        leaveType ===
        "Sick"
    ){

        total =
            number(
                employee.sickleave
            );

    }


    if(
        leaveType ===
        "Birthday"
    ){

        total =
            number(
                employee.birthdayleave
            );

    }


    const used =
        getUsedLeaves(
            employee,
            leaveType
        );


    /*
     * Unused means:
     *
     * Total - Used
     *
     * Never below zero.
     */

    const unused =
        Math.max(
            total - used,
            0
        );


    /*
     * Remaining is the actual
     * available balance.
     */

    const remaining =
        Math.max(
            total - used,
            0
        );


    return {

        total,

        used,

        unused,

        remaining

    };

}


/* ==========================================
   GET EMPLOYEE SUMMARY
========================================== */

function getEmployeeSummary(
    employee
){

    const vacation =
        getLeaveBalance(
            employee,
            "Vacation"
        );


    const sick =
        getLeaveBalance(
            employee,
            "Sick"
        );


    const birthday =
        getLeaveBalance(
            employee,
            "Birthday"
        );


    const total =
        vacation.total
        +
        sick.total
        +
        birthday.total;


    const used =
        vacation.used
        +
        sick.used
        +
        birthday.used;


    const unused =
        vacation.unused
        +
        sick.unused
        +
        birthday.unused;


    const remaining =
        vacation.remaining
        +
        sick.remaining
        +
        birthday.remaining;


    return {

        vacation,

        sick,

        birthday,

        total,

        used,

        unused,

        remaining

    };

}


/* ==========================================
   RENDER TABLE
========================================== */

function renderTable(){

    if(
        !leaveBody
    ){

        return;

    }


    leaveBody.innerHTML =
        "";


    if(
        filteredEmployees.length === 0
    ){

        leaveBody.innerHTML = `

<tr>

<td
    colspan="18"
    class="empty-message">

    No employee leave records found.

</td>

</tr>

`;

        updateSummary();

        return;

    }


    filteredEmployees.forEach(
        employee => {

            const summary =
                getEmployeeSummary(
                    employee
                );


            /*
             * Leave type filter
             *
             * We keep the employee row,
             * but highlight/filter based
             * on selected leave type.
             */

            const selectedType =
                leaveTypeFilter
                ?
                leaveTypeFilter.value
                :
                "ALL";


            if(
                selectedType !==
                "ALL"
            ){

                const selectedBalance =

                    selectedType ===
                    "Vacation"

                    ?

                    summary.vacation

                    :

                    selectedType ===
                    "Sick"

                    ?

                    summary.sick

                    :

                    summary.birthday;


                /*
                 * Keep employee visible.
                 * The selected leave group
                 * remains available in table.
                 */

                if(
                    selectedBalance.total <= 0
                ){

                    return;

                }

            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

<td class="employee-id">

    ${escapeHTML(
        employee.employeeid ||
        "-"
    )}

</td>


<td class="employee-name">

    ${escapeHTML(
        getFullName(employee) ||
        "-"
    )}

</td>


<td>

    ${escapeHTML(
        employee.department ||
        "-"
    )}

</td>


<!-- ==================================
     VACATION
================================== -->

<td class="total-cell">

    ${summary.vacation.total}

</td>


<td class="used-cell">

    ${summary.vacation.used}

</td>


<td class="unused-cell">

    ${summary.vacation.unused}

</td>


<td class="remaining-cell">

    ${summary.vacation.remaining}

</td>



<!-- ==================================
     SICK
================================== -->

<td class="total-cell">

    ${summary.sick.total}

</td>


<td class="used-cell">

    ${summary.sick.used}

</td>


<td class="unused-cell">

    ${summary.sick.unused}

</td>


<td class="remaining-cell">

    ${summary.sick.remaining}

</td>



<!-- ==================================
     BIRTHDAY
================================== -->

<td class="total-cell">

    ${summary.birthday.total}

</td>


<td class="used-cell">

    ${summary.birthday.used}

</td>


<td class="unused-cell">

    ${summary.birthday.unused}

</td>


<td class="remaining-cell">

    ${summary.birthday.remaining}

</td>



<!-- ==================================
     OVERALL
================================== -->

<td class="total-cell">

    ${summary.total}

</td>


<td class="used-cell">

    ${summary.used}

</td>


<td class="unused-cell">

    ${summary.unused}

</td>


<td class="remaining-cell overall">

    ${summary.remaining}

</td>

`;


            leaveBody.appendChild(
                row
            );

        }
    );


    updateEmployeeCount();

    updateSummary();

}


/* ==========================================
   UPDATE EMPLOYEE COUNT
========================================== */

function updateEmployeeCount(){

    if(
        !employeeCount
    ){

        return;

    }


    const count =
        filteredEmployees.filter(
            employee => {

                const selectedType =
                    leaveTypeFilter
                    ?
                    leaveTypeFilter.value
                    :
                    "ALL";


                if(
                    selectedType ===
                    "ALL"
                ){

                    return true;

                }


                const balance =
                    getLeaveBalance(
                        employee,
                        selectedType
                    );


                return (
                    balance.total > 0
                );

            }
        ).length;


    employeeCount.innerHTML = `

Employees:

<strong>
    ${count}
</strong>

`;

}


/* ==========================================
   UPDATE SUMMARY
========================================== */

function updateSummary(){

    let total =
        0;

    let used =
        0;

    let unused =
        0;

    let remaining =
        0;


    const selectedType =
        leaveTypeFilter
        ?
        leaveTypeFilter.value
        :
        "ALL";


    filteredEmployees.forEach(
        employee => {

            const summary =
                getEmployeeSummary(
                    employee
                );


            if(
                selectedType ===
                "ALL"
            ){

                total +=
                    summary.total;

                used +=
                    summary.used;

                unused +=
                    summary.unused;

                remaining +=
                    summary.remaining;

                return;

            }


            const balance =
                getLeaveBalance(
                    employee,
                    selectedType
                );


            total +=
                balance.total;

            used +=
                balance.used;

            unused +=
                balance.unused;

            remaining +=
                balance.remaining;

        }
    );


    if(
        grandTotalLeaves
    ){

        grandTotalLeaves.innerText =
            total;

    }


    if(
        grandTotalUsed
    ){

        grandTotalUsed.innerText =
            used;

    }


    if(
        grandTotalUnused
    ){

        grandTotalUnused.innerText =
            unused;

    }


    if(
        grandRemaining
    ){

        grandRemaining.innerText =
            remaining;

    }

}


/* ==========================================
   FILTER DATA
========================================== */

function applyFilters(){

    const searchValue =
        leaveSearch
        ?
        leaveSearch.value
            .trim()
            .toLowerCase()
        :
        "";


    const department =
        departmentFilter
        ?
        departmentFilter.value
            .trim()
            .toLowerCase()
        :
        "";


    const selectedType =
        leaveTypeFilter
        ?
        leaveTypeFilter.value
        :
        "ALL";


    filteredEmployees =
        employees.filter(
            employee => {

                /*
                 * SEARCH
                 */

                if(
                    searchValue
                ){

                    const searchable = [

                        employee.employeeid,

                        employee.firstname,

                        employee.middlename,

                        employee.lastname,

                        employee.position,

                        employee.department

                    ]

                    .join(" ")
                    .toLowerCase();


                    if(
                        !searchable.includes(
                            searchValue
                        )
                    ){

                        return false;

                    }

                }


                /*
                 * DEPARTMENT
                 */

                if(
                    department
                ){

                    if(
                        text(
                            employee.department
                        )
                        .toLowerCase()
                        !==
                        department
                    ){

                        return false;

                    }

                }


                /*
                 * LEAVE TYPE
                 */

                if(
                    selectedType !==
                    "ALL"
                ){

                    const balance =
                        getLeaveBalance(
                            employee,
                            selectedType
                        );


                    if(
                        balance.total <= 0
                    ){

                        return false;

                    }

                }


                return true;

            }
        );


    renderTable();

}


/* ==========================================
   SEARCH EVENT
========================================== */

if(
    leaveSearch
){

    leaveSearch.addEventListener(
        "input",
        applyFilters
    );

}


/* ==========================================
   DEPARTMENT EVENT
========================================== */

if(
    departmentFilter
){

    departmentFilter.addEventListener(
        "change",
        applyFilters
    );

}


/* ==========================================
   LEAVE TYPE EVENT
========================================== */

if(
    leaveTypeFilter
){

    leaveTypeFilter.addEventListener(
        "change",
        applyFilters
    );

}


/* ==========================================
   GLOBAL REFRESH
========================================== */

window.loadLeaveData =
async function(){

    try{

        showLoading();


        await loadEmployees();

        await loadRequests();


        /*
         * Re-apply filters after
         * loading latest Firestore data.
         */

        applyFilters();


    }catch(error){

        console.error(
            "Track Leaves Error:",
            error
        );


        if(
            leaveBody
        ){

            leaveBody.innerHTML = `

<tr>

<td
    colspan="18"
    class="empty-message">

    Failed to load leave records.

    <br><br>

    ${escapeHTML(
        error.message
    )}

</td>

</tr>

`;

        }

    }finally{

        hideLoading();

    }

};


/* ==========================================
   START
========================================== */

loadLeaveData();
