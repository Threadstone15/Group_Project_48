<?php
// equipmentHandler.php

include_once "../models/membershipPlan.php";
include_once "../models/Subscription.php";
include_once "../models/Payments.php";
include_once "../models/Member.php";
include_once "../models/paymentEvidence.php";
include_once "../../logs/save.php";

function addMembershipPlan()
{
    logMessage("add membership plan function running...");

    $membershipPlan = new MembershipPlan();

    // Get the raw input data and decode JSON
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate that required fields exist
    if (
        isset($data['name']) &&
        isset($data['benefits']) &&
        isset($data['monthlyPrice']) &&
        isset($data['yearlyPrice']) &&
        isset($data['basePlanID'])
    ) {
        $name = $data['name'];
        $benefits = $data['benefits'];
        $monthlyPrice = floatval($data['monthlyPrice']);
        $yearlyPrice = floatval($data['yearlyPrice']);
        $basePlanID = $data['basePlanID'];

        if ($membershipPlan->addMembershipPlan($name, $benefits, $monthlyPrice, $yearlyPrice, $basePlanID)) {
            logMessage("Membership plan added: $name");
            echo json_encode(["message" => "Membership plan added successfully"]);
        } else {
            logMessage("Failed to add membership plan: $name");
            echo json_encode(["error" => "Membership plan addition failed"]);
        }
    } else {
        logMessage("Invalid input data for membership plan");
        echo json_encode(["error" => "Invalid input data"]);
    }
}



function getMembershipPlans()
{
    logMessage("get membership plans running running...");
    $membershipPlan = new MembershipPlan();

    $result = $membershipPlan->getMembershipPlans();


    if ($result) {
        logMessage("Membership plans fetched");
        echo json_encode($result);
    } else {
        logMessage("No membership plans found");
        echo json_encode(["error" => "No membership plans found"]);
    }
}

function getActiveMembershipPlans()
{
    logMessage("get active membership plans running running...");
    $membershipPlan = new MembershipPlan();

    $result = $membershipPlan->getActiveMembershipPlansFromTable();


    if ($result) {
        logMessage("Active Membership plans fetched");
        logMessage("Active Membership plans fetched: " . json_encode($result));
        echo json_encode($result);
    } else {
        logMessage("No membership plans found");
        echo json_encode(["error" => "No membership plans found"]);
    }
}

function recordPaymentReciept()
{
    logMessage("Record payment receipt function running...");

    $membership_plan_id = $_POST['membership_plan_id'] ?? null;
    $member_roll_id = $_POST['member_roll_id'] ?? null;
    $amount = $_POST['amount'] ?? null;
    $type = $_POST['type'] ?? null;
    $currency = $_POST['currency'] ?? null;
    $method = $_POST['method'] ?? null;
    $payment_date = $_POST['payment_date'] ?? null;

    // Validate required fields
    if (!$membership_plan_id || !$member_roll_id || !$amount || !$currency || !$method || !$payment_date) {
        logMessage("Missing required fields for payment record.");
        echo json_encode(["error" => "Missing required fields"]);
        return;
    }
    logMessage("Received payment data: " . json_encode($_POST));
    // Get the user ID from member roll ID
    $member = new Member();
    $user = $member->getUserIDByMemberID($member_roll_id);

    if (!$user || !isset($user['user_id'])) {
        logMessage("Failed to fetch user ID from member roll ID: $member_roll_id");
        echo json_encode(["error" => "Invalid member roll ID"]);
        return;
    }
    $user_id = $user['user_id'];
    //convert user_id into int
    $user_id = intval($user_id);

    $payment = new Payment();
    $status = "Success";

    // Generate a unique payment ID manually (you might want to rethink if it's better to use AUTO_INCREMENT)
    $payment_id = uniqid("PAY_", true); // safer: membership_plan_id + timestamp
    logMessage("Generated payment ID: $payment_id");
    //convert amount into double
    $amount = doubleval($amount);


    // Create payment record
    if ($payment->createPayment($membership_plan_id, $user_id, $payment_id, $amount, $currency, $status, $method)) {
        logMessage("Payment record created successfully: ID $payment_id");

        // Now handle evidence image upload
        if (isset($_FILES['evidence_image']) && $_FILES['evidence_image']['error'] == 0) {
            $imageContent = file_get_contents($_FILES['evidence_image']['tmp_name']);

            $paymentEvidence = new PaymentEvidence();
            if ($paymentEvidence->addPaymentEvidence($payment_id, $imageContent)) {
                logMessage("Payment evidence uploaded successfully for payment_id: $payment_id");
            } else {
                logMessage("Failed to upload payment evidence for payment_id: $payment_id");
            }
        } else {
            if (isset($_FILES['evidence_image'])) {
                logMessage("Error uploading file: " . $_FILES['evidence_image']['error']);
            } else {
                logMessage("No evidence image uploaded.");
            }
        }
    } else {
        logMessage("Failed to create payment record: ID $payment_id");
        echo json_encode(["error" => "Failed to create payment"]);
    }

    // Optional: return success response
    echo json_encode(["success" => "Payment recorded successfully"]);
}




function updateMembershipPlan()
{
    logMessage("update membership plqn function running...");

    $membershipPlan = new MembershipPlan();
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['membership_plan_id']) &&
        isset($data['name']) &&
        isset($data['benefits']) &&
        isset($data['monthlyPrice']) &&
        isset($data['yearlyPrice']) &&
        isset($data['basePlanID'])
    ) {

        $membership_plan_id = $data['membership_plan_id'];
        $name = $data['name'];
        $benefits = $data['benefits'];
        $monthlyPrice = intval($data['monthlyPrice']);
        $yearlyPrice = intval($data['yearlyPrice']);
        $basePlanID = $data['basePlanID'];

        if ($membershipPlan->updateMembershipPlan($membership_plan_id, $name, $benefits, $monthlyPrice, $yearlyPrice, $basePlanID)) {
            logMessage("Membership plan updated successfully: ID $membership_plan_id");
            echo json_encode(["message" => "Membership plan updated successfully"]);
        } else {
            logMessage("Failed to update membership plan: ID $membership_plan_id");
            echo json_encode(["error" => "Membership Plan update failed"]);
        }
    } else {
        logMessage("Invalid input for membership plan update");
        echo json_encode(["error" => "Invalid input data"]);
    }
}


function deleteMembershipPlan()
{
    logMessage("delete membership plan function running...");

    $membershipPlan = new MembershipPlan();
    $subscription = new Subscription();

    if (isset($_GET['membership_plan_id'])) {
        $membership_plan_id = $_GET['membership_plan_id'];

        if ($membership_plan_id == "MP1" || $membership_plan_id == "MP2" || $membership_plan_id == "MP3") {
            logMessage("Membership plan ID $membership_plan_id is a reserved ID -> basic plans cannot be deleted");
            echo json_encode(["error" => "Basic plans cannot be deleted"]);
            exit();
        }

        $subscriptionData = $subscription->getSubscriptionByMembershipPlanID($membership_plan_id);
        if ($subscriptionData) {
            logMessage("Membership plan ID $membership_plan_id has active subscriptions -> cannot be deleted");
            echo json_encode(["error" => "Membership plan with active subscriptions cannot be deleted"]);
            exit();
        }

        if ($membershipPlan->deleteMembershipPlan($membership_plan_id)) {
            logMessage("Membership plan deleted: $membership_plan_id");
            echo json_encode(["message" => "Membership plan deleted successfully"]);
        } else {
            logMessage("Failed to delete membership plan: $membership_plan_id");
            echo json_encode(["error" => "Membership plan deletion failed"]);
        }
    } else {
        logMessage("Invalid input for membership plan deletion");
        echo json_encode(["error" => "Invalid input data"]);
    }
}
