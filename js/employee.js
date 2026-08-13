/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE MASTERLIST JS
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
   OPEN MODAL
========================================== */

window.openModal = function(){

    if(employeeModal){

        employeeModal.style.display =
            "flex";

    }

};


/* ==========================================
   CLOSE MODAL
========================================== */

window.closeModal = function(){

    if(employeeModal){

        employeeModal.style.display =
            "none";

    }

    clearForm();

};


/* ==========================================
   OPEN TAB
========================================== */

window.openTab = function(
    evt,
    tabId
){

    document
        .querySelectorAll(
            ".tab-content"
        )
        .forEach(tab=>{

            tab.classList.remove(
                "active"
            );

        });


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
        .forEach(btn=>{

            btn.classList.remove(
                "active"
            );

        });


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

window.calcAge = function(){

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
   SAVE EMPLOYEE
========================================== */

window.saveEmployee =
async function(){

    const fields =
        document.querySelectorAll(
            ".emp-field"
        );


    const data = [];


    fields.forEach(field=>{

        data.push(
            field.value
        );

    });


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
            (data[18] || "")
                .toUpperCase()
                .trim(),


        username:
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
                "Employee Updated"
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
                "Employee Saved"
            );

        }


        closeModal();

        loadEmployees();


    }catch(error){

        console.log(error);

        alert(
            "Save Error"
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
            docSnap=>{

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


    if(!table){

        return;

    }


    table.innerHTML = "";


    employees.forEach(
        (emp)=>{


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
               TABLE ROW
            ============================== */

            table.innerHTML += `

                <tr>

                    <td>

                        <button
                        class="print-btn"
                        onclick="viewQR(
                            '${emp.employeeid || ""}',
                            '${emp.firstname || ""} ${emp.lastname || ""}'
                        )">

                            VIEW QR

                        </button>

                    </td>


                    <td>
                        ${emp.firstname || ""}
                    </td>

                    <td>
                        ${emp.middlename || ""}
                    </td>

                    <td>
                        ${emp.lastname || ""}
                    </td>

                    <td>
                        ${emp.birthdate || ""}
                    </td>

                    <td>
                        ${emp.age || ""}
                    </td>

                    <td>
                        ${emp.gender || ""}
                    </td>


                    <td>
                        ${emp.sss || ""}
                    </td>

                    <td>
                        ${emp.philhealth || ""}
                    </td>

                    <td>
                        ${emp.pagibig || ""}
                    </td>

                    <td>
                        ${emp.healthcard || ""}
                    </td>


                    <td>
                        ${emp.bankname || ""}
                    </td>

                    <td>
                        ${emp.bankaccount || ""}
                    </td>


                    <td>
                        ${emp.idtype || ""}
                    </td>

                    <td>
                        ${emp.idnumber || ""}
                    </td>


                    <td>
                        ${emp.mobile || ""}
                    </td>

                    <td>
                        ${emp.email || ""}
                    </td>

                    <td>
                        ${emp.currentaddress || ""}
                    </td>

                    <td>
                        ${emp.permanentaddress || ""}
                    </td>


                    <td>
                        ${emp.employeeid || ""}
                    </td>

                    <td>
                        ${emp.position || ""}
                    </td>

                    <td>
                        ${emp.department || ""}
                    </td>

                    <td>
                        ${emp.employment || ""}
                    </td>


                    <td class="${statusClass}">

                        ${emp.status || "Active"}

                    </td>


                    <td>
                        ${emp.salary || ""}
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

                        <button
                        class="btn"
                        onclick="editEmployee(
                            '${emp.id}'
                        )">

                            Edit

                        </button>


                        <button
                        class="btn"
                        onclick="deleteEmployee(
                            '${emp.id}'
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
   FILTER
========================================== */

window.filterStatus =
function(status){

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


    if(!qrWindow){

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
                        Tahoma,sans-serif;

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

                ${employeeid}

            </p>


            <p>

                <b>Name:</b>

                ${name}

            </p>


            <div id="qrcode">
            </div>


            <br>


            <button
            onclick="window.print()">

                PRINT QR

            </button>


            <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"><\/script>


            <script>

                QRCode.toCanvas(

                    document.createElement(
                        'canvas'
                    ),

                    JSON.stringify({

                        employeeid:
                            '${employeeid}',

                        name:
                            '${name}'

                    }),

                    {

                        width:220

                    },

                    function(
                        error,
                        canvas
                    ){

                        if(!error){

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
function(id){

    const emp =
        employees.find(
            e =>
                e.id === id
        );


    if(!emp){

        return;

    }


    openModal();


    editId = id;


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
            (field,i)=>{

                field.value =
                    values[i] || "";

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


        loadEmployees();


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


    let visible = 0;


    rows.forEach(row=>{

        const show =
            row.innerText
                .toLowerCase()
                .includes(val);


        row.style.display =
            show
                ? ""
                : "none";


        if(show){

            visible++;

        }

    });


    if(total){

        total.innerText =
            "Showing : " +
            visible;

    }

};


/* ==========================================
   CLEAR FORM
========================================== */

function clearForm(){

    editId = null;


    document
        .querySelectorAll(
            ".emp-field"
        )
        .forEach(el=>{

            el.value = "";

        });


    /*
    Return to Personal Info
    */

    document
        .querySelectorAll(
            ".tab-content"
        )
        .forEach(tab=>{

            tab.classList.remove(
                "active"
            );

        });


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
            (btn,index)=>{

                btn.classList.toggle(
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

            "#empTable tbody tr:not([style*=\"display: none\"])"

        );


    if(total){

        total.innerText =
            "Total : " +
            rows.length;

    }

}


/* ==========================================
   START
========================================== */

loadEmployees();
