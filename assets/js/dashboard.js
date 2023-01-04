import * as user from './api_bridge.js';
import * as makeFile from './make_pdf.js';

//Load system stats on redirection to dashboard after loging
window.addEventListener('DOMContentLoaded', (event) => {
    if (user.is_authenticated) {
        let token = JSON.parse(localStorage.getItem('user')).token;
        let user_id = JSON.parse(localStorage.getItem('user')).user_id;
        go_to_dashboard_home(token, user_id);
    } else {
        notify(0, "You are not logged in to perform this operation... Please log in first !");
        redirect_to("/index.html", 2000);
    }

    if (! user.is_admin()) {
        document.getElementById('admin_action').style.display="none";
    }
});

document.getElementById('reduce-sidebar').addEventListener('click', (e)=>{
    e.currentTarget.classList.toggle('rotate-arrow');
});

let all_solutions = [];

//Pop up variables
const close = document.querySelector('.modal-close');
const contentWrapper = document.querySelector('.content-wrapper');
const btn_confirm = document.querySelector('.action-confirm')
const btn_cancel = document.querySelector('.action-cancel')
const modal_container = document.querySelector('.modal-container');
// Main section variable
let main_section = document.getElementById('main-section') 

// Active Link for sidebar menu
let li_menus = document.querySelectorAll(".sidebar-menu ul li a");

// Notification Box
let success_notification_message = document.querySelector('.good.banner-message');
let error_notification_message = document.querySelector('.bad.banner-message');
let notification_close = document.querySelectorAll('.banner-close');

// Notification banner management
const showBanner = (selector) => {
    hideBanners();
    requestAnimationFrame(() => {
      const banner = document.querySelector(selector);
      banner.classList.add("visible");
    });
};
  
const hideBanners = () => {
    document.querySelectorAll(".banner.visible")
            .forEach((b) => b.classList.remove("visible"));
};

// Event added for x-mark button click for closing the notification banner
[...notification_close].forEach((xmark) => xmark.addEventListener('click', function (){
    hideBanners();
}));

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

for(let a of li_menus){
    a.addEventListener('click', active_menu);
}

async function active_menu(e){
    e.preventDefault();
    for(let a of li_menus){
        a.classList.remove('active-link');
    }
    e.currentTarget.classList.add('active-link');

    manage_content(e);
}

function manage_content(e) {
    let html_filename = e.currentTarget.dataset.content;
    let js_filename = e.currentTarget.dataset.js;
    let id = e.currentTarget.dataset.id;
    if(html_filename != ""){
        include_html(html_filename);
    }
    if(js_filename != ""){
        load_js_file(js_filename, id)
    }
    get_data(id);
}

function include_html(filename) {
    filename = '../html/'+filename;
    fetch(filename)
    .then((response)=> response.text())
    .then((text) =>{
        main_section.innerHTML = text;
    })
    .catch(e => console.log("Error" + e));
}

function load_js_file(file_url, id, async = true) {
    let scriptEle = document.createElement("script");
    let existing_script = document.getElementById(id);
    let added_scripts = document.querySelectorAll('.script-added')
  
    added_scripts.forEach(script => {
        script.remove();
    });
    scriptEle.setAttribute("id", id);
    scriptEle.setAttribute("class", "script-added");
    scriptEle.setAttribute("src", '../js/'+file_url);
    scriptEle.setAttribute("type", "module");
    scriptEle.setAttribute("async", async);
    
    if(existing_script){
        existing_script.remove()
        console.log('Removed')
    }

    document.body.appendChild(scriptEle);
  
    // success event 
    scriptEle.addEventListener("load", () => {
      console.log("File loaded")
    });
     // error event
    scriptEle.addEventListener("error", (ev) => {
      console.log("Error on loading file", ev);
    });
}

async function get_data(id) {
    switch (id) {
        case "home":{
            if (user.is_authenticated) {
                let token = JSON.parse(localStorage.getItem('user')).token;
                let user_id = JSON.parse(localStorage.getItem('user')).user_id;
                window.location.reload();
                go_to_dashboard_home(token, user_id);
            } else {
                notify(0, "You are not logged in to perform this operation... Please log in first !");
                redirect_to("/index.html", 2000);
            }
            break;
        }
        case "profile":{
            if (user.is_authenticated()) {
                let token = JSON.parse(localStorage.getItem('user')).token;
                let user_id = JSON.parse(localStorage.getItem('user')).user_id;
                go_to_profile(token, user_id);
            } else {
                notify(0, "You are not logged in to view this content... Please log in first!");
                redirect_to("/index.html", 2000);
            }
            break;
        }
        case "users":{
            if (user.is_admin()) {
                let token = JSON.parse(localStorage.getItem('user')).token;
                let user_id = JSON.parse(localStorage.getItem('user')).user_id;
                go_to_users_management(token, user_id);
            } else {
                notify(0, "You are not authenticated to access to this content... !");
                redirect_to("/assets/html/dashboard.html", 1000);
            }
            break;
        }
        case "files":{
            if (user.is_authenticated) {
                let token = JSON.parse(localStorage.getItem('user')).token;
                let user_id = JSON.parse(localStorage.getItem('user')).user_id;
                go_to_user_files(token, user_id);
            } else {
                notify(0, "You are not logged in to perform this operation... Please log in first !");
                redirect_to("/index.html", 2000);
            }
            break;
        }
        case "logout":{
            if (user.is_authenticated) {
                let token = JSON.parse(localStorage.getItem('user')).token;
                logout(token);
            }
            break;
        }
        default:
            break;
    }
}

async function go_to_profile(token, user_id) {
    let response = await user.get_user_info(token, user_id)
    if(response.ok){
        let data = response.json();
        data.then((profile)=>{
            document.getElementById("username").innerText = profile.name;
            document.getElementById("input-username").value = profile.name;
            document.getElementById("input-email").value = profile.email;
            document.getElementById("n_files").innerText = profile.n_files;
            document.getElementById("n_sol").innerText = profile.n_sol;
        });
    }else{
        if (response.status == 403) {
            notify(0, "You are no longer connected... The authentication token has already expired!");
            localStorage.removeItem('user');
            redirect_to("/index.html", 2000);
        }else{
            notify(0, "An error has occurred. Please try again !");
        }
    }
}

async function go_to_users_management(token, user_id){
    let response = await user.get_all_users(token, user_id)
    if(response.ok){
        let data = response.json();
        data.then((all_users)=>{
            fill_data(all_users);
        });
    }else{
        if (response.status == 403) {
            notify(0, "You are no longer connected... The authentication token has already expired!");
            localStorage.removeItem('user');
            redirect_to("/index.html", 2000);
        }else if(response.status == 401){
            notify(0, "You are not authorized to perform such an operation !");
        }
        else{
            notify(0, "An error has occurred. Please try again !");
        }
    }
}

async function go_to_user_files(token, user_id){
    let response = await user.get_user_files(token, user_id)
    if(response.ok){
        let data = response.json();
        data.then((files)=>{
            fill_files_table(files);
        });
    }else{
        if (response.status == 403) {
            notify(0, "You are no longer connected... The authentication token has already expired!");
            localStorage.removeItem('user');
            redirect_to("/index.html", 2000);
        }else if(response.status == 404){
            notify(0, "The coordinates of this user do not correspond to any registered !");
        }
        else{
            notify(0, "An error has occurred. Please try again !");
        }
    }
}

async function go_to_dashboard_home(token, user_id) {
    let response = await user.get_system_stats(token, user_id)
    if(response.ok){
        let data = response.json();
        data.then((stats)=>{
            set_user_info();
            set_system_stats(stats);
        });
    }else{
        if (response.status == 403) {
            notify(0, "You are no longer connected... The authentication token has already expired!");
            localStorage.removeItem('user');
            redirect_to("/index.html", 2000);
        }else if(response.status == 404){
            notify(0, "The coordinates of this user do not correspond to any registered !");
        }
    }
}

async function logout(token) {
    let response = await user.logout(token)
    if(response.ok){
        notify(1, "Successfully disconnected");
        localStorage.removeItem('user');
        redirect_to("/index.html", 2000);
    }else{
        if (response.status == 403) {
            notify(0, "You are no longer connected... The authentication token has already expired!");
            localStorage.removeItem('user');
            redirect_to("/index.html", 2000);
        }else{
            notify(0, "An error has occurred. Please try again !");
        }
    }
}

function fill_data(all_users) {
    let users_tbody = document.getElementById('all_users_tbody');
    let user_status = "Active";
    let classname = "t-active";
    let classname_td_action = "";
    all_users.forEach(function (user, index){
        if(user.active){
            user_status = "Active";
            classname = "t-active";
            classname_td_action = ""
        }else{
            user_status = "Archived";
            classname = "t-inactive";
            classname_td_action = "btn-disabled"
        }
        
        users_tbody.innerHTML += `
        <tr>
            <td>`+(index+1)+`</td>
            <td>`+user.name+`</td>
            <td>`+user.email+`</td>
            <td><code>`+user.role+` USER</code></td>
            <td>`+user.created_at.split('T')[0]+`</td>
            <td class=`+classname+` ><code>`+user_status+`</code></td>
            <td class="td-delete-user `+classname_td_action+`" data-id=`+user.id+`><i title="Archive" class="user-delete fa fa-trash" aria-hidden="true"></i></td>
        </tr> `;
    });

    document.querySelectorAll('.td-delete-user').forEach(function(td){
        td.addEventListener('click', delete_user)
    });
}

function fill_files_table(files) {
    let files_tbody = document.getElementById('user_files_tbody');
    let fileType_class = "fa-file-csv";
    let status_class = "t-active";

    if(files.length == 0){
        document.getElementById('no-files').innerHTML += `<p style="text-align:center;">No files</p>`
    }else{
        files.forEach(function (file, index){
            if(file.extension == "csv"){
                fileType_class = "fa-file-csv";
            }else{
                fileType_class = "fa-file-excel"
            }
            status_class = (file.status == "OPTIMAL") ? "t-active" : "t-inactive"
            let res_status = (file.status == undefined) ? "-" : file.status
            let nbre_sol = (file.nbre_sol == undefined) ? "-" : file.nbre_sol
            
            files_tbody.innerHTML += `
            <tr>
                <td>`+(index+1)+`</td>
                <td><i title="Type of problem file" class="file-type fa `+fileType_class+`" aria-hidden="true"></i></td>
                <td><code>`+file.path.split("/")[2]+`</code></td>
                <td class="`+status_class+`"><code>`+res_status+`</code></td>
                <td><code>`+nbre_sol+`</code></td>
                <td>
                    <div class="row space-between">
                        <i title="Download" class="i-download-file download-file fa fa-download" data-id=`+file.sol_file_id+` aria-hidden="true"></i>
                        <i title="Delete" class="i-delete-user user-delete fa fa-trash" data-id=`+file.sol_file_id+` aria-hidden="true"></i>
                    </div>
                </td>
            </tr> `;
        });
        document.querySelectorAll('.i-delete-user').forEach(function(i){
            i.addEventListener('click', delete_file)
        });

        document.querySelectorAll('.i-download-file').forEach(function(i){
            i.addEventListener('click', download_file)
        });
    }
    
}

function set_system_stats(stats) {
    //let percent = (stats.percent == null) ? "-" : stats.percent;
    document.getElementById('stat_n_users').innerText = stats.n_users;
    document.getElementById('stat_n_files').innerText = stats.n_files;
    document.getElementById('stat_n_sol').innerText = stats.n_sol;
    //document.getElementById('stat_percent').innerText = percent+'%';
    
}

function set_user_info() {
    document.getElementById('user-name').innerText = JSON.parse(localStorage.getItem('user')).username;
    document.getElementById('user-role').innerText = JSON.parse(localStorage.getItem('user')).role;
}

async function perform_delete_operation(e, user_id) {
    let pwd = document.getElementById('admin_pwd').value;
    await delete_user_action(pwd, user_id);
    close_modal();
    document.querySelector('i.fa-users').click();
}

async function delete_user_action(pwd, user_id){
    try {
        let token = JSON.parse(localStorage.getItem('user')).token;
        let admin_id = JSON.parse(localStorage.getItem('user')).user_id;
        let response = await user.delete_account(user_id, admin_id, pwd, token)
        console.log(response)
        if(response.ok){
            let data = response.json();
            data.then((res)=>{
                notify(1, res.message)
            });
        }else{
            if (response.status == 403) {
                notify(0, "You're not authorized to perform such an action");
            }
            else if(response.status == 404) {
                notify(0, "User not found! Make sure you enter the right password");
            }else{
                notify(0, "An error has occurred... Try later");
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

function delete_user(e) {
    modal_container.style.display = "flex";
    let id = e.currentTarget.dataset.id;
    
    document.getElementById("pop-up").classList.add('open');
    close.addEventListener('click', close_modal);
    btn_cancel.addEventListener('click', close_modal);
    btn_confirm.addEventListener('click',(e)=> {perform_delete_operation(e, id)});
    contentWrapper.addEventListener('click', (e) => e.stopPropagation());
}

async function perform_delete_file_operation(e, file_id) {
    let pwd = document.getElementById('admin_pwd').value;
    await delete_file_action(pwd, file_id);
    close_modal();
    document.querySelector('i.fa-folder-tree').click();

}

async function delete_file_action(pwd, file_id){
    try {
        let token = JSON.parse(localStorage.getItem('user')).token;
        let user_id = JSON.parse(localStorage.getItem('user')).user_id;
        let response = await user.delete_sol_file(parseInt(file_id), user_id, pwd, token)
        if(response.ok){
            let data = response.json();
            data.then((res)=>{
                notify(1, res.message)
            });
        }else{
            if(response.status == 404) {
                notify(0, "User not found! Make sure you enter the right password");
            }else{
                notify(0, "An error has occurred... Try later");
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

function delete_file(e) {
    modal_container.style.display = "flex";
    let id = e.currentTarget.dataset.id;
    document.getElementById("pop-up").classList.add('open');
    close.addEventListener('click', close_modal);
    btn_cancel.addEventListener('click', close_modal);
    btn_confirm.addEventListener('click',(e)=> {perform_delete_file_operation(e, id)});
    contentWrapper.addEventListener('click', (e) => e.stopPropagation());
}

async function download_file(e) {
    let id = e.currentTarget.dataset.id;
    try {
        let token = JSON.parse(localStorage.getItem('user')).token;
        let response = await user.get_selection_file_data(parseInt(id), token)
        if(response.ok){
            let data = response.json();
            data.then((data)=>{
                make_file_and_download(data.encodedFile, data.features)
            });
        }else{
            notify(0, "An error has occurred... Try later");
        }
    } catch (error) {
        notify(0, "An error has occurred...");
        console.log(error.message);
    }
}

function make_file_and_download(data, columns) {
    let decoded_file = decodeURI(data);
    let decoded_columns = decodeURI(columns)
    let formatted_solutions = format_data_to_tables(JSON.parse(decoded_file), JSON.parse(decoded_columns));
    console.log("here")
    makeFile.download_solution_as_pdf(formatted_solutions)
}


function format_data_to_tables(data, columns) {
    let table_header = `<div class="table-row header">`;
    let select_list = `<div class="table">`;
    let single_row ;

    for (let col of columns){
        table_header+=`<div class="cell">`+col+`</div>`
    }
    table_header+='</div>'  
    for(const[i, one_list] of data.entries()){
        select_list = `<div class="table">`;
        select_list+=`<p class="table-title">Selection list n&deg;`+(i+1)+`</p>`
        select_list+= table_header;
        for(let one_row of one_list){
            single_row = `<div class="table-row">`;
            for (let col of columns) {
                single_row+=`<div class="cell" data-title="`+col+`">`+one_row[col]+`</div>`
            }
            single_row+=`</div>`;
            select_list+=single_row;
        }
        select_list+=`</div>`;
        all_solutions.push(select_list);
    }
    return all_solutions;
}

function close_modal() {
    document.getElementById("pop-up").classList.remove('open');
    modal_container.style.display = "none";
    document.getElementById('admin_pwd').value = "";
}