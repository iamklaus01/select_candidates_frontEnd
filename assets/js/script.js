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