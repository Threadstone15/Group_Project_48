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

    public function getRequests($user_id)
    {
        logMessage("Fetching requests for trainer with user_id: $user_id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "CALL GetRequestsByTrainerUserID(?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing getRequests statement: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("i", $user_id)) {
            logMessage("Error binding parameters in getRequests: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();

            if ($result === false) {
                logMessage("Error getting result set from getRequests: " . $stmt->error);
                return false;
            }

            $requests = $result->fetch_all(MYSQLI_ASSOC);
            logMessage("Successfully fetched requests for trainer user_id: $user_id");
            return $requests;
        } else {
            logMessage("Execution failed for getRequests. Error: " . $stmt->error);
            return false;
        }
    }

    public function rejectRequest($request_id, $reason)
    {
        logMessage("Rejecting request with request_id: $request_id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "CALL HandleRequestAction('delete', ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing rejectRequest statement: " . $this->conn->error);
            return false;
        }

        $description = null; // define a null variable explicitly

        if (!$stmt->bind_param("iss", $request_id, $reason, $description)) {
            logMessage("Error binding parameters in rejectRequest: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Successfully rejected request with id: $request_id");
            return true;
        } else {
            logMessage("Execution failed for rejectRequest. Error: " . $stmt->error);
            return false;
        }
    }

    public function acceptRequest($request_id, $description)
    {
        logMessage("Accepting request with request_id: $request_id and description: $description");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $reason = null;

        $query = "CALL HandleRequestAction('accept', ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing acceptRequest statement: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("iss", $request_id, $reason, $description)) {
            logMessage("Error binding parameters in acceptRequest: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Successfully accepted request with id: $request_id");
            return true;
        } else {
            logMessage("Execution failed for acceptRequest. Error: " . $stmt->error);
            return false;
        }
    }
}
