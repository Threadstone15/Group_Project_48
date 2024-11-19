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
    
    


    public function addMembershipPlan($name, $benefits, $monthlyPrice, $yearlyPrice) {
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

        $query = "INSERT INTO " . $this->table . " (membership_plan_id, plan_name, benefits, monthlyPrice, yearlyPrice)
                  VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for membership plan insertion: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("sssdd",$membership_plan_id, $name,$benefits, $monthlyPrice, $yearlyPrice)) {
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

    public function updateMembershipPlan($membership_plan_id, $name, $benefits, $monthlyPrice, $yearlyPrice) {
        logMessage("Updating membership plan with ID: $membership_plan_id");

        $query = "UPDATE " . $this->table . " 
                  SET plan_name = ?, benefits = ?, monthlyPrice = ?, yearlyPrice = ? 
                  WHERE membership_plan_id = ?";
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            logMessage("Error preparing statement for updating membership plan: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("ssdds", $name, $benefits, $monthlyPrice, $yearlyPrice, $membership_plan_id)) {
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
}
?>
