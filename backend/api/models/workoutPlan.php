<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class WorkoutPlan
{
    private $conn;
    private $table = "workout_plans";



    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("WorkoutPlan model initialized with database connection.");
    }

    public function addWorkoutPlan($user_id, $description)
    {
        logMessage("Adding new workout plan...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // Prepare the insert query
        $query = "INSERT INTO " . $this->table . " (user_id, description) 
              VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for workout plan insertion: " . $this->conn->error);
            return false;
        }

        // Bind the parameters for user_id and description
        if (!$stmt->bind_param("is", $user_id, $description)) {
            logMessage("Error binding parameters for workout plan insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding workout plan for user_id: $user_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Workout plan added successfully for user_id: $user_id");
            return true;
        } else {
            logMessage("Workout plan insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getWorkoutPlansByUserId($user_id)
    {
        logMessage("Fetching workout plans for user_id: $user_id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "CALL GetWorkoutPlansByUserId(?)";
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

            logMessage("Workout plans fetched successfully for user_id: $user_id");
            return $plans;
        } else {
            logMessage("Stored procedure execution failed: " . $stmt->error);
            return false;
        }
    }

    public function editWorkoutPlan($plan_id, $description)
    {
        logMessage("Editing workout plan...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // Prepare the update query
        $query = "UPDATE " . $this->table . " SET description = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for workout plan update: " . $this->conn->error);
            return false;
        }

        // Bind the parameters for description and plan_id
        if (!$stmt->bind_param("si", $description, $plan_id)) {
            logMessage("Error binding parameters for workout plan update: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating workout plan with plan_id: $plan_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Workout plan updated successfully for plan_id: $plan_id");
            return true;
        } else {
            logMessage("Workout plan update failed: " . $stmt->error);
            return false;
        }
    }
}
