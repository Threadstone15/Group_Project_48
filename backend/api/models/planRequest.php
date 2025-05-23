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

    public function acceptRequestWorkout($request_id, $description)
    {
        logMessage("Accepting request with request_id: $request_id and description: $description");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $reason = null;

        $query = "CALL HandleWorkoutRequestAction('accept', ?, ?, ?)";
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

    public function acceptRequestMeal($request_id, $description)
    {
        logMessage("Accepting meal request with request_id: $request_id and description: $description");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $reason = null;

        $query = "CALL HandleMealRequestAction(?, 'accept', ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing acceptRequestMeal statement: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("iss", $request_id, $description, $reason)) {
            logMessage("Error binding parameters in acceptRequestMeal: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Successfully accepted meal request with id: $request_id");
            return true;
        } else {
            logMessage("Execution failed for acceptRequestMeal. Error: " . $stmt->error);
            return false;
        }
    }

    public function createdTrainerWorkoutPlans($trainer_id)
    {
        logMessage("Fetching workout plans created by trainer_id: $trainer_id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "CALL GetTrainerCreatedWorkoutPlans(?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing GetTrainerCreatedWorkoutPlans call: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("s", $trainer_id)) {
            logMessage("Error binding parameter for GetTrainerCreatedWorkoutPlans: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $plans = [];

            while ($row = $result->fetch_assoc()) {
                $plans[] = $row;
            }

            logMessage("Workout plans fetched successfully for trainer_id: $trainer_id");
            return $plans;
        } else {
            logMessage("Execution failed for GetTrainerCreatedWorkoutPlans: " . $stmt->error);
            return false;
        }
    }

    public function createdTrainerMealPlans($trainer_id)
    {
        logMessage("Fetching meal plans created by trainer_id: $trainer_id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "CALL GetTrainerCreatedMealPlans(?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing GetTrainerCreatedMealPlans call: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("s", $trainer_id)) {
            logMessage("Error binding parameter for GetTrainerCreatedMealPlans: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $plans = [];

            while ($row = $result->fetch_assoc()) {
                $plans[] = $row;
            }

            logMessage("Meal plans fetched successfully for trainer_id: $trainer_id");
            return $plans;
        } else {
            logMessage("Execution failed for GetTrainerCreatedMealPlans: " . $stmt->error);
            return false;
        }
    }

    public function updateWorkoutPlanDescription($id, $description)
    {
        logMessage("Updating workout plan description for id: $id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "UPDATE workout_plans SET description = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing update query: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("si", $description, $id)) {
            logMessage("Error binding parameters: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Workout plan updated successfully for id: $id");
            return true;
        } else {
            logMessage("Error executing update: " . $stmt->error);
            return false;
        }
    }

    public function updateMealPlanDescription($id, $description)
    {
        logMessage("Updating meal plan description for id: $id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "UPDATE meal_plans SET description = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing update query: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("si", $description, $id)) {
            logMessage("Error binding parameters: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Meal plan updated successfully for id: $id");
            return true;
        } else {
            logMessage("Error executing update: " . $stmt->error);
            return false;
        }
    }

    public function deleteWorkoutPlan($id)
    {
        logMessage("Deleting workout plan for id: $id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "DELETE FROM workout_plans WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing delete query: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("i", $id)) {
            logMessage("Error binding parameters: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Workout plan deleted successfully for id: $id");
            return true;
        } else {
            logMessage("Error executing delete: " . $stmt->error);
            return false;
        }
    }

    public function deleteMealPlan($id)
    {
        logMessage("Deleting meal plan for id: $id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "DELETE FROM meal_plans WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing delete query: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("i", $id)) {
            logMessage("Error binding parameters: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Meal plan deleted successfully for id: $id");
            return true;
        } else {
            logMessage("Error executing delete: " . $stmt->error);
            return false;
        }
    }

    public function trackWorkoutPlan($user_id, $plan_id)
    {
        logMessage("Tracking workout plan for user_id: $user_id and plan_id: $plan_id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        try {
            $stmt = $this->conn->prepare("CALL select_workout_for_user(?, ?)");
            $stmt->bind_param("ii", $plan_id, $user_id);

            if ($stmt->execute()) {
                logMessage("Workout plan tracked successfully.");
                return true;
            } else {
                logMessage("Failed to execute procedure: " . $stmt->error);
                return false;
            }
        } catch (Exception $e) {
            logMessage("Exception occurred while tracking workout plan: " . $e->getMessage());
            return false;
        }
    }

    public function stopTrackingPlan($user_id)
    {
        logMessage("Stopping tracking of workout plan for user_id: $user_id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        try {
            // Prepare the delete query to remove the row where the user_id matches
            $query = "DELETE FROM selected_workout WHERE user_id = ?";
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing the delete statement: " . $this->conn->error);
                return false;
            }

            // Bind the user_id parameter to the query
            $stmt->bind_param("i", $user_id);

            // Execute the query
            if ($stmt->execute()) {
                logMessage("Successfully stopped tracking workout plan for user_id: $user_id");
                return true;
            } else {
                logMessage("Failed to delete the workout plan for user_id: $user_id: " . $stmt->error);
                return false;
            }
        } catch (Exception $e) {
            logMessage("Exception occurred while stopping tracking workout plan for user_id: $user_id: " . $e->getMessage());
            return false;
        }
    }


    public function getSelectedWorkoutPlanId($user_id)
    {
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        try {
            $stmt = $this->conn->prepare("SELECT workout_plan_id FROM selected_workout WHERE user_id = ?");
            $stmt->bind_param("i", $user_id);

            if ($stmt->execute()) {
                $result = $stmt->get_result();

                if ($row = $result->fetch_assoc()) {
                    return $row['workout_plan_id'];
                } else {
                    logMessage("No workout plan found for user_id: $user_id");
                    return null;
                }
            } else {
                logMessage("Failed to execute query: " . $stmt->error);
                return false;
            }
        } catch (Exception $e) {
            logMessage("Exception occurred while fetching workout_plan_id: " . $e->getMessage());
            return false;
        }
    }
}
