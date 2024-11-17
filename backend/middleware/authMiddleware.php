<?php
// middleware/authMiddleware.php

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
// Function to extract token from the Authorization header
function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $matches = [];
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}

// Function to verify token
function verifyToken($token, $secretkey) {
    // Split the token into payload and signature
    list($base64Payload, $signature) = explode('.', $token);

    // Recreate the signature using the payload and secret key
    $expectedSignature = hash_hmac('sha256', $base64Payload, $secretkey);

    // Verify if the signature is valid
    if ($signature === $expectedSignature) {
        $payload = json_decode(base64_decode($base64Payload), true);

        // Check if token is expired
        if ($payload['exp'] < time()) {
            echo json_encode(["error" => "Token expired"]);
            exit();
        }

        // Return the payload if the token is valid
        return $payload;
    }

    // Token verification failed
    echo json_encode(["error" => "Invalid token"]);
    exit();
}

// Middleware to check if the user is authenticated via token
function checkAuth() {
    global $secretkey;  // Use the secret key defined in the token file

    // Get the token from the Authorization header
    $token = getBearerToken();

    if (!$token) {
        echo json_encode(["error" => "Unauthorized, token missing"]);
        exit();
    }

    // Verify the token
    $payload = verifyToken($token, $secretkey);

    // Store user_id and role in the session or globally if necessary
    $_SESSION['user_id'] = $payload['user_id'];
}

// Middleware to check if the user has one of the allowed roles
function checkRole($allowedRoles) {
    // Ensure that the role is set in the session (or retrieved from the token)
    if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], $allowedRoles)) {
        echo json_encode(["error" => "Forbidden"]);
        exit();
    }
}
?>
