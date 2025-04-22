<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class TrainerClass
{
    private $conn;
    private $table = "class";
    private $trainerTable = "trainer";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("TrainerClass model initialized with database conection");
    }

    private function generateClassID()
    {
        $query = "SELECT class_id 
                  FROM " . $this->table . " 
                  ORDER BY CAST(SUBSTRING(class_id, 3) AS UNSIGNED) DESC 
                  LIMIT 1";
        $result = $this->conn->query($query);

        if ($result && $row = $result->fetch_assoc()) {
            $lastID = (int) substr($row['class_id'], 2); // Remove 'TC' and convert to integer
            $newID = $lastID + 1;
            return 'TC' . $newID; // Format as TCX where X is the incremented value
        } else {
            logMessage("No existing class records found, starting ID from TC1.");
            return 'TC1';
        }
    }

    public function addClass($trainer_id, $className, $description, $date, $start_time, $end_time)
    {
        logMessage("adding a new class");
        if (!$this->conn) {
            logMessage("database connection failed");
            return false;
        }
        $class_id = $this->generateClassID();
        if (!$class_id) {
            logMessage("failed to generate class id");
            return false;
        }
        $noOfParticipants = 0;
        $query = "INSERT INTO " . $this->table . "(class_id, trainer_id, className, description, noOfParticipants, date, start_time, end_time)
        VALUES (?,?,?,?,?,?,?,?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing stmt for class insertion: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param(
            "ssssisss",
            $class_id,
            $trainer_id,
            $className,
            $description,
            $noOfParticipants,
            $date,
            $start_time,
            $end_time
        );
        if ($stmt->execute()) {
            logMessage("class added : $class_id ");
            return true;
        } else {
            logMessage("Error adding class: " . $stmt->error);
            return false;
        }
    }

    public function getClasses()
    {
        logMessage("fetching all classes.....");
        if (!$this->conn) {
            logMessage("database connection failed");
            return false;
        }
        $query = "SELECT C.*, CONCAT(T.firstName, ' ', T.lastName) AS trainerName FROM " . $this->table . " C, " . $this->trainerTable . " T 
        WHERE C.trainer_id = T.trainer_id";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing stmt for class fetching: " . $this->conn->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();

            if ($result && $result->num_rows > 0) {
                $classes = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Classes fetched successfully");
                return $classes;
            } else {
                logMessage("No classes found");
                return [];
            }
        } else {
            logMessage("Error fetching classes: " . $stmt->error);
            return false;
        }
    }

    public function updateClass($class_id, $className, $description, $date, $start_time, $end_time)
    {
        logMessage("updating class details");
        if (!$this->conn) {
            logMessage("database connection failed");
            return false;
        }
        $query = "UPDATE " . $this->table . " SET className = ?, description = ?, date = ?, start_time = ?, end_time = ? 
        WHERE class_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing stmt for class update: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param(
            "ssssss",
            $className,
            $description,
            $date,
            $start_time,
            $end_time,
            $class_id
        );
        if ($stmt->execute()) {
            logMessage("Class updated successfully for class_id : $class_id");
            return true;
        } else {
            logMessage("Error updating class: " . $stmt->error);
            return false;
        }
    }

    public function deleteClass($class_id)
    {
        logMessage("Deleting class with class_id: $class_id");
        if (!$this->conn) {
            logMessage("database connection failed");
            return false;
        }
        $query = "DELETE FROM " . $this->table . " WHERE class_id = ?";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing stmt for class delete: " . $this->conn->error);
        }
        $stmt->bind_param(
            "s",
            $class_id
        );
        if ($stmt->execute()) {
            logMessage("Class deleted successfully for class_id : $class_id");
            return true;
        } else {
            logMessage("Error deleting class: " . $stmt->error);
            return false;
        }
    }

    public function getClassesOfaTrainer($trainer_id)
    {
        logMessage("getting classes belongs to the trainer : $trainer_id");
        if (!$this->conn) {
            logMessage("database connection failed");
            return false;
        }
        $query = "SELECT class_id FROM " . $this->table . " WHERE trainer_id = ?";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing stmt for class get: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param(
            "s",
            $trainer_id
        );
        if($stmt->execute()){
            $result = $stmt->get_result();
            
            if($result && $result->num_rows > 0){
                $classes = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Classes belongs to the trainer fetched successfully");
                return $classes;
            }else{
                logMessage("No classes found for the trainer : $trainer_id");
                return [];
            }
        }else{
            logMessage("Error fetching classes for the trainer : $trainer_id");
            return false;
        }
    }

    public function getClassDetailsOfTrainer($trainer_id)
    {
        if(!$this->conn){
            logMessage("database connection failed");
            return false;
        }
        $query = "SELECT C.*, CONCAT(T.firstName, ' ', T.lastName) AS trainerName FROM " . $this->table . " C, " . $this->trainerTable . " T 
        WHERE C.trainer_id = T.trainer_id AND C.trainer_id = ? ";
        $stmt = $this->conn->prepare($query);
        if($stmt === false){
            logMessage("Error preparing stmt for class get: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param(
            "s",
            $trainer_id
        );
        if($stmt->execute()){
            $result = $stmt->get_result();
            
            if($result && $result->num_rows > 0){
                $classes = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Classes belongs to the trainer fetched successfully");
                return $classes;
            }else{
                logMessage("No classes found for the trainer : $trainer_id");
                return [];
            }
        }else{
            logMessage("Error fetching classes for the trainer : $trainer_id");
            return false;
        }
    }

    public function getClassByClassId($class_id)
    {
        logMessage("Getting class by class_id: $class_id");
        if (!$this->conn) {
            logMessage("database connection failed");
            return false;
        }
        $query = "SELECT * FROM " . $this->table . " WHERE class_id = ?";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing stmt for class get: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param(
            "s",
            $class_id
        );
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                return $row;
            } else {
                logMessage("No class found for class_id: $class_id");
                return false;
            }
        } else {
            logMessage("Error getting class: " . $stmt->error);
            return false;
        }
    }

    public function getClassTimesByDate($date)
    {
        logMessage("getting times of classes by date");
        if (!$this->conn) {
            logMessage("database connection failed");
            return false;
        }
        $query = "SELECT start_time, end_time FROM " . $this->table . " WHERE date = ?";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing stmt for class get: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param(
            "s",
            $date
        );
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $rows = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Class times fetched successfully");
                return $rows;
            } else {
                logMessage("No classes found for date: $date");
                return [];
            }
        } else {
            logMessage("Error getting class times: " . $stmt->error);
            return false;
        }
    }

    public function checkTimeSlotAvailability($date, $start_time, $end_time, $class_id = null)
    {
        logMessage("check time slot availibility");

        if (!$this->conn) {
            logMessage("Database connection failed");
            return false;
        }

        if($class_id){
            $query = "SELECT class_id, start_time, end_time FROM " . $this->table .
            " WHERE date = ? AND (
                     (start_time < ? AND end_time > ?) OR  
                     (start_time >= ? AND start_time < ?) 
                     ) AND class_id != ? ";
        }else{
            $query = "SELECT class_id, start_time, end_time FROM " . $this->table .
            " WHERE date = ? AND (
                     (start_time < ? AND end_time > ?) OR  
                     (start_time >= ? AND start_time < ?) 
                     )";
        }

        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for checkTimeSlotAvailability: " . $this->conn->error);
            return false;
        }

        if($class_id){
            $stmt->bind_param(
                "ssssss",
                $date,
                $end_time,
                $start_time,
                $start_time,
                $end_time,
                $class_id
            );
        }else{
            $stmt->bind_param(
                "sssss",
                $date,
                $end_time,
                $start_time,
                $start_time,
                $end_time
            );
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $conflicts = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Time slot conflicts found ");
                return $conflicts;
            }
            logMessage("Time slot is available");
            return true;
        } else {
            logMessage("Error checking time slot availability: " . $stmt->error);
            return false;
        }
    }

    public function checkClassUpdatePossible($class_id)
    {
        logMessage("checking whether class details can be updated..function running...");

        $query = "SELECT date, start_time FROM " . $this->table . " WHERE class_id = ? ";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for checkClassUpdatePossibie: " . $this->conn->error);
            return "stmt_error";
        }
        $stmt->bind_param("s", $class_id);
        if (!$stmt->execute()) {
            logMessage("Error fetching class time: " . $stmt->error);
            return "fetch_error";
        }
        $result = $stmt->get_result();
        $class = $result->fetch_assoc();
        
        $current_time = new DateTime('now', new DateTimeZone('Asia/Colombo'));
        logMessage("Current server time: " . $current_time->format('Y-m-d H:i:s'));
        
        $class_start = new DateTime($class['date'] . ' ' . $class['start_time'], new DateTimeZone('Asia/Colombo'));
        logMessage("Class start time: " . $class_start->format('Y-m-d H:i:s'));
        $time_diff = $current_time->diff($class_start);

        if ($time_diff->invert) {
            logMessage("Class already started - cannot update ");
            return "class_started";
        }

        //trainer cant update class info within last 24 hrs
        $total_hours = ($time_diff->days * 24) + $time_diff->h;
        if ($total_hours >= 24) {
            logMessage("Class can be updated/deleted");
            return "trainer_can_update";
        } else {
            logMessage("Class can not be updated/deleted");
            return "trainer_cant_update";
        }
    }

    public function checkUpdatedDatePossible($class_id, $newDate)
    {
        logMessage("checking whether updated date is possible");
        //updated date cant be prior to the already exisiting class date

        $query = "SELECT date FROM " . $this->table . " WHERE class_id = ?" ;
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for checkUpdatedDatePossible: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param(
            "s",
            $class_id
        );
        if($stmt->execute()){
            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                logMessage("Class not found with ID: $class_id");
                return false;
            }
            $class = $result->fetch_assoc();
            if($newDate < $class['date']){
                logMessage("Updated date cannot be prior to the already existing class date");
                return false;
            }
            return true;
        }else{
            logMessage("Error executing statement for checkUpdatedDatePossible: " . $this->conn->error);
            return false;
        }
    }

    public function checkClassExists($class_id)
    {
        logMessage("Checking whether class exists function is running");
        $query = "SELECT className FROM " . $this->table . " WHERE class_id = ?";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for checkClassExists: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param(
            "s",
            $class_id
        );
        if($stmt->execute()){
            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                logMessage("Class not found with ID: $class_id");
                return false;
            }
            return true;
        }else{
            logMessage("Error executing statement for checkClassExists: " . $this->conn->error);
            return false;
        }
    }

    public function updateParticipantCountInEnroll($class_id)
    {  
        $query = "UPDATE " . $this->table . " SET noOfParticipants = noOfParticipants + 1 WHERE class_id = ?";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for updateParticipantCount: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param("s", $class_id);
        if ($stmt->execute()) {
            logMessage("Participant count updated successfully for class ID: $class_id");
            return true;
        } else {
            logMessage("Error updating participant count: " . $stmt->error);
            return false;
        }
    }

    public function updateParticipantCountInCancelEnroll($class_id)
    {  
        $query = "UPDATE " . $this->table . " SET noOfParticipants = noOfParticipants - 1 WHERE class_id = ?";
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for updateParticipantCount: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param("s", $class_id);
        if ($stmt->execute()) {
            logMessage("Participant count updated successfully for class ID: $class_id");
            return true;
        } else {
            logMessage("Error updating participant count: " . $stmt->error);
            return false;
        }
    }
}