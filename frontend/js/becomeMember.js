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

        const errors = [];

        if (!firstName) errors.push("First Name is required.");
        if (!lastName) errors.push("Last Name is required.");
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Invalid email address.");
        if (!password || !/(?=.*[!@#$%^&*])(?=.*\d).{6,}/.test(password)) {
            errors.push("Password must be at least 6 characters long, include a special character, and a number.");
        }
        if (!dob) {
            errors.push("Date of Birth is required.");
        } else {
            const age = calculateAge(new Date(dob));
            if (age < 12 || age > 100) errors.push("Age must be between 12 and 100.");
        }
        if (!address) errors.push("Address is required.");
        if (!mobile || !/^07\d{8}$/.test(mobile)) errors.push("Mobile number must be 10 digits long and start with '07'.");
        if (!gender) errors.push("Gender is required.");

        if (errors.length > 0) {
            showFormResponse(errors, "error");
            return;
        }

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
                    showFormResponse(data.error, "error");
                } else if (data.message) {
                    showFormResponse(data.message, "success");
                    navigate('login');
                } else {
                    showFormResponse("Failed to register the member", "error");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                showFormResponse("An error occurred. Please try again later.", "error");
            });

    });

    function calculateAge(dob) {
        const diff = Date.now() - dob.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
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

}
