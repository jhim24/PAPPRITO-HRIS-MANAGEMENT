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

                {

                    ...employeeData,

                    createdAt:
                        Date.now()

                }

            );


            alert(
                "Employee added successfully."
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

            "Failed to save employee.\n\n" +
            error.message

        );

    }

};


/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    try{

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


        renderTable();

    }catch(error){

        console.error(
            "Load Employees Error:",
            error
        );


        alert(

            "Failed to load employees.\n\n" +
            error.message

        );

    }

}


/* ==========================================
   RENDER TABLE
========================================== */

function renderTable(){

    const tbody =
        document.querySelector(
            "#empTable tbody"
        );


    if(
        !tbody
    ){

        return;

    }


    tbody.innerHTML =
        "";


    let filtered =
        employees.filter(
            employee => {

                const status =
                    text(
                        employee.status
                    )
                    .toUpperCase();


                if(
                    currentStatusFilter ===
                    "ALL"
                ){

                    return true;

                }


                return (
                    status ===
                    currentStatusFilter
                );

            }
        );


    if(
        filtered.length === 0
    ){

        tbody.innerHTML = `

<tr>

<td
    colspan="30"
    style="
        text-align:center;
        padding:30px;
        font-weight:800;
    ">

No employee records found.

</td>

</tr>

`;

        updateTotal();

        return;

    }


    filtered.forEach(
        employee => {

            const name =
                getFullName(
                    employee
                );


            const status =
                text(
                    employee.status
                )
                ||
                "Active";


            const userCreated =
                employee.userCreated
                ?
                "YES"
                :
                "NO";


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

<td>
${escapeHTML(
    employee.employeeid
)}
</td>

<td>
${escapeHTML(
    name
)}
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

<td>
${escapeHTML(
    status
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
    10
)}
</td>

<td>
${escapeHTML(
    employee.sickleave ??
    7
)}
</td>

<td>
${escapeHTML(
    employee.birthdayleave ??
    1
)}
</td>

<td>
${userCreated}
</td>

<td>

<div class="action-icons">

<button
    type="button"
    class="icon-btn"
    title="Create User"
    onclick="createUser('${escapeAttribute(employee.id)}')">

<span class="material-icons">
person_add
</span>

</button>


<button
    type="button"
    class="icon-btn"
    title="QR Code"
    onclick="viewQR(
        '${escapeAttribute(employee.employeeid)}',
        '${escapeAttribute(name)}'
    )">

<span class="material-icons">
qr_code_2
</span>

</button>


<button
    type="button"
    class="icon-btn"
    title="Edit"
    onclick="editEmployee('${escapeAttribute(employee.id)}')">

<span class="material-icons">
edit
</span>

</button>


<button
    type="button"
    class="icon-btn"
    title="Delete"
    onclick="deleteEmployee('${escapeAttribute(employee.id)}')">

<span class="material-icons">
delete
</span>

</button>

</div>

</td>

`;


            tbody.appendChild(
                row
            );

        }
    );


    updateTotal();

}


/* ==========================================
   CREATE USER
========================================== */

window.createUser =
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
            "Employee record not found."
        );

        return;

    }


    selectedEmployeeForUser =
        employee;


    const userEmployeeName =
        document.getElementById(
            "userEmployeeName"
        );


    const userEmployeeId =
        document.getElementById(
            "userEmployeeId"
        );


    const username =
        document.getElementById(
            "username"
        );


    const password =
        document.getElementById(
            "password"
        );


    if(
        userEmployeeName
    ){

        userEmployeeName.value =
            getFullName(
                employee
            );

    }


    if(
        userEmployeeId
    ){

        userEmployeeId.value =
            employee.employeeid ||
            "";

    }


    if(
        username
    ){

        username.value =
            "";

    }


    if(
        password
    ){

        password.value =
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


    selectedEmployeeForUser =
        null;

};


/* ==========================================
   SAVE USER
========================================== */

window.saveUser =
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
            "username"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const username =
        text(
            usernameInput
            ?
            usernameInput.value
            :
            ""
        )
        .toLowerCase();


    const password =
        text(
            passwordInput
            ?
            passwordInput.value
            :
            ""
        );


    if(
        !username
    ){

        alert(
            "Please enter username."
        );

        return;

    }


    if(
        !password
    ){

        alert(
            "Please enter password."
        );

        return;

    }


    try{

        const duplicate =
            employees.find(
                employee =>

                    text(
                        employee.username
                    )
                    .toUpperCase()
                    ===
                    username
                    .toUpperCase()

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


    if(
        fields[22]
    ){

        fields[22].value =
            "Active";

    }


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
