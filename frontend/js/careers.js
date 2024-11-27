export function initcareers(){
    console.log("Initialized career page");
    document.body.addEventListener("click", (event) => {
        if (event.target && event.target.id === "trainerApplication") {
            navigate('trainerApplication');
        }
    });
}