<?php
//messageHandler.php
include_once "../models/Message.php";
include_once "../../logs/save.php";

function getThreads($user_id)
{
    logMessage("Fetching threads for user ID: $user_id"); // Log the user ID
    $message = new Message();    // your Message model class

    $threads = $message->getThreads($user_id); // Call the function you wrote
    logMessage("Fetched threads: " . json_encode($threads)); // Log the fetched threads

    if ($threads) {
        echo json_encode($threads);   // Send JSON response to frontend
    } else {
        echo json_encode([]);         // If no threads found, return empty array
    }
}

function sendMessage($data)
{
    logMessage("Sending message with data: " . json_encode($data)); // Log the data being sent
    $message = new Message();    // your Message model class
    $from_user_id = $data['from_user_id']; // Sender's user ID
    $to_user_id = $data['to_user_id'];     // Receiver's user ID
    $text = $data['text'];                 // Message text
    logMessage("From user ID: $from_user_id, To user ID: $to_user_id, Text: $text"); // Log the message details

    $result = $message->sendMessage($from_user_id, $to_user_id, $text); // Call the function you wrote
    logMessage("Send message result: " . json_encode($result)); // Log the result of sending the message

    if ($result) {
        echo json_encode(["success" => true]);   // Send success response to frontend
    } else {
        echo json_encode(["success" => false]);  // If sending failed, return failure response
    }
}

function markAsRead($data)
{
    logMessage("Marking message as read with data: " . json_encode($data)); // Log the data being sent
    $message = new Message();    // your Message model class
    $userId = $data['userId']; // Sender's user ID
    $otherUserId = $data['otherUserId'];

    $message = $message->markAsRead($userId, $otherUserId);

    if ($message) {
        echo json_encode(["success" => true]);   // Send success response to frontend
    } else {
        echo json_encode(["success" => false]);  // If sending failed, return failure response
    }
}

function getMessages($current_user_id, $other_user_id)
{
    logMessage("Fetching messages between user ID: $current_user_id and user ID: $other_user_id"); // Log the user IDs
    $message = new Message();    // your Message model class

    $messages = $message->getMessages($current_user_id, $other_user_id); // Call the function you wrote
    logMessage("Fetched messages: " . json_encode($messages)); // Log the fetched messages

    if ($messages) {
        echo json_encode($messages);   // Send JSON response to frontend
    } else {
        echo json_encode([]);         // If no messages found, return empty array
    }
}
