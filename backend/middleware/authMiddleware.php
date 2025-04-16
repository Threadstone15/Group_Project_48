<?php
$secretkey = 'your-secret-key';

function generateToken($user_id)
{
    global $secretkey;

    $timestamp = floor(time() / 3600) * 3600;

    $payload = json_encode([
        'user_id' => $user_id,
        'exp' => $timestamp + 3600
    ]);

    $base64Payload = base64_encode($payload);

    $signature = hash_hmac('sha256', $base64Payload, $secretkey);

    return $base64Payload . '.' . $signature;
}

function generateTokenPassReset($user_id)
{
    global $secretkey;

    $timestamp = time();
    $expiration = $timestamp + 300;

    $payload = json_encode([
        'user_id' => $user_id,
        'exp' => $expiration
    ]);

    $cipherMethod = 'AES-256-CBC';
    $ivLength = openssl_cipher_iv_length($cipherMethod);
    $iv = openssl_random_pseudo_bytes($ivLength);

    $encryptedPayload = openssl_encrypt(
        $payload,
        $cipherMethod,
        $secretkey,
        0,
        $iv
    );

    $token = base64_encode($iv . $encryptedPayload);

    return $token;
}

function getUserIDFromTokenPassReset($token)
{
    global $secretkey;

    $cipherMethod = 'AES-256-CBC';
    $ivLength = openssl_cipher_iv_length($cipherMethod);

    $decoded = base64_decode($token);

    $iv = substr($decoded, 0, $ivLength);
    $encryptedPayload = substr($decoded, $ivLength);

    $decryptedPayload = openssl_decrypt(
        $encryptedPayload,
        $cipherMethod,
        $secretkey,
        0,
        $iv
    );

    if ($decryptedPayload === false) {

        return null;
    }

    // Convert the decrypted payload to an array
    $payload = json_decode($decryptedPayload, true);

    if (isset($payload['user_id']) && isset($payload['exp']) && time() <= $payload['exp']) {
        return $payload['user_id'];
    }

    // Return null if the token is expired or invalid
    return null;
}



function getBearerToken()
{
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $matches = [];
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function verifyToken($token)
{
    $secretkey = 'your-secret-key';
    list($base64Payload, $signature) = explode('.', $token);

    $expectedSignature = hash_hmac('sha256', $base64Payload, $secretkey);

    if ($signature === $expectedSignature) {
        $payload = json_decode(base64_decode($base64Payload), true);

        if ($payload['exp'] < time()) {
            echo json_encode(["error" => "Token expired"]);
            exit();
        }

        return $payload;
    }

    echo json_encode(["error" => "Invalid token"]);
    exit();
}

function checkAuth()
{
    global $secretkey;

    $token = getBearerToken();

    if (!$token) {
        echo json_encode(["error" => "Unauthorized, token missing"]);
        exit();
    }

    $payload = verifyToken($token);

    $_SESSION['user_id'] = $payload['user_id'];
}

function checkRole($allowedRoles)
{
    if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], $allowedRoles)) {
        echo json_encode(["error" => "Forbidden"]);
        exit();
    }
}

function getUserIdFromToken($token)
{

    if (!$token) {
        echo json_encode(["error" => "Unauthorized, token missing"]);
        exit();
    }

    $payload = verifyToken($token);

    return $payload['user_id'];
}

function getUserIdFromTokenNoVerify($token)
{

    if (!$token) {
        echo json_encode(["error" => "Unauthorized, token missing"]);
        exit();
    }


    $secretkey = 'your-secret-key';
    list($base64Payload, $signature) = explode('.', $token);

    $expectedSignature = hash_hmac('sha256', $base64Payload, $secretkey);

    if ($signature === $expectedSignature) {
        $payload = json_decode(base64_decode($base64Payload), true);
    }


    return $payload['user_id'];
}

function getUserRoleFromToken($token)
{

    if (!$token) {
        echo json_encode(["error" => "Unauthorized, token missing"]);
        exit();
    }

    $payload = verifyToken($token);
    $user_id = $payload['user_id'];

    $user = new User();
    $userRole = $user->getUserRoleById($user_id);


    return $userRole;
}

function verifyRequest($requiredRole, $token)
{

    $userRole = getUserRoleFromToken($token);

    if ($userRole !== $requiredRole) {
        echo json_encode(["error" => "Forbidden: You do not have permission to access this resource"]);
        exit();
    }
}
