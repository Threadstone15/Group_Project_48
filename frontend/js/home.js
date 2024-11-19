export function inithome() {
    console.log("Initializing home.js")

    const imageElement1 = document.getElementById('img1');
    imageElement1.src = "/Group_Project_48/frontend/assets/images/home_img1.png";

    const imageElement2 = document.getElementById('img2');
    imageElement2.src = "/Group_Project_48/frontend/assets/images/home_img2.png";

    document.body.addEventListener("click", (event) => {
        if (event.target && (event.target.id === "member" || event.target.id === "member2")) {
            navigate('becomeMember');
        }
        if (event.target && event.target.id === "see-more") {
            navigate('about');
        }
        if (event.target && event.target.id === "more-services") {
            navigate('services');
        }
        if (event.target && event.target.id === "trainers") {
            navigate('findATrainer');
        }
    });

}