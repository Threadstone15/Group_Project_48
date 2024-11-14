<?php
// api/models/Notice.php

include_once "../../logs/save.php"; // Ensures logMessage is available
require_once "../../config/database.php"; // Include the DatabaseConnection class

class Notice {
    private $conn;
    private $table = "notice";

    public function __construct() {
        // Get the database connection instance
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Notice model initialized with database connection.");
    }

    // Create Notice
    public function addNotice($publisher_id, $title, $description) {
        logMessage("Adding new notice...");

        // Check if the connection is valid
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // Prepare the query
        $query = "INSERT INTO " . $this->table . " (publisher_id, title, description) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for notice insertion: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        if (!$stmt->bind_param("iss", $publisher_id, $title, $description)) {
            logMessage("Error binding parameters for notice insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding notice: $title");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Notice added successfully: $title");
            return true;
        } else {
            logMessage("Notice insertion failed: " . $stmt->error);
            return false;
        }
    }

    // Read Notices
    public function getNotices($notice_id = null) {
        logMessage("Fetching notices...");

        if ($notice_id) {
            // Fetch specific notice
            $query = "SELECT * FROM " . $this->table . " WHERE notice_id = ?";
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching notice: " . $this->conn->error);
                return false;
            }

            $stmt->bind_param("i", $notice_id);
        } else {
            // Fetch all notices
            $query = "SELECT * FROM " . $this->table;
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching all notices: " . $this->conn->error);
                return false;
            }
        }

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                $notices = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Notices fetched successfully");
                return $notices;
            } else {
                logMessage("No notices found");
                return [];
            }
        } else {
            logMessage("Error fetching notices: " . $stmt->error);
            return false;
        }
    }

    // Update Notice
    public function updateNotice($notice_id, $title, $description) {
        logMessage("Updating notice with ID: $notice_id");

        // Prepare the query
        $query = "UPDATE " . $this->table . " SET title = ?, description = ? WHERE notice_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating notice: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        if (!$stmt->bind_param("ssi", $title, $description, $notice_id)) {
            logMessage("Error binding parameters for updating notice: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating notice: $notice_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Notice updated successfully for ID: $notice_id");
            return true;
        } else {
            logMessage("Notice update failed: " . $stmt->error);
            return false;
        }
    }

    // Delete Notice
    public function deleteNotice($notice_id) {
        logMessage("Deleting notice with ID: $notice_id");

        // Prepare the query
        $query = "DELETE FROM " . $this->table . " WHERE notice_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting notice: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        if (!$stmt->bind_param("i", $notice_id)) {
            logMessage("Error binding parameters for deleting notice: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for deleting notice: $notice_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Notice deleted successfully for ID: $notice_id");
            return true;
        } else {
            logMessage("Notice deletion failed: " . $stmt->error);
            return false;
        }
    }
}
?>
