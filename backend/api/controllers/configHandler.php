<?php

require_once "../models/config.php";



// Handle GET request: ?action=get&key=gym_email
function getAllSystemConfigs()
{
    try {
        $config = new Config();

        $keys = [
            "gym_address",
            "gym_capacity",
            "gym_email",
            "gym_no",
            //"maintaince_mode",
            //"notifications",
            "session_time"
        ];

        $configs = [];

        foreach ($keys as $key) {
            $configs[$key] = $config->getConfigValue($key);
        }

        logMessage("Configs: " . json_encode($configs));

        // Return successful JSON response
        echo json_encode([
            "success" => true,
            "configs" => $configs
        ]);
    } catch (Exception $e) {
        // Log error and return failure JSON response
        logMessage("Error fetching system configs: " . $e->getMessage());

        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to fetch system configurations."
        ]);
    }
}

function updateSystemConfig()
{
    $config = new Config();

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
