<?php
// equipmentHandler.php

include_once "../models/membershipPlan.php";
include_once "../../logs/save.php";
include_once "../models/Payments.php";

function verifyMembershipPlanOfMember($user_id)
{
    logMessage("verifying membership plan func running......");
    $data = json_decode(file_get_contents("php://input"), true);

    //getting lastest subscribed membership plan details of the member
    $payment = new Payment();
    $planPaymentDetails = $payment->getLatestPaymentByUserId($user_id);

    $subscribed_membership_plan_id = null; 
    if($planPaymentDetails === false || $planPaymentDetails == null){
        $subscribed_membership_plan_id = "MP1";
    }else{
        $subscribed_membership_plan_id = $planPaymentDetails['membership_plan_id'];
    }

    //getting basePlanID of $subscribed_membership_plan_id 
    $membershipPlan = new MembershipPlan();
    $subscribedBasePlanID = $membershipPlan->getBasePlanIdFromMembershipPlanId($subscribed_membership_plan_id);
    
    if(isset($data['base_plan_id'])){
        $base_plan_id = $data['base_plan_id'];

        //checking whether user has access to features based on plan
        //plan priority : MP1 < MP2 < MP3
        // switch($subscribedBasePlanID){
        //     case "MP3" :
        //         logMessage("User has access to all features.");
        //         echo json_encode(["message" => "Access Granted"]);
        //         break;
        //     case "MP2" :
        //         if($base_plan_id === "MP3"){
        //             //user cant have access to higher plan features
        //             echo json_encode(["error" => "Access Forbidden"]);
        //         }else{
        //             echo json_encode(["message" => "Access Granted"]);
        //         }
        //         break;
        //     case "MP1" :
        //         if($base_plan_id === "MP2" || $base_plan_id === "MP3"){
        //             //user cant have access to higher plan features
        //             echo json_encode(["error" => "Access Forbidden"]);
        //         }else{
        //             echo json_encode(["message" => "Access Granted"]);
        //         }
        // }

        if ($base_plan_id === $subscribedBasePlanID) {
            logMessage("recieved Base plan ID matches the base plan id of subscribed membership plan.");
            echo json_encode(["message" => "membership plan verified"]);
        }else{
            logMessage("Base plan ID does not match the subscribed membership plan.");
            echo json_encode(["error" => "membership plan verification failed"]);
        }
    }else{
        logMessage("Base plan ID not provided in request.");
        echo json_encode(["error" => "An error has occured please try again later"]);
    }
}
