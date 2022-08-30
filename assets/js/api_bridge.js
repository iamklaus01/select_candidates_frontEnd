import * as url from './routes_url.js'

// Error classe
class Error {
    constructor(message, status) {
        if(status == 500){
            this.message = "Une erreur est survenue ! Veuillez réessayer ultérieurement. Si le problème persiste, contactez l'équipe de développement";
        }else{
            this.message = message
        }
        this.status = status;
    }
} 


function register(form){
    let form_data = new FormData(form);
    let header = new Headers();

    let params = {
        method: "POST",
        mode: "cors",
        body: form_data,
        headers: header
    }
    fetch(url.REGISTER_URL, params)
    .then((response) =>{
        if(response.ok)
            return response.json
    })
    .then((data) =>{
        return data;
    })
    .catch((e) =>{
        throw new Error(e.status_code, e.detail);
    })
}

function log_user(email, pwd){
    let header = new Headers();
    
    let body_data = {
        "email": email,
        "password": pwd
    };
    let params = {
        method: "POST",
        body: body_data,
        mode: "cors",
        headers: header
    }
    fetch(url.LOGIN_URL, params)
    .then((response) =>{
        if(response.ok)
            return response.json
    })
    .then((data) =>{
        return data;
    })
    .catch((e) =>{
        throw new Error(e.status_code, e.detail);
    })
}

export {register, log_user}