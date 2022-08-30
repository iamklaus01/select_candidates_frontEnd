// Main section variable
let main_section = document.getElementById('main-section') 

// Active Link for sidebar menu
let li_menus = document.querySelectorAll(".sidebar-menu ul li a");

for(let a of li_menus){
    a.addEventListener('click', active_menu);
}

console.log(main_section.querySelectorAll('.cards'))


function active_menu(e){
    e.preventDefault();
    for(let a of li_menus){
        a.classList.remove('active-link');
    }
    e.currentTarget.classList.add('active-link');

    let html_filename = e.currentTarget.dataset.content;
    let js_filename = e.currentTarget.dataset.js;
    let id = e.currentTarget.dataset.id;
    if(html_filename != ""){
        include_html(html_filename);
    }
    if(js_filename != ""){
        load_js_file(js_filename, id)
    }
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
  
    scriptEle.setAttribute("id", id);
    scriptEle.setAttribute("src", '../js/'+file_url);
    scriptEle.setAttribute("type", "text/javascript");
    scriptEle.setAttribute("async", async);
    
    if(existing_script){
        existing_script.remove()
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