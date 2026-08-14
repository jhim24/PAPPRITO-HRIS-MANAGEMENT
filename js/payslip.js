/* ==========================================
   PAPPRITO HRIS
   ADMIN PAYSLIP
   AUTO PAYROLL BASED
========================================== */

import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL
========================================== */

let autoPayrollRecords = [];

let filteredRecords = [];

let selectedRecord = null;


/* ==========================================
   ELEMENTS
========================================== */

const searchEmployee =
    document.getElementById(
        "searchEmployee"
    );

const filterDate =
    document.getElementById(
        "filterDate"
    );

const adminPayslipBody =
    document.getElementById(
        "adminPayslipBody"
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

const employeeSection =
    document.getElementById(
        "employeeSection"
    );

const payslipArea =
    document.getElementById(
        "payslipArea"
    );


/* ==========================================
   EMPLOYEE DISPLAY
========================================== */

const empIdDisplay =
    document.getElementById(
        "empIdDisplay"
    );

const empNameDisplay =
    document.getElementById(
        "empNameDisplay"
    );


/* ==========================================
   PAYSLIP DISPLAY
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

const payDailyRate =
    document.getElementById(
        "payDailyRate"
    );

const payTotalDays =
    document.getElementById(
        "payTotalDays"
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

const paySick =
    document.getElementById(
        "paySick"
    );

const payVacation =
    document.getElementById(
        "payVacation"
    );

const payBirthday =
    document.getElementById(
        "payBirthday"
    );

const payMaternity =
    document.getElementById(
        "payMaternity"
    );

const payPaternity =
    document.getElementById(
        "payPaternity"
    );

const payAllowance =
    document.getElementById(
        "payAllowance"
    );

const payGross =
    document.getElementById(
        "payGross"
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
   HELPERS
========================================== */

function num(value){

    const result =
        Number(
            value ?? 0
        );

    return Number.isFinite(result)
        ? result
        : 0;

}


function text(value){

    return String(
        value ?? ""
    ).trim();

}


function money(value){

    return num(
        value
    ).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
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
   GET TODAY
========================================== */

function getToday(){

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
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
   FORMAT HOLIDAY
========================================== */

function formatHoliday(
    value
){

    switch(
        text(value).toLowerCase()
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
   LOAD AUTO PAYROLL
========================================== */

async function loadAutoPayroll(){

    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "autoPayroll"
                )
            );


        autoPayrollRecords = [];


        snapshot.forEach(
            docSnap => {

                autoPayrollRecords.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        /*
         * Latest date first
         */

        autoPayrollRecords.sort(
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
                    dateA !== dateB
                ){

                    return dateB.localeCompare(
                        dateA
                    );

                }


                return (
                    num(
                        b.createdAt
                    )
                    -
                    num(
                        a.createdAt
                    )
                );

            }
        );


        filteredRecords =
            [
                ...autoPayrollRecords
            ];


        renderAdminPayslip(
            filteredRecords
        );


    }catch(error){

        console.error(
            "Load Auto Payroll Error:",
            error
        );


        if(
            adminPayslipBody
        ){

            adminPayslipBody.innerHTML = `

<tr>

<td
    colspan="13"
    style="
        text-align:center;
        padding:30px;
        color:#d71920;
        font-weight:800;
    ">

Unable to load Auto Payroll records.

<br><br>

${escapeHTML(
    error.message
)}

</td>

</tr>

`;

        }

    }

}


/* ==========================================
   RENDER ADMIN PAYSLIP
========================================== */

function renderAdminPayslip(
    records
){

    if(
        !adminPayslipBody
    ){

        return;

    }


    adminPayslipBody.innerHTML =
        "";


    /*
     * SUMMARY
     */

    let grossTotal =
        0;

    let netTotal =
        0;


    records.forEach(
        record => {

            grossTotal +=
                num(
                    record.gross
                );

            netTotal +=
                num(
                    record.net
                );

        }
    );


    if(totalRecords){

        totalRecords.textContent =
            records.length;

    }


    if(totalGross){

        totalGross.textContent =
            money(
                grossTotal
            );

    }


    if(totalNet){

        totalNet.textContent =
            money(
                netTotal
            );

    }


    /*
     * EMPTY
     */

    if(
        records.length === 0
    ){

        adminPayslipBody.innerHTML = `

<tr>

<td
    colspan="13"
    style="
        text-align:center;
        padding:30px;
        font-weight:800;
    ">

NO AUTO PAYROLL PAYSLIPS FOUND

</td>

</tr>

`;

        return;

    }


    /*
     * ROWS
     */

    records.forEach(
        record => {

            const row =
                document.createElement(
                    "tr"
                );


            const employeeId =
                record.employeeId
                ||
                record.employeeid
                ||
                "-";


            const employeeName =
                record.employeeName
                ||
                "-";


            const rate =
                num(
                    record.hourlyRate
                );


            const regularHours =
                num(
                    record.regularHours
                );


            const overtimeHours =
                num(
                    record.overtimeHours
                );


            const holidayType =
                formatHoliday(
                    record.holidayType
                );


            const holidayHours =
                num(
                    record.holidayHours
                );


            const nightHours =
                num(
                    record.nightHours
                );


            const gross =
                num(
                    record.gross
                );


            const deductions =
                num(
                    record.deductions
                );


            const net =
                num(
                    record.net
                );


            row.innerHTML = `

<td>

${escapeHTML(
    employeeId
)}

</td>


<td>

${escapeHTML(
    employeeName
)}

</td>


<td>

${escapeHTML(
    record.date || "-"
)}

</td>


<td>

₱ ${money(
    rate
)}

</td>


<td>

${regularHours.toFixed(2)}

</td>


<td>

${overtimeHours.toFixed(2)}

</td>


<td>

${escapeHTML(
    holidayType
)}

</td>


<td>

${holidayHours.toFixed(2)}

</td>


<td>

${nightHours.toFixed(2)}

</td>


<td>

<strong>

₱ ${money(
    gross
)}

</strong>

</td>


<td>

₱ ${money(
    deductions
)}

</td>


<td>

<strong>

₱ ${money(
    net
)}

</strong>

</td>


<td>

<button
    type="button"
    class="view-payslip-btn"
    onclick="viewPayslip('${escapeHTML(record.id)}')">

<span class="material-icons">
visibility
</span>

VIEW

</button>

</td>

`;


            adminPayslipBody.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   SEARCH / FILTER
========================================== */

window.applyFilter =
function(){

    const search =
        text(
            searchEmployee?.value
        ).toLowerCase();


    const date =
        text(
            filterDate?.value
        );


    filteredRecords =
        autoPayrollRecords.filter(
            record => {

                const employeeId =
                    text(
                        record.employeeId
                        ||
                        record.employeeid
                    ).toLowerCase();


                const employeeName =
                    text(
                        record.employeeName
                    ).toLowerCase();


                const recordDate =
                    text(
                        record.date
                    );


                const matchesSearch =
                    !search
                    ||
                    employeeId.includes(
                        search
                    )
                    ||
                    employeeName.includes(
                        search
                    );


                const matchesDate =
                    !date
                    ||
                    recordDate === date;


                return (
                    matchesSearch &&
                    matchesDate
                );

            }
        );


    renderAdminPayslip(
        filteredRecords
    );

};


/* ==========================================
   SHOW ALL
========================================== */

window.showAllPayslips =
function(){

    if(searchEmployee){

        searchEmployee.value =
            "";

    }


    if(filterDate){

        filterDate.value =
            "";

    }


    filteredRecords =
        [
            ...autoPayrollRecords
        ];


    renderAdminPayslip(
        filteredRecords
    );

};


/* ==========================================
   VIEW PAYSLIP
========================================== */

window.viewPayslip =
function(
    id
){

    const record =
        autoPayrollRecords.find(
            item =>
                item.id === id
        );


    if(
        !record
    ){

        alert(
            "Payslip record not found."
        );

        return;

    }


    selectedRecord =
        record;


    /*
     * Employee section
     */

    if(empIdDisplay){

        empIdDisplay.textContent =
            record.employeeId
            ||
            "-";

    }


    if(empNameDisplay){

        empNameDisplay.textContent =
            record.employeeName
            ||
            "-";

    }


    /*
     * PAYSLIP HEADER
     */

    if(payEmpId){

        payEmpId.textContent =
            record.employeeId
            ||
            "-";

    }


    if(payEmp){

        payEmp.textContent =
            record.employeeName
            ||
            "-";

    }


    if(payDate){

        payDate.textContent =
            record.date
            ||
            "-";

    }


    /*
     * IMPORTANT:
     *
     * This is now HOURLY RATE.
     *
     * The old payslip said DAILY RATE.
     * We cannot change the HTML label
     * from JavaScript reliably, so we
     * update the visible label.
     */

    if(payDailyRate){

        payDailyRate.textContent =
            money(
                record.hourlyRate
            );

    }


    /*
     * Total days is no longer used.
     *
     * Display total regular hours
     * instead.
     */

    if(payTotalDays){

        const totalHours =
            num(
                record.regularHours
            )
            +
            num(
                record.overtimeHours
            )
            +
            num(
                record.holidayHours
            )
            +
            num(
                record.nightHours
            );


        payTotalDays.textContent =
            totalHours.toFixed(2);

    }


    /*
     * ======================================
     * EARNINGS
     * ======================================
     */

    /*
     * Basic / Regular Pay
     */

    if(payBasic){

        payBasic.textContent =
            money(
                record.regularPay
            );

    }


    /*
     * Overtime
     */

    if(payOvertime){

        payOvertime.textContent =
            money(
                record.overtimePay
            );

    }


    /*
     * Holiday
     */

    if(payHoliday){

        payHoliday.textContent =
            money(
                record.holidayPay
            );

    }


    /*
     * Old leave fields
     *
     * Auto Payroll does not use these.
     */

    if(paySick){

        paySick.textContent =
            "0.00";

    }


    if(payVacation){

        payVacation.textContent =
            "0.00";

    }


    if(payBirthday){

        payBirthday.textContent =
            "0.00";

    }


    if(payMaternity){

        payMaternity.textContent =
            "0.00";

    }


    if(payPaternity){

        payPaternity.textContent =
            "0.00";

    }


    /*
     * Allowance
     *
     * Auto Payroll does not currently
     * have allowance.
     */

    if(payAllowance){

        payAllowance.textContent =
            "0.00";

    }


    /*
     * GROSS
     */

    if(payGross){

        payGross.textContent =
            money(
                record.gross
            );

    }


    /*
     * ======================================
     * DEDUCTIONS
     * ======================================
     */

    if(paySSS){

        paySSS.textContent =
            money(
                record.sss
            );

    }


    if(payPhilhealth){

        payPhilhealth.textContent =
            money(
                record.philhealth
            );

    }


    if(payPagibig){

        payPagibig.textContent =
            money(
                record.pagibig
            );

    }


    if(payHealth){

        payHealth.textContent =
            money(
                record.healthcard
            );

    }


    if(payOther){

        payOther.textContent =
            money(
                record.others
            );

    }


    if(payDeduction){

        payDeduction.textContent =
            money(
                record.deductions
            );

    }


    /*
     * NET
     */

    if(payNet){

        payNet.textContent =
            money(
                record.net
            );

    }


    /*
     * Show payslip
     */

    if(employeeSection){

        employeeSection.style.display =
            "none";

    }


    if(payslipArea){

        payslipArea.style.display =
            "block";

        payslipArea.scrollIntoView({

            behavior:"smooth",

            block:"start"

        });

    }

};


/* ==========================================
   LOAD PAYSLIP BUTTON
========================================== */

window.loadPayslip =
function(){

    if(
        selectedRecord
    ){

        viewPayslip(
            selectedRecord.id
        );

        return;

    }


    alert(
        "Please click VIEW on a payslip record first."
    );

};


/* ==========================================
   CLOSE PAYSLIP
========================================== */

window.closePayslip =
function(){

    selectedRecord =
        null;


    if(payslipArea){

        payslipArea.style.display =
            "none";

    }


    if(employeeSection){

        employeeSection.style.display =
            "block";

    }

};


/* ==========================================
   PRINT SINGLE PAYSLIP
========================================== */

window.printPayslip =
function(){

    if(
        !selectedRecord
    ){

        alert(
            "Please select a payslip first."
        );

        return;

    }


    /*
     * Show only payslip during print.
     */

    document.body.classList.add(
        "printing-payslip"
    );


    window.print();


    setTimeout(
        function(){

            document.body.classList.remove(
                "printing-payslip"
            );

        },
        1000
    );

};


/* ==========================================
   PRINT ALL PAYSLIPS
   4 PAYSLIPS PER BOND PAPER
========================================== */

window.printAllPayslips = function(){

    if(
        !autoPayrollRecords ||
        autoPayrollRecords.length === 0
    ){

        alert(
            "No payslip records available to print."
        );

        return;

    }


    const oldPrint =
        document.getElementById(
            "printAllContainer"
        );


    if(oldPrint){

        oldPrint.remove();

    }


    const container =
        document.createElement(
            "div"
        );


    container.id =
        "printAllContainer";


    autoPayrollRecords.forEach(
        record => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "print-payslip";


            const regularPay =
                num(
                    record.regularPay
                );


            const overtimePay =
                num(
                    record.overtimePay
                );


            const holidayPay =
                num(
                    record.holidayPay
                );


            const nightPay =
                num(
                    record.nightPay
                );


            const gross =
                num(
                    record.gross
                );


            const deductions =
                num(
                    record.deductions
                );


            const net =
                num(
                    record.net
                );


            const totalHours =
                num(
                    record.regularHours
                ) +

                num(
                    record.overtimeHours
                ) +

                num(
                    record.holidayHours
                ) +

                num(
                    record.nightHours
                );


            card.innerHTML = `

                <div class="mini-payslip">


                    <!-- HEADER -->

                    <div class="mini-header">

                        <div class="mini-company">

                            <img
                                src="../assets/images/logo.png"
                                alt="PAPPRITO">

                            <div>

                                <strong>
                                    PAPPRITO
                                </strong>

                                <span>
                                    OFFICIAL EMPLOYEE PAYSLIP
                                </span>

                            </div>

                        </div>

                    </div>


                    <!-- EMPLOYEE INFO -->

                    <div class="mini-info">

                        <div>

                            <b>
                                EMPLOYEE ID
                            </b>

                            <span>
                                ${escapeHTML(
                                    record.employeeId ||
                                    "-"
                                )}
                            </span>

                        </div>


                        <div>

                            <b>
                                EMPLOYEE
                            </b>

                            <span>
                                ${escapeHTML(
                                    record.employeeName ||
                                    "-"
                                )}
                            </span>

                        </div>


                        <div>

                            <b>
                                DATE
                            </b>

                            <span>
                                ${escapeHTML(
                                    record.date ||
                                    "-"
                                )}
                            </span>

                        </div>


                        <div>

                            <b>
                                HOURLY RATE
                            </b>

                            <span>
                                ₱ ${money(
                                    record.hourlyRate
                                )}
                            </span>

                        </div>


                        <div>

                            <b>
                                TOTAL HOURS
                            </b>

                            <span>
                                ${totalHours.toFixed(2)}
                            </span>

                        </div>

                    </div>


                    <!-- EARNINGS -->

                    <div class="mini-section-title">

                        EARNINGS

                    </div>


                    <table class="mini-table">

                        <tr>

                            <td>
                                Regular Pay
                            </td>

                            <td>
                                ₱ ${money(
                                    regularPay
                                )}
                            </td>

                        </tr>


                        <tr>

                            <td>
                                Overtime
                            </td>

                            <td>
                                ₱ ${money(
                                    overtimePay
                                )}
                            </td>

                        </tr>


                        <tr>

                            <td>
                                Holiday Pay
                            </td>

                            <td>
                                ₱ ${money(
                                    holidayPay
                                )}
                            </td>

                        </tr>


                        <tr>

                            <td>
                                Night Differential
                            </td>

                            <td>
                                ₱ ${money(
                                    nightPay
                                )}
                            </td>

                        </tr>


                        <tr class="total-row">

                            <td>
                                TOTAL GROSS
                            </td>

                            <td>
                                ₱ ${money(
                                    gross
                                )}
                            </td>

                        </tr>

                    </table>


                    <!-- DEDUCTIONS -->

                    <div class="mini-section-title">

                        DEDUCTIONS

                    </div>


                    <table class="mini-table">

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
                                Others
                            </td>

                            <td>
                                ₱ ${money(
                                    record.others
                                )}
                            </td>

                        </tr>


                        <tr class="total-row">

                            <td>
                                TOTAL DEDUCTION
                            </td>

                            <td>
                                ₱ ${money(
                                    deductions
                                )}
                            </td>

                        </tr>

                    </table>


                    <!-- NET PAY -->

                    <div class="mini-netpay">

                        <span>
                            NET PAY
                        </span>

                        <strong>
                            ₱ ${money(
                                net
                            )}
                        </strong>

                    </div>


                    <!-- SIGNATURE -->

                    <div class="mini-signature">

                        <div>
                            <span></span>
                            HR
                        </div>

                        <div>
                            <span></span>
                            EMPLOYEE
                        </div>

                    </div>


                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    document.body.appendChild(
        container
    );


    /*
     * Allow browser to render
     * print container first.
     */

    setTimeout(
        function(){

            window.print();

        },
        300
    );

};
/* ==========================================
   BACK TO DASHBOARD
========================================== */

window.headerAction =
function(){

    /*
     * If payslip is open,
     * first close it.
     */

    if(
        payslipArea &&
        payslipArea.style.display ===
        "block"
    ){

        closePayslip();

        return;

    }


    /*
     * Dashboard path
     */

    window.location.href =
        "dashboard.html";

};


/* ==========================================
   SEARCH ENTER
========================================== */

if(searchEmployee){

    searchEmployee.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Enter"
            ){

                event.preventDefault();

                applyFilter();

            }

        }
    );

}


/* ==========================================
   DATE FILTER CHANGE
========================================== */

if(filterDate){

    filterDate.addEventListener(
        "change",
        function(){

            applyFilter();

        }
    );

}


/* ==========================================
   INITIAL UI
========================================== */

if(payslipArea){

    payslipArea.style.display =
        "none";

}


/* ==========================================
   INITIAL DATE
========================================== */

if(filterDate){

    /*
     * Do not automatically filter.
     * Show all Auto Payroll records.
     */

    filterDate.value =
        "";

}


/* ==========================================
   START
========================================== */

async function initializePayslip(){

    await loadAutoPayroll();

    console.log(
        "PAPPRITO HRIS Admin Payslip Ready - Auto Payroll Based"
    );

}


initializePayslip();
