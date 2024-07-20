document.addEventListener("DOMContentLoaded", function() {
    // Get the password button and input
    const passwordbtn = document.querySelector("#passwordbtn");
    const passwordinput = document.getElementById("account_password");

    // Check if elements exist before adding event listeners
    if (passwordbtn && passwordinput) {
        passwordbtn.addEventListener("click", function() {
            const type = passwordinput.getAttribute("type");
            if (type === "password") {
                passwordinput.setAttribute("type", "text");
                passwordbtn.innerHTML = "Hide Password";
            } else {
                passwordinput.setAttribute("type", "password");
                passwordbtn.innerHTML = "Show Password";
            }
        });
    } else {
        console.error("Password button or input not found");
    }
});
