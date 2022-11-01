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

let finalSubmit=document.querySelector(".submit_button");

let selectMetric = document.getElementById('main-metric');
let moreForm = document.getElementById('more-than-option');
let lessForm = document.getElementById('less-than-option');

let actualStepNumber=0;
let progressIntervalId;
let iterator = 0

const stepLabels = ["Implémentation du modèle", "Ajout des contraintes", "Détermination des solutions", "Impression du résultat"]
let display_steps = document.querySelector(".sub_steps-name p")

// Forms variable
let uploadForm = document.getElementById("upload_form");
let select_feature_form = document.getElementById("select-feature")
let inputFile = document.getElementById("c_file");
let input_file_placeholder = document.getElementById('input_file_placeholder');

let int_constraints_form = document.getElementById("int-constraint-define");
let enum_constraints_form = document.getElementById("enum-constraint-define");

let upload_file_nextBtn = document.getElementById("file_upload_next");
upload_file_nextBtn.style.display = "none"

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
            console.log('Progressing starting')
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

uploadForm.addEventListener('submit', manage_file_uploaded);
select_feature_form.addEventListener('submit', manage_features_selected);
int_constraints_form.addEventListener('submit', save_int_constraints)
enum_constraints_form.addEventListener('submit', save_enum_constraints)

 inputFile.addEventListener('change', () =>{
     if(inputFile.files.length > 0) {
        let filename = inputFile.value.split(/[\\\/]+/).pop()
        input_file_placeholder.innerHTML = "Le fichier <code>"+filename+"</code> est uploadé"
     }
 });

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
    console.log(selected_features);
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

function show_option_for_enum(){
    let option = selectMetric.options[selectMetric.selectedIndex].value
    
    if(option == "lessThan"){
        moreForm.classList.remove('hide')
        moreForm.classList.add('show')
        lessForm.classList.remove('show')
        lessForm.classList.add('hide')

        document.querySelector('.indicator').style.display='block'
    }
    else if(option == "moreThan"){
        lessForm.classList.remove('hide')
        lessForm.classList.add('show')
        moreForm.classList.remove('show')
        moreForm.classList.add('hide')
        document.querySelector('.indicator').style.display='block'
    }
    else{
        moreForm.classList.remove('show')
        lessForm.classList.remove('show')
        moreForm.classList.add('hide')
        lessForm.classList.add('hide')

        document.querySelector('.indicator').style.display='none'
    }
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
    //
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
                    input_file_placeholder.innerHTML = "Fichier uploadé"
                    notify(1, "Fichier uploadé avec succès ! Cliquez sur Suivant pour continuer")
                    fill_features(data.data);
                    upload_file_nextBtn.style.display = "block"
                });
            }else{
                if (response.status == 404) {
                    notify(0, "Utilisateur non trouvé... Assurez-vous d'avoir créé un compte !")
                }else if(response.status == 403) {
                    notify(0, "Vous n'êtes plus connecté.es... Le token d'authentification a déjà expiré !");
                    localStorage.removeItem('user');
                    redirect_to("/index.html", 2000);
                }else{
                    notify(0, "Une erreur est survenue... Le fichier n'a pas pu être uploadé !")
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    } else {
        notify(0, "Vous n'êtes plus connecté.es... Le token d'authentification a déjà expiré !");
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
                    console.log(data)
                    manage_constraints_definition();
                    document.getElementById('validate-f-select').style.display="none";
                    notify(1, "Caractéristiques sauvegardées avec succès ! Cliquez sur Suivant pour continuer")

                });
            }else{
                if (response.status == 404) {
                    notify(0, "Utilisateur non trouvé... Assurez-vous d'avoir créé un compte !")
                }
                else if(response.status == 403) {
                    notify(0, "Vous n'êtes plus connecté.es... Le token d'authentification a déjà expiré !");
                    localStorage.removeItem('user');
                    redirect_to("/index.html", 2000);
                }else{
                    notify(0, "Une erreur est survenue... Les caractéristiques n'ont pas pu être enregistrées !")
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    } else {
        notify(0, "Vous n'êtes plus connecté.es... Le token d'authentification a déjà expiré !");
        localStorage.removeItem('user');
        redirect_to("/index.html", 2000);
    }
}

async function save_int_constraints(e){
    console.log('Submitted for int')
    e.preventDefault();
    if (user.is_authenticated()) {
        try {
            let token = JSON.parse(localStorage.getItem('user')).token;
            let all_int_constraints = get_int_constraints();
            let response = await user.save_iconstraints(all_int_constraints, token)
            if(response.ok){
                let data = response.json();
                data.then((data)=>{
                    console.log(data)
                    int_constraints_form.style.display="none";
                    enum_constraints_form.style.display="block";
                    notify(1, "Critères définis avec succès ! Veuillez continuer !")
                });
            }else{
                if(response.status == 403) {
                    notify(0, "Vous n'êtes plus connecté.es... Le token d'authentification a déjà expiré !");
                    localStorage.removeItem('user');
                    redirect_to("/index.html", 2000);
                }else{
                    notify(0, "Une erreur est survenue... Les critères n'ont pas pu être enregistrés !")
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    } else {
        notify(0, "Vous n'êtes plus connecté.es... Le token d'authentification a déjà expiré !");
        localStorage.removeItem('user');
        redirect_to("/index.html", 2000);
    }
}

async function save_enum_constraints(e) {
    
}


async function manage_constraints_definition() {
    try {
        let token = JSON.parse(localStorage.getItem('user')).token;
        let cFile_id = JSON.parse(localStorage.getItem('features')).c_file_id;
        enum_constraints_form.style.display = "none";
        manage_int_constraints_definition(cFile_id, token)
        manage_enum_constraints_definition(cFile_id, token)
        
    } catch (error) {
        console.log(error.message);
    }
}

async function manage_int_constraints_definition(cFile_id, token) {
    let response = await user.get_details_on_int_features(cFile_id, token)
    if(response.ok){
        let data = response.json();
        data.then((data)=>{
            console.log(data)
            fill_details_int_features(data);
        });
    }else{
        if (response.status == 404) {
            notify(0, "Caractéristiques introuvables ou non prises en compte.")
        }
        else if(response.status == 403) {
            notify(0, "Vous n'êtes plus connecté.es... Le token d'authentification a déjà expiré !");
            localStorage.removeItem('user');
            redirect_to("/index.html", 2000);
        }else{
            notify(0, "Une erreur est survenue... !")
        }
    }
}

async function manage_enum_constraints_definition(cFile_id, token) {
    let response = await user.get_details_on_enum_features(cFile_id, token)
    if(response.ok){
        let data = response.json();
        data.then((data)=>{
            console.log(data)
            fill_details_enum_features(data);
        });
    }else{
        if (response.status == 404) {
            notify(0, "Caractéristiques introuvables ou non prises en compte.")
        }
        else if(response.status == 403) {
            notify(0, "Vous n'êtes plus connecté.es... Le token d'authentification a déjà expiré !");
            localStorage.removeItem('user');
            redirect_to("/index.html", 2000);
        }else{
            notify(0, "Une erreur est survenue... !")
        }
    }
}

function get_int_constraints() {
    let feature_inputs = document.querySelectorAll('.feature-input');
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
    console.log(int_constraints);
    return int_constraints;
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
        <div class="feature-input" data-feature_id="`+detail.feature_id+`">
            <div class="feature-name">
                <p>`+detail.label+`</p>
            </div>
            <div class="int-input-container">
                <div class="int-input" title="Le minimum pour cette caractéristique">
                    <label for="feature_min">Min:</label>
                    <input type="number" id="`+detail.feature_id+"_min"+`" value="`+detail.min+`" min="`+detail.min+`" max="`+detail.max+`" name="`+detail.feature_id+"_min"+`" required>
                </div>
                <div class="int-input" title="Le maximum pour cette caractéristique">
                    <label for="feature_max">Max:</label>
                    <input type="number" id="`+detail.feature_id+"_max"+`" value="`+detail.max+`" min="`+(detail.min+1)+`" max="`+detail.max+`" name="`+detail.feature_id+"_max"+`" required>
                </div>
            </div>
        </div>
             `;
    }
}

function fill_details_enum_features(data) {
    
}
