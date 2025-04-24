<?php

include_once "../../logs/save.php";
include_once "../models/workoutProgress.php";
include_once "../models/Member.php";
include_once "../models/workoutPlan.php";

function addWeeklyWorkoutProgress($user_id)
{
    logMessage("add weekly progress function running......");
    $workoutProgress = new WorkoutProgress();
    $member = new Member();
    $memberData = $member->getMemberIdByUserId($user_id);
    $member_id = $memberData['member_id'];
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['workout_plan_id']) &&
        isset($data['week_number']) &&
        isset($data['weekly_progress'])
    ) {
        $workout_plan_id = $data['workout_plan_id'];
        $week_number = $data['week_number'];
        $weekly_progress = $data['weekly_progress'];

        if ($workoutProgress->insertWeeklyProgress(
            $member_id,
            $workout_plan_id,
            $week_number,
            $weekly_progress
        )) {
            logMessage("Weekly progress is added successfully for user: " . $user_id);
            echo json_encode(["message" => "Weekly Progress Added Successfully"]);
        } else {
            logMessage("Failed to add weekly progress for user: " . $user_id);
            echo json_encode(["error" => "Failed to add weekly progress"]);
        }
    } else {
        logMessage("Invalid input data for adding weekly progress.");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

function getWorkoutProgressOfAMemberByWeek($user_id)
{
    logMessage("get weekly progress function running......");
    $workoutProgress = new WorkoutProgress();
    $member = new Member();
    $memberData = $member->getMemberIdByUserId($user_id);
    $member_id = $memberData['member_id'];
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['workout_plan_id']) &&
        isset($data['week_number'])
    ) {
        $workout_plan_id = $data['workout_plan_id'];
        $week_number = $data['week_number'];

        $weekProgress = $workoutProgress->getProgressOfMemberByWeek(
            $member_id,
            $workout_plan_id,
            $week_number
        );
        if ($weekProgress) {
            logMessage("Weekly progress is retrieved successfully for user: " . $user_id);
            echo json_encode($weekProgress);
        } else {
            logMessage("Failed to retrieve weekly progress for user: " . $user_id);
            echo json_encode(["error" => "Failed to retrieve weekly progress"]);
        }
    } else {
        logMessage("Invalid input data for retrieving weekly progress.");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

function updateWeeklyProgressOfMember($user_id)
{
    logMessage("update weekly progress function running......");
    $workoutProgress = new WorkoutProgress();
    $member = new Member();
    $memberData = $member->getMemberIdByUserId($user_id);
    $member_id = $memberData['member_id'];
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['workout_plan_id']) &&
        isset($data['week_number']) &&
        isset($data['weekly_progress'])
    ) {
        $workout_plan_id = $data['workout_plan_id'];
        $week_number = $data['week_number'];
        $weekly_progress = $data['weekly_progress'];

        if ($workoutProgress->updateWeeklyProgressOfMember(
            $member_id,
            $workout_plan_id,
            $week_number,
            $weekly_progress
        )) {
            logMessage("Weekly progress is updated successfully for user: " . $user_id);
            echo json_encode(["message" => "Weekly Progress Updated Successfully"]);
        } else {
            logMessage("Failed to update weekly progress for user: " . $user_id);
            echo json_encode(["error" => "Failed to update weekly progress"]);
        }
    } else {
        logMessage("Invalid input data for updating weekly progress.");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

function getLastWeeklyProgressOfMember($user_id)
{
    logMessage("get last weekly progress function running......");
    $workoutProgress = new WorkoutProgress();
    $member = new Member();
    $memberData = $member->getMemberIdByUserId($user_id);
    $member_id = $memberData['member_id'];

    $workoutPlan = new WorkoutPlan();
    $current_workout_plan_id = $workoutPlan->getCurrentWorkoutPlanIdOfMember($user_id);
    logMessage("Current workout plan ID: " . $current_workout_plan_id);
    if (!$current_workout_plan_id) {
        logMessage("No current workout plan found for user: " . $user_id);
        echo json_encode(["error" => "Please select or create a workout plan first"]);
        return;
    }
    $lastWeeklyProgress = $workoutProgress->getLastWeekProgressOfAMember(
        $member_id,
        $current_workout_plan_id
    );
    if ($lastWeeklyProgress) {
        logMessage("Last weekly progress is retrieved successfully for user: " . $user_id);
        echo json_encode($lastWeeklyProgress);
    } else {
        logMessage("Failed to retrieve last weekly progress for user: " . $user_id);
        echo json_encode(["error" => "Failed to retrieve last weekly progress"]);
    }
}