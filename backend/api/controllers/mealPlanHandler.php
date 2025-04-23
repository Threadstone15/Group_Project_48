<?php
// workoutPlanHandler.php

include_once "../models/mealPlan.php";
include_once "../../logs/save.php";

function createMealPlan($user_id)
{


    logMessage("create meal plan function running...");


    $input = json_decode(file_get_contents("php://input"), true);

    $mealPlanData = $input['meal_plan'];
    $descriptionJson = json_encode($mealPlanData);

    logMessage("Meal plan data: " . $descriptionJson);

    $mealPlan = new MealPlan();
    $result = $mealPlan->addMealPlan($user_id, $descriptionJson);

    if ($result) {
        http_response_code(201);
        echo json_encode(["message" => "Workout plan created successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to create workout plan."]);
    }
}

function getMealPlans($user_id)
{
    logMessage("get meal plans function running...");
    $mealPlan = new MealPlan();

    $result = $mealPlan->getMealPlansByUserId($user_id);

    if ($result) {
        logMessage("Meal plans data fetched");
        echo json_encode($result);
    } else {
        logMessage("No meal plans found");
        echo json_encode(["error" => "No meal plans found"]);
    }
}
