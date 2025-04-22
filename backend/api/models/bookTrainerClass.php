<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class BookTrainerClass
{
    private $conn;
    private $table = "class_participants";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("BookTrainerClass model initialized with database conection");
    }

    public function enrollToClass($member_id, $class_id){
        logMessage("enrolling to a class");
        if(!$this->conn){
            logMessage("db connection failed");
            return false;
        }
        $query = "INSERT INTO " . $this->table . " (class_id, member_id) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Failed to prepare statement for class enrollment");
            return false;
        }
        $stmt->bind_param(
            "ss",
            $class_id,
            $member_id
        );

        if ($stmt->execute()) {
            logMessage("Successfully enrolled member $member_id to class $class_id");
            return true;
        }else{
            logMessage("Failed to execute statement for class enrollment: " . $stmt->error);
            return false;
        }
    }

    public function getEnrolledClasses($member_id){
        logMessage("getting member enrolled classes");
        if(!$this->conn){
            logMessage("db connection failed");
            return false;
        }
        $current_time = new DateTime('now', new DateTimeZone('Asia/Colombo'));
        $current_date = $current_time->format('Y-m-d');
        
        $query = "SELECT class_id FROM " . $this->table . " 
        WHERE member_id = ? 
        AND class_id IN
        (SELECT class_id FROM class WHERE date >= ?)
        ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Failed to prepare statement for getting enrolled classes");
            return false;
        }
        $stmt->bind_param("ss", $member_id, $current_date);
        if ($stmt->execute()) {
            logMessage("Successfully retrieved enrolled classes for member $member_id");
            return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        } else {
            logMessage("Failed to execute statement for getting enrolled classes: " . $stmt->error);
            return false;
        }
    }

    public function cancelEnrollmentToClass($class_id, $member_id)
    {
        logMessage("canceling enrollment to class");
        $query = "DELETE FROM " . $this->table . " WHERE class_id = ? AND member_id = ?";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Failed to prepare statement for canceling enrollment");
            return false;
        }
        $stmt->bind_param("ss", $class_id, $member_id);
        if ($stmt->execute()) {
            logMessage("Successfully canceled enrollment for member $member_id from class $class_id");
            return true;
        } else {
            logMessage("Failed to execute statement for canceling enrollment: " . $stmt->error);
            return false;
        }
    }
}