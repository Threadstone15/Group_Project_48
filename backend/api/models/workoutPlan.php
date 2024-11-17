<?php

include_once "../../logs/save.php"; 
require_once "../../config/database.php"; 

class WorkoutPlan {
    private $conn;
    private $table = "workout_plan";

    public function __construct() {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("WorkoutPlan model initialized with database connection.");
    }

    public function addWorkoutPlan($trainer_id, $name, $description) {
        logMessage("Adding new workout plan...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // Prepare the insert query
        $query = "INSERT INTO " . $this->table . " (trainer_id, name, description) 
                  VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for workout plan insertion: " . $this->conn->error);
            return false;
        }

        // Bind the parameters for trainer_id, name, and description
        if (!$stmt->bind_param("sss", $trainer_id, $name, $description)) {
            logMessage("Error binding parameters for workout plan insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding workout plan: $name");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Workout plan added successfully: $name");
            return true;
        } else {
            logMessage("Workout plan insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getWorkoutPlans() {
        logMessage("Fetching workout plans...");

        // Query to get all workout plans
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching all workout plans: " . $this->conn->error);
            return false;
        }

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                $workoutPlans = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Workout plans fetched successfully");
                return $workoutPlans;
            } else {
                logMessage("No workout plans found");
                return [];
            }
        } else {
            logMessage("Error fetching workout plans: " . $stmt->error);
            return false;
        }
    }

    public function updateWorkoutPlan($workout_plan_id, $trainer_id, $name, $description) {
        logMessage("Updating workout plan with ID: $workout_plan_id");

        $query = "UPDATE " . $this->table . " 
                  SET trainer_id = ?, name = ?, description = ? 
                  WHERE workout_plan_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating workout plan: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("sssi", $trainer_id, $name, $description, $workout_plan_id)) {
            logMessage("Error binding parameters for updating workout plan: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating workout plan ID: $workout_plan_id");

        if ($stmt->execute()) {
            logMessage("Workout plan updated successfully for ID: $workout_plan_id");
            return true;
        } else {
            logMessage("Error updating workout plan: " . $stmt->error);
            return false;
        }
    }

    public function deleteWorkoutPlan($workout_plan_id) {
        logMessage("Deleting workout plan with ID: $workout_plan_id");

        $query = "DELETE FROM " . $this->table . " WHERE workout_plan_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting workout plan: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("i", $workout_plan_id);
        logMessage("Query bound for deleting workout plan ID: $workout_plan_id");

        if ($stmt->execute()) {
            logMessage("Workout plan deleted successfully with ID: $workout_plan_id");
            return true;
        } else {
            logMessage("Error deleting workout plan: " . $stmt->error);
            return false;
        }
    }
}
?>
