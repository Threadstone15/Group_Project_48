<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class PlanRequest
{
    private $conn;
    private $table = "plan_requests";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("WorkoutPlan model initialized with database connection.");
    }

    public function insertRequestWorkout($user_id, $trainer_id, $message)
    {
        logMessage("Inserting workout plan request for user_id: $user_id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "INSERT INTO {$this->table} (user_id, trainer_id, workout_plan, message) VALUES (?, ?, 1, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing insert statement: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("iss", $user_id, $trainer_id, $message)) {
            logMessage("Error binding parameters for insert: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Workout plan request inserted successfully for user_id: $user_id");
            return true;
        } else {
            logMessage("Insert execution failed for user_id: $user_id. Error: " . $stmt->error);
            return false;
        }
    }

    public function insertRequestMeal($user_id, $trainer_id, $message)
    {
        logMessage("Inserting meal plan request for user_id: $user_id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "INSERT INTO {$this->table} (user_id, trainer_id, workout_plan, message) VALUES (?, ?, 0, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing insert statement: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("iss", $user_id, $trainer_id, $message)) {
            logMessage("Error binding parameters for insert: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Meal plan request inserted successfully for user_id: $user_id");
            return true;
        } else {
            logMessage("Insert execution failed for user_id: $user_id. Error: " . $stmt->error);
            return false;
        }
    }
}
