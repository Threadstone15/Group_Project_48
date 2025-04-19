<?php
// api/models/Notice.php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class Notice
{
    private $conn;
    private $table = "notice";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Notice model initialized with database connection.");
    }

    public function addNotice($publisher_id, $title, $description, $duration)
    {
        logMessage("Adding new notice...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "INSERT INTO " . $this->table . " (publisher_id, title, description, duration) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for notice insertion: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("issi", $publisher_id, $title, $description, $duration)) {
            logMessage("Error binding parameters for notice insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding notice: $title");

        if ($stmt->execute()) {
            logMessage("Notice added successfully: $title");
            return true;
        } else {
            logMessage("Notice insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getNotices()
    {
        logMessage("Fetching notices...");

        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching notice: " . $this->conn->error);
            return false;
        }

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

    public function updateNotice($notice_id, $publisher_id, $title, $description, $duration)
    {
        logMessage("Updating notice with ID: $notice_id");

        $query = "UPDATE " . $this->table . " SET publisher_id = ?,title = ?, description = ?, duration = ? WHERE notice_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating notice: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("issii", $publisher_id, $title, $description, $duration, $notice_id)) {
            logMessage("Error binding parameters for updating notice: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating notice: $notice_id");

        if ($stmt->execute()) {
            logMessage("Notice updated successfully for ID: $notice_id");
            return true;
        } else {
            logMessage("Notice update failed: " . $stmt->error);
            return false;
        }
    }

    public function deleteNotice($notice_id)
    {
        logMessage("Deleting notice with ID: $notice_id");

        $query = "DELETE FROM " . $this->table . " WHERE notice_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting notice: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("i", $notice_id)) {
            logMessage("Error binding parameters for deleting notice: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for deleting notice: $notice_id");

        if ($stmt->execute()) {
            logMessage("Notice deleted successfully for ID: $notice_id");
            return true;
        } else {
            logMessage("Notice deletion failed: " . $stmt->error);
            return false;
        }
    }
}
