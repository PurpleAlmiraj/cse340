function enableButton(formSelector, buttonSelector) {
  const form = document.querySelector(formSelector);
  if (form) {
    form.addEventListener("change", function () {
      const updateBtn = document.querySelector(buttonSelector);
      if (updateBtn) {
        updateBtn.removeAttribute("disabled");
      }
    });
  }
}

enableButton("#updateForm1", "#button1")
enableButton("#updateForm2", "#button2");
enableButton("#updateForm3", "#button3");