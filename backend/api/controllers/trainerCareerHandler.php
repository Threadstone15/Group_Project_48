<?php
// trainerCareerHandler.php

include_once "../models/TrainerCareer.php";
include_once "../../logs/save.php";

function addTrainerCareer($conn) {
    $trainerCareer = new TrainerCareer($conn);
    $job_role = filter_var($_POST['job_role'], FILTER_SANITIZE_STRING);
    $requirements = filter_var($_POST['requirements'], FILTER_SANITIZE_STRING);

    if ($trainerCareer->addCareer($job_role, $requirements)) {
        logMessage("Trainer career added successfully: $job_role");
        echo json_encode(["message" => "Trainer career added successfully"]);
    } else {
        logMessage("Failed to add trainer career: $job_role");
        echo json_encode(["error" => "Trainer career addition failed"]);
    }
}

function getTrainerCareer($conn) {
    $trainerCareer = new TrainerCareer($conn);
    $career_id = isset($_GET['career_id']) ? intval($_GET['career_id']) : null;

    $careers = $trainerCareer->getCareer($career_id);
    if ($careers) {
        echo json_encode($careers);
    } else {
        echo json_encode(["error" => "No trainer careers found"]);
    }
}

function updateTrainerCareer($conn) {
    $trainerCareer = new TrainerCareer($conn);
    $career_id = intval($_POST['career_id']);
    $job_role = filter_var($_POST['job_role'], FILTER_SANITIZE_STRING);
    $requirements = filter_var($_POST['requirements'], FILTER_SANITIZE_STRING);

    if ($trainerCareer->updateCareer($career_id, $job_role, $requirements)) {
        logMessage("Trainer career updated successfully: $career_id");
        echo json_encode(["message" => "Trainer career updated successfully"]);
    } else {
        logMessage("Failed to update trainer career: $career_id");
        echo json_encode(["error" => "Trainer career update failed"]);
    }
}

function deleteTrainerCareer($conn) {
    $trainerCareer = new TrainerCareer($conn);
    $career_id = intval($_POST['career_id']);

    if ($trainerCareer->deleteCareer($career_id)) {
        logMessage("Trainer career deleted successfully: $career_id");
        echo json_encode(["message" => "Trainer career deleted successfully"]);
    } else {
        logMessage("Failed to delete trainer career: $career_id");
        echo json_encode(["error" => "Trainer career deletion failed"]);
    }
}
?>
