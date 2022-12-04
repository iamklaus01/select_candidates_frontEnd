// Import
import * as user from './api_bridge.js';

let loginMsg = document.querySelector('.login-msg');
let login = document.querySelector('.login');
let signupMsg = document.querySelector('.signup-msg');
let signup = document.querySelector('.signup');
let frontbox = document.querySelector('.front-box');

// Register and Login Forms 
let register_form = document.getElementById('sign_up');
let login_form = document.getElementById('login');

// Loaders
let register_loader = document.getElementById('register_loader');
let login_loader = document.getElementById('login_loader');

// Notification Box
let success_notification_message = document.querySelector('.good.banner-message');
let error_notification_message = document.querySelector('.bad.banner-message');
let notification_close = document.querySelectorAll('.banner-close');

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

// Event added for register button click for switching form
document.querySelector('#switch-1').addEventListener('click', function() {
    manage_box_moving(true)
});

// Event added for login button click for switching form
document.querySelector('#switch-2').addEventListener('click', function() {
    manage_box_moving(false)
});

// Event added for register form click
register_form.addEventListener('submit', (e)=>{
    e.preventDefault();
    register_user();
});

// Event added for login form click
login_form.addEventListener('submit', (e)=>{
    e.preventDefault();
    user_login();
});

// Event added for x-mark button click for closing the notification banner
[...notification_close].forEach((xmark) => xmark.addEventListener('click', function (){
    hideBanners();
}));

// Function for managing sliding animation for register and
function manage_box_moving(to_add) {
    loginMsg.classList.toggle("visibility");
    if(to_add)
        frontbox.classList.add("moving");
    else
        frontbox.classList.remove("moving");
    signupMsg.classList.toggle("visibility");
    signup.classList.toggle('hide');
    login.classList.toggle('hide');
}

// Register user function
async function register_user() {
    try{
        register_loader.style.display = "inline-block";
        let response = await user.register(register_form);
        register_form.reset();
        register_loader.style.display = "none";
        if(response.ok){
            let data = response.json();
            data.then((message)=>{
                notify(1, "Account created successfully ! A mail has been sent to you... Check your inbox to verify your email !");
                document.querySelector('#switch-2').click()
            });
        }else{
            if (response.status == 409) {
                notify(0, "Non-compliants password");
            }else{
                notify(0, "An error has occurred... The email address may be incorrect or already in use!");
            }
        }
    } catch (error) {
        notify(0, error.message);
    }
}


//User login function
async function user_login() {
    try {
        let email = document.getElementsByName('log_email')[0].value;
        let pwd = document.getElementsByName('log_password')[0].value;
        login_loader.style.display = "inline-block";
        let response = await user.log_user(email, pwd);
        login_loader.style.display = "none";
        if(response.ok){
            let data = response.json();
            data.then((user) =>{
                console.log(user)
                localStorage.setItem("user", JSON.stringify(user));
                window.location.replace("../html/dashboard.html");
            })
        }else{
            switch (response.status) {
                case 401:
                    notify(0, "Your account is no longer active !");
                    break;
                case 404:
                    notify(0, "User not found! The email address or username is incorrect!");
                    break;
                case 403:
                    notify(0, "Your email address is still not verified! An email has been sent to you to verify it!");
                    break;
                default:
                    notify(0, "An error has occurred ! Please enter correct data");
                    break;
            }
        }
    } catch (error) {
        notify(0, error.message);
    }
}


function notify(type, message){
    if(type){
        success_notification_message.innerHTML = message;
        showBanner(".banner.success")
    }else{
        error_notification_message.innerHTML = message;
        showBanner(".banner.error");
    }
}
