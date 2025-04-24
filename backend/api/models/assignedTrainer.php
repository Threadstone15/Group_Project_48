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

        $query = "INSERT INTO " . $this->table . " (member_id, trainer_id, assigned_date) 
        VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for selecting a trainer: " . $this->conn->error);
            return false;
        }
        $current_time = new DateTime('now', new DateTimeZone('Asia/Colombo'));
        $assigned_date = $current_time->format('Y-m-d H:i:s');

        $stmt->bind_param(
            "sss",
            $member_id,
            $trainer_id,
            $assigned_date
        );
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

        if (!$this->conn) {
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
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                return $row;
            } else {
                return null;
            }
        } else {
            logMessage("Error executing query for checking trainer assignment: " . $stmt->error);
            return false;
        }
    }

    public function changeTrainer($member_id, $newTrainer_id)
    {
        logMessage("changing the assigned trainer");
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }
        $query = "UPDATE " . $this->table . " SET trainer_id = ? , assigned_date = ? WHERE member_id = ? ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for changing trainer: " . $this->conn->error);
            return false;
        }
        $current_time = new DateTime('now', new DateTimeZone('Asia/Colombo'));
        $assigned_date = $current_time->format('Y-m-d H:i:s');

        $stmt->bind_param("sss", $newTrainer_id, $assigned_date, $member_id);
        if ($stmt->execute()) {
            return true;
        } else {
            logMessage("Error executing query for changing trainer: " . $stmt->error);
            return false;
        }
    }

    public function removeTrainer($member_id)
    {
        logMessage("removing the assigned trainer");
        if (!$this->conn) {
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
        if ($stmt->execute()) {
            return true;
        } else {
            logMessage("Error executing query for removing trainer: " . $stmt->error);
            return false;
        }
    }

    public function getCountOfAssignedMembersOfTrainer($trainer_id)
    {
        logMessage("getting the count of assigned members of a trainer");
        if (!$this->conn) {
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
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result) {
                $row = $result->fetch_assoc();
                return (int) $row['member_count'];
            }
        } else {
            logMessage("Error executing query for getting count of assigned members of trainer: " . $stmt->error);
            return false;
        }
    }

    public function getAssignedMemberCountOfTrainers()
    {
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }
        $query = "SELECT COUNT(member_id) AS assigned_member_count , trainer_id FROM " . $this->table . " GROUP BY trainer_id ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for getting assigned member count of trainers: " . $this->conn->error);
            return false;
        }
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $memberCounts = $result->fetch_all(MYSQLI_ASSOC);
                return $memberCounts;
            } else {
                logMessage("No records found in assigned_trainer table");
                return [];
            }
        } else {
            logMessage("Error executing query for getting assigned member count of trainers: " . $stmt->error);
            return false;
        }
    }

    public function getTrainersDetailsWithAssignedMemberCount()
    {
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }
        $query = "
        SELECT 
            T.trainer_id, 
            T.firstName, 
            T.lastName, 
            T.phone, 
            T.years_of_experience, 
            T.specialties, 
            T.gender,
            U.status, 
            U.email, 
            COUNT(A.member_id) AS assigned_member_count
        FROM 
            trainer T
        JOIN 
            users U ON U.user_id = T.user_id
        LEFT JOIN 
            assigned_trainer A ON A.trainer_id = T.trainer_id
        GROUP BY 
            T.trainer_id, T.firstName, T.lastName, T.phone, 
            T.years_of_experience, T.specialties, T.gender, 
            U.status, U.email;

        ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for getting trainer details with assigned member count : " . $this->conn->error);
            return false;
        }
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $rows = $result->fetch_all(MYSQLI_ASSOC);
                return $rows;
            } else {
                logMessage("No records found in assigned_trainer table");
                return [];
            }
        } else {
            logMessage("Error executing query for getting assigned member count of trainers: " . $stmt->error);
            return false;
        }
    }

    public function getAssignedMembersOfATrainer($trainer_id)
    {
        logMessage("getting the assigned members of a trainer");
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }
        $query = "SELECT A.member_id, CONCAT(M.firstName ,' ', M.lastName) AS fullName, M.phone, M.gender, A.assigned_date 
        FROM " . $this->table . " A , member M , users U 
        WHERE A.member_id = M.member_id 
        AND 
        M.user_id = U.user_id
        AND 
        U.status = 1
        AND
        A.trainer_id = ? ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for getting assigned members of a trainer: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param("s", $trainer_id);
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $rows = $result->fetch_all(MYSQLI_ASSOC);
                return $rows;
            } else {
                logMessage("No records found in assigned_trainer table for trainer id : $trainer_id");
                return [];
            }
        } else {
            logMessage("Error executing query for getting assigned members of a trainer: " . $stmt->error);
            return false;
        }
    }
}
