/* ==========================================
   PAPPRITO HRIS
   SYSTEM SETTINGS
   ATTENDANCE SETTINGS
========================================== */

import { db } from "../database/firebase-config.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   FIRESTORE
========================================== */

const SETTINGS_COLLECTION = "systemSettings";
const ATTENDANCE_DOCUMENT = "attendance";


/* ==========================================
   DEFAULT SETTINGS
========================================== */

const DEFAULT_ATTENDANCE_SETTINGS = {

    enabled: true,

    openingTime: "08:00",

    closingTime: "17:00",

    breakStart: "12:00",

    breakEnd: "13:00",

    gracePeriod: 15,

    lateThreshold: 15,

    undertimeThreshold: 15

};


/* ==========================================
   HELPERS
========================================== */

function el(id) {

    return document.getElementById(id);

}


function numberValue(value, fallback) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


function attendanceRef() {

    return doc(
        db,
        SETTINGS_COLLECTION,
        ATTENDANCE_DOCUMENT
    );

}


/* ==========================================
   ELEMENTS
========================================== */

const attendanceEnabled =
    el("attendanceEnabled");

const openingTime =
    el("openingTime");

const closingTime =
    el("closingTime");

const breakStart =
    el("breakStart");

const breakEnd =
    el("breakEnd");

const gracePeriod =
    el("gracePeriod");

const lateThreshold =
    el("lateThreshold");

const undertimeThreshold =
    el("undertimeThreshold");

const attendanceStatus =
    el("attendanceStatus");

const lastSavedText =
    el("lastSavedText");

const attendanceSaveBtn =
    el("attendanceSaveBtn");

const attendanceResetBtn =
    el("attendanceResetBtn");

const dashboardBtn =
    el("dashboardBtn");


/* ==========================================
   STATUS
========================================== */

function setStatus(text, type = "") {

    if (!attendanceStatus) return;

    attendanceStatus.textContent = text;

    attendanceStatus.classList.remove(
        "status-success",
        "status-saving",
        "status-error"
    );

    if (type === "success") {

        attendanceStatus.classList.add(
            "status-success"
        );

    }

    if (type === "saving") {

        attendanceStatus.classList.add(
            "status-saving"
        );

    }

    if (type === "error") {

        attendanceStatus.classList.add(
            "status-error"
        );

    }

}


/* ==========================================
   APPLY
========================================== */

function applyAttendanceSettings(settings) {

    const data = {

        ...DEFAULT_ATTENDANCE_SETTINGS,

        ...(settings || {})

    };


    if (attendanceEnabled) {

        attendanceEnabled.checked =
            Boolean(data.enabled);

    }


    if (openingTime) {

        openingTime.value =
            data.openingTime;

    }


    if (closingTime) {

        closingTime.value =
            data.closingTime;

    }


    if (breakStart) {

        breakStart.value =
            data.breakStart;

    }


    if (breakEnd) {

        breakEnd.value =
            data.breakEnd;

    }


    if (gracePeriod) {

        gracePeriod.value =
            numberValue(
                data.gracePeriod,
                15
            );

    }


    if (lateThreshold) {

        lateThreshold.value =
            numberValue(
                data.lateThreshold,
                15
            );

    }


    if (undertimeThreshold) {

        undertimeThreshold.value =
            numberValue(
                data.undertimeThreshold,
                15
            );

    }

}


/* ==========================================
   FORM DATA
========================================== */

function getAttendanceData() {

    return {

        enabled:
            attendanceEnabled
                ? attendanceEnabled.checked
                : true,

        openingTime:
            openingTime?.value ||
            "08:00",

        closingTime:
            closingTime?.value ||
            "17:00",

        breakStart:
            breakStart?.value ||
            "12:00",

        breakEnd:
            breakEnd?.value ||
            "13:00",

        gracePeriod:
            numberValue(
                gracePeriod?.value,
                15
            ),

        lateThreshold:
            numberValue(
                lateThreshold?.value,
                15
            ),

        undertimeThreshold:
            numberValue(
                undertimeThreshold?.value,
                15
            )

    };

}


/* ==========================================
   VALIDATION
========================================== */

function validateAttendance(data) {

    if (
        !data.openingTime ||
        !data.closingTime
    ) {

        return "Opening and Closing time are required.";

    }


    if (
        data.gracePeriod < 0 ||
        data.lateThreshold < 0 ||
        data.undertimeThreshold < 0
    ) {

        return "Attendance minutes cannot be negative.";

    }


    return null;

}


/* ==========================================
   LOAD
========================================== */

async function loadAttendanceSettings() {

    setStatus(
        "LOADING...",
        "saving"
    );


    try {

        const snapshot =
            await getDoc(
                attendanceRef()
            );


        if (snapshot.exists()) {

            const data =
                snapshot.data();


            applyAttendanceSettings(
                data
            );


            let savedText =
                "Attendance settings loaded.";


            if (data.updatedAt) {

                try {

                    const date =
                        data.updatedAt.toDate();

                    savedText =
                        "Last saved: " +
                        date.toLocaleString();

                } catch (error) {

                    console.warn(
                        "Unable to format saved date.",
                        error
                    );

                }

            }


            if (lastSavedText) {

                lastSavedText.textContent =
                    savedText;

            }


            setStatus(
                "SAVED",
                "success"
            );

        } else {

            applyAttendanceSettings(
                DEFAULT_ATTENDANCE_SETTINGS
            );


            if (lastSavedText) {

                lastSavedText.textContent =
                    "No attendance settings saved yet. Default values are being used.";

            }


            setStatus(
                "DEFAULT"
            );

        }

    } catch (error) {

        console.error(
            "Attendance Settings Load Error:",
            error
        );


        applyAttendanceSettings(
            DEFAULT_ATTENDANCE_SETTINGS
        );


        setStatus(
            "LOAD ERROR",
            "error"
        );


        if (lastSavedText) {

            lastSavedText.textContent =
                "Firebase error: " +
                error.message;

        }

    }

}


/* ==========================================
   SAVE
========================================== */

async function saveAttendanceSettings() {

    const data =
        getAttendanceData();


    const validation =
        validateAttendance(data);


    if (validation) {

        alert(validation);

        return;

    }


    setStatus(
        "SAVING...",
        "saving"
    );


    try {

        await setDoc(

            attendanceRef(),

            {

                ...data,

                updatedAt:
                    serverTimestamp()

            },

            {

                merge: true

            }

        );


        if (lastSavedText) {

            lastSavedText.textContent =
                "Attendance settings saved successfully.";

        }


        setStatus(
            "SAVED",
            "success"
        );


    } catch (error) {

        console.error(
            "Attendance Settings Save Error:",
            error
        );


        setStatus(
            "SAVE ERROR",
            "error"
        );


        if (lastSavedText) {

            lastSavedText.textContent =
                "Unable to save Attendance Settings.";

        }


        alert(
            "Unable to save Attendance Settings.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   CHANGE DETECTION
========================================== */

function attendanceChanged() {

    setStatus("UNSAVED");

    if (lastSavedText) {

        lastSavedText.textContent =
            "You have unsaved attendance changes.";

    }

}


/* ==========================================
   NAVIGATION
========================================== */

function showSettingsSection(section) {

    const sections =
        document.querySelectorAll(
            ".settings-section"
        );


    const navItems =
        document.querySelectorAll(
            ".settings-nav-item"
        );


    sections.forEach(item => {

        item.classList.remove("active");

    });


    navItems.forEach(item => {

        item.classList.remove("active");

    });


    const target =
        document.getElementById(
            section + "Settings"
        );


    if (target) {

        target.classList.add("active");

    }


    const nav =
        document.querySelector(
            `.settings-nav-item[data-section="${section}"]`
        );


    if (nav) {

        nav.classList.add("active");

    }


    /*
     * When opening Payroll,
     * make sure its settings are loaded.
     */

    if (
        section === "payroll" &&
        typeof window.loadPayrollSettings ===
        "function"
    ) {

        window.loadPayrollSettings();

    }

}


/* ==========================================
   GLOBAL FUNCTIONS
========================================== */

window.showSettingsSection =
    showSettingsSection;


window.loadAttendanceSettings =
    loadAttendanceSettings;


window.saveAttendanceSettings =
    saveAttendanceSettings;


/* ==========================================
   EVENTS
========================================== */

document
    .querySelectorAll(".settings-nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showSettingsSection(
                    button.dataset.section
                );

            }
        );

    });


if (attendanceSaveBtn) {

    attendanceSaveBtn.addEventListener(
        "click",
        saveAttendanceSettings
    );

}


if (attendanceResetBtn) {

    attendanceResetBtn.addEventListener(
        "click",
        loadAttendanceSettings
    );

}


if (dashboardBtn) {

    dashboardBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "../dashboard.html";

        }
    );

}


/* ==========================================
   CHANGE EVENTS
========================================== */

[
    attendanceEnabled,
    openingTime,
    closingTime,
    breakStart,
    breakEnd,
    gracePeriod,
    lateThreshold,
    undertimeThreshold

].forEach(input => {

    if (!input) return;

    input.addEventListener(
        "change",
        attendanceChanged
    );

    input.addEventListener(
        "input",
        attendanceChanged
    );

});


/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAttendanceSettings();

    }
);
/* ==========================================
   PAPPRITO HRIS
   PAYROLL SETTINGS
========================================== */

import { db } from "../database/firebase-config.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   FIRESTORE
========================================== */

const SETTINGS_COLLECTION =
    "systemSettings";

const PAYROLL_DOCUMENT =
    "payroll";


/* ==========================================
   DEFAULT SETTINGS
========================================== */

const DEFAULT_PAYROLL_SETTINGS = {

    enabled: true,

    payrollFrequency:
        "semi-monthly",

    payrollYear:
        new Date().getFullYear(),

    firstCutoff:
        15,

    secondCutoff:
        30,

    firstPayDate:
        15,

    secondPayDate:
        30,

    workingDaysPerMonth:
        26,

    workingHoursPerDay:
        8,

    dailyRateDivisor:
        26,

    hourlyRateDivisor:
        8,

    payrollRounding:
        "2",

    regularOtRate:
        1.25,

    restDayOtRate:
        1.30,

    specialHolidayRate:
        1.30,

    regularHolidayRate:
        2.00,

    nightDifferentialRate:
        10,

    minimumOtMinutes:
        30,

    lateDeductionEnabled:
        "yes",

    undertimeDeductionEnabled:
        "yes",

    absenceDeductionEnabled:
        "yes",

    housingAllowanceEnabled:
        "no",

    transportAllowanceEnabled:
        "no",

    foodAllowanceEnabled:
        "no",

    communicationAllowanceEnabled:
        "no",

    otherAllowanceEnabled:
        "no",

    sssEnabled:
        "no",

    philhealthEnabled:
        "no",

    pagibigEnabled:
        "no",

    withholdingTaxEnabled:
        "no",

    loanDeductionEnabled:
        "no",

    cashAdvanceEnabled:
        "no",

    otherDeductionEnabled:
        "no",

    payslipCompanyName:
        "",

    payslipNumberFormat:
        "PS-{YYYY}-{####}",

    showPayslipPhoto:
        "no",

    showGovernmentNumbers:
        "no",

    showBankInformation:
        "no",

    payrollReviewRequired:
        "yes",

    lockReleasedPayroll:
        "yes"

};


/* ==========================================
   HELPERS
========================================== */

function el(id) {

    return document.getElementById(id);

}


function numberValue(
    value,
    fallback
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


function payrollRef() {

    return doc(
        db,
        SETTINGS_COLLECTION,
        PAYROLL_DOCUMENT
    );

}


/* ==========================================
   ELEMENTS
========================================== */

const payrollEnabled =
    el("payrollEnabled");

const payrollFrequency =
    el("payrollFrequency");

const payrollYear =
    el("payrollYear");

const firstCutoff =
    el("firstCutoff");

const secondCutoff =
    el("secondCutoff");

const firstPayDate =
    el("firstPayDate");

const secondPayDate =
    el("secondPayDate");

const workingDaysPerMonth =
    el("workingDaysPerMonth");

const workingHoursPerDay =
    el("workingHoursPerDay");

const dailyRateDivisor =
    el("dailyRateDivisor");

const hourlyRateDivisor =
    el("hourlyRateDivisor");

const payrollRounding =
    el("payrollRounding");

const regularOtRate =
    el("regularOtRate");

const restDayOtRate =
    el("restDayOtRate");

const specialHolidayRate =
    el("specialHolidayRate");

const regularHolidayRate =
    el("regularHolidayRate");

const nightDifferentialRate =
    el("nightDifferentialRate");

const minimumOtMinutes =
    el("minimumOtMinutes");

const lateDeductionEnabled =
    el("lateDeductionEnabled");

const undertimeDeductionEnabled =
    el("undertimeDeductionEnabled");

const absenceDeductionEnabled =
    el("absenceDeductionEnabled");

const housingAllowanceEnabled =
    el("housingAllowanceEnabled");

const transportAllowanceEnabled =
    el("transportAllowanceEnabled");

const foodAllowanceEnabled =
    el("foodAllowanceEnabled");

const communicationAllowanceEnabled =
    el("communicationAllowanceEnabled");

const otherAllowanceEnabled =
    el("otherAllowanceEnabled");

const sssEnabled =
    el("sssEnabled");

const philhealthEnabled =
    el("philhealthEnabled");

const pagibigEnabled =
    el("pagibigEnabled");

const withholdingTaxEnabled =
    el("withholdingTaxEnabled");

const loanDeductionEnabled =
    el("loanDeductionEnabled");

const cashAdvanceEnabled =
    el("cashAdvanceEnabled");

const otherDeductionEnabled =
    el("otherDeductionEnabled");

const payslipCompanyName =
    el("payslipCompanyName");

const payslipNumberFormat =
    el("payslipNumberFormat");

const showPayslipPhoto =
    el("showPayslipPhoto");

const showGovernmentNumbers =
    el("showGovernmentNumbers");

const showBankInformation =
    el("showBankInformation");

const payrollReviewRequired =
    el("payrollReviewRequired");

const lockReleasedPayroll =
    el("lockReleasedPayroll");

const payrollStatus =
    el("payrollStatus");

const payrollLastSavedText =
    el("payrollLastSavedText");

const payrollSaveBtn =
    el("payrollSaveBtn");

const payrollResetBtn =
    el("payrollResetBtn");


/* ==========================================
   STATUS
========================================== */

function setStatus(
    text,
    type = ""
) {

    if (!payrollStatus) return;


    payrollStatus.textContent =
        text;


    payrollStatus.classList.remove(
        "status-success",
        "status-saving",
        "status-error"
    );


    if (type === "success") {

        payrollStatus.classList.add(
            "status-success"
        );

    }


    if (type === "saving") {

        payrollStatus.classList.add(
            "status-saving"
        );

    }


    if (type === "error") {

        payrollStatus.classList.add(
            "status-error"
        );

    }

}


/* ==========================================
   APPLY SETTINGS
========================================== */

function applySettings(settings) {

    const data = {

        ...DEFAULT_PAYROLL_SETTINGS,

        ...(settings || {})

    };


    if (payrollEnabled)
        payrollEnabled.checked =
            Boolean(data.enabled);


    if (payrollFrequency)
        payrollFrequency.value =
            data.payrollFrequency;


    if (payrollYear)
        payrollYear.value =
            numberValue(
                data.payrollYear,
                DEFAULT_PAYROLL_SETTINGS.payrollYear
            );


    if (firstCutoff)
        firstCutoff.value =
            numberValue(
                data.firstCutoff,
                15
            );


    if (secondCutoff)
        secondCutoff.value =
            numberValue(
                data.secondCutoff,
                30
            );


    if (firstPayDate)
        firstPayDate.value =
            numberValue(
                data.firstPayDate,
                15
            );


    if (secondPayDate)
        secondPayDate.value =
            numberValue(
                data.secondPayDate,
                30
            );


    if (workingDaysPerMonth)
        workingDaysPerMonth.value =
            numberValue(
                data.workingDaysPerMonth,
                26
            );


    if (workingHoursPerDay)
        workingHoursPerDay.value =
            numberValue(
                data.workingHoursPerDay,
                8
            );


    if (dailyRateDivisor)
        dailyRateDivisor.value =
            numberValue(
                data.dailyRateDivisor,
                26
            );


    if (hourlyRateDivisor)
        hourlyRateDivisor.value =
            numberValue(
                data.hourlyRateDivisor,
                8
            );


    if (payrollRounding)
        payrollRounding.value =
            data.payrollRounding;


    if (regularOtRate)
        regularOtRate.value =
            numberValue(
                data.regularOtRate,
                1.25
            );


    if (restDayOtRate)
        restDayOtRate.value =
            numberValue(
                data.restDayOtRate,
                1.30
            );


    if (specialHolidayRate)
        specialHolidayRate.value =
            numberValue(
                data.specialHolidayRate,
                1.30
            );


    if (regularHolidayRate)
        regularHolidayRate.value =
            numberValue(
                data.regularHolidayRate,
                2
            );


    if (nightDifferentialRate)
        nightDifferentialRate.value =
            numberValue(
                data.nightDifferentialRate,
                10
            );


    if (minimumOtMinutes)
        minimumOtMinutes.value =
            numberValue(
                data.minimumOtMinutes,
                30
            );


    if (lateDeductionEnabled)
        lateDeductionEnabled.value =
            data.lateDeductionEnabled;


    if (undertimeDeductionEnabled)
        undertimeDeductionEnabled.value =
            data.undertimeDeductionEnabled;


    if (absenceDeductionEnabled)
        absenceDeductionEnabled.value =
            data.absenceDeductionEnabled;


    if (housingAllowanceEnabled)
        housingAllowanceEnabled.value =
            data.housingAllowanceEnabled;


    if (transportAllowanceEnabled)
        transportAllowanceEnabled.value =
            data.transportAllowanceEnabled;


    if (foodAllowanceEnabled)
        foodAllowanceEnabled.value =
            data.foodAllowanceEnabled;


    if (communicationAllowanceEnabled)
        communicationAllowanceEnabled.value =
            data.communicationAllowanceEnabled;


    if (otherAllowanceEnabled)
        otherAllowanceEnabled.value =
            data.otherAllowanceEnabled;


    if (sssEnabled)
        sssEnabled.value =
            data.sssEnabled;


    if (philhealthEnabled)
        philhealthEnabled.value =
            data.philhealthEnabled;


    if (pagibigEnabled)
        pagibigEnabled.value =
            data.pagibigEnabled;


    if (withholdingTaxEnabled)
        withholdingTaxEnabled.value =
            data.withholdingTaxEnabled;


    if (loanDeductionEnabled)
        loanDeductionEnabled.value =
            data.loanDeductionEnabled;


    if (cashAdvanceEnabled)
        cashAdvanceEnabled.value =
            data.cashAdvanceEnabled;


    if (otherDeductionEnabled)
        otherDeductionEnabled.value =
            data.otherDeductionEnabled;


    if (payslipCompanyName)
        payslipCompanyName.value =
            data.payslipCompanyName || "";


    if (payslipNumberFormat)
        payslipNumberFormat.value =
            data.payslipNumberFormat;


    if (showPayslipPhoto)
        showPayslipPhoto.value =
            data.showPayslipPhoto;


    if (showGovernmentNumbers)
        showGovernmentNumbers.value =
            data.showGovernmentNumbers;


    if (showBankInformation)
        showBankInformation.value =
            data.showBankInformation;


    if (payrollReviewRequired)
        payrollReviewRequired.value =
            data.payrollReviewRequired;


    if (lockReleasedPayroll)
        lockReleasedPayroll.value =
            data.lockReleasedPayroll;

}


/* ==========================================
   FORM DATA
========================================== */

function getFormData() {

    return {

        enabled:
            payrollEnabled
                ? payrollEnabled.checked
                : true,

        payrollFrequency:
            payrollFrequency?.value ||
            "semi-monthly",

        payrollYear:
            numberValue(
                payrollYear?.value,
                DEFAULT_PAYROLL_SETTINGS.payrollYear
            ),

        firstCutoff:
            numberValue(
                firstCutoff?.value,
                15
            ),

        secondCutoff:
            numberValue(
                secondCutoff?.value,
                30
            ),

        firstPayDate:
            numberValue(
                firstPayDate?.value,
                15
            ),

        secondPayDate:
            numberValue(
                secondPayDate?.value,
                30
            ),

        workingDaysPerMonth:
            numberValue(
                workingDaysPerMonth?.value,
                26
            ),

        workingHoursPerDay:
            numberValue(
                workingHoursPerDay?.value,
                8
            ),

        dailyRateDivisor:
            numberValue(
                dailyRateDivisor?.value,
                26
            ),

        hourlyRateDivisor:
            numberValue(
                hourlyRateDivisor?.value,
                8
            ),

        payrollRounding:
            payrollRounding?.value ||
            "2",

        regularOtRate:
            numberValue(
                regularOtRate?.value,
                1.25
            ),

        restDayOtRate:
            numberValue(
                restDayOtRate?.value,
                1.30
            ),

        specialHolidayRate:
            numberValue(
                specialHolidayRate?.value,
                1.30
            ),

        regularHolidayRate:
            numberValue(
                regularHolidayRate?.value,
                2
            ),

        nightDifferentialRate:
            numberValue(
                nightDifferentialRate?.value,
                10
            ),

        minimumOtMinutes:
            numberValue(
                minimumOtMinutes?.value,
                30
            ),

        lateDeductionEnabled:
            lateDeductionEnabled?.value ||
            "yes",

        undertimeDeductionEnabled:
            undertimeDeductionEnabled?.value ||
            "yes",

        absenceDeductionEnabled:
            absenceDeductionEnabled?.value ||
            "yes",

        housingAllowanceEnabled:
            housingAllowanceEnabled?.value ||
            "no",

        transportAllowanceEnabled:
            transportAllowanceEnabled?.value ||
            "no",

        foodAllowanceEnabled:
            foodAllowanceEnabled?.value ||
            "no",

        communicationAllowanceEnabled:
            communicationAllowanceEnabled?.value ||
            "no",

        otherAllowanceEnabled:
            otherAllowanceEnabled?.value ||
            "no",

        sssEnabled:
            sssEnabled?.value ||
            "no",

        philhealthEnabled:
            philhealthEnabled?.value ||
            "no",

        pagibigEnabled:
            pagibigEnabled?.value ||
            "no",

        withholdingTaxEnabled:
            withholdingTaxEnabled?.value ||
            "no",

        loanDeductionEnabled:
            loanDeductionEnabled?.value ||
            "no",

        cashAdvanceEnabled:
            cashAdvanceEnabled?.value ||
            "no",

        otherDeductionEnabled:
            otherDeductionEnabled?.value ||
            "no",

        payslipCompanyName:
            payslipCompanyName?.value ||
            "",

        payslipNumberFormat:
            payslipNumberFormat?.value ||
            "PS-{YYYY}-{####}",

        showPayslipPhoto:
            showPayslipPhoto?.value ||
            "no",

        showGovernmentNumbers:
            showGovernmentNumbers?.value ||
            "no",

        showBankInformation:
            showBankInformation?.value ||
            "no",

        payrollReviewRequired:
            payrollReviewRequired?.value ||
            "yes",

        lockReleasedPayroll:
            lockReleasedPayroll?.value ||
            "yes"

    };

}


/* ==========================================
   VALIDATION
========================================== */

function validate(data) {

    if (
        data.payrollYear < 2020 ||
        data.payrollYear > 2100
    ) {

        return
            "Payroll Year must be between 2020 and 2100.";

    }


    const dayFields = [

        [
            data.firstCutoff,
            "First Cutoff"
        ],

        [
            data.secondCutoff,
            "Second Cutoff"
        ],

        [
            data.firstPayDate,
            "First Pay Date"
        ],

        [
            data.secondPayDate,
            "Second Pay Date"
        ]

    ];


    for (
        const [value, name]
        of dayFields
    ) {

        if (
            value < 1 ||
            value > 31
        ) {

            return (
                name +
                " must be between 1 and 31."
            );

        }

    }


    if (
        data.workingDaysPerMonth <= 0
    ) {

        return
            "Working Days Per Month must be greater than zero.";

    }


    if (
        data.workingHoursPerDay <= 0
    ) {

        return
            "Working Hours Per Day must be greater than zero.";

    }


    if (
        data.dailyRateDivisor <= 0
    ) {

        return
            "Daily Rate Divisor must be greater than zero.";

    }


    if (
        data.hourlyRateDivisor <= 0
    ) {

        return
            "Hourly Rate Divisor must be greater than zero.";

    }


    if (
        data.regularOtRate < 0 ||
        data.restDayOtRate < 0 ||
        data.specialHolidayRate < 0 ||
        data.regularHolidayRate < 0
    ) {

        return
            "Overtime rates cannot be negative.";

    }


    if (
        data.nightDifferentialRate < 0
    ) {

        return
            "Night Differential cannot be negative.";

    }


    if (
        data.minimumOtMinutes < 0
    ) {

        return
            "Minimum OT Minutes cannot be negative.";

    }


    return null;

}


/* ==========================================
   LOAD
========================================== */

async function loadPayrollSettings() {

    setStatus(
        "LOADING...",
        "saving"
    );


    try {

        const snapshot =
            await getDoc(
                payrollRef()
            );


        if (snapshot.exists()) {

            const data =
                snapshot.data();


            applySettings(data);


            let savedText =
                "Payroll settings loaded.";


            if (data.updatedAt) {

                try {

                    const date =
                        data.updatedAt.toDate();

                    savedText =
                        "Last saved: " +
                        date.toLocaleString();

                } catch (error) {

                    console.warn(
                        "Unable to format payroll date.",
                        error
                    );

                }

            }


            if (payrollLastSavedText) {

                payrollLastSavedText.textContent =
                    savedText;

            }


            setStatus(
                "SAVED",
                "success"
            );

        } else {

            applySettings(
                DEFAULT_PAYROLL_SETTINGS
            );


            if (payrollLastSavedText) {

                payrollLastSavedText.textContent =
                    "No payroll settings saved yet. Default values are currently being used.";

            }


            setStatus(
                "DEFAULT"
            );

        }

    } catch (error) {

        console.error(
            "Payroll Settings Load Error:",
            error
        );


        applySettings(
            DEFAULT_PAYROLL_SETTINGS
        );


        setStatus(
            "LOAD ERROR",
            "error"
        );


        if (payrollLastSavedText) {

            payrollLastSavedText.textContent =
                "Firebase error: " +
                error.message;

        }

    }

}


/* ==========================================
   SAVE
========================================== */

async function savePayrollSettings() {

    const data =
        getFormData();


    const validation =
        validate(data);


    if (validation) {

        alert(validation);

        return;

    }


    setStatus(
        "SAVING...",
        "saving"
    );


    if (payrollSaveBtn) {

        payrollSaveBtn.disabled = true;

    }


    try {

        await setDoc(

            payrollRef(),

            {

                ...data,

                updatedAt:
                    serverTimestamp()

            },

            {

                merge: true

            }

        );


        applySettings(data);


        if (payrollLastSavedText) {

            payrollLastSavedText.textContent =
                "Payroll settings saved successfully.";

        }


        setStatus(
            "SAVED",
            "success"
        );


    } catch (error) {

        console.error(
            "Payroll Settings Save Error:",
            error
        );


        setStatus(
            "SAVE ERROR",
            "error"
        );


        if (payrollLastSavedText) {

            payrollLastSavedText.textContent =
                "Unable to save Payroll Settings.";

        }


        alert(
            "Unable to save Payroll Settings.\n\n" +
            error.message
        );

    } finally {

        if (payrollSaveBtn) {

            payrollSaveBtn.disabled = false;

        }

    }

}


/* ==========================================
   CHANGE
========================================== */

function payrollChanged() {

    setStatus(
        "UNSAVED"
    );


    if (payrollLastSavedText) {

        payrollLastSavedText.textContent =
            "You have unsaved payroll changes.";

    }

}


/* ==========================================
   GLOBAL
========================================== */

window.loadPayrollSettings =
    loadPayrollSettings;


window.savePayrollSettings =
    savePayrollSettings;


/*
 * Useful for future Payroll module.
 * Other JS files can import this module
 * later and use the same Firestore document.
 */

export async function getPayrollSettings() {

    const snapshot =
        await getDoc(
            payrollRef()
        );


    if (!snapshot.exists()) {

        return {
            ...DEFAULT_PAYROLL_SETTINGS
        };

    }


    return {

        ...DEFAULT_PAYROLL_SETTINGS,

        ...snapshot.data()

    };

}


/* ==========================================
   EVENTS
========================================== */

const payrollInputs = [

    payrollEnabled,
    payrollFrequency,
    payrollYear,

    firstCutoff,
    secondCutoff,

    firstPayDate,
    secondPayDate,

    workingDaysPerMonth,
    workingHoursPerDay,

    dailyRateDivisor,
    hourlyRateDivisor,

    payrollRounding,

    regularOtRate,
    restDayOtRate,
    specialHolidayRate,
    regularHolidayRate,

    nightDifferentialRate,
    minimumOtMinutes,

    lateDeductionEnabled,
    undertimeDeductionEnabled,
    absenceDeductionEnabled,

    housingAllowanceEnabled,
    transportAllowanceEnabled,
    foodAllowanceEnabled,
    communicationAllowanceEnabled,
    otherAllowanceEnabled,

    sssEnabled,
    philhealthEnabled,
    pagibigEnabled,
    withholdingTaxEnabled,

    loanDeductionEnabled,
    cashAdvanceEnabled,
    otherDeductionEnabled,

    payslipCompanyName,
    payslipNumberFormat,

    showPayslipPhoto,
    showGovernmentNumbers,
    showBankInformation,

    payrollReviewRequired,
    lockReleasedPayroll

];


payrollInputs.forEach(input => {

    if (!input) return;


    input.addEventListener(
        "change",
        payrollChanged
    );


    input.addEventListener(
        "input",
        payrollChanged
    );

});


if (payrollSaveBtn) {

    payrollSaveBtn.addEventListener(
        "click",
        savePayrollSettings
    );

}


if (payrollResetBtn) {

    payrollResetBtn.addEventListener(
        "click",
        loadPayrollSettings
    );

}


/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (payrollYear) {

            payrollYear.value =
                new Date().getFullYear();

        }


        loadPayrollSettings();

    }
);
