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

    // Create query string with email and password
    const queryString = new URLSearchParams({
        email: email,
        password: password
    }).toString();

    // Fetch request with GET method and query parameters
    fetch(`http://localhost:3000/backend/api/controllers/authController.php?${queryString}`, {
        method: "GET"
    })
    .then(response => {
        console.log("Login response status:", response.status); // Log response status
        return response.json();
    })
    .then(data => {
        console.log("Login response data:", data); // Log the response data
        if (data.token) {
            // Store the token in local storage
            localStorage.setItem('authToken', data.token);
        }

        // Redirect user based on role
        if (data.role) {
            if (data.role === 'trainer') {
                window.location.href = '/trainer-dashboard.html';
            } else if (data.role === 'owner') {
                window.location.href = '/owner-dashboard.html';
            } else if (data.role === 'staff') {
                window.location.href = '/staff-dashboard.html';
            } else if (data.role === 'member') {
                window.location.href = '/frontend/member-dashboard.html';
            }
        }
    })
    .catch(err => {
        console.error('Error during login:', err); // Log any errors during the request
    });
});


