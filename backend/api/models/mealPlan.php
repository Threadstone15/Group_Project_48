<?php
include_once "../../logs/save.php";
require_once "../../config/database.php";

class MealPlan {
    private $conn;
    private $table = "meal_plan";   

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
        $query = "INSERT INTO " . $this->table . " (user_id, day_number, meal_type, meal_name, ingredients, quantities)
        VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if($stmt === false) {
            logMessage("Error preparing statement for meal plan insertion: " . $this->conn->error);
            return false;
        }

        // Bind the parameters
        if(!$stmt->bind_param("iissss", $user_id, $day_number, $meal_type, $meal_name, $ingredients, $quantities)) {
            logMessage("Error binding parameters for meal plan insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding meal plan: $meal_name");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Meal plan added successfully: $meal_name");
            return true;
        } else {
            logMessage("Meal plan insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getMealPlan() {
        logMessage("Fetching meal plans...");

        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching all meal plans: " . $this->conn->error);
            return false;
        }    

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                $mealPlans = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Meal plans fetched successfully");
                return $mealPlans;
            } else {
                logMessage("No meal plans found");
                return [];
            }
        } else {
            logMessage("Error fetching meal plans: " . $stmt->error);
            return false;
        }
    }

    public function updateMealPlan($mealPlan_id, $user_id, $day_number, $meal_type, $meal_name, $ingredients, $quantities) {
        logMessage("Updating meal plan with ID: $mealPlan_id");

        $query = "UPDATE " . $this->table . " 
                  SET user_id = ?, day_number = ?, meal_type = ?, meal_name = ?, ingredients = ?, quantities = ?
                  WHERE mealPlan_id = ?";
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            logMessage("Error preparing statement for updating meal plan: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("iissssi", $user_id, $day_number, $meal_type, $meal_name, $ingredients, $quantities, $mealPlan_id)) {
            logMessage("Error binding parameters for updating meal plan: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating meal plan ID: $mealPlan_id");

        if ($stmt->execute()) {
            logMessage("Meal plan updated successfully for ID: $mealPlan_id");
            return true;
        } else {
            logMessage("Error updating meal plan: " . $stmt->error);
            return false;
        }
    }
    
    public function deleteMealPlan($mealPlan_id) {
        logMessage("Deleting meal plan with ID: $mealPlan_id");

        $query = "DELETE FROM " . $this->table . " WHERE mealPlan_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting meal plan: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("i", $mealPlan_id)) {
            logMessage("Error binding parameters for deleting meal plan: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for deleting meal plan ID: $mealPlan_id");

        if ($stmt->execute()) {
            logMessage("Meal plan deleted successfully with ID: $mealPlan_id");
            return true;
        } else {
            logMessage("Error deleting meal plan: " . $stmt->error);
            return false;
        }
    }
}
?>