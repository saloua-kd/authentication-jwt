// public/script.js

// Function to toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  }
  
  // Function to preview the selected avatar image
  function previewImage(input) {
    const avatarPreview = document.getElementById('avatar-preview');
    if (input.files && input.files[0]) {
      const reader = new FileReader();
  
      reader.onload = function (e) {
        avatarPreview.src = e.target.result;
      };
  
      reader.readAsDataURL(input.files[0]);
      avatarPreview.style.display = 'block';
    } else {
      avatarPreview.style.display = 'none';
    }
  }
  