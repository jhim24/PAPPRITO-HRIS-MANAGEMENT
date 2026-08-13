/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE MASTERLIST JS
   EMPLOYEE PORTAL ACCOUNT VERSION
========================================== */


import {
    db,
    auth
} from "./firebase.js";


import {

    initializeApp,
    getApps,
    getApp

}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";


import {

    getAuth,
    createUserWithEmailAndPassword

}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";


import {

    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    where,
    getDoc

}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let employees = [];

let editId = null;

let currentStatusFilter = "ALL";


/* ==========================================
   ELEMENTS
========================================== */

const employeeModal =
    document.getElementById(
        "employeeModal"
    );


const birthdate =
    document.getElementById(
        "birthdate"
    );


const age =
    document.getElementById(
        "age"
    );


const search =
    document.getElementById(
        "search"
    );


const total =
    document.getElementById(
        "total"
    );


/* ==========================================
   EMPLOYEE PORTAL ELEMENTS
========================================== */

const portalEnabled =
    document.getElementById(
        "portalEnabled"
    );


const portalPassword =
    document.getElementById(
        "portalPassword"
    );


/* ==========================================
   SECONDARY FIREBASE APP
========================================== */

/*
   IMPORTANT:

   We cannot create an employee Firebase
   Auth account using the main auth object
   because doing so would log the ADMIN out.

   Therefore we create a SECOND Firebase App
   only for employee account creation.
*/


let secondaryApp = null;

let secondaryAuth = null;


function initializeSecondaryAuth(){

    try{

        const existingApps =
            getApps();


        const existingSecondary =
            existingApps.find(
                app =>

                app.name ===
                "PAPPRITO_EMPLOYEE_AUTH"
            );


        if(
            existingSecondary
        ){

            secondaryApp =
                existingSecondary;

        }else{

            /*
             * Get the Firebase configuration
             * from the existing main app.
             */

            const mainApp =
                getApp();


            const config =
                mainApp.options;


            secondaryApp =
                initializeApp(
                    config,
                    "PAPPRITO_EMPLOYEE_AUTH"
                );

        }


        secondaryAuth =
            getAuth(
                secondaryApp
            );


        return true;


    }catch(error){

        console.error(
            "Secondary Auth Error:",
            error
        );


        return false;

    }

}


/* ==========================================
   CREATE INTERNAL AUTH EMAIL
========================================== */

/*
   Employees login using Employee ID.

   Firebase Authentication requires an email.

   Therefore we create an internal email:

   EMP001
   ↓
   emp001@papprito-hr.local

   The employee will NOT need to know
   this internal email.
*/


function createAuthEmail(
    employeeId
){

    return (

        String(
            employeeId || ""
        )
        .trim()
        .toLowerCase()

        +

        "@papprito-hr.local"

    );

}


/* ==========================================
   OPEN MODAL
========================================== */

window.openModal =
function(){

    if(
        employeeModal
    ){

        employeeModal.style.display =
            "flex";

    }


    /*
     * New employee mode
     */

    editId =
        null;


    if(
        portalEnabled
    ){

        portalEnabled.checked =
            false;

    }


    if(
        portalPassword
    ){

        portalPassword.value =
            "";

        portalPassword.placeholder =
            "Temporary Password";

    }

};


/* ==========================================
   CLOSE MODAL
========================================== */

window.closeModal =
function(){

    if(
        employeeModal
    ){

        employeeModal.style.display =
            "none";

    }


    clearForm();

};


/* ==========================================
   OPEN TAB
========================================== */

window.openTab =
function(
    evt,
    tabId
){

    document
        .querySelectorAll(
            ".tab-content"
        )
        .forEach(
            tab => {

                tab.classList.remove(
                    "active"
                );

            }
        );


    const selectedTab =
        document.getElementById(
            tabId
        );


    if(
        selectedTab
    ){

        selectedTab.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            ".tab-btn"
        )
        .forEach(
            btn => {

                btn.classList.remove(
                    "active"
                );

            }
        );


    if(
        evt &&
        evt.currentTarget
    ){

        evt.currentTarget.classList.add(
            "active"
        );

    }

};


/* ==========================================
   CALCULATE AGE
========================================== */

window.calcAge =
function(){

    if(
        !birthdate ||
        !age ||
        !birthdate.value
    ){

        return;

    }


    const birth =
        new Date(
            birthdate.value
        );


    const today =
        new Date();


    let years =
        today.getFullYear()
        -
        birth.getFullYear();


    const monthDifference =
        today.getMonth()
        -
        birth.getMonth();


    if(

        monthDifference < 0

        ||

        (
            monthDifference === 0

            &&

            today.getDate()
            <
            birth.getDate()
        )

    ){

        years--;

    }


    age.value =
        years;

};


/* ==========================================
   GET FORM DATA
========================================== */

function getEmployeeFormData(){

    const fields =
        document.querySelectorAll(
            ".emp-field"
        );


    const data = [];


    fields.forEach(
        field => {

            data.push(
                field.value
            );

        }
    );


    return {

        firstname:
            data[0] || "",

        middlename:
            data[1] || "",

        lastname:
            data[2] || "",

        birthdate:
            data[3] || "",

        age:
            data[4] || "",

        gender:
            data[5] || "",


        sss:
            data[6] || "",

        philhealth:
            data[7] || "",

        pagibig:
            data[8] || "",

        healthcard:
            data[9] || "",


        bankname:
            data[10] || "",

        bankaccount:
            data[11] || "",

        idtype:
            data[12] || "",

        idnumber:
            data[13] || "",


        mobile:
            data[14] || "",

        email:
            data[15] || "",

        currentaddress:
            data[16] || "",

        permanentaddress:
            data[17] || "",


        employeeid:
            (data[18] || "")
            .toUpperCase()
            .trim(),


        position:
            data[19] || "",

        department:
            data[20] || "",

        employment:
            data[21] || "",

        status:
            data[22] || "Active",

        salary:
            data[23] || "",


        vacationleave:
            10,

        sickleave:
            7,

        birthdayleave:
            1

    };

}


/* ==========================================
   CHECK DUPLICATE EMPLOYEE ID
========================================== */

async function employeeIdExists(
    employeeId,
    ignoreId = null
){

    const snapshot =
        await getDocs(
            collection(
                db,
                "employees"
            )
        );


    let exists =
        false;


    snapshot.forEach(
        docSnap => {

            if(
                ignoreId &&
                docSnap.id ===
                ignoreId
            ){

                return;

            }


            const emp =
                docSnap.data();


            const existingId =
                String(
                    emp.employeeid || ""
                )
                .trim()
                .toUpperCase();


            if(
                existingId ===
                employeeId
            ){

                exists =
                    true;

            }

        }
    );


    return exists;

}


/* ==========================================
   CREATE EMPLOYEE AUTH ACCOUNT
========================================== */

async function createEmployeePortalAccount(
    employeeId,
    password
){

    if(
        !employeeId
    ){

        throw new Error(
            "Employee ID is required."
        );

    }


    if(
        !password
    ){

        throw new Error(
            "Employee portal password is required."
        );

    }


    if(
        password.length < 6
    ){

        throw new Error(
            "Employee portal password must contain at least 6 characters."
        );

    }


    const initialized =
        initializeSecondaryAuth();


    if(
        !initialized ||
        !secondaryAuth
    ){

        throw new Error(
            "Unable to initialize Employee Portal Authentication."
        );

    }


    const authEmail =
        createAuthEmail(
            employeeId
        );


    try{

        const result =
            await createUserWithEmailAndPassword(

                secondaryAuth,

                authEmail,

                password

            );


        return {

            uid:
                result.user.uid,

            email:
                authEmail

        };


    }catch(error){

        console.error(
            "Employee Auth Creation Error:",
            error
        );


        if(
            error.code ===
            "auth/email-already-in-use"
        ){

            throw new Error(
                "Employee Portal account already exists for this Employee ID."
            );

        }


        if(
            error.code ===
            "auth/weak-password"
        ){

            throw new Error(
                "Password is too weak. Use at least 6 characters."
            );

        }


        throw error;

    }

}


/* ==========================================
   SAVE EMPLOYEE
========================================== */

window.saveEmployee =
async function(){

    const employeeData =
        getEmployeeFormData();


    /* ======================================
       VALIDATION
    ====================================== */

    if(
        !employeeData.firstname
    ){

        alert(
            "Please enter First Name."
        );

        return;

    }


    if(
        !employeeData.lastname
    ){

        alert(
            "Please enter Last Name."
        );

        return;

    }


    if(
        !employeeData.employeeid
    ){

        alert(
            "Please enter Employee ID."
        );

        return;

    }


    /* ======================================
       PORTAL SETTINGS
    ====================================== */

    const enablePortal =
        portalEnabled
        ?
        portalEnabled.checked
        :
        false;


    const password =
        portalPassword
        ?
        portalPassword.value
        :
        "";


    /*
     * New employee + portal enabled
     */

    if(
        !editId &&
        enablePortal &&
        !password
    ){

        alert(
            "Please enter a temporary password for the Employee Portal."
        );

        return;

    }


    if(
        !editId &&
        enablePortal &&
        password.length < 6
    ){

        alert(
            "Employee Portal password must contain at least 6 characters."
        );

        return;

    }


    try{

        /* ==================================
           DUPLICATE EMPLOYEE ID
        ================================== */

        const duplicate =
            await employeeIdExists(
                employeeData.employeeid,
                editId
            );


        if(
            duplicate
        ){

            alert(
                "Employee ID already exists."
            );

            return;

        }


        /* ==================================
           NEW EMPLOYEE
        ================================== */

        if(
            !editId
        ){

            let portalAccount =
                null;


            /*
             * Create Firebase Auth account
             * BEFORE saving Firestore employee.
             */

            if(
                enablePortal
            ){

                portalAccount =
                    await createEmployeePortalAccount(

                        employeeData.employeeid,

                        password

                    );

            }


            /* ==============================
               SAVE EMPLOYEE
            ============================== */

            const finalData = {

                ...employeeData,

                portalEnabled:
                    enablePortal,

                portalEmail:
                    portalAccount
                    ?
                    portalAccount.email
                    :
                    "",

                portalUid:
                    portalAccount
                    ?
                    portalAccount.uid
                    :
                    ""

            };


            await addDoc(

                collection(
                    db,
                    "employees"
                ),

                finalData

            );


            alert(

                enablePortal

                ?

                "Employee Saved Successfully.\n\nEmployee Portal account has been created."

                :

                "Employee Saved Successfully."

            );

        }


        /* ==================================
           EDIT EMPLOYEE
        ================================== */

        else{

            /*
             * Get existing employee
             */

            const employeeRef =
                doc(
                    db,
                    "employees",
                    editId
                );


            const employeeSnap =
                await getDoc(
                    employeeRef
                );


            if(
                !employeeSnap.exists()
            ){

                alert(
                    "Employee record not found."
                );

                return;

            }


            const existingEmployee =
                employeeSnap.data();


            let portalUid =
                existingEmployee.portalUid
                ||
                "";


            let portalEmail =
                existingEmployee.portalEmail
                ||
                "";


            /*
             * If portal was previously disabled
             * and admin enables it now,
             * create the Auth account.
             */

            if(

                enablePortal

                &&

                !existingEmployee.portalEnabled

            ){

                if(
                    !password
                ){

                    alert(
                        "Please enter a temporary password to create the Employee Portal account."
                    );

                    return;

                }


                if(
                    password.length < 6
                ){

                    alert(
                        "Employee Portal password must contain at least 6 characters."
                    );

                    return;

                }


                const portalAccount =
                    await createEmployeePortalAccount(

                        employeeData.employeeid,

                        password

                    );


                portalUid =
                    portalAccount.uid;


                portalEmail =
                    portalAccount.email;

            }


            /*
             * Save updated employee data
             */

            await updateDoc(

                employeeRef,

                {

                    ...employeeData,

                    portalEnabled:
                        enablePortal,

                    portalUid:
                        portalUid,

                    portalEmail:
                        portalEmail

                }

            );


            alert(
                "Employee Updated Successfully."
            );

        }


        /* ==================================
           CLOSE + RELOAD
        ================================== */

        closeModal();


        await loadEmployees();


    }catch(error){

        console.error(
            "Save Employee Error:",
            error
        );


        alert(

            error.message

            ||

            "Save Employee Error."

        );

    }

};


/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    try{

        employees = [];


        const table =
            document.querySelector(
                "#empTable tbody"
            );


        if(
            table
        ){

            table.innerHTML =
                "";

        }


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


        renderTable();


    }catch(error){

        console.error(
            "Load Employees Error:",
            error
        );


        alert(
            "Failed to load employees."
        );

    }

}


/* ==========================================
   RENDER TABLE
========================================== */

function renderTable(){

    const table =
        document.querySelector(
            "#empTable tbody"
        );


    if(
        !table
    ){

        return;

    }


    table.innerHTML =
        "";


    employees.forEach(
        emp => {


            /* ==============================
               ACTIVE FILTER
            ============================== */

            if(
                currentStatusFilter ===
                "Active"
            ){

                if(
                    emp.status !==
                    "Active"
                ){

                    return;

                }

            }


            /* ==============================
               INACTIVE FILTER
            ============================== */

            if(
                currentStatusFilter ===
                "INACTIVE"
            ){

                if(
                    emp.status ===
                    "Active"
                ){

                    return;

                }

            }


            /* ==============================
               STATUS CLASS
            ============================== */

            const statusClass =

                emp.status ===
                "Active"

                ?

                "status-active"

                :

                emp.status ===
                "AWOL"

                ?

                "status-awol"

                :

                emp.status ===
                "Resigned"

                ?

                "status-resigned"

                :

                "status-other";


            /* ==============================
               PORTAL STATUS
            ============================== */

            const portalStatus =

                emp.portalEnabled

                ?

                `<span style="
                    color:#008000;
                    font-weight:bold;
                ">
                    ENABLED
                </span>`

                :

                `<span style="
                    color:#999;
                    font-weight:bold;
                ">
                    DISABLED
                </span>`;


            /* ==============================
               TABLE ROW
            ============================== */

            table.innerHTML += `

<tr>


<td>

<button
class="print-btn"
onclick="
viewQR(
'${escapeHTML(
    emp.employeeid || ""
)}',
'${escapeHTML(
    `${emp.firstname || ""} ${emp.lastname || ""}`
)}'
)">

VIEW QR

</button>

</td>


<td>

${escapeHTML(
    emp.firstname || ""
)}

</td>


<td>

${escapeHTML(
    emp.middlename || ""
)}

</td>


<td>

${escapeHTML(
    emp.lastname || ""
)}

</td>


<td>

${escapeHTML(
    emp.birthdate || ""
)}

</td>


<td>

${escapeHTML(
    emp.age || ""
)}

</td>


<td>

${escapeHTML(
    emp.gender || ""
)}

</td>


<td>

${escapeHTML(
    emp.sss || ""
)}

</td>


<td>

${escapeHTML(
    emp.philhealth || ""
)}

</td>


<td>

${escapeHTML(
    emp.pagibig || ""
)}

</td>


<td>

${escapeHTML(
    emp.healthcard || ""
)}

</td>


<td>

${escapeHTML(
    emp.bankname || ""
)}

</td>


<td>

${escapeHTML(
    emp.bankaccount || ""
)}

</td>


<td>

${escapeHTML(
    emp.idtype || ""
)}

</td>


<td>

${escapeHTML(
    emp.idnumber || ""
)}

</td>


<td>

${escapeHTML(
    emp.mobile || ""
)}

</td>


<td>

${escapeHTML(
    emp.email || ""
)}

</td>


<td>

${escapeHTML(
    emp.currentaddress || ""
)}

</td>


<td>

${escapeHTML(
    emp.permanentaddress || ""
)}

</td>


<td>

<strong>

${escapeHTML(
    emp.employeeid || ""
)}

</strong>

</td>


<td>

${escapeHTML(
    emp.position || ""
)}

</td>


<td>

${escapeHTML(
    emp.department || ""
)}

</td>


<td>

${escapeHTML(
    emp.employment || ""
)}

</td>


<td
class="${statusClass}">

${escapeHTML(
    emp.status || "Active"
)}

</td>


<td>

${escapeHTML(
    emp.salary || ""
)}

</td>


<td>

${emp.vacationleave || 0}

</td>


<td>

${emp.sickleave || 0}

</td>


<td>

${emp.birthdayleave || 0}

</td>


<td>

${portalStatus}


<br><br>


<button
class="btn"
onclick="
editEmployee(
'${escapeHTML(emp.id)}'
)">

Edit

</button>


<button
class="btn"
onclick="
deleteEmployee(
'${escapeHTML(emp.id)}'
)">

Delete

</button>


</td>


</tr>

`;

        }
    );


    updateTotal();

}


/* ==========================================
   HTML ESCAPE
========================================== */

function escapeHTML(
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
   FILTER
========================================== */

window.filterStatus =
function(
    status
){

    currentStatusFilter =
        status;


    renderTable();

};


/* ==========================================
   VIEW QR
========================================== */

window.viewQR =
function(
    employeeid,
    name
){

    const qrWindow =
        window.open(
            "",
            "_blank",
            "width=400,height=500"
        );


    if(
        !qrWindow
    ){

        alert(
            "Please allow pop-ups to view the QR code."
        );

        return;

    }


    qrWindow.document.write(`

<html>

<head>

<title>

Employee QR

</title>


<style>

body{

    font-family:
        Tahoma,
        sans-serif;

    text-align:center;

    padding:20px;

    background:white;

}


h2{

    color:#cc0000;

}


#qrcode{

    margin-top:20px;

}


button{

    margin-top:20px;

    padding:10px 20px;

    border:none;

    background:#ffcc00;

    font-weight:bold;

    cursor:pointer;

    border-radius:8px;

}

</style>

</head>


<body>


<h2>

PAPPRITO

</h2>


<h3>

Employee QR Code

</h3>


<p>

<b>ID:</b>

${escapeHTML(employeeid)}

</p>


<p>

<b>Name:</b>

${escapeHTML(name)}

</p>


<div id="qrcode">

</div>


<br>


<button
onclick="window.print()">

PRINT QR

</button>


<script src="
https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js
"><\/script>


<script>

QRCode.toCanvas(

    document.createElement(
        'canvas'
    ),

    JSON.stringify({

        employeeid:
            '${String(employeeid)
                .replace(/'/g,"\\'")}',

        name:
            '${String(name)
                .replace(/'/g,"\\'")}'

    }),

    {

        width:220

    },

    function(
        error,
        canvas
    ){

        if(
            !error
        ){

            document
                .getElementById(
                    'qrcode'
                )
                .appendChild(
                    canvas
                );

        }

    }

);

<\/script>


</body>

</html>

`);


    qrWindow.document.close();

};


/* ==========================================
   EDIT EMPLOYEE
========================================== */

window.editEmployee =
async function(
    id
){

    const emp =
        employees.find(
            e =>
                e.id ===
                id
        );


    if(
        !emp
    ){

        return;

    }


    openModal();


    editId =
        id;


    const values = [

        emp.firstname,

        emp.middlename,

        emp.lastname,

        emp.birthdate,

        emp.age,

        emp.gender,


        emp.sss,

        emp.philhealth,

        emp.pagibig,

        emp.healthcard,


        emp.bankname,

        emp.bankaccount,

        emp.idtype,

        emp.idnumber,


        emp.mobile,

        emp.email,

        emp.currentaddress,

        emp.permanentaddress,


        emp.employeeid,

        emp.position,

        emp.department,

        emp.employment,

        emp.status,

        emp.salary

    ];


    document
        .querySelectorAll(
            ".emp-field"
        )
        .forEach(
            (
                field,
                i
            ) => {

                field.value =
                    values[i] || "";

            }
        );


    /*
     * Restore portal settings
     */

    if(
        portalEnabled
    ){

        portalEnabled.checked =
            emp.portalEnabled === true;

    }


    if(
        portalPassword
    ){

        portalPassword.value =
            "";


        portalPassword.placeholder =

            emp.portalEnabled

            ?

            "Password already exists - leave blank"

            :

            "Temporary Password";

    }

};


/* ==========================================
   DELETE EMPLOYEE
========================================== */

window.deleteEmployee =
async function(
    id
){

    if(
        !confirm(
            "Delete Employee?"
        )
    ){

        return;

    }


    try{

        await deleteDoc(

            doc(
                db,
                "employees",
                id
            )

        );


        await loadEmployees();


    }catch(error){

        console.error(
            "Delete Employee Error:",
            error
        );


        alert(
            "Delete Error"
        );

    }

};


/* ==========================================
   SEARCH
========================================== */

window.searchEmp =
function(){

    const val =

        search

        ?

        search.value
            .toLowerCase()

        :

        "";


    const rows =
        document.querySelectorAll(
            "#empTable tbody tr"
        );


    let visible =
        0;


    rows.forEach(
        row => {

            const show =
                row.innerText
                    .toLowerCase()
                    .includes(
                        val
                    );


            row.style.display =
                show
                ?
                ""
                :
                "none";


            if(
                show
            ){

                visible++;

            }

        }
    );


    if(
        total
    ){

        total.innerText =
            "Showing : " +
            visible;

    }

};


/* ==========================================
   CLEAR FORM
========================================== */

function clearForm(){

    editId =
        null;


    document
        .querySelectorAll(
            ".emp-field"
        )
        .forEach(
            el => {

                el.value =
                    "";

            }
        );


    if(
        portalEnabled
    ){

        portalEnabled.checked =
            false;

    }


    if(
        portalPassword
    ){

        portalPassword.value =
            "";

        portalPassword.placeholder =
            "Temporary Password";

    }


    /*
     * Return to Personal Info
     */

    document
        .querySelectorAll(
            ".tab-content"
        )
        .forEach(
            tab => {

                tab.classList.remove(
                    "active"
                );

            }
        );


    const personal =
        document.getElementById(
            "personal"
        );


    if(
        personal
    ){

        personal.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            ".tab-btn"
        )
        .forEach(
            (
                btn,
                index
            ) => {

                btn.classList.toggle(
                    "active",
                    index === 0
                );

            }
        );

}


/* ==========================================
   TOTAL
========================================== */

function updateTotal(){

    const rows =
        document.querySelectorAll(

            "#empTable tbody tr:not([style*=\"display: none\"])"

        );


    if(
        total
    ){

        total.innerText =
            "Total : " +
            rows.length;

    }

}


/* ==========================================
   START
========================================== */

loadEmployees();
