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

function getWorkoutPlans($user_id)
{
    logMessage("get workout plans function running...");
    $workoutPlan = new WorkoutPlan();

    $result = $workoutPlan->getWorkoutPlansByUserId($user_id);

    if ($result) {
        logMessage("Workout plans data fetched");
        echo json_encode($result);
    } else {
        logMessage("No workout plans found");
        echo json_encode(["error" => "No workout plans found"]);
    }
}

function editUserWorkoutPlans($data)
{
    logMessage("editUserWorkoutPlans function running...");

    $workoutPlan = new WorkoutPlan();

    $plan_id = $data['id'];
    $description = $data['description'];

    if ($workoutPlan->editWorkoutPlan($plan_id, $description)) {
        logMessage("Workout plan updated: $plan_id");
        echo json_encode(["message" => "Workout plan updated successfully"]);
    } else {
        logMessage("Failed to update workout plan: $plan_id");
        echo json_encode(["error" => "Workout plan update failed"]);
    }
}
