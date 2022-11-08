import * as user from './api_bridge.js';

// Notifications variables
let success_notification_message = document.querySelector('.good.banner-message');
let error_notification_message = document.querySelector('.bad.banner-message');
let notification_close = document.querySelectorAll('.banner-close');

//Variables
let mainForm=document.querySelectorAll(".main");

let stepList = document.querySelectorAll(".progress-bar li");

let nextButton=document.querySelectorAll(".next_button");
let backButton=document.querySelectorAll(".back_button");

let stepNumber = document.querySelector(".step-number");
let stepNumberContent=document.querySelectorAll(".step-number-content");

let final_button=document.getElementById("final_button");
let validation_button=document.getElementById("validation_button");

let result_section = document.getElementById('main-result'); 
let docDefinition;
let pdf_download_btn = document.getElementById('btn-pdf-download'); 
let excel_download_btn = document.getElementById('btn-excel-download'); 

let actualStepNumber=0;
let progressIntervalId;
let iterator = 0

const stepLabels = ["Implementing the model", "Adding constraints", "Determining solutions", "Printing the result"]
let display_steps = document.querySelector(".sub_steps-name p")
let last_section = document.getElementById("last-section")

// Forms variable
let uploadForm = document.getElementById("upload_form");
let select_feature_form = document.getElementById("select-feature")
let inputFile = document.getElementById("c_file");
let input_file_placeholder = document.getElementById('input_file_placeholder');

let int_constraints_form = document.getElementById("int-constraint-define");
let enum_constraints_form = document.getElementById("enum-constraint-define");
let limit_constraint_form = document.getElementById("limit-constraint-define");

// Tables variables
let validate_int = document.getElementById('validate-int');
let validate_enum = document.getElementById('validate-enum');

let end_constraints_btn = document.getElementById('end-constraints');
let limit_btn = document.getElementById('limit_button');

let upload_file_nextBtn = document.getElementById("file_upload_next");
upload_file_nextBtn.style.display = "none"

let all_enum_details = [];
let enum_constraints_to_save = [];
let actual_features_values = [];

let limit_proposition = -1;
// Add event listeners
nextButton.forEach( (nextBtn) =>{
    nextBtn.addEventListener('click',() =>{
        if(!validateform()){
            return false
        }
        actualStepNumber++;
        updateform();
        progress_forward();
        contentchange();
        if(actualStepNumber==4){
            start_progressing()
        }
    });
}); 

backButton.forEach( (backBtn) => {
    backBtn.addEventListener('click',() =>{
        actualStepNumber--;
        updateform();
        progress_backward();
        contentchange();
    });
});

uploadForm.addEventListener('submit', manage_file_uploaded)
select_feature_form.addEventListener('submit', manage_features_selected)
int_constraints_form.addEventListener('submit', save_int_constraints)
enum_constraints_form.addEventListener('submit', get_enum_constraints)
limit_constraint_form.addEventListener('submit', go_to_constraint_validation)
 inputFile.addEventListener('change', () =>{
     if(inputFile.files.length > 0) {
        let filename = inputFile.value.split(/[\\\/]+/).pop()
        input_file_placeholder.innerHTML = "The file <code>"+filename+"</code> has been uploaded"
     }
 });

final_button.addEventListener('click', launch_solving)
validation_button.addEventListener('click', go_to_final_validation)

pdf_download_btn.addEventListener('click', download_solutions_pdf)
excel_download_btn.addEventListener('click', download_solutions_excel)

const hideBanners = () => {
    document.querySelectorAll(".banner.visible")
            .forEach((b) => b.classList.remove("visible"));
};

// Event added for x-mark button click for closing the notification banner
[...notification_close].forEach((xmark) => xmark.addEventListener('click', function (){
    hideBanners();
}));


// Intermediates methodes
function manage_file_uploaded(e){
    e.preventDefault();
    const file = document.getElementById('c_file').files[0];
    e.target.reset();
    upload_file(file);
}

function manage_features_selected(e) {
    e.preventDefault();
    let feature_elmt = document.querySelectorAll('.features_checkbox');
    let all_features = JSON.parse(localStorage.getItem('features')).data
    let selected_features = []
    for(let f of feature_elmt) {
        if(f.checked){
            selected_features.push({
                "name" : f.value,
                "type" : all_features[f.value]
            })
        }
    }
    save_features(selected_features);
}
 
function updateform(){
    mainForm.forEach( (eachForm) =>{
        eachForm.classList.remove('active');
    });
    mainForm[actualStepNumber].classList.add('active');
} 
 
function progress_forward(){  
    if(actualStepNumber < stepList.length){
        stepNumber.innerHTML = actualStepNumber+1;
        stepList[actualStepNumber].classList.add('active');
    }else{
        re_design()
    }
}  

function progress_backward(){
    let mainFormNum = actualStepNumber+1;
    stepList[mainFormNum].classList.remove('active');
    stepNumber.innerHTML = mainFormNum;
}

function contentchange(){
    stepNumberContent.forEach( (content) =>{
        content.classList.remove('active'); 
        content.classList.add('d-none');
     }); 
     if(actualStepNumber < stepList.length){
        stepNumberContent[actualStepNumber].classList.remove('d-none');
        stepNumberContent[actualStepNumber].classList.add('active');
    }
} 

function re_design(){
    document.querySelector(".left-side").style.display = "none";
    document.querySelector(".right-side").style.width = "100%"
}

function validateform(){
    let validate=true;
    let validate_inputs=document.querySelectorAll(".main.active input");
    validate_inputs.forEach(function(validate_input){
        validate_input.classList.remove('warning');
        if(validate_input.hasAttribute('require')){
            if(validate_input.value.length==0){
                validate=false;
                validate_input.classList.add('warning');
            }
        }
    });
    return validate;
    
}

function start_progressing(){
    progressIntervalId = setInterval(()=>{
        display_steps.innerHTML = stepLabels[iterator]
        iterator++
        if(iterator==4){
            display_steps.innerHTML = '...'
            clearInterval(progressIntervalId);
        }
    }, 1000);
}

function stop_progressing(){
    clearInterval(progressIntervalId);
    display_steps.style.display = "none";
    last_section.style.display = "none";
}

// Notification banner management
const showBanner = (selector) => {
    hideBanners();
    requestAnimationFrame(() => {
      const banner = document.querySelector(selector);
      banner.classList.add("visible");
    });
};
  
function notify(type, message){
    if(type){
        success_notification_message.innerHTML = message;
        showBanner(".banner.success")
    }else{
        error_notification_message.innerHTML = message;
        showBanner(".banner.error");
    }
}

function redirect_to(path, duration) {
    setTimeout(()=>{
        window.location.replace(path);
    }, duration);
}

async function upload_file(file){
    if (user.is_authenticated()) {
        try {
            let token = JSON.parse(localStorage.getItem('user')).token;
            let user_id = JSON.parse(localStorage.getItem('user')).user_id;
            let response = await user.upload_candidate_file(file, token, user_id)
            if(response.ok){
                let data = response.json();
                data.then((data)=>{
                    localStorage.setItem('features', JSON.stringify(data))
                    input_file_placeholder.innerHTML = "File uploaded"
                    notify(1, "File uploaded successfully! Click Next to continue")
                    fill_features(data.data);
                    upload_file_nextBtn.style.display = "block"
                });
            }else{
                if (response.status == 404) {
                    notify(0, "User not found... Make sure you have created an account!")
                }else if(response.status == 403) {
                    notify(0, "You are no longer connected... The authentication token has already expired!");
                    localStorage.removeItem('user');
                    redirect_to("/index.html", 2000);
                }else{
                    notify(0, "An error occurred... The file could not be uploaded !")
                }
            }
        } catch (error) {
            notify(0, "An error has occured")
            console.log(error);
        }
    } else {
        notify(0, "You are no longer connected... The authentication token has already expired!");
        localStorage.removeItem('user');
        redirect_to("/index.html", 2000);
    }

}

async function save_features(features){
    if (user.is_authenticated()) {
        try {
            let token = JSON.parse(localStorage.getItem('user')).token;
            let user_id = JSON.parse(localStorage.getItem('user')).user_id;
            let cFile_id = JSON.parse(localStorage.getItem('features')).c_file_id;
            let response = await user.save_features(features, cFile_id, token, user_id)
            if(response.ok){
                let data = response.json();
                data.then((data)=>{
                    manage_constraints_definition();
                    document.getElementById('validate-f-select').style.display="none";
                    notify(1, "Features successfully saved! Click Next to continue")

                });
            }else{
                if (response.status == 404) {
                    notify(0, "User not found... Make sure you have created an account!")
                }
                else if(response.status == 403) {
                    notify(0, "You are no longer connected... The authentication token has already expired!");
                    localStorage.removeItem('user');
                    redirect_to("/index.html", 2000);
                }else{
                    notify(0, "An error has occurred... The features could not be saved!")
                }
            }
        } catch (error) {
            notify(0, "An error has occured")
            console.log(message);
        }
    } else {
        notify(0, "You are no longer connected... The authentication token has already expired!");
        localStorage.removeItem('user');
        redirect_to("/index.html", 2000);
    }
}

async function save_int_constraints(e){
    e.preventDefault();
    if (user.is_authenticated()) {
        try {
            let token = JSON.parse(localStorage.getItem('user')).token;
            let all_int_constraints = get_int_constraints();
            let response = await user.save_iconstraints(all_int_constraints, token)
            if(response.ok){
                let data = response.json();
                data.then((data)=>{
                    int_constraints_form.style.display="none";
                    notify(1, "First criteria successfully defined! Please continue!");
                    enum_constraints_form.style.display="block";
                    fill_details_enum_features();
                });
            }else{
                if(response.status == 403) {
                    notify(0, "You are no longer connected... The authentication token has already expired!");
                    localStorage.removeItem('user');
                    redirect_to("/index.html", 2000);
                }else{
                    notify(0, "An error has occurred... The criteria could not be saved !")
                }
            }
        } catch (error) {
            notify(0, "An error has occured")
            console.log(error);
        }
    } else {
        notify(0, "You are no longer connected... The authentication token has already expired!");
        localStorage.removeItem('user');
        redirect_to("/index.html", 2000);
    } 
}

async function save_enum_constraints() {
    if (user.is_authenticated()) {
        try {
            let token = JSON.parse(localStorage.getItem('user')).token;
            let response = await user.save_econstraints(enum_constraints_to_save, token)
            if(response.ok){
                let data = response.json();
                data.then((data)=>{
                    console.log(data)
                    notify(1, "Criteria set successfully! Please click Next to continue !")
                });
            }else{
                if(response.status == 403) {
                    notify(0, "You are no longer connected... The authentication token has already expired!");
                    localStorage.removeItem('user');
                    redirect_to("/index.html", 2000);
                }else{
                    notify(0, "An error has occurred... The criteria could not be saved !")
                }
            }
        } catch (error) {
            notify(0, "An error has occured")
            console.log(error);
        }
    } else {
        notify(0, "You are no longer connected... The authentication token has already expired!");
        localStorage.removeItem('user');
        redirect_to("/index.html", 2000);
    }
}

async function go_to_constraint_validation(e) {
    e.preventDefault();
    limit_proposition = document.getElementById('limit-number').value;
    notify(1, "Criteria successfully defined... Click next to proceed to their validation !");
    limit_btn.style.display = "none";
    try {
        let token = JSON.parse(localStorage.getItem('user')).token;
        let cFile_id = JSON.parse(localStorage.getItem('features')).c_file_id;
        let response = await user.get_all_constraints(cFile_id, token)
        if(response.ok){
            let data = response.json();
            data.then((data)=>{
                console.log(data);
                fill_details_for_validation(data);
                end_constraints_btn.style.display = "block";
                final_button.style.display = "none";
            });
        }else{
            if (response.status == 404) {
                notify(0, "File not found... !")
            }
            else if(response.status == 403) {
                notify(0, "You are no longer connected... The authentication token has already expired!");
                localStorage.removeItem('user');
                redirect_to("/index.html", 2000);
            }else{
                notify(0, "An error has occured... !")
            }
        }
    } catch (error) {
        notify(0, "An error has occured")
        console.log(message);
    }
    
}

function go_to_final_validation(){
    validate_int.style.display = "none";
    validation_button.style.display = "none";
    validate_enum.style.display = "block";
    final_button.style.display = "block";

    result_section.style.display = "none";
}

async function launch_solving(){
    try {
        let token = JSON.parse(localStorage.getItem('user')).token;
        let cFile_id = JSON.parse(localStorage.getItem('features')).c_file_id;
        let response = await user.solve(cFile_id, token);
        if(response.ok){
            let data = response.json();
            data.then((data)=>{
                console.log(data)
                stop_progressing();
                display_results(data);
                notify(1, "Resolution completed successfully !")
            });
        }else{
            if(response.status == 403) {
                notify(0, "You are no longer connected... The authentication token has already expired!");
                localStorage.removeItem('user');
                redirect_to("/index.html", 2000);
            }else{
                notify(0, "An error has occured")
            }
        }
    } catch (error) {
        notify(0, "An error has occured")
        console.log(error);
    }
}

async function manage_constraints_definition() {
    try {
        let token = JSON.parse(localStorage.getItem('user')).token;
        let cFile_id = JSON.parse(localStorage.getItem('features')).c_file_id;
        enum_constraints_form.style.display = "none";
        limit_constraint_form.style.display = "none";
        end_constraints_btn.style.display = "none";
        manage_int_constraints_definition(cFile_id, token)
        manage_enum_constraints_definition(cFile_id, token)
        
    } catch (error) {
        console.log(error);
    }
}

async function manage_int_constraints_definition(cFile_id, token) {
    let response = await user.get_details_on_int_features(cFile_id, token)
    if(response.ok){
        let data = response.json();
        data.then((data)=>{
            fill_details_int_features(data);
        });
    }else{
        if (response.status == 404) {
            notify(0, "Features not found or not taken into account .")
        }
        else if(response.status == 403) {
            notify(0, "You are no longer connected... The authentication token has already expired!");
            localStorage.removeItem('user');
            redirect_to("/index.html", 2000);
        }else{
            notify(0, "An error has occured... !")
        }
    }
}

async function manage_enum_constraints_definition(cFile_id, token) {
    let response = await user.get_details_on_enum_features(cFile_id, token)
    if(response.ok){
        let data = response.json();
        data.then((data)=>{
            console.log("enum details length = ");
            all_enum_details = data;
            console.log(all_enum_details.length)
        });
    }else{
        if (response.status == 404) {
            notify(0, "Features not found or not taken into account .")
        }
        else if(response.status == 403) {
            notify(0, "You are no longer connected... The authentication token has already expired!");
            localStorage.removeItem('user');
            redirect_to("/index.html", 2000);
        }else{
            notify(0, "An error has occured... !")
        }
    }
}

function get_int_constraints() {
    let feature_inputs = document.querySelectorAll('.int-feature-input');
    let int_constraints = [] ;
    let feature_id = undefined;

    for(let feature_input of feature_inputs){
        feature_id = parseInt(feature_input.dataset.feature_id);
        int_constraints.push({
            min_value : parseInt(document.getElementById(feature_id+"_min").value),
            max_value : parseInt(document.getElementById(feature_id+"_max").value),
            feature_id : feature_id
        })
    }
    return int_constraints;
}

function get_enum_constraints(e) {
    e.preventDefault();
    let feature_id = document.getElementById("enum-feature-input").dataset.feature_id;
    
    for(let value of actual_features_values){
        let selectMetric = document.getElementById('main-metric'+value);
        let option = selectMetric.options[selectMetric.selectedIndex].value;

        if(option == "lessThan"){
            let input_value = document.getElementById(value+"_main").value;
            let second_input_value = document.getElementById(value+"_more").value;
            enum_constraints_to_save.push({
                value: value,
                number : parseInt(input_value),
                metric : "<=",
                feature_id : parseInt(feature_id)
            });
            if( !isNaN(parseInt(second_input_value))){
                enum_constraints_to_save.push({
                    value: value,
                    number : parseInt(second_input_value),
                    metric : ">=",
                    feature_id : parseInt(feature_id)
                });
            }
        }
        else if(option == "moreThan"){
            let input_value = document.getElementById(value+"_main").value;
            let second_input_value = document.getElementById(value+"_less").value;
            enum_constraints_to_save.push({
                value: value,
                number : parseInt(input_value),
                metric : ">=",
                feature_id : parseInt(feature_id)
            });
            if(!isNaN(parseInt(second_input_value))){
                enum_constraints_to_save.push({
                    value: value,
                    number : parseInt(second_input_value),
                    metric : "<=",
                    feature_id : parseInt(feature_id)
                });
            }
        }
        else{
            let input_value = document.getElementById(value+"_main").value;
            enum_constraints_to_save.push({
                value: value,
                number : parseInt(input_value),
                metric : "==",
                feature_id : parseInt(feature_id)
            });
        }
    }
    fill_details_enum_features();

}

function fill_features(features) {
    let features_container = document.getElementById('list_features');
    for (const key of Object.keys(features)) {
        features_container.innerHTML += `
            <div class="item">
                <input class="features_checkbox" name="feature_to_select[]" value="`+key+`" type="checkbox">
                <p>`+key+`</p>
            </div>
             `;
    }
}

function fill_details_int_features(data) {
    let int_constraints_container = document.getElementById('constraints-forms');
    for (let detail of data) {
        int_constraints_container.innerHTML += `
        <div class="int-feature-input feature-input" data-feature_id="`+detail.feature_id+`">
            <div class="feature-name">
                <p>`+detail.label+`</p>
            </div>
            <div class="int-input-container">
                <div class="int-input" title="The minimum value for this value">
                    <label for="feature_min">Min:</label>
                    <input type="number" id="`+detail.feature_id+"_min"+`" value="`+detail.min+`" min="`+detail.min+`" max="`+detail.max+`" name="`+detail.feature_id+"_min"+`" required>
                </div>
                <div class="int-input" title="The minimum value for this value">
                    <label for="feature_max">Max:</label>
                    <input type="number" id="`+detail.feature_id+"_max"+`" value="`+detail.max+`" min="`+(detail.min+1)+`" max="`+detail.max+`" name="`+detail.feature_id+"_max"+`" required>
                </div>
            </div>
        </div>
             `;
    }
}

function fill_details_enum_features() {
    if (all_enum_details.length != 0) {
        let feature = all_enum_details[0];
        let feature_name = Object.keys(feature)[0];
        let feature_values = feature[feature_name];
        let feature_id = feature_values[0].feature_id;
        let enum_constraints_container = document.getElementById('single-enum-container');
        actual_features_values = []

        document.getElementById("enum-feature-input").dataset.feature_id = feature_id;
        document.getElementById('enum-feature-name').innerText = feature_name;
        enum_constraints_container.innerHTML = " ";
        for (let detail of feature_values) {
            actual_features_values.push(detail.value);
            enum_constraints_container.innerHTML += `
            <div class="enum-input">
                <div class="feature-value">
                    <p>`+detail.value+`</p>
                </div>
                <div class="input-select">
                    <div class="select">
                        <select id="main-metric`+detail.value+`" name="main-metric`+detail.value+`" onchange = "show_option_for_enum(this.id)">
                            <option value="lessThan">Less Than</option>
                            <option value="moreThan">More Than</option>
                            <option value="equalTo">Exactly</option>
                        </select>
                    </div>
                    <input type="number" id="`+detail.value+`_main" min="0" max="`+detail.number+`" name="`+detail.value+`_main" required>
                </div>                                                
            </div>
            <div id="more-than-option`+detail.value+`" class="enum-input additional-option">
                <div class="feature-value">
                    <p>`+detail.value+`</p>
                </div>
                <div class="input-select">
                    <div class="select">
                        <select name="metric-less`+detail.value+`">
                            <option value="lessThan" disabled>Less Than</option>
                            <option value="moreThan" selected>More Than</option>
                            <option value="equalTo" disabled>Exactly</option>
                        </select>
                    </div>
                    <input type="number" id="`+detail.value+`_more" min="1" max="`+detail.number+`" name="`+detail.value+`_more">
                </div>
            </div>
            <div id="less-than-option`+detail.value+`" class="enum-input additional-option">
                <div class="feature-value">
                    <p>`+detail.value+`</p>
                </div>
                <div class="input-select">
                    <div class="select">
                        <select name="metric-more`+detail.value+`">
                            <option value="lessThan" selected>Less Than</option>
                            <option value="moreThan" disabled>More Than</option>
                            <option value="equalTo" disabled>Exactly</option>
                        </select>
                    </div>
                    <input type="number" id="`+detail.value+`_less" min="1" max="`+detail.number+`" name="`+detail.value+`_less">
                </div>
            </div>
                `;
        }
        all_enum_details.shift();
        
    } else {
        display_new_interface();
        save_enum_constraints();
    }
}

function fill_details_for_validation(data) {
    validate_enum.style.display = "none";
    final_button.style.display = "none";
    let int_tbody = "<tbody>";
    let enum_tbody = "<tbody>";
    for(let i_data of data.iconstraints){
        int_tbody+=`
        <tr>
            <td>`+i_data.feature_name+`</td>
            <td>`+i_data.min+`</td>
            <td>`+i_data.max+`</td>
        </tr>`
    }
    int_tbody+="</tbody>";

    for(let e_data of data.econstraints){
        enum_tbody+=`
        <tr>
            <td>`+e_data.feature_name+`</td>
            <td>`+e_data.value+`</td>
            <td>`+e_data.metric+`</td>
        </tr>`
    }
    enum_tbody+="</tbody>";

    validate_int.innerHTML = `
    <div class="underline-title">
        <p>Summary of constraints on integer Values</p>
        <hr>
    </div>
    <table class="responsive-table">
        <caption></caption>
        <thead>
            <tr>
                <th>Features</th>
                <th>Minimum value</th>
                <th>Maximum value</th>
                </tr>
        </thead>`
        +int_tbody+`
    </table>`

    validate_enum.innerHTML = `
    <div class="underline-title">
        <p>Summary of constraints on enumerated values</p>
        <hr>
    </div>
    <table class="responsive-table">
        <caption></caption>
        <thead>
            <tr>
                <th>Features</th>
                <th>Values</th>
                <th>Metric</th>
            </tr>
        </thead>`
        +enum_tbody+`
    </table>`
}

function display_new_interface() {
    enum_constraints_form.style.display = "none";
    limit_constraint_form.style.display = "block"
}

function display_results(data) {
    document.getElementById('resolution-status').innerText = data.status;
    document.getElementById('resolution-n-sol').innerText = data.number_of_solutions;

    let table_header = `<div class="table-row header">`;
    let select_list = `<div class="table">`;
    let single_row ;
    let sample_results = document.getElementById('sample-results');
    // let all_tables;

    for (let col of data.columns){
        table_header+=`<div class="cell">`+col+`</div>`
    }
    table_header+='</div>'  
    for(let one_list of data.solutions){
        select_list = `<div class="table">`;
        select_list+= table_header;
        for(let one_row of one_list){
            single_row = `<div class="table-row">`;
            for (let col of data.columns) {
                single_row+=`<div class="cell" data-title="`+col+`">`+one_row[col]+`</div>`
            }
            single_row+=`</div>`;
            select_list+=single_row;
        }
        select_list+=`</div>`;
        sample_results.innerHTML+=select_list;
    }
    result_section.style.display = "block";
}

function download_solutions_pdf() {
    
}