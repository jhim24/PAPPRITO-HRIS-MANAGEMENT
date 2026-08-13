/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE PORTAL JS
   EXISTING FIREBASE STRUCTURE
========================================== */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

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

let currentUser = "";

let currentEmployee = null;

let editId = null;

let attendanceEditId = null;


/* ==========================================
   ELEMENTS
========================================== */

const employeeName =
    document.getElementById("employeeName");

const employeeId =
    document.getElementById("employeeId");

const employeePosition =
    document.getElementById("employeePosition");

const loggedEmployee =
    document.getElementById("loggedEmployee");


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


const attendanceBody =
    document.getElementById("attendanceBody");

const payslipBody =
    document.getElementById("payslipBody");


const requestFormCard =
    document.getElementById("requestFormCard");

const newRequestBtn =
    document.getElementById("newRequestBtn");

const cancelRequestBtn =
    document.getElementById("cancelRequestBtn");

const submitRequestBtn =
    document.getElementById("submitRequestBtn");


const requestTotal =
    document.getElementById("requestTotal");

const requestPending =
    document.getElementById("requestPending");

const requestApproved =
    document.getElementById("requestApproved");

const requestRejected =
    document.getElementById("requestRejected");


const requestModal =
    document.getElementById("requestModal");

const requestDetails =
    document.getElementById("requestDetails");

const closeRequestModal =
    document.getElementById("closeRequestModal");


/* ==========================================
   AUTHENTICATION
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


        currentUser =
            localStorage.getItem(
                "loggedInUser"
            ) ||
            user.email ||
            "";


        await loadEmployee();

    }
);


/* ==========================================
   LOAD EMPLOYEE
   Existing system uses employees
   collection and employeeid.
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


        const loggedId =
            String(
                currentUser
            )
            .toUpperCase()
            .trim();


        snapshot.forEach(
            docSnap => {

                const emp =
                    docSnap.data();


                const empId =
                    String(
                        emp.employeeid ||
                        emp.empid ||
                        ""
                    )
                    .toUpperCase()
                    .trim();


                const fullName = [

                    emp.firstname || "",

                    emp.middlename || "",

                    emp.lastname || ""

                ]

                .filter(Boolean)

                .join(" ")

                .replace(
                    /\s+/g,
                    " "
                )

                .trim();


                /*
                   Login may be employee ID
                   or username.
                */

                const username =
                    String(
                        emp.username ||
                        ""
                    )
                    .toUpperCase()
                    .trim();


                if(
                    empId === loggedId ||
                    username === loggedId
                ){

                    currentEmployee = {

                        id:
                            emp.employeeid ||
                            emp.empid ||
                            "",

                        name:
                            fullName ||
                            emp.name ||
                            "",

                        position:
                            emp.position ||
                            "",

                        department:
                            emp.department ||
                            ""

                    };

                }

            }
        );


        if(!currentEmployee){

            alert(
                "Employee account not found in masterlist."
            );

            await signOut(auth);

            localStorage.removeItem(
                "loggedInUser"
            );

            localStorage.removeItem(
                "userRole"
            );

            window.location.replace(
                "login.html"
            );

            return;

        }


        displayEmployee();


        await loadRequests();

        await loadAttendanceRequests();

        await loadPayslips();


    }catch(error){

        console.error(
            "Employee Load Error:",
            error
        );

        alert(
            "Failed to load employee."
        );

    }

}


/* ==========================================
   DISPLAY EMPLOYEE
========================================== */

function displayEmployee(){

    if(employeeName){

        employeeName.textContent =
            currentEmployee.name ||
            "Employee";

    }


    if(employeeId){

        employeeId.textContent =
            "Employee ID: " +
            (
                currentEmployee.id ||
                "-"
            );

    }


    if(employeePosition){

        employeePosition.textContent =
            "Position: " +
            (
                currentEmployee.position ||
                "-"
            );

    }


    if(loggedEmployee){

        loggedEmployee.textContent =
            currentEmployee.name ||
            currentEmployee.id ||
            "Employee";

    }

}


/* ==========================================
   REQUEST FORM
========================================== */

if(newRequestBtn){

    newRequestBtn.addEventListener(
        "click",
        function(){

            editId = null;

            clearRequestForm();

            requestFormCard.classList.toggle(
                "hidden"
            );

        }
    );

}


if(cancelRequestBtn){

    cancelRequestBtn.addEventListener(
        "click",
        function(){

            editId = null;

            clearRequestForm();

            requestFormCard.classList.add(
                "hidden"
            );

        }
    );

}


if(submitRequestBtn){

    submitRequestBtn.addEventListener(
        "click",
        submitRequest
    );

}


/* ==========================================
   SUBMIT / UPDATE REQUEST
========================================== */

async function submitRequest(){

    if(!currentEmployee){

        alert(
            "Employee information not loaded."
        );

        return;

    }


    if(
        !requestType ||
        requestType.value === ""
    ){

        alert(
            "Select Request Type."
        );

        return;

    }


    if(
        !requestDate ||
        requestDate.value === ""
    ){

        alert(
            "Select Date."
        );

        return;

    }


    if(
        !requestDays ||
        requestDays.value === ""
    ){

        alert(
            "Enter Number of Days."
        );

        return;

    }


    const days =
        Number(
            requestDays.value
        );


    if(
        !Number.isFinite(days) ||
        days <= 0
    ){

        alert(
            "Enter a valid number of days."
        );

        return;

    }


    try{

        if(editId){

            /*
               Existing behavior:
               Employee can update
               their own request.
            */

            await updateDoc(

                doc(
                    db,
                    "employeeRequests",
                    editId
                ),

                {

                    type:
                        requestType.value,

                    date:
                        requestDate.value,

                    days:
                        String(days),

                    reason:
                        requestReason.value.trim()

                }

            );


            alert(
                "Request Updated"
            );


        }else{

            /*
               Existing structure:
               employeeRequests
            */

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

                    type:
                        requestType.value,

                    date:
                        requestDate.value,

                    days:
                        String(days),

                    reason:
                        requestReason.value.trim(),

                    status:
                        "PENDING"

                }

            );


            alert(
                "Request Submitted"
            );

        }


        editId = null;


        clearRequestForm();


        requestFormCard.classList.add(
            "hidden"
        );


        await loadRequests();


    }catch(error){

        console.error(
            "Submit Request Error:",
            error
        );

        alert(
            "Submit Error"
        );

    }

}


/* ==========================================
   LOAD MY REQUESTS
========================================== */

async function loadRequests(){

    if(!requestBody){

        return;

    }


    requestBody.innerHTML = `

        <tr>

            <td
            colspan="6"
            class="empty-state">

                <span class="material-icons">

                    sync

                </span>

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


        const myRequests = [];


        snapshot.forEach(
            docSnap => {

                const req =
                    docSnap.data();


                const reqEmployee =
                    String(
                        req.empid ||
                        ""
                    )
                    .toUpperCase()
                    .trim();


                const myEmployee =
                    String(
                        currentEmployee.id ||
                        ""
                    )
                    .toUpperCase()
                    .trim();


                if(
                    reqEmployee ===
                    myEmployee
                ){

                    myRequests.push({

                        id:
                            docSnap.id,

                        ...req

                    });

                }

            }
        );


        updateRequestSummary(
            myRequests
        );


        renderRequests(
            myRequests
        );


    }catch(error){

        console.error(
            "Load Requests Error:",
            error
        );


        requestBody.innerHTML = `

            <tr>

                <td
                colspan="6"
                class="empty-state">

                    <span class="material-icons">

                        error_outline

                    </span>

                    Failed to load requests.

                </td>

            </tr>

        `;

    }

}


/* ==========================================
   REQUEST SUMMARY
========================================== */

function updateRequestSummary(
    records
){

    let pending = 0;

    let approved = 0;

    let rejected = 0;


    records.forEach(
        req => {

            const status =
                String(
                    req.status ||
                    "PENDING"
                )
                .toUpperCase()
                .trim();


            if(
                status === "PENDING"
            ){

                pending++;

            }


            else if(
                status === "APPROVED"
            ){

                approved++;

            }


            else if(
                status === "REJECTED"
            ){

                rejected++;

            }

        }
    );


    if(requestTotal){

        requestTotal.textContent =
            records.length;

    }


    if(requestPending){

        requestPending.textContent =
            pending;

    }


    if(requestApproved){

        requestApproved.textContent =
            approved;

    }


    if(requestRejected){

        requestRejected.textContent =
            rejected;

    }

}


/* ==========================================
   RENDER REQUESTS
========================================== */

function renderRequests(
    records
){

    requestBody.innerHTML = "";


    if(records.length === 0){

        requestBody.innerHTML = `

            <tr>

                <td
                colspan="6"
                class="empty-state">

                    <span class="material-icons">

                        event_busy

                    </span>

                    <p>

                        No requests found.

                    </p>

                </td>

            </tr>

        `;

        return;

    }


    /*
       Newest first.
    */

    records.sort(
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


    records.forEach(
        req => {

            const status =
                String(
                    req.status ||
                    "PENDING"
                )
                .toUpperCase()
                .trim();


            const statusClass =
                status.toLowerCase();


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    ${escapeHtml(
                        req.type ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        req.date ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        String(
                            req.days ||
                            "-"
                        )
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        req.reason ||
                        "-"
                    )}

                </td>


                <td>

                    <span
                    class="status ${statusClass}">

                        ${escapeHtml(
                            status
                        )}

                    </span>

                </td>


                <td>

                    <button
                    class="view-btn"
                    data-action="view">

                        VIEW

                    </button>


                    <button
                    class="edit-btn"
                    data-action="edit">

                        EDIT

                    </button>


                    <button
                    class="delete-btn"
                    data-action="delete">

                        DELETE

                    </button>

                </td>

            `;


            const viewBtn =
                row.querySelector(
                    '[data-action="view"]'
                );


            const editBtn =
                row.querySelector(
                    '[data-action="edit"]'
                );


            const deleteBtn =
                row.querySelector(
                    '[data-action="delete"]'
                );


            viewBtn.addEventListener(
                "click",
                function(){

                    showRequestDetails(
                        req
                    );

                }
            );


            editBtn.addEventListener(
                "click",
                function(){

                    editRequest(
                        req
                    );

                }
            );


            deleteBtn.addEventListener(
                "click",
                function(){

                    deleteRequest(
                        req.id
                    );

                }
            );


            requestBody.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   EDIT REQUEST
========================================== */

function editRequest(
    request
){

    editId =
        request.id;


    requestType.value =
        request.type ||
        "";


    requestDate.value =
        request.date ||
        "";


    requestDays.value =
        request.days ||
        "";


    requestReason.value =
        request.reason ||
        "";


    requestFormCard.classList.remove(
        "hidden"
    );


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}


/* ==========================================
   DELETE REQUEST
========================================== */

async function deleteRequest(
    id
){

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


        alert(
            "Request Deleted"
        );


        await loadRequests();


    }catch(error){

        console.error(
            "Delete Request Error:",
            error
        );


        alert(
            "Delete Error"
        );

    }

}


/* ==========================================
   REQUEST DETAILS
========================================== */

function showRequestDetails(
    request
){

    if(!requestModal){

        return;

    }


    const status =
        String(
            request.status ||
            "PENDING"
        )
        .toUpperCase();


    requestDetails.innerHTML = `

        <div class="detail-row">

            <div class="detail-label">

                Employee ID

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    request.empid ||
                    "-"
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Employee

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    request.employee ||
                    "-"
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Request

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    request.type ||
                    "-"
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Date

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    request.date ||
                    "-"
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Days

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    request.days ||
                    "-"
                )}

            </div>

        </div>


        <div class="detail-row">

            <div class="detail-label">

                Reason

            </div>

            <div class="detail-value">

                ${escapeHtml(
                    request.reason ||
                    "-"
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

                    ${escapeHtml(
                        status
                    )}

                </span>

            </div>

        </div>

    `;


    requestModal.classList.add(
        "show"
    );

}


/* ==========================================
   CLOSE REQUEST MODAL
========================================== */

if(closeRequestModal){

    closeRequestModal.addEventListener(
        "click",
        function(){

            requestModal.classList.remove(
                "show"
            );

        }
    );

}


if(requestModal){

    requestModal.addEventListener(
        "click",
        function(event){

            if(
                event.target ===
                requestModal
            ){

                requestModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* ==========================================
   ATTENDANCE REQUESTS
========================================== */

async function loadAttendanceRequests(){

    if(!attendanceBody){

        return;

    }


    attendanceBody.innerHTML = `

        <tr>

            <td
            colspan="6"
            class="empty-state">

                <span class="material-icons">

                    sync

                </span>

                Loading attendance...

            </td>

        </tr>

    `;


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "attendanceRequests"
                )
            );


        const records = [];


        snapshot.forEach(
            docSnap => {

                const req =
                    docSnap.data();


                const employeeId =
                    String(
                        req.employeeid ||
                        ""
                    )
                    .toUpperCase()
                    .trim();


                const myId =
                    String(
                        currentEmployee.id ||
                        ""
                    )
                    .toUpperCase()
                    .trim();


                if(
                    employeeId ===
                    myId
                ){

                    records.push({

                        id:
                            docSnap.id,

                        ...req

                    });

                }

            }
        );


        renderAttendanceRequests(
            records
        );


    }catch(error){

        console.error(
            "Attendance Request Error:",
            error
        );


        attendanceBody.innerHTML = `

            <tr>

                <td
                colspan="6"
                class="empty-state">

                    Failed to load attendance requests.

                </td>

            </tr>

        `;

    }

}


/* ==========================================
   RENDER ATTENDANCE
========================================== */

function renderAttendanceRequests(
    records
){

    attendanceBody.innerHTML = "";


    if(records.length === 0){

        attendanceBody.innerHTML = `

            <tr>

                <td
                colspan="6"
                class="empty-state">

                    <span class="material-icons">

                        event_busy

                    </span>

                    <p>

                        No attendance requests found.

                    </p>

                </td>

            </tr>

        `;

        return;

    }


    records.forEach(
        req => {

            const status =
                String(
                    req.status ||
                    "PENDING"
                )
                .toUpperCase();


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    ${escapeHtml(
                        req.date ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        req.requesttype ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        req.time ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        req.reason ||
                        "-"
                    )}

                </td>


                <td>

                    <span
                    class="status ${status.toLowerCase()}">

                        ${escapeHtml(
                            status
                        )}

                    </span>

                </td>


                <td>

                    <button
                    class="delete-btn"
                    data-id="${req.id}">

                        DELETE

                    </button>

                </td>

            `;


            const deleteBtn =
                row.querySelector(
                    ".delete-btn"
                );


            deleteBtn.addEventListener(
                "click",
                function(){

                    deleteAttendanceRequest(
                        req.id
                    );

                }
            );


            attendanceBody.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   DELETE ATTENDANCE REQUEST
========================================== */

async function deleteAttendanceRequest(
    id
){

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


        alert(
            "Attendance Request Deleted"
        );


        await loadAttendanceRequests();


    }catch(error){

        console.error(
            error
        );

        alert(
            "Delete Error"
        );

    }

}


/* ==========================================
   PAYSLIP
   Existing payroll collection
========================================== */

async function loadPayslips(){

    if(!payslipBody){

        return;

    }


    payslipBody.innerHTML = `

        <tr>

            <td
            colspan="6"
            class="empty-state">

                <span class="material-icons">

                    sync

                </span>

                Loading payslips...

            </td>

        </tr>

    `;


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "payroll"
                )
            );


        const records = [];


        snapshot.forEach(
            docSnap => {

                const pay =
                    docSnap.data();


                const payId =
                    String(
                        pay.empid ||
                        ""
                    )
                    .toUpperCase()
                    .trim();


                const myId =
                    String(
                        currentEmployee.id ||
                        ""
                    )
                    .toUpperCase()
                    .trim();


                if(
                    payId === myId
                ){

                    records.push({

                        id:
                            docSnap.id,

                        ...pay

                    });

                }

            }
        );


        renderPayslips(
            records
        );


    }catch(error){

        console.error(
            "Payslip Error:",
            error
        );


        payslipBody.innerHTML = `

            <tr>

                <td
                colspan="6"
                class="empty-state">

                    Failed to load payslips.

                </td>

            </tr>

        `;

    }

}


/* ==========================================
   RENDER PAYSLIPS
========================================== */

function renderPayslips(
    records
){

    payslipBody.innerHTML = "";


    if(records.length === 0){

        payslipBody.innerHTML = `

            <tr>

                <td
                colspan="6"
                class="empty-state">

                    <span class="material-icons">

                        receipt_long

                    </span>

                    <p>

                        No payslip found.

                    </p>

                </td>

            </tr>

        `;

        return;

    }


    records.forEach(
        pay => {

            const basic =
                Number(
                    pay.basicpay ||
                    pay.basic ||
                    0
                );


            const overtime =
                Number(
                    pay.overtime ||
                    0
                );


            const deductions =
                Number(
                    pay.deductions ||
                    0
                );


            const net =
                Number(
                    pay.net ||
                    0
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    ${escapeHtml(
                        pay.date ||
                        "-"
                    )}

                </td>


                <td>

                    ${formatMoney(
                        basic
                    )}

                </td>


                <td>

                    ${formatMoney(
                        overtime
                    )}

                </td>


                <td>

                    ${formatMoney(
                        deductions
                    )}

                </td>


                <td>

                    ${formatMoney(
                        net
                    )}

                </td>


                <td>

                    <button
                    class="view-btn"
                    data-id="${pay.id}">

                        VIEW

                    </button>

                </td>

            `;


            row.querySelector(
                ".view-btn"
            )
            .addEventListener(
                "click",
                function(){

                    showPayslip(
                        pay
                    );

                }
            );


            payslipBody.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   SHOW PAYSLIP
========================================== */

function showPayslip(
    pay
){

    const basic =
        Number(
            pay.basicpay ||
            0
        );


    const overtime =
        Number(
            pay.overtime ||
            0
        );


    const deductions =
        Number(
            pay.deductions ||
            0
        );


    const net =
        Number(
            pay.net ||
            0
        );


    alert(

        "PAPPRITO PAYSLIP\n\n" +

        "Employee ID: " +
        (pay.empid || "-") +

        "\nEmployee: " +
        (pay.employee || "-") +

        "\nDate: " +
        (pay.date || "-") +

        "\n\nBasic Pay: " +
        formatMoney(basic) +

        "\nOvertime: " +
        formatMoney(overtime) +

        "\nDeductions: " +
        formatMoney(deductions) +

        "\nNet Pay: " +
        formatMoney(net)

    );

}


/* ==========================================
   TABS
========================================== */

const portalCards =
    document.querySelectorAll(
        ".portal-card"
    );


portalCards.forEach(
    card => {

        card.addEventListener(
            "click",
            function(){

                const section =
                    card.dataset.section;


                portalCards.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                card.classList.add(
                    "active"
                );


                document
                .querySelectorAll(
                    ".portal-section"
                )
                .forEach(
                    sectionElement => {

                        sectionElement.classList.add(
                            "hidden"
                        );

                    }
                );


                const target =
                    document.getElementById(
                        section +
                        "Section"
                    );


                if(target){

                    target.classList.remove(
                        "hidden"
                    );

                }

            }
        );

    }
);


/* ==========================================
   CLEAR REQUEST FORM
========================================== */

function clearRequestForm(){

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

}


/* ==========================================
   MONEY
========================================== */

function formatMoney(
    value
){

    return "₱ " +
        Number(
            value || 0
        )
        .toFixed(2);

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHtml(
    value
){

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
   LOGOUT
========================================== */

window.logout =
async function(){

    if(
        !confirm(
            "Are you sure you want to logout?"
        )
    ){

        return;

    }


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


    sessionStorage.clear();


    window.location.replace(
        "login.html"
    );

};


/* ==========================================
   MOBILE SIDEBAR
========================================== */

document.addEventListener(
    "sidebarLoaded",
    function(){

        const menuBtn =
            document.getElementById(
                "menuBtn"
            );


        const sidebar =
            document.getElementById(
                "sidebar"
            );


        const overlay =
            document.getElementById(
                "overlay"
            );


        if(
            !menuBtn ||
            !sidebar
        ){

            return;

        }


        menuBtn.addEventListener(
            "click",
            function(){

                sidebar.classList.add(
                    "show"
                );


                if(overlay){

                    overlay.classList.add(
                        "show"
                    );

                }

            }
        );


        if(overlay){

            overlay.addEventListener(
                "click",
                function(){

                    sidebar.classList.remove(
                        "show"
                    );


                    overlay.classList.remove(
                        "show"
                    );

                }
            );

        }

    }
);


/* ==========================================
   ESCAPE KEY
========================================== */

document.addEventListener(
    "keydown",
    function(event){

        if(
            event.key === "Escape"
        ){

            if(requestModal){

                requestModal.classList.remove(
                    "show"
                );

            }

        }

    }
);


console.log(
    "PAPPRITO HRIS Employee Portal Ready"
);
