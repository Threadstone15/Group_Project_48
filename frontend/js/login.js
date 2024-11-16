// import { navigateDashboard } from "./dashboardRouter.js";
// import { clearNonDashboardComponents } from "../index.js";

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
  
    const loginData = JSON.stringify({
      login: 1,
      email: email,
      password: password
    });
  
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: loginData,
      redirect: "follow"
    };
  
    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/authController.php", requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log("Response data:", data);  // Log the parsed JSON data
  
        if (data.success) {
          // Save token and role in browser storage
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('role', data.role);
  
          alert("Login successful!");
  
          // Redirect based on role
          if (data.role == 'staff') {
            navigateDashboard('staff','staffHome');
          }
          if (data.role == 'admin') {
            navigateDashboard('admin','adminHome');
          }
          if (data.role == 'member'){
            navigateDashboard('member','memberHome');
          }
          if (data.role == 'owner'){
            navigateDashboard('owner','ownerHome');
          }
          if (data.role == 'trainer'){
            navigateDashboard('trainer','trainerHome');
          }
        } else {
          // Display error message if login fails
          alert(data.error || "Login failed. Please check your credentials.");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      });
  });
  