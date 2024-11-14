document.getElementById("addMemberForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    const profileImage = document.getElementById("profileImage").files[0];
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const membership = document.getElementById("membership").value;
    const password = document.getElementById("password").value;
  
    if (!profileImage || !name || !email || !age || !gender || !membership || !password) {
      alert("Please fill in all fields.");
      return;
    }
  
    // Display member info in the console as an example
    console.log("Profile Image:", profileImage.name);
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Age:", age);
    console.log("Gender:", gender);
    console.log("Membership Plan:", membership);
    console.log("Password:", password);
  
    alert("Member added successfully!");
  
    // Clear form fields
    document.getElementById("addMemberForm").reset();
  });

  // Preview image before uploading
  function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
      const preview = document.getElementById('profileImagePreview');
      preview.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }
  