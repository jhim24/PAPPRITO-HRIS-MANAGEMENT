/* ==========================================
   PAPPRITO HRIS
   AUTO PAYROLL SYSTEM JS
========================================== */

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL
========================================== */

let editId = null;

window.lastHolidayPay = 0;


/* ==========================================
   ELEMENTS
========================================== */

const employeeName =
    document.getElementById("employeeName");

const employeeId =
    document.getElementById("employeeId");

const salaryRate =
    document.getElementById("salaryRate");

const totalHours =
    document.getElementById("totalHours");

const overtimeHours =
    document.getElementById("overtimeHours");

const holidayType =
    document.getElementById("holidayType");

const holidayHours =
    document.getElementById("holidayHours");

const nightHours =
    document.getElementById("nightHours");

const sss =
    document.getElementById("sss");

const philhealth =
    document.getElementById("philhealth");

const pagibig =
    document.getElementById("pagibig");

const healthcard =
    document.getElementById("healthcard");

const others =
    document.getElementById("others");

const grossSalary =
    document.getElementById("grossSalary");

const netSalary =
    document.getElementById("netSalary");

const filterDate =
    document.getElementById("filterDate");

const totalPayroll =
    document.getElementById("totalPayroll");

const payrollTable =
    document.getElementById("payrollTable");


/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    employeeName.innerHTML = `

        <option value="">

            Select Employee

        </option>

    `;


    try{

        const querySnapshot =

        await getDocs(

            collection(
                db,
                "employees"
            )

        );


        querySnapshot.forEach(
            docSnap => {

                const emp =
                    docSnap.data();


                const fullname =

                    (emp.firstname || "") +
                    " " +
                    (emp.lastname || "");


                employeeName.innerHTML += `

                    <option
                    value="${fullname.trim()}"
                    data-id="${emp.employeeid || ""}">

                        ${emp.employeeid || ""}

                        -

                        ${fullname.trim()}

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
            "Failed to load employees."
        );

    }

}


/* ==========================================
   AUTO EMPLOYEE ID
========================================== */

employeeName.addEventListener(
    "change",
    function(){

        const selected =

            this.options[
                this.selectedIndex
            ];


        employeeId.value =

            selected.dataset.id || "";

    }
);


/* ==========================================
   COMPUTE PAYROLL
========================================== */

window.computePayroll =
function(){

    const rate =

        Number(
            salaryRate.value || 0
        );


    const hours =

        Number(
            totalHours.value || 0
        );


    const overtime =

        Number(
            overtimeHours.value || 0
        );


    const holidayHoursValue =

        Number(
            holidayHours.value || 0
        );


    const nightHoursValue =

        Number(
            nightHours.value || 0
        );


    /* ======================================
       BASIC PAY
    ====================================== */

    const basicPay =

        hours * rate;


    /* ======================================
       OVERTIME PAY
    ====================================== */

    let overtimePay = 0;


    if(
        holidayType.value === "regular"
    ){

        overtimePay =

            overtime *
            (
                rate * 2.60
            );

    }

    else if(
        holidayType.value === "special"
    ){

        overtimePay =

            overtime *
            (
                rate * 1.69
            );

    }

    else{

        overtimePay =

            overtime *
            (
                rate * 1.25
            );

    }


    /* ======================================
       HOLIDAY PAY
    ====================================== */

    let holidayPay = 0;


    if(
        holidayType.value === "regular"
    ){

        holidayPay =

            holidayHoursValue *
            (
                rate * 2
            );

    }

    else if(
        holidayType.value === "special"
    ){

        holidayPay =

            holidayHoursValue *
            (
                rate * 1.30
            );

    }


    window.lastHolidayPay =
        holidayPay;


    /* ======================================
       NIGHT DIFFERENTIAL
    ====================================== */

    const nightPay =

        nightHoursValue *
        (
            rate * 0.10
        );


    /* ======================================
       GROSS
    ====================================== */

    const gross =

        basicPay +
        overtimePay +
        holidayPay +
        nightPay;


    /* ======================================
       DEDUCTIONS
    ====================================== */

    const deductions =

        Number(sss.value || 0) +

        Number(
            philhealth.value || 0
        ) +

        Number(
            pagibig.value || 0
        ) +

        Number(
            healthcard.value || 0
        ) +

        Number(
            others.value || 0
        );


    /* ======================================
       NET
    ====================================== */

    const net =

        gross -
        deductions;


    /* ======================================
       DISPLAY
    ====================================== */

    grossSalary.value =
        gross.toFixed(2);


    netSalary.value =
        net.toFixed(2);

};


/* ==========================================
   SAVE PAYROLL
========================================== */

window.savePayroll =
async function(){

    if(
        employeeName.value === ""
    ){

        alert(
            "Select Employee"
        );

        return;

    }


    if(
        grossSalary.value === ""
    ){

        alert(
            "Click COMPUTE PAYROLL first"
        );

        return;

    }


    try{

        const payrollData = {

            empid:
                employeeId.value,

            employee:
                employeeName.value,

            dailyrate:
                salaryRate.value,

            totaldays:
                totalHours.value,

            overtime:
                overtimeHours.value,

            holidaytype:
                holidayType.value,

            holidayhours:
                holidayHours.value,

            holidaypay:
                (
                    window.lastHolidayPay || 0
                ).toFixed(2),

            nightdiff:
                nightHours.value,

            gross:
                grossSalary.value,

            sss:
                sss.value,

            philhealth:
                philhealth.value,

            pagibig:
                pagibig.value,

            health:
                healthcard.value,

            other:
                others.value,

            deductions:

                (

                    Number(
                        sss.value || 0
                    ) +

                    Number(
                        philhealth.value || 0
                    ) +

                    Number(
                        pagibig.value || 0
                    ) +

                    Number(
                        healthcard.value || 0
                    ) +

                    Number(
                        others.value || 0
                    )

                ).toFixed(2),

            net:
                netSalary.value,

            date:

                new Date()
                .toISOString()
                .split("T")[0]

        };


        if(editId){

            await updateDoc(

                doc(
                    db,
                    "payroll",
                    editId
                ),

                payrollData

            );


            alert(
                "Payroll Updated"
            );


            editId = null;

        }

        else{

            await addDoc(

                collection(
                    db,
                    "payroll"
                ),

                payrollData

            );


            alert(
                "Payroll Saved"
            );

        }


        clearForm();

        loadPayroll();


    }catch(error){

        console.error(error);

        alert(
            "Save Error"
        );

    }

};


/* ==========================================
   LOAD PAYROLL
========================================== */

window.loadPayroll =
async function(){

    const tbody =

        payrollTable.querySelector(
            "tbody"
        );


    tbody.innerHTML = "";


    let total = 0;


    try{

        const querySnapshot =

            await getDocs(

                collection(
                    db,
                    "payroll"
                )

            );


        querySnapshot.forEach(
            docSnap => {

                const pay =
                    docSnap.data();


                total +=

                    Number(
                        pay.net || 0
                    );


                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${pay.empid || ""}
                        </td>

                        <td>
                            ${pay.employee || ""}
                        </td>

                        <td>
                            ${pay.dailyrate || 0}
                        </td>

                        <td>
                            ${pay.totaldays || 0}
                        </td>

                        <td>
                            ${pay.overtime || 0}
                        </td>

                        <td>
                            ${pay.holidaytype || ""}
                        </td>

                        <td>
                            ${pay.holidayhours || 0}
                        </td>

                        <td>
                            ${pay.nightdiff || 0}
                        </td>

                        <td>
                            ${pay.gross || 0}
                        </td>

                        <td>
                            ${pay.sss || 0}
                        </td>

                        <td>
                            ${pay.philhealth || 0}
                        </td>

                        <td>
                            ${pay.pagibig || 0}
                        </td>

                        <td>
                            ${pay.health || 0}
                        </td>

                        <td>
                            ${pay.other || 0}
                        </td>

                        <td>
                            ${pay.net || 0}
                        </td>

                        <td>
                            ${pay.date || ""}
                        </td>

                        <td>

                            <button
                            class="edit-btn"
                            onclick="editPayroll(
                                '${docSnap.id}',
                                '${pay.empid || ""}',
                                '${pay.employee || ""}',
                                '${pay.dailyrate || ""}',
                                '${pay.totaldays || ""}',
                                '${pay.overtime || ""}',
                                '${pay.holidaytype || "none"}',
                                '${pay.holidayhours || ""}',
                                '${pay.nightdiff || ""}',
                                '${pay.sss || ""}',
                                '${pay.philhealth || ""}',
                                '${pay.pagibig || ""}',
                                '${pay.health || ""}',
                                '${pay.other || ""}'
                            )">

                                EDIT

                            </button>


                            <button
                            class="delete-btn"
                            onclick="deletePayroll(
                                '${docSnap.id}'
                            )">

                                DELETE

                            </button>

                        </td>

                    </tr>

                `;

            }
        );


        totalPayroll.innerText =
            total.toFixed(2);


    }catch(error){

        console.error(
            "Load Payroll Error:",
            error
        );

        alert(
            "Load Payroll Error"
        );

    }

};


/* ==========================================
   EDIT PAYROLL
========================================== */

window.editPayroll =
function(

    id,
    empid,
    employee,
    rate,
    hours,
    ot,
    holiday,
    holidayhrs,
    night,
    sssval,
    phil,
    pagibigval,
    health,
    other

){

    editId = id;


    employeeId.value =
        empid;


    employeeName.value =
        employee;


    salaryRate.value =
        rate;


    totalHours.value =
        hours;


    overtimeHours.value =
        ot;


    holidayType.value =
        holiday;


    holidayHours.value =
        holidayhrs;


    nightHours.value =
        night;


    sss.value =
        sssval;


    philhealth.value =
        phil;


    pagibig.value =
        pagibigval;


    healthcard.value =
        health;


    others.value =
        other;


    computePayroll();


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

};


/* ==========================================
   DELETE PAYROLL
========================================== */

window.deletePayroll =
async function(id){

    const confirmDelete =

        confirm(
            "Delete Payroll?"
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
            "Payroll Deleted"
        );


        loadPayroll();


    }catch(error){

        console.error(error);

        alert(
            "Delete Error"
        );

    }

};


/* ==========================================
   CLEAR FORM
========================================== */

function clearForm(){

    employeeName.value = "";

    employeeId.value = "";

    salaryRate.value = "";

    totalHours.value = "";

    overtimeHours.value = "";

    holidayType.value = "none";

    holidayHours.value = "";

    nightHours.value = "";

    sss.value = "";

    philhealth.value = "";

    pagibig.value = "";

    healthcard.value = "";

    others.value = "";

    grossSalary.value = "";

    netSalary.value = "";

    window.lastHolidayPay = 0;

}


/* ==========================================
   FILTER PAYROLL
========================================== */

window.filterPayroll =
async function(){

    const selectedDate =
        filterDate.value;


    if(
        selectedDate === ""
    ){

        alert(
            "Select Date First"
        );

        return;

    }


    const tbody =

        payrollTable.querySelector(
            "tbody"
        );


    tbody.innerHTML = "";


    let total = 0;


    try{

        const querySnapshot =

            await getDocs(

                collection(
                    db,
                    "payroll"
                )

            );


        let found = false;


        querySnapshot.forEach(
            docSnap => {

                const pay =
                    docSnap.data();


                if(
                    pay.date ===
                    selectedDate
                ){

                    found = true;


                    total +=

                        Number(
                            pay.net || 0
                        );


                    tbody.innerHTML += `

                        <tr>

                            <td>
                                ${pay.empid || ""}
                            </td>

                            <td>
                                ${pay.employee || ""}
                            </td>

                            <td>
                                ${pay.dailyrate || 0}
                            </td>

                            <td>
                                ${pay.totaldays || 0}
                            </td>

                            <td>
                                ${pay.overtime || 0}
                            </td>

                            <td>
                                ${pay.holidaytype || ""}
                            </td>

                            <td>
                                ${pay.holidayhours || 0}
                            </td>

                            <td>
                                ${pay.nightdiff || 0}
                            </td>

                            <td>
                                ${pay.gross || 0}
                            </td>

                            <td>
                                ${pay.sss || 0}
                            </td>

                            <td>
                                ${pay.philhealth || 0}
                            </td>

                            <td>
                                ${pay.pagibig || 0}
                            </td>

                            <td>
                                ${pay.health || 0}
                            </td>

                            <td>
                                ${pay.other || 0}
                            </td>

                            <td>
                                ${pay.net || 0}
                            </td>

                            <td>
                                ${pay.date || ""}
                            </td>

                            <td>

                                <button
                                class="edit-btn"
                                onclick="editPayroll(
                                    '${docSnap.id}',
                                    '${pay.empid || ""}',
                                    '${pay.employee || ""}',
                                    '${pay.dailyrate || ""}',
                                    '${pay.totaldays || ""}',
                                    '${pay.overtime || ""}',
                                    '${pay.holidaytype || "none"}',
                                    '${pay.holidayhours || ""}',
                                    '${pay.nightdiff || ""}',
                                    '${pay.sss || ""}',
                                    '${pay.philhealth || ""}',
                                    '${pay.pagibig || ""}',
                                    '${pay.health || ""}',
                                    '${pay.other || ""}'
                                )">

                                    EDIT

                                </button>


                                <button
                                class="delete-btn"
                                onclick="deletePayroll(
                                    '${docSnap.id}'
                                )">

                                    DELETE

                                </button>

                            </td>

                        </tr>

                    `;

                }

            }
        );


        if(!found){

            tbody.innerHTML = `

                <tr>

                    <td colspan="17">

                        NO PAYROLL FOUND

                    </td>

                </tr>

            `;

        }


        totalPayroll.innerText =
            total.toFixed(2);


    }catch(error){

        console.error(error);

        alert(
            "Filter Error"
        );

    }

};


/* ==========================================
   INITIALIZE
========================================== */

loadEmployees();

loadPayroll();
