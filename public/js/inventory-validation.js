function validateInventoryForm() {
    const make = document.getElementById('make').value;
    const model = document.getElementById('model').value;
    const year = document.getElementById('year').value;
    const classification = document.getElementById('classificationList').value;
    
    if (!make || !model || !year || !classification) {
        alert("All fields are required.");
        return false;
    }
    

    return true;
}