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
