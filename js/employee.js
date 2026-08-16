/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE MASTERLIST JS
   FULL UPDATED
   ALL 7 TABS CONNECTED TO TABLE
   + EMPLOYEE SUMMARY
========================================== */


import {
    db
}
from "./firebase.js";


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
   NUMBER HELPER
========================================== */

function numberValue(
    value,
    fallback = 0
){

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


/* ==========================================
   GET TAB FIELDS
========================================== */

function getTabFields(tabId){

    const tab =
        document.getElementById(
            tabId
        );

    if(!tab){

        return [];

    }

    return Array.from(
        tab.querySelectorAll(
            ".emp-field"
        )
    );

}


/* ==========================================
   GET ID VALUE
========================================== */

function idValue(id){

    const field =
        document.getElementById(
            id
        );

    return field
        ?
        field.value
        :
        "";

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
   OPEN MODAL
========================================== */

window.openModal =
function(){

    if(employeeModal){

        employeeModal.style.display =
            "flex";

    }

};


/* ==========================================
   CLOSE MODAL
========================================== */

window.closeModal =
function(){

    if(employeeModal){

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
            "#employeeModal .tab-content"
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


    if(selectedTab){

        selectedTab.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            "#employeeModal .tab-btn"
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


    if(
        Number.isNaN(
            birth.getTime()
        )
    ){

        return;

    }


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

    const personalFields =
        getTabFields(
            "personal"
        );


    const contactFields =
        getTabFields(
            "contact"
        );


    const employmentFields =
        getTabFields(
            "employment"
        );


    const governmentFields =
        getTabFields(
            "government"
        );


    /* ======================================
       COMPENSATION
    ====================================== */

    const compensationSalary =
        text(
            idValue(
                "compensationSalary"
            )
        );


    const payType =
        text(
            idValue(
                "payType"
            )
        );


    const payFrequency =
        text(
            idValue(
                "payFrequency"
            )
        );


    const allowances =
        text(
            idValue(
                "allowances"
            )
        );


    /* ======================================
       PAYROLL
    ====================================== */

    const payrollGroup =
        text(
            idValue(
                "payrollGroup"
            )
        );


    const payrollBank =
        text(
            idValue(
                "payrollBank"
            )
        );


    const payrollBankAccount =
        text(
            idValue(
                "payrollBankAccount"
            )
        );


    const deductions =
        text(
            idValue(
                "deductions"
            )
        );


    /* ======================================
       ATTENDANCE
    ====================================== */

    const schedule =
        text(
            idValue(
                "schedule"
            )
        );


    const shift =
        text(
            idValue(
                "shift"
            )
        );


    const restDay =
        text(
            idValue(
                "restDay"
            )
        );


    const attendanceGroup =
        text(
            idValue(
                "attendanceGroup"
            )
        );


    /* ======================================
       OLD SALARY FIELD
       RETAINED
    ====================================== */

    const existingSalary =
        text(
            employmentFields[5]
                ?
                employmentFields[5].value
                :
                ""
        );


    const finalSalary =
        compensationSalary
        ||
        existingSalary;


    return {

        /* ==================================
           PERSONAL
        ================================== */

        firstname:
            text(
                personalFields[0]
                ?
                personalFields[0].value
                :
                ""
            ),

        middlename:
            text(
                personalFields[1]
                ?
                personalFields[1].value
                :
                ""
            ),

        lastname:
            text(
                personalFields[2]
                ?
                personalFields[2].value
                :
                ""
            ),

        birthdate:
            text(
                personalFields[3]
                ?
                personalFields[3].value
                :
                ""
            ),

        age:
            text(
                personalFields[4]
                ?
                personalFields[4].value
                :
                ""
            ),

        gender:
            text(
                personalFields[5]
                ?
                personalFields[5].value
                :
                ""
            ),


        /* ==================================
           CONTACT
        ================================== */

        mobile:
            text(
                contactFields[0]
                ?
                contactFields[0].value
                :
                ""
            ),

        email:
            text(
                contactFields[1]
                ?
                contactFields[1].value
                :
                ""
            ),

        currentaddress:
            text(
                contactFields[2]
                ?
                contactFields[2].value
                :
                ""
            ),

        permanentaddress:
            text(
                contactFields[3]
                ?
                contactFields[3].value
                :
                ""
            ),


        /* ==================================
           GOVERNMENT
        ================================== */

        sss:
            text(
                governmentFields[0]
                ?
                governmentFields[0].value
                :
                ""
            ),

        philhealth:
            text(
                governmentFields[1]
                ?
                governmentFields[1].value
                :
                ""
            ),

        pagibig:
            text(
                governmentFields[2]
                ?
                governmentFields[2].value
                :
                ""
            ),

        healthcard:
            text(
                governmentFields[3]
                ?
                governmentFields[3].value
                :
                ""
            ),

        bankname:
            text(
                governmentFields[4]
                ?
                governmentFields[4].value
                :
                ""
            ),

        bankaccount:
            text(
                governmentFields[5]
                ?
                governmentFields[5].value
                :
                ""
            ),

        idtype:
            text(
                governmentFields[6]
                ?
                governmentFields[6].value
                :
                ""
            ),

        idnumber:
            text(
                governmentFields[7]
                ?
                governmentFields[7].value
                :
                ""
            ),


        /* ==================================
           EMPLOYMENT
        ================================== */

        employeeid:
            text(
                employmentFields[0]
                ?
                employmentFields[0].value
                :
                ""
            )
            .toUpperCase(),

        position:
            text(
                employmentFields[1]
                ?
                employmentFields[1].value
                :
                ""
            ),

        department:
            text(
                employmentFields[2]
                ?
                employmentFields[2].value
                :
                ""
            ),

        employment:
            text(
                employmentFields[3]
                ?
                employmentFields[3].value
                :
                ""
            ),

        status:
            text(
                employmentFields[4]
                ?
                employmentFields[4].value
                :
                ""
            )
            ||
            "Active",


        /* ==================================
           SALARY
        ================================== */

        salary:
            finalSalary,


        /* ==================================
           LEAVES
        ================================== */

        vacationleave:
            numberValue(
                employmentFields[6]
                    ?
                    employmentFields[6].value
                    :
                    "",
                10
            ),

        sickleave:
            numberValue(
                employmentFields[7]
                    ?
                    employmentFields[7].value
                    :
                    "",
                7
            ),

        birthdayleave:
            numberValue(
                employmentFields[8]
                    ?
                    employmentFields[8].value
                    :
                    "",
                1
            ),


        /* ==================================
           COMPENSATION
        ================================== */

        compensationSalary:
            compensationSalary,

        paytype:
            payType,

        payfrequency:
            payFrequency,

        allowances:
            allowances,


        /* ==================================
           PAYROLL
        ================================== */

        payrollgroup:
            payrollGroup,

        payrollbank:
            payrollBank,

        payrollbankaccount:
            payrollBankAccount,

        deductions:
            deductions,


        /* ==================================
           ATTENDANCE
        ================================== */

        schedule:
            schedule,

        shift:
            shift,

        restday:
            restDay,

        attendancegroup:
            attendanceGroup

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

                    text(
                        employee.employeeid
                    ).toUpperCase()
                    ===
                    employeeData.employeeid
                    &&
                    employee.id !==
                    editId
            );


        if(duplicate){

            alert(
                "Employee ID already exists."
            );

            return;

        }


        if(editId){

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


    }

    catch(error){

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

        renderEmployeeSummary();


    }

    catch(error){

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
   RENDER MAIN TABLE
========================================== */

function renderTable(){

    const table =
        document.querySelector(
            "#empTable tbody"
        );


    if(!table){

        return;

    }


    table.innerHTML =
        "";


    employees.forEach(
        employee => {

            /* ==============================
               STATUS FILTER
            ============================== */

            if(
                currentStatusFilter ===
                "Active"
            ){

                if(
                    text(
                        employee.status
                    ) !==
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
                    ) ===
                    "Active"
                ){

                    return;

                }

            }


            /* ==============================
               USER STATUS
            ============================== */

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


            /* ==============================
               STATUS CLASS
            ============================== */

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


            /* ==============================
               ACTIONS
            ============================== */

            const actionButtons = `

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

`;


            /* ==============================
               MAIN TABLE ROW
               
               EXACT SAME ORDER AS HTML
            ============================== */

            table.innerHTML += `

<tr>


<!-- 1 QR -->

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


<!-- 2 FIRST NAME -->

<td>
${escapeHTML(
    employee.firstname
)}
</td>


<!-- 3 MIDDLE NAME -->

<td>
${escapeHTML(
    employee.middlename
)}
</td>


<!-- 4 LAST NAME -->

<td>
${escapeHTML(
    employee.lastname
)}
</td>


<!-- 5 BIRTHDATE -->

<td>
${escapeHTML(
    employee.birthdate
)}
</td>


<!-- 6 AGE -->

<td>
${escapeHTML(
    employee.age
)}
</td>


<!-- 7 GENDER -->

<td>
${escapeHTML(
    employee.gender
)}
</td>


<!-- 8 MOBILE -->

<td>
${escapeHTML(
    employee.mobile
)}
</td>


<!-- 9 EMAIL -->

<td>
${escapeHTML(
    employee.email
)}
</td>


<!-- 10 CURRENT ADDRESS -->

<td>
${escapeHTML(
    employee.currentaddress
)}
</td>


<!-- 11 PERMANENT ADDRESS -->

<td>
${escapeHTML(
    employee.permanentaddress
)}
</td>


<!-- 12 SSS -->

<td>
${escapeHTML(
    employee.sss
)}
</td>


<!-- 13 PHILHEALTH -->

<td>
${escapeHTML(
    employee.philhealth
)}
</td>


<!-- 14 PAG-IBIG -->

<td>
${escapeHTML(
    employee.pagibig
)}
</td>


<!-- 15 HEALTH CARD -->

<td>
${escapeHTML(
    employee.healthcard
)}
</td>


<!-- 16 GOVERNMENT BANK -->

<td>
${escapeHTML(
    employee.bankname
)}
</td>


<!-- 17 GOVERNMENT BANK ACCOUNT -->

<td>
${escapeHTML(
    employee.bankaccount
)}
</td>


<!-- 18 ID TYPE -->

<td>
${escapeHTML(
    employee.idtype
)}
</td>


<!-- 19 ID NUMBER -->

<td>
${escapeHTML(
    employee.idnumber
)}
</td>


<!-- 20 EMPLOYEE ID -->

<td>
${escapeHTML(
    employee.employeeid
)}
</td>


<!-- 21 POSITION -->

<td>
${escapeHTML(
    employee.position
)}
</td>


<!-- 22 DEPARTMENT -->

<td>
${escapeHTML(
    employee.department
)}
</td>


<!-- 23 EMPLOYMENT -->

<td>
${escapeHTML(
    employee.employment
)}
</td>


<!-- 24 STATUS -->

<td
class="${statusClass}">

${escapeHTML(
    employee.status ||
    "Active"
)}

</td>


<!-- 25 SALARY RATE -->

<td>
${escapeHTML(
    employee.salary
)}
</td>


<!-- 26 VACATION LEAVE -->

<td>
${escapeHTML(
    employee.vacationleave ??
    0
)}
</td>


<!-- 27 SICK LEAVE -->

<td>
${escapeHTML(
    employee.sickleave ??
    0
)}
</td>


<!-- 28 BIRTHDAY LEAVE -->

<td>
${escapeHTML(
    employee.birthdayleave ??
    0
)}
</td>


<!-- 29 COMPENSATION SALARY -->

<td>
${escapeHTML(
    employee.compensationSalary ??
    employee.salary ??
    ""
)}
</td>


<!-- 30 PAY TYPE -->

<td>
${escapeHTML(
    employee.paytype
)}
</td>


<!-- 31 PAY FREQUENCY -->

<td>
${escapeHTML(
    employee.payfrequency
)}
</td>


<!-- 32 ALLOWANCES -->

<td>
${escapeHTML(
    employee.allowances
)}
</td>


<!-- 33 PAYROLL GROUP -->

<td>
${escapeHTML(
    employee.payrollgroup
)}
</td>


<!-- 34 PAYROLL BANK -->

<td>
${escapeHTML(
    employee.payrollbank
)}
</td>


<!-- 35 PAYROLL BANK ACCOUNT -->

<td>
${escapeHTML(
    employee.payrollbankaccount
)}
</td>


<!-- 36 DEDUCTIONS -->

<td>
${escapeHTML(
    employee.deductions
)}
</td>


<!-- 37 SCHEDULE -->

<td>
${escapeHTML(
    employee.schedule
)}
</td>


<!-- 38 SHIFT -->

<td>
${escapeHTML(
    employee.shift
)}
</td>


<!-- 39 REST DAY -->

<td>
${escapeHTML(
    employee.restday
)}
</td>


<!-- 40 ATTENDANCE GROUP -->

<td>
${escapeHTML(
    employee.attendancegroup
)}
</td>


<!-- 41 USER -->

<td>

${userButton}

</td>


<!-- 42 ACTION -->

<td>

${actionButtons}

</td>


</tr>

`;

        }
    );


    updateTotal();

}


/* ==========================================
   EMPLOYEE SUMMARY
========================================== */

function renderEmployeeSummary(){

    const summaryBody =
        document.getElementById(
            "employeeSummaryBody"
        );


    if(!summaryBody){

        return;

    }


    summaryBody.innerHTML =
        "";


    let vacationTotal =
        0;


    let sickTotal =
        0;


    let birthdayTotal =
        0;


    let visibleEmployees = 0;


    employees.forEach(
        employee => {

            /* ==============================
               SAME FILTER AS MAIN TABLE
            ============================== */

            if(
                currentStatusFilter ===
                "Active"
            ){

                if(
                    text(
                        employee.status
                    ) !==
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
                    ) ===
                    "Active"
                ){

                    return;

                }

            }


            visibleEmployees++;


            const vacation =
                numberValue(
                    employee.vacationleave,
                    0
                );


            const sick =
                numberValue(
                    employee.sickleave,
                    0
                );


            const birthday =
                numberValue(
                    employee.birthdayleave,
                    0
                );


            vacationTotal +=
                vacation;


            sickTotal +=
                sick;


            birthdayTotal +=
                birthday;


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


            const hasUser =

                text(
                    employee.username
                ) !== ""
                &&
                text(
                    employee.password
                ) !== "";


            const userStatus =

                hasUser
                ?
                "CREATED"
                :
                "NOT CREATED";


            summaryBody.innerHTML += `

<tr>


<td>
${escapeHTML(
    employee.employeeid
)}
</td>


<td>
${escapeHTML(
    getFullName(employee)
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


<td class="${statusClass}">
${escapeHTML(
    employee.status ||
    "Active"
)}
</td>


<td>
${escapeHTML(
    employee.salary ??
    ""
)}
</td>


<td>
${escapeHTML(
    vacation
)}
</td>


<td>
${escapeHTML(
    sick
)}
</td>


<td>
${escapeHTML(
    birthday
)}
</td>


</tr>

`;

        }
    );


    if(
        visibleEmployees ===
        0
    ){

        summaryBody.innerHTML = `

<tr>

<td
colspan="10"
class="employee-summary-empty">

<span class="material-icons">
assessment
</span>

<p>
No employee summary available.
</p>

</td>

</tr>

`;

    }


    const vacationElement =
        document.getElementById(
            "summaryVacationTotal"
        );


    const sickElement =
        document.getElementById(
            "summarySickTotal"
        );


    const birthdayElement =
        document.getElementById(
            "summaryBirthdayTotal"
        );


    if(
        vacationElement
    ){

        vacationElement.textContent =
            vacationTotal;

    }


    if(
        sickElement
    ){

        sickElement.textContent =
            sickTotal;

    }


    if(
        birthdayElement
    ){

        birthdayElement.textContent =
            birthdayTotal;

    }


    const summarySection =
        document.getElementById(
            "employeeSummarySection"
        );


    if(
        summarySection
    ){

        summarySection.dataset.total =
            visibleEmployees;

    }

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


    if(!employee){

        alert(
            "Employee not found."
        );

        return;

    }


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


    if(name){

        name.textContent =
            getFullName(
                employee
            );

    }


    if(employeeId){

        employeeId.textContent =
            employee.employeeid ||
            "-";

    }


    if(username){

        username.value =
            employee.username ||
            employee.employeeid ||
            "";

    }


    if(password){

        password.value =
            "";

    }


    if(confirmPassword){

        confirmPassword.value =
            "";

    }


    if(userModal){

        userModal.style.display =
            "flex";

    }

};


/* ==========================================
   CLOSE USER MODAL
========================================== */

window.closeUserModal =
function(){

    if(userModal){

        userModal.style.display =
            "none";

    }


    selectedEmployeeForUser =
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
            "userPasswordIcon"
        );


    if(!password){

        return;

    }


    if(
        password.type ===
        "password"
    ){

        password.type =
            "text";


        if(icon){

            icon.textContent =
                "visibility_off";

        }

    }

    else{

        password.type =
            "password";


        if(icon){

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


    if(!username){

        alert(
            "Please enter a username."
        );

        return;

    }


    if(!password){

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


        if(duplicate){

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


    }

    catch(error){

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


    if(!employee){

        alert(
            "Employee not found."
        );

        return;

    }


    editId =
        id;


    openModal();


    /* ======================================
       PERSONAL
    ====================================== */

    const personalFields =
        getTabFields(
            "personal"
        );


    const personalValues = [

        employee.firstname,

        employee.middlename,

        employee.lastname,

        employee.birthdate,

        employee.age,

        employee.gender

    ];


    personalFields.forEach(
        (
            field,
            index
        ) => {

            field.value =
                personalValues[index]
                ??
                "";

        }
    );


    /* ======================================
       CONTACT
    ====================================== */

    const contactFields =
        getTabFields(
            "contact"
        );


    const contactValues = [

        employee.mobile,

        employee.email,

        employee.currentaddress,

        employee.permanentaddress

    ];


    contactFields.forEach(
        (
            field,
            index
        ) => {

            field.value =
                contactValues[index]
                ??
                "";

        }
    );


    /* ======================================
       EMPLOYMENT
    ====================================== */

    const employmentFields =
        getTabFields(
            "employment"
        );


    const employmentValues = [

        employee.employeeid,

        employee.position,

        employee.department,

        employee.employment,

        employee.status ||
            "Active",

        employee.salary,

        employee.vacationleave ??
            10,

        employee.sickleave ??
            7,

        employee.birthdayleave ??
            1

    ];


    employmentFields.forEach(
        (
            field,
            index
        ) => {

            field.value =
                employmentValues[index]
                ??
                "";

        }
    );


    /* ======================================
       GOVERNMENT
    ====================================== */

    const governmentFields =
        getTabFields(
            "government"
        );


    const governmentValues = [

        employee.sss,

        employee.philhealth,

        employee.pagibig,

        employee.healthcard,

        employee.bankname,

        employee.bankaccount,

        employee.idtype,

        employee.idnumber

    ];


    governmentFields.forEach(
        (
            field,
            index
        ) => {

            field.value =
                governmentValues[index]
                ??
                "";

        }
    );


    /* ======================================
       COMPENSATION
    ====================================== */

    const compensationSalary =
        document.getElementById(
            "compensationSalary"
        );


    const payType =
        document.getElementById(
            "payType"
        );


    const payFrequency =
        document.getElementById(
            "payFrequency"
        );


    const allowances =
        document.getElementById(
            "allowances"
        );


    if(compensationSalary){

        compensationSalary.value =
            employee.compensationSalary
            ??
            employee.salary
            ??
            "";

    }


    if(payType){

        payType.value =
            employee.paytype
            ??
            "";

    }


    if(payFrequency){

        payFrequency.value =
            employee.payfrequency
            ??
            "";

    }


    if(allowances){

        allowances.value =
            employee.allowances
            ??
            "";

    }


    /* ======================================
       PAYROLL
    ====================================== */

    const payrollGroup =
        document.getElementById(
            "payrollGroup"
        );


    const payrollBank =
        document.getElementById(
            "payrollBank"
        );


    const payrollBankAccount =
        document.getElementById(
            "payrollBankAccount"
        );


    const deductions =
        document.getElementById(
            "deductions"
        );


    if(payrollGroup){

        payrollGroup.value =
            employee.payrollgroup
            ??
            "";

    }


    if(payrollBank){

        payrollBank.value =
            employee.payrollbank
            ??
            employee.bankname
            ??
            "";

    }


    if(payrollBankAccount){

        payrollBankAccount.value =
            employee.payrollbankaccount
            ??
            employee.bankaccount
            ??
            "";

    }


    if(deductions){

        deductions.value =
            employee.deductions
            ??
            "";

    }


    /* ======================================
       ATTENDANCE
    ====================================== */

    const schedule =
        document.getElementById(
            "schedule"
        );


    const shift =
        document.getElementById(
            "shift"
        );


    const restDay =
        document.getElementById(
            "restDay"
        );


    const attendanceGroup =
        document.getElementById(
            "attendanceGroup"
        );


    if(schedule){

        schedule.value =
            employee.schedule
            ??
            "";

    }


    if(shift){

        shift.value =
            employee.shift
            ??
            "";

    }


    if(restDay){

        restDay.value =
            employee.restday
            ??
            "";

    }


    if(attendanceGroup){

        attendanceGroup.value =
            employee.attendancegroup
            ??
            "";

    }


    if(
        birthdate &&
        birthdate.value
    ){

        calcAge();

    }


    /* ======================================
       PERSONAL TAB FIRST
    ====================================== */

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


    if(personal){

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

    }

    catch(error){

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

    renderEmployeeSummary();

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


            if(show){

                visible++;

            }

        }
    );


    if(total){

        total.innerText =
            "Showing : " +
            visible;

    }


    /* ======================================
       SEARCH SUMMARY TOO
    ====================================== */

    const summaryRows =
        document.querySelectorAll(
            "#employeeSummaryBody tr"
        );


    summaryRows.forEach(
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

        }
    );

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


    if(!qrWindow){

        alert(
            "Please allow pop-ups to view QR."
        );

        return;

    }


    const safeEmployeeId =
        String(
            employeeid ?? ""
        )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /"/g,
            '\\"'
        );


    const safeName =
        String(
            name ?? ""
        )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /"/g,
            '\\"'
        );


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

border:
3px solid
#ffcc00;

}

h2{

color:#d71920;

margin:
8px 0;

}

.info{

margin:
15px 0;

font-size:13px;

}

#qrcode{

margin:
20px auto;

}

button{

margin-top:15px;

padding:
10px 20px;

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

${escapeHTML(employeeid)}

<br><br>

<b>
Employee:
</b>

<br>

${escapeHTML(name)}

</div>

<div id="qrcode"></div>

<button
onclick="window.print()">

PRINT QR

</button>

<script
src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js">
<\/script>

<script>

QRCode.toCanvas(

document.createElement("canvas"),

JSON.stringify({

employeeid:
"${safeEmployeeId}",

name:
"${safeName}"

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
            "#employeeModal .emp-field"
        )
        .forEach(
            field => {

                field.value =
                    "";

            }
        );


    const employmentFields =
        getTabFields(
            "employment"
        );


    if(
        employmentFields[6]
    ){

        employmentFields[6].value =
            "10";

    }


    if(
        employmentFields[7]
    ){

        employmentFields[7].value =
            "7";

    }


    if(
        employmentFields[8]
    ){

        employmentFields[8].value =
            "1";

    }


    if(
        employmentFields[4]
    ){

        employmentFields[4].value =
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


    if(personal){

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


    if(total){

        total.innerText =
            "Total : " +
            count;

    }

}


/* ==========================================
   CLOSE MODALS OUTSIDE
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
