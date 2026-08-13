/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE MASTERLIST JS
   ORIGINAL USER LOGIN SYSTEM
========================================== */

import {
    db
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


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let employees = [];

let editId = null;

let currentStatusFilter = "ALL";

let selectedEmployeeForUser = null;


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
   HELPER
========================================== */

function text(value){

    return String(
        value ?? ""
    ).trim();

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(value){

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

function escapeAttribute(value){

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
        /\r/g,
        "\\r"
    )

    .replace(
        /\n/g,
        "\\n"
    );

}


/* ==========================================
   FULL NAME
========================================== */

function getFullName(employee){

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
   OPEN EMPLOYEE MODAL
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
   CLOSE EMPLOYEE MODAL
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
   GET EMPLOYEE FORM DATA
========================================== */

function getEmployeeFormData(){

    const fields =
        document.querySelectorAll(
            "#employeeModal .emp-field"
        );


    /*
     * Original field order:
     *
     * 0  First Name
     * 1  Middle Name
     * 2  Last Name
     * 3  Birthdate
     * 4  Age
     * 5  Gender
     *
     * 6  SSS
     * 7  PhilHealth
     * 8  Pag-IBIG
     * 9  Health Card
     * 10 Bank
     * 11 Bank Account
     * 12 ID Type
     * 13 ID Number
     *
     * 14 Mobile
     * 15 Email
     * 16 Current Address
     * 17 Permanent Address
     *
     * 18 Employee ID
     * 19 Position
     * 20 Department
     * 21 Employment
     * 22 Status
     * 23 Salary
     *
     * 24 Vacation Leave
     * 25 Sick Leave
     * 26 Birthday Leave
     */


    const value =
        index =>
            fields[index]
            ?
            fields[index].value
            :
            "";


    return {

        firstname:
            text(
                value(0)
            ),

        middlename:
            text(
                value(1)
            ),

        lastname:
            text(
                value(2)
            ),

        birthdate:
            text(
                value(3)
            ),

        age:
            text(
                value(4)
            ),

        gender:
            text(
                value(5)
            ),


        sss:
            text(
                value(6)
            ),

        philhealth:
            text(
                value(7)
            ),

        pagibig:
            text(
                value(8)
            ),

        healthcard:
            text(
                value(9)
            ),

        bankname:
            text(
                value(10)
            ),

        bankaccount:
            text(
                value(11)
            ),

        idtype:
            text(
                value(12)
            ),

        idnumber:
            text(
                value(13)
            ),


        mobile:
            text(
                value(14)
            ),

        email:
            text(
                value(15)
            ),

        currentaddress:
            text(
                value(16)
            ),

        permanentaddress:
            text(
                value(17)
            ),


        employeeid:
            text(
                value(18)
            )
            .toUpperCase(),


        position:
            text(
                value(19)
            ),

        department:
            text(
                value(20)
            ),

        employment:
            text(
                value(21)
            ),

        status:
            text(
                value(22)
            )
            ||
            "Active",

        salary:
            text(
                value(23)
            ),


        vacationleave:
            Number(
                value(24) || 10
            ),

        sickleave:
            Number(
                value(25) || 7
            ),

        birthdayleave:
            Number(
                value(26) || 1
            )

    };

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


    try{

        /* ==================================
           CHECK DUPLICATE EMPLOYEE ID
        ================================== */

        const duplicate =
            employees.find(
                employee =>

                    employee.employeeid
                    &&
                    text(
                        employee.employeeid
                    )
                    .toUpperCase()
                    ===
                    employeeData.employeeid
                    &&
                    employee.id !==
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
           UPDATE
        ================================== */

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


        /* ==================================
           NEW EMPLOYEE
        ================================== */

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

            "Save Employee Error\n\n" +

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
        employee => {


            /* =================================
               STATUS FILTER
            ================================= */

            if(
                currentStatusFilter ===
                "Active"
            ){

                if(
                    text(
                        employee.status
                    )
                    !==
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
                    text(
                        employee.status
                    )
                    ===
                    "Active"
                ){

                    return;

                }

            }


            /* =================================
               USER STATUS
            ================================= */

            const hasUser =

                text(
                    employee.username
                ) !== ""
                &&
                text(
                    employee.password
                ) !== "";


            const userButton =

                hasUser

                ?

                `

<button
class="icon-btn user-active"
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
class="icon-btn create-user-btn"
title="Create User"
onclick="openCreateUser(
'${escapeAttribute(
    employee.id
)}'
)">

<span class="material-icons">
person_add
</span>

</button>

`;


            /* =================================
               STATUS CLASS
            ================================= */

            let statusClass =
                "status-other";


            if(
                employee.status ===
                "Active"
            ){

                statusClass =
                    "status-active";

            }

            else if(
                employee.status ===
                "AWOL"
            ){

                statusClass =
                    "status-awol";

            }

            else if(
                employee.status ===
                "Resigned"
            ){

                statusClass =
                    "status-resigned";

            }


            /* =================================
               TABLE ROW
            ================================= */

            table.innerHTML += `

<tr>


<td>

<button
class="icon-btn qr-btn"
title="View QR Code"
onclick="viewQR(
'${escapeAttribute(
    employee.employeeid
)}',
'${escapeAttribute(
    getFullName(employee)
)}'
)">

<span class="material-icons">
qr_code_2
</span>

</button>

</td>


<td>
${escapeHTML(
    employee.firstname
)}
</td>


<td>
${escapeHTML(
    employee.middlename
)}
</td>


<td>
${escapeHTML(
    employee.lastname
)}
</td>


<td>
${escapeHTML(
    employee.birthdate
)}
</td>


<td>
${escapeHTML(
    employee.age
)}
</td>


<td>
${escapeHTML(
    employee.gender
)}
</td>


<td>
${escapeHTML(
    employee.sss
)}
</td>


<td>
${escapeHTML(
    employee.philhealth
)}
</td>


<td>
${escapeHTML(
    employee.pagibig
)}
</td>


<td>
${escapeHTML(
    employee.healthcard
)}
</td>


<td>
${escapeHTML(
    employee.bankname
)}
</td>


<td>
${escapeHTML(
    employee.bankaccount
)}
</td>


<td>
${escapeHTML(
    employee.idtype
)}
</td>


<td>
${escapeHTML(
    employee.idnumber
)}
</td>


<td>
${escapeHTML(
    employee.mobile
)}
</td>


<td>
${escapeHTML(
    employee.email
)}
</td>


<td>
${escapeHTML(
    employee.currentaddress
)}
</td>


<td>
${escapeHTML(
    employee.permanentaddress
)}
</td>


<td>
${escapeHTML(
    employee.employeeid
)}
</td>


<td>
${escapeHTML(
    employee.position
)}
</td>


<td>
${escapeHTML(
    employee.department
)}
</td>


<td>
${escapeHTML(
    employee.employment
)}
</td>


<td
class="${statusClass}">

${escapeHTML(
    employee.status ||
    "Active"
)}

</td>


<td>
${escapeHTML(
    employee.salary
)}
</td>


<td>
${escapeHTML(
    employee.vacationleave ??
    0
)}
</td>


<td>
${escapeHTML(
    employee.sickleave ??
    0
)}
</td>


<td>
${escapeHTML(
    employee.birthdayleave ??
    0
)}
</td>


<!-- USER -->

<td>

${userButton}

</td>


<!-- ACTION -->

<td>

<div class="action-icons">


<button
class="icon-btn edit-btn"
title="Edit Employee"
onclick="editEmployee(
'${escapeAttribute(
    employee.id
)}'
)">

<span class="material-icons">
edit
</span>

</button>


<button
class="icon-btn delete-btn"
title="Delete Employee"
onclick="deleteEmployee(
'${escapeAttribute(
    employee.id
)}'
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
function(id){

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


    /* ======================================
       CHECK EXISTING USER
    ====================================== */

    if(
        text(
            employee.username
        )
        &&
        text(
            employee.password
        )
    ){

        alert(
            "This employee already has a user account."
        );

        return;

    }


    selectedEmployeeForUser =
        employee;


    const name =
        document.getElementById(
            "userEmployeeName"
        );


    const employeeId =
        document.getElementById(
            "userEmployeeId"
        );


    const username =
        document.getElementById(
            "userUsername"
        );


    const password =
        document.getElementById(
            "userPassword"
        );


    const confirmPassword =
        document.getElementById(
            "userConfirmPassword"
        );


    if(
        name
    ){

        name.textContent =
            getFullName(
                employee
            );

    }


    if(
        employeeId
    ){

        employeeId.textContent =
            employee.employeeid ||
            "-";

    }


    /*
     * Default username:
     * Employee ID
     */

    if(
        username
    ){

        username.value =
            employee.username ||
            employee.employeeid ||
            "";

    }


    if(
        password
    ){

        password.value =
            "";

    }


    if(
        confirmPassword
    ){

        confirmPassword.value =
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
   CLOSE CREATE USER
========================================== */

window.closeUserModal =
function(){

    if(
        userModal
    ){

        userModal.style.display =
            "none";

    }


    selectedEmployeeForUser =
        null;

};


/* ==========================================
   TOGGLE USER PASSWORD
========================================== */

window.toggleUserPassword =
function(){

    const password =
        document.getElementById(
            "userPassword"
        );


    const icon =
        document.getElementById(
            "userPasswordIcon"
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
   CREATE USER
========================================== */

window.createEmployeeUser =
async function(){

    if(
        !selectedEmployeeForUser
    ){

        alert(
            "Please select an employee."
        );

        return;

    }


    const usernameInput =
        document.getElementById(
            "userUsername"
        );


    const passwordInput =
        document.getElementById(
            "userPassword"
        );


    const confirmInput =
        document.getElementById(
            "userConfirmPassword"
        );


    const username =
        usernameInput
        ?
        usernameInput.value
            .trim()
            .toUpperCase()
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
        !username
    ){

        alert(
            "Please enter a username."
        );

        return;

    }


    if(
        !password
    ){

        alert(
            "Please enter a password."
        );

        return;

    }


    if(
        password.length <
        4
    ){

        alert(
            "Password must contain at least 4 characters."
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

        /* ==================================
           CHECK DUPLICATE USERNAME
        ================================== */

        const duplicate =
            employees.find(
                employee =>

                    text(
                        employee.username
                    )
                    .toUpperCase()
                    ===
                    username

                    &&

                    employee.id !==
                    selectedEmployeeForUser.id
            );


        if(
            duplicate
        ){

            alert(
                "Username already exists."
            );

            return;

        }


        /* ==================================
           SAVE USER
        ================================== */

        await updateDoc(

            doc(
                db,
                "employees",
                selectedEmployeeForUser.id
            ),

            {

                username:
                    username,

                password:
                    password,

                userCreated:
                    true,

                userCreatedAt:
                    Date.now(),

                role:
                    "employee"

            }

        );


        alert(

            "Employee user created successfully.\n\n" +

            "Username: " +
            username

        );


        closeUserModal();


        await loadEmployees();


    }catch(error){

        console.error(
            "Create User Error:",
            error
        );


        alert(

            "Failed to create user.\n\n" +

            error.message

        );

    }

};


/* ==========================================
   EDIT EMPLOYEE
========================================== */

window.editEmployee =
function(id){

    const employee =
        employees.find(
            item =>
                item.id ===
                id
        );


    if(
        !employee
    ){

        return;

    }


    editId =
        id;


    openModal();


    const values = [

        employee.firstname,

        employee.middlename,

        employee.lastname,

        employee.birthdate,

        employee.age,

        employee.gender,


        employee.sss,

        employee.philhealth,

        employee.pagibig,

        employee.healthcard,

        employee.bankname,

        employee.bankaccount,

        employee.idtype,

        employee.idnumber,


        employee.mobile,

        employee.email,

        employee.currentaddress,

        employee.permanentaddress,


        employee.employeeid,

        employee.position,

        employee.department,

        employee.employment,

        employee.status,

        employee.salary,


        employee.vacationleave ??
            10,

        employee.sickleave ??
            7,

        employee.birthdayleave ??
            1

    ];


    document
        .querySelectorAll(
            "#employeeModal .emp-field"
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


    /*
     * Recalculate age if needed
     */

    if(
        birthdate &&
        birthdate.value
    ){

        calcAge();

    }

};


/* ==========================================
   DELETE EMPLOYEE
========================================== */

window.deleteEmployee =
async function(id){

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
   FILTER STATUS
========================================== */

window.filterStatus =
function(status){

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
            "Please allow pop-ups to view QR."
        );

        return;

    }


    qrWindow.document.write(`

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<title>
PAPPRITO Employee QR
</title>


<style>

*{

box-sizing:border-box;

}


body{

font-family:
Arial,
sans-serif;

text-align:center;

padding:20px;

background:#ffffff;

color:#111111;

}


.logo{

width:70px;

height:70px;

object-fit:cover;

border-radius:50%;

border:3px solid #ffcc00;

}


h2{

color:#d71920;

margin:8px 0;

}


.info{

margin:15px 0;

font-size:13px;

}


#qrcode{

margin:20px auto;

}


button{

margin-top:15px;

padding:10px 20px;

border:none;

border-radius:7px;

background:#ffcc00;

color:#111111;

font-weight:bold;

cursor:pointer;

}

</style>

</head>


<body>


<img
src="../assets/images/logo.png"
class="logo"
alt="PAPPRITO">


<h2>
PAPPRITO
</h2>


<h3>
EMPLOYEE QR CODE
</h3>


<div class="info">

<b>
Employee ID:
</b>

<br>

${escapeHTML(
    employeeid
)}

<br><br>

<b>
Employee:
</b>

<br>

${escapeHTML(
    name
)}

</div>


<div id="qrcode">
</div>


<button
onclick="window.print()">

PRINT QR

</button>


<script
src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js">
<\/script>


<script>

QRCode.toCanvas(

document.createElement(
"canvas"
),

JSON.stringify({

employeeid:
"${String(
    employeeid
)
.replace(
    /\\/g,
    "\\\\"
)
.replace(
    /"/g,
    '\\"'
)}",

name:
"${String(
    name
)
.replace(
    /\\/g,
    "\\\\"
)
.replace(
    /"/g,
    '\\"'
)}"

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
"qrcode"
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
   CLEAR EMPLOYEE FORM
========================================== */

function clearForm(){

    editId =
        null;


    document
        .querySelectorAll(
            "#employeeModal .emp-field"
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
            "#employeeModal .emp-field"
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


    /*
     * Default status
     */

    if(
        fields[22]
    ){

        fields[22].value =
            "Active";

    }


    /*
     * Return to Personal tab
     */

    document
        .querySelectorAll(
            "#employeeModal .tab-content"
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
            "#employeeModal .tab-btn"
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

}


/* ==========================================
   UPDATE TOTAL
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
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================== */

window.addEventListener(
    "click",
    function(event){

        if(
            event.target ===
            employeeModal
        ){

            closeModal();

        }


        if(
            event.target ===
            userModal
        ){

            closeUserModal();

        }

    }
);


/* ==========================================
   START
========================================== */

loadEmployees();
