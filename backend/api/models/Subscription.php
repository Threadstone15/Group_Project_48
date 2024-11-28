<?php

include_once "../../logs/save.php"; 
require_once "../../config/database.php"; 

class Subscription {
    private $conn;
    private $table = "subscription";

    public function __construct() {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Subscription model initialized with database connection.");
    }

    private function generateSubscriptionID() {
        // Use SUBSTRING to extract the numeric part and ORDER BY it as an integer
        $query = "SELECT subscription_id 
                  FROM " . $this->table . " 
                  ORDER BY CAST(SUBSTRING(subscription_id, 3) AS UNSIGNED) DESC 
                  LIMIT 1";
        $result = $this->conn->query($query);
    
        if ($result && $row = $result->fetch_assoc()) {
            // Extract the numeric part of the last ID and increment it
            $lastID = (int)substr($row['subscription_id'], 2); // Remove 'SP' and convert to integer
            $newID = $lastID + 1;
            return 'SP' . $newID; // Format as MPX where X is the incremented value
        } else {
            // If no records exist, start from 1
            logMessage("No existing subscriptions found, starting ID from SP1.");
            return 'SP1';
        }
    }
    

    public function addSubscription($member_id, $membership_plan_id, $startDate, $endDate, $paymentDue_date, $status, $period) {
        logMessage("Adding new subscription...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // generate subscription id_id
        $subscription_id = $this->generateSubscriptionID();
        if (!$subscription_id) {
            logMessage("Subscription ID generation failed");
            return false;
        }

        $query = "INSERT INTO " . $this->table . " (subscription_id, member_id, membership_plan_id, start_date, end_date, payment_due_date, status, period)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for subscriptoin insertion: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("ssssssss", $subscription_id, $member_id ,$membership_plan_id, $startDate, $endDate, $paymentDue_date, $status, $period)) {
            logMessage("Error binding parameters for subscription insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding subscription for : $member_id");

        if ($stmt->execute()) {
            logMessage("subscription added successfully for: $member_id");
            return true;
        } else {
            logMessage("subscription insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getSubscriptions() {
        logMessage("Fetching subscriptions...");

            $query = "SELECT * FROM " . $this->table;
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching all subscriptions: " . $this->conn->error);
                return false;
            }    

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                $subscriptions = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Subscriptions fetched successfully");
                return $subscriptions;
            } else {
                logMessage("No subscriptions found");
                return [];
            }
        } else {
            logMessage("Error fetching subscriptions: " . $stmt->error);
            return false;
        }
    }

    public function getSubscriptionOfAMember($member_id) {
        logMessage("Fetching subscription of a member: $member_id");
    
        // Prepare the query
        $query = "SELECT * FROM " . $this->table . " WHERE member_id = ?";
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            logMessage("Error preparing statement for getSubscriptionOfAMember: " . $this->conn->error);
            return false;
        }
    
        // Bind the email parameter
        $stmt->bind_param("s", $member_id);
    
        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_assoc();
        } else {
            logMessage("Error executing getSubscriptionOfAMember query: " . $stmt->error);
            return false;
        }
    }

    public function updateSubscription( $member_id, $membership_plan_id, $startDate, $endDate, $paymentDue_date, $status, $period) {
        logMessage("Updating subscription for member : $member_id");

        $query = "UPDATE " . $this->table . " 
                  SET membership_plan_id = ?, start_date = ?, end_date = ?, payment_due_date = ?, status = ? , period = ?
                  WHERE member_id = ?";
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            logMessage("Error preparing statement for updating subscription: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("sssssss", $membership_plan_id, $startDate, $endDate, $paymentDue_date, $status,$period, $member_id)) {
            logMessage("Error binding parameters for updating subscription: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating subscription for member: $member_id");

        if ($stmt->execute()) {
            logMessage("Subscription updated successfully for member ID: $member_id");
            return true;
        } else {
            logMessage("Error updating subscription: " . $stmt->error);
            return false;
        }
    }
    

    public function deleteSubscription($subscription_id) {
        logMessage("Deleting subscription with ID: $subscription_id");

        $query = "DELETE FROM " . $this->table . " WHERE subscription_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting subscription: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("s", $subscription_id);
        logMessage("Query bound for deleting subscription ID: $subscription_id");

        if ($stmt->execute()) {
            logMessage("Susbcription deleted successfully with ID: $subscription_id");
            return true;
        } else {
            logMessage("Error deleting subscription: " . $stmt->error);
            return false;
        }
    }

    public function getSubscriptionByMembershipPlanID($membership_plan_id) {
        logMessage("Fetching subscriptions of membership plan: $membership_plan_id");
    
        // Prepare the query
        $query = "SELECT * FROM " . $this->table . " WHERE membership_plan_id = ?";
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            logMessage("Error preparing statement for getSubscriptionByMembershipPlanID: " . $this->conn->error);
            return false;
        }
    
        // Bind the email parameter
        $stmt->bind_param("s", $membership_plan_id);
    
        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_assoc();
        } else {
            logMessage("Error executing getSubscriptionByMembershipPlanID query: " . $stmt->error);
            return false;
        }
    }
}
?>
