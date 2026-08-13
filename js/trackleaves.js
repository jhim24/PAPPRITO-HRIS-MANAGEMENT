/* ==========================================
   PAPPRITO HRIS
   TRACK LEAVES
   EXISTING employeeRequests SYSTEM
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

let requests = [];


/* ==========================================
   ELEMENTS
========================================== */

const leaveBody =
    document.getElementById("leaveBody");

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

const totalLeaves =
    document.getElementById("totalLeaves");

const pendingLeaves =
    document.getElementById("pendingLeaves");

const approvedLeaves =
    document.getElementById("approvedLeaves");

const rejectedLeaves =
    document.getElementById("rejectedLeaves");

const filterBtn =
    document.getElementById("filterBtn");

const resetBtn =
    document.getElementById("resetBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const leaveModal =
    document.getElementById("leaveModal");

const leaveDetails =
    document.getElementById("leaveDetails");

const closeModal =
    document.getElementById("closeModal");


/* ==========================================
   DASHBOARD
========================================== */

window.goToDashboard = function(){

    window.location.replace(
        "dashboard.html"
    );

};


/* ==========================================
   AUTH PROTECTION
========================================== */

onAuthStateChanged(
    auth,
    async function(user){

        if(!user){

            window.location.replace(
                "login.html"
            );

            return;

        }


        await loadRequests();

    }
);


/* ==========================================
   LOAD EXISTING REQUESTS
========================================== */

async function loadRequests(){

    showLoading();


    try{

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


        populateEmployeeFilter();

        updateSummary(
            requests
        );

        renderRequests(
            requests
        );


    }catch(error){

        console.error(
            "Track Leaves Error:",
            error
        );


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

                        ${escapeHtml(
                            error.message
                        )}

                    </small>

                </td>

            </tr>

        `;

    }

}


/* ==========================================
   EMPLOYEE FILTER
========================================== */

function populateEmployeeFilter(){

    const current =
        employeeFilter.value;


    employeeFilter.innerHTML = `

        <option value="">

            All Employees

        </option>

    `;


    const employees =
        new Map();


    requests.forEach(
        request => {

            const empid =
                request.empid || "";


            const name =
                request.employeeName ||
                request.name ||
                request.fullName ||
                empid ||
                "Unknown Employee";


            if(empid || name){

                employees.set(
                    empid || name,
                    name
                );

            }

        }
    );


    Array.from(
        employees.entries()
    )
    .sort(
        (a,b) =>
            String(a[1])
            .localeCompare(
                String(b[1])
            )
    )
    .forEach(
        ([value,name]) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                value;


            option.textContent =
                name;


            employeeFilter.appendChild(
                option
            );

        }
    );


    employeeFilter.value =
        current;

}


/* ==========================================
   NORMALIZE STATUS
========================================== */

function getStatus(request){

    const status =
        String(
            request.status ||
            "PENDING"
        )
        .trim()
        .toUpperCase();


    if(status === "APPROVED"){

        return "Approved";

    }


    if(status === "REJECTED"){

        return "Rejected";

    }


    return "Pending";

}


/* ==========================================
   REQUEST TYPE
========================================== */

function getLeaveType(request){

    return (
        request.type ||
        request.leaveType ||
        "REQUEST"
    );

}


/* ==========================================
   REQUEST DATE
========================================== */

function getRequestDate(request){

    return (
        request.date ||
        request.requestDate ||
        request.dateFiled ||
        ""
    );

}


/* ==========================================
   DAYS
========================================== */

function getDays(request){

    if(
        request.days !== undefined &&
        request.days !== null &&
        request.days !== ""
    ){

        return request.days;

    }


    return "-";

}


/* ==========================================
   REASON
========================================== */

function getReason(request){

    return (
        request.reason ||
        request.remarks ||
        request.description ||
        "-"
    );

}


/* ==========================================
   EMPLOYEE NAME
========================================== */

function getEmployeeName(request){

    return (
        request.employeeName ||
        request.name ||
        request.fullName ||
        request.empid ||
        "Unknown Employee"
    );

}


/* ==========================================
   SUMMARY
========================================== */

function updateSummary(data){

    let pending = 0;

    let approved = 0;

    let rejected = 0;


    data.forEach(
        request => {

            const status =
                getStatus(request);


            if(status === "Pending"){

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
        data.length;


    pendingLeaves.textContent =
        pending;


    approvedLeaves.textContent =
        approved;


    rejectedLeaves.textContent =
        rejected;

}


/* ==========================================
   RENDER REQUESTS
========================================== */

function renderRequests(data){

    leaveBody.innerHTML = "";


    if(data.length === 0){

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


    data.forEach(
        request => {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                getStatus(request);


            const type =
                getLeaveType(request);


            const date =
                getRequestDate(request);


            const days =
                getDays(request);


            const reason =
                getReason(request);


            const employeeName =
                getEmployeeName(request);


            const employeeId =
                request.empid ||
                "-";


            /*
               The existing request system
               stores the request date in
               request.date.

               If there are no separate
               FROM/TO fields, we display
               the request date.
            */

            const from =
                request.fromDate ||
                request.startDate ||
                date ||
                "-";


            const to =
                request.toDate ||
                request.endDate ||
                date ||
                "-";


            row.innerHTML = `

                <td>

                    ${escapeHtml(
                        formatDate(date)
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        employeeId
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        employeeName
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        type
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        formatDate(from)
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        formatDate(to)
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
                    class="status ${status.toLowerCase()}">

                        ${status}

                    </span>

                </td>


                <td>

                    <button
                    class="view-btn">

                        VIEW

                    </button>

                </td>

            `;


            const viewBtn =
                row.querySelector(
                    ".view-btn"
                );


            viewBtn.addEventListener(
                "click",
                () => {

                    showDetails(
                        request
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

function applyFilters(){

    const employee =
        employeeFilter.value;


    const type =
        leaveTypeFilter.value;


    const status =
        statusFilter.value;


    const from =
        fromDate.value;


    const to =
        toDate.value;


    const filtered =
        requests.filter(
            request => {

                const employeeId =
                    request.empid || "";


                const employeeName =
                    getEmployeeName(
                        request
                    );


                const requestType =
                    getLeaveType(
                        request
                    );


                const requestStatus =
                    getStatus(
                        request
                    );


                const requestDate =
                    getRequestDate(
                        request
                    );


                const employeeMatch =

                    employee === "" ||

                    employeeId === employee ||

                    employeeName === employee;


                const typeMatch =

                    type === "" ||

                    requestType === type;


                const statusMatch =

                    status === "" ||

                    requestStatus === status;


                const dateMatch =

                    isDateInRange(
                        requestDate,
                        from,
                        to
                    );


                return (

                    employeeMatch &&

                    typeMatch &&

                    statusMatch &&

                    dateMatch

                );

            }
        );


    updateSummary(
        filtered
    );


    renderRequests(
        filtered
    );

}


/* ==========================================
   DATE FILTER
========================================== */

function isDateInRange(
    value,
    from,
    to
){

    if(
        !from &&
        !to
    ){

        return true;

    }


    if(!value){

        return false;

    }


    const date =
        new Date(value);


    if(
        isNaN(
            date.getTime()
        )
    ){

        return false;

    }


    const current =
        date.toISOString()
        .split("T")[0];


    if(
        from &&
        current < from
    ){

        return false;

    }


    if(
        to &&
        current > to
    ){

        return false;

    }


    return true;

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
        requests
    );


    renderRequests(
        requests
    );

}


/* ==========================================
   DETAILS
========================================== */

function showDetails(request){

    const status =
        getStatus(request);


    const employee =
        getEmployeeName(request);


    const employeeId =
        request.empid ||
        "-";


    const type =
        getLeaveType(request);


    const date =
        getRequestDate(request);


    const days =
        getDays(request);


    const reason =
        getReason(request);


    const from =
        request.fromDate ||
        request.startDate ||
        date ||
        "-";


    const to =
        request.toDate ||
        request.endDate ||
        date ||
        "-";


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
                    employee
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Request Type

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    type
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Date

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    formatDate(date)
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                From

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    formatDate(from)
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                To

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    formatDate(to)
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

function closeDetails(){

    leaveModal.classList.remove(
        "show"
    );

}


/* ==========================================
   FORMAT DATE
========================================== */

function formatDate(value){

    if(!value){

        return "-";

    }


    const date =
        new Date(value);


    if(
        isNaN(
            date.getTime()
        )
    ){

        return String(value);

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
   ESCAPE HTML
========================================== */

function escapeHtml(value){

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

                    Loading requests...

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
        applyFilters
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
        loadRequests
    );

}


if(closeModal){

    closeModal.addEventListener(
        "click",
        closeDetails
    );

}


if(leaveModal){

    leaveModal.addEventListener(
        "click",
        event => {

            if(
                event.target ===
                leaveModal
            ){

                closeDetails();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape"
        ){

            closeDetails();

        }

    }
);


console.log(
    "PAPPRITO HRIS Track Leaves Ready"
);
