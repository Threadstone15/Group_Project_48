<?php
// equipmentHandler.php

include_once "../models/membershipPlan.php";
include_once "../models/Subscription.php";
include_once "../../logs/save.php";

function addMembershipPlan() {
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



function getMembershipPlans() {
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

function updateMembershipPlan() {
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

        if ($membershipPlan->updateMembershipPlan($membership_plan_id,$name, $benefits, $monthlyPrice, $yearlyPrice, $basePlanID)) {
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


function deleteMembershipPlan() {
    logMessage("delete membership plan function running...");

    $membershipPlan = new MembershipPlan();
    $subscription = new Subscription();

    if (isset($_GET['membership_plan_id'])) {
        $membership_plan_id = $_GET['membership_plan_id'];

        if($membership_plan_id == "MP1" || $membership_plan_id == "MP2" || $membership_plan_id == "MP3"){
            logMessage("Membership plan ID $membership_plan_id is a reserved ID -> basic plans cannot be deleted");
            echo json_encode(["error" => "Basic plans cannot be deleted"]);
            exit();
        }

        $subscriptionData = $subscription->getSubscriptionByMembershipPlanID($membership_plan_id);
        if($subscriptionData){
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
?>
