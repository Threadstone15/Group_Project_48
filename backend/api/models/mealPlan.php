<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class MealPlan
{
    private $conn;
    private $table = "meal_plans";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("MealPlan model initialized with database connection.");
    }

    public function addMealPlan($user_id, $description)
    {
        logMessage("Adding new meal plan...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // Prepare the insert query
        $query = "INSERT INTO " . $this->table . " (user_id, description) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for meal plan insertion: " . $this->conn->error);
            return false;
        }

        // Bind the parameters for user_id and description
        if (!$stmt->bind_param("is", $user_id, $description)) {
            logMessage("Error binding parameters for meal plan insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding meal plan for user_id: $user_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Meal plan added successfully for user_id: $user_id");
            return true;
        } else {
            logMessage("Meal plan insertion failed: " . $stmt->error);
            return false;
        }
    }
}
