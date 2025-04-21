import { navigate } from "../router.js";
import { runSessionTimedOut } from "../routeConfig.js";

export function initMember_getATrainer() {
    console.log("Initializing getATrainer.js");
    fetchAssignedMember();

    let assignedMemberExists = false;
    let assignedMember = null;
    function fetchAssignedMember() {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("An error has occurred. Please log in again", "error");
            navigate("login");
            return;
        }
        const requestOptions = {
            method: "GET",
            headers: { "Authorization": `Bearer ${authToken}` },
            redirect: "follow"
        };
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_assigned_trainer", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to fetch trainer applied careers");
                    return data;
                });
            })
            .then(data => {
                if (data.error) {
                    showToast(data.error, "error");
                } else if (data.message == "No Assigned Trainer") {
                    fetchDetailsOfTrainers();
                } else {
                    if(data.length > 0){
                        assignedMemberExists = true;
                        assignedMember = data;
                    }
                    fetchDetailsOfTrainers();
                }
            })
            .catch(error => {
                console.error("API Error:", error.message);
                if (error.message === "Token expired") {
                    runSessionTimedOut();
                } else {
                    alert("Error: " + error.message);
                }
            });
    }

    let allTrainers = [];
    function fetchDetailsOfTrainers() {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("An error has occurred. Please log in again", "error");
            navigate("login");
            return;
        }
        const requestOptions = {
            method: "GET",
            headers: { "Authorization": `Bearer ${authToken}` },
            redirect: "follow"
        };
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_trainers_details", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to fetch trainer applied careers");
                    return data;
                });
            })
            .then(data => {
                if (data.error) {
                    showToast(data.error, "error");
                    return;
                } else if (data.length > 0) {
                    allTrainers = data.filter(trainer => trainer.status === 1); //activated accounts
                    if (assignedMemberExists) {
                        allTrainers = allTrainers.filter(trainer => trainer.id !== assignedMember.trainer_id);
                    }
                    displayTrainersInfo(allTrainers);
                } else {
                    console.warn("No Trainers Found");
                    return;
                }
            })
            .catch(error => {
                console.error("API Error:", error.message);
                if (error.message === "Token expired") {
                    runSessionTimedOut();
                } else {
                    alert("Error: " + error.message);
                }
            });
    }

    //do from here
    function displayTrainersInfo(trainers) {
        const trainersCards = document.getElementById("trainers-profiles");
        trainersCards.innerHTML = "";
        trainers.forEach(trainer => {
            const trainerProfile = document.createElement("div");
            trainerProfile.className = "trainer-profile";
            trainerProfile.innerHTML = `
            <h2 class="profile-label">${trainer.firstName} ${trainer.lastName}</h2>
            <p class="profile-name">${trainer.email}</p>
            <p class="profile-name">${trainer.phone}</p>
            <p class="profile-label">Specialties : </p>
            <p class="profile-specialties">: ${trainer.specialties}</p>
            <p class="profile-name">Experience : ${trainer.years_of_experience} years</p>
            ${assignedMemberExists ? 
                `<button class="contact-button" id="changeTrainer" data-trainer-id="${trainer.trainer_id}">
                    Change Trainer
                </button>` 
                : 
                `<button class="contact-button" id="selectTrainer" data-trainer-id="${trainer.trainer_id}">
                    Select Trainer
                </button>`
            }
            `;
            trainersCards.appendChild(trainerProfile);
        });
        trainersCards.addEventListener('click', (event) => {
            if (event.target.id == "changeTrainer") {
              const trainerID = event.target.getAttribute('data-trainer-id');
            //   openUpdatePopup(classId);
            }
            if (event.target.id == "selectTrainer") {
              const trainerID = event.target.getAttribute('data-trainer-id');
            //   openDeletePopup(classId);
            }
          });
    }


    function showToast(message, type) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
}