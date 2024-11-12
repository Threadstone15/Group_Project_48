// import { navigate} from "../../js/contentLoader";

document.getElementById("logo").addEventListener("click", function () {
    navigate('home');
});

document.getElementById("services").addEventListener("click", function () {
    navigate('services');
});

document.getElementById("about").addEventListener("click", function () {
    navigate('about');
});

document.getElementById("find-trainer").addEventListener("click", function () {
    navigate('findATrainer');
});

document.getElementById("pricing").addEventListener("click", function () {
    navigate('pricing');
});

document.getElementById("careers").addEventListener("click", function () {
    navigate('careers');
});

document.getElementById("login").addEventListener("click", function () {
    navigate('login');
    // loadJSFile('login');
});

document.getElementById("member").addEventListener("click", function () {
    navigate('becomeMember');
    // loadJSFile('becomeMember');
});

document.getElementById("gymEquipment").addEventListener("click", function () {
    navigate('gymEquipment');
    // loadJSFile('gymEquipment');
});