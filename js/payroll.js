/* ==========================================
   PAPPRITO HRIS
   PAYROLL MANAGEMENT
========================================== */


/* ==========================================
   FIREBASE IMPORT
========================================== */

import {

    initializeApp

}

from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


import {

    getFirestore,

    collection,

    getDocs,

    addDoc,

    updateDoc,

    deleteDoc,

    doc

}

from
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


const filterDate =
document.getElementById(
    "filterDate"
);


const editingLabel =
document.getElementById(
    "editingLabel"
);


const cancelEditBtn =
document.getElementById(
    "cancelEditBtn"
);



/* ==========================================
   EDIT STATE
========================================== */

let editId = null;



/* ==========================================
   EMPLOYEES CACHE
========================================== */

let employees = [];



/* ==========================================
   NUMBER HELPER
========================================== */

function num(
    value
){

    const n =
    Number(
        value || 0
    );


    return Number.isFinite(n)
        ? n
        : 0;

}



/* ==========================================
   MONEY FORMAT
========================================== */

function money(
    value
){

    return num(
        value
    ).toLocaleString(
        "en-PH",
        {

            minimumFractionDigits:
            2,

            maximumFractionDigits:
            2

        }
    );

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
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    try{


        employees = [];


        employeeSelect.innerHTML = `

            <option value="">

                Select Employee

            </option>

        `;


        const snapshot =
        await getDocs(
            collection(
                db,
                "employees"
            )
        );


        snapshot.forEach(
            docSnap => {


                const emp = {

                    id:
                    docSnap.id,

                    ...docSnap.data()

                };


                employees.push(
                    emp
                );


                const fullname = [

                    emp.firstname,

                    emp.middlename,

                    emp.lastname

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


                const employeeId =
                emp.employeeid ||
                "";


                employeeSelect.innerHTML += `

                    <option
                        value="${escapeHTML(fullname)}"
                        data-id="${escapeHTML(employeeId)}">

                        ${escapeHTML(employeeId)}
                        -
                        ${escapeHTML(fullname)}

                    </option>

                `;


            }
        );


    }catch(error){

        console.error(
            "Load Employees Error:",
            error
        );


        alert(
            "Unable to load employees."
        );

    }

}



/* ==========================================
   EMPLOYEE CHANGE
========================================== */

employeeSelect.addEventListener(
    "change",
    function(){

        /*
         * Automatically load employee
         * default salary if available.
         */

        const selected =
        employeeSelect.options[
            employeeSelect.selectedIndex
        ];


        if(
            !selected ||
            !selected.value
        ){

            return;

        }


        const employeeId =
        selected.dataset.id;


        const employee =
        employees.find(
            emp =>
            String(
                emp.employeeid || ""
            ).trim()
            ===
            String(
                employeeId || ""
            ).trim()
        );


        if(
            employee &&
            employee.salary !== undefined &&
            employee.salary !== ""
        ){

            /*
             * Only suggest salary.
             * Do not overwrite if user
             * already entered a rate.
             */

            if(
                dailyrate.value === ""
            ){

                dailyrate.value =
                num(
                    employee.salary
                );

            }

        }

    }
);



/* ==========================================
   SAVE PAYROLL
========================================== */

window.savePayroll =
async function(){

    try{


        /* ==================================
           VALIDATE EMPLOYEE
        ================================== */

        if(
            !employeeSelect.value
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


        const empid =
        selected.dataset.id || "";


        const employee =
        employeeSelect.value;


        if(
            !empid
        ){

            alert(
                "Employee ID was not found."
            );

            return;

        }



        /* ==================================
           READ INPUTS
        ================================== */

        const totalDays =
        num(
            totaldays.value
        );


        const dailyRate =
        num(
            dailyrate.value
        );


        const overtimePay =
        num(
            overtime.value
        );


        const holidayPay =
        num(
            holiday.value
        );


        const sickLeave =
        num(
            sickleave.value
        );


        const vacationLeave =
        num(
            vacationleave.value
        );


        const birthdayLeave =
        num(
            birthdayleave.value
        );


        const maternityLeave =
        num(
            maternityleave.value
        );


        const paternityLeave =
        num(
            paternityleave.value
        );


        const allowancePay =
        num(
            allowance.value
        );


        const sssDed =
        num(
            sss.value
        );


        const philhealthDed =
        num(
            philhealth.value
        );


        const pagibigDed =
        num(
            pagibig.value
        );


        const healthCardDed =
        num(
            healthcard.value
        );


        const otherDed =
        num(
            otherdeduction.value
        );


        const deductionReason =
        deductionreason.value.trim();



        /* ==================================
           BASIC PAY
        ================================== */

        const basicPay =
        totalDays *
        dailyRate;



        /* ==================================
           TOTAL DEDUCTION
        ================================== */

        const deductions =

        sssDed +

        philhealthDed +

        pagibigDed +

        healthCardDed +

        otherDed;



        /* ==================================
           GROSS PAY
        ================================== */

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



        /* ==================================
           NET PAY
        ================================== */

        const net =
        gross -
        deductions;



        /* ==================================
           PREVENT NEGATIVE NET
        ================================== */

        if(
            net < 0
        ){

            const proceed =
            confirm(
                "Total deductions are greater than gross pay.\n\n" +
                "Net Pay will be negative.\n\n" +
                "Continue?"
            );


            if(!proceed){

                return;

            }

        }



        /* ==================================
           PAYROLL DATA
        ================================== */

        const payrollData = {

            empid:
            empid,

            employee:
            employee,

            totaldays:
            totalDays,

            dailyrate:
            dailyRate,

            basicpay:
            Number(
                basicPay.toFixed(2)
            ),

            overtime:
            Number(
                overtimePay.toFixed(2)
            ),

            holiday:
            Number(
                holidayPay.toFixed(2)
            ),

            sickleave:
            Number(
                sickLeave.toFixed(2)
            ),

            vacationleave:
            Number(
                vacationLeave.toFixed(2)
            ),

            birthdayleave:
            Number(
                birthdayLeave.toFixed(2)
            ),

            maternityleave:
            Number(
                maternityLeave.toFixed(2)
            ),

            paternityleave:
            Number(
                paternityLeave.toFixed(2)
            ),

            allowance:
            Number(
                allowancePay.toFixed(2)
            ),

            sss:
            Number(
                sssDed.toFixed(2)
            ),

            philhealth:
            Number(
                philhealthDed.toFixed(2)
            ),

            pagibig:
            Number(
                pagibigDed.toFixed(2)
            ),

            healthcard:
            Number(
                healthCardDed.toFixed(2)
            ),

            otherdeduction:
            Number(
                otherDed.toFixed(2)
            ),

            deductionreason:
            deductionReason,

            deductions:
            Number(
                deductions.toFixed(2)
            ),

            gross:
            Number(
                gross.toFixed(2)
            ),

            net:
            Number(
                net.toFixed(2)
            ),

            date:
            getToday()

        };



        /* ==================================
           UPDATE OR ADD
        ================================== */

        if(
            editId
        ){

            await updateDoc(

                doc(
                    db,
                    "payroll",
                    editId
                ),

                payrollData

            );


            alert(
                "Payroll Updated Successfully."
            );


        }else{


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

        }



        /* ==================================
           RESET
        ================================== */

        clearForm();


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

    }

};



/* ==========================================
   TODAY
========================================== */

function getToday(){

    const now =
    new Date();


    return now
        .toLocaleDateString(
            "en-CA"
        );

}



/* ==========================================
   LOAD PAYROLL
========================================== */

window.loadPayroll =
async function(){

    try{


        payrollBody.innerHTML = "";


        let total =
        0;


        const snapshot =
        await getDocs(
            collection(
                db,
                "payroll"
            )
        );


        if(
            snapshot.empty
        ){

            payrollBody.innerHTML = `

                <tr>

                    <td
                        colspan="23"
                        style="
                        text-align:center;
                        padding:20px;
                        ">

                        NO PAYROLL RECORDS

                    </td>

                </tr>

            `;


            totalNet.innerText =
            "0.00";


            return;

        }



        snapshot.forEach(
            docSnap => {


                const pay =
                docSnap.data();


                total +=
                num(
                    pay.net
                );


                payrollBody.innerHTML +=
                createPayrollRow(
                    pay,
                    docSnap.id
                );


            }
        );


        totalNet.innerText =
        money(
            total
        );


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
                    padding:20px;
                    color:red;
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

};



/* ==========================================
   CREATE TABLE ROW
========================================== */

function createPayrollRow(
    pay,
    id
){

    return `

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

    ${num(
        pay.totaldays
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

    <strong>

        ₱ ${money(
            pay.net
        )}

    </strong>

</td>


<td>


    <button
        class="edit-btn"
        onclick="
        editPayroll(
            '${escapeJS(id)}'
        )">

        EDIT

    </button>


    <button
        class="delete-btn"
        onclick="
        deletePayroll(
            '${escapeJS(id)}'
        )">

        DELETE

    </button>


</td>


</tr>

`;

}



/* ==========================================
   ESCAPE JS
========================================== */

function escapeJS(
    value
){

    return String(
        value || ""
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
   EDIT PAYROLL
========================================== */

window.editPayroll =
async function(
    id
){

    try{


        const snapshot =
        await getDocs(
            collection(
                db,
                "payroll"
            )
        );


        let selectedPay =
        null;


        snapshot.forEach(
            docSnap => {

                if(
                    docSnap.id === id
                ){

                    selectedPay = {

                        id:
                        docSnap.id,

                        ...docSnap.data()

                    };

                }

            }
        );


        if(
            !selectedPay
        ){

            alert(
                "Payroll record not found."
            );

            return;

        }


        editId =
        id;


        /* ==================================
           SELECT EMPLOYEE
        ================================== */

        const employeeOption =
        Array.from(
            employeeSelect.options
        ).find(
            option =>
            option.dataset.id ===
            String(
                selectedPay.empid || ""
            )
        );


        if(
            employeeOption
        ){

            employeeSelect.value =
            employeeOption.value;

        }



        /* ==================================
           LOAD VALUES
        ================================== */

        totaldays.value =
        selectedPay.totaldays ?? "";


        dailyrate.value =
        selectedPay.dailyrate ?? "";


        overtime.value =
        selectedPay.overtime ?? "";


        holiday.value =
        selectedPay.holiday ?? "";


        sickleave.value =
        selectedPay.sickleave ?? "";


        vacationleave.value =
        selectedPay.vacationleave ?? "";


        birthdayleave.value =
        selectedPay.birthdayleave ?? "";


        maternityleave.value =
        selectedPay.maternityleave ?? "";


        paternityleave.value =
        selectedPay.paternityleave ?? "";


        allowance.value =
        selectedPay.allowance ?? "";


        sss.value =
        selectedPay.sss ?? "";


        philhealth.value =
        selectedPay.philhealth ?? "";


        pagibig.value =
        selectedPay.pagibig ?? "";


        healthcard.value =
        selectedPay.healthcard ?? "";


        otherdeduction.value =
        selectedPay.otherdeduction ?? "";


        deductionreason.value =
        selectedPay.deductionreason ?? "";



        /* ==================================
           EDIT UI
        ================================== */

        editingLabel.style.display =
        "block";


        cancelEditBtn.style.display =
        "inline-block";


        window.scrollTo({

            top:0,

            behavior:"smooth"

        });


    }catch(error){

        console.error(
            "Edit Payroll Error:",
            error
        );


        alert(
            "Unable to edit payroll.\n\n" +
            error.message
        );

    }

};



/* ==========================================
   CANCEL EDIT
========================================== */

window.cancelEdit =
function(){

    editId =
    null;


    editingLabel.style.display =
    "none";


    cancelEditBtn.style.display =
    "none";


    clearForm(
        false
    );

};



/* ==========================================
   DELETE PAYROLL
========================================== */

window.deletePayroll =
async function(
    id
){

    const confirmed =
    confirm(
        "Delete this payroll record?"
    );


    if(
        !confirmed
    ){

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


        if(
            editId === id
        ){

            editId =
            null;

        }


        await loadPayroll();


        if(
            editId === null
        ){

            editingLabel.style.display =
            "none";

            cancelEditBtn.style.display =
            "none";

        }


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
   FILTER PAYROLL BY DATE
========================================== */

window.filterPayroll =
async function(){

    const selectedDate =
    filterDate.value;


    if(
        !selectedDate
    ){

        alert(
            "Please select a date first."
        );

        return;

    }


    try{


        payrollBody.innerHTML =
        "";


        let total =
        0;


        const snapshot =
        await getDocs(
            collection(
                db,
                "payroll"
            )
        );


        let found =
        false;


        snapshot.forEach(
            docSnap => {


                const pay =
                docSnap.data();


                if(
                    pay.date ===
                    selectedDate
                ){

                    found =
                    true;


                    total +=
                    num(
                        pay.net
                    );


                    payrollBody.innerHTML +=
                    createPayrollRow(
                        pay,
                        docSnap.id
                    );

                }

            }
        );


        if(
            !found
        ){

            payrollBody.innerHTML = `

                <tr>

                    <td
                        colspan="23"
                        style="
                        text-align:center;
                        padding:20px;
                        ">

                        NO PAYROLL FOUND FOR
                        ${escapeHTML(
                            selectedDate
                        )}

                    </td>

                </tr>

            `;

        }


        totalNet.innerText =
        money(
            total
        );


    }catch(error){

        console.error(
            "Filter Payroll Error:",
            error
        );


        alert(
            "Unable to filter payroll.\n\n" +
            error.message
        );

    }

};



/* ==========================================
   CLEAR FORM
========================================== */

function clearForm(
    resetEdit = true
){

    employeeSelect.value =
    "";


    totaldays.value =
    "";


    dailyrate.value =
    "";


    overtime.value =
    "";


    holiday.value =
    "";


    sickleave.value =
    "";


    vacationleave.value =
    "";


    birthdayleave.value =
    "";


    maternityleave.value =
    "";


    paternityleave.value =
    "";


    allowance.value =
    "";


    sss.value =
    "";


    philhealth.value =
    "";


    pagibig.value =
    "";


    healthcard.value =
    "";


    otherdeduction.value =
    "";


    deductionreason.value =
    "";


    if(
        resetEdit
    ){

        editId =
        null;


        editingLabel.style.display =
        "none";


        cancelEditBtn.style.display =
        "none";

    }

}



/* ==========================================
   PRINT TABLE
========================================== */

window.printPayroll =
function(){

    window.print();

};



/* ==========================================
   AUTO LOAD
========================================== */

async function startPayroll(){

    await loadEmployees();

    await loadPayroll();

}


startPayroll();
