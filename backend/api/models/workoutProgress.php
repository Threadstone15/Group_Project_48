<?php
// models/TrainerCareer.php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class WorkoutProgress
{
    private $conn;
    private $table = "workout_progress_weekly";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("workout progress model initialized with database connection.");
    }

    public function insertWeeklyProgress($member_id, $workout_plan_id, $week_number, $weekly_progress)
    {
        logMessage("Inserting weekly progress...");
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $current_time = new DateTime('now', new DateTimeZone('Asia/Colombo'));
        $current_date = $current_time->format('Y-m-d');

        $weekly_progress_json = json_encode($weekly_progress); // Convert PHP array to JSON string

        $query = "INSERT INTO " . $this->table . " (member_id, workout_plan_id, week_number, weekly_progress , started_at)
        VALUES (?, ?, ?, ?, ?)"; 
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for inserting weekly progress: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param(
            "siiss",
            $member_id,
            $workout_plan_id,
            $week_number,
            $weekly_progress_json,
            $current_date,
        );
        if ($stmt->execute()) {
            logMessage("Weekly progress record added successfully for member : $member_id");
            return true;
        } else {
            logMessage("Weekly progress record insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getProgressOfMemberByWeek($member_id, $workout_plan_id, $week_number)
    {
        logMessage("Getting weekly progress...");
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "SELECT * FROM " . $this->table . " WHERE member_id = ? AND workout_plan_id = ? AND week_number = ?";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for getting weekly progress: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param(
            "sii",
            $member_id,
            $workout_plan_id,
            $week_number
        );
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $weekly_progress = $result->fetch_assoc();
                logMessage("Weekly progress record retrieved successfully for member : $member_id");
                return $weekly_progress;
            } else {
                logMessage("No weekly progress record found for member : $member_id");
                return false;
            }
        } else {
            logMessage("Weekly progress record retrieval failed: " . $stmt->error);
            return false;
        }
    }

    public function getLastWeekProgressOfAMember($member_id, $workout_plan_id)
    {
        logMessage("Getting last weekly progress...");
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "SELECT * FROM " . $this->table . " WHERE member_id = ? AND workout_plan_id = ? ORDER BY week_number DESC LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for getting last weekly progress: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param(
            "si",
            $member_id,
            $workout_plan_id
        );
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $weekly_progress = $result->fetch_assoc();
            return $weekly_progress;
        } else {
            logMessage("Last weekly progress record retrieval failed: " . $stmt->error);
            return false;
        }
    }

    public function updateWeeklyProgressOfMember($member_id, $workout_plan_id, $week_number, $weekly_progress)
    {
        logMessage("Updating weekly progress...");
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }
        
        $weekly_progress_json = json_encode($weekly_progress); // Convert PHP array to JSON string
        
        $query = "UPDATE " . $this->table . " SET weekly_progress = ? WHERE member_id = ? AND workout_plan_id = ? AND week_number = ?";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for updating weekly progress: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param(
            "ssii",
            $weekly_progress_json,
            $member_id,
            $workout_plan_id,
            $week_number
        );
        if ($stmt->execute()) {
            logMessage("Weekly progress record updated successfully for member : $member_id");
            return true;
        } else {
            logMessage("Weekly progress record update failed: " . $stmt->error);
            return false;
        }
    }

    public function getPreviousProgressOfMember($member_id){
        logMessage("Getting previous weekly progress...");
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "SELECT * FROM " . $this->table . " WHERE member_id = ? ORDER BY week_number DESC ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for getting previous weekly progress: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param(
            "s",
            $member_id
        );
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $weekly_progress = $result->fetch_all(MYSQLI_ASSOC);    // Fetch all records as an associative array
                logMessage("Previous weekly progress record retrieved successfully for member : $member_id");
                return $weekly_progress;
            } else {
                logMessage("No previous weekly progress record found for member : $member_id");
                return [];
            }
        } else {
            logMessage("Previous weekly progress record retrieval failed: " . $stmt->error);
            return false;
        }
    }
}