import * as user from './api_bridge.js';

let add_admin_form = document.getElementById('add-admin');


// Notification Box
let success_notification_message = document.querySelector('.good.banner-message');
let error_notification_message = document.querySelector('.bad.banner-message');
let notification_close = document.querySelectorAll('.banner-close');

//Events
add_admin_form.addEventListener('submit', (e)=>{
    e.preventDefault();
    add_admin();
});

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

async function add_admin(){
    try {
        let token = JSON.parse(localStorage.getItem('user')).token;
        let response = await user.register_admin(add_admin_form, token)
        add_admin_form.reset();
        if(response.ok){
            let data = response.json();
            data.then((message)=>{
                notify(1, message.message + "Please, refresh !")
            });
        }else{
            if (response.status == 409) {
                notify(0, "Non-compliants password")
            }
            else if(response.status == 403) {
                notify(0, "You are no longer connected... The authentication token has already expired!");
                localStorage.removeItem('user');
                redirect_to("/index.html", 2000);
            }else{
                notify(0, "An error has occurred... The email address may be incorrect or already in use!")
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

async function delete_user(){
    try {
        let token = JSON.parse(localStorage.getItem('user')).token;
        let response = await user.delete_account(45,"klaus@test.fr","klaus2001", token)
        console.log(response)
        if(response.ok){
            let data = response.json();
            data.then((message)=>{
                console.log(message.message+"<br> Please login with your credentials");
                document.querySelector('#switch-2').click()
            });
        }else{
            if (response.status == 409) {
                console.log("Non-compliants password");
            }
            else if(response.status == 403) {
                notify(0, "You are no longer connected... The authentication token has already expired!");
                localStorage.removeItem('user');
                redirect_to("/index.html", 2000);
            }else{
                console.log("An error has occurred... The email address may be incorrect or already in use!");
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}


function redirect_to(path, duration) {
    setTimeout(()=>{
        window.location.replace(path);
    }, duration);
}