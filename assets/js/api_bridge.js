import * as url from './routes_url.js'


class CustomError {
    constructor() {
        this.message = "Une erreur est survenue! Réessayez ultérieurement";
      }
} 

class RequestError {
    constructor(message) {
        this.message = message;
      }
} 


async function register(form){
    let form_data = new FormData(form);
    let header = new Headers();

    let params = {
        method: "POST",
        mode: "cors",
        body: form_data,
        headers: header
    }
    try{
        return await fetch(url.REGISTER_URL, params);
    }catch(error){
        if(error.detail){
            throw new RequestError(error.detail);
        }else{
            throw new CustomError();
        }
    }
}

async function log_user(email, pwd){
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
    try{
        const response = await fetch(url.LOGIN_URL, params);
        if(response.ok){
            return response.json;
        }
    }catch(error){
        if(error.detail){
            throw new RequestError(error.detail);
        }else{
            throw new CustomError();
        }
    }
}

export {register, log_user}