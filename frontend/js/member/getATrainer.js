import { navigate } from "../router.js";
import { runSessionTimedOut } from "../routeConfig.js";

export function initMember_getATrainer() {
    console.log("Initializing getATrainer.js");
    verifyMembershipPlan();
    // fetchAssignedTrainer(); //starts running after plan is verified and after access to features are controlled

    let assignedTrainerExists = false;
    let assignedTrainer = null;
    let assignedTrainerInfo = null;
    let allTrainers = [];
    let isMembershipPlanVerified = false;

    function fetchAssignedTrainer() {
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
                } else if (data.message === "No Assigned Trainer") {
                    document.getElementById("assigned-trainer").innerHTML = '';
                    assignedTrainerExists = false;
                    fetchDetailsOfTrainers();
                } else {
                    assignedTrainerExists = true;
                    assignedTrainer = data;
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
                    if (!response.ok) throw new Error("Failed to fetch details of trainers");
                    return data;
                });
            })
            .then(data => {
                if (data.error) {
                    showToast(data.error, "error");
                    return;
                } else {
                    allTrainers = data.filter(trainer => trainer.status === 1); //activated accounts
                    if (assignedTrainerExists) {
                        allTrainers = allTrainers.filter(trainer => trainer.trainer_id !== assignedTrainer.trainer_id);
                        assignedTrainerInfo = data.find(trainer => trainer.trainer_id === assignedTrainer.trainer_id);
                        displayAssignedTrainer(assignedTrainerInfo);
                    }
                    displayTrainersInfo(allTrainers);
                }
            })
            .catch(error => {
                console.error("API Error:", error.message);
                if (error.message === "Token expired") {
                    showToast("Your session has timed out. Please log in again", "error");
                    setTimeout(() => {
                        runSessionTimedOut();
                    }, 4000);
                } else {
                    showToast(error.message, "error");
                }
            });
    }

    function displayTrainersInfo(trainers) {
        const trainersCards = document.getElementById("trainers-profiles");
        trainersCards.innerHTML = "";

        trainers.forEach(trainer => {
            let selectChangeTrainerPossible = true;
            if (Number(trainer.assigned_member_count) >= 50) {
                selectChangeTrainerPossible = false;
            }

            const trainerProfile = document.createElement("div");
            trainerProfile.className = "trainer-profile";

            trainerProfile.innerHTML = `
                <h2 class="profile-label">${trainer.firstName} ${trainer.lastName}</h2>
                <p class="profile-name">${trainer.email}</p>
                <p class="profile-name">${trainer.phone}</p>
                <p class="profile-label">Specialties : </p>
                <p class="profile-specialties">${trainer.specialties}</p>
                <p class="profile-name">Experience : ${trainer.years_of_experience} years</p>
                ${assignedTrainerExists ?
                    `<button class="contact-button" id="changeTrainer" data-trainer-id="${trainer.trainer_id}" 
                     ${!selectChangeTrainerPossible ? 'disabled' : ''}>
                        Change Trainer
                    </button>`
                    :
                    `<button class="contact-button" id="selectTrainer" data-trainer-id="${trainer.trainer_id}" 
                     ${!selectChangeTrainerPossible ? 'disabled' : ''}>
                        Select Trainer
                    </button>`
                }
            `;

            trainersCards.appendChild(trainerProfile);
        });
    }

    //event listner for buttons
    document.getElementById("trainers-profiles").addEventListener("click", (event) => {
        const trainerID = event.target.getAttribute("data-trainer-id");
        if (!trainerID) return;

        if (event.target.id === "changeTrainer") {
            changeTrainer(trainerID);
        }
        if (event.target.id === "selectTrainer") {
            selectTrainer(trainerID);
        }
    });

    function displayAssignedTrainer(trainer) {
        const assignedTrainerCard = document.getElementById("assigned-trainer");
        assignedTrainerCard.innerHTML = "";
        assignedTrainerCard.innerHTML = `
        <h1 class="profile-label">Assigned Trainer : </h2>
        <h2 class="profile-label">${trainer.firstName} ${trainer.lastName}</h2>
        <p class="profile-name">${trainer.email}</p>
        <p class="profile-name">${trainer.phone}</p>
        <p class="profile-label">Specialties : </p>
        <p class="profile-specialties">${trainer.specialties}</p>
        <p class="profile-name">Experience : ${trainer.years_of_experience} years</p>
        <button class="contact-button" id="removeTrainer" data-trainer-id="${trainer.trainer_id}">
                    Remove Trainer
        </button>
        `;
    }

    //event listner for remove trainer button
    document.getElementById("assigned-trainer").addEventListener("click", (event) => {
        const trainerID = event.target.getAttribute("data-trainer-id");
        if (!trainerID) return;

        if (event.target.id === "removeTrainer") {
            removeTrainer(trainerID);
        }
    });

    function removeTrainer() {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("An error has occurred. Please log in again", "error");
            navigate("login");
            return;
        }
        const requestOptions = {
            method: 'DELETE',
            headers: { "Authorization": `Bearer ${authToken}` },
            redirect: 'follow'
        }
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=remove_assigned_trainer", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to remove assigned trainer");
                    return data;
                });
            })
            .then(data => {
                if (data.error) {
                    showToast(data.error, "error");
                    return;
                } else {
                    showToast(data.message, "success");
                    assignedTrainerExists = false;
                    fetchAssignedTrainer();
                    setTimeout(() => {
                        fetchAssignedTrainer();
                    }, 2000);
                }
            })
            .catch(error => {
                console.error("API Error:", error.message);
                if (error.message === "Token expired") {
                    showToast("Your session has timed out. Please log in again", "error");
                    setTimeout(() => {
                        runSessionTimedOut();
                    }, 4000);
                } else {
                    showToast(error.message, "error");
                }
            });
    }

    function selectTrainer(trainerID) {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("An error has occurred. Please log in again", "error");
            navigate("login");
            return;
        }

        const payload = {
            "trainer_id": trainerID
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            redirect: "follow"
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=select_trainer", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to assign the trainer");
                    return data;
                });
            })
            .then(data => {
                if (data.error) {
                    showToast(data.error, "error");
                    return;
                } else {
                    showToast(data.message, "success");
                    setTimeout(() => {
                        fetchAssignedTrainer();
                    }, 2000);
                }
            })
            .catch(error => {
                console.error("API Error:", error.message);
                if (error.message === "Token expired") {
                    showToast("Your session has timed out. Please log in again", "error");
                    setTimeout(() => {
                        runSessionTimedOut();
                    }, 4000);
                } else {
                    showToast(error.message, "error");
                }
            });
    }

    function changeTrainer(trainerID) {
        const authToken = localStorage.getItem("authToken");
        const payload = {
            "trainer_id": trainerID
        }
        const requestOptions = {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            redirect: "follow"
        }
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=change_assigned_trainer", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to change assigned trainer");
                    return data;
                });
            })
            .then(data => {
                if (data.error) {
                    showToast(data.error, "error");
                    return;
                } else {
                    showToast(data.message, "success");
                    setTimeout(() => {
                        fetchAssignedTrainer();
                    }, 2000);
                }
            })
            .catch(error => {
                console.error("API Error:", error.message);
                if (error.message === "Token expired") {
                    showToast("Your session has timed out. Please log in again", "error");
                    setTimeout(() => {
                        runSessionTimedOut();
                    }, 4000);
                } else {
                    showToast(error.message, "error");
                }
            });
    }

    function verifyMembershipPlan() {
        const authToken = localStorage.getItem("authToken");
        const basePlanID = localStorage.getItem("basePlanID");

        if (!authToken || !basePlanID) {
            showToast("An error has occurred. Please log in again", "error");
            navigate("login");
            return;
        }

        const payload = {
            "base_plan_id": basePlanID
        }

        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=verify_membership_plan", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to verify the membership plan");
                    return data;
                });
            })
            .then(data => {
                console.log("Membership Plan Verification Response:", data);
                if (data.message && data.message === "membership plan verified") {
                    isMembershipPlanVerified = true;
                    controlAccessToFeatures();
                } else if (data.error) {
                    showToast("An error has occurred. Please log in again", "error");
                    setTimeout(() => {
                        //logging out -> this func does the same
                        runSessionTimedOut();
                    }, 4000);
                }
            })
            .catch(error => {
                console.error("API Error:", error.message);
                if (error.message === "Token expired") {
                    showToast("Your session has timed out. Please log in again", "error");
                    setTimeout(() => {
                        runSessionTimedOut();
                    }, 4000);
                } else {
                    showToast(error.message, "error");
                }
            });
    }

    function controlAccessToFeatures() {
        const basePlanID = localStorage.getItem("basePlanID");
        if (isMembershipPlanVerified) {
            const assignedTrainerFeature = document.getElementById('assignedTrainerFeature');
            const selectTrainerFeature = document.getElementById('selectTrainerFeature');
            const upgradePlanPopup = document.getElementById("planUpgradePopup");

            if (basePlanID === 'MP1' || basePlanID === 'MP2') {
                assignedTrainerFeature?.classList.add("disabled-feature");
                selectTrainerFeature?.classList.add("disabled-feature");
                //showing upgrade plan popup
                upgradePlanPopup.style.display = 'block';
                fetchDetailsOfTrainers();
            } else if (basePlanID === 'MP3') {
                assignedTrainerFeature?.classList.remove("disabled-feature");
                selectTrainerFeature?.classList.remove("disabled-feature");
                //closing upgrade plan popup
                upgradePlanPopup.style.display = 'none';

                fetchAssignedTrainer();
            }
        }
    }

    document.getElementById("upgradePlanBtn").onclick = () => {
        navigate('member/upgradePlan');
    };

    function showToast(message, type) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
}