<?php
// Define the secret key to be used in token generation
$secretkey = 'your-secret-key';  // Replace this with your actual secret key

// Function to generate token
function generateToken($user_id) {
    global $secretkey;  // Use the secret key from the file scope

    // Get the current timestamp and round it to the nearest 60 minutes (3600 seconds)
    $timestamp = floor(time() / 3600) * 3600;

    // Create a payload with the user ID and timestamp
    $payload = json_encode([
        'user_id' => $user_id,
        'exp' => $timestamp + 3600  // Token expires in 60 minutes
    ]);

    // Base64 encode the payload
    $base64Payload = base64_encode($payload);

    // Generate a signature using hash_hmac and the secret key
    $signature = hash_hmac('sha256', $base64Payload, $secretkey);

    // Return the token (base64 encoded payload + signature)
    return $base64Payload . '.' . $signature;
}
?>
