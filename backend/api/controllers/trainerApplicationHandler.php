<?php
// trainerCareerHandler.php

include_once "../models/trainerApplication.php";
include_once "../models/User.php";
include_once "../../logs/save.php";
function addTrainerApplication() {
    logMessage("add trainer application function running...");

    $trainerApplication = new TrainerApplication();
    $user = new User();

    // Get the raw input data and decode JSON
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['career_id']) &&
        isset($data['firstName']) &&
        isset($data['lastName']) &&
        isset($data['NIC']) &&
        isset($data['dob']) &&
        isset($data['email']) &&
        isset($data['address']) &&
        isset($data['mobile_number']) &&
        isset($data['years_of_experience']) &&
        isset($data['specialties']) &&
        isset($data['cv'])
    ) {
        $career_id = $data['career_id'];
        $firstName = $data['firstName'];
        $lastName = $data['lastName'];
        $NIC = $data['NIC'];
        $dob = $data['dob'];
        $email = $data['email'];
        $address = $data['address'];
        $mobile_number = $data['mobile_number'];
        $years_of_experience = $data['years_of_experience'];
        $specialties = $data['specialties'];
        $cv = $data['cv'];
        $approved_by_owner = FALSE;

        $userData = $user->getUserByEmail($email);
        if ($userData){
            logMessage('Email already exists in the db');
            echo json_encode(["error" => "Email is already in use"]);
            exit();
        }
        $ApplicationData = $trainerApplication->getApplicationByEmail($email);
        if($ApplicationData){
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

function getTrainerApplications() {
    $trainerApplication = new TrainerApplication();
    $applications = $trainerApplication->getApplications();

    if ($applications !== false) {
        echo json_encode($applications);
    } else {
        echo json_encode(["error" => "No trainer applications found"]);
    }
}
function updateTrainerApplicationStatus() {
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

function deleteTrainerApplication() {
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
?>
