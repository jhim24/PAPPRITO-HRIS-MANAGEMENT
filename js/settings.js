/* ==========================================
   PAPPRITO HRIS
   SETTINGS JS
   GENERAL SETTINGS
========================================== */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   ELEMENTS
========================================== */

const menuItems =
    document.querySelectorAll(
        ".settings-menu-item"
    );


const sections =
    document.querySelectorAll(
        ".settings-section"
    );


const companyName =
    document.getElementById(
        "companyName"
    );


const companyAddress =
    document.getElementById(
        "companyAddress"
    );


const contactNumber =
    document.getElementById(
        "contactNumber"
    );


const companyEmail =
    document.getElementById(
        "companyEmail"
    );


const currency =
    document.getElementById(
        "currency"
    );


const timezone =
    document.getElementById(
        "timezone"
    );


const dateFormat =
    document.getElementById(
        "dateFormat"
    );


const companyLogo =
    document.getElementById(
        "companyLogo"
    );


const companyLogoPreview =
    document.getElementById(
        "companyLogoPreview"
    );


const saveGeneralBtn =
    document.getElementById(
        "saveGeneralBtn"
    );


/* ==========================================
   DEFAULT SETTINGS
========================================== */

const DEFAULT_SETTINGS = {

    companyName:
        "PAPPRITO",

    companyAddress:
        "",

    contactNumber:
        "",

    email:
        "",

    currency:
        "QAR",

    timezone:
        "Asia/Qatar",

    dateFormat:
        "DD/MM/YYYY",

    logo:
        "../assets/images/logo.png"

};


/* ==========================================
   AUTH CHECK
========================================== */

onAuthStateChanged(
    auth,
    function(user){

        if(!user){

            window.location.replace(
                "login.html"
            );

            return;

        }

loadGeneralSettings();
loadCompanySettings();
loadEmployeeSettings();
loadAttendanceSettings();
loadPayrollSettings();
loadLeaveSettings();
       
    }
);


/* ==========================================
   SETTINGS MENU
========================================== */

menuItems.forEach(
    function(item){

        item.addEventListener(
            "click",
            function(){

                const target =
                    item.dataset.section;


                /*
                   Remove active state
                   from all menu items.
                */

                menuItems.forEach(
                    function(menuItem){

                        menuItem.classList.remove(
                            "active"
                        );

                    }
                );


                /*
                   Hide all sections.
                */

                sections.forEach(
                    function(section){

                        section.classList.remove(
                            "active"
                        );

                    }
                );


                /*
                   Activate clicked menu.
                */

                item.classList.add(
                    "active"
                );


                /*
                   Show selected section.
                */

                const targetSection =
                    document.getElementById(
                        target +
                        "Section"
                    );


                if(targetSection){

                    targetSection.classList.add(
                        "active"
                    );

                }

            }
        );

    }
);


/* ==========================================
   LOAD GENERAL SETTINGS
========================================== */

async function loadGeneralSettings(){

    try{

        const settingsRef =
            doc(
                db,
                "systemSettings",
                "general"
            );


        const snapshot =
            await getDoc(
                settingsRef
            );


        if(
            snapshot.exists()
        ){

            const data =
                snapshot.data();


            setFormValues(
                {
                    ...DEFAULT_SETTINGS,
                    ...data
                }
            );

        }else{

            /*
               No settings yet.
               Show default values.
            */

            setFormValues(
                DEFAULT_SETTINGS
            );

        }


    }catch(error){

        console.error(
            "Load Settings Error:",
            error
        );


        /*
           Keep the page usable even if
           Firebase cannot be reached.
        */

        setFormValues(
            DEFAULT_SETTINGS
        );

    }

}


/* ==========================================
   SET FORM VALUES
========================================== */

function setFormValues(
    data
){

    if(companyName){

        companyName.value =
            data.companyName ||
            "";

    }


    if(companyAddress){

        companyAddress.value =
            data.companyAddress ||
            "";

    }


    if(contactNumber){

        contactNumber.value =
            data.contactNumber ||
            "";

    }


    if(companyEmail){

        companyEmail.value =
            data.email ||
            "";

    }


    if(currency){

        currency.value =
            data.currency ||
            "QAR";

    }


    if(timezone){

        timezone.value =
            data.timezone ||
            "Asia/Qatar";

    }


    if(dateFormat){

        dateFormat.value =
            data.dateFormat ||
            "DD/MM/YYYY";

    }


    if(
        companyLogoPreview &&
        data.logo
    ){

        companyLogoPreview.src =
            data.logo;

    }

}


/* ==========================================
   LOGO PREVIEW
========================================== */

if(companyLogo){

    companyLogo.addEventListener(
        "change",
        function(){

            const file =
                companyLogo.files[0];


            if(!file){

                return;

            }


            /*
               Only allow image files.
            */

            if(
                !file.type.startsWith(
                    "image/"
                )
            ){

                alert(
                    "Please select an image file."
                );

                companyLogo.value =
                    "";

                return;

            }


            /*
               Preview only.
               We are not uploading the
               image to Firebase Storage yet.
            */

            const reader =
                new FileReader();


            reader.onload =
                function(event){

                    if(
                        companyLogoPreview
                    ){

                        companyLogoPreview.src =
                            event.target.result;

                    }

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* ==========================================
   SAVE GENERAL SETTINGS
========================================== */

if(saveGeneralBtn){

    saveGeneralBtn.addEventListener(
        "click",
        saveGeneralSettings
    );

}


async function saveGeneralSettings(){

    if(!auth.currentUser){

        alert(
            "You are not logged in."
        );

        window.location.replace(
            "login.html"
        );

        return;

    }


    /*
       Basic validation.
    */

    const name =
        companyName.value.trim();


    if(!name){

        alert(
            "Company Name is required."
        );

        companyName.focus();

        return;

    }


    /*
       Disable button while saving.
    */

    saveGeneralBtn.disabled =
        true;


    saveGeneralBtn.innerHTML = `

        <span class="material-icons">

            sync

        </span>

        SAVING...

    `;


    try{

        const settings = {

            companyName:
                name,

            companyAddress:
                companyAddress.value.trim(),

            contactNumber:
                contactNumber.value.trim(),

            email:
                companyEmail.value.trim(),

            currency:
                currency.value,

            timezone:
                timezone.value,

            dateFormat:
                dateFormat.value,

            /*
               Keep current logo path.
               Actual Firebase Storage
               upload will be added separately.
            */

            logo:
                companyLogoPreview.src ||

                DEFAULT_SETTINGS.logo

        };


        const settingsRef =
            doc(
                db,
                "systemSettings",
                "general"
            );


        await setDoc(
            settingsRef,
            settings,
            {
                merge:true
            }
        );


        alert(
            "General Settings Saved Successfully."
        );


    }catch(error){

        console.error(
            "Save Settings Error:",
            error
        );


        alert(
            "Unable to save settings.\n\n" +
            error.message
        );


    }finally{

        saveGeneralBtn.disabled =
            false;


        saveGeneralBtn.innerHTML = `

            <span class="material-icons">

                save

            </span>

            SAVE SETTINGS

        `;

    }

}


/* ==========================================
   DASHBOARD
========================================== */

window.goToDashboard =
function(){

    window.location.replace(
        "dashboard.html"
    );

};


/* ==========================================
   MOBILE SIDEBAR
========================================== */

document.addEventListener(
    "sidebarLoaded",
    function(){

        const menuBtn =
            document.getElementById(
                "menuBtn"
            );


        const sidebar =
            document.getElementById(
                "sidebar"
            );


        const overlay =
            document.getElementById(
                "overlay"
            );


        if(
            !menuBtn ||
            !sidebar
        ){

            return;

        }


        menuBtn.addEventListener(
            "click",
            function(){

                sidebar.classList.add(
                    "show"
                );


                if(overlay){

                    overlay.classList.add(
                        "show"
                    );

                }

            }
        );


        if(overlay){

            overlay.addEventListener(
                "click",
                function(){

                    sidebar.classList.remove(
                        "show"
                    );


                    overlay.classList.remove(
                        "show"
                    );

                }
            );

        }

    }
);


/* ==========================================
   INITIAL LOG
========================================== */

console.log(
    "PAPPRITO HRIS Settings Ready"
);
/* ==========================================
   COMPANY SETTINGS ELEMENTS
========================================== */

const legalName =
    document.getElementById(
        "legalName"
    );

const tradeName =
    document.getElementById(
        "tradeName"
    );

const registrationNumber =
    document.getElementById(
        "registrationNumber"
    );

const taxNumber =
    document.getElementById(
        "taxNumber"
    );

const branch =
    document.getElementById(
        "branch"
    );

const hrContactPerson =
    document.getElementById(
        "hrContactPerson"
    );

const hrContactNumber =
    document.getElementById(
        "hrContactNumber"
    );

const hrEmail =
    document.getElementById(
        "hrEmail"
    );

const payrollContact =
    document.getElementById(
        "payrollContact"
    );

const authorizedSignatory =
    document.getElementById(
        "authorizedSignatory"
    );

const signatoryPosition =
    document.getElementById(
        "signatoryPosition"
    );

const saveCompanyBtn =
    document.getElementById(
        "saveCompanyBtn"
    );


/* ==========================================
   LOAD COMPANY SETTINGS
========================================== */

async function loadCompanySettings(){

    try{

        const companyRef =
            doc(
                db,
                "systemSettings",
                "company"
            );


        const snapshot =
            await getDoc(
                companyRef
            );


        if(!snapshot.exists()){

            return;

        }


        const data =
            snapshot.data();


        if(legalName){

            legalName.value =
                data.legalName || "";

        }


        if(tradeName){

            tradeName.value =
                data.tradeName || "";

        }


        if(registrationNumber){

            registrationNumber.value =
                data.registrationNumber || "";

        }


        if(taxNumber){

            taxNumber.value =
                data.taxNumber || "";

        }


        if(branch){

            branch.value =
                data.branch || "";

        }


        if(hrContactPerson){

            hrContactPerson.value =
                data.hrContactPerson || "";

        }


        if(hrContactNumber){

            hrContactNumber.value =
                data.hrContactNumber || "";

        }


        if(hrEmail){

            hrEmail.value =
                data.hrEmail || "";

        }


        if(payrollContact){

            payrollContact.value =
                data.payrollContact || "";

        }


        if(authorizedSignatory){

            authorizedSignatory.value =
                data.authorizedSignatory || "";

        }


        if(signatoryPosition){

            signatoryPosition.value =
                data.signatoryPosition || "";

        }


    }catch(error){

        console.error(
            "Load Company Settings Error:",
            error
        );

    }

}


/* ==========================================
   SAVE COMPANY SETTINGS
========================================== */

if(saveCompanyBtn){

    saveCompanyBtn.addEventListener(
        "click",
        saveCompanySettings
    );

}


async function saveCompanySettings(){

    if(!auth.currentUser){

        alert(
            "You are not logged in."
        );

        return;

    }


    saveCompanyBtn.disabled =
        true;


    saveCompanyBtn.innerHTML = `

        <span class="material-icons">
            sync
        </span>

        SAVING...

    `;


    try{

        const companyData = {

            legalName:
                legalName.value.trim(),

            tradeName:
                tradeName.value.trim(),

            registrationNumber:
                registrationNumber.value.trim(),

            taxNumber:
                taxNumber.value.trim(),

            branch:
                branch.value.trim(),

            hrContactPerson:
                hrContactPerson.value.trim(),

            hrContactNumber:
                hrContactNumber.value.trim(),

            hrEmail:
                hrEmail.value.trim(),

            payrollContact:
                payrollContact.value.trim(),

            authorizedSignatory:
                authorizedSignatory.value.trim(),

            signatoryPosition:
                signatoryPosition.value.trim()

        };


        await setDoc(

            doc(
                db,
                "systemSettings",
                "company"
            ),

            companyData,

            {
                merge:true
            }

        );


        alert(
            "Company Settings Saved Successfully."
        );


    }catch(error){

        console.error(
            "Save Company Settings Error:",
            error
        );


        alert(
            "Unable to save company settings.\n\n" +
            error.message
        );


    }finally{

        saveCompanyBtn.disabled =
            false;


        saveCompanyBtn.innerHTML = `

            <span class="material-icons">
                save
            </span>

            SAVE COMPANY SETTINGS

        `;

    }

}


/* ==========================================
   LOAD COMPANY SETTINGS AFTER LOGIN
========================================== */

if(auth.currentUser){

    loadCompanySettings();

}
/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE SETTINGS
========================================== */


/* ==========================================
   EMPLOYEE SETTINGS ELEMENTS
========================================== */

const autoGenerateId =
    document.getElementById(
        "autoGenerateId"
    );

const idPrefix =
    document.getElementById(
        "idPrefix"
    );

const startingNumber =
    document.getElementById(
        "startingNumber"
    );

const idDigits =
    document.getElementById(
        "idDigits"
    );

const employeeIdPreview =
    document.getElementById(
        "employeeIdPreview"
    );

const defaultEmploymentType =
    document.getElementById(
        "defaultEmploymentType"
    );

const defaultStatus =
    document.getElementById(
        "defaultStatus"
    );

const defaultDepartment =
    document.getElementById(
        "defaultDepartment"
    );

const defaultPosition =
    document.getElementById(
        "defaultPosition"
    );

const allowEmployeeLogin =
    document.getElementById(
        "allowEmployeeLogin"
    );

const allowLeaveRequest =
    document.getElementById(
        "allowLeaveRequest"
    );

const allowAttendanceView =
    document.getElementById(
        "allowAttendanceView"
    );

const allowPayslipView =
    document.getElementById(
        "allowPayslipView"
    );

const saveEmployeeBtn =
    document.getElementById(
        "saveEmployeeBtn"
    );


/* ==========================================
   DEFAULT EMPLOYEE SETTINGS
========================================== */

const DEFAULT_EMPLOYEE_SETTINGS = {

    autoGenerateId:true,

    idPrefix:"EMP-",

    startingNumber:1,

    idDigits:4,

    defaultEmploymentType:"Full Time",

    defaultStatus:"Active",

    defaultDepartment:"",

    defaultPosition:"",

    allowEmployeeLogin:true,

    allowLeaveRequest:true,

    allowAttendanceView:true,

    allowPayslipView:true

};


/* ==========================================
   LOAD EMPLOYEE SETTINGS
========================================== */

async function loadEmployeeSettings(){

    try{

        const employeeSettingsRef =
            doc(
                db,
                "systemSettings",
                "employees"
            );


        const snapshot =
            await getDoc(
                employeeSettingsRef
            );


        let data =
            DEFAULT_EMPLOYEE_SETTINGS;


        if(snapshot.exists()){

            data = {

                ...DEFAULT_EMPLOYEE_SETTINGS,

                ...snapshot.data()

            };

        }


        setEmployeeSettingsForm(
            data
        );


    }catch(error){

        console.error(
            "Load Employee Settings Error:",
            error
        );


        setEmployeeSettingsForm(
            DEFAULT_EMPLOYEE_SETTINGS
        );

    }

}


/* ==========================================
   SET EMPLOYEE FORM VALUES
========================================== */

function setEmployeeSettingsForm(
    data
){

    if(autoGenerateId){

        autoGenerateId.checked =
            data.autoGenerateId !== false;

    }


    if(idPrefix){

        idPrefix.value =
            data.idPrefix ||
            "EMP-";

    }


    if(startingNumber){

        startingNumber.value =
            Number(
                data.startingNumber || 1
            );

    }


    if(idDigits){

        idDigits.value =
            String(
                data.idDigits || 4
            );

    }


    if(defaultEmploymentType){

        defaultEmploymentType.value =
            data.defaultEmploymentType ||
            "Full Time";

    }


    if(defaultStatus){

        defaultStatus.value =
            data.defaultStatus ||
            "Active";

    }


    if(defaultDepartment){

        defaultDepartment.value =
            data.defaultDepartment ||
            "";

    }


    if(defaultPosition){

        defaultPosition.value =
            data.defaultPosition ||
            "";

    }


    if(allowEmployeeLogin){

        allowEmployeeLogin.checked =
            data.allowEmployeeLogin !== false;

    }


    if(allowLeaveRequest){

        allowLeaveRequest.checked =
            data.allowLeaveRequest !== false;

    }


    if(allowAttendanceView){

        allowAttendanceView.checked =
            data.allowAttendanceView !== false;

    }


    if(allowPayslipView){

        allowPayslipView.checked =
            data.allowPayslipView !== false;

    }


    updateEmployeeIdPreview();

}


/* ==========================================
   EMPLOYEE ID PREVIEW
========================================== */

function updateEmployeeIdPreview(){

    if(
        !employeeIdPreview ||
        !idPrefix ||
        !startingNumber ||
        !idDigits
    ){

        return;

    }


    const prefix =
        idPrefix.value ||
        "EMP-";


    let number =
        parseInt(
            startingNumber.value,
            10
        );


    if(
        isNaN(number) ||
        number < 1
    ){

        number = 1;

    }


    let digits =
        parseInt(
            idDigits.value,
            10
        );


    if(
        isNaN(digits) ||
        digits < 1
    ){

        digits = 4;

    }


    const formattedNumber =
        String(number)
            .padStart(
                digits,
                "0"
            );


    employeeIdPreview.textContent =
        prefix +
        formattedNumber;

}


/* ==========================================
   EMPLOYEE ID EVENTS
========================================== */

if(idPrefix){

    idPrefix.addEventListener(
        "input",
        updateEmployeeIdPreview
    );

}


if(startingNumber){

    startingNumber.addEventListener(
        "input",
        updateEmployeeIdPreview
    );

}


if(idDigits){

    idDigits.addEventListener(
        "change",
        updateEmployeeIdPreview
    );

}


/* ==========================================
   SAVE EMPLOYEE SETTINGS
========================================== */

if(saveEmployeeBtn){

    saveEmployeeBtn.addEventListener(
        "click",
        saveEmployeeSettings
    );

}


async function saveEmployeeSettings(){

    if(!auth.currentUser){

        alert(
            "You are not logged in."
        );

        window.location.replace(
            "login.html"
        );

        return;

    }


    /*
       Validate Employee ID prefix
    */

    const prefix =
        idPrefix.value.trim();


    if(!prefix){

        alert(
            "Employee ID Prefix is required."
        );

        idPrefix.focus();

        return;

    }


    /*
       Validate starting number
    */

    let startNumber =
        parseInt(
            startingNumber.value,
            10
        );


    if(
        isNaN(startNumber) ||
        startNumber < 1
    ){

        alert(
            "Starting Number must be 1 or higher."
        );

        startingNumber.focus();

        return;

    }


    /*
       Disable button
    */

    saveEmployeeBtn.disabled =
        true;


    saveEmployeeBtn.innerHTML = `

        <span class="material-icons">
            sync
        </span>

        SAVING...

    `;


    try{

        const employeeData = {

            autoGenerateId:
                autoGenerateId.checked,

            idPrefix:
                prefix,

            startingNumber:
                startNumber,

            idDigits:
                parseInt(
                    idDigits.value,
                    10
                ),

            defaultEmploymentType:
                defaultEmploymentType.value,

            defaultStatus:
                defaultStatus.value,

            defaultDepartment:
                defaultDepartment.value.trim(),

            defaultPosition:
                defaultPosition.value.trim(),

            allowEmployeeLogin:
                allowEmployeeLogin.checked,

            allowLeaveRequest:
                allowLeaveRequest.checked,

            allowAttendanceView:
                allowAttendanceView.checked,

            allowPayslipView:
                allowPayslipView.checked

        };


        const employeeSettingsRef =
            doc(
                db,
                "systemSettings",
                "employees"
            );


        await setDoc(
            employeeSettingsRef,
            employeeData,
            {
                merge:true
            }
        );


        alert(
            "Employee Settings Saved Successfully."
        );


    }catch(error){

        console.error(
            "Save Employee Settings Error:",
            error
        );


        alert(
            "Unable to save Employee Settings.\n\n" +
            error.message
        );


    }finally{

        saveEmployeeBtn.disabled =
            false;


        saveEmployeeBtn.innerHTML = `

            <span class="material-icons">
                save
            </span>

            SAVE EMPLOYEE SETTINGS

        `;

    }

}


/* ==========================================
   LOAD WHEN USER IS AUTHENTICATED
========================================== */

if(auth.currentUser){

    loadEmployeeSettings();

}


/* ==========================================
   UPDATE AUTH STATE
========================================== */

onAuthStateChanged(
    auth,
    function(user){

        if(!user){

            return;

        }


        loadEmployeeSettings();

    }
);

/* ==========================================
   PAPPRITO HRIS
   ATTENDANCE SETTINGS
========================================== */


/* ==========================================
   ATTENDANCE ELEMENTS
========================================== */

const regularHours =
    document.getElementById(
        "regularHours"
    );

const workStartTime =
    document.getElementById(
        "workStartTime"
    );

const workEndTime =
    document.getElementById(
        "workEndTime"
    );

const workDays =
    document.getElementById(
        "workDays"
    );

const enableBreak =
    document.getElementById(
        "enableBreak"
    );

const breakStartTime =
    document.getElementById(
        "breakStartTime"
    );

const breakEndTime =
    document.getElementById(
        "breakEndTime"
    );

const breakHours =
    document.getElementById(
        "breakHours"
    );

const deductBreak =
    document.getElementById(
        "deductBreak"
    );

const gracePeriod =
    document.getElementById(
        "gracePeriod"
    );

const markLate =
    document.getElementById(
        "markLate"
    );

const lateCalculation =
    document.getElementById(
        "lateCalculation"
    );

const lateRounding =
    document.getElementById(
        "lateRounding"
    );

const enableUndertime =
    document.getElementById(
        "enableUndertime"
    );

const undertimeCalculation =
    document.getElementById(
        "undertimeCalculation"
    );

const undertimeRounding =
    document.getElementById(
        "undertimeRounding"
    );

const enableOvertime =
    document.getElementById(
        "enableOvertime"
    );

const minimumOtMinutes =
    document.getElementById(
        "minimumOtMinutes"
    );

const otRounding =
    document.getElementById(
        "otRounding"
    );

const autoComputeRegularHours =
    document.getElementById(
        "autoComputeRegularHours"
    );

const saveAttendanceBtn =
    document.getElementById(
        "saveAttendanceBtn"
    );


/* ==========================================
   DEFAULT ATTENDANCE SETTINGS
========================================== */

const DEFAULT_ATTENDANCE_SETTINGS = {

    regularHours:8,

    workStartTime:"08:00",

    workEndTime:"17:00",

    workDays:5,

    enableBreak:true,

    breakStartTime:"12:00",

    breakEndTime:"13:00",

    breakHours:1,

    deductBreak:true,

    gracePeriod:15,

    markLate:true,

    lateCalculation:"minutes",

    lateRounding:1,

    enableUndertime:true,

    undertimeCalculation:"minutes",

    undertimeRounding:1,

    enableOvertime:true,

    minimumOtMinutes:30,

    otRounding:1,

    autoComputeRegularHours:true

};


/* ==========================================
   LOAD ATTENDANCE SETTINGS
========================================== */

async function loadAttendanceSettings(){

    try{

        const attendanceSettingsRef =
            doc(
                db,
                "systemSettings",
                "attendance"
            );


        const snapshot =
            await getDoc(
                attendanceSettingsRef
            );


        let data =
            DEFAULT_ATTENDANCE_SETTINGS;


        if(snapshot.exists()){

            data = {

                ...DEFAULT_ATTENDANCE_SETTINGS,

                ...snapshot.data()

            };

        }


        setAttendanceSettingsForm(
            data
        );


    }catch(error){

        console.error(
            "Load Attendance Settings Error:",
            error
        );


        setAttendanceSettingsForm(
            DEFAULT_ATTENDANCE_SETTINGS
        );

    }

}


/* ==========================================
   SET ATTENDANCE FORM
========================================== */

function setAttendanceSettingsForm(
    data
){

    if(regularHours){

        regularHours.value =
            data.regularHours ?? 8;

    }


    if(workStartTime){

        workStartTime.value =
            data.workStartTime ||
            "08:00";

    }


    if(workEndTime){

        workEndTime.value =
            data.workEndTime ||
            "17:00";

    }


    if(workDays){

        workDays.value =
            String(
                data.workDays ?? 5
            );

    }


    if(enableBreak){

        enableBreak.checked =
            data.enableBreak !== false;

    }


    if(breakStartTime){

        breakStartTime.value =
            data.breakStartTime ||
            "12:00";

    }


    if(breakEndTime){

        breakEndTime.value =
            data.breakEndTime ||
            "13:00";

    }


    if(breakHours){

        breakHours.value =
            data.breakHours ?? 1;

    }


    if(deductBreak){

        deductBreak.checked =
            data.deductBreak !== false;

    }


    if(gracePeriod){

        gracePeriod.value =
            data.gracePeriod ?? 15;

    }


    if(markLate){

        markLate.checked =
            data.markLate !== false;

    }


    if(lateCalculation){

        lateCalculation.value =
            data.lateCalculation ||
            "minutes";

    }


    if(lateRounding){

        lateRounding.value =
            String(
                data.lateRounding ?? 1
            );

    }


    if(enableUndertime){

        enableUndertime.checked =
            data.enableUndertime !== false;

    }


    if(undertimeCalculation){

        undertimeCalculation.value =
            data.undertimeCalculation ||
            "minutes";

    }


    if(undertimeRounding){

        undertimeRounding.value =
            String(
                data.undertimeRounding ?? 1
            );

    }


    if(enableOvertime){

        enableOvertime.checked =
            data.enableOvertime !== false;

    }


    if(minimumOtMinutes){

        minimumOtMinutes.value =
            data.minimumOtMinutes ?? 30;

    }


    if(otRounding){

        otRounding.value =
            String(
                data.otRounding ?? 1
            );

    }


    if(autoComputeRegularHours){

        autoComputeRegularHours.checked =
            data.autoComputeRegularHours !== false;

    }

}


/* ==========================================
   SAVE ATTENDANCE SETTINGS
========================================== */

if(saveAttendanceBtn){

    saveAttendanceBtn.addEventListener(
        "click",
        saveAttendanceSettings
    );

}


async function saveAttendanceSettings(){

    if(!auth.currentUser){

        alert(
            "You are not logged in."
        );

        window.location.replace(
            "login.html"
        );

        return;

    }


    /* ======================================
       VALIDATION
    ====================================== */

    const hours =
        Number(
            regularHours.value
        );


    if(
        !Number.isFinite(hours) ||
        hours <= 0 ||
        hours > 24
    ){

        alert(
            "Regular Working Hours must be between 1 and 24 hours."
        );

        regularHours.focus();

        return;

    }


    const grace =
        Number(
            gracePeriod.value
        );


    if(
        !Number.isFinite(grace) ||
        grace < 0 ||
        grace > 120
    ){

        alert(
            "Grace Period must be between 0 and 120 minutes."
        );

        gracePeriod.focus();

        return;

    }


    const breakDuration =
        Number(
            breakHours.value
        );


    if(
        !Number.isFinite(breakDuration) ||
        breakDuration < 0 ||
        breakDuration > 8
    ){

        alert(
            "Break Duration must be between 0 and 8 hours."
        );

        breakHours.focus();

        return;

    }


    const minimumOT =
        Number(
            minimumOtMinutes.value
        );


    if(
        !Number.isFinite(minimumOT) ||
        minimumOT < 0 ||
        minimumOT > 480
    ){

        alert(
            "Minimum OT Minutes must be between 0 and 480."
        );

        minimumOtMinutes.focus();

        return;

    }


    /* ======================================
       DISABLE SAVE BUTTON
    ====================================== */

    saveAttendanceBtn.disabled =
        true;


    saveAttendanceBtn.innerHTML = `

        <span class="material-icons">
            sync
        </span>

        SAVING...

    `;


    try{

        /* ==================================
           DATA
        ================================== */

        const attendanceData = {

            regularHours:
                hours,

            workStartTime:
                workStartTime.value,

            workEndTime:
                workEndTime.value,

            workDays:
                Number(
                    workDays.value
                ),

            enableBreak:
                enableBreak.checked,

            breakStartTime:
                breakStartTime.value,

            breakEndTime:
                breakEndTime.value,

            breakHours:
                breakDuration,

            deductBreak:
                deductBreak.checked,

            gracePeriod:
                grace,

            markLate:
                markLate.checked,

            lateCalculation:
                lateCalculation.value,

            lateRounding:
                Number(
                    lateRounding.value
                ),

            enableUndertime:
                enableUndertime.checked,

            undertimeCalculation:
                undertimeCalculation.value,

            undertimeRounding:
                Number(
                    undertimeRounding.value
                ),

            enableOvertime:
                enableOvertime.checked,

            minimumOtMinutes:
                minimumOT,

            otRounding:
                Number(
                    otRounding.value
                ),

            autoComputeRegularHours:
                autoComputeRegularHours.checked

        };


        /* ==================================
           FIREBASE
        ================================== */

        const attendanceSettingsRef =
            doc(
                db,
                "systemSettings",
                "attendance"
            );


        await setDoc(

            attendanceSettingsRef,

            attendanceData,

            {
                merge:true
            }

        );


        alert(
            "Attendance Settings Saved Successfully."
        );


    }catch(error){

        console.error(
            "Save Attendance Settings Error:",
            error
        );


        alert(
            "Unable to save Attendance Settings.\n\n" +
            error.message
        );


    }finally{

        saveAttendanceBtn.disabled =
            false;


        saveAttendanceBtn.innerHTML = `

            <span class="material-icons">
                save
            </span>

            SAVE ATTENDANCE SETTINGS

        `;

    }

}
/* ==========================================
   PAPPRITO HRIS
   PAYROLL SETTINGS
========================================== */


/* ==========================================
   PAYROLL ELEMENTS
========================================== */

const payFrequency =
    document.getElementById(
        "payFrequency"
    );

const payDay =
    document.getElementById(
        "payDay"
    );

const firstCutoffStart =
    document.getElementById(
        "firstCutoffStart"
    );

const firstCutoffEnd =
    document.getElementById(
        "firstCutoffEnd"
    );

const secondCutoffStart =
    document.getElementById(
        "secondCutoffStart"
    );

const secondCutoffEnd =
    document.getElementById(
        "secondCutoffEnd"
    );

const salaryBasis =
    document.getElementById(
        "salaryBasis"
    );

const workingDaysPerMonth =
    document.getElementById(
        "workingDaysPerMonth"
    );

const hoursPerDay =
    document.getElementById(
        "hoursPerDay"
    );

const hourlyRateMethod =
    document.getElementById(
        "hourlyRateMethod"
    );

const includeOvertimePay =
    document.getElementById(
        "includeOvertimePay"
    );

const regularOtRate =
    document.getElementById(
        "regularOtRate"
    );

const restDayOtRate =
    document.getElementById(
        "restDayOtRate"
    );

const holidayOtRate =
    document.getElementById(
        "holidayOtRate"
    );

const deductLate =
    document.getElementById(
        "deductLate"
    );

const deductUndertime =
    document.getElementById(
        "deductUndertime"
    );

const deductionRounding =
    document.getElementById(
        "deductionRounding"
    );

const enableGovernmentDeductions =
    document.getElementById(
        "enableGovernmentDeductions"
    );

const enableSSS =
    document.getElementById(
        "enableSSS"
    );

const enablePhilHealth =
    document.getElementById(
        "enablePhilHealth"
    );

const enablePagIBIG =
    document.getElementById(
        "enablePagIBIG"
    );

const enableTax =
    document.getElementById(
        "enableTax"
    );

const enableHealthCard =
    document.getElementById(
        "enableHealthCard"
    );

const enableOtherDeductions =
    document.getElementById(
        "enableOtherDeductions"
    );

const payrollRounding =
    document.getElementById(
        "payrollRounding"
    );

const autoComputePayroll =
    document.getElementById(
        "autoComputePayroll"
    );

const savePayrollBtn =
    document.getElementById(
        "savePayrollBtn"
    );


/* ==========================================
   DEFAULT PAYROLL SETTINGS
========================================== */

const DEFAULT_PAYROLL_SETTINGS = {

    payFrequency:
        "semi-monthly",

    payDay:
        15,

    firstCutoffStart:
        "1",

    firstCutoffEnd:
        "15",

    secondCutoffStart:
        "16",

    secondCutoffEnd:
        "last-day",

    salaryBasis:
        "monthly",

    workingDaysPerMonth:
        26,

    hoursPerDay:
        8,

    hourlyRateMethod:
        "monthly-divide-days",

    includeOvertimePay:
        true,

    regularOtRate:
        1.25,

    restDayOtRate:
        1.30,

    holidayOtRate:
        2.00,

    deductLate:
        true,

    deductUndertime:
        true,

    deductionRounding:
        1,

    enableGovernmentDeductions:
        true,

    enableSSS:
        true,

    enablePhilHealth:
        true,

    enablePagIBIG:
        true,

    enableTax:
        true,

    enableHealthCard:
        true,

    enableOtherDeductions:
        true,

    payrollRounding:
        0.01,

    autoComputePayroll:
        true

};


/* ==========================================
   LOAD PAYROLL SETTINGS
========================================== */

async function loadPayrollSettings(){

    try{

        const payrollSettingsRef =
            doc(
                db,
                "systemSettings",
                "payroll"
            );


        const snapshot =
            await getDoc(
                payrollSettingsRef
            );


        let data =
            DEFAULT_PAYROLL_SETTINGS;


        if(
            snapshot.exists()
        ){

            data = {

                ...DEFAULT_PAYROLL_SETTINGS,

                ...snapshot.data()

            };

        }


        setPayrollSettingsForm(
            data
        );


    }catch(error){

        console.error(
            "Load Payroll Settings Error:",
            error
        );


        setPayrollSettingsForm(
            DEFAULT_PAYROLL_SETTINGS
        );

    }

}


/* ==========================================
   SET PAYROLL FORM VALUES
========================================== */

function setPayrollSettingsForm(
    data
){

    if(payFrequency){

        payFrequency.value =
            data.payFrequency ||
            "semi-monthly";

    }


    if(payDay){

        payDay.value =
            data.payDay ?? 15;

    }


    if(firstCutoffStart){

        firstCutoffStart.value =
            data.firstCutoffStart ||
            "1";

    }


    if(firstCutoffEnd){

        firstCutoffEnd.value =
            data.firstCutoffEnd ||
            "15";

    }


    if(secondCutoffStart){

        secondCutoffStart.value =
            data.secondCutoffStart ||
            "16";

    }


    if(secondCutoffEnd){

        secondCutoffEnd.value =
            data.secondCutoffEnd ||
            "last-day";

    }


    if(salaryBasis){

        salaryBasis.value =
            data.salaryBasis ||
            "monthly";

    }


    if(workingDaysPerMonth){

        workingDaysPerMonth.value =
            data.workingDaysPerMonth ??
            26;

    }


    if(hoursPerDay){

        hoursPerDay.value =
            data.hoursPerDay ??
            8;

    }


    if(hourlyRateMethod){

        hourlyRateMethod.value =
            data.hourlyRateMethod ||
            "monthly-divide-days";

    }


    if(includeOvertimePay){

        includeOvertimePay.checked =
            data.includeOvertimePay !== false;

    }


    if(regularOtRate){

        regularOtRate.value =
            data.regularOtRate ??
            1.25;

    }


    if(restDayOtRate){

        restDayOtRate.value =
            data.restDayOtRate ??
            1.30;

    }


    if(holidayOtRate){

        holidayOtRate.value =
            data.holidayOtRate ??
            2.00;

    }


    if(deductLate){

        deductLate.checked =
            data.deductLate !== false;

    }


    if(deductUndertime){

        deductUndertime.checked =
            data.deductUndertime !== false;

    }


    if(deductionRounding){

        deductionRounding.value =
            String(
                data.deductionRounding ?? 1
            );

    }


    if(enableGovernmentDeductions){

        enableGovernmentDeductions.checked =
            data.enableGovernmentDeductions !== false;

    }


    if(enableSSS){

        enableSSS.checked =
            data.enableSSS !== false;

    }


    if(enablePhilHealth){

        enablePhilHealth.checked =
            data.enablePhilHealth !== false;

    }


    if(enablePagIBIG){

        enablePagIBIG.checked =
            data.enablePagIBIG !== false;

    }


    if(enableTax){

        enableTax.checked =
            data.enableTax !== false;

    }


    if(enableHealthCard){

        enableHealthCard.checked =
            data.enableHealthCard !== false;

    }


    if(enableOtherDeductions){

        enableOtherDeductions.checked =
            data.enableOtherDeductions !== false;

    }


    if(payrollRounding){

        payrollRounding.value =
            String(
                data.payrollRounding ??
                0.01
            );

    }


    if(autoComputePayroll){

        autoComputePayroll.checked =
            data.autoComputePayroll !== false;

    }

}


/* ==========================================
   PAYROLL SAVE BUTTON
========================================== */

if(savePayrollBtn){

    savePayrollBtn.addEventListener(
        "click",
        savePayrollSettings
    );

}


/* ==========================================
   SAVE PAYROLL SETTINGS
========================================== */

async function savePayrollSettings(){

    if(!auth.currentUser){

        alert(
            "You are not logged in."
        );

        window.location.replace(
            "login.html"
        );

        return;

    }


    /* ======================================
       VALIDATION
    ====================================== */

    const selectedPayDay =
        Number(
            payDay.value
        );


    if(
        !Number.isInteger(
            selectedPayDay
        ) ||
        selectedPayDay < 1 ||
        selectedPayDay > 31
    ){

        alert(
            "Pay Day must be between 1 and 31."
        );

        payDay.focus();

        return;

    }


    const workingDays =
        Number(
            workingDaysPerMonth.value
        );


    if(
        !Number.isFinite(
            workingDays
        ) ||
        workingDays < 1 ||
        workingDays > 31
    ){

        alert(
            "Working Days Per Month must be between 1 and 31."
        );

        workingDaysPerMonth.focus();

        return;

    }


    const dailyHours =
        Number(
            hoursPerDay.value
        );


    if(
        !Number.isFinite(
            dailyHours
        ) ||
        dailyHours <= 0 ||
        dailyHours > 24
    ){

        alert(
            "Regular Hours Per Day must be between 1 and 24."
        );

        hoursPerDay.focus();

        return;

    }


    const regularOT =
        Number(
            regularOtRate.value
        );


    const restOT =
        Number(
            restDayOtRate.value
        );


    const holidayOT =
        Number(
            holidayOtRate.value
        );


    if(
        !Number.isFinite(regularOT) ||
        regularOT < 0
    ){

        alert(
            "Regular Day OT Rate is invalid."
        );

        regularOtRate.focus();

        return;

    }


    if(
        !Number.isFinite(restOT) ||
        restOT < 0
    ){

        alert(
            "Rest Day OT Rate is invalid."
        );

        restDayOtRate.focus();

        return;

    }


    if(
        !Number.isFinite(holidayOT) ||
        holidayOT < 0
    ){

        alert(
            "Holiday OT Rate is invalid."
        );

        holidayOtRate.focus();

        return;

    }


    /* ======================================
       DISABLE BUTTON
    ====================================== */

    savePayrollBtn.disabled =
        true;


    savePayrollBtn.innerHTML = `

        <span class="material-icons">
            sync
        </span>

        SAVING...

    `;


    try{

        /* ==================================
           PAYROLL DATA
        ================================== */

        const payrollData = {

            payFrequency:
                payFrequency.value,

            payDay:
                selectedPayDay,

            firstCutoffStart:
                firstCutoffStart.value,

            firstCutoffEnd:
                firstCutoffEnd.value,

            secondCutoffStart:
                secondCutoffStart.value,

            secondCutoffEnd:
                secondCutoffEnd.value,

            salaryBasis:
                salaryBasis.value,

            workingDaysPerMonth:
                workingDays,

            hoursPerDay:
                dailyHours,

            hourlyRateMethod:
                hourlyRateMethod.value,

            includeOvertimePay:
                includeOvertimePay.checked,

            regularOtRate:
                regularOT,

            restDayOtRate:
                restOT,

            holidayOtRate:
                holidayOT,

            deductLate:
                deductLate.checked,

            deductUndertime:
                deductUndertime.checked,

            deductionRounding:
                Number(
                    deductionRounding.value
                ),

            enableGovernmentDeductions:
                enableGovernmentDeductions.checked,

            enableSSS:
                enableSSS.checked,

            enablePhilHealth:
                enablePhilHealth.checked,

            enablePagIBIG:
                enablePagIBIG.checked,

            enableTax:
                enableTax.checked,

            enableHealthCard:
                enableHealthCard.checked,

            enableOtherDeductions:
                enableOtherDeductions.checked,

            payrollRounding:
                Number(
                    payrollRounding.value
                ),

            autoComputePayroll:
                autoComputePayroll.checked

        };


        /* ==================================
           FIREBASE REFERENCE
        ================================== */

        const payrollSettingsRef =
            doc(
                db,
                "systemSettings",
                "payroll"
            );


        /* ==================================
           SAVE
        ================================== */

        await setDoc(

            payrollSettingsRef,

            payrollData,

            {
                merge:true
            }

        );


        alert(
            "Payroll Settings Saved Successfully."
        );


    }catch(error){

        console.error(
            "Save Payroll Settings Error:",
            error
        );


        alert(
            "Unable to save Payroll Settings.\n\n" +
            error.message
        );


    }finally{

        savePayrollBtn.disabled =
            false;


        savePayrollBtn.innerHTML = `

            <span class="material-icons">
                save
            </span>

            SAVE PAYROLL SETTINGS

        `;

    }

}

/* ==========================================
   PAPPRITO HRIS
   LEAVE SETTINGS
========================================== */


/* ==========================================
   LEAVE SETTINGS ELEMENTS
========================================== */

const enableLeaveRequest =
    document.getElementById(
        "enableLeaveRequest"
    );

const leaveAdvanceDays =
    document.getElementById(
        "leaveAdvanceDays"
    );

const maxLeaveDaysPerRequest =
    document.getElementById(
        "maxLeaveDaysPerRequest"
    );

const allowHalfDayLeave =
    document.getElementById(
        "allowHalfDayLeave"
    );

const allowBackdatedLeave =
    document.getElementById(
        "allowBackdatedLeave"
    );


/* ==========================================
   LEAVE TYPES
========================================== */

const leaveAnnual =
    document.getElementById(
        "leaveAnnual"
    );

const leaveSick =
    document.getElementById(
        "leaveSick"
    );

const leaveEmergency =
    document.getElementById(
        "leaveEmergency"
    );

const leaveUnpaid =
    document.getElementById(
        "leaveUnpaid"
    );

const leaveOther =
    document.getElementById(
        "leaveOther"
    );


/* ==========================================
   APPROVAL
========================================== */

const requireLeaveApproval =
    document.getElementById(
        "requireLeaveApproval"
    );

const leaveApprovalLevel =
    document.getElementById(
        "leaveApprovalLevel"
    );

const autoRejectInvalidLeave =
    document.getElementById(
        "autoRejectInvalidLeave"
    );


/* ==========================================
   LEAVE BALANCE
========================================== */

const enableLeaveBalance =
    document.getElementById(
        "enableLeaveBalance"
    );

const defaultAnnualLeave =
    document.getElementById(
        "defaultAnnualLeave"
    );

const defaultSickLeave =
    document.getElementById(
        "defaultSickLeave"
    );

const allowLeaveCarryForward =
    document.getElementById(
        "allowLeaveCarryForward"
    );


/* ==========================================
   EMPLOYEE PORTAL
========================================== */

const portalLeaveRequest =
    document.getElementById(
        "portalLeaveRequest"
    );

const portalLeaveHistory =
    document.getElementById(
        "portalLeaveHistory"
    );

const portalLeaveBalance =
    document.getElementById(
        "portalLeaveBalance"
    );

const portalLeaveCancel =
    document.getElementById(
        "portalLeaveCancel"
    );


/* ==========================================
   SAVE BUTTON
========================================== */

const saveLeaveBtn =
    document.getElementById(
        "saveLeaveBtn"
    );


/* ==========================================
   DEFAULT LEAVE SETTINGS
========================================== */

const DEFAULT_LEAVE_SETTINGS = {

    enableLeaveRequest:
        true,

    leaveAdvanceDays:
        1,

    maxLeaveDaysPerRequest:
        30,

    allowHalfDayLeave:
        true,

    allowBackdatedLeave:
        false,


    /* Leave Types */

    leaveAnnual:
        true,

    leaveSick:
        true,

    leaveEmergency:
        true,

    leaveUnpaid:
        true,

    leaveOther:
        true,


    /* Approval */

    requireLeaveApproval:
        true,

    leaveApprovalLevel:
        "hr",

    autoRejectInvalidLeave:
        false,


    /* Balance */

    enableLeaveBalance:
        true,

    defaultAnnualLeave:
        30,

    defaultSickLeave:
        15,

    allowLeaveCarryForward:
        false,


    /* Employee Portal */

    portalLeaveRequest:
        true,

    portalLeaveHistory:
        true,

    portalLeaveBalance:
        true,

    portalLeaveCancel:
        true

};


/* ==========================================
   LOAD LEAVE SETTINGS
========================================== */

async function loadLeaveSettings(){

    try{

        const leaveSettingsRef =
            doc(
                db,
                "systemSettings",
                "leaves"
            );


        const snapshot =
            await getDoc(
                leaveSettingsRef
            );


        let data =
            DEFAULT_LEAVE_SETTINGS;


        if(
            snapshot.exists()
        ){

            data = {

                ...DEFAULT_LEAVE_SETTINGS,

                ...snapshot.data()

            };

        }


        setLeaveSettingsForm(
            data
        );


    }catch(error){

        console.error(
            "Load Leave Settings Error:",
            error
        );


        setLeaveSettingsForm(
            DEFAULT_LEAVE_SETTINGS
        );

    }

}


/* ==========================================
   SET LEAVE FORM VALUES
========================================== */

function setLeaveSettingsForm(
    data
){

    /* ======================================
       REQUEST SETTINGS
    ====================================== */

    if(enableLeaveRequest){

        enableLeaveRequest.checked =
            data.enableLeaveRequest !== false;

    }


    if(leaveAdvanceDays){

        leaveAdvanceDays.value =
            data.leaveAdvanceDays ?? 1;

    }


    if(maxLeaveDaysPerRequest){

        maxLeaveDaysPerRequest.value =
            data.maxLeaveDaysPerRequest ?? 30;

    }


    if(allowHalfDayLeave){

        allowHalfDayLeave.checked =
            data.allowHalfDayLeave !== false;

    }


    if(allowBackdatedLeave){

        allowBackdatedLeave.checked =
            data.allowBackdatedLeave === true;

    }


    /* ======================================
       LEAVE TYPES
    ====================================== */

    if(leaveAnnual){

        leaveAnnual.checked =
            data.leaveAnnual !== false;

    }


    if(leaveSick){

        leaveSick.checked =
            data.leaveSick !== false;

    }


    if(leaveEmergency){

        leaveEmergency.checked =
            data.leaveEmergency !== false;

    }


    if(leaveUnpaid){

        leaveUnpaid.checked =
            data.leaveUnpaid !== false;

    }


    if(leaveOther){

        leaveOther.checked =
            data.leaveOther !== false;

    }


    /* ======================================
       APPROVAL
    ====================================== */

    if(requireLeaveApproval){

        requireLeaveApproval.checked =
            data.requireLeaveApproval !== false;

    }


    if(leaveApprovalLevel){

        leaveApprovalLevel.value =
            data.leaveApprovalLevel ||
            "hr";

    }


    if(autoRejectInvalidLeave){

        autoRejectInvalidLeave.checked =
            data.autoRejectInvalidLeave === true;

    }


    /* ======================================
       BALANCE
    ====================================== */

    if(enableLeaveBalance){

        enableLeaveBalance.checked =
            data.enableLeaveBalance !== false;

    }


    if(defaultAnnualLeave){

        defaultAnnualLeave.value =
            data.defaultAnnualLeave ?? 30;

    }


    if(defaultSickLeave){

        defaultSickLeave.value =
            data.defaultSickLeave ?? 15;

    }


    if(allowLeaveCarryForward){

        allowLeaveCarryForward.checked =
            data.allowLeaveCarryForward === true;

    }


    /* ======================================
       EMPLOYEE PORTAL
    ====================================== */

    if(portalLeaveRequest){

        portalLeaveRequest.checked =
            data.portalLeaveRequest !== false;

    }


    if(portalLeaveHistory){

        portalLeaveHistory.checked =
            data.portalLeaveHistory !== false;

    }


    if(portalLeaveBalance){

        portalLeaveBalance.checked =
            data.portalLeaveBalance !== false;

    }


    if(portalLeaveCancel){

        portalLeaveCancel.checked =
            data.portalLeaveCancel !== false;

    }

}


/* ==========================================
   SAVE BUTTON EVENT
========================================== */

if(saveLeaveBtn){

    saveLeaveBtn.addEventListener(
        "click",
        saveLeaveSettings
    );

}


/* ==========================================
   SAVE LEAVE SETTINGS
========================================== */

async function saveLeaveSettings(){

    if(!auth.currentUser){

        alert(
            "You are not logged in."
        );

        window.location.replace(
            "login.html"
        );

        return;

    }


    /* ======================================
       VALIDATION
    ====================================== */

    const advanceDays =
        Number(
            leaveAdvanceDays.value
        );


    if(
        !Number.isFinite(
            advanceDays
        ) ||
        advanceDays < 0 ||
        advanceDays > 365
    ){

        alert(
            "Minimum Advance Request must be between 0 and 365 days."
        );

        leaveAdvanceDays.focus();

        return;

    }


    const maximumDays =
        Number(
            maxLeaveDaysPerRequest.value
        );


    if(
        !Number.isFinite(
            maximumDays
        ) ||
        maximumDays < 1 ||
        maximumDays > 365
    ){

        alert(
            "Maximum Days Per Request must be between 1 and 365."
        );

        maxLeaveDaysPerRequest.focus();

        return;

    }


    const annualLeave =
        Number(
            defaultAnnualLeave.value
        );


    if(
        !Number.isFinite(
            annualLeave
        ) ||
        annualLeave < 0 ||
        annualLeave > 365
    ){

        alert(
            "Default Annual Leave must be between 0 and 365 days."
        );

        defaultAnnualLeave.focus();

        return;

    }


    const sickLeave =
        Number(
            defaultSickLeave.value
        );


    if(
        !Number.isFinite(
            sickLeave
        ) ||
        sickLeave < 0 ||
        sickLeave > 365
    ){

        alert(
            "Default Sick Leave must be between 0 and 365 days."
        );

        defaultSickLeave.focus();

        return;

    }


    /* ======================================
       DISABLE BUTTON
    ====================================== */

    saveLeaveBtn.disabled =
        true;


    saveLeaveBtn.innerHTML = `

        <span class="material-icons">
            sync
        </span>

        SAVING...

    `;


    try{

        /* ==================================
           LEAVE DATA
        ================================== */

        const leaveData = {

            /* Request */

            enableLeaveRequest:
                enableLeaveRequest.checked,

            leaveAdvanceDays:
                advanceDays,

            maxLeaveDaysPerRequest:
                maximumDays,

            allowHalfDayLeave:
                allowHalfDayLeave.checked,

            allowBackdatedLeave:
                allowBackdatedLeave.checked,


            /* Leave Types */

            leaveAnnual:
                leaveAnnual.checked,

            leaveSick:
                leaveSick.checked,

            leaveEmergency:
                leaveEmergency.checked,

            leaveUnpaid:
                leaveUnpaid.checked,

            leaveOther:
                leaveOther.checked,


            /* Approval */

            requireLeaveApproval:
                requireLeaveApproval.checked,

            leaveApprovalLevel:
                leaveApprovalLevel.value,

            autoRejectInvalidLeave:
                autoRejectInvalidLeave.checked,


            /* Balance */

            enableLeaveBalance:
                enableLeaveBalance.checked,

            defaultAnnualLeave:
                annualLeave,

            defaultSickLeave:
                sickLeave,

            allowLeaveCarryForward:
                allowLeaveCarryForward.checked,


            /* Employee Portal */

            portalLeaveRequest:
                portalLeaveRequest.checked,

            portalLeaveHistory:
                portalLeaveHistory.checked,

            portalLeaveBalance:
                portalLeaveBalance.checked,

            portalLeaveCancel:
                portalLeaveCancel.checked

        };


        /* ==================================
           FIREBASE REFERENCE
        ================================== */

        const leaveSettingsRef =
            doc(
                db,
                "systemSettings",
                "leaves"
            );


        /* ==================================
           SAVE
        ================================== */

        await setDoc(

            leaveSettingsRef,

            leaveData,

            {
                merge:true
            }

        );


        alert(
            "Leave Settings Saved Successfully."
        );


    }catch(error){

        console.error(
            "Save Leave Settings Error:",
            error
        );


        alert(
            "Unable to save Leave Settings.\n\n" +
            error.message
        );


    }finally{

        saveLeaveBtn.disabled =
            false;


        saveLeaveBtn.innerHTML = `

            <span class="material-icons">
                save
            </span>

            SAVE LEAVE SETTINGS

        `;

    }

}
