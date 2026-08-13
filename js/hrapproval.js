/* ==========================================
   PAPPRITO HRIS
   HR APPROVAL
   EMPLOYEE REQUEST MANAGEMENT
========================================== */

import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
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
   HELPERS
========================================== */

function text(value){

    return String(
        value ?? ""
    ).trim();

}


/* ==========================================
   LOAD REQUESTS
========================================== */

async function loadRequests(){

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

                const data =
                    docSnap.data();


                requests.push({

                    id:
                        docSnap.id,

                    ...data

                });

            }
        );


        /*
         * Latest first
         */

        requests.sort(
            (a,b) =>
                Number(
                    b.timestamp || 0
                )
                -
                Number(
                    a.timestamp || 0
                )
        );


        updateStatistics();

        renderRequests();


    }catch(error){

        console.error(
            "Load Requests Error:",
            error
        );


        alert(
            "Failed to load employee requests."
        );

    }

}


/* ==========================================
   FILTER
========================================== */

window.filterRequests =
function(status){

    currentFilter =
        status;


    document
        .querySelectorAll(
            ".filter-btn"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    const activeButton =
        document.querySelector(
            `[data-filter="${status}"]`
        );


    if(activeButton){

        activeButton.classList.add(
            "active"
        );

    }


    renderRequests();

};


/* ==========================================
   RENDER
========================================== */

function renderRequests(){

    const tbody =
        document.getElementById(
            "requestBody"
        );


    if(!tbody){

        return;

    }


    tbody.innerHTML = "";


    let filtered =
        requests;


    if(
        currentFilter !==
        "ALL"
    ){

        filtered =
            requests.filter(
                request =>

                    text(
                        request.status ||
                        "PENDING"
                    )
                    .toUpperCase()
                    ===
                    currentFilter

            );

    }


    if(
        filtered.length === 0
    ){

        tbody.innerHTML = `

<tr>

<td
    colspan="8"
    class="empty-message">

    NO REQUESTS FOUND

</td>

</tr>

`;

        return;

    }


    filtered.forEach(
        request => {

            const status =
                text(
                    request.status ||
                    "PENDING"
                )
                .toUpperCase();


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

<td>
    ${escapeHTML(
        request.empid ||
        "-"
    )}
</td>


<td>
    ${escapeHTML(
        request.employee ||
        "-"
    )}
</td>


<td>

    <span class="request-type">

        ${escapeHTML(
            request.type ||
            "-"
        )}

    </span>

</td>


<td>
    ${escapeHTML(
        request.date ||
        "-"
    )}
</td>


<td>
    ${escapeHTML(
        request.days ??
        "-"
    )}
</td>


<td>
    ${escapeHTML(
        request.reason ||
        "-"
    )}
</td>


<td>

    <span class="status
        ${status.toLowerCase()}">

        ${status}

    </span>

</td>


<td>

    ${actionButtons(request)}

</td>

`;


            tbody.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   ACTION BUTTONS
========================================== */

function actionButtons(
    request
){

    const status =
        text(
            request.status ||
            "PENDING"
        )
        .toUpperCase();


    if(
        status === "PENDING"
    ){

        return `

<button
    class="approve-btn"
    onclick="approveRequest('${request.id}')">

    ✓ APPROVE

</button>


<button
    class="reject-btn"
    onclick="rejectRequest('${request.id}')">

    ✕ REJECT

</button>


<button
    class="delete-btn"
    onclick="deleteRequest('${request.id}')">

    🗑 DELETE

</button>

`;

    }


    return `

<button
    class="delete-btn"
    onclick="deleteRequest('${request.id}')">

    🗑 DELETE

</button>

`;

}


/* ==========================================
   APPROVE
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


    if(
        text(
            request.status
        ).toUpperCase()
        !==
        "PENDING"
    ){

        alert(
            "This request has already been processed."
        );

        return;

    }


    const confirmApprove =
        confirm(
            "Approve this employee request?"
        );


    if(!confirmApprove){

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
            "Request approved."
        );


        await loadRequests();


    }catch(error){

        console.error(
            "Approve Error:",
            error
        );


        alert(
            "Failed to approve request."
        );

    }

};


/* ==========================================
   REJECT
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
        text(
            request.status
        ).toUpperCase()
        !==
        "PENDING"
    ){

        alert(
            "This request has already been processed."
        );

        return;

    }


    const confirmReject =
        confirm(
            "Reject this employee request?"
        );


    if(!confirmReject){

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
            "Request rejected."
        );


        await loadRequests();


    }catch(error){

        console.error(
            "Reject Error:",
            error
        );


        alert(
            "Failed to reject request."
        );

    }

};


/* ==========================================
   DELETE
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
            "Delete this request permanently?"
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
            "Request deleted."
        );


        await loadRequests();


    }catch(error){

        console.error(
            "Delete Request Error:",
            error
        );


        alert(
            "Failed to delete request."
        );

    }

};


/* ==========================================
   STATISTICS
========================================== */

function updateStatistics(){

    const total =
        requests.length;


    const pending =
        requests.filter(
            request =>

                text(
                    request.status ||
                    "PENDING"
                )
                .toUpperCase()
                ===
                "PENDING"

        ).length;


    const approved =
        requests.filter(
            request =>

                text(
                    request.status
                )
                .toUpperCase()
                ===
                "APPROVED"

        ).length;


    const rejected =
        requests.filter(
            request =>

                text(
                    request.status
                )
                .toUpperCase()
                ===
                "REJECTED"

        ).length;


    setText(
        "pendingCount",
        pending
    );


    setText(
        "approvedCount",
        approved
    );


    setText(
        "rejectedCount",
        rejected
    );


    setText(
        "totalCount",
        total
    );

}


/* ==========================================
   SET TEXT
========================================== */

function setText(
    id,
    value
){

    const element =
        document.getElementById(
            id
        );


    if(element){

        element.textContent =
            value;

    }

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(
    value
){

    return text(
        value
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
   REFRESH
========================================== */

window.refreshRequests =
function(){

    loadRequests();

};


/* ==========================================
   DASHBOARD
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
   AUTH
========================================== */

onAuthStateChanged(
    auth,
    async user => {

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


        if(
            role !== "admin"
        ){

            alert(
                "HR Approval is for HR/Admin only."
            );


            window.location.replace(
                "employeeportal.html"
            );


            return;

        }


        await loadRequests();

    }
);
