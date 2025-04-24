<?php
// noticeHandler.php

include_once "../models/planRequest.php";
include_once "../../logs/save.php";


function requestWorkoutPlan($user_id, $data)
{
    logMessage("Running requestWorkoutPlan....in controller data: " . json_encode($data));
    if (
        isset($data['trainer_id']) &&
        isset($data['message'])
    ) {
        logMessage("Running requestWorkoutPlan....in controller data: " . json_encode($data));
        $trainer_id = trim($data['trainer_id']);
        $message = trim($data['message']);

        // Initialize the model and insert the request
        $planRequest = new planRequest();
        $result = $planRequest->insertRequestWorkout($user_id, $trainer_id, $message);

        if ($result) {
            http_response_code(200);
            echo json_encode(["message" => "Workout plan request submitted successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to submit the request."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields: user_id, trainer_id, or message."]);
    }
}
function requestMealPlan($user_id, $data)
{
    logMessage("Running requestWorkoutPlan....in controller data: " . json_encode($data));
    if (
        isset($data['trainer_id']) &&
        isset($data['message'])
    ) {
        logMessage("Running requestMealPlan....in controller data: " . json_encode($data));
        $trainer_id = trim($data['trainer_id']);
        $message = trim($data['message']);

        // Initialize the model and insert the request        
        $planRequest = new planRequest();
        $result = $planRequest->insertRequestMeal($user_id, $trainer_id, $message);

        if ($result) {
            http_response_code(200);
            echo json_encode(["message" => "Meal plan request submitted successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to submit the request."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields: user_id, trainer_id, or message."]);
    }
}

function getRequests($user_id)
{
    logMessage("Running getRequests....in controller user_id: " . $user_id);
    $planRequest = new planRequest();
    $requests = $planRequest->getRequests($user_id);

    if ($requests) {
        http_response_code(200);
        echo json_encode($requests);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "No requests found."]);
    }
}


function rejectRequest($data)
{
    $request_id = $data['request_id'];
    $reason = $data['reason'];

    logMessage("Running rejectRequest in controller for request_id: $request_id");

    $planRequest = new planRequest();
    $result = $planRequest->rejectRequest($request_id, $reason);

    if ($result) {
        echo json_encode([
            "status" => "success",
            "message" => "Request rejected successfully."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Failed to reject the request."
        ]);
    }
}

function createWorkoutPlanForMember($data)
{
    $request_id = $data['request_id'];
    $description = json_encode($data['workout_plan']);

    logMessage("Running createWorkoutPlanForMember in controller for request_id: $request_id and description: $description");

    $planRequest = new planRequest();
    $result = $planRequest->acceptRequestWorkout($request_id, $description);

    if ($result) {
        echo json_encode([
            "status" => "success",
            "message" => "Workout plan created successfully."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Failed to create the workout plan."
        ]);
    }
}

function createMealPlanForMember($data)
{
    $request_id = $data['request_id'];
    $description = json_encode($data['meal_plan']);

    logMessage("Running createMealPlanForMember in controller for request_id: $request_id and description: $description");

    $planRequest = new planRequest();
    $result = $planRequest->acceptRequestMeal($request_id, $description);

    if ($result) {
        echo json_encode([
            "status" => "success",
            "message" => "Meal plan created successfully."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Failed to create the meal plan."
        ]);
    }
}

function createdTrainerWorkoutPlans($user_id)
{
    logMessage("Running createdTrainerWorkoutPlans in controller for user_id: $user_id");

    $planRequest = new planRequest();
    $result = $planRequest->createdTrainerWorkoutPlans($user_id);

    if ($result) {
        http_response_code(200);
        echo json_encode($result);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "No requests found."]);
    }
}

function createdTrainerMealPlans($user_id)
{
    logMessage("Running createdTrainerMealPlans in controller for user_id: $user_id");

    $planRequest = new planRequest();
    $result = $planRequest->createdTrainerMealPlans($user_id);

    if ($result) {
        http_response_code(200);
        echo json_encode($result);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "No requests found."]);
    }
}

function editCreatedWorkoutPlans($data)
{
    $request_id = $data['id'];
    $description = $data['description'];

    logMessage("Running editCreatedWorkoutPlans in controller for request_id: $request_id and description: $description");

    $planRequest = new planRequest();
    $result = $planRequest->updateWorkoutPlanDescription($request_id, $description);

    if ($result) {
        echo json_encode([
            "status" => "success",
            "message" => "Workout plan updated successfully."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Failed to update the workout plan."
        ]);
    }
}

function deleteCreatedWorkoutPlans($plan_id)
{
    logMessage("Running deleteCreatedWorkoutPlans in controller for plan_id: $plan_id");

    $planRequest = new planRequest();
    $result = $planRequest->deleteWorkoutPlan($plan_id);

    if ($result) {
        echo json_encode([
            "status" => "success",
            "message" => "Workout plan deleted successfully."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete the workout plan."
        ]);
    }
}

function editCreatedMealPlans($data)
{
    $request_id = $data['id'];
    $description = $data['description'];

    logMessage("Running editCreatedMealPlans in controller for request_id: $request_id and description: $description");

    $planRequest = new planRequest();
    $result = $planRequest->updateMealPlanDescription($request_id, $description);

    if ($result) {
        echo json_encode([
            "status" => "success",
            "message" => "Meal plan updated successfully."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Failed to update the meal plan."
        ]);
    }
}

function deleteCreatedMealPlans($plan_id)
{
    logMessage("Running deleteCreatedMealPlans in controller for plan_id: $plan_id");

    $planRequest = new planRequest();
    $result = $planRequest->deleteMealPlan($plan_id);

    if ($result) {
        echo json_encode([
            "status" => "success",
            "message" => "Meal plan deleted successfully."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete the meal plan."
        ]);
    }
}
