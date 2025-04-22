<?php
// mealPlanHandler.php

include_once "../models/mealPlan.php";
include_once "../../logs/save.php";

function addMealPlan() {  // Changed from addWorkoutPlan to addMealPlan
    logMessage("add mealPlan function running...");

    $mealPlan = new mealPlan();

    // Validate required fields
    if (!isset($_POST['user_id']) || !isset($_POST['day_number']) || !isset($_POST['meal_type']) || 
        !isset($_POST['meal_name']) || !isset($_POST['ingredients']) || !isset($_POST['quantities'])) {
        logMessage("Missing required fields in addMealPlan");
        echo json_encode(["error" => "Missing required fields"]);
        return;
    }

    $user_id = filter_var($_POST['user_id'], FILTER_SANITIZE_STRING);
    $day_number = filter_var($_POST['day_number'], FILTER_SANITIZE_NUMBER_INT); // Changed to NUMBER_INT
    $meal_type = filter_var($_POST['meal_type'], FILTER_SANITIZE_STRING);
    $meal_name = filter_var($_POST['meal_name'], FILTER_SANITIZE_STRING);
    $ingredients = filter_var($_POST['ingredients'], FILTER_SANITIZE_STRING);
    $quantities = $_POST['quantities'];

    // Fixed $$user_id to $user_id (was a typo)
    if ($mealPlan->addMealPlan($user_id, $day_number, $meal_type, $meal_name, $ingredients, $quantities)) {
        logMessage("meal plan added: $meal_name");
        echo json_encode(["message" => "meal plan added successfully"]);
    } else {
        logMessage("Failed to add meal plan: $meal_name");
        echo json_encode(["error" => "meal plan addition failed"]);
    }
}

function getMealPlan() {  // Changed from getmealPlan to getMealPlan (consistent naming)
    logMessage("get meal plans function running...");
    $mealPlan = new mealPlan();

    $result = $mealPlan->getMealPlan();  // Changed to match likely model method name

    if ($result) {
        logMessage("meal plans data fetched");
        echo json_encode($result);
    } else {
        logMessage("No meal plans found");
        echo json_encode(["error" => "No meal plans found"]);
    }
}

function updateMealPlan() {  // Changed from updatemealPlan to updateMealPlan
    logMessage("update meal plan function running...");

    $mealPlan = new mealPlan();
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['mealPlan_id']) &&
        isset($data['user_id']) &&
        isset($data['day_number']) &&
        isset($data['meal_type']) &&
        isset($data['meal_name']) &&
        isset($data['ingredients']) &&
        isset($data['quantities'])
    ) {
        $mealPlan_id = intval($data['mealPlan_id']);
        $user_id = intval($data['user_id']);
        $day_number = intval($data['day_number']);
        $meal_type = filter_var($data['meal_type'], FILTER_SANITIZE_STRING);
        $meal_name = filter_var($data['meal_name'], FILTER_SANITIZE_STRING);
        $ingredients = filter_var($data['ingredients'], FILTER_SANITIZE_STRING);
        $quantities = $data['quantities'];

        if ($mealPlan->updateMealPlan($mealPlan_id, $user_id, $day_number, $meal_type, $meal_name, $ingredients, $quantities)) {
            logMessage("meal plan updated successfully: ID $mealPlan_id");
            echo json_encode(["message" => "meal plan updated successfully"]);
        } else {
            logMessage("Failed to update meal plan: ID $mealPlan_id");
            echo json_encode(["error" => "meal plan update failed"]);
        }
    } else {
        logMessage("Invalid input for meal plan update");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

function deleteMealPlan() {  // Changed from deletemealPlan to deleteMealPlan
    logMessage("delete meal plan function running...");

    $mealPlan = new mealPlan();
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['mealPlan_id'])) {
        $mealPlan_id = intval($input['mealPlan_id']);

        // Fixed $mealPlan_id->deleteWorkoutPlan to $mealPlan->deleteMealPlan
        if ($mealPlan->deleteMealPlan($mealPlan_id)) {
            logMessage("meal plan deleted: $mealPlan_id");
            echo json_encode(["message" => "meal plan deleted successfully"]);
        } else {
            logMessage("Failed to delete meal plan: $mealPlan_id");
            echo json_encode(["error" => "meal plan deletion failed"]);
        }
    } else {
        logMessage("Invalid input for meal plan deletion");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

// Add routing logic to call the appropriate function
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'add':
        addMealPlan();
        break;
    case 'get':
        getMealPlan();
        break;
    case 'update':
        updateMealPlan();
        break;
    case 'delete':
        deleteMealPlan();
        break;
    default:
        echo json_encode(["error" => "Invalid action"]);
        break;
}
?>