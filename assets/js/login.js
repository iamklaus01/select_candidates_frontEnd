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

// Notification Box
let notification = document.getElementById('toast');
let notification_message = document.querySelector('.message');


document.querySelector('#switch-1').addEventListener('click', function() {
    manage_box_moving(true)
});

document.querySelector('#switch-2').addEventListener('click', function() {
    manage_box_moving(false)
});

register_form.addEventListener('submit', (e)=>{
    e.preventDefault();
    register_user();
});

login_form.addEventListener('submit', (e)=>{
    e.preventDefault();
    user_login();
});

setTimeout(function(){
    document.querySelector('#switch-1').click()
},1000)

setTimeout(function(){
    document.querySelector('#switch-2').click()
},3000)


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

async function register_user() {
    try {
        fetch(user.register(register_form))
        .then((data) =>{
            if (data)
                notify(data+"<br> Vous serez bientôt redirigés.es");
        });

        let email = document.getElementsByName('email').value;
        let pwd = document.getElementsByName('password').value;
        localStorage.setItem("user", user.log_user(email, pwd))

    } catch (error) {
        console.log(error)
        notify(error.message);
    }
}

async function user_login() {
    try {
        let email = document.getElementsByName('log_email').value;
        let pwd = document.getElementsByName('log_password').value;

        await localStorage.setItem("user", user.log_user(email, pwd))
    } catch (error) {
        notify(error.message);
    }
}


function notify(message){
    notification_message.innerHTML = message;
    notification.classList.add("show");
    setTimeout(() => {
        notification.classList.remove("show"); 
    }, 5000);
}