/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE MASTERLIST JS
   VERSION WITH LEAVE ALLOCATION
========================================== */

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


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
   HELPER
========================================== */

function getFieldValue(
    selector
){

    const element =
        document.querySelector(
            selector
        );


    return element
        ? element.value.trim()
        : "";

}


function setFieldValue(
    selector,
    value
){

    const element =
        document.querySelector(
            selector
        );


    if(element){

        element.value =
            value ?? "";

    }

}


function numberValue(
    value,
    defaultValue = 0
){

    const number =
        Number(value);


    if(
        Number.isFinite(number)
    ){

        return number;

    }


    return defaultValue;

}


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
        /"/g,
        "&quot;"
    );

}


/* ==========================================
   OPEN MODAL
========================================== */

window.openModal =
function(){

    editId = null;


    clearForm();


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


    if(selectedTab){

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

        if(age){

            age.value = "";

        }

        return;

    }


    const birth =
        new Date(
            birthdate.value
        );


    const today =
        new Date();


    if(
        Number.isNaN(
            birth.getTime()
        )
    ){

        age.value = "";

        return;

    }


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
        years >= 0
        ? years
        : "";

};


/* ==========================================
   GET EMPLOYEE FORM DATA
========================================== */

function getEmployeeFormData(){

    /*
     * PERSONAL
     */

    const firstname =
        getFieldValue(
            "#personal .emp-field:nth-of-type(1)"
        );


    const middlename =
        getFieldValue(
            "#personal .emp-field:nth-of-type(2)"
        );


    const lastname =
        getFieldValue(
            "#personal .emp-field:nth-of-type(3)"
        );


    const birthdateValue =
        getFieldValue(
            "#birthdate"
        );


    const ageValue =
        getFieldValue(
            "#age"
        );


    const personalFields =
        document.querySelectorAll(
            "#personal .emp-field"
        );


    const gender =
        personalFields[5]
        ?
        personalFields[5].value.trim()
        :
        "";


    /*
     * GOVERNMENT
     */

    const governmentFields =
        document.querySelectorAll(
            "#government .emp-field"
        );


    const sss =
        governmentFields[0]
        ?
        governmentFields[0].value.trim()
        :
        "";


    const philhealth =
        governmentFields[1]
        ?
        governmentFields[1].value.trim()
        :
        "";


    const pagibig =
        governmentFields[2]
        ?
        governmentFields[2].value.trim()
        :
        "";


    const healthcard =
        governmentFields[3]
        ?
        governmentFields[3].value.trim()
        :
        "";


    const bankname =
        governmentFields[4]
        ?
        governmentFields[4].value.trim()
        :
        "";


    const bankaccount =
        governmentFields[5]
        ?
        governmentFields[5].value.trim()
        :
        "";


    const idtype =
        governmentFields[6]
        ?
        governmentFields[6].value.trim()
        :
        "";


    const idnumber =
        governmentFields[7]
        ?
        governmentFields[7].value.trim()
        :
        "";


    /*
     * CONTACT
     */

    const contactFields =
        document.querySelectorAll(
            "#contact .emp-field"
        );


    const mobile =
        contactFields[0]
        ?
        contactFields[0].value.trim()
        :
        "";


    const email =
        contactFields[1]
        ?
        contactFields[1].value.trim()
        :
        "";


    const currentaddress =
        contactFields[2]
        ?
        contactFields[2].value.trim()
        :
        "";


    const permanentaddress =
        contactFields[3]
        ?
        contactFields[3].value.trim()
        :
        "";


    /*
     * EMPLOYMENT
     */

    const employmentFields =
        document.querySelectorAll(
            "#employment .emp-field"
        );


    /*
     * First 6 fields:
     *
     * 0 Employee ID
     * 1 Position
     * 2 Department
     * 3 Employment
     * 4 Status
     * 5 Salary
     *
     * Last 3:
     *
     * 6 Vacation
     * 7 Sick
     * 8 Birthday
     */

    const employeeid =
        employmentFields[0]
        ?
        employmentFields[0].value
            .trim()
            .toUpperCase()
        :
        "";


    const position =
        employmentFields[1]
        ?
        employmentFields[1].value.trim()
        :
        "";


    const department =
        employmentFields[2]
        ?
        employmentFields[2].value.trim()
        :
        "";


    const employment =
        employmentFields[3]
        ?
        employmentFields[3].value.trim()
        :
        "";


    const status =
        employmentFields[4]
        ?
        employmentFields[4].value.trim()
        :
        "Active";


    const salary =
        employmentFields[5]
        ?
        employmentFields[5].value.trim()
        :
        "";


    /*
     * LEAVE ALLOCATION
     */

    const vacationLeave =
        numberValue(
            document.getElementById(
                "vacationleave"
            )
            ?
            document.getElementById(
                "vacationleave"
            ).value
            :
            0
        );


    const sickLeave =
        numberValue(
            document.getElementById(
                "sickleave"
            )
            ?
            document.getElementById(
                "sickleave"
            ).value
            :
            0
        );


    const birthdayLeave =
        numberValue(
            document.getElementById(
                "birthdayleave"
            )
            ?
            document.getElementById(
                "birthdayleave"
            ).value
            :
            0
        );


    return {

        /*
         * PERSONAL
         */

        firstname:
            firstname,

        middlename:
            middlename,

        lastname:
            lastname,

        birthdate:
            birthdateValue,

        age:
            ageValue,

        gender:
            gender,


        /*
         * GOVERNMENT
         */

        sss:
            sss,

        philhealth:
            philhealth,

        pagibig:
            pagibig,

        healthcard:
            healthcard,

        bankname:
            bankname,

        bankaccount:
            bankaccount,

        idtype:
            idtype,

        idnumber:
            idnumber,


        /*
         * CONTACT
         */

        mobile:
            mobile,

        email:
            email,

        currentaddress:
            currentaddress,

        permanentaddress:
            permanentaddress,


        /*
         * EMPLOYMENT
         */

        employeeid:
            employeeid,

        username:
            employeeid,

        position:
            position,

        department:
            department,

        employment:
            employment,

        status:
            status || "Active",

        salary:
            salary,


        /*
         * LEAVE ALLOCATION
         */

        vacationleave:
            vacationLeave,

        sickleave:
            sickLeave,

        birthdayleave:
            birthdayLeave

    };

}


/* ==========================================
   SAVE EMPLOYEE
========================================== */

window.saveEmployee =
async function(){

    const employeeData =
        getEmployeeFormData();


    /*
     * REQUIRED FIELDS
     */

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


    /*
     * CHECK DUPLICATE EMPLOYEE ID
     */

    const duplicate =
        employees.find(
            employee => {

                const existingId =
                    String(
                        employee.employeeid || ""
                    )
                    .trim()
                    .toUpperCase();


                return (

                    existingId ===
                    employeeData.employeeid

                )

                &&

                employee.id !==
                editId;

            }
        );


    if(duplicate){

        alert(
            "Employee ID already exists."
        );

        return;

    }


    /*
     * VALIDATE LEAVES
     */

    if(
        employeeData.vacationleave < 0
        ||
        employeeData.sickleave < 0
        ||
        employeeData.birthdayleave < 0
    ){

        alert(
            "Leave allocation cannot be negative."
        );

        return;

    }


    try{

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

        }else{

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


        if(table){

            table.innerHTML = `

<tr>

<td
    colspan="29"
    style="
        text-align:center;
        padding:30px;
    ">

    Loading employees...

</td>

</tr>

`;

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


        /*
         * Sort by last name
         */

        employees.sort(
            (
                a,
                b
            ) => {

                const lastA =
                    String(
                        a.lastname || ""
                    ).toLowerCase();


                const lastB =
                    String(
                        b.lastname || ""
                    ).toLowerCase();


                return lastA.localeCompare(
                    lastB
                );

            }
        );


        renderTable();


    }catch(error){

        console.error(
            "Load Employees Error:",
            error
        );


        const table =
            document.querySelector(
                "#empTable tbody"
            );


        if(table){

            table.innerHTML = `

<tr>

<td
    colspan="29"
    style="
        text-align:center;
        padding:30px;
        color:red;
    ">

    Failed to load employees.

</td>

</tr>

`;

        }


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

    const table =
        document.querySelector(
            "#empTable tbody"
        );


    if(!table){

        return;

    }


    table.innerHTML = "";


    let visibleCount = 0;


    employees.forEach(
        employee => {

            /*
             * STATUS FILTER
             */

            const employeeStatus =
                String(
                    employee.status ||
                    "Active"
                )
                .trim();


            if(
                currentStatusFilter ===
                "Active"
            ){

                if(
                    employeeStatus !==
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
                    employeeStatus ===
                    "Active"
                ){

                    return;

                }

            }


            visibleCount++;


            /*
             * STATUS CLASS
             */

            let statusClass =
                "status-other";


            if(
                employeeStatus ===
                "Active"
            ){

                statusClass =
                    "status-active";

            }

            else if(
                employeeStatus ===
                "AWOL"
            ){

                statusClass =
                    "status-awol";

            }

            else if(
                employeeStatus ===
                "Resigned"
            ){

                statusClass =
                    "status-resigned";

            }


            /*
             * FULL NAME
             */

            const fullName = [

                employee.firstname || "",

                employee.middlename || "",

                employee.lastname || ""

            ]

            .filter(Boolean)

            .join(" ");


            /*
             * LEAVE VALUES
             */

            const vacationLeave =
                numberValue(
                    employee.vacationleave
                );


            const sickLeave =
                numberValue(
                    employee.sickleave
                );


            const birthdayLeave =
                numberValue(
                    employee.birthdayleave
                );


            /*
             * SAFE VALUES
             */

            const employeeDocId =
                escapeAttribute(
                    employee.id
                );


            const employeeId =
                escapeAttribute(
                    employee.employeeid
                );


            const safeName =
                escapeAttribute(
                    fullName
                );


            /*
             * TABLE ROW
             */

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

<td>

    <button
        class="icon-btn qr-icon"
        onclick="viewQR(
            '${employeeId}',
            '${safeName}'
        )"
        title="View QR Code"
        aria-label="View QR Code">

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


<td class="${statusClass}">

    ${escapeHTML(
        employeeStatus
    )}

</td>


<td>
    ${escapeHTML(
        employee.salary
    )}
</td>


<td>
    ${vacationLeave}
</td>


<td>
    ${sickLeave}
</td>


<td>
    ${birthdayLeave}
</td>


<td>

    <button
        class="icon-btn edit-icon"
        onclick="editEmployee(
            '${employeeDocId}'
        )"
        title="Edit Employee"
        aria-label="Edit Employee">

        <span class="material-icons">
            edit
        </span>

    </button>


    <button
        class="icon-btn delete-icon"
        onclick="deleteEmployee(
            '${employeeDocId}'
        )"
        title="Delete Employee"
        aria-label="Delete Employee">

        <span class="material-icons">
            delete
        </span>

    </button>

</td>

`;


            table.appendChild(
                row
            );

        }
    );


    updateTotal(
        visibleCount
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


    /*
     * Clear search when changing filter
     */

    if(search){

        search.value = "";

    }

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
            .trim()
            .toLowerCase()
        :
        "";


    const rows =
        document.querySelectorAll(
            "#empTable tbody tr"
        );


    let visible = 0;


    rows.forEach(
        row => {

            const match =
                row.innerText
                    .toLowerCase()
                    .includes(
                        value
                    );


            row.style.display =
                match
                ?
                ""
                :
                "none";


            if(match){

                visible++;

            }

        }
    );


    if(total){

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
            "width=420,height=560"
        );


    if(!qrWindow){

        alert(
            "Please allow pop-ups to view the QR code."
        );

        return;

    }


    const safeEmployeeId =
        escapeHTML(
            employeeid
        );


    const safeName =
        escapeHTML(
            name
        );


    const qrData =
        JSON.stringify({

            employeeid:
                employeeid,

            name:
                name

        });


    const safeQRData =
        escapeHTML(
            qrData
        );


    qrWindow.document.write(`

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width,initial-scale=1.0">

<title>
PAPPRITO Employee QR
</title>


<style>

*{

    box-sizing:border-box;

}


body{

    margin:0;

    min-height:100vh;

    display:flex;

    align-items:center;

    justify-content:center;

    background:#f5f5f5;

    font-family:
        "Segoe UI",
        Tahoma,
        Arial,
        sans-serif;

}


.qr-card{

    width:350px;

    max-width:90vw;

    background:#ffffff;

    border:
        2px solid
        #ffcc00;

    border-radius:15px;

    padding:25px;

    text-align:center;

    box-shadow:
        0 10px 30px
        rgba(0,0,0,.12);

}


.logo{

    width:65px;

    height:65px;

    object-fit:cover;

    border-radius:50%;

    border:
        3px solid
        #ffcc00;

    padding:3px;

    margin-bottom:8px;

}


h2{

    margin:2px;

    color:#d71920;

}


h3{

    margin:5px 0 15px;

    color:#333;

}


.info{

    margin:8px 0;

    padding:8px;

    background:#fff9df;

    border-radius:7px;

    font-size:13px;

}


#qrcode{

    display:flex;

    justify-content:center;

    margin:20px 0;

}


button{

    border:none;

    border-radius:7px;

    background:#ffcc00;

    color:#111;

    padding:11px 20px;

    font-weight:900;

    cursor:pointer;

}


button:hover{

    opacity:.85;

}


@media print{

    body{

        background:#fff;

    }


    .qr-card{

        box-shadow:none;

    }


    button{

        display:none;

    }

}

</style>

</head>


<body>


<div class="qr-card">


<img
    src="../assets/images/logo.png"
    class="logo"
    alt="PAPPRITO">


<h2>
PAPPRITO
</h2>


<h3>
Employee QR Code
</h3>


<div class="info">

<b>
Employee ID:
</b>

<br>

${safeEmployeeId}

</div>


<div class="info">

<b>
Employee:
</b>

<br>

${safeName}

</div>


<div id="qrcode">
</div>


<button
    onclick="window.print()">

    🖨 PRINT QR

</button>


</div>



<script
src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js">
<\/script>


<script>

const qrValue =
${JSON.stringify(qrData)};


const canvas =
document.createElement(
    "canvas"
);


QRCode.toCanvas(

    canvas,

    qrValue,

    {

        width:220,

        margin:2

    },

    function(
        error
    ){

        if(!error){

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
   EDIT EMPLOYEE
========================================== */

window.editEmployee =
function(
    id
){

    const employee =
        employees.find(
            item =>
                item.id === id
        );


    if(!employee){

        alert(
            "Employee record not found."
        );

        return;

    }


    editId =
        id;


    /*
     * OPEN MODAL
     */

    if(employeeModal){

        employeeModal.style.display =
            "flex";

    }


    /*
     * PERSONAL
     */

    const personalFields =
        document.querySelectorAll(
            "#personal .emp-field"
        );


    if(personalFields[0]){

        personalFields[0].value =
            employee.firstname || "";

    }


    if(personalFields[1]){

        personalFields[1].value =
            employee.middlename || "";

    }


    if(personalFields[2]){

        personalFields[2].value =
            employee.lastname || "";

    }


    setFieldValue(
        "#birthdate",
        employee.birthdate || ""
    );


    setFieldValue(
        "#age",
        employee.age || ""
    );


    if(personalFields[5]){

        personalFields[5].value =
            employee.gender || "";

    }


    /*
     * GOVERNMENT
     */

    const governmentFields =
        document.querySelectorAll(
            "#government .emp-field"
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
                ?? "";

        }
    );


    /*
     * CONTACT
     */

    const contactFields =
        document.querySelectorAll(
            "#contact .emp-field"
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
                ?? "";

        }
    );


    /*
     * EMPLOYMENT
     */

    const employmentFields =
        document.querySelectorAll(
            "#employment .emp-field"
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
                ?? "";

        }
    );


    /*
     * ENSURE LEAVE FIELDS
     */

    setFieldValue(
        "#vacationleave",
        employee.vacationleave ??
            10
    );


    setFieldValue(
        "#sickleave",
        employee.sickleave ??
            7
    );


    setFieldValue(
        "#birthdayleave",
        employee.birthdayleave ??
            1
    );


    /*
     * OPEN PERSONAL TAB
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


    if(personal){

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
   DELETE EMPLOYEE
========================================== */

window.deleteEmployee =
async function(
    id
){

    const employee =
        employees.find(
            item =>
                item.id === id
        );


    if(!employee){

        alert(
            "Employee record not found."
        );

        return;

    }


    const name = [

        employee.firstname || "",

        employee.lastname || ""

    ]

    .filter(Boolean)
    .join(" ");


    const confirmed =
        confirm(

            "Delete Employee?\n\n" +

            (
                name ||
                employee.employeeid ||
                "Employee"
            )

        );


    if(!confirmed){

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


        alert(
            "Employee deleted successfully."
        );


        await loadEmployees();


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
   CLEAR FORM
========================================== */

function clearForm(){

    editId = null;


    /*
     * Clear all inputs/selects
     */

    document
        .querySelectorAll(
            ".emp-field"
        )
        .forEach(
            element => {

                element.value = "";

            }
        );


    /*
     * Default STATUS
     */

    const employmentFields =
        document.querySelectorAll(
            "#employment .emp-field"
        );


    if(employmentFields[4]){

        employmentFields[4].value =
            "Active";

    }


    /*
     * Default LEAVES
     */

    setFieldValue(
        "#vacationleave",
        10
    );


    setFieldValue(
        "#sickleave",
        7
    );


    setFieldValue(
        "#birthdayleave",
        1
    );


    /*
     * Reset tabs
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


    if(personal){

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

}


/* ==========================================
   UPDATE TOTAL
========================================== */

function updateTotal(
    count = null
){

    if(!total){

        return;

    }


    if(count !== null){

        total.innerText =
            "Total : " +
            count;

        return;

    }


    const rows =
        document.querySelectorAll(
            "#empTable tbody tr"
        );


    let visible = 0;


    rows.forEach(
        row => {

            if(
                row.style.display !==
                "none"
            ){

                visible++;

            }

        }
    );


    total.innerText =
        "Total : " +
        visible;

}


/* ==========================================
   MODAL OUTSIDE CLICK
========================================== */

if(employeeModal){

    employeeModal.addEventListener(
        "click",
        function(event){

            if(
                event.target ===
                employeeModal
            ){

                closeModal();

            }

        }
    );

}


/* ==========================================
   ESCAPE KEY
========================================== */

document.addEventListener(
    "keydown",
    function(event){

        if(
            event.key ===
            "Escape"
        ){

            if(
                employeeModal &&
                employeeModal.style.display ===
                "flex"
            ){

                closeModal();

            }

        }

    }
);


/* ==========================================
   START
========================================== */

loadEmployees();
