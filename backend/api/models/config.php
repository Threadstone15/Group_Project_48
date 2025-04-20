<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class Config
{

    private $conn;

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Config model initialized with database connection.");
    }


    public function getConfigValue($key)
    {
        try {
            $stmt = $this->conn->prepare("CALL GetConfigValue(?)");
            $stmt->bind_param("s", $key);
            $stmt->execute();

            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                return $row['config_value'];
            } else {
                return null;
            }
        } catch (Exception $e) {
            logMessage("Error fetching config value: " . $e->getMessage());
            return null;
        }
    }


    public function updateConfigValue($key, $value)
    {
        try {
            $stmt = $this->conn->prepare("CALL UpdateConfigValue(?, ?)");
            $stmt->bind_param("ss", $key, $value);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                return true;
            } else {
                return false;
            }
        } catch (Exception $e) {
            logMessage("Error updating config value: " . $e->getMessage());
            return false;
        }
    }
}
