<?php
// models/TrainerCareer.php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class AssignedTrainer
{
    private $conn;
    private $table = "assigned_trainer";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("AssignedTrainer model initialized with database connection.");
    }

    public function selectTrainer($member_id, $trainer_id)
    {
        logMessage("Selecting a new trainer...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "INSERT INTO " . $this->table . " (member_id, trainer_id) 
        VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for selecting a trainer: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param("ss", $member_id, $trainer_id);
        if ($stmt->execute()) {
            logMessage("Assigned Trainer record added successfully for member : $member_id");
            return true;
        } else {
            logMessage("assigned trainer record insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getTrainerAssignedToMember($member_id)
    {
        logMessage("checking whether trainer is assigned and getting the trainer assigned to member");

        if(!$this->conn){
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "SELECT trainer_id, assigned_date FROM " . $this->table . " WHERE member_id = ? ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for checking trainer assignment: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param("s", $member_id);
        if($stmt->execute()){
            $result = $stmt->get_result();
            if($result->num_rows > 0){
                $row = $result->fetch_assoc();
                return $row;
            }else{
                logMessage("No Trainer assigened");
                return "noAssignedTrainer";
            }
        }else{
            logMessage("Error executing query for checking trainer assignment: " . $stmt->error);
            return false;
        }
    }

    public function changeTrainer($member_id, $newTrainer_id)
    {
        logMessage("changing the assigned trainer");
        if(!$this->conn){
            logMessage("Database connection is not valid.");
            return false;
        }
        $query = "UPDATE " . $this->table . " SET trainer_id = ? , assigned_date = NOW() WHERE member_id = ? ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for changing trainer: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param("ss", $newTrainer_id, $member_id);
        if($stmt->execute()){
            return true;
        }else{
            logMessage("Error executing query for changing trainer: " . $stmt->error);
            return false;
        }
    }

    public function removeTrainer($member_id)
    {
        logMessage("removing the assigned trainer");
        if(!$this->conn){
            logMessage("Database connection is not valid.");
        }
        $query = "DELETE FROM " . $this->table . " WHERE member_id = ? ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for removing trainer: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param(
            "s",
            $member_id
        );
        if($stmt->execute()){
            return true;
        }else{
            logMessage("Error executing query for removing trainer: " . $stmt->error);
            return false;
        }
    }

    public function getCountOfAssignedMembersOfTrainer($trainer_id)
    {
        logMessage("getting the count of assigned members of a trainer");
        if(!$this->conn){
            logMessage("Database connection is not valid.");
            return false;
        }
        $query = "SELECT COUNT(member_id) AS member_count FROM " . $this->table . " WHERE trainer_id = ? ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for getting count of assigned members of trainer: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param("s", $trainer_id);
        if($stmt->execute()){
            $result = $stmt->get_result();
            if($result){
                $row = $result->fetch_assoc();
                return (int)$row['member_count'];
            }
        }else{
            logMessage("Error executing query for getting count of assigned members of trainer: " . $stmt->error);
            return false;
        }
    }
}