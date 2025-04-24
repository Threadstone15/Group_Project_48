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

    public function getCurrentWorkoutPlanIdOfMember($user_id)
    {
        logMessage("Fetching current workout plan ID for user_id: $user_id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "SELECT id FROM " . $this->table . " WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching current workout plan ID: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("i", $user_id)) {
            logMessage("Error binding parameter for fetching current workout plan ID: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                logMessage("Current workout plan ID fetched successfully for user_id: $user_id");
                return $row['id'];
            } else {
                logMessage("No active workout plan found for user_id: $user_id");
                return null;
            }
        } else {
            logMessage("Fetching current workout plan ID failed: " . $stmt->error);
            return false;
        }
    }
}
