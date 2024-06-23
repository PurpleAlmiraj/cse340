function validateForm() {
    const classificationName = document.getElementById('classification_name').value;
    if (!classificationName) {
      alert("Classification Name is required.");
      return false;
    }

    return true;
  }
  