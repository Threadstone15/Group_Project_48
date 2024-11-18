console.log("JS loaded");

// Select the button, input, and list elements
const publishBtn = document.getElementById("publishBtn");
const noticeInput = document.getElementById("noticeInput");
const noticesList = document.getElementById("noticesList");

// Function to publish a notice
publishBtn.addEventListener("click", () => {
    const noticeText = noticeInput.value.trim();
    
    // Check if notice text is empty
    if (noticeText === "") {
        alert("Please enter a notice!");
        return;
    }

    // Prepare the data to send to the backend
    const noticeData = {
        title: "New Notice", // You can customize the title or make it dynamic if needed
        description: noticeText,
    };

    const authToken = localStorage.getItem("authToken");

    // Prepare request options
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(noticeData),
    };

    // Send the request to the backend
    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=add_notice", requestOptions)
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert("Notice published successfully!");
                
                // Create a new list item element for the notice
                const noticeItem = document.createElement("li");
                noticeItem.classList.add("notice-item");
                noticeItem.textContent = noticeText;
                
                // Add the new notice to the top of the list
                noticesList.prepend(noticeItem);
                
                // Clear the input field
                noticeInput.value = "";
            } else {
                alert("Failed to publish notice.");
            }
        })
        .catch(error => console.error("Error publishing notice:", error));
});
