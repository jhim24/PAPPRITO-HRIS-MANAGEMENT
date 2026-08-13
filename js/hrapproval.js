/* ==========================================
   PAPPRITO HRIS
   HR APPROVAL JS
========================================== */

import {
    db,
    auth
} from "./firebase.js";

import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";


/* ==========================================
   GLOBAL
========================================== */

let requests = [];

let currentFilter = "ALL";


/* ==========================================
   ELEMENTS
========================================== */

const requestBody =
    document.getElementById("requestBody");

const emptyBox =
    document.getElementById("emptyBox");

const loadingText =
    document.getElementById("loadingText");

const totalPending =
    document.getElementById("totalPending");

const totalApproved =
    document.getElementById("totalApproved");

const totalRejected =
    document.getElementById("totalRejected");

const totalRequests =
    document.getElementById("totalRequests");


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
        Number(value || 0);

    return Number.isFinite(n)
        ? n
        : 0;

}


function escapeHTML(value){

    return text(value)

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

}


/* ==========================================
   NORMALIZE REQUEST TYPE
========================================== */

function normalizeRequestType(type){

    return text(type)
        .toUpperCase()
        .replace(/\s+/g," ")
        .trim();

}


/* ==========================================
   NORMALIZE STATUS
========================================== */

function normalizeStatus(status){

    const value =
        text(status || "PENDING")
        .toUpperCase();

    if(value === "APPROVED"){

        return "APPROVED";

    }

    if(value === "REJECTED"){

        return "REJECTED";

    }

    return "PENDING";

}


/* ==========================================
   LOAD REQUESTS
========================================== */

window.loadRequests =
async function(){

    if(loadingText){

        loadingText.innerText =
            "Loading...";

    }


    if(requestBody){

        requestBody.innerHTML = "";

    }


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


        /*
         * Latest request first
         */

        requests.sort(
            (a,b) => {

                return number(
                    b.timestamp
                )
                -
                number(
                    a.timestamp
                );

            }
        );


        updateSummary();

        renderRequests();


        if(loadingText){

            loadingText.innerText =
                "Updated";

        }


    }catch(error){

        console.error(
            "HR Approval Load Error:",
            error
        );


        if(loadingText){

            loadingText.innerText =
                "Load Error";

        }


        if(requestBody){

            requestBody.innerHTML = `

<tr>

<td
colspan="8"
class="empty-message">

Failed to load employee requests.

</td>

</tr>

`;

        }

    }

};


/* ==========================================
   UPDATE SUMMARY
========================================== */

function updateSummary(){

    let pending = 0;

    let approved = 0;

    let rejected = 0;


    requests.forEach(
        request => {

            const status =
                normalizeStatus(
                    request.status
                );


            if(status === "PENDING"){

                pending++;

            }

            else if(status === "APPROVED"){

                approved++;

            }

            else if(status === "REJECTED"){

                rejected++;

            }

        }
    );


    if(totalPending){

        totalPending.innerText =
            pending;

    }


    if(totalApproved){

        totalApproved.innerText =
            approved;

    }


    if(totalRejected){

        totalRejected.innerText =
            rejected;

    }


    if(totalRequests){

        totalRequests.innerText =
            requests.length;

    }

}


/* ==========================================
   RENDER REQUESTS
========================================== */

function renderRequests(){

    if(!requestBody){

        return;

    }


    requestBody.innerHTML = "";


    const filteredRequests =
        requests.filter(
            request => {

                const status =
                    normalizeStatus(
                        request.status
                    );


                if(
                    currentFilter ===
                    "ALL"
                ){

                    return true;

                }


                return (
                    status ===
                    currentFilter
                );

            }
        );


    if(
        filteredRequests.length === 0
    ){

        if(emptyBox){

            emptyBox.style.display =
                "block";

        }

        return;

    }


    if(emptyBox){

        emptyBox.style.display =
            "none";

    }


    filteredRequests.forEach(
        request => {

            const status =
                normalizeStatus(
                    request.status
                );


            const statusClass =
                status.toLowerCase();


            const type =
                normalizeRequestType(
                    request.type
                );


            const row =
                document.createElement(
                    "tr"
                );


            let actions = "";


            if(status === "PENDING"){

                actions = `

<button
class="action-btn approve"
onclick="approveRequest('${request.id}')">

<span class="material-icons">

check

</span>

APPROVE

</button>


<button
class="action-btn reject"
onclick="rejectRequest('${request.id}')">

<span class="material-icons">

close

</span>

REJECT

</button>

`;

            }


            actions += `

<button
class="action-btn delete"
onclick="deleteRequest('${request.id}')">

<span class="material-icons">

delete

</span>

DELETE

</button>

`;


            row.innerHTML = `

<td>

${escapeHTML(
    request.empid || "-"
)}

</td>


<td>

${escapeHTML(
    request.employee || "-"
)}

</td>


<td>

<span class="request-type">

${escapeHTML(
    type || "-"
)}

</span>

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


<td class="reason-cell">

${escapeHTML(
    request.reason || "-"
)}

</td>


<td>

<span
class="status ${statusClass}">

${status}

</span>

</td>


<td>

<div class="action-group">

${actions}

</div>

</td>

`;


            requestBody.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   FILTER REQUESTS
========================================== */

window.filterRequests =
function(filter){

    currentFilter =
        filter;


    document
        .querySelectorAll(
            ".filter-btn"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );


                if(
                    button.dataset.filter ===
                    filter
                ){

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


    renderRequests();

};


/* ==========================================
   APPROVE REQUEST
========================================== */

window.approveRequest =
async function(id){

    const request =
        requests.find(
            item =>
                item.id === id
        );


    if(!request){

        alert(
            "Request not found."
        );

        return;

    }


    const status =
        normalizeStatus(
            request.status
        );


    if(status !== "PENDING"){

        alert(
            "This request has already been processed."
        );

        return;

    }


    const employeeId =
        text(
            request.empid
        )
        .toUpperCase();


    if(!employeeId){

        alert(
            "Employee ID is missing."
        );

        return;

    }


    const confirmed =
        confirm(

            "Approve this request?\n\n" +

            "Employee: " +
            text(request.employee) +

            "\nRequest: " +
            text(request.type) +

            "\nDate: " +
            text(request.date) +

            "\nDays: " +
            text(request.days)

        );


    if(!confirmed){

        return;

    }


    try{

        /*
         * Find employee
         */

        const employeeSnapshot =
            await getDocs(

                query(

                    collection(
                        db,
                        "employees"
                    ),

                    where(
                        "employeeid",
                        "==",
                        employeeId
                    )

                )

            );


        if(
            employeeSnapshot.empty
        ){

            alert(
                "Employee record not found."
            );

            return;

        }


        const employeeDoc =
            employeeSnapshot.docs[0];


        const employee =
            employeeDoc.data();


        const requestType =
            normalizeRequestType(
                request.type
            );


        const days =
            Math.max(
                1,
                number(
                    request.days
                )
            );


        const updates = {};


        /* ==================================
           VACATION LEAVE
        ================================== */

        if(
            requestType ===
            "VACATION LEAVE"
        ){

            const balance =
                number(
                    employee.vacationleave
                );


            if(balance < days){

                alert(

                    "Insufficient Vacation Leave balance.\n\n" +

                    "Available: " +
                    balance +

                    "\nRequested: " +
                    days

                );

                return;

            }


            updates.vacationleave =
                balance - days;

        }


        /* ==================================
           SICK LEAVE
        ================================== */

        if(
            requestType ===
            "SICK LEAVE"
        ){

            const balance =
                number(
                    employee.sickleave
                );


            if(balance < days){

                alert(

                    "Insufficient Sick Leave balance.\n\n" +

                    "Available: " +
                    balance +

                    "\nRequested: " +
                    days

                );

                return;

            }


            updates.sickleave =
                balance - days;

        }


        /* ==================================
           BIRTHDAY LEAVE
        ================================== */

        if(
            requestType ===
            "BIRTHDAY LEAVE"
        ){

            const balance =
                number(
                    employee.birthdayleave
                );


            if(balance < days){

                alert(

                    "Insufficient Birthday Leave balance.\n\n" +

                    "Available: " +
                    balance +

                    "\nRequested: " +
                    days

                );

                return;

            }


            updates.birthdayleave =
                balance - days;

        }


        /* ==================================
           UPDATE EMPLOYEE BALANCE
        ================================== */

        if(
            Object.keys(
                updates
            ).length > 0
        ){

            await updateDoc(

                doc(
                    db,
                    "employees",
                    employeeDoc.id
                ),

                updates

            );

        }


        /* ==================================
           UPDATE REQUEST
        ================================== */

        await updateDoc(

            doc(
                db,
                "employeeRequests",
                id
            ),

            {

                status:
                    "APPROVED",

                approvedAt:
                    Date.now(),

                approvedBy:
                    localStorage.getItem(
                        "loggedInUser"
                    ) || "HR"

            }

        );


        alert(
            "Request Approved Successfully."
        );


        await loadRequests();


    }catch(error){

        console.error(
            "Approve Request Error:",
            error
        );


        alert(

            "Failed to approve request.\n\n" +

            error.message

        );

    }

};


/* ==========================================
   REJECT REQUEST
========================================== */

window.rejectRequest =
async function(id){

    const request =
        requests.find(
            item =>
                item.id === id
        );


    if(!request){

        alert(
            "Request not found."
        );

        return;

    }


    if(
        normalizeStatus(
            request.status
        )
        !==
        "PENDING"
    ){

        alert(
            "This request has already been processed."
        );

        return;

    }


    const confirmed =
        confirm(

            "Reject this request?\n\n" +

            "Employee: " +
            text(request.employee) +

            "\nRequest: " +
            text(request.type)

        );


    if(!confirmed){

        return;

    }


    try{

        await updateDoc(

            doc(
                db,
                "employeeRequests",
                id
            ),

            {

                status:
                    "REJECTED",

                rejectedAt:
                    Date.now(),

                rejectedBy:
                    localStorage.getItem(
                        "loggedInUser"
                    ) || "HR"

            }

        );


        alert(
            "Request Rejected."
        );


        await loadRequests();


    }catch(error){

        console.error(
            "Reject Request Error:",
            error
        );


        alert(

            "Failed to reject request.\n\n" +

            error.message

        );

    }

};


/* ==========================================
   DELETE REQUEST
========================================== */

window.deleteRequest =
async function(id){

    const request =
        requests.find(
            item =>
                item.id === id
        );


    if(!request){

        alert(
            "Request not found."
        );

        return;

    }


    const confirmed =
        confirm(

            "Delete this request?\n\n" +

            "Employee: " +
            text(request.employee) +

            "\nRequest: " +
            text(request.type)

        );


    if(!confirmed){

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
            "Request Deleted."
        );


        await loadRequests();


    }catch(error){

        console.error(
            "Delete Request Error:",
            error
        );


        alert(

            "Failed to delete request.\n\n" +

            error.message

        );

    }

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
   AUTH PROTECTION
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


        const role =
            text(
                localStorage.getItem(
                    "userRole"
                )
            )
            .toLowerCase();


        /*
         * HR Approval is for admin/HR.
         */

        if(
            role !== "admin" &&
            role !== "hr"
        ){

            alert(
                "HR Approval access only."
            );


            window.location.replace(
                "dashboard.html"
            );

            return;

        }


        loadRequests();

    }

);
