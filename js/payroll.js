/* ==========================================
   PAPPRITO HRIS
   PAYROLL MANAGEMENT
========================================== */

import { db } from "./firebase.js";

import {

    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc

}

from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   ELEMENTS
========================================== */

const employeeSelect =
document.getElementById("employeeSelect");

const totaldays =
document.getElementById("totaldays");

const dailyrate =
document.getElementById("dailyrate");

const overtime =
document.getElementById("overtime");

const holiday =
document.getElementById("holiday");

const sickleave =
document.getElementById("sickleave");

const vacationleave =
document.getElementById("vacationleave");

const birthdayleave =
document.getElementById("birthdayleave");

const maternityleave =
document.getElementById("maternityleave");

const paternityleave =
document.getElementById("paternityleave");

const allowance =
document.getElementById("allowance");

const sss =
document.getElementById("sss");

const philhealth =
document.getElementById("philhealth");

const pagibig =
document.getElementById("pagibig");

const healthcard =
document.getElementById("healthcard");

const otherdeduction =
document.getElementById("otherdeduction");

const deductionreason =
document.getElementById("deductionreason");

const payrollBody =
document.getElementById("payrollBody");

const totalNet =
document.getElementById("totalNet");


/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    employeeSelect.innerHTML =

    `
    <option value="">
    Select Employee
    </option>
    `;


    const querySnapshot =

    await getDocs(
        collection(
            db,
            "employees"
        )
    );


    querySnapshot.forEach(docSnap=>{

        const emp =
        docSnap.data();


        const fullname =

        (emp.firstname || '') + ' ' +

        (emp.middlename || '') + ' ' +

        (emp.lastname || '');


        employeeSelect.innerHTML += `

        <option
        value="${fullname}"
        data-id="${emp.employeeid}">

        ${emp.employeeid}

        -

        ${fullname}

        </option>

        `;

    });

}


loadEmployees();


/* ==========================================
   SAVE PAYROLL
========================================== */

window.savePayroll =

async function(){

    if(
        employeeSelect.value === ''
    ){

        alert(
            'Select Employee'
        );

        return;

    }


    const selected =

    employeeSelect.options[
        employeeSelect.selectedIndex
    ];


    const empid =
    selected.dataset.id;


    const employee =
    employeeSelect.value;


    const totalDays =
    Number(
        totaldays.value || 0
    );


    const dailyRate =
    Number(
        dailyrate.value || 0
    );


    const basicPay =
    totalDays *
    dailyRate;


    const overtimePay =
    Number(
        overtime.value || 0
    );


    const holidayPay =
    Number(
        holiday.value || 0
    );


    const sickLeave =
    Number(
        sickleave.value || 0
    );


    const vacationLeave =
    Number(
        vacationleave.value || 0
    );


    const birthdayLeave =
    Number(
        birthdayleave.value || 0
    );


    const maternityLeave =
    Number(
        maternityleave.value || 0
    );


    const paternityLeave =
    Number(
        paternityleave.value || 0
    );


    const allowancePay =
    Number(
        allowance.value || 0
    );


    const sssDed =
    Number(
        sss.value || 0
    );


    const philhealthDed =
    Number(
        philhealth.value || 0
    );


    const pagibigDed =
    Number(
        pagibig.value || 0
    );


    const healthCardDed =
    Number(
        healthcard.value || 0
    );


    const otherDed =
    Number(
        otherdeduction.value || 0
    );


    const deductionReason =
    deductionreason.value;


    /* ======================================
       TOTAL DEDUCTIONS
    ====================================== */

    const deductions =

    sssDed +

    philhealthDed +

    pagibigDed +

    healthCardDed +

    otherDed;


    /* ======================================
       TOTAL GROSS
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
       NET PAY
    ====================================== */

    const net =
    gross -
    deductions;


    try{

        await addDoc(

            collection(
                db,
                'payroll'
            ),

            {

                empid:
                empid,

                employee:
                employee,

                totaldays:
                totalDays,

                dailyrate:
                dailyRate,

                basicpay:
                basicPay,

                overtime:
                overtimePay,

                holiday:
                holidayPay,

                sickleave:
                sickLeave,

                vacationleave:
                vacationLeave,

                birthdayleave:
                birthdayLeave,

                maternityleave:
                maternityLeave,

                paternityleave:
                paternityLeave,

                allowance:
                allowancePay,

                sss:
                sssDed,

                philhealth:
                philhealthDed,

                pagibig:
                pagibigDed,

                healthcard:
                healthCardDed,

                otherdeduction:
                otherDed,

                deductionreason:
                deductionReason,

                deductions:
                deductions,

                gross:
                gross,

                net:
                net,

                date:

                new Date()
                .toLocaleDateString()

            }

        );


        alert(
            'Payroll Saved'
        );


        clearForm();


        loadPayroll();


    }catch(error){

        console.log(error);

        alert(
            'Firebase Error'
        );

    }

};


/* ==========================================
   LOAD PAYROLL
========================================== */

async function loadPayroll(){

    payrollBody.innerHTML = '';


    let total = 0;


    const querySnapshot =

    await getDocs(

        collection(
            db,
            'payroll'
        )

    );


    querySnapshot.forEach(
        payrollDoc=>{

            const pay =
            payrollDoc.data();


            total +=

            Number(
                pay.net || 0
            );


            payrollBody.innerHTML += `

            <tr>

            <td>
            ${pay.empid || ''}
            </td>

            <td>
            ${pay.employee || ''}
            </td>

            <td>
            ${pay.totaldays || 0}
            </td>

            <td>
            ₱ ${Number(
                pay.dailyrate || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.basicpay || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.overtime || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.holiday || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.sickleave || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.vacationleave || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.birthdayleave || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.maternityleave || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.paternityleave || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.allowance || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.sss || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.philhealth || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.pagibig || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.healthcard || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.otherdeduction || 0
            ).toFixed(2)}
            </td>

            <td>
            ${pay.deductionreason || ''}
            </td>

            <td>
            ₱ ${Number(
                pay.deductions || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.gross || 0
            ).toFixed(2)}
            </td>

            <td>
            ₱ ${Number(
                pay.net || 0
            ).toFixed(2)}
            </td>

            <td>

            <button

            class="btn delete-btn"

            onclick="deletePayroll(
                '${payrollDoc.id}'
            )">

            DELETE

            </button>

            </td>

            </tr>

            `;

        }
    );


    totalNet.innerText =
    total.toFixed(2);

}


loadPayroll();


/* ==========================================
   DELETE PAYROLL
========================================== */

window.deletePayroll =

async function(id){

    const confirmDelete =
    confirm(
        'Delete Payroll?'
    );


    if(confirmDelete){

        await deleteDoc(

            doc(
                db,
                'payroll',
                id
            )

        );


        loadPayroll();

    }

};


/* ==========================================
   CLEAR FORM
========================================== */

function clearForm(){

    employeeSelect.value = '';

    totaldays.value = '';

    dailyrate.value = '';

    overtime.value = '';

    holiday.value = '';

    sickleave.value = '';

    vacationleave.value = '';

    birthdayleave.value = '';

    maternityleave.value = '';

    paternityleave.value = '';

    allowance.value = '';

    sss.value = '';

    philhealth.value = '';

    pagibig.value = '';

    healthcard.value = '';

    otherdeduction.value = '';

    deductionreason.value = '';

}
