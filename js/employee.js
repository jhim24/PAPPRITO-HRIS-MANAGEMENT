/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE MASTERLIST JS
   WITH EMPLOYEE USER CREATION
========================================== */

import {
    db,
    auth
} from "./firebase.js";


import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


import {
    createUserWithEmailAndPassword
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";


import {
    initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";


/* ==========================================
   GLOBAL
========================================== */

let employees = [];

let editId = null;

let currentStatusFilter = "ALL";

let selectedUserEmployee = null;

let secondaryAuth = null;


/* ==========================================
   ELEMENTS
========================================== */

const employeeModal =
    document.getElementById(
        "employeeModal"
    );


const userModal =
    document.getElementById(
        "userModal"
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
   SECONDARY FIREBASE APP
========================================== */

function getSecondaryAuth(){

    if(
        secondaryAuth
    ){

        return secondaryAuth;

    }


    /*
     * Use the existing Firebase
     * configuration from the
     * authenticated application.
     */

    const primaryOptions =
        auth.app.options;


    const secondaryApp =
        initializeApp(
            primaryOptions,
            "PAPPRITO-EMPLOYEE-AUTH"
        );


    /*
     * Import Firebase Auth
     * dynamically so the primary
     * admin session is not replaced.
     */

    return import(
        "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js"
    )

    .then(
        module => {

            secondaryAuth =
                module.getAuth(
                    secondaryApp
                );


            return secondaryAuth;

        }
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


    const selected =
        document.getElementById(
            tabId
        );


    if(
        selected
    ){

        selected.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            ".tab-btn"
        )
        .forEach(
            button => {

                button.classList.remove(
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


    const month =
        today.getMonth()
        -
        birth.getMonth();


    if(
        month < 0 ||
        (
            month === 0 &&
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
   SAVE EMPLOYEE
========================================== */

window.saveEmployee =
async function(){

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


    /*
     * ======================================
     * FIELD ORDER
     * ======================================
     */

    const employeeData = {

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
            (
                data[18] || ""
            )
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


        /*
         * LEAVE BALANCES
         */

        vacationleave:
            Number(
                data[24] || 10
            ),

        sickleave:
            Number(
                data[25] || 7
            ),

        birthdayleave:
            Number(
                data[26] || 1
            )

    };


    if(
        !employeeData.firstname ||
        !employeeData.lastname
    ){

        alert(
            "Please enter First Name and Last Name."
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


    try{

        if(
            editId
        ){

            await updateDoc(

                doc(
                    db,
                    "employees",
                    editId
                ),

                employeeData

            );


            alert(
                "Employee updated successfully."
            );

        }

        else{

            await addDoc(

                collection(
                    db,
                    "employees"
                ),

                employeeData

            );


            alert(
                "Employee saved successfully."
            );

        }


        closeModal();

        await loadEmployees();


    }catch(error){

        console.error(
            "Save Employee Error:",
            error
        );


        alert(
            "Save Error\n\n" +
            error.message
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

            table.innerHTML = "";

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


            const hasUser =
                !!(
                    emp.authUid ||
                    emp.userCreated
                );


            const userButton =

                hasUser

                ?

                `

<button
class="icon-btn user-created"
title="User Account Created"
disabled>

<span class="material-icons">
verified_user
</span>

</button>

`

                :

                `

<button
class="icon-btn create-user"
title="Create Employee User"
onclick="openCreateUser(
'${emp.id}'
)">

<span class="material-icons">
person_add
</span>

</button>

`;


            table.innerHTML += `

<tr>


<td>

<button
class="icon-btn qr-btn"
title="View QR"
onclick="viewQR(
'${escapeAttribute(
    emp.employeeid || ""
)}',
'${escapeAttribute(
    getFullName(emp)
)}'
)">

<span class="material-icons">
qr_code_2
</span>

</button>

</td>


<td>
${escapeHTML(
    emp.firstname
)}
</td>


<td>
${escapeHTML(
    emp.middlename
)}
</td>


<td>
${escapeHTML(
    emp.lastname
)}
</td>


<td>
${escapeHTML(
    emp.birthdate
)}
</td>


<td>
${escapeHTML(
    emp.age
)}
</td>


<td>
${escapeHTML(
    emp.gender
)}
</td>


<td>
${escapeHTML(
    emp.sss
)}
</td>


<td>
${escapeHTML(
    emp.philhealth
)}
</td>


<td>
${escapeHTML(
    emp.pagibig
)}
</td>


<td>
${escapeHTML(
    emp.healthcard
)}
</td>


<td>
${escapeHTML(
    emp.bankname
)}
</td>


<td>
${escapeHTML(
    emp.bankaccount
)}
</td>


<td>
${escapeHTML(
    emp.idtype
)}
</td>


<td>
${escapeHTML(
    emp.idnumber
)}
</td>


<td>
${escapeHTML(
    emp.mobile
)}
</td>


<td>
${escapeHTML(
    emp.email
)}
</td>


<td>
${escapeHTML(
    emp.currentaddress
)}
</td>


<td>
${escapeHTML(
    emp.permanentaddress
)}
</td>


<td>
${escapeHTML(
    emp.employeeid
)}
</td>


<td>
${escapeHTML(
    emp.position
)}
</td>


<td>
${escapeHTML(
    emp.department
)}
</td>


<td>
${escapeHTML(
    emp.employment
)}
</td>


<td class="${statusClass}">
${escapeHTML(
    emp.status || "Active"
)}
</td>


<td>
${escapeHTML(
    emp.salary
)}
</td>


<td>
${escapeHTML(
    emp.vacationleave ?? 0
)}
</td>


<td>
${escapeHTML(
    emp.sickleave ?? 0
)}
</td>


<td>
${escapeHTML(
    emp.birthdayleave ?? 0
)}
</td>


<td>

${userButton}

</td>


<td>

<div class="action-icons">


<button
class="icon-btn edit-btn"
title="Edit Employee"
onclick="editEmployee(
'${emp.id}'
)">

<span class="material-icons">
edit
</span>

</button>


<button
class="icon-btn delete-btn"
title="Delete Employee"
onclick="deleteEmployee(
'${emp.id}'
)">

<span class="material-icons">
delete
</span>

</button>


</div>

</td>


</tr>

`;

        }
    );


    updateTotal();

}


/* ==========================================
   CREATE USER
========================================== */

window.openCreateUser =
function(
    id
){

    const employee =
        employees.find(
            item =>
                item.id ===
                id
        );


    if(
        !employee
    ){

        alert(
            "Employee not found."
        );

        return;

    }


    if(
        employee.authUid ||
        employee.userCreated
    ){

        alert(
            "This employee already has a user account."
        );

        return;

    }


    selectedUserEmployee =
        employee;


    const userEmployeeName =
        document.getElementById(
            "userEmployeeName"
        );


    const userEmployeeId =
        document.getElementById(
            "userEmployeeId"
        );


    const userEmail =
        document.getElementById(
            "userEmail"
        );


    const userPassword =
        document.getElementById(
            "userPassword"
        );


    const userConfirmPassword =
        document.getElementById(
            "userConfirmPassword"
        );


    if(
        userEmployeeName
    ){

        userEmployeeName.textContent =
            getFullName(
                employee
            );

    }


    if(
        userEmployeeId
    ){

        userEmployeeId.textContent =
            employee.employeeid ||
            "-";

    }


    if(
        userEmail
    ){

        userEmail.value =
            employee.email ||
            "";

    }


    if(
        userPassword
    ){

        userPassword.value =
            "";

    }


    if(
        userConfirmPassword
    ){

        userConfirmPassword.value =
            "";

    }


    if(
        userModal
    ){

        userModal.style.display =
            "flex";

    }

};


/* ==========================================
   CLOSE USER MODAL
========================================== */

window.closeUserModal =
function(){

    if(
        userModal
    ){

        userModal.style.display =
            "none";

    }


    selectedUserEmployee =
        null;

};


/* ==========================================
   TOGGLE PASSWORD
========================================== */

window.toggleUserPassword =
function(){

    const password =
        document.getElementById(
            "userPassword"
        );


    const icon =
        document.getElementById(
            "passwordIcon"
        );


    if(
        !password
    ){

        return;

    }


    if(
        password.type ===
        "password"
    ){

        password.type =
            "text";


        if(
            icon
        ){

            icon.textContent =
                "visibility_off";

        }

    }

    else{

        password.type =
            "password";


        if(
            icon
        ){

            icon.textContent =
                "visibility";

        }

    }

};


/* ==========================================
   CREATE FIREBASE USER
========================================== */

window.createEmployeeUser =
async function(){

    if(
        !selectedUserEmployee
    ){

        alert(
            "Please select an employee."
        );

        return;

    }


    const emailInput =
        document.getElementById(
            "userEmail"
        );


    const passwordInput =
        document.getElementById(
            "userPassword"
        );


    const confirmInput =
        document.getElementById(
            "userConfirmPassword"
        );


    const email =
        emailInput
        ?
        emailInput.value
            .trim()
            .toLowerCase()
        :
        "";


    const password =
        passwordInput
        ?
        passwordInput.value
        :
        "";


    const confirmPassword =
        confirmInput
        ?
        confirmInput.value
        :
        "";


    /* ======================================
       VALIDATION
    ====================================== */

    if(
        !email
    ){

        alert(
            "Please enter the employee email."
        );

        return;

    }


    if(
        !email.includes("@")
    ){

        alert(
            "Please enter a valid email address."
        );

        return;

    }


    if(
        password.length < 6
    ){

        alert(
            "Password must contain at least 6 characters."
        );

        return;

    }


    if(
        password !==
        confirmPassword
    ){

        alert(
            "Passwords do not match."
        );

        return;

    }


    try{

        /*
         * ==================================
         * SECONDARY AUTH
         *
         * This prevents the current
         * admin account from being
         * logged out.
         * ==================================
         */

        const secondary =
            await getSecondaryAuth();


        const result =
            await createUserWithEmailAndPassword(

                secondary,

                email,

                password

            );


        const newUser =
            result.user;


        /*
         * ==================================
         * UPDATE EMPLOYEE RECORD
         * ==================================
         */

        await updateDoc(

            doc(
                db,
                "employees",
                selectedUserEmployee.id
            ),

            {

                email:
                    email,

                authUid:
                    newUser.uid,

                role:
                    "employee",

                username:
                    email,

                userCreated:
                    true,

                userCreatedAt:
                    Date.now(),

                accountStatus:
                    "Active"

            }

        );


        alert(
            "Employee User created successfully.\n\n" +
            "Email: " +
            email +
            "\n\n" +
            "The employee can now use this account to access the Employee Portal."
        );


        /*
         * Sign out ONLY secondary auth.
         */

        try{

            const {
                signOut:secondarySignOut
            } =
                await import(
                    "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js"
                );


            await secondarySignOut(
                secondary
            );

        }catch(
            secondaryError
        ){

            console.warn(
                "Secondary logout:",
                secondaryError
            );

        }


        closeUserModal();

        await loadEmployees();


    }catch(error){

        console.error(
            "Create User Error:",
            error
        );


        if(
            error.code ===
            "auth/email-already-in-use"
        ){

            alert(
                "This email already has a Firebase account."
            );

            return;

        }


        if(
            error.code ===
            "auth/invalid-email"
        ){

            alert(
                "Invalid email address."
            );

            return;

        }


        if(
            error.code ===
            "auth/weak-password"
        ){

            alert(
                "Password is too weak."
            );

            return;

        }


        alert(
            "Failed to create employee user.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   EDIT EMPLOYEE
========================================== */

window.editEmployee =
function(
    id
){

    const emp =
        employees.find(
            item =>
                item.id ===
                id
        );


    if(
        !emp
    ){

        return;

    }


    editId =
        id;


    openModal();


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

        emp.salary,


        emp.vacationleave ?? 10,

        emp.sickleave ?? 7,

        emp.birthdayleave ?? 1

    ];


    document
        .querySelectorAll(
            ".emp-field"
        )
        .forEach(
            (
                field,
                index
            ) => {

                field.value =
                    values[index] ??
                    "";

            }
        );

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
            "Delete this employee?"
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


        alert(
            "Employee deleted successfully."
        );


    }catch(error){

        console.error(
            "Delete Employee Error:",
            error
        );


        alert(
            "Delete Error\n\n" +
            error.message
        );

    }

};


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
   SEARCH
========================================== */

window.searchEmp =
function(){

    const value =
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
                        value
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
   QR
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
            "Please allow pop-ups."
        );

        return;

    }


    qrWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

<title>
PAPPRITO Employee QR
</title>

<style>

body{

font-family:Arial,sans-serif;

text-align:center;

padding:20px;

}

h2{

color:#d71920;

}

button{

margin-top:20px;

padding:10px 20px;

border:none;

background:#ffcc00;

font-weight:bold;

cursor:pointer;

border-radius:7px;

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

<div id="qrcode"></div>

<button
onclick="window.print()">

PRINT

</button>


<script
src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js">
<\/script>


<script>

QRCode.toCanvas(

document.createElement("canvas"),

JSON.stringify({

employeeid:
"${escapeJS(employeeid)}",

name:
"${escapeJS(name)}"

}),

{

width:220

},

function(error,canvas){

if(!error){

document
.getElementById("qrcode")
.appendChild(canvas);

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
            field => {

                field.value =
                    "";

            }
        );


    /*
     * Default leave balances
     */

    const fields =
        document.querySelectorAll(
            ".emp-field"
        );


    if(
        fields[24]
    ){

        fields[24].value =
            "10";

    }


    if(
        fields[25]
    ){

        fields[25].value =
            "7";

    }


    if(
        fields[26]
    ){

        fields[26].value =
            "1";

    }


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
                button,
                index
            ) => {

                button.classList.toggle(
                    "active",
                    index === 0
                );

            }
        );

};


/* ==========================================
   TOTAL
========================================== */

function updateTotal(){

    const rows =
        document.querySelectorAll(
            "#empTable tbody tr"
        );


    let count =
        0;


    rows.forEach(
        row => {

            if(
                row.style.display !==
                "none"
            ){

                count++;

            }

        }
    );


    if(
        total
    ){

        total.innerText =
            "Total : " +
            count;

    }

}


/* ==========================================
   ESCAPE HTML
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
   ESCAPE ATTRIBUTE
========================================== */

function escapeAttribute(
    value
){

    return String(
        value ?? ""
    )

    .replace(
        /\\/g,
        "\\\\"
    )

    .replace(
        /'/g,
        "\\'"
    )

    .replace(
        /\n/g,
        "\\n"
    )

    .replace(
        /\r/g,
        "\\r"
    );

}


/* ==========================================
   ESCAPE JAVASCRIPT
========================================== */

function escapeJS(
    value
){

    return String(
        value ?? ""
    )

    .replace(
        /\\/g,
        "\\\\"
    )

    .replace(
        /"/g,
        '\\"'
    )

    .replace(
        /\n/g,
        "\\n"
    )

    .replace(
        /\r/g,
        "\\r"
    );

}


/* ==========================================
   FULL NAME
========================================== */

function getFullName(
    employee
){

    return [

        employee.firstname,

        employee.middlename,

        employee.lastname

    ]

    .filter(
        Boolean
    )

    .join(" ")

    .replace(
        /\s+/g,
        " "
    )

    .trim();

}


/* ==========================================
   START
========================================== */

loadEmployees();
