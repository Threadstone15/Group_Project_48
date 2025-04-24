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

    function insertWeeklyProgress($member_id, $workout_plan_id, $week_number, $weekly_progress)
    {
        logMessage("Inserting weekly progress...");
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $current_time = new DateTime('now', new DateTimeZone('Asia/Colombo'));
        $current_date = $current_time->format('Y-m-d');
        $week_completed = 0; // edfault  week_completed -> false

        $weekly_progress_json = json_encode($weekly_progress); // Convert PHP array to JSON string

        $query = "INSERT INTO " . $this->table . " (member_id, workout_plan_id, week_number, weekly_progress , week_completed , created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)"; 
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for inserting weekly progress: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param(
            "siisiss",
            $member_id,
            $workout_plan_id,
            $week_number,
            $weekly_progress_json,
            $week_completed,
            $current_date,
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

    function getProgressOfMemberByWeek($member_id, $workout_plan_id, $week_number)
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

    function getLastWeekProgressOfAMember($member_id, $workout_plan_id)
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
            if ($result->num_rows > 0) {
                $weekly_progress = $result->fetch_assoc();
                logMessage("Last weekly progress record retrieved successfully for member : $member_id");
                return $weekly_progress;
            } else {
                logMessage("No last weekly progress record found for member : $member_id");
                return false;
            }
        } else {
            logMessage("Last weekly progress record retrieval failed: " . $stmt->error);
            return false;
        }
    }

    function updateWeeklyProgressOfMember($member_id, $workout_plan_id, $week_number, $weekly_progress)
    {
        logMessage("Updating weekly progress...");
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $current_time = new DateTime('now', new DateTimeZone('Asia/Colombo'));
        $current_date = $current_time->format('Y-m-d');
        
        $weekly_progress_json = json_encode($weekly_progress); // Convert PHP array to JSON string
        
        $query = "UPDATE " . $this->table . " SET weekly_progress = ?, updated_at = ? WHERE member_id = ? AND workout_plan_id = ? AND week_number = ?";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for updating weekly progress: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param(
            "sssii",
            $weekly_progress_json,
            $current_date,
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
}