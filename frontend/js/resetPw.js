export function initresetPw(){
    console.log("inititliazing resetPassword page");

    document.getElementById('img1').src = "/Group_Project_48/frontend/assets/images/Downloading 1.svg";

    document.getElementById('reset-password-form').addEventListener('submit', function (event) {
        event.preventDefault();

        //if success
        navigate('login');
    });
}