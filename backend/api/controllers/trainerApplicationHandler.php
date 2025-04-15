<?php
// trainerCareerHandler.php

include_once "../models/trainerApplication.php";
include_once "../models/User.php";
include_once "../models/Trainer.php";
include_once "../models/trainerCareer.php";
include_once "../../logs/save.php";
include_once "./accountMail.php";

function addTrainerApplication()
{
    logMessage("add trainer application function running...");

    $trainerApplication = new TrainerApplication();
    $user = new User();

    // Get the raw input data and decode JSON
    $data = json_decode(file_get_contents("php://input"), true);
    logMessage("Raw input data: " . json_encode($data));

    if (
        isset($data['career_id']) &&
        isset($data['firstName']) &&
        isset($data['lastName']) &&
        isset($data['NIC']) &&
        isset($data['dob']) &&
        isset($data['email']) &&
        isset($data['address']) &&
        isset($data['gender']) &&
        isset($data['mobile_number']) &&
        isset($data['years_of_experience']) &&
        isset($data['specialties']) &&
        isset($data['cv'])
    ) {
        logMessage("Adding new application...(content checked)");
        $career_id = $data['career_id'];
        $firstName = $data['firstName'];
        $lastName = $data['lastName'];
        $NIC = $data['NIC'];
        $dob = $data['dob'];
        $email = $data['email'];
        $address = $data['address'];
        $gender = $data['gender'];
        $mobile_number = $data['mobile_number'];
        $years_of_experience = $data['years_of_experience'];
        $specialties = $data['specialties'];
        $cv = $data['cv'];
        $approved_by_owner = FALSE;

        $userData = $user->getUserByEmail($email);
        if ($userData) {
            logMessage('Email already exists in the db');
            echo json_encode(["error" => "Email is already in use"]);
            exit();
        }
        $ApplicationData = $trainerApplication->getApplicationByEmail($email);
        if ($ApplicationData) {
            logMessage('Email already exists in the db');
            echo json_encode(["error" => "An application has been already submitted using this email"]);
            exit();
        }

        if ($trainerApplication->addApplication(
            $career_id,
            $firstName,
            $lastName,
            $NIC,
            $dob,
            $email,
            $address,
            $gender,
            $mobile_number,
            $years_of_experience,
            $specialties,
            $cv,
            $approved_by_owner
        )) {
            logMessage("Trainer application added successfully: $career_id");
            echo json_encode(["message" => "Appplication submitted successfully"]);
        } else {
            logMessage("Failed to add trainer appplication: $career_id");
            echo json_encode(["error" => "Trainer appplication addition failed"]);
        }
    } else {
        logMessage("Invalid input data for trainer application");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

function getTrainerApplications()
{
    $trainerApplication = new TrainerApplication();
    $applications = $trainerApplication->getApplications();

    if ($applications !== false) {
        echo json_encode($applications);
    } else {
        echo json_encode(["error" => "No trainer applications found"]);
    }
}
function getTrainerAppliedCareers()
{
    $trainerApplication = new TrainerApplication();
    $applications = $trainerApplication->getApplications();

    if ($applications === false || empty($applications)) {
        echo json_encode(["error" => "No trainer applications found"]);
        return;
    }

    $uniqueCareerIds = array_unique(array_column($applications, 'career_id'));

    $trainerCareer = new TrainerCareer();
    $trainerAppliedCareers = $trainerCareer->getCareerById($uniqueCareerIds);

    if ($trainerAppliedCareers !== false) {
        echo json_encode($trainerAppliedCareers);
    } else {
        echo json_encode(["error" => "No trainer careers found for the given applications"]);
    }
}
function updateTrainerApplicationStatus()
{
    logMessage("update trainer application status function running...");

    $trainerApplication = new TrainerApplication();
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['application_id']) &&
        isset($data['approved_by_owner'])
    ) {
        $application_id = $data['application_id'];
        $approved_by_owner = $data['approved_by_owner'];

        if ($trainerApplication->updateApplicationStatus($application_id, $approved_by_owner)) {
            if ($approved_by_owner == 1) {
                #Accepted
                $details = $trainerApplication->getApplicationByApplicationId($application_id);
                logMessage("Details: " . json_encode($details));
                $phone = $details['mobile_number'];
                $email = $details['email'];
                $firstName = $details['firstName'];
                $lastName = $details['lastName'];
                $NIC = $details['NIC'];
                $dob = $details['DOB'];
                $address = $details['address'];
                $years_of_experience = $details['years_of_experience'];
                $specialties = $details['specialties'];
                $cv_link = $details['cv'];
                $gender = $details['gender'];
                $password = "TRAINER" . $phone;
                $User = new User();
                $User->register($email, $password, "trainer");
                $user_id = $User->userExists($email);
                $Trainer = new Trainer();
                $Trainer->registerTrainer($user_id, $firstName, $lastName, $NIC, $dob, $address, $phone, $years_of_experience, $specialties, $cv_link, $gender);
                trainer_application_acceptance($email, $password);

                //trainer_application_acceptance($email, $password);
            } elseif ($approved_by_owner == 2) {
                #Rejected
                $email = $trainerApplication->getEmailByApplicationId($application_id);
                logMessage("Email: $email");
                trainer_application_rejection($email);
            } else {
                #Pending
            }
            logMessage("Trainer application status updated successfully: $application_id");
            echo json_encode(["message" => "Trainer application status updated successfully"]);
        } else {
            logMessage("Failed to update trainer application status: $application_id");
            echo json_encode(["error" => "Trainer application status update failed"]);
        }
    } else {
        logMessage("Invalid input for trainer application status update");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

function deleteTrainerApplication()
{
    logMessage("delete trainer application function running...");

    $trainerApplication = new TrainerApplication();

    if (isset($_GET['application_id'])) {
        $application_id = $_GET['application_id'];

        if ($trainerApplication->deleteApplication($application_id)) {
            logMessage("Trainer application deleted successfully: $application_id");
            echo json_encode(["message" => "Trainer application deleted successfully"]);
        } else {
            logMessage("Failed to delete trainer application: $application_id");
            echo json_encode(["error" => "Trainer application deletion failed"]);
        }
    } else {
        logMessage("Invalid input for trainer application deletion");
        echo json_encode(["error" => "Invalid input data"]);
    }
}
