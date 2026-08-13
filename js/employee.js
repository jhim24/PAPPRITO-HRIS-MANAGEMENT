/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE MASTERLIST JS
========================================== */


/* ==========================================
   FIREBASE
========================================== */

import { db } from "./firebase.js";

import {
    getApp,
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

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
   PORTAL AUTH
========================================== */

let portalAuth = null;


/* ==========================================
   GET PORTAL AUTH
========================================== */

function getPortalAuth(){

    if(portalAuth){

        return portalAuth;

    }


    const defaultApp =
        getApp();


    let portalApp;


    try{

        portalApp =
            getApp(
                "PAPPRITO-PORTAL-AUTH"
            );

    }catch(error){

        portalApp =
            initializeApp(

                defaultApp.options,

                "PAPPRITO-PORTAL-AUTH"

            );

    }


    portalAuth =
        getAuth(
            portalApp
        );


    return portalAuth;

}


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


    /*
     * New employee
     * should start with
     * a clean portal account.
     */

    const portalUsername =
        document.getElementById(
            "portalUsername"
        );

    const portalPassword =
        document.getElementById(
            "portalPassword"
        );

    const portalEnabled =
        document.getElementById(
            "portalEnabled"
        );


    if(portalUsername){

        portalUsername.value =
            "";

    }


    if(portalPassword){

        portalPassword.value =
            "";

    }


    if(portalEnabled){

        portalEnabled.checked =
            false;

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
   GENERATE PORTAL PASSWORD
========================================== */

window.generatePortalPassword =
function(){

    const passwordInput =
        document.getElementById(
            "portalPassword"
        );


    if(!passwordInput){

        return;

    }


    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ" +
        "abcdefghijkmnopqrstuvwxyz" +
        "23456789";


    let password =
        "";


    for(
        let i = 0;
        i < 10;
        i++
    ){

        password +=
            chars[
                Math.floor(
                    Math.random()
                    *
                    chars.length
                )
            ];

    }


    passwordInput.value =
        password;

};


/* ==========================================
   AUTO PORTAL USERNAME
========================================== */

const employeeIdInput =
    document.getElementById(
        "employeeId"
    );


if(employeeIdInput){

    employeeIdInput.addEventListener(
        "input",
        function(){

            const portalUsername =
                document.getElementById(
                    "portalUsername"
                );


            if(portalUsername){

                portalUsername.value =
                    this.value
                        .toUpperCase()
                        .trim();

            }

        }
    );

}


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


    /* ======================================
       EMPLOYEE ID
    ====================================== */

    const employeeId =
        (data[18] || "")
            .toUpperCase()
            .trim();


    /* ======================================
       PORTAL ACCOUNT
    ====================================== */

    const portalUsernameInput =
        document.getElementById(
            "portalUsername"
        );


    const portalPasswordInput =
        document.getElementById(
            "portalPassword"
        );


    const portalEnabledInput =
        document.getElementById(
            "portalEnabled"
        );


    const portalUsername =
        (
            portalUsernameInput
                ? portalUsernameInput.value
                : employeeId
        )
        .toUpperCase()
        .trim();


    const portalPassword =
        portalPasswordInput
            ? portalPasswordInput.value.trim()
            : "";


    const portalEnabled =
        portalEnabledInput
            ? portalEnabledInput.checked
            : false;


    /* ======================================
       VALIDATE EMPLOYEE ID
    ====================================== */

    if(!employeeId){

        alert(
            "Please enter Employee ID."
        );

        return;

    }


    /* ======================================
       VALIDATE NEW PORTAL ACCOUNT
    ====================================== */

    if(
        !editId &&
        portalEnabled &&
        !portalPassword
    ){

        alert(

            "Please generate a Temporary Password " +
            "before creating the Employee Portal account."

        );

        return;

    }


    /* ======================================
       EMPLOYEE DATA
    ====================================== */

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
            employeeId,


        username:
            employeeId,


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
            1,


        /* ==================================
           PORTAL
        ================================== */

        portalEnabled:
            portalEnabled,

        portalUsername:
            portalUsername

    };


    try{

        /* ==================================
           UPDATE EXISTING EMPLOYEE
        ================================== */

        if(editId){

            const updateData = {

                ...employeeData

            };


            /*
             * Don't overwrite existing
             * portal account information
             * when no new password is supplied.
             */

            await updateDoc(

                doc(
                    db,
                    "employees",
                    editId
                ),

                updateData

            );


            alert(
                "Employee Updated"
            );


        }else{


            /* ==============================
               CREATE EMPLOYEE
            ============================== */

            const employeeRef =
                await addDoc(

                    collection(
                        db,
                        "employees"
                    ),

                    employeeData

                );


            /* ==============================
               CREATE PORTAL ACCOUNT
            ============================== */

            if(
                portalEnabled &&
                portalPassword
            ){

                try{

                    const auth =
                        getPortalAuth();


                    /*
                     * Firebase Authentication
                     * requires an email.
                     *
                     * We create an internal
                     * email from Employee ID.
                     */

                    const portalEmail =
                        employeeId
                            .toLowerCase()
                            .replace(
                                /[^a-z0-9]/g,
                                ""
                            )
                        +
                        "@papprito-hris.local";


                    const credential =
                        await createUserWithEmailAndPassword(

                            auth,

                            portalEmail,

                            portalPassword

                        );


                    await updateDoc(

                        employeeRef,

                        {

                            portalUid:
                                credential
                                .user
                                .uid,

                            portalEmail:
                                portalEmail,

                            portalAccountCreated:
                                true

                        }

                    );


                    alert(

                        "Employee Saved Successfully!\n\n" +

                        "EMPLOYEE PORTAL ACCOUNT CREATED\n\n" +

                        "Username: " +
                        employeeId +
                        "\n\n" +

                        "Temporary Password: " +
                        portalPassword

                    );


                }catch(
                    portalError
                ){

                    console.error(
                        "Portal Account Error:",
                        portalError
                    );


                    /*
                     * Employee was saved,
                     * but Authentication failed.
                     */

                    alert(

                        "Employee was saved successfully, " +
                        "but the Employee Portal account " +
                        "could not be created.\n\n" +

                        portalError.message

                    );

                }


            }else{

                alert(
                    "Employee Saved"
                );

            }

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


    /* ======================================
       LOAD PORTAL ACCOUNT
    ====================================== */

    const portalUsername =
        document.getElementById(
            "portalUsername"
        );


    const portalPassword =
        document.getElementById(
            "portalPassword"
        );


    const portalEnabled =
        document.getElementById(
            "portalEnabled"
        );


    if(portalUsername){

        portalUsername.value =
            emp.portalUsername ||
            emp.employeeid ||
            "";

    }


    if(portalPassword){

        /*
         * Password is intentionally
         * NOT loaded from Firestore.
         */

        portalPassword.value =
            "";

        portalPassword.placeholder =
            emp.portalAccountCreated
                ?

                "Account exists - leave blank"

                :

                "Generate password";

    }


    if(portalEnabled){

        portalEnabled.checked =
            emp.portalEnabled === true;

    }

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


    /* ======================================
       CLEAR PORTAL ACCOUNT
    ====================================== */

    const portalUsername =
        document.getElementById(
            "portalUsername"
        );


    const portalPassword =
        document.getElementById(
            "portalPassword"
        );


    const portalEnabled =
        document.getElementById(
            "portalEnabled"
        );


    if(portalUsername){

        portalUsername.value =
            "";

    }


    if(portalPassword){

        portalPassword.value =
            "";

        portalPassword.placeholder =
            "Generate password";

    }


    if(portalEnabled){

        portalEnabled.checked =
            false;

    }


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
