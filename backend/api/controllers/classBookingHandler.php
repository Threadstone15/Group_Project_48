<?php

include_once "../models/trainerClass.php";
include_once "../../logs/save.php";
include_once "../models/assignedTrainer.php";
include_once "../models/Member.php";
include_once "../models/bookTrainerClass.php";
include_once "../models/trainerClass.php";

function getClassesofAssignedTrainer($user_id)
{
    logMessage("get class details of assigned trainer func is running");
    $member = new Member();
    $memberData = $member->getMemberIDbyUserID($user_id);
    $member_id = $memberData['member_id'];

    $assignedTrainer = new AssignedTrainer();
    $assignedTrainerData = $assignedTrainer->getTrainerAssignedToMember($member_id);
    if ($assignedTrainerData === false) {
        logMessage("Error in getting assigned trainer");
        echo json_encode(["error" => "Error Getting Assigned Trainer. Please try again later"]);
        exit();
    } else if (empty($assignedTrainerData)) {
        logMessage("No assigned trainer");
        echo json_encode(["error" => "Please Select A Trainer for your training sessions"]);
        exit();
    } 
    $trainer_id = $assignedTrainerData['trainer_id'];

    $trainerClass = new TrainerClass();
    $classes = $trainerClass->getClassDetailsOfTrainer($trainer_id);
    if ($classes !== false && !empty($classes)) {
        logMessage("classes retrieved successfully");
        echo json_encode($classes);
    } else if (empty($classes)) {
        logMessage("No Classes Found");
        echo json_encode(["error" => "Your assigned trainer has not scheduled any classes"]);
    } else {
        logMessage("Failed to retrieve classes");
        echo json_encode(["error" => "Failed to retrieve classes of your assigned trainer"]);
    }
}

function enrollToClass($user_id)
{
    logMessage("enroll to class function running.......");
    $member = new Member();
    $memberData = $member->getMemberIDbyUserID($user_id);
    $member_id = $memberData['member_id'];

    $data = json_decode(file_get_contents("php://input"), true);

    if(
        isset($data['class_id'])
    ){
        $class_id = $data['class_id'];

        $bookTrainerClass = new BookTrainerClass();
        $trainerClass = new TrainerClass();
        
        if($bookTrainerClass->enrollToClass($member_id, $class_id)){
            //updating participant count
            $trainerClass->updateParticipantCountInEnroll($class_id);
            echo json_encode(["message" => "Successfully enrolled to class."]);
        }else{
            echo json_encode(["error" => "Enrollment to class failed."]);
        }
    }else{
        echo json_encode(["error" => "Invalid input for class enrollment"]);
    }
}

function getEnrolledClasses($user_id){
    logMessage("get enrolled classes function running.......");
    $member = new Member();
    $memberData = $member->getMemberIDbyUserID($user_id);
    $member_id = $memberData['member_id'];

    $bookTrainerClass = new BookTrainerClass();
    $classes = $bookTrainerClass->getEnrolledClasses($member_id);
    if($classes !== false){
        echo json_encode($classes);
    }else{
        echo json_encode(["error" => "Failed to retrieve enrolled classes."]);
    }
}

function cancelEnrollmentToClass($user_id){
    logMessage("cancel enrollment to class function running.......");
    $member = new Member();
    $memberData = $member->getMemberIDbyUserID($user_id);
    $member_id = $memberData['member_id'];

    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['class_id'])
    ) {
        $class_id = $data['class_id'];
        $bookTrainerClass = new BookTrainerClass();
        $trainerClass = new TrainerClass();
        
        if ($bookTrainerClass->cancelEnrollmentToClass($class_id, $member_id)) {
            $trainerClass->updateParticipantCountInCancelEnroll($class_id);
            echo json_encode(["message" => "Successfully canceled enrollment to class."]);
        }else{
            echo json_encode(["error" => "Cancellation of enrollment failed."]);
        }
    }else{
        echo json_encode(["error" => "Invalid input for class enrollment cancellation"]);
    }
}

function getEnrolledMemberListOfClass()
{
    logMessage("get enrolled list of class function running.......");
    $data = json_decode(file_get_contents("php://input"), true);

    if(isset($data['class_id'])){
        $class_id = $data['class_id'];
        $bookTrainerClass = new BookTrainerClass();
        $enrolledList = $bookTrainerClass->getEnrolledListOfClass($class_id);
        if($enrolledList === false){
            echo json_encode(["error" => "Failed to retrieve enrolled list for the class."]);
        }else{
            echo json_encode($enrolledList);
        }
    }
}