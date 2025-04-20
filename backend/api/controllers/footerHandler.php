<?php

require_once "../models/config.php";
function getFooterInfo()
{
    try {
        $config = new Config();

        $keys = [
            "gym_address",
            "gym_email",
            "gym_no",
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
