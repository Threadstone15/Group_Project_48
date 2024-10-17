// scripts.js

const token = localStorage.getItem('authToken');

// Handle Signup form submission
document.getElementById("signup-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(this);

    console.log("Submitting signup form with data:", Object.fromEntries(formData)); // Log form data

    fetch("http://localhost:3000/backend/api/controllers/authController.php", {
        method: "POST",
        body: formData
    })
    .then(response => {
        console.log("Signup response status:", response.status); // Log response status
        return response.json();
    })
    .then(data => {
        console.log("Signup response data:", data); // Log the response data
        document.getElementById("response").textContent = JSON.stringify(data.message || data.error);
        document.getElementById("signup-form").reset();
    })
    .catch(err => {
        console.error('Error during signup:', err); // Log any errors during the request
    });
});

// Handle Login form submission
// Handle Login form submission
document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const email = formData.get('email');
    const password = formData.get('password');

    console.log("Submitting login form with data:", { email, password }); // Log form data

    // Fetch request with POST method
    fetch(`http://localhost:3000/backend/api/controllers/authController.php`, {
        method: "POST",
        body: formData // Send the payload as body
    })
    .then(response => {
        console.log("Login response status:", response.status); // Log response status
        return response.json(); // Expecting JSON response
    })
    .then(data => {
        console.log("Login response data:", data); // Log the response data
        if (data.token) {
            // Store the token in local storage
            localStorage.setItem('authToken', data.token);
        }

        // Redirect user based on role
        if (data.role) {
            switch(data.role) {
                case 'trainer':
                    window.location.href = '/frontend/trainer-dashboard.html';
                    break;
                case 'owner':
                    window.location.href = '/frontend/owner-dashboard.html';
                    break;
                case 'staff':
                    window.location.href = '/frontend/staff-dashboard.html';
                    break;
                case 'member':
                    window.location.href = '/frontend/member-dashboard.html';
                    break;
            }
        }
    })
    .catch(err => {
        console.error('Error during login:', err); // Log any errors during the request
    });
});






