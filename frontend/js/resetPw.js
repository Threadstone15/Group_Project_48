export function initresetPw() {
    console.log("Initializing resetPassword page");

    // Set the image source
    document.getElementById('img1').src = "/Group_Project_48/frontend/assets/images/Downloading 1.svg";



    // Add event listener for form submission
    document.getElementById('reset-password-form').addEventListener('submit', function (event) {
        event.preventDefault();

        // Get the token from localStorage
        const storedToken = localStorage.getItem('resetToken');
        if (!storedToken) {
            console.error("No token found in localStorage. Cannot proceed with password reset.");
            return;
        }

        // Get the new password value from the form input
        const newPassword = document.getElementById('new-password').value;



        // Call the backend API to reset the password
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/authController.php?action=password_reset", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'action': 'password_reset_mail_check'
            },
            body: JSON.stringify({
                token: storedToken,
                password: newPassword,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log("Password reset successful:", data.message);

                    localStorage.removeItem('resetToken');
                    navigate('login');
                } else {
                    console.error("Password reset failed:", data.message);
                }
            })
            .catch(error => {
                console.error("Error during password reset:", error);
            });
    });
}
