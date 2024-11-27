export function inittrainerApplication() {
    console.log("Trainer application page initialized");

    document.getElementById('trainerApplication').addEventListener('submit', function (event) {
        event.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const nic = document.getElementById('nic').value;
        const dob = document.getElementById('dob').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const mobile = document.getElementById('mobile').value;
        const experience = document.getElementById('experience').value;
        const specialties = document.getElementById('specialties').value;
        const cvLink = document.getElementById('cvLink').value;

        const errors = [];

        if (!firstName) errors.push("First Name is required.");
        if (!lastName) errors.push("Last Name is required.");
        if (!nic) errors.push("NIC is required.");
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Invalid email address.");
        if (!dob) {
            errors.push("Date of Birth is required.");
        } else {
            const age = calculateAge(new Date(dob));
            if (age < 18 || age > 30) errors.push("Age must be between 18 and 30.");
        }
        if (!address) errors.push("Address is required.");
        if (!mobile || !/^07\d{8}$/.test(mobile)) errors.push("Mobile number must be 10 digits long and start with '07'.");
        if (!experience) errors.push("Experience is required.");
        if (experience < 0) {
            errors.push("Years of experience must be a positive number.");
        }
        if (!specialties) errors.push("Specialties is required.");
        if (!cvLink || !/(https?:\/\/[^\s]+)/.test(cvLink)) {
            errors.push("Invalid CV link. Please enter a valid URL.");
        }

        if (errors.length > 0) {
            showFormResponse(errors, "error");
            return;
        }

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const applicationData = JSON.stringify({
            "career_id": "C1",
            "firstName": firstName,
            "lastName": lastName,
            "NIC": nic,
            "dob": dob,
            "email": email,
            "address": address,
            "mobile_number": mobile,
            "years_of_experience": experience,
            "specialties": specialties,
            "cv": cvLink
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: applicationData,
            redirect: "follow"
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/landingPageController.php?action=add_trainer_application", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to send application");
                return response.json();
            })
            .then(data => {
                console.log("Response data:", data);  // Log the parsed JSON data

                if (data.error) {
                    showFormResponse(data.error, "error");
                } else if (data.message) {
                    showFormResponse(data.message, "success");
                    setTimeout(() => {
                        navigate('careers');
                    }, 3000);
                } else {
                    showFormResponse("Failed to send the application", "error");
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