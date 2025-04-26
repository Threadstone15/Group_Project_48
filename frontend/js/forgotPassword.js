console.log("Forget password loaded");

export function initforgotPassword() {
  console.log("Initializing forgotPassword page");

  const spinner = document.getElementById("loading-spinner");

  document.getElementById("img1").src = "/Group_Project_48/frontend/assets/images/Too Busy 1.svg";

  // Navigate to login page on clicking "Back to Login"
  document.body.addEventListener("click", (event) => {
    if (event.target && event.target.id === "login") {
      navigate("login");
    }
  });

  // Handle form submission
  document.getElementById("forgot-password-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const emailInput = document.getElementById("email").value.trim();

    if (!emailInput) {
      alert("Please enter your email address.");
      return;
    }

    console.log("Submitting password reset request for:", emailInput);

    // Set up request headers
    const myHeaders = new Headers();
    myHeaders.append("action", "password_reset_mail_check");
    myHeaders.append("Content-Type", "application/json");

    // Prepare the request payload
    const raw = JSON.stringify({
      action: "password_reset_mail_check",
      email: emailInput,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    spinner.classList.remove("hidden");

    // Send fetch request to the backend
    fetch(
      "http://localhost:8080/Group_Project_48/backend/api/controllers/authController.php?action=password_reset_mail_check",
      requestOptions
    )
      .then((response) => response.json()) // Parse the response JSON
      .then((result) => {
        console.log("Password reset response:", result);

        if (result.success) {
          spinner.classList.add("hidden");

          if (result.resetToken) {
            localStorage.setItem("resetToken", result.resetToken);
            console.log("Reset token saved to local storage:", result.resetToken);
            showToast("Password reset email sent successfully!", "success");
            //wait for 2 seconds before navigating to the login page
            setTimeout(() => {
              navigate("login"); // Navigate to reset password page
            }, 2000);
          }
        } else {
          spinner.classList.add("hidden");
          showToast(result.message || "Failed to send password reset email. Please try again.", "error");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        spinner.classList.add("hidden");
        showToast("An error occurred while sending the password reset email.", "error");
      });
  });

  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
  }

}
