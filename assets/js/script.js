import * as user from './api_bridge.js'

let header = document.querySelector("header");
let step_list = document.querySelector('.title-timeline ul');

window.addEventListener('scroll',() => {
    if (window.scrollY > 420) {
        header.classList.add('bg-header')
    } else {
        header.classList.remove('bg-header')
    }
    if(!isHidden(step_list)){
        step_list.classList.add('animate')
    }
});

function isHidden(el) {
    return (el.offsetParent === null)
}

document.getElementById('get_in_touch').addEventListener('submit', get_in_touch);


async function get_in_touch(e) {
    e.preventDefault();
    try {
        let name = document.getElementsByName('name')[0].value;
        let email = document.getElementsByName('email')[0].value;
        let message = document.getElementsByName('message')[0].value;
        let response = await user.get_in_touch(name, email, message);
        if(response.ok){
            let data = response.json();
            data.then((message) =>{
                console.log(message)
            })
        }else{
            console.log('Error....... Email address may not be correct')
        }
    } catch (error) {
        console.log(error)
    }
    
}