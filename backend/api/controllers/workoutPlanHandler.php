<?php
// workoutPlanHandler.php

include_once "../models/workoutPlan.php";
include_once "../../logs/save.php";

function createWorkoutPlan($user_id)
{
    logMessage("create workout plan function running...");


    $input = json_decode(file_get_contents("php://input"), true);

    $workoutPlanData = $input['workout_plan'];
    $descriptionJson = json_encode($workoutPlanData);

    logMessage("Workout plan data: " . $descriptionJson);

    $workoutPlan = new WorkoutPlan();
    $result = $workoutPlan->addWorkoutPlan($user_id, $descriptionJson);

    if ($result) {
        http_response_code(201);
        echo json_encode(["message" => "Workout plan created successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to create workout plan."]);
    }
}

function addWorkoutPlan()
{
    logMessage("add workout plan function running...");

    $workoutPlan = new WorkoutPlan();

    $trainer_id = filter_var($_POST['trainer_id'], FILTER_SANITIZE_STRING);
    $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
    $description = $_POST['description'];

    if ($workoutPlan->addWorkoutPlan($trainer_id, $name, $description)) {
        logMessage("Workout plan added: $name");
        echo json_encode(["message" => "Workout plan added successfully"]);
    } else {
        logMessage("Failed to add workout plan: $name");
        echo json_encode(["error" => "Workout plan addition failed"]);
    }
}

function getWorkoutPlans()
{
    logMessage("get workout plans function running...");
    $workoutPlan = new WorkoutPlan();

    $result = $workoutPlan->getWorkoutPlans();

    if ($result) {
        logMessage("Workout plans data fetched");
        echo json_encode($result);
    } else {
        logMessage("No workout plans found");
        echo json_encode(["error" => "No workout plans found"]);
    }
}

function updateWorkoutPlan()
{
    logMessage("update workout plan function running...");

    $workoutPlan = new WorkoutPlan();
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['workout_plan_id']) &&
        isset($data['trainer_id']) &&
        isset($data['name']) &&
        isset($data['description'])
    ) {

        $workout_plan_id = intval($data['workout_plan_id']);
        $trainer_id = filter_var($data['trainer_id'], FILTER_SANITIZE_STRING);
        $name = filter_var($data['name'], FILTER_SANITIZE_STRING);
        $description = filter_var($data['description'], FILTER_SANITIZE_STRING);

        if ($workoutPlan->updateWorkoutPlan($workout_plan_id, $trainer_id, $name, $description)) {
            logMessage("Workout plan updated successfully: ID $workout_plan_id");
            echo json_encode(["message" => "Workout plan updated successfully"]);
        } else {
            logMessage("Failed to update workout plan: ID $workout_plan_id");
            echo json_encode(["error" => "Workout plan update failed"]);
        }
    } else {
        logMessage("Invalid input for workout plan update");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

function deleteWorkoutPlan()
{
    logMessage("delete workout plan function running...");

    $workoutPlan = new WorkoutPlan();
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['workout_plan_id'])) {
        $workout_plan_id = intval($input['workout_plan_id']);

        if ($workoutPlan->deleteWorkoutPlan($workout_plan_id)) {
            logMessage("Workout plan deleted: $workout_plan_id");
            echo json_encode(["message" => "Workout plan deleted successfully"]);
        } else {
            logMessage("Failed to delete workout plan: $workout_plan_id");
            echo json_encode(["error" => "Workout plan deletion failed"]);
        }
    } else {
        logMessage("Invalid input for workout plan deletion");
        echo json_encode(["error" => "Invalid input data"]);
    }
}
