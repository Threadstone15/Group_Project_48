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
    
    // Create a new list item element for the notice
    const noticeItem = document.createElement("li");
    noticeItem.classList.add("notice-item");
    noticeItem.textContent = noticeText;
    
    // Add the new notice to the top of the list
    noticesList.prepend(noticeItem);
    
    // Clear the input field
    noticeInput.value = "";
});
