import { navigate } from "./router.js";

export function initlogin() {
  const togglePassword = document.getElementById('togglePassword');
  const passwordField = document.getElementById('password');

  if (togglePassword && passwordField) {
    togglePassword.addEventListener('click', function () {
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
    switch (storedRole) {
      case 'staff': navigate('staff/staffHome'); break;
      case 'admin': navigate('admin/adminHome'); break;
      case 'member': navigate('member/memberHome'); break;
      case 'owner': navigate('owner/ownerHome'); break;
      case 'trainer': navigate('trainer/trainerHome'); break;
    }
    return;
  }

  document.body.addEventListener("click", (event) => {
    if (event.target && event.target.id === "forgotPw") {
      navigate('forgotPassword');
    }
  });

  document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const loginData = JSON.stringify({ email, password });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: loginData,
      redirect: "follow"
    };

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/authController.php?action=login", requestOptions)
      .then(response => response.text()) // Get raw text first
      .then(text => {
        console.log("Raw response:", text); // Debug output
        const data = JSON.parse(text); // Try parsing manually

        if (data.success) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('amount', data.amount);
          localStorage.setItem('date_time', data.date_time);
          localStorage.setItem('membership_plan_id', data.membership_plan_id);
          localStorage.setItem('status', data.status);

          switch (data.role) {
            case 'staff': navigate('staff/staffHome'); break;
            case 'admin': navigate('admin/adminHome'); break;
            case 'member': navigate('member/memberHome'); break;
            case 'owner': navigate('owner/ownerHome'); break;
            case 'trainer': navigate('trainer/trainerHome'); break;
          }
        } else {
          console.error("Login failed:", data.error);
          showToast(data.error || "Login failed. Please check your credentials.", "error");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        showToast("An error occurred. Please try again later.", "error");
      });
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) {
    console.error('Toast container not found in DOM.');
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

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

export function notifySessionTimedOut() {
  showFormResponse("Your session has timed out. Please log in again", "error");
}
