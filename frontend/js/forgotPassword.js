export function initforgotPassword(){
    console.log("Initializing forgotPassword page");

    document.getElementById('img1').src = "/Group_Project_48/frontend/assets/images/Too Busy 1.svg";

    document.body.addEventListener("click", (event) => {
        if (event.target && event.target.id === "login") {
            navigate('login');
        }
    });

    document.getElementById('forgot-password-form').addEventListener('submit', function (event) {
        event.preventDefault();

        //if success
        navigate('resetPw');
    });
}