<?php
// api/models/Notification.php

include_once "../../logs/save.php"; // Assuming logMessage is defined here

class Notification {
    private $conn;
    private $table = "notifications";

    public function __construct() {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Notification model initialized");
    }

    // Create Notification
    public function addNotification($user_id, $message, $status = 'unread') {
        logMessage("Adding new notification...");

        // Prepare the query
        $query = "INSERT INTO " . $this->table . " (user_id, message, date_sent, status) VALUES (?, ?, NOW(), ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for notification insertion: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        $stmt->bind_param("iss", $user_id, $message, $status);
        logMessage("Query bound for adding notification for user: $user_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Notification added successfully for user: $user_id");
            return true;
        } else {
            logMessage("Notification insertion failed: " . $stmt->error);
            return false;
        }
    }

    // Read Notifications
    public function getNotifications($notification_id = null, $user_id = null) {
        logMessage("Fetching notifications...");

        if ($notification_id) {
            // Fetch specific notification
            $query = "SELECT * FROM " . $this->table . " WHERE notification_id = ?";
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching notification: " . $this->conn->error);
                return false;
            }

            $stmt->bind_param("i", $notification_id);
        } elseif ($user_id) {
            // Fetch notifications for specific user
            $query = "SELECT * FROM " . $this->table . " WHERE user_id = ? ORDER BY date_sent DESC";
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching user notifications: " . $this->conn->error);
                return false;
            }

            $stmt->bind_param("i", $user_id);
        } else {
            // Fetch all notifications
            $query = "SELECT * FROM " . $this->table . " ORDER BY date_sent DESC";
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching all notifications: " . $this->conn->error);
                return false;
            }
        }

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $notifications = $result->fetch_all(MYSQLI_ASSOC);
            logMessage("Notifications fetched successfully");
            return $notifications;
        } else {
            logMessage("Error fetching notifications: " . $stmt->error);
            return false;
        }
    }

    // Update Notification Status
    public function updateNotification($notification_id, $user_id, $message, $date_sent,$status) {
        logMessage("Updating notification plan with ID: $notification_id");

        // Prepare the query
        $query = "UPDATE " . $this->table . " SET user_id = ?,message =?,date_sent = ?,status = ? WHERE notification_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating notification: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        if(!$stmt->bind_param("si", $user_id, $message, $date_sent,$status, $notification_id)) {
        logMessage("Query bound for updating notification: . $stmt->error");
        return false;
        }
        logMessage("Query bound for updating notification ID: $notification_id");
        // Execute the query
        if ($stmt->execute()) {
            logMessage("Notification status updated successfully: $notification_id");
            return true;
        } else {
            logMessage("Notification status update failed: " . $stmt->error);
            return false;
        }
    }

    // Delete Notification
    public function deleteNotification($notification_id) {
        logMessage("Deleting notification...");

        // Prepare the query
        $query = "DELETE FROM " . $this->table . " WHERE notification_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting notification: " . $this->conn->error);
            return false;
        }

        // Bind parameter
        $stmt->bind_param("i", $notification_id);
        logMessage("Query bound for deleting notification: $notification_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Notification deleted successfully: $notification_id");
            return true;
        } else {
            logMessage("Notification deletion failed: " . $stmt->error);
            return false;
        }
    }

    // Mark All User Notifications as Read
    public function markAllAsRead($user_id) {
        logMessage("Marking all notifications as read for user: $user_id");

        // Prepare the query
        $query = "UPDATE " . $this->table . " SET status = 'read' WHERE user_id = ? AND status = 'unread'";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for marking notifications as read: " . $this->conn->error);
            return false;
        }

        // Bind parameter
        $stmt->bind_param("i", $user_id);

        // Execute the query
        if ($stmt->execute()) {
            logMessage("All notifications marked as read for user: $user_id");
            return true;
        } else {
            logMessage("Failed to mark notifications as read: " . $stmt->error);
            return false;
        }
    }
}
?>