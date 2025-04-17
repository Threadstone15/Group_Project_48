<?php

include_once "../models/trainerClass.php";
include_once "../models/User.php";
include_once "../../logs/save.php";
include_once "../models/Trainer.php";

function addTrainerClass($user_id)
{
    logMessage("add class function running......");
    $trainer = new Trainer();
    $trainerClass = new TrainerClass();
    $trainer_id = $trainer->getTrainerIdByUserId($user_id);

    $data = json_decode(file_get_contents("php://input"), true);

    if(
        isset($data['className']) &&
        isset($data['description']) &&
        isset($data['date']) && 
        isset($data['start_time']) &&
        isset($data['end_time'])
    ){
        $className = $data['className'];
        $description = $data['description'];
        $date = $data['date'];
        $start_time = $data['start_time'];
        $end_time = $data['end_time'];

        $conflicts = $trainerClass->checkTimeSlotAvailability($date, $start_time, $end_time);
        if($conflicts !== true && !empty($conflicts)) {
            $conflictMessages = array_map(function($conflict) {
                $start = date('g:i A', strtotime($conflict['start_time']));
                $end = date('g:i A', strtotime($conflict['end_time']));
                return "There's a session from $start to $end";
            }, $conflicts);
            
            echo json_encode([
                "status" => "conflict",
                "message" => "Requested Time Slot is not available",
                "conflicts" => $conflictMessages
            ]);
            exit();
        }
        if($trainerClass->addClass(
            $trainer_id, 
            $className, 
            $description, 
            $date, 
            $start_time, 
            $end_time
        )){
            logMessage("class is added succesfully");
            echo json_encode(["message" => "Class is Scheduled Successfully"]);
        }else{
            logMessage("Failed to add the class");
            echo json_encode(["error" => "Failed to Schedule the Class"]);
        }
             
    }else{
        logMessage("Invalid input data for class");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

function getTrainerClasses()
{
    $trainerClass = new TrainerClass();
    $classes = $trainerClass->getClasses();

    if($classes !== false && !empty($classes)){
        logMessage("classes retrieved successfully");
        echo json_encode($classes);
    }else if(empty($classes)){
        logMessage("No Classes Found");
        echo json_encode(["error" => "No classes found"]);
    }else{
        logMessage("Failed to retrieve classes");
        echo json_encode(["error" => "Failed to retrieve classes"]);
    }
}

function updateTrainerClass($updatingRole = null)
{
    logMessage("update class func is running......");

    $trainerClass = new TrainerClass();
    $data = json_decode(file_get_contents("php://input"),true);

    if(
        isset($data["class_id"]) &&
        isset($data["className"]) &&
        isset($data["description"]) &&
        isset($data["date"]) &&
        isset($data["start_time"]) &&
        isset($data["end_time"])
    ){
        $class_id = $data['class_id'];
        $className = $data['className'];
        $description = $data['description'];
        $date = $data['date'];
        $start_time = $data['start_time'];
        $end_time = $data['end_time'];

        if(!($trainerClass->checkClassExists($class_id))){
            logMessage("Class does not exist");
            echo json_encode(["error" => "Class does not exist"]);
            exit();
        }
        switch($trainerClass->checkClassUpdatePossible($class_id)){
            case 'class_started' :
                logMessage("Class has already started");
                echo json_encode(["error" => "Cannot modify class details : this session has already occurred"]);
                exit();
            case 'trainer_cant_update' :
                if($updatingRole === 'trainer'){
                    logMessage("Class update not possible");
                    echo json_encode(["error" => "Class details cannot be changed within the last 24 hrs. Please contact owner or staff"]);
                    exit();
                }
                break;
        }
    
        if(($trainerClass->checkUpdatedDatePossible($class_id, $date)) === false){
            logMessage("Date is not valid");
            echo json_encode(["error" => "Update Rejected : New Class date cannot occur prior to existing date"]);
            exit();
        }

        $conflicts = $trainerClass->checkTimeSlotAvailability($date, $start_time, $end_time, $class_id);
        if($conflicts !== true && !empty($conflicts)) {
            $conflictMessages = array_map(function($conflict) {
                $start = date('g:i A', strtotime($conflict['start_time']));
                $end = date('g:i A', strtotime($conflict['end_time']));
                return "There's a session from $start to $end";
            }, $conflicts);
            
            echo json_encode([
                "status" => "conflict",
                "message" => "Requested Time Slot is not available",
                "conflicts" => $conflictMessages
            ]);
            exit();
        }
        if($trainerClass->updateClass(
            $class_id,
            $className,
            $description,
            $date,
            $start_time,
            $end_time
        )){
            echo json_encode(["message" => "Class details updated successfully"]);
        }else{
            echo json_encode(["error" => "Failed to update class details"]);
        }
    }else{
        echo json_encode(["error" => "Invalid request data"]);
    } 
}

function deleteTrainerClass($updatingRole = null)
{
    logMessage("delete class function running....");
    $trainerClass = new TrainerClass();

    if(
        isset($_GET['class_id']) 
    ){
        $class_id = $_GET['class_id'];
        if(($trainerClass->checkClassExists($class_id)) === false){
            logMessage("Class does not exist");
            echo json_encode(["error" => "Class does not exist"]);
            exit();
        }
        switch($trainerClass->checkClassUpdatePossible($class_id)){
            case 'class_started' :
                logMessage("Class has already started");
                echo json_encode(["error" => "Cannot remove class : this session has already occurred"]);
                exit();
            case 'trainer_cant_update' :
                if($updatingRole === 'trainer'){
                    logMessage("Class update not possible");
                    echo json_encode(["error" => "Class cannot be removed within the last 24 hrs. Please contact owner or staff"]);
                    exit();
                }
                break;
        }

        if($trainerClass->deleteClass($class_id)){
            logMessage("Class deleted successfully : $class_id");
            echo json_encode(["message" => "The class has been removed from the schedule successfully"]);
        }else{
            logMessage("Failed to delete class : $class_id");
            echo json_encode(["error" => "Failed to remove the class from the schedule"]);
        }
    }
}

function getClassesBelongToATrainer($user_id)
{
    logMessage("get classes belong to a trainer func is runing.....");
    $trainerClass = new TrainerClass();
    $trainer = new Trainer();
    $trainer_id = $trainer->getTrainerIdByUserId($user_id);
    $classes = $trainerClass->getClassesOfaTrainer($trainer_id);

    if($classes !== false && !empty($classes)){
        logMessage("classes retrieved successfully");
        echo json_encode($classes);
    }else if(empty($classes)){
        logMessage("No Classes Found");
        echo json_encode(["error" => "You don't have any scheduled classes"]);
    }else{
        logMessage("Failed to retrieve classes");
        echo json_encode(["error" => "Failed to retrieve classes"]);
    }
}