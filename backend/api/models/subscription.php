<?php
// api/models/Subscription.php

include_once "../../logs/save.php"; // Assuming logMessage is defined here

class Subscription {
    private $conn;
    private $table = "subscription";

    public function __construct($db) {
        $this->conn = $db;
        logMessage("Subscription model initialized");
    }

    // Create Subscription
    public function addSubscription($member_id, $membership_plan_id, $start_date, $end_date, $payment_due_date, $status) {
        logMessage("Adding new subscription...");

        // Prepare the query
        $query = "INSERT INTO " . $this->table . " (member_id, membership_plan_id, start_date, end_date, payment_due_date, status) 
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for subscription insertion: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        $stmt->bind_param("ssssss", $member_id, $membership_plan_id, $start_date, $end_date, $payment_due_date, $status);
        logMessage("Query bound for adding subscription for member: $member_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Subscription added successfully for member: $member_id");
            return true;
        } else {
            logMessage("Subscription insertion failed: " . $stmt->error);
            return false;
        }
    }

    // Read Subscriptions
    public function getSubscriptions($subscription_id = null, $member_id = null) {
        logMessage("Fetching subscriptions...");

        if ($subscription_id) {
            // Fetch specific subscription
            $query = "SELECT * FROM " . $this->table . " WHERE subscription_id = ?";
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching subscription: " . $this->conn->error);
                return false;
            }

            $stmt->bind_param("s", $subscription_id);
        } elseif ($member_id) {
            // Fetch subscriptions for specific member
            $query = "SELECT * FROM " . $this->table . " WHERE member_id = ?";
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching member subscriptions: " . $this->conn->error);
                return false;
            }

            $stmt->bind_param("s", $member_id);
        } else {
            // Fetch all subscriptions
            $query = "SELECT * FROM " . $this->table;
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching all subscriptions: " . $this->conn->error);
                return false;
            }
        }

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $subscriptions = $result->fetch_all(MYSQLI_ASSOC);
            logMessage("Subscriptions fetched successfully");
            return $subscriptions;
        } else {
            logMessage("Error fetching subscriptions: " . $stmt->error);
            return false;
        }
    }

    // Update Subscription
    public function updateSubscription($subscription_id, $end_date, $payment_due_date, $status) {
        logMessage("Updating subscription...");

        // Prepare the query
        $query = "UPDATE " . $this->table . " 
                  SET end_date = ?, payment_due_date = ?, status = ? 
                  WHERE subscription_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating subscription: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        $stmt->bind_param("ssss", $end_date, $payment_due_date, $status, $subscription_id);
        logMessage("Query bound for updating subscription: $subscription_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Subscription updated successfully: $subscription_id");
            return true;
        } else {
            logMessage("Subscription update failed: " . $stmt->error);
            return false;
        }
    }

    // Delete Subscription
    public function deleteSubscription($subscription_id) {
        logMessage("Deleting subscription...");

        // Prepare the query
        $query = "DELETE FROM " . $this->table . " WHERE subscription_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting subscription: " . $this->conn->error);
            return false;
        }

        // Bind parameter
        $stmt->bind_param("s", $subscription_id);
        logMessage("Query bound for deleting subscription: $subscription_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Subscription deleted successfully: $subscription_id");
            return true;
        } else {
            logMessage("Subscription deletion failed: " . $stmt->error);
            return false;
        }
    }

    // Get Active Subscriptions
    public function getActiveSubscriptions() {
        logMessage("Fetching active subscriptions...");

        $query = "SELECT * FROM " . $this->table . " WHERE status = 'active' AND end_date >= CURDATE()";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching active subscriptions: " . $this->conn->error);
            return false;
        }

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $subscriptions = $result->fetch_all(MYSQLI_ASSOC);
            logMessage("Active subscriptions fetched successfully");
            return $subscriptions;
        } else {
            logMessage("Error fetching active subscriptions: " . $stmt->error);
            return false;
        }
    }

    // Get Expiring Subscriptions
    public function getExpiringSubscriptions($days = 7) {
        logMessage("Fetching expiring subscriptions...");

        $query = "SELECT * FROM " . $this->table . " 
                  WHERE status = 'active' 
                  AND end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching expiring subscriptions: " . $this->conn->error);
            return false;
        }

        // Bind parameter
        $stmt->bind_param("i", $days);

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $subscriptions = $result->fetch_all(MYSQLI_ASSOC);
            logMessage("Expiring subscriptions fetched successfully");
            return $subscriptions;
        } else {
            logMessage("Error fetching expiring subscriptions: " . $stmt->error);
            return false;
        }
    }
}
?>