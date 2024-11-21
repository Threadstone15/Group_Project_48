export function initbecomeMember() {

    document.getElementById('memberRegistration').addEventListener('submit', function (event) {
        event.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const dob = document.getElementById('dob').value;
        const address = document.getElementById('address').value;
        const mobile = document.getElementById('mobile').value;
        const gender = document.getElementById('gender').value;

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const registrationData = JSON.stringify({
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "password": password,
            "dob": dob,
            "address": address,
            "phone": mobile,
            "gender": gender
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: registrationData,
            redirect: "follow"
        };

        // Fetch API to send registration data to backend
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/authController.php?action=register_member", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to register member");
                return response.json();
            })
            .then(data => {
                console.log("Response data:", data);  // Log the parsed JSON data

                if (data.error) {
                    alert(data.error);
                } else if (data.message) {
                    alert(data.message);
                    navigate('login');
                } else {
                    // Fallback in case response structure is unexpected
                    alert("Unexpected response. Please try again.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
            });

    });

}
