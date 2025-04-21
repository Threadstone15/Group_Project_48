<?php
include_once "../../logs/save.php";
require_once "../../config/database.php";

class mealPlan {
    private $conn;
    private $table = "meal_plan";   
}

public function __construct() {
    $this->conn = DatabaseConnection::getInstance()->getConnection();
    logMessage("MealPlan model initialized with database connection.");
}   

public function addMealPlan($user_id, $day_number, $meal_type, $meal_name, $ingredients, $quantities) {
    logMessage("Adding new meal plan...");
    if (!$this->conn) {
        logMessage("Database connection is not valid.");
        return false;
    }

    // Prepare the insert query
    $query = "INSERT INTO " . $this->table . " (user_id, day_number,meal_type,meal_name,ingredients,quantities)
    VALUES (?, ?, ? , ?, ?, ?)";
    $stmt = $this->conn->prepare($query);

    if($stmt === false) {
        logMessage("Error preparing statement for meal plan insertion: " . $this->conn->error);
        return false;
    }

    // Bind the parameters for trainer_id, name, and description
    if(!$stmt->bind_param("ssssss", $user_id, $day_number, $meal_type, $meal_name, $ingredients, $quantities) {
        logMessage("Error binding parameters for meal plan insertion: " . $stmt->error);
        return false;
    }
    logMessage("Query bound for adding meal plan: $name");

    //Execute the query

    if ($stmt->execute()) {
        logMessage("Meal plan added successfully: $name");
        return true;
    } else {
        logMessage("Meal plan insertion failed: " .$stmt->error);
        return false;
    }
}