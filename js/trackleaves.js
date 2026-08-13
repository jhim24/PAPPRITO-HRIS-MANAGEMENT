/* ==========================================
   PAPPRITO HRIS
   TRACK LEAVES JS
========================================== */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL
========================================== */

let leaveRecords = [];


/* ==========================================
   ELEMENTS
========================================== */

const employeeFilter =
    document.getElementById("employeeFilter");

const leaveTypeFilter =
    document.getElementById("leaveTypeFilter");

const statusFilter =
    document.getElementById("statusFilter");

const fromDate =
    document.getElementById("fromDate");

const toDate =
    document.getElementById("toDate");

const leaveBody =
    document.getElementById("leaveBody");

const totalLeaves =
    document.getElementById("totalLeaves");

const pendingLeaves =
    document.getElementById("pendingLeaves");

const approvedLeaves =
    document.getElementById("approvedLeaves");

const rejectedLeaves =
    document.getElementById("rejectedLeaves");

const leaveModal =
    document.getElementById("leaveModal");

const leaveDetails =
    document.getElementById("leaveDetails");

const closeModal =
    document.getElementById("closeModal");

const filterBtn =
    document.getElementById("filterBtn");

const resetBtn =
    document.getElementById("resetBtn");

const refreshBtn =
    document.getElementById("refreshBtn");


/* ==========================================
   DASHBOARD
========================================== */

window.goToDashboard = function(){

    window.location.replace(
        "dashboard.html"
    );

};


/* ==========================================
   AUTH CHECK
========================================== */

onAuthStateChanged(
    auth,
    function(user){

        if(!user){

            window.location.replace(
                "login.html"
            );

            return;

        }


        loadLeaveRecords();

    }
);


/* ==========================================
   GET VALUE
========================================== */

function getValue(
    record,
    fields,
    fallback = ""
){

    for(
        const field of fields
    ){

        if(
            record[field] !== undefined &&
            record[field] !== null &&
            record[field] !== ""
        ){

            return record[field];

        }

    }

    return fallback;

}


/* ==========================================
   EMPLOYEE NAME
========================================== */

function getEmployeeName(record){

    const directName =

        getValue(
            record,
            [
                "employee",
                "employeeName",
                "name",
                "fullname",
                "fullName"
            ]
        );


    if(directName){

        return directName;

    }


    const first =

        getValue(
            record,
            [
                "firstname",
                "firstName"
            ]
        );


    const middle =

        getValue(
            record,
            [
                "middlename",
                "middleName"
            ]
        );


    const last =

        getValue(
            record,
            [
                "lastname",
                "lastName"
            ]
        );


    return [

        first,
        middle,
        last

    ]

    .filter(Boolean)

    .join(" ")

    .replace(/\s+/g," ")

    .trim();

}


/* ==========================================
   EMPLOYEE ID
========================================== */

function getEmployeeId(record){

    return getValue(
        record,
        [
            "employeeid",
            "employeeId",
            "empid",
            "empId",
            "idNumber"
        ],
        "-"
    );

}


/* ==========================================
   LEAVE TYPE
========================================== */

function getLeaveType(record){

    return getValue(
        record,
        [
            "leaveType",
            "leavetype",
            "type",
            "leave"
        ],
        "-"
    );

}


/* ==========================================
   STATUS
========================================== */

function getStatus(record){

    const value =

        getValue(
            record,
            [
                "status",
                "leaveStatus",
                "approvalStatus"
            ],
            "Pending"
        );


    const normalized =

        String(value)
        .trim()
        .toLowerCase();


    if(
        normalized === "approved" ||
        normalized === "approve"
    ){

        return "Approved";

    }


    if(
        normalized === "rejected" ||
        normalized === "reject" ||
        normalized === "declined"
    ){

        return "Rejected";

    }


    return "Pending";

}


/* ==========================================
   DATE VALUE
========================================== */

function getDateValue(
    record,
    fields
){

    return getValue(
        record,
        fields,
        ""
    );

}


/* ==========================================
   DATE NORMALIZER
========================================== */

function normalizeDate(value){

    if(!value){

        return "";

    }


    if(
        typeof value === "object" &&
        typeof value.toDate === "function"
    ){

        return value.toDate();

    }


    if(
        value instanceof Date
    ){

        return value;

    }


    const date =
        new Date(value);


    if(
        !isNaN(date.getTime())
    ){

        return date;

    }


    return "";

}


/* ==========================================
   FORMAT DATE
========================================== */

function formatDate(value){

    const date =
        normalizeDate(value);


    if(!date){

        return value || "-";

    }


    return date.toLocaleDateString(
        "en-US",
        {
            year:"numeric",
            month:"short",
            day:"2-digit"
        }
    );

}


/* ==========================================
   DATE FOR FILTER
========================================== */

function dateForFilter(value){

    const date =
        normalizeDate(value);


    if(!date){

        return "";

    }


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


/* ==========================================
   DAYS
========================================== */

function getDays(record){

    const value =

        getValue(
            record,
            [
                "days",
                "leaveDays",
                "totalDays",
                "numberOfDays"
            ]
        );


    if(value !== ""){

        return value;

    }


    const start =

        normalizeDate(
            getDateValue(
                record,
                [
                    "fromDate",
                    "startDate",
                    "dateFrom",
                    "leaveFrom"
                ]
            )
        );


    const end =

        normalizeDate(
            getDateValue(
                record,
                [
                    "toDate",
                    "endDate",
                    "dateTo",
                    "leaveTo"
                ]
            )
        );


    if(!start || !end){

        return "-";

    }


    const difference =

        Math.round(
            (
                end - start
            )
            /
            (
                1000 *
                60 *
                60 *
                24
            )
        )
        + 1;


    return difference;

}


/* ==========================================
   LOAD RECORDS
========================================== */

async function loadLeaveRecords(){

    showLoading();


    try{

        const snapshot =

            await getDocs(
                collection(
                    db,
                    "leaveRequests"
                )
            );


        leaveRecords = [];


        snapshot.forEach(
            function(docSnap){

                leaveRecords.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        populateEmployeeFilter();

        updateSummary(
            leaveRecords
        );

        renderLeaves(
            leaveRecords
        );


    }catch(error){

        console.error(
            "Track Leaves Error:",
            error
        );


        /*
           If the collection does not exist
           or permission is denied, show a
           clear message instead of fake data.
        */

        leaveRecords = [];


        updateSummary([]);


        leaveBody.innerHTML = `

            <tr>

                <td
                colspan="10"
                class="empty-state">

                    <span class="material-icons">

                        error_outline

                    </span>

                    <p>

                        Unable to load leave requests.

                    </p>

                    <small>

                        Check the Firebase
                        leaveRequests collection
                        and Firestore rules.

                    </small>

                </td>

            </tr>

        `;

    }

}


/* ==========================================
   POPULATE EMPLOYEES
========================================== */

function populateEmployeeFilter(){

    const currentValue =
        employeeFilter.value;


    employeeFilter.innerHTML = `

        <option value="">

            All Employees

        </option>

    `;


    const employees =

        new Set();


    leaveRecords.forEach(
        function(record){

            const name =
                getEmployeeName(record);


            if(name){

                employees.add(name);

            }

        }
    );


    Array.from(employees)
        .sort()
        .forEach(
            function(name){

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    name;


                option.textContent =
                    name;


                employeeFilter.appendChild(
                    option
                );

            }
        );


    if(
        Array.from(employees)
        .includes(currentValue)
    ){

        employeeFilter.value =
            currentValue;

    }

}


/* ==========================================
   UPDATE SUMMARY
========================================== */

function updateSummary(records){

    let pending = 0;

    let approved = 0;

    let rejected = 0;


    records.forEach(
        function(record){

            const status =
                getStatus(record);


            if(
                status === "Pending"
            ){

                pending++;

            }


            else if(
                status === "Approved"
            ){

                approved++;

            }


            else if(
                status === "Rejected"
            ){

                rejected++;

            }

        }
    );


    totalLeaves.textContent =
        records.length;


    pendingLeaves.textContent =
        pending;


    approvedLeaves.textContent =
        approved;


    rejectedLeaves.textContent =
        rejected;

}


/* ==========================================
   RENDER
========================================== */

function renderLeaves(records){

    leaveBody.innerHTML = "";


    if(
        records.length === 0
    ){

        leaveBody.innerHTML = `

            <tr>

                <td
                colspan="10"
                class="empty-state">

                    <span class="material-icons">

                        event_busy

                    </span>

                    <p>

                        No leave requests found.

                    </p>

                </td>

            </tr>

        `;

        return;

    }


    records.forEach(
        function(record){

            const row =
                document.createElement(
                    "tr"
                );


            const dateFiled =

                getDateValue(
                    record,
                    [
                        "dateFiled",
                        "filedDate",
                        "createdAt",
                        "date"
                    ]
                );


            const fromDateValue =

                getDateValue(
                    record,
                    [
                        "fromDate",
                        "startDate",
                        "dateFrom",
                        "leaveFrom"
                    ]
                );


            const toDateValue =

                getDateValue(
                    record,
                    [
                        "toDate",
                        "endDate",
                        "dateTo",
                        "leaveTo"
                    ]
                );


            const employeeId =
                getEmployeeId(record);


            const employeeName =
                getEmployeeName(record);


            const leaveType =
                getLeaveType(record);


            const days =
                getDays(record);


            const reason =

                getValue(
                    record,
                    [
                        "reason",
                        "remarks",
                        "description",
                        "leaveReason"
                    ],
                    "-"
                );


            const status =
                getStatus(record);


            const statusClass =

                status.toLowerCase();


            row.innerHTML = `

                <td>

                    ${escapeHtml(
                        formatDate(
                            dateFiled
                        )
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        employeeId
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        employeeName || "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        leaveType
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        formatDate(
                            fromDateValue
                        )
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        formatDate(
                            toDateValue
                        )
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        String(days)
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        reason
                    )}

                </td>


                <td>

                    <span
                    class="status ${statusClass}">

                        ${status}

                    </span>

                </td>


                <td>

                    <button
                    class="view-btn"
                    data-id="${record.id}">

                        VIEW

                    </button>

                </td>

            `;


            const viewButton =
                row.querySelector(
                    ".view-btn"
                );


            viewButton.addEventListener(
                "click",
                function(){

                    showDetails(
                        record
                    );

                }
            );


            leaveBody.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   FILTER
========================================== */

function filterLeaves(){

    const selectedEmployee =
        employeeFilter.value;


    const selectedType =
        leaveTypeFilter.value;


    const selectedStatus =
        statusFilter.value;


    const selectedFrom =
        fromDate.value;


    const selectedTo =
        toDate.value;


    const filtered =

        leaveRecords.filter(
            function(record){

                const employee =
                    getEmployeeName(
                        record
                    );


                const type =
                    getLeaveType(
                        record
                    );


                const status =
                    getStatus(
                        record
                    );


                const startDate =

                    dateForFilter(
                        getDateValue(
                            record,
                            [
                                "fromDate",
                                "startDate",
                                "dateFrom",
                                "leaveFrom",
                                "dateFiled",
                                "date"
                            ]
                        )
                    );


                const employeeMatch =

                    selectedEmployee === "" ||
                    employee ===
                    selectedEmployee;


                const typeMatch =

                    selectedType === "" ||
                    type ===
                    selectedType;


                const statusMatch =

                    selectedStatus === "" ||
                    status ===
                    selectedStatus;


                const fromMatch =

                    selectedFrom === "" ||
                    startDate >=
                    selectedFrom;


                const toMatch =

                    selectedTo === "" ||
                    startDate <=
                    selectedTo;


                return (

                    employeeMatch &&

                    typeMatch &&

                    statusMatch &&

                    fromMatch &&

                    toMatch

                );

            }
        );


    updateSummary(
        filtered
    );


    renderLeaves(
        filtered
    );

}


/* ==========================================
   RESET
========================================== */

function resetFilters(){

    employeeFilter.value =
        "";

    leaveTypeFilter.value =
        "";

    statusFilter.value =
        "";

    fromDate.value =
        "";

    toDate.value =
        "";


    updateSummary(
        leaveRecords
    );


    renderLeaves(
        leaveRecords
    );

}


/* ==========================================
   DETAILS
========================================== */

function showDetails(record){

    const employee =
        getEmployeeName(record);


    const employeeId =
        getEmployeeId(record);


    const leaveType =
        getLeaveType(record);


    const status =
        getStatus(record);


    const from =
        getDateValue(
            record,
            [
                "fromDate",
                "startDate",
                "dateFrom",
                "leaveFrom"
            ]
        );


    const to =
        getDateValue(
            record,
            [
                "toDate",
                "endDate",
                "dateTo",
                "leaveTo"
            ]
        );


    const dateFiled =
        getDateValue(
            record,
            [
                "dateFiled",
                "filedDate",
                "createdAt",
                "date"
            ]
        );


    const days =
        getDays(record);


    const reason =

        getValue(
            record,
            [
                "reason",
                "remarks",
                "description",
                "leaveReason"
            ],
            "-"
        );


    leaveDetails.innerHTML = `

        <div class="detail-row">

            <div class="detail-label">

                Employee ID

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    employeeId
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Employee

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    employee || "-"
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Leave Type

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    leaveType
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Date Filed

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    formatDate(
                        dateFiled
                    )
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                From

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    formatDate(
                        from
                    )
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                To

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    formatDate(
                        to
                    )
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Days

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    String(days)
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Reason

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    reason
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Status

            </div>

            <div class="detail-value">

                <span
                class="status ${status.toLowerCase()}">

                    ${status}

                </span>

            </div>

        </div>

    `;


    leaveModal.classList.add(
        "show"
    );

}


/* ==========================================
   CLOSE MODAL
========================================== */

function closeLeaveModal(){

    leaveModal.classList.remove(
        "show"
    );

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHtml(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* ==========================================
   LOADING
========================================== */

function showLoading(){

    leaveBody.innerHTML = `

        <tr>

            <td
            colspan="10"
            class="empty-state">

                <span class="material-icons">

                    sync

                </span>

                <p>

                    Loading leave requests...

                </p>

            </td>

        </tr>

    `;

}


/* ==========================================
   EVENTS
========================================== */

if(filterBtn){

    filterBtn.addEventListener(
        "click",
        filterLeaves
    );

}


if(resetBtn){

    resetBtn.addEventListener(
        "click",
        resetFilters
    );

}


if(refreshBtn){

    refreshBtn.addEventListener(
        "click",
        loadLeaveRecords
    );

}


if(closeModal){

    closeModal.addEventListener(
        "click",
        closeLeaveModal
    );

}


if(leaveModal){

    leaveModal.addEventListener(
        "click",
        function(event){

            if(
                event.target ===
                leaveModal
            ){

                closeLeaveModal();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    function(event){

        if(
            event.key === "Escape"
        ){

            closeLeaveModal();

        }

    }
);


/* ==========================================
   INITIAL LOAD
========================================== */

console.log(
    "PAPPRITO HRIS Track Leaves Ready"
);
