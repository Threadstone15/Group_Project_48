<?php
// equipmentHandler.php

include_once "../models/Subscription.php";
include_once "../models/Member.php";
include_once "../../logs/save.php";


function getSubscriptionOfAMember($user_id)
{
    logMessage("getSubscriptionOfAMember func running...");
    $subscription = new Subscription();
    $member = new Member();

    //getting member id of member using userId
    $memberData = $member->getMemberIDbyUserID($user_id);
    if ($memberData) {
        $member_id = $memberData['member_id'];

        $result = $subscription->getSubscriptionOfAMember($member_id);
        if ($result) {
            logMessage("subscription fetched");
            echo json_encode($result);
        } else {
            logMessage("subscription not found for member id : $member_id");
            echo json_encode(["error" => "No subscription found"]);
        }
    } else {
        logMessage("Member not found for userID : $user_id");
        echo json_encode(["error" => "Member not found"]);
    }
}

function updateSubscription($user_id) {
    logMessage("update subscirption function running...");

    $subscription = new Subscription();
    $member = new Member();

    //getting member id of member using userId
    $memberData = $member->getMemberIDbyUserID($user_id);
    if(!$memberData){
        logMessage("Member not found for userID : $user_id");
        echo json_encode(["error" => "Member not found"]);  
        return;
    }
    $member_id = $memberData['member_id'];

    $data = json_decode(file_get_contents("php://input"), true);
    // $member_id, $membership_plan_id, $startDate, $endDate, $paymentDue_date, $status

    if (
        isset($data['membership_plan_id']) &&
        isset($data['startDate']) &&
        isset($data['endDate']) &&
        isset($data['paymentDue_date']) &&
        isset($data['status']) &&
        isset($data['period'])
    ) {
        $membership_plan_id = $data['membership_plan_id'];
        $startDate = $data['startDate'];
        $endDate = $data['endDate'];
        $paymentDue_date = $data['paymentDue_date'];
        $status = $data['status'];
        $period = $data['period'];

        if ($subscription->updateSubscription( $member_id, $membership_plan_id, $startDate, $endDate, $paymentDue_date, $status, $period)) {
            logMessage("Subscription updated successfully for member : $member_id");
            echo json_encode(["message" => "Subscription updated successfully"]);
        } else {
            logMessage("Failed to update subscription for member : $member_id");
            echo json_encode(["error" => "Subscription update failed"]);
        }
    } else {
        logMessage("Invalid input for subscription update");
        echo json_encode(["error" => "Invalid input data"]);
    }
}
