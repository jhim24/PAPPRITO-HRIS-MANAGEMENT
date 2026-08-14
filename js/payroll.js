/* ==========================================
   PAPPRITO HRIS
   PAYSLIP SYSTEM
   AUTO PAYROLL BASED
========================================== */


/* ==========================================
   FIREBASE
========================================== */

import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    deleteDoc
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL
========================================== */

let payslipRecords = [];

let filteredRecords = [];

let selectedPayslip = null;


/* ==========================================
   COLLECTION
========================================== */

const autoPayrollCollection =
    collection(
        db,
        "autoPayroll"
    );


/* ==========================================
   ELEMENTS
========================================== */

const adminPayslipBody =
    document.getElementById(
        "adminPayslipBody"
    );


const searchEmployee =
    document.getElementById(
        "searchEmployee"
    );


const filterDate =
    document.getElementById(
        "filterDate"
    );


const totalRecords =
    document.getElementById(
        "totalRecords"
    );


const totalGross =
    document.getElementById(
        "totalGross"
    );


const totalNet =
    document.getElementById(
        "totalNet"
    );


const payslipArea =
    document.getElementById(
        "payslipArea"
    );


/* ==========================================
   PAYSLIP ELEMENTS
========================================== */

const payEmpId =
    document.getElementById(
        "payEmpId"
    );


const payEmp =
    document.getElementById(
        "payEmp"
    );


const payDate =
    document.getElementById(
        "payDate"
    );


const payHourlyRate =
    document.getElementById(
        "payHourlyRate"
    );


const payRegularHours =
    document.getElementById(
        "payRegularHours"
    );


const payOvertimeHours =
    document.getElementById(
        "payOvertimeHours"
    );


const payHolidayHours =
    document.getElementById(
        "payHolidayHours"
    );


const payNightHours =
    document.getElementById(
        "payNightHours"
    );


const payBasic =
    document.getElementById(
        "payBasic"
    );


const payOvertime =
    document.getElementById(
        "payOvertime"
    );


const payHoliday =
    document.getElementById(
        "payHoliday"
    );


const payNight =
    document.getElementById(
        "payNight"
    );


const payGross =
    document.getElementById(
        "payGross"
    );


const payHolidayType =
    document.getElementById(
        "payHolidayType"
    );


const payHolidayMultiplier =
    document.getElementById(
        "payHolidayMultiplier"
    );


const paySSS =
    document.getElementById(
        "paySSS"
    );


const payPhilhealth =
    document.getElementById(
        "payPhilhealth"
    );


const payPagibig =
    document.getElementById(
        "payPagibig"
    );


const payHealth =
    document.getElementById(
        "payHealth"
    );


const payOther =
    document.getElementById(
        "payOther"
    );


const payDeduction =
    document.getElementById(
        "payDeduction"
    );


const payNet =
    document.getElementById(
        "payNet"
    );


/* ==========================================
   REQUEST ELEMENTS
========================================== */

const empIdDisplay =
    document.getElementById(
        "empIdDisplay"
    );


const empNameDisplay =
    document.getElementById(
        "empNameDisplay"
    );


const requestBody =
    document.getElementById(
        "requestBody"
    );


const attendanceBody =
    document.getElementById(
        "attendanceBody"
    );


/* ==========================================
   HELPERS
========================================== */

function text(value){

    return String(
        value ?? ""
    ).trim();

}


function num(value){

    const n =
        Number(
            value || 0
        );

    return Number.isFinite(n)
        ? n
        : 0;

}


function money(value){

    return num(
        value
    ).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


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
   HOLIDAY TYPE
========================================== */

function formatHolidayType(
    type
){

    switch(
        text(type).toLowerCase()
    ){

        case "regular":

            return "Regular Holiday";


        case "special":

            return "Special Holiday";


        default:

            return "No Holiday";

    }

}


/* ==========================================
   HOLIDAY MULTIPLIER
========================================== */

function getHolidayMultiplier(
    type
){

    switch(
        text(type).toLowerCase()
    ){

        case "regular":

            return 2.00;


        case "special":

            return 1.30;


        default:

            return 0;

    }

}


/* ==========================================
   TODAY
========================================== */

function getToday(){

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


/* ==========================================
   LOAD AUTO PAYROLL
========================================== */

async function loadPayslipRecords(){

    try{

        if(
            adminPayslipBody
        ){

            adminPayslipBody.innerHTML = `

                <tr>

                    <td
                        colspan="10"
                        style="
                            text-align:center;
                            padding:25px;
                        ">

                        Loading Auto Payroll records...

                    </td>

                </tr>

            `;

        }


        payslipRecords = [];


        const snapshot =
            await getDocs(
                autoPayrollCollection
            );


        snapshot.forEach(
            docSnap => {

                payslipRecords.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        /*
         * Newest payroll first
         */

        payslipRecords.sort(
            (
                a,
                b
            ) => {

                const dateA =
                    text(
                        a.date
                    );


                const dateB =
                    text(
                        b.date
                    );


                if(
                    dateA !==
                    dateB
                ){

                    return dateB.localeCompare(
                        dateA
                    );

                }


                return (
                    num(
                        b.updatedAt
                    )
                    -
                    num(
                        a.updatedAt
                    )
                );

            }
        );


        filteredRecords =
            [
                ...payslipRecords
            ];


        renderPayslipTable(
            filteredRecords
        );


    }catch(error){

        console.error(
            "Load Payslip Error:",
            error
        );


        if(
            adminPayslipBody
        ){

            adminPayslipBody.innerHTML = `

                <tr>

                    <td
                        colspan="10"
                        style="
                            text-align:center;
                            padding:25px;
                            color:#d71920;
                        ">

                        Unable to load Auto Payroll records.

                    </td>

                </tr>

            `;

        }


        alert(
            "Unable to load Auto Payroll Payslips.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   RENDER PAYSLIP TABLE
========================================== */

function renderPayslipTable(
    records
){

    if(
        !adminPayslipBody
    ){

        return;

    }


    adminPayslipBody.innerHTML =
        "";


    if(
        records.length === 0
    ){

        adminPayslipBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    style="
                        text-align:center;
                        padding:30px;
                    ">

                    No Auto Payroll Payslips Found.

                </td>

            </tr>

        `;


        updateSummary(
            []
        );

        return;

    }


    records.forEach(
        record => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    ${escapeHTML(
                        record.employeeId ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        record.employeeName ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        record.date ||
                        "-"
                    )}

                </td>


                <td>

                    ₱
                    ${money(
                        record.hourlyRate
                    )}

                </td>


                <td>

                    ${money(
                        record.regularHours
                    )}

                </td>


                <td>

                    ${money(
                        record.overtimeHours
                    )}

                </td>


                <td>

                    ₱
                    ${money(
                        record.gross
                    )}

                </td>


                <td>

                    ₱
                    ${money(
                        record.deductions
                    )}

                </td>


                <td>

                    <strong>

                        ₱
                        ${money(
                            record.net
                        )}

                    </strong>

                </td>


                <td>

                    <button
                        type="button"
                        class="table-icon-btn view-payslip-action"
                        title="View Payslip">

                        <span class="material-icons">
                            visibility
                        </span>

                    </button>


                    <button
                        type="button"
                        class="table-icon-btn print-payslip-action"
                        title="Print Payslip">

                        <span class="material-icons">
                            print
                        </span>

                    </button>


                    <button
                        type="button"
                        class="table-icon-btn delete-payslip-action"
                        title="Delete Payslip">

                        <span class="material-icons">
                            delete
                        </span>

                    </button>

                </td>

            `;


            const viewButton =
                row.querySelector(
                    ".view-payslip-action"
                );


            const printButton =
                row.querySelector(
                    ".print-payslip-action"
                );


            const deleteButton =
                row.querySelector(
                    ".delete-payslip-action"
                );


            if(
                viewButton
            ){

                viewButton.addEventListener(
                    "click",
                    function(){

                        showPayslip(
                            record
                        );

                    }
                );

            }


            if(
                printButton
            ){

                printButton.addEventListener(
                    "click",
                    function(){

                        showPayslip(
                            record,
                            true
                        );

                    }
                );

            }


            if(
                deleteButton
            ){

                deleteButton.addEventListener(
                    "click",
                    function(){

                        deletePayslip(
                            record.id
                        );

                    }
                );

            }


            adminPayslipBody.appendChild(
                row
            );

        }
    );


    updateSummary(
        records
    );

}


/* ==========================================
   SUMMARY
========================================== */

function updateSummary(
    records
){

    const gross =
        records.reduce(
            (
                total,
                record
            ) => {

                return (
                    total +
                    num(
                        record.gross
                    )
                );

            },
            0
        );


    const net =
        records.reduce(
            (
                total,
                record
            ) => {

                return (
                    total +
                    num(
                        record.net
                    )
                );

            },
            0
        );


    if(
        totalRecords
    ){

        totalRecords.textContent =
            records.length;

    }


    if(
        totalGross
    ){

        totalGross.textContent =
            money(
                gross
            );

    }


    if(
        totalNet
    ){

        totalNet.textContent =
            money(
                net
            );

    }

}


/* ==========================================
   SHOW PAYSLIP
========================================== */

function showPayslip(
    record,
    printAfter = false
){

    if(
        !record
    ){

        return;

    }


    selectedPayslip =
        record;


    /*
     * EMPLOYEE INFO
     */

    if(
        empIdDisplay
    ){

        empIdDisplay.textContent =
            record.employeeId ||
            "-";

    }


    if(
        empNameDisplay
    ){

        empNameDisplay.textContent =
            record.employeeName ||
            "-";

    }


    /*
     * PAYSLIP INFO
     */

    if(
        payEmpId
    ){

        payEmpId.textContent =
            record.employeeId ||
            "-";

    }


    if(
        payEmp
    ){

        payEmp.textContent =
            record.employeeName ||
            "-";

    }


    if(
        payDate
    ){

        payDate.textContent =
            record.date ||
            "-";

    }


    if(
        payHourlyRate
    ){

        payHourlyRate.textContent =
            money(
                record.hourlyRate
            );

    }


    /*
     * HOURS
     */

    if(
        payRegularHours
    ){

        payRegularHours.textContent =
            num(
                record.regularHours
            ).toFixed(2);

    }


    if(
        payOvertimeHours
    ){

        payOvertimeHours.textContent =
            num(
                record.overtimeHours
            ).toFixed(2);

    }


    if(
        payHolidayHours
    ){

        payHolidayHours.textContent =
            num(
                record.holidayHours
            ).toFixed(2);

    }


    if(
        payNightHours
    ){

        payNightHours.textContent =
            num(
                record.nightHours
            ).toFixed(2);

    }


    /*
     * EARNINGS
     */

    if(
        payBasic
    ){

        payBasic.textContent =
            money(
                record.regularPay
            );

    }


    if(
        payOvertime
    ){

        payOvertime.textContent =
            money(
                record.overtimePay
            );

    }


    if(
        payHoliday
    ){

        payHoliday.textContent =
            money(
                record.holidayPay
            );

    }


    if(
        payNight
    ){

        payNight.textContent =
            money(
                record.nightPay
            );

    }


    if(
        payGross
    ){

        payGross.textContent =
            money(
                record.gross
            );

    }


    /*
     * HOLIDAY
     */

    const holidayType =
        formatHolidayType(
            record.holidayType
        );


    const holidayMultiplier =
        getHolidayMultiplier(
            record.holidayType
        );


    if(
        payHolidayType
    ){

        payHolidayType.textContent =
            holidayType;

    }


    if(
        payHolidayMultiplier
    ){

        payHolidayMultiplier.textContent =
            holidayMultiplier
            ?
            holidayMultiplier.toFixed(2) + "x"
            :
            "0.00x";

    }


    /*
     * DEDUCTIONS
     */

    if(
        paySSS
    ){

        paySSS.textContent =
            money(
                record.sss
            );

    }


    if(
        payPhilhealth
    ){

        payPhilhealth.textContent =
            money(
                record.philhealth
            );

    }


    if(
        payPagibig
    ){

        payPagibig.textContent =
            money(
                record.pagibig
            );

    }


    if(
        payHealth
    ){

        payHealth.textContent =
            money(
                record.healthcard
            );

    }


    if(
        payOther
    ){

        payOther.textContent =
            money(
                record.others
            );

    }


    if(
        payDeduction
    ){

        payDeduction.textContent =
            money(
                record.deductions
            );

    }


    /*
     * NET PAY
     */

    if(
        payNet
    ){

        payNet.textContent =
            money(
                record.net
            );

    }


    /*
     * SHOW PAYSLIP
     */

    if(
        payslipArea
    ){

        payslipArea.style.display =
            "block";


        payslipArea.scrollIntoView({

            behavior:
                printAfter
                ?
                "auto"
                :
                "smooth",

            block:
                "start"

        });

    }


    if(
        printAfter
    ){

        setTimeout(
            function(){

                window.print();

            },
            300
        );

    }

}


/* ==========================================
   VIEW PAYSLIP
========================================== */

window.loadPayslip =
function(){

    if(
        selectedPayslip
    ){

        showPayslip(
            selectedPayslip
        );

        return;

    }


    if(
        filteredRecords.length > 0
    ){

        showPayslip(
            filteredRecords[0]
        );

        return;

    }


    if(
        payslipRecords.length > 0
    ){

        showPayslip(
            payslipRecords[0]
        );

        return;

    }


    alert(
        "No Auto Payroll Payslip available."
    );

};


/* ==========================================
   SEARCH / FILTER
========================================== */

window.applyFilter =
function(){

    const search =
        text(
            searchEmployee
            ?
            searchEmployee.value
            :
            ""
        ).toLowerCase();


    const date =
        filterDate
        ?
        filterDate.value
        :
        "";


    filteredRecords =
        payslipRecords.filter(
            record => {

                const employeeId =
                    text(
                        record.employeeId
                    ).toLowerCase();


                const employeeName =
                    text(
                        record.employeeName
                    ).toLowerCase();


                const recordDate =
                    text(
                        record.date
                    );


                const employeeMatch =
                    !search
                    ||
                    employeeId.includes(
                        search
                    )
                    ||
                    employeeName.includes(
                        search
                    );


                const dateMatch =
                    !date
                    ||
                    recordDate ===
                    date;


                return (
                    employeeMatch &&
                    dateMatch
                );

            }
        );


    renderPayslipTable(
        filteredRecords
    );


    /*
     * If exactly one record is found,
     * show it automatically.
     */

    if(
        filteredRecords.length === 1
    ){

        showPayslip(
            filteredRecords[0]
        );

    }

};


/* ==========================================
   SHOW ALL
========================================== */

window.showAllPayslips =
function(){

    if(
        searchEmployee
    ){

        searchEmployee.value =
            "";

    }


    if(
        filterDate
    ){

        filterDate.value =
            "";

    }


    filteredRecords =
        [
            ...payslipRecords
        ];


    renderPayslipTable(
        filteredRecords
    );

};


/* ==========================================
   DELETE PAYSLIP
========================================== */

async function deletePayslip(
    id
){

    const record =
        payslipRecords.find(
            item =>
                item.id ===
                id
        );


    if(
        !record
    ){

        return;

    }


    const confirmed =
        confirm(

            "Delete this Auto Payroll Payslip?\n\n" +

            (
                record.employeeName ||
                "-"
            )

            +

            "\n"

            +

            (
                record.date ||
                "-"
            )

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
                "autoPayroll",
                id
            )

        );


        payslipRecords =
            payslipRecords.filter(
                item =>
                    item.id !==
                    id
            );


        filteredRecords =
            filteredRecords.filter(
                item =>
                    item.id !==
                    id
            );


        if(
            selectedPayslip &&
            selectedPayslip.id ===
            id
        ){

            selectedPayslip =
                null;

            closePayslip();

        }


        renderPayslipTable(
            filteredRecords
        );


        alert(
            "Payslip deleted successfully."
        );


    }catch(error){

        console.error(
            "Delete Payslip Error:",
            error
        );


        alert(
            "Unable to delete Payslip.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   GLOBAL DELETE
========================================== */

window.deletePayslip =
function(id){

    deletePayslip(
        id
    );

};


/* ==========================================
   CLOSE PAYSLIP
========================================== */

window.closePayslip =
function(){

    if(
        payslipArea
    ){

        payslipArea.style.display =
            "none";

    }

    selectedPayslip =
        null;

};


/* ==========================================
   PRINT CURRENT PAYSLIP
========================================== */

window.printPayslip =
function(){

    if(
        !selectedPayslip
    ){

        if(
            filteredRecords.length > 0
        ){

            selectedPayslip =
                filteredRecords[0];

            showPayslip(
                selectedPayslip
            );

        }else{

            alert(
                "Please select a Payslip first."
            );

            return;

        }

    }


    if(
        payslipArea
    ){

        payslipArea.style.display =
            "block";

    }


    setTimeout(
        function(){

            window.print();

        },
        200
    );

};


/* ==========================================
   PRINT ALL PAYSLIPS
========================================== */

window.printAllPayslips =
function(){

    const records =
        filteredRecords.length > 0
        ?
        filteredRecords
        :
        payslipRecords;


    if(
        records.length === 0
    ){

        alert(
            "No Payslips available to print."
        );

        return;

    }


    /*
     * Save current payslip.
     */

    const previous =
        selectedPayslip;


    /*
     * We create a temporary
     * print container.
     */

    const printContainer =
        document.createElement(
            "div"
        );


    printContainer.id =
        "temporaryPayslipPrint";


    printContainer.style.display =
        "none";


    records.forEach(
        record => {

            const section =
                createPrintablePayslip(
                    record
                );


            printContainer.appendChild(
                section
            );

        }
    );


    document.body.appendChild(
        printContainer
    );


    printContainer.style.display =
        "block";


    document.body.classList.add(
        "printing-all-payslips"
    );


    setTimeout(
        function(){

            window.print();


            setTimeout(
                function(){

                    printContainer.remove();

                    document.body.classList.remove(
                        "printing-all-payslips"
                    );


                    selectedPayslip =
                        previous;

                },
                500
            );

        },
        200
    );

};


/* ==========================================
   CREATE PRINTABLE PAYSLIP
========================================== */

function createPrintablePayslip(
    record
){

    const section =
        document.createElement(
            "section"
        );


    section.className =
        "printable-payslip";


    const holidayMultiplier =
        getHolidayMultiplier(
            record.holidayType
        );


    section.innerHTML = `

        <div class="company">

            <img
                src="../assets/images/logo.png"
                class="payroll-logo"
                alt="PAPPRITO Logo">

            <h2>
                PAPPRITO
            </h2>

            <p>
                OFFICIAL EMPLOYEE PAYSLIP
            </p>

        </div>


        <div class="info">

            <div>

                <b>
                    EMPLOYEE ID:
                </b>

                ${escapeHTML(
                    record.employeeId ||
                    "-"
                )}

            </div>


            <div>

                <b>
                    EMPLOYEE NAME:
                </b>

                ${escapeHTML(
                    record.employeeName ||
                    "-"
                )}

            </div>


            <div>

                <b>
                    PAYROLL DATE:
                </b>

                ${escapeHTML(
                    record.date ||
                    "-"
                )}

            </div>


            <div>

                <b>
                    HOURLY RATE:
                </b>

                ₱ ${money(
                    record.hourlyRate
                )}

            </div>

        </div>


        <div class="hours-summary">

            <div class="hours-box">

                <small>
                    REGULAR HOURS
                </small>

                <strong>
                    ${num(
                        record.regularHours
                    ).toFixed(2)}
                </strong>

            </div>


            <div class="hours-box">

                <small>
                    OVERTIME HOURS
                </small>

                <strong>
                    ${num(
                        record.overtimeHours
                    ).toFixed(2)}
                </strong>

            </div>


            <div class="hours-box">

                <small>
                    HOLIDAY HOURS
                </small>

                <strong>
                    ${num(
                        record.holidayHours
                    ).toFixed(2)}
                </strong>

            </div>


            <div class="hours-box">

                <small>
                    NIGHT HOURS
                </small>

                <strong>
                    ${num(
                        record.nightHours
                    ).toFixed(2)}
                </strong>

            </div>

        </div>


        <table class="payroll-table">

            <tr>

                <th>
                    EARNINGS
                </th>

                <th>
                    AMOUNT
                </th>

            </tr>


            <tr>

                <td>
                    Regular Pay
                </td>

                <td>
                    ₱ ${money(
                        record.regularPay
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    Overtime Pay
                </td>

                <td>
                    ₱ ${money(
                        record.overtimePay
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    Holiday Pay
                </td>

                <td>
                    ₱ ${money(
                        record.holidayPay
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    Night Differential
                </td>

                <td>
                    ₱ ${money(
                        record.nightPay
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    <b>
                        TOTAL GROSS
                    </b>
                </td>

                <td>
                    <b>
                        ₱ ${money(
                            record.gross
                        )}
                    </b>
                </td>

            </tr>

        </table>


        <div class="holiday-info">

            <b>
                HOLIDAY TYPE:
            </b>

            ${escapeHTML(
                formatHolidayType(
                    record.holidayType
                )
            )}

            <span class="holiday-rate">

                Multiplier:
                ${holidayMultiplier
                    ?
                    holidayMultiplier.toFixed(2) + "x"
                    :
                    "0.00x"
                }

            </span>

        </div>


        <table class="payroll-table">

            <tr>

                <th>
                    DEDUCTIONS
                </th>

                <th>
                    AMOUNT
                </th>

            </tr>


            <tr>

                <td>
                    SSS
                </td>

                <td>
                    ₱ ${money(
                        record.sss
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    PhilHealth
                </td>

                <td>
                    ₱ ${money(
                        record.philhealth
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    Pag-IBIG
                </td>

                <td>
                    ₱ ${money(
                        record.pagibig
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    Health Card
                </td>

                <td>
                    ₱ ${money(
                        record.healthcard
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    Other Deduction
                </td>

                <td>
                    ₱ ${money(
                        record.others
                    )}
                </td>

            </tr>


            <tr>

                <td>
                    <b>
                        TOTAL DEDUCTION
                    </b>
                </td>

                <td>
                    <b>
                        ₱ ${money(
                            record.deductions
                        )}
                    </b>
                </td>

            </tr>

        </table>


        <div class="netpay">

            NET PAY:

            ₱ ${money(
                record.net
            )}

        </div>


        <div class="signature">

            <div class="line">
                HR
            </div>

            <div class="line">
                Employee
            </div>

        </div>

    `;


    return section;

}


/* ==========================================
   PRINT ALL CLEANUP
========================================== */

window.addEventListener(
    "afterprint",
    function(){

        const temporary =
            document.getElementById(
                "temporaryPayslipPrint"
            );


        if(
            temporary
        ){

            temporary.remove();

        }


        document.body.classList.remove(
            "printing-all-payslips"
        );

    }
);


/* ==========================================
   HEADER ACTION
========================================== */

window.headerAction =
function(){

    window.location.href =
        "dashboard.html";

};


/* ==========================================
   BACK TO DASHBOARD ALIAS
========================================== */

window.backToDashboard =
function(){

    window.location.href =
        "dashboard.html";

};


/* ==========================================
   REFRESH
========================================== */

window.refreshPayslip =
async function(){

    await loadPayslipRecords();

};


/* ==========================================
   REQUEST PLACEHOLDER
========================================== */

window.submitRequest =
function(){

    alert(
        "Leave request module is ready for connection to HR Approval."
    );

};


/* ==========================================
   ATTENDANCE REQUEST PLACEHOLDER
========================================== */

window.submitAttendanceRequest =
function(){

    alert(
        "Attendance request module is ready for connection to HR Approval."
    );

};


/* ==========================================
   SEARCH ENTER KEY
========================================== */

if(
    searchEmployee
){

    searchEmployee.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Enter"
            ){

                applyFilter();

            }

        }
    );

}


/* ==========================================
   FILTER DATE CHANGE
========================================== */

if(
    filterDate
){

    filterDate.addEventListener(
        "change",
        function(){

            /*
             * Do not automatically
             * destroy current results.
             *
             * User can click SEARCH.
             */

        }
    );

}


/* ==========================================
   INITIALIZE
========================================== */

async function initializePayslip(){

    /*
     * Hide payslip initially.
     */

    if(
        payslipArea
    ){

        payslipArea.style.display =
            "none";

    }


    /*
     * Set filter date
     * to today.
     */

    if(
        filterDate
    ){

        filterDate.value =
            getToday();

    }


    /*
     * Load Auto Payroll.
     */

    await loadPayslipRecords();


    console.log(
        "PAPPRITO HRIS Payslip Ready"
    );

}


/* ==========================================
   START
========================================== */

initializePayslip();
