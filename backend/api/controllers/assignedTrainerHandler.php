<?php

include_once "../models/assignedTrainer.php";
include_once "../models/Member.php";
include_once "../../logs/save.php";
include_once "../models/Trainer.php";

function selectTrainer($user_id)
{
    logMessage("Selecting trainer function running....");
    $member = new Member();
    $member_data = $member->getMemberIDbyUserID($user_id);
    $member_id = $member_data['member_id'];

    $assignTrainer = new AssignedTrainer();

    $data = json_decode(file_get_contents("php://input"), true);
    if (
        isset($data['trainer_id'])
    ) {
        $trainer_id = $data['trainer_id'];

        //checking whether trainer has reached max no of assigned members
        $memberCountOfTrainer = $assignTrainer->getCountOfAssignedMembersOfTrainer($trainer_id);
        if ((int) $memberCountOfTrainer >= 50) {
            logMessage("Trainer has reached max no of assigned members");
            echo json_encode(["error" => "This trainer cannot be selected as this trainer has reached max no of assigned members"]);
            exit();
        }

        //checking whether a trainer is already assigned 
        $isAssignedTrainer = $assignTrainer->getTrainerAssignedToMember($member_id);
        if ($isAssignedTrainer === false) {
            logMessage("Error assigning trainer");
            echo json_encode(["error" => "Error Assigning Trainer. Please try again later"]);
        } else if (is_array($isAssignedTrainer) && !empty($isAssignedTrainer)) {
            logMessage("Trainer already assigned");
            echo json_encode(["error" => "Trainer already assigned to this member"]);
        } else {
            if ($assignTrainer->selectTrainer($member_id, $trainer_id)) {
                logMessage("Trainer assigned successfully");
                echo json_encode(["message" => "Trainer Assigned Successfully"]);
            } else {
                logMessage("Error assigning trainer");
                echo json_encode(["error" => "Error Assigning Trainer. Please try again later"]);
            }
        }
    }
}

function changeTrainer($user_id)
{
    logMessage("change trainer function is running.......");
    $member = new Member();
    $member_data = $member->getMemberIDbyUserID($user_id);
    $member_id = $member_data['member_id'];
    $assignTrainer = new AssignedTrainer();

    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['trainer_id'])
    ) {
        $newTrainer_id = $data['trainer_id'];
        //needs to check whether user has joined any upcoming sessions of prev trainer -> do it later

        //checking whether new trainer has reached max no of trainers
        $memberCountOfTrainer = $assignTrainer->getCountOfAssignedMembersOfTrainer($newTrainer_id);
        if ((int) $memberCountOfTrainer >= 50) {
            logMessage("Trainer has reached max no of assigned members");
            echo json_encode(["error" => "This trainer cannot be selected as this trainer has reached max no of assigned members"]);
            exit();
        }

        if ($assignTrainer->changeTrainer($member_id, $newTrainer_id)) {
            logMessage("Trainer changed successfully");
            echo json_encode(["message" => "Your Assigned Trainer has been changed Successfully"]);
        } else {
            logMessage("Error changing trainer");
            echo json_encode(["error" => "Error Changing Trainer. Please try again later"]);
        }
    }
}

function removeTrainer($user_id)
{
    logMessage("remove trainer function is running.......");
    $member = new Member();
    $member_data = $member->getMemberIDbyUserID($user_id);
    $member_id = $member_data['member_id'];
    $assignTrainer = new AssignedTrainer();

    //needs to check whether user has joined any upcoming sessions of prev trainer -> do it later

    if ($assignTrainer->removeTrainer($member_id)) {
        logMessage("Trainer removed successfully");
        echo json_encode(["message" => "Your Assigned Trainer has been removed Successfully"]);
    } else {
        logMessage("Error removing trainer");
        echo json_encode(["error" => "Error Removing Trainer. Please try again later"]);
    }
}

function getAssignedTrainer($user_id)
{
    logMessage("get assigned trainer func runnign..");
    $member = new Member();
    $member_data = $member->getMemberIDbyUserID($user_id);
    $member_id = $member_data['member_id'];
    $assignTrainer = new AssignedTrainer();

    $assignedTrainerInfo = $assignTrainer->getTrainerAssignedToMember($member_id);
    if ($assignedTrainerInfo === false) {
        logMessage("Error in getting assigned trainer");
        echo json_encode(["error" => "Error Getting Assigned Trainer. Please try again later"]);
    } else if (is_array($assignedTrainerInfo) && !empty($assignedTrainerInfo)) {
        logMessage("Assigned trainer info retrieved");
        echo json_encode($assignedTrainerInfo);
    } else {
        logMessage("No assigned trainer");
        echo json_encode(["message" => "No Assigned Trainer"]);
    }
}

function getAssignedMemberCountOfTrainer()
{
    logMessage("get assigned member count of trainer func running..");
    $assignTrainer = new AssignedTrainer();
    $assignedMemberCount = $assignTrainer->getTrainersDetailsWithAssignedMemberCount();
    if ($assignedMemberCount === false) {
        logMessage("Error in getting assigned member count");
        echo json_encode(["error" => "Error Getting Assigned Member Count for each trainer"]);
    } else if (empty($assignedMemberCount)) {
        logMessage("No assigned members");
        echo json_encode(["error" => "No Assigned Members"]);
    } else {
        logMessage("Assigned member count retrieved");
        echo json_encode($assignedMemberCount);
    }
}

function getTrainersDetailsWithMemberCount()
{
    logMessage("get trainer details func running..");
    $assignedTrainer = new AssignedTrainer();
    $trainerDetails = $assignedTrainer->getTrainersDetailsWithAssignedMemberCount();
    if ($trainerDetails === false) {
        logMessage("error fetching trainer details");
        echo json_encode(["error" => "Error Fetching Trainer Details"]);
    } else if (empty($trainerDetails)) {
        logMessage("No trainer details found");
        echo json_encode(["error" => "No Trainer Details Found"]);
    } else {
        logMessage("Trainer details retrieved");
        echo json_encode($trainerDetails);
    }
}
