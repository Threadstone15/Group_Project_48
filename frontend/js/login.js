document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

<<<<<<< Updated upstream
    const loginData = {
        "login": 1,
        "email": email,
        "password": password
    };

    console.log("Login data being sent:", loginData); // Log the data being sent

    fetch('http://localhost:8080/Group_Project_48/backend/api/controllers/authController.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
        .then(response => {
            // Log the full response status and headers
            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);

            // Check if the response is OK (status code in the range 200-299)
            if (!response.ok) {
                return response.text().then(text => {
                    console.error("Server response (error):", text); // Log the error message returned by the server
                    throw new Error(`Server error: ${response.status} - ${text}`);
                });
            }
            return response.json(); // Parse the response as JSON
        })
=======
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "login": 1,
        "email": email,
        "password": password
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/authController.php", requestOptions)
        .then(response => response.json())
>>>>>>> Stashed changes
        .then(data => {
            console.log("Response data:", data);  // Log the parsed JSON data

            // Check if the login was successful
            if (data.success) {
<<<<<<< Updated upstream
                console.log("Login successful!");  // Log success message
                alert('Login successful!');
                // window.location.href = 'dashboard.html'; // Uncomment when redirecting is required
            } else {
                // Log error message and show alert
                console.error("Login failed:", data.error);
                alert(data.error || 'Login failed. Please check your credentials.');
            }
        })
        .catch(error => {
            // Log the caught error and display an alert
            console.error("Error caught:", error);
            alert('An error occurred. Please try again later.');
=======
                alert("Login successful!");
                // window.location.href = 'dashboard.html';  // Uncomment if you want to redirect upon success
            } else {
                alert(data.error || "Login failed. Please check your credentials.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("An error occurred. Please try again later.");
>>>>>>> Stashed changes
        });
});
