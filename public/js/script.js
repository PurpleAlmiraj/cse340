document.addEventListener("DOMContentLoaded", function() {
    const passwordbtn = document.querySelector("#passwordbtn");

    passwordbtn.addEventListener("click", function() {
        const passwordinput = document.getElementById("account_password");
        const type = passwordinput.getAttribute("type");
        if (type == "password") {
            passwordinput.setAttribute("type", "text");
            passwordbtn.innerHTML = "Hide Password";
        } else {
            passwordinput.setAttribute("type", "password");
            passwordbtn.innerHTML = "Show Password";
        }
    });
});