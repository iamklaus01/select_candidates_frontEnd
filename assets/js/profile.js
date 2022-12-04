import * as user from './api_bridge.js';


let update_profile_form = document.getElementById('update_profile');

// Notification Box
let success_notification_message = document.querySelector('.good.banner-message');
let error_notification_message = document.querySelector('.bad.banner-message');
let notification_close = document.querySelectorAll('.banner-close');

//Events
update_profile_form.addEventListener('submit', (e)=>{
    console.log("Form submitted")
    e.preventDefault();
    update_profile();
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


async function update_profile(){
    try {
        let token = JSON.parse(localStorage.getItem('user')).token;
        let user_id = JSON.parse(localStorage.getItem('user')).user_id;
        let response = await user.update_user_info(token, user_id, update_profile_form)
        update_profile_form.reset();
        if(response.ok){
            let data = response.json();
            data.then((data)=>{
                console.log(data);
                fill_new_user_info(data);
                notify(1, "Your account has been successfully updated !")
            });
        }else{
            if (response.status == 404) {
                notify(0, "User not found... Make sure you have created an account!")
            }else if(response.status == 403) {
                notify(0, "You are no longer connected... The authentication token has already expired!");
                localStorage.removeItem('user');
                redirect_to("/index.html", 2000);
            }else{
                notify(0, "An error occurred... Your profile could not be updated !")
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

function fill_new_user_info(data) {
    document.getElementById("username").innerText = data.name;
    document.getElementById("input-username").value = data.name;
    document.getElementById('user-name').innerText = data.name;
    document.getElementById("input-email").value = data.email;

    let user = JSON.parse(localStorage.getItem('user'))
    user.username = data.name;
    localStorage.setItem('user', JSON.stringify(user));

}
function redirect_to(path, duration) {
    setTimeout(()=>{
        window.location.replace(path);
    }, duration);
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