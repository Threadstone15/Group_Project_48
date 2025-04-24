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

    function insertWeeklyProgress($member_id, $week_number, $workout_plan_id, $workout_plan_name, $workout_plan_description, $workout_plan_duration, $workout_plan_start_date, $workout_plan_end_date)
    {
        logMessage("Inserting weekly progress...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "INSERT INTO " . $this->table . " (member_id, trainer_id, week_number, workout_plan_id, workout_plan_name, workout_plan_description, workout_plan_duration, workout_plan_start_date, workout_plan_end_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for inserting weekly progress: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param(
            "sssssssss",
            $member_id,
            $trainer_id,
            $week_number,
            $workout_plan_id,
            $workout_plan_name,
            $workout_plan_description,
            $workout_plan_duration,
            $workout_plan_start_date,
            $workout_plan_end_date
        );
        if ($stmt->execute()) {
            logMessage("Weekly progress record added successfully for member : $member_id");
            return true;
        } else {
            logMessage("Weekly progress record insertion failed: " . $stmt->error);
            return false;
        }
    }
}