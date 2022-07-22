//Variables
let mainForm=document.querySelectorAll(".main");

let stepList = document.querySelectorAll(".progress-bar li");

let nextButton=document.querySelectorAll(".next_button");
let backButton=document.querySelectorAll(".back_button");

let stepNumber = document.querySelector(".step-number");
let stepNumberContent=document.querySelectorAll(".step-number-content");

let finalSubmit=document.querySelector(".submit_button");

let actualStepNumber=0;
let progressIntervalId;
let iterator = 0

const stepLabels = ["Implémentation du modèle", "Ajout des contraintes", "Détermination des solutions", "Impression du résultat"]
let display_steps = document.querySelector(".sub_steps-name p")


//Add event listeners

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

/* finalSubmit.addEventListener('click',() =>{
//     actualStepNumber++;
//     updateform(); 
// });*/

 
// Intermediates methodes

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
    validate_inputs.forEach(function(vaildate_input){
        vaildate_input.classList.remove('warning');
        if(vaildate_input.hasAttribute('require')){
            if(vaildate_input.value.length==0){
                validate=false;
                vaildate_input.classList.add('warning');
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