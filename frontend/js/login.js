document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // alert(email + password);

    const loginData = {
        login : 1,
        email: email,
        password: password
    };

    fetch('http://localhost:8080/Group_Project_48/backend/api/controllers/authController.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Login successful!');
                //indow.location.href = 'dashboard.html';
            } else {
                alert(data.error || 'Login failed. Please check your credentials.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        });
});

// document.getElementById('loginForm').addEventListener('submit', function (event) {
//     event.preventDefault();
//     alert('Login button clicked!');
//   });