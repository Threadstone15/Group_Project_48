

document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logout-button");

    // Log to confirm the button is found
    if (logoutButton) {
        console.log("Logout button is ready and listening for clicks.");
        
        logoutButton.addEventListener("click", function () {
            console.log("Logout button clicked.");  // Log when the button is clicked
            
            // Retrieve the token from localStorage
            const token = localStorage.getItem("authToken");
            console.log("Logging out: ", token);

            if (!token) {
                console.error("No token found. User is not logged in.");
                return;
            }

            // Send a POST request to the backend to log out the user
            fetch('http://localhost:3000/backend/api/controllers/authController.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'logout': '1'  // Send logout flag in the request body
                })
            })
            .then(response => {
                console.log("Response status:", response.status);
                return response.json();
            })
            .then(data => {
                console.log("Response data:", data);
                if (data.message) {
                    console.log("Logout successful:", data.message);
                    // Clear the token from localStorage
                    localStorage.removeItem("token");
                    // Redirect the user to the login page or home page
                    window.location.href = "/frontend/index.html";
                } else {
                    console.error("Logout error:", data.error || "Unknown error");
                }
            })
            .catch(err => {
                console.error("Error during logout:", err);
            });
        });
    } else {
        console.error("Logout button not found in the DOM.");
    }
});