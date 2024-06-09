var wordCountDescription = 0;
var wordLeftDescription = 4000;
var wordCountTitle = 0;
var wordLeftTitle = 100;

//create button color
if(document.querySelector(".button")){
    document.querySelector(".button").addEventListener("mouseenter", function() {
        this.style.cursor = "pointer";
        this.classList.add("button_active");
    });
    document.querySelector(".button").addEventListener("mouseleave", function() {
        this.classList.remove("button_active");
    });
};

//Posts color
if(document.querySelector(".posts ul li a")){
    for(var i=0; i<document.querySelectorAll(".posts ul li a").length; i++){
        document.querySelectorAll(".posts ul li a")[i].addEventListener("mouseenter", function() {
            this.classList.add("li_active");
        });
    };
    for(var i=0; i<document.querySelectorAll(".posts ul li a").length; i++){
        document.querySelectorAll(".posts ul li a")[i].addEventListener("mouseleave", function() {
            this.classList.remove("li_active");
        });
    };
};
//Home button
if(document.querySelector(".home img")){
    document.querySelector(".home img").addEventListener("mouseenter", function() {
        document.querySelector(".home .paragraph").classList.add("li_active");
    });
    document.querySelector(".home img").addEventListener("mouseleave", function() {
        document.querySelector(".home .paragraph").classList.remove("li_active");
    });
};
// button_edit color
if(document.querySelector(".button_edit")){
    document.querySelector(".button_edit").addEventListener("mouseenter", function() {
        this.style.cursor = "pointer";
        this.classList.add("button_active");
    });
    document.querySelector(".button_edit").addEventListener("mouseleave", function() {
        this.classList.remove("button_active");
    });
};
// button_delete color
if(document.querySelector(".button_delete")){
    document.querySelector(".button_delete").addEventListener("mouseenter", function() {
        this.style.cursor = "pointer";
        this.classList.add("button_delete_active");
    });
    document.querySelector(".button_delete").addEventListener("mouseleave", function() {
        this.classList.remove("button_delete_active");
    });
    document.querySelector(".review .button_delete").addEventListener("click", function() {
        showBox();
    });
};

//confirmation_box_buttons
if(document.querySelector(".confirmation_box .confirmation_box_yes")){
    document.querySelector(".confirmation_box .confirmation_box_yes").addEventListener("mouseenter", function() {
        this.style.cursor = "pointer";
        this.classList.add("button_delete_active");
    });
    document.querySelector(".confirmation_box .confirmation_box_yes").addEventListener("mouseleave", function() {
        this.classList.remove("button_delete_active");
    });
};
if(document.querySelector(".confirmation_box .confirmation_box_no")){
    document.querySelector(".confirmation_box .confirmation_box_no").addEventListener("mouseenter", function() {
        this.style.cursor = "pointer";
        this.classList.add("button_active");
    });
    document.querySelector(".confirmation_box .confirmation_box_no").addEventListener("mouseleave", function() {
        this.classList.remove("button_active");
    });
        document.querySelector(".confirmation_box .confirmation_box_no").addEventListener("click", function() {
            hideBox();
        });
};
//count words for input
if(document.querySelector("input[placeholder='Nėra antraštės']")){
    document.querySelector("input[placeholder='Nėra antraštės']").addEventListener("click", function(){
        document.querySelectorAll(".create_post a")[0].text = `Paršytą simbolių: ${document.querySelector("input[placeholder='Nėra antraštės']").value.length} `;
        document.querySelectorAll(".create_post a")[1].text = `| Liko: ${100 - document.querySelector("input[placeholder='Nėra antraštės']").value.length} simbolių`;
    });
    document.querySelector("input[placeholder='Nėra antraštės']").addEventListener("input", countWordsTitle);
};
if(document.querySelector("textarea[placeholder='Nėra aprašymo']")){
    document.querySelector("textarea[placeholder='Nėra aprašymo']").addEventListener("click", function(){
        document.querySelectorAll(".create_post a")[0].text = `Paršytą simbolių: ${document.querySelector("textarea[placeholder='Nėra aprašymo']").value.length} `;
        document.querySelectorAll(".create_post a")[1].text = `| Liko: ${4000 - document.querySelector("textarea[placeholder='Nėra aprašymo']").value.length} simbolių`;
    });
    document.querySelector("textarea[placeholder='Nėra aprašymo']").addEventListener("input", countWordsDescription);
};

function showBox(){
    document.querySelector(".confirmation_box").style.display = "block";
};
function hideBox(){
    document.querySelector(".confirmation_box").style.display = "none";
};
function countWordsTitle(){
    wordCountTitle = document.querySelector("input[placeholder='Nėra antraštės']").value.length;
    wordLeftTitle = 100 - wordCountTitle;
    document.querySelectorAll(".create_post a")[0].text = `Paršytą simbolių: ${wordCountTitle} `;
    document.querySelectorAll(".create_post a")[1].text = `| Liko: ${wordLeftTitle} simbolių`;
};
function countWordsDescription(){
    wordCountDescription = document.querySelector("textarea[placeholder='Nėra aprašymo']").value.length;
    wordLeftDescription = 4000 - wordCountDescription;
    document.querySelectorAll(".create_post a")[0].text = `Paršytą simbolių: ${wordCountDescription} `;
    document.querySelectorAll(".create_post a")[1].text = `| Liko: ${wordLeftDescription} simbolių`;
};
//Important message handling
if(document.querySelector("#important-message img")){
    document.querySelector("#important-message img").addEventListener("click", function() {
        document.querySelector("#important-message").style.display = "none";
    });
    setTimeout(() => {
        document.querySelector("#important-message").style.display = "none";
    }, 1000 * 10);
};
//Switch on button click between login and create-user
if(document.querySelector(".login button")){
    document.querySelector(".login button").addEventListener("click", function () {
        document.querySelector(".login.create-user").style.display = "block";
        document.querySelector(".login").style.display = "none";

    });
}
//Hide Show password
if(document.querySelector(".signup .password-input img")){
    document.querySelector(".signup .password-input img").addEventListener("click", function () {
        if (document.querySelector(".signup .password-input input").type == "password") {
            this.src = "../../assets/eye.png";
            document.querySelector(".signup .password-input input").type = "text";
        }
        else {
            this.src = "../../assets/closed_eye.png";
            document.querySelector(".signup .password-input input").type = "password";
        }
    });
};