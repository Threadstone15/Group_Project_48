export function initbecomeMember() {

    document.getElementById('memberRegistration').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form submission

        // Capture form data
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const day = document.getElementById('day').value;
        const month = document.getElementById('month').value;
        const year = document.getElementById('year').value;
        const dateOfBirth = `${year}-${month}-${day}`; // Format DOB as YYYY-MM-DD
        const address = document.getElementById('address').value;
        const mobile = document.getElementById('mobile').value;
        const gender = document.getElementById('gender').value;

        // Create headers and payload for registration
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const registrationData = JSON.stringify({
            "register": 1,  // Assuming your backend expects this key to initiate registration
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "password": password,
            "dateOfBirth": dateOfBirth,
            "address": address,
            "mobile": mobile,
            "gender": gender
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: registrationData,
            redirect: "follow"
        };

        // Fetch API to send registration data to backend
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php", requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log("Response data:", data);  // Log the parsed JSON data

                if (data.success) {
                    alert("Registration successful! Please log in.");

                    // Redirect to login page after registration
                    window.location.href = 'pages/login.html';
                } else {
                    // Display error message if registration fails
                    alert(data.error || "Registration failed. Please check your details.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
            });
    });

}
