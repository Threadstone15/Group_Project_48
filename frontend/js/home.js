export function inithome() {
    console.log("Initializing home.js");

    // const pageCssUrl = `/Group_Project_48/frontend/css/home.css`;
    // const pageCssLink = document.createElement("link");
    // pageCssLink.rel = "stylesheet";
    // pageCssLink.href = pageCssUrl;
    // document.head.appendChild(pageCssLink);

    // const globalCssUrl = '/Group_Project_48/frontend/css/globals.css';
    // const globalCssLink = document.createElement("link");
    // globalCssLink.rel = "stylesheet";
    // globalCssLink.href = globalCssLink;
    // document.head.appendChild(globalCssLink);

    const imageElement1 = document.getElementById('img1');
    imageElement1.src = "/Group_Project_48/frontend/assets/images/home_img1.png";

    const imageElement2 = document.getElementById('img2');
    imageElement2.src = "/Group_Project_48/frontend/assets/images/home_img2.png";

    const imageElement3 = document.getElementById('trainer1');
    imageElement3.src = "/Group_Project_48/frontend/assets/images/trainer1.jpeg";

    const imageElement4 = document.getElementById('trainer2');
    imageElement4.src = "/Group_Project_48/frontend/assets/images/trainer2.jpg";

    const imageElement5= document.getElementById('trainer3');
    imageElement5.src = "/Group_Project_48/frontend/assets/images/trainer3.jpg";

    const imageElement6 = document.getElementById('trainer4');
    imageElement6.src = "/Group_Project_48/frontend/assets/images/trainer4.jpg";

    document.body.addEventListener("click", (event) => {
        if (event.target && (event.target.id === "member" || event.target.id === "member2")) {
            navigate('becomeMember');
        }
        if (event.target && event.target.id === "about-seeMore") {
            navigate('about');
        }
        if (event.target && event.target.id === "facilities-seeMore") {
            navigate('services');
        }
        if (event.target && event.target.id === "trainers-seeMore") {
            navigate('findATrainer');
        }
    });

}