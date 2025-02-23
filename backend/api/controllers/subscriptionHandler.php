<?php
// equipmentHandler.php

include_once "../models/Subscription.php";
include_once "../models/Member.php";
include_once "../models/Payments.php";
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

function updateSubscription($user_id)
{
    logMessage("update subscirption function running...");

    $subscription = new Subscription();
    $member = new Member();

    //getting member id of member using userId
    $memberData = $member->getMemberIDbyUserID($user_id);
    if (!$memberData) {
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

        if ($subscription->updateSubscription($member_id, $membership_plan_id, $startDate, $endDate, $paymentDue_date, $status, $period)) {
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

function getUserDetails($user_id)
{
    logMessage("get user details function running...");
    $member = new Member();
    $result = $member->getMemberDetailsByUserID($user_id);
    if ($result) {
        logMessage("User details fetched");
        echo json_encode($result);
    } else {
        logMessage("User not found for userID : $user_id");
        echo json_encode(["error" => "User not found"]);
    }
}

function generatePaymentHash()
{
    $merchant_id = "1227926"; // Replace with your actual merchant ID
    $merchant_secret = "MzIxNDM0NTYxNTIzMDQ1MzM5MjIyMTQzMDY3MjIyMzY5NzI0NTU4"; // Replace with your actual secret

    $input = json_decode(file_get_contents("php://input"), true);

    $order_id = $input['orderId'];
    $amount = number_format((float) $input['planPrice'], 2, '.', ''); // Ensure proper formatting
    $currency = "LKR"; // Change as needed

    // Generate the hash using PayHere format
    $hash_string = strtoupper(
        md5($merchant_id . $order_id . $amount . $currency . strtoupper(md5($merchant_secret)))
    );

    logMessage("Hash generated: " . $hash_string);

    echo json_encode(["hash" => $hash_string]);
}

function confirmPayment($user_id)
{
    logMessage("confirmPayment function running...");

    $payment = new Payment();

    // Get payment data from the request body
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['payment_id']) &&
        isset($data['membership_plan_id']) &&
        isset($data['amount']) &&
        isset($data['currency']) &&
        isset($data['method']) &&
        isset($data['status'])
    ) {
        $payment_id = $data['payment_id'];
        $membership_plan_id = $data['membership_plan_id'];
        $amount = $data['amount'];
        $currency = $data['currency'];
        $method = $data['method'];
        $status = $data['status'];

        // Update the payment record in the database
        if ($payment->createPayment($membership_plan_id, $user_id, $payment_id, $amount, $currency, $status, $method)) {
            logMessage("Payment confirmed for user : $user_id, payment_id: $payment_id");

            // Optionally, update subscription status (if required)
            // Here you can integrate the subscription logic as needed

            echo json_encode(["message" => "Payment confirmed and subscription updated"]);
        } else {
            logMessage("Failed to confirm payment for user : $user_id, payment_id: $payment_id");
            echo json_encode(["error" => "Payment confirmation failed"]);
        }
    } else {
        logMessage("Invalid input data for payment confirmation");
        echo json_encode(["error" => "Invalid input data"]);
    }
}
