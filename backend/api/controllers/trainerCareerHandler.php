<?php
// trainerCareerHandler.php

include_once "../models/TrainerCareer.php";
include_once "../../logs/save.php";
function addTrainerCareer() {
    logMessage("add trainer career function running...");

    $trainerCareer = new TrainerCareer();

    // Get the raw input data and decode JSON
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate that required fields exist
    if (
        isset($data['job_role']) &&
        isset($data['requirements'])
    ) {
        $job_role = $data['job_role'];
        $requirements = $data['requirements'];

        if ($trainerCareer->addCareer($job_role, $requirements)) {
            logMessage("Trainer career added successfully: $job_role");
            echo json_encode(["message" => "Trainer career added successfully"]);
        } else {
            logMessage("Failed to add trainer career: $job_role");
            echo json_encode(["error" => "Trainer career addition failed"]);
        }
    } else {
        logMessage("Invalid input data for trainer career");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

function getTrainerCareer() {
    $trainerCareer = new TrainerCareer();
    $careers = $trainerCareer->getCareer();

    if ($careers !== false) {
        echo json_encode($careers);
    } else {
        echo json_encode(["error" => "No trainer careers found"]);
    }
}
function updateTrainerCareer() {
    logMessage("update trainer career function running...");

    $trainerCareer = new TrainerCareer();
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['career_id']) &&
        isset($data['job_role']) &&
        isset($data['requirements']) 
    ) {

        $career_id = $data['career_id'];
        $job_role = $data['job_role'];
        $requirements = $data['requirements'];

        if ($trainerCareer->updateCareer($career_id, $job_role, $requirements)) {
            logMessage("Trainer career updated successfully: $career_id");
            echo json_encode(["message" => "Trainer career updated successfully"]);
        } else {
            logMessage("Failed to update trainer career: $career_id");
            echo json_encode(["error" => "Trainer career update failed"]);
        }
    } else {
        logMessage("Invalid input for trainer career update");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

function deleteTrainerCareer() {
    logMessage("delete trainer creer function running...");

    $trainerCareer = new TrainerCareer();

    if (isset($_GET['career_id'])) {
        $career_id = $_GET['career_id'];

        if ($trainerCareer->deleteCareer($career_id)) {
            logMessage("Trainer career deleted successfully: $career_id");
            echo json_encode(["message" => "Trainer career deleted successfully"]);
        } else {
            logMessage("Failed to delete trainer career: $career_id");
            echo json_encode(["error" => "Trainer career deletion failed"]);
        }
    } else {
        logMessage("Invalid input for trainer career deletion");
        echo json_encode(["error" => "Invalid input data"]);
    }
}
?>
