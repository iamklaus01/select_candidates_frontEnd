import * as url from './routes_url.js'

class CustomError {
    constructor() {
        this.message = "An error has occured... Please try later !";
      }
} 

class RequestError {
    constructor(message) {
        this.message = message;
      }
} 


export async function register(form){
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
        console.log(error)
        if(error.detail){
            throw new RequestError(error.detail);
        }else{
            throw new CustomError();
        }
    }
}

export async function log_user(email, pwd){
    //let header = new Headers();
    let header = {
        'Access-Control-Allow-Origin': "*",
        'Access-Control-Allow-Headers': "Content-Type",
        'Content-type': "application/json"
    }

    let body_data = JSON.stringify({
        email: email,
        password: pwd
    });

    let params = {
        method: "POST",
        mode: "cors",
        body: body_data,
        headers: header
    }
    try{
        return await fetch(url.LOGIN_URL, params);
    }catch(error){
        console.log(error);
        if(error.detail){
            console.log(error.detail);
            throw new RequestError(error.detail);
        }else{
            throw new CustomError();
        }
    }
}

export async function logout(token){
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token)

    let params = {
        method: "POST",
        mode: "cors",
        headers: header,
    }
    try{
        return await fetch( url.LOGOUT_URL, params);
    }catch(error){
        console.log(error)
    }
}

export async function get_user_info(token, user_id) {
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token)

    let params = {
        method: "GET",
        mode: "cors",
        headers: header,
    }
    try{
        return await fetch( url.PROFILE_URL+"/"+user_id, params);
    }catch(error){
        console.log(error)
    }
    
}

export async function update_user_info(token, user_id, form){
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token)
    let form_data = new FormData(form);
    let params = {
        method: "PUT",
        mode: "cors",
        body:form_data,
        headers: header,
    }
    try{
        return await fetch( url.PROFILE_UPDATE_URL+"/"+user_id, params);
    }catch(error){
        console.log(error)
    }
}

export async function get_all_users(token, user_id) {
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token)

    let params = {
        method: "GET",
        mode: "cors",
        headers: header,
    }
    try{
        return await fetch( url.GET_ALL_USERS_URL+"/"+user_id, params);
    }catch(error){
        console.log(error)
    }
    
}

export async function get_user_files(token, user_id) {
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token)

    let params = {
        method: "GET",
        mode: "cors",
        headers: header,
    }
    try{
        return await fetch( url.GET_USER_FILES_URL+"/"+user_id, params);
    }catch(error){
        console.log(error)
    }
    
}

export async function get_system_stats(token, user_id) {
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token)

    let params = {
        method: "GET",
        mode: "cors",
        headers: header,
    }
    try{
        return await fetch( url.STATS_URL+"/"+user_id, params);
    }catch(error){
        console.log(error)
    }
    
}

export function is_authenticated(){
    return (localStorage.getItem('user') == null) ? false : true;
}

export function is_admin() {
    let user = JSON.parse(localStorage.getItem('user')) ;
    return (user.role == "COMMON") ? false : true;
}

// Admin functions
export async function register_admin(form, token){
    let form_data = new FormData(form);
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token)

    let params = {
        method: "POST",
        mode: "cors",
        body: form_data,
        headers: header
    }
    try{
        return await fetch(url.CREATE_ADMIN_URL, params);
    }catch(error){
        console.log(error)
        if(error.detail){
            throw new RequestError(error.detail);
        }else{
            throw new CustomError();
        }
    }
}

export async function delete_account(user_id, email, pwd, token) {
    let form_data = new FormData();
    let header = new Headers();

    form_data.append('user_id', user_id);
    form_data.append('user_email', email);
    form_data.append('pwd', pwd);
    //header.append('Authorization', 'Bearer '+token)

    let params = {
        method: "DELETE",
        mode: "cors",
        body: form_data,
        headers: header,
        token : token
    }
    try{
        return await fetch(url.DELETE_ACCOUNT_URL, params);
    }catch(error){
        console.log(error)
        if(error.detail){
            throw new RequestError(error.detail);
        }else{
            throw new CustomError();
        }
    }
}

//Make selection operation functions
export async function upload_candidate_file(file, token, user_id){
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token);
    let form_data = new FormData();
    form_data.append('c_file', file)
    let params = {
        method: "POST",
        mode: "cors",
        body: form_data,
        headers: header,
    }
    try{
        return await fetch( url.UPLOAD_FILE_URL +"/"+user_id, params);
    }catch(error){
        console.log(error)
    }
}

export async function save_features(selected_features, cFile_id, token, user_id){
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token);
    header.append('Content-Type', "application/json");

    let body_data = JSON.stringify({
        features: selected_features,
        c_file_id: cFile_id
    });
    let params = {
        method: "POST",
        mode: "cors",
        body: body_data,
        headers: header,
    }
    try{
        return await fetch( url.SAVE_FEATURES_URL +"/"+user_id, params);
    }catch(error){
        console.log(error)
    }
}

export async function get_details_on_int_features(c_file_id, token) {
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token);

    let params = {
        method: "GET",
        mode: "cors",
        headers: header,
    }
    try{
        return await fetch( url.GET_DETAILS_INT_FEATURES_URL +"/"+c_file_id, params);
    }catch(error){
        console.log(error)
    }
}

export async function get_details_on_enum_features(c_file_id, token) {
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token);

    let params = {
        method: "GET",
        mode: "cors",
        headers: header,
    }
    try{
        return await fetch( url.GET_DETAILS_ENUM_FEATURES_URL +"/"+c_file_id, params);
    }catch(error){
        console.log(error)
    }
}

export async function save_iconstraints(constraints, token) {
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token);
    header.append('Content-Type', "application/json");
    
    let params = {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({data : constraints}),
        headers: header,
    }
    try{
        return await fetch( url.SAVE_INT_CONSTRAINTS_URL, params);
    }catch(error){
        console.log(error)
    }
}

export async function save_econstraints(constraints, token) {
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token);
    header.append('Content-Type', "application/json");
    
    let params = {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({data : constraints}),
        headers: header,
    }
    try{
        return await fetch( url.SAVE_ENUM_CONSTRAINTS_URL, params);
    }catch(error){
        console.log(error)
    }
}

export async function get_all_constraints(c_file_id, token) {
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token);

    let params = {
        method: "GET",
        mode: "cors",
        headers: header,
    }
    try{
        return await fetch( url.GET_ALL_CONSTRAINTS_URL +"/"+c_file_id, params);
    }catch(error){
        console.log(error)
    }
}

export async function solve(c_file_id, limit, token) {
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token);

    let params = {
        method: "GET",
        mode: "cors",
        headers: header,
    }
    try{
        return await fetch( url.SOLVE_URL +"/"+c_file_id+"/"+limit, params);
    }catch(error){
        console.log(error)
    }
}

export async function save_solution(solutions, c_file_id, nbre_sol, status, token) {
    let header = new Headers();
    header.append('Authorization', 'Bearer '+token);
    header.append('Content-Type', "application/json");

    let body_data = JSON.stringify({
        encodedFile: solutions,
        status: status,
        n_sol: nbre_sol,
        satisfaction: 80,
        candidatesFile_id: c_file_id
    });
    
    let params = {
        method: "POST",
        mode: "cors",
        body: body_data,
        headers: header,
    }
    try{
        return await fetch( url.LOG_SELECTION_FILE_URL, params);
    }catch(error){
        console.log(error)
    }
}