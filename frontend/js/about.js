export function initabout() {
    console.log("Initializing about.js")

    document.body.addEventListener("click", (event) => {
        if (event.target && event.target.id === "member") {
            navigate('becomeMember');
        }
    });

}