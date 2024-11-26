<?php
// api/handlers/subscriptionHandler.php

include_once "../models/Subscription.php";
include_once "../../logs/save.php";

function addSubscription($conn) {
    $subscription = new Subscription($conn);
    
    // Get the raw input data and decode JSON
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate that required fields exist
    if(
        isset($data['member_id']) &&
        isset($data['membership_plan_id']) &&
        isset($data['start_date']) &&
        isset($data['end_date']) &&
        isset($data['payment_due_date']) &&
        isset($data['status'])
    ) {
        $member_id = intval($data['member_id']);
        $membership_plan_id = intval($data['membership_plan_id']);
        $start_date = $data['start_date'];
        $end_date = $data['end_date'];
        $payment_due_date = $data['payment_due_date'];
        $status = $data['status'];
        logMessage("yearly price issss :  $yearlyPrice");

    if ($subscription->addSubscription($member_id, $membership_plan_id, $start_date, $end_date, $payment_due_date, $status)) {
        logMessage("Subscription added for member: $member_id");
        echo json_encode(["message" => "Subscription added successfully"]);
    } else {
        logMessage("Failed to add subscription for member: $member_id");
        echo json_encode(["error" => "Subscription addition failed"]);
    }
    } else {
        logMessage("Invalid input data for subscription");
        echo json_encode(["error" => "Invalid input data"]);
    }

function getSubscription($conn) {
    $subscription = new Subscription($conn);
    
    if (isset($_GET['subscription_id'])) {
        $subscription_id = filter_var($_GET['subscription_id'], FILTER_SANITIZE_STRING);
        $result = $subscription->getSubscriptions($subscription_id);
    } elseif (isset($_GET['member_id'])) {
        $member_id = filter_var($_GET['member_id'], FILTER_SANITIZE_STRING);
        $result = $subscription->getSubscriptions(null, $member_id);
    } else {
        $result = $subscription->getSubscriptions();
    }

    if ($result) {
        logMessage("Subscription data fetched");
        echo json_encode($result);
    } else {
        logMessage("No subscriptions found");
        echo json_encode(["error" => "No subscriptions found"]);
    }
}

function updateSubscription($conn) {
    $subscription = new Subscription($conn);
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['subscription_id']) && 
        isset($data['membership_plan_id']) &&
        isset($data['start_date']) &&
        isset($data['end_date']) && 
        isset($data['payment_due_date']) && 
        isset($data['status'])
        ) {
        $member_id = $data['member_id'];
        $membership_plan_id = $data['membership_plan_id'];
        $start_date = $data['start_date'];
        $end_date = $data['end_date'];
        $payment_due_date = $data['payment_due_date'];
        $status = $data['status'];

        if ($subscription->updateSubscription($subscription_id, $end_date, $payment_due_date, $status)) {
            logMessage("Subscription updated: $subscription_id");
            echo json_encode(["message" => "Subscription updated successfully"]);
        } else {
            logMessage("Failed to update subscription: $subscription_id");
            echo json_encode(["error" => "Subscription update failed"]);
        }
    } else {
        logMessage("Invalid input for subscription update");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

function deleteSubscription($conn) {
    $subscription = new Subscription($conn);
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['subscription_id'])) {
        $subscription_id = $_GET['subscription_id'];

        if ($subscription->deleteSubscription($subscription_id)) {
            logMessage("Subscription deleted: $subscription_id");
            echo json_encode(["message" => "Subscription deleted successfully"]);
        } else {
            logMessage("Failed to delete subscription: $subscription_id");
            echo json_encode(["error" => "Subscription deletion failed"]);
        }
    } else {
        logMessage("Invalid input for subscription deletion");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

?>