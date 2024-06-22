document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("click", function(event) {
        if (event.target && event.target.id === "passwordbtn") {
            const passwordinput = document.getElementById("account_password");
            const type = passwordinput.getAttribute("type");
            if (type == "password") {
                passwordinput.setAttribute("type", "text");
                event.target.textContent = "Hide Password";
            } else {
                passwordinput.setAttribute("type", "password");
                event.target.textContent = "Show Password";
            }
        }
    });
});
