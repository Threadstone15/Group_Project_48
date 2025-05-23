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

    public function getMealPlansByUserId($user_id)
    {
        logMessage("Fetching meal plans for user_id: $user_id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "CALL GetMealPlansByUserId(?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing stored procedure call: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("i", $user_id)) {
            logMessage("Error binding parameter for stored procedure call: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $plans = [];

            while ($row = $result->fetch_assoc()) {
                $plans[] = $row;
            }

            logMessage("Meal plans fetched successfully for user_id: $user_id");
            return $plans;
        } else {
            logMessage("Stored procedure execution failed: " . $stmt->error);
            return false;
        }
    }

    public function editMealPlan($plan_id, $description)
    {
        logMessage("Editing meal plan...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // Prepare the update query
        $query = "UPDATE " . $this->table . " SET description = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for meal plan update: " . $this->conn->error);
            return false;
        }

        // Bind the parameters for description and plan_id
        if (!$stmt->bind_param("si", $description, $plan_id)) {
            logMessage("Error binding parameters for meal plan update: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating meal plan with plan_id: $plan_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Meal plan updated successfully for plan_id: $plan_id");
            return true;
        } else {
            logMessage("Meal plan update failed: " . $stmt->error);
            return false;
        }
    }
}
