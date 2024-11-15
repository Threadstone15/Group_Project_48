// Select the button and input elements
console.log("Publish Notices JS ");

const publishBtn = document.getElementById("publishBtn");
const noticeInput = document.getElementById("noticeInput");

// Function to publish a notice
publishBtn.addEventListener("click", () => {
    const noticeText = noticeInput.value.trim();

    // Check if the notice text is empty
    if (noticeText === "") {
        alert("Please enter a notice!");
        return;
    }

    // Retrieve auth token from local storage
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
        console.error("Auth token not found. Please log in.");
        alert("You are not logged in. Please log in to publish a notice.");
        return;
    }

    // Set up form data for the notice
    const formData = new FormData();
    formData.append("title", "Notice"); // Default title for now
    formData.append("description", noticeText);
    formData.append("action", "add_notice"); // Backend action to identify the request

    // Set up the request options
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`
        },
        body: formData,
        redirect: 'follow'
    };

    // Send POST request to backend
    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php", requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to publish notice");
            }
            return response.json();
        })
        .then(result => {
            console.log("Notice published successfully:", result);

            // Clear the input field
            noticeInput.value = "";

            // Optionally display a success message or update the notice list dynamically
            alert("Notice published successfully!");
        })
        .catch(error => console.error("Error publishing notice:", error));
});
