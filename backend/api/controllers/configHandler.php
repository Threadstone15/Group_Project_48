<?php

require_once "../../models/config.php";

$config = new Config();

// Handle GET request: ?action=get&key=gym_email
function getSystemConfig()
{
    global $config;

    $key = $_GET["key"] ?? null;
    logMessage("Key: $key");

    if ($key) {
        $value = $config->getConfigValue($key);
        if ($value !== null) {
            echo json_encode([
                "success" => true,
                "key" => $key,
                "value" => $value
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Configuration key not found."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing 'key' parameter."]);
    }
}

function updateSystemConfig()
{
    global $config;

    $data = json_decode(file_get_contents("php://input"), true);
    $key = $data["key"] ?? null;
    $value = $data["value"] ?? null;
    logMessage("Key: $key" . ", Value: $value");

    if ($key && $value) {
        $success = $config->updateConfigValue($key, $value);
        if ($success) {
            echo json_encode(["success" => true, "message" => "Configuration updated successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Update failed. Key may not exist."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing 'key' or 'value'."]);
    }
}
