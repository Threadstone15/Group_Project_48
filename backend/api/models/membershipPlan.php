<?php

include_once "../../logs/save.php"; 
require_once "../../config/database.php"; 

class MembershipPlan {
    private $conn;
    private $table = "membership_plan";

    public function __construct() {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Membership plan model initialized with database connection.");
    }

    private function generatePlanID() {
        // Use SUBSTRING to extract the numeric part and ORDER BY it as an integer
        $query = "SELECT membership_plan_id 
                  FROM " . $this->table . " 
                  ORDER BY CAST(SUBSTRING(membership_plan_id, 3) AS UNSIGNED) DESC 
                  LIMIT 1";
        $result = $this->conn->query($query);
    
        if ($result && $row = $result->fetch_assoc()) {
            // Extract the numeric part of the last ID and increment it
            $lastID = (int)substr($row['membership_plan_id'], 2); // Remove 'MP' and convert to integer
            $newID = $lastID + 1;
            return 'MP' . $newID; // Format as MPX where X is the incremented value
        } else {
            // If no records exist, start from 1
            logMessage("No existing membership plans found, starting ID from MP1.");
            return 'MP1';
        }
    }
    
    public function addMembershipPlan($name, $benefits, $monthlyPrice, $yearlyPrice, $basePlanID) {
        logMessage("Adding new membership plan...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // generate membershipPlan_id
        $membership_plan_id = $this->generatePlanID();
        if (!$membership_plan_id) {
            logMessage("Membership plan ID generation failed");
            return false;
        }

        $query = "INSERT INTO " . $this->table . " (membership_plan_id, plan_name, benefits, monthlyPrice, yearlyPrice, base_plan_id, status)
                  VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for membership plan insertion: " . $this->conn->error);
            return false;
        }

        $status = "active"; // Default status for new plans
        if (!$stmt->bind_param("sssddss",$membership_plan_id, $name,$benefits, $monthlyPrice, $yearlyPrice, $basePlanID, $status)) {    
            logMessage("Error binding parameters for membership plan insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding membership plan : $name");

        if ($stmt->execute()) {
            logMessage("Memberhsip plan added successfully: $name");
            return true;
        } else {
            logMessage("membership plan insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getMembershipPlans() {
        logMessage("Fetching membership plan...");

            $query = "SELECT * FROM " . $this->table;
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching all membership plans: " . $this->conn->error);
                return false;
            }    

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                $membershipPlans = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Membership Plans fetched successfully");
                return $membershipPlans;
            } else {
                logMessage("No membership plans found");
                return [];
            }
        } else {
            logMessage("Error fetching membership plans: " . $stmt->error);
            return false;
        }
    }

    public function updateMembershipPlan($membership_plan_id, $name, $benefits, $monthlyPrice, $yearlyPrice, $basePlanID) {
        logMessage("Updating membership plan with ID: $membership_plan_id");

        $query = "UPDATE " . $this->table . " 
                  SET plan_name = ?, benefits = ?, monthlyPrice = ?, yearlyPrice = ? , base_plan_id = ?
                  WHERE membership_plan_id = ?";
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            logMessage("Error preparing statement for updating membership plan: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("ssddss", $name, $benefits, $monthlyPrice, $yearlyPrice, $basePlanID, $membership_plan_id)) {
            logMessage("Error binding parameters for updating membership plan: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating membership plan ID: $membership_plan_id");

        if ($stmt->execute()) {
            logMessage("Membership plan updated successfully for ID: $membership_plan_id");
            return true;
        } else {
            logMessage("Error updating membership plan: " . $stmt->error);
            return false;
        }
    }

    public function updateMembershipPlanStatus($membership_plan_id, $status){
        $query = "UPDATE " . $this->table . " SET status = ? WHERE membership_plan_id = ?";
        $stmt = $this->conn->prepare($query);   
        if($stmt === false) {
            logMessage("Error preparing statement for updating membership plan status: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param("ss", $status, $membership_plan_id);
        logMessage("Query bound for updating membership plan status ID: $membership_plan_id");
        if($stmt->execute()){
            logMessage("Membership plan status updated successfully for ID: $membership_plan_id");
            return true;
        }else{
            logMessage("Error updating membership plan status: " . $stmt->error);
            return false;
        }
    }
    

    public function deleteMembershipPlan($membership_plan_id) {
        logMessage("Deleting membership plan with ID: $membership_plan_id");

        $query = "DELETE FROM " . $this->table . " WHERE membership_plan_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting membership plan: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("s", $membership_plan_id);
        logMessage("Query bound for deleting membership ID: $membership_plan_id");

        if ($stmt->execute()) {
            logMessage("Membership plan deleted successfully with ID: $membership_plan_id");
            return true;
        } else {
            logMessage("Error deleting membership plan: " . $stmt->error);
            return false;
        }
    }

    public function getBasePlanIdFromMembershipPlanId($membership_plan_id){
        if(!$this->conn){
            logMessage("Database connection is not established.");
            return false;
        }
        $query = "SELECT base_plan_id FROM " . $this->table . " WHERE membership_plan_id = ?";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for retrieving base plan ID: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param("s", $membership_plan_id);
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_assoc()['base_plan_id'];
        }else{
            logMessage("Error retrieving base plan ID: " . $stmt->error);
            return false;
        }
    }

    public function checkIfPlanNameExists($plan_name){
        if(!$this->conn){
            logMessage("Database connection is not established.");
            return false;
        }
        $query = "SELECT membership_plan_id FROM " . $this->table . " WHERE plan_name = ? AND status = 'active' ";
        $stmt = $this->conn->prepare($query);
        if($stmt === false) {
            logMessage("Error preparing statement for checking plan name: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param("s", $plan_name);
        if($stmt->execute()){
            $result = $stmt->get_result();
            if($result->num_rows > 0){
                logMessage("Plan name already exists: $plan_name");
                return true;
            }else{
                logMessage("Plan name does not exist: $plan_name");
                return false;
            }
        }else{
            logMessage("Error checking plan name: " . $stmt->error);
            return false;
        }
    }
}
?>
