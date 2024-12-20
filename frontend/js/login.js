import { navigate } from "./router.js";

export function initlogin() {

  const togglePassword = document.getElementById('togglePassword');
  const passwordField = document.getElementById('password');

  
  if (togglePassword && passwordField) {
    togglePassword.addEventListener('click', function() {
      const type = passwordField.type === 'password' ? 'text' : 'password';
      passwordField.type = type;

      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  } else {
    console.error('Password field or togglePassword icon not found.');
  }

  const storedRole = localStorage.getItem('role');
  if (storedRole) {
    switch(storedRole){
      case 'staff': navigate('staff/staffHome'); break;
      case 'admin': navigate('admin/adminHome'); break;
      case 'member' : navigate('member/memberHome'); break;
      case 'owner' : navigate('owner/ownerHome'); break;
      case 'trainer' : navigate('trainer/trainerHome'); break;
    }
    return;
  }

  document.body.addEventListener("click", (event) => {
    if (event.target && event.target.id === "forgotPw") {
      navigate('forgotPassword');
    }
  });

  
  document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const loginData = JSON.stringify({
      email: email,
      password: password
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: loginData,
      redirect: "follow"
    };

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/authController.php?action=login", requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log("Response data:", data);  // Log the parsed JSON data

        if (data.success) {
          // Save token and role in browser storage
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('role', data.role);

          // Redirect based on role
          if (data.role == 'staff') {
            navigate('staff/staffHome');
          }
          if (data.role == 'admin') {
            navigate('admin/adminHome');
          }
          if (data.role == 'member') {
            navigate('member/memberHome');
          }
          if (data.role == 'owner') {
            navigate('owner/ownerHome');
          }
          if (data.role == 'trainer') {
            navigate('trainer/trainerHome');
          }
        } else {
          // Display error message if login fails
          showFormResponse(data.error || "Login failed. Please check your credentials.", "error");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      });
  });

  function showFormResponse(message, type) {
    const responseContainer = document.getElementById("formResponse");
    responseContainer.textContent = "";
    responseContainer.textContent = message;
    responseContainer.className = `form-response ${type}`;
    responseContainer.style.display = "block";

    setTimeout(() => {
        responseContainer.style.display = "none";
    }, 3000);
}
}

