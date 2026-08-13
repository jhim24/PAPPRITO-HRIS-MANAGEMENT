/* ==========================================
   PAPPRITO HRIS
   PAYROLL MANAGEMENT
   FULL JAVASCRIPT
========================================== */


/* ==========================================
   FIREBASE
========================================== */

import {

    initializeApp

} from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


import {

    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc

} from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* ==========================================
   FIREBASE CONFIG
========================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyAehoq0teVYHiJ4bkKOgBqIgJZrQpce3k8",

    authDomain:
        "hr-system-38fc3.firebaseapp.com",

    projectId:
        "hr-system-38fc3",

    storageBucket:
        "hr-system-38fc3.firebasestorage.app",

    messagingSenderId:
        "615471610834",

    appId:
        "1:615471610834:web:a0d671d4e3f4c1b57b660b"

};


/* ==========================================
   INITIALIZE FIREBASE
========================================== */

const app =
    initializeApp(
        firebaseConfig
    );


const db =
    getFirestore(
        app
    );


/* ==========================================
   ELEMENTS
========================================== */

const employeeSelect =
    document.getElementById(
        "employeeSelect"
    );


const totaldays =
    document.getElementById(
        "totaldays"
    );


const dailyrate =
    document.getElementById(
        "dailyrate"
    );


const overtime =
    document.getElementById(
        "overtime"
    );


const holiday =
    document.getElementById(
        "holiday"
    );


const sickleave =
    document.getElementById(
        "sickleave"
    );


const vacationleave =
    document.getElementById(
        "vacationleave"
    );


const birthdayleave =
    document.getElementById(
        "birthdayleave"
    );


const maternityleave =
    document.getElementById(
        "maternityleave"
    );


const paternityleave =
    document.getElementById(
        "paternityleave"
    );


const allowance =
    document.getElementById(
        "allowance"
    );


const sss =
    document.getElementById(
        "sss"
    );


const philhealth =
    document.getElementById(
        "philhealth"
    );


const pagibig =
    document.getElementById(
        "pagibig"
    );


const healthcard =
    document.getElementById(
        "healthcard"
    );


const otherdeduction =
    document.getElementById(
        "otherdeduction"
    );


const deductionreason =
    document.getElementById(
        "deductionreason"
    );


const payrollBody =
    document.getElementById(
        "payrollBody"
    );


const totalNet =
    document.getElementById(
        "totalNet"
    );


/* ==========================================
   NUMBER HELPER
========================================== */

function numberValue(
    element
){

    if(!element){

        return 0;

    }


    const value =
        Number(
            element.value
        );


    if(
        !Number.isFinite(
            value
        )
    ){

        return 0;

    }


    return value;

}


/* ==========================================
   MONEY FORMAT
========================================== */

function money(
    value
){

    const amount =
        Number(
            value || 0
        );


    return amount.toLocaleString(
        "en-PH",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    );

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
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    if(!employeeSelect){

        return;

    }


    employeeSelect.innerHTML = `

        <option value="">
            Select Employee
        </option>

    `;


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "employees"
                )
            );


        snapshot.forEach(
            employeeDoc => {

                const employee =
                    employeeDoc.data();


                /* ==========================
                   EMPLOYEE ID
                ========================== */

                const employeeId =
                    employee.employeeid ||
                    employee.employeeId ||
                    employee.empid ||
                    employee.id ||
                    employeeDoc.id;


                /* ==========================
                   NAME
                ========================== */

                let fullName =
                    employee.fullname ||
                    employee.fullName ||
                    employee.name ||
                    "";


                if(!fullName){

                    fullName = [

                        employee.firstname ||
                        employee.firstName ||
                        "",

                        employee.middlename ||
                        employee.middleName ||
                        "",

                        employee.lastname ||
                        employee.lastName ||
                        ""

                    ]
                    .filter(Boolean)
                    .join(" ");

                }


                fullName =
                    fullName
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();


                if(!fullName){

                    fullName =
                        "Unnamed Employee";

                }


                /* ==========================
                   RATE
                ========================== */

                const rate =
                    employee.dailyrate ??
                    employee.dailyRate ??
                    employee.rate ??
                    employee.salary ??
                    employee.basicSalary ??
                    "";


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    employeeDoc.id;


                option.dataset.employeeId =
                    employeeId;


                option.dataset.name =
                    fullName;


                option.dataset.rate =
                    rate;


                option.textContent =

                    employeeId +
                    " - " +
                    fullName;


                employeeSelect.appendChild(
                    option
                );

            }
        );


    }catch(error){

        console.error(
            "Load Employees Error:",
            error
        );


        alert(
            "Unable to load employees.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   EMPLOYEE SELECT
========================================== */

if(employeeSelect){

    employeeSelect.addEventListener(
        "change",
        function(){

            const selected =
                employeeSelect.options[
                    employeeSelect.selectedIndex
                ];


            if(!selected){

                return;

            }


            /*
             * Auto-fill daily rate only if
             * employee record contains a rate.
             *
             * Existing manually entered rate
             * will otherwise remain untouched.
             */

            const employeeRate =
                selected.dataset.rate;


            if(
                employeeRate !== undefined &&
                employeeRate !== ""
            ){

                dailyrate.value =
                    employeeRate;

            }

        }
    );

}


/* ==========================================
   CALCULATE PAYROLL
========================================== */

function calculatePayroll(){

    const days =
        numberValue(
            totaldays
        );


    const dailyRate =
        numberValue(
            dailyrate
        );


    const overtimePay =
        numberValue(
            overtime
        );


    const holidayPay =
        numberValue(
            holiday
        );


    const sickLeave =
        numberValue(
            sickleave
        );


    const vacationLeave =
        numberValue(
            vacationleave
        );


    const birthdayLeave =
        numberValue(
            birthdayleave
        );


    const maternityLeave =
        numberValue(
            maternityleave
        );


    const paternityLeave =
        numberValue(
            paternityleave
        );


    const allowancePay =
        numberValue(
            allowance
        );


    /* ======================================
       BASIC PAY
    ====================================== */

    const basicPay =
        days *
        dailyRate;


    /* ======================================
       GROSS PAY
    ====================================== */

    const gross =

        basicPay +

        overtimePay +

        holidayPay +

        sickLeave +

        vacationLeave +

        birthdayLeave +

        maternityLeave +

        paternityLeave +

        allowancePay;


    /* ======================================
       DEDUCTIONS
    ====================================== */

    const sssDed =
        numberValue(
            sss
        );


    const philhealthDed =
        numberValue(
            philhealth
        );


    const pagibigDed =
        numberValue(
            pagibig
        );


    const healthCardDed =
        numberValue(
            healthcard
        );


    const otherDed =
        numberValue(
            otherdeduction
        );


    const deductions =

        sssDed +

        philhealthDed +

        pagibigDed +

        healthCardDed +

        otherDed;


    /* ======================================
       NET PAY
    ====================================== */

    const net =
        gross -
        deductions;


    return {

        days,

        dailyRate,

        basicPay,

        overtimePay,

        holidayPay,

        sickLeave,

        vacationLeave,

        birthdayLeave,

        maternityLeave,

        paternityLeave,

        allowancePay,

        sssDed,

        philhealthDed,

        pagibigDed,

        healthCardDed,

        otherDed,

        deductions,

        gross,

        net

    };

}


/* ==========================================
   DISPLAY TOTAL NET
========================================== */

function updateTotalPreview(){

    const payroll =
        calculatePayroll();


    if(totalNet){

        totalNet.textContent =
            money(
                payroll.net
            );

    }

}


/* ==========================================
   AUTO UPDATE TOTAL
========================================== */

const calculationInputs = [

    totaldays,
    dailyrate,
    overtime,
    holiday,
    sickleave,
    vacationleave,
    birthdayleave,
    maternityleave,
    paternityleave,
    allowance,
    sss,
    philhealth,
    pagibig,
    healthcard,
    otherdeduction

];


calculationInputs.forEach(
    input => {

        if(!input){

            return;

        }


        input.addEventListener(
            "input",
            updateTotalPreview
        );

    }
);


/* ==========================================
   SAVE PAYROLL
========================================== */

window.savePayroll =
async function(){

    /* ======================================
       EMPLOYEE CHECK
    ====================================== */

    if(
        !employeeSelect ||
        employeeSelect.value === ""
    ){

        alert(
            "Please select an employee."
        );

        return;

    }


    const selected =
        employeeSelect.options[
            employeeSelect.selectedIndex
        ];


    if(!selected){

        alert(
            "Please select an employee."
        );

        return;

    }


    /* ======================================
       CALCULATE
    ====================================== */

    const payroll =
        calculatePayroll();


    /* ======================================
       VALIDATION
    ====================================== */

    if(
        payroll.days < 0
    ){

        alert(
            "Total Days cannot be negative."
        );

        totaldays.focus();

        return;

    }


    if(
        payroll.dailyRate < 0
    ){

        alert(
            "Daily Rate cannot be negative."
        );

        dailyrate.focus();

        return;

    }


    if(
        payroll.net < 0
    ){

        const proceed =
            confirm(
                "The calculated Net Pay is negative.\n\n" +
                "Do you want to continue saving this payroll?"
            );


        if(!proceed){

            return;

        }

    }


    /* ======================================
       EMPLOYEE DATA
    ====================================== */

    const employeeId =
        selected.dataset.employeeId ||
        "";


    const employeeName =
        selected.dataset.name ||
        selected.textContent ||
        "";


    /* ======================================
       DISABLE SAVE BUTTON
    ====================================== */

    const saveButton =
        document.querySelector(
            ".save-btn"
        );


    if(saveButton){

        saveButton.disabled =
            true;

        saveButton.textContent =
            "SAVING...";

    }


    try{

        /* ==================================
           PAYROLL DATA
        ================================== */

        const payrollData = {

            empid:
                employeeId,

            employee:
                employeeName,

            employeeDocId:
                employeeSelect.value,

            totaldays:
                payroll.days,

            dailyrate:
                payroll.dailyRate,

            basicpay:
                payroll.basicPay,

            overtime:
                payroll.overtimePay,

            holiday:
                payroll.holidayPay,

            sickleave:
                payroll.sickLeave,

            vacationleave:
                payroll.vacationLeave,

            birthdayleave:
                payroll.birthdayLeave,

            maternityleave:
                payroll.maternityLeave,

            paternityleave:
                payroll.paternityLeave,

            allowance:
                payroll.allowancePay,

            sss:
                payroll.sssDed,

            philhealth:
                payroll.philhealthDed,

            pagibig:
                payroll.pagibigDed,

            healthcard:
                payroll.healthCardDed,

            otherdeduction:
                payroll.otherDed,

            deductionreason:
                deductionreason.value.trim(),

            deductions:
                payroll.deductions,

            gross:
                payroll.gross,

            net:
                payroll.net,

            date:
                new Date()
                .toISOString()
                .split("T")[0],

            createdAt:
                new Date()
                .toISOString()

        };


        /* ==================================
           SAVE TO FIREBASE
        ================================== */

        await addDoc(

            collection(
                db,
                "payroll"
            ),

            payrollData

        );


        alert(
            "Payroll Saved Successfully."
        );


        /* ==================================
           CLEAR
        ================================== */

        clearForm();


        /* ==================================
           RELOAD
        ================================== */

        await loadPayroll();


    }catch(error){

        console.error(
            "Save Payroll Error:",
            error
        );


        alert(
            "Unable to save payroll.\n\n" +
            error.message
        );


    }finally{

        if(saveButton){

            saveButton.disabled =
                false;

            saveButton.textContent =
                "💾 SAVE PAYROLL";

        }

    }

};


/* ==========================================
   LOAD PAYROLL
========================================== */

async function loadPayroll(){

    if(!payrollBody){

        return;

    }


    payrollBody.innerHTML = `

        <tr>

            <td
                colspan="23"
                style="
                    text-align:center;
                    padding:25px;
                ">

                Loading payroll...

            </td>

        </tr>

    `;


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "payroll"
                )
            );


        payrollBody.innerHTML =
            "";


        let total =
            0;


        if(snapshot.empty){

            payrollBody.innerHTML = `

                <tr>

                    <td
                        colspan="23"
                        style="
                            text-align:center;
                            padding:25px;
                        ">

                        NO PAYROLL RECORDS FOUND

                    </td>

                </tr>

            `;


            if(totalNet){

                totalNet.textContent =
                    "0.00";

            }


            return;

        }


        snapshot.forEach(
            payrollDoc => {

                const pay =
                    payrollDoc.data();


                const net =
                    Number(
                        pay.net || 0
                    );


                total +=
                    net;


                payrollBody.innerHTML += `

                    <tr>

                        <td>
                            ${escapeHTML(
                                pay.empid || ""
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                pay.employee || ""
                            )}
                        </td>

                        <td>
                            ${Number(
                                pay.totaldays || 0
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.dailyrate
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.basicpay
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.overtime
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.holiday
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.sickleave
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.vacationleave
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.birthdayleave
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.maternityleave
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.paternityleave
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.allowance
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.sss
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.philhealth
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.pagibig
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.healthcard
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.otherdeduction
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                pay.deductionreason || ""
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.deductions
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.gross
                            )}
                        </td>

                        <td>
                            ₱ ${money(
                                pay.net
                            )}
                        </td>

                        <td>

                            <button
                                class="btn delete-btn"
                                onclick="
                                    deletePayroll(
                                        '${payrollDoc.id}'
                                    )
                                ">

                                DELETE

                            </button>

                        </td>

                    </tr>

                `;

            }
        );


        if(totalNet){

            totalNet.textContent =
                money(
                    total
                );

        }


    }catch(error){

        console.error(
            "Load Payroll Error:",
            error
        );


        payrollBody.innerHTML = `

            <tr>

                <td
                    colspan="23"
                    style="
                        text-align:center;
                        padding:25px;
                    ">

                    ERROR LOADING PAYROLL

                </td>

            </tr>

        `;


        alert(
            "Unable to load payroll.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   DELETE PAYROLL
========================================== */

window.deletePayroll =
async function(id){

    if(!id){

        return;

    }


    const confirmDelete =
        confirm(
            "Delete this payroll record?"
        );


    if(!confirmDelete){

        return;

    }


    try{

        await deleteDoc(

            doc(
                db,
                "payroll",
                id
            )

        );


        alert(
            "Payroll Deleted Successfully."
        );


        await loadPayroll();


    }catch(error){

        console.error(
            "Delete Payroll Error:",
            error
        );


        alert(
            "Unable to delete payroll.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   CLEAR FORM
========================================== */

function clearForm(){

    if(employeeSelect){

        employeeSelect.value =
            "";

    }


    if(totaldays){

        totaldays.value =
            "";

    }


    if(dailyrate){

        dailyrate.value =
            "";

    }


    if(overtime){

        overtime.value =
            "";

    }


    if(holiday){

        holiday.value =
            "";

    }


    if(sickleave){

        sickleave.value =
            "";

    }


    if(vacationleave){

        vacationleave.value =
            "";

    }


    if(birthdayleave){

        birthdayleave.value =
            "";

    }


    if(maternityleave){

        maternityleave.value =
            "";

    }


    if(paternityleave){

        paternityleave.value =
            "";

    }


    if(allowance){

        allowance.value =
            "";

    }


    if(sss){

        sss.value =
            "";

    }


    if(philhealth){

        philhealth.value =
            "";

    }


    if(pagibig){

        pagibig.value =
            "";

    }


    if(healthcard){

        healthcard.value =
            "";

    }


    if(otherdeduction){

        otherdeduction.value =
            "";

    }


    if(deductionreason){

        deductionreason.value =
            "";

    }


    updateTotalPreview();

}


/* ==========================================
   INITIAL LOAD
========================================== */

async function initializePayroll(){

    await loadEmployees();

    await loadPayroll();

    updateTotalPreview();

}


/* ==========================================
   START
========================================== */

initializePayroll();
