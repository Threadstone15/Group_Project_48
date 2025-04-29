<?php
// db/DatabaseConnection.php

require_once __DIR__ . '/../logs/save.php';

class DatabaseConnection
{
    private static $instance = null;
    private $conn;

    /*
    private $servername = "mysql-rad.alwaysdata.net";
    private $username = "rad";
    private $password = "ucsc_rad_123";
    private $dbname = "rad_gymverse";
    private $port = 3306;*/

    private $servername = "localhost";
    private $username = "root";
    private $password = "";
    private $dbname = "rad_gymverse";
    private $port = 3306;

    // Private constructor to prevent multiple instances
    private function __construct()
    {
        $this->conn = new mysqli(
            $this->servername,
            $this->username,
            $this->password,
            $this->dbname,
            $this->port
        );

        // Check connection
        if ($this->conn->connect_error) {
            logMessage("Connection failed: " . $this->conn->connect_error);
            die(json_encode(["error" => "Connection failed: " . $this->conn->connect_error]));
        } else {
            logMessage("Connection established successfully to the database: " . $this->dbname);
        }
    }

    // Singleton method to get the instance
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new DatabaseConnection();
        }
        return self::$instance;
    }

    // Method to get the connection
    public function getConnection()
    {
        return $this->conn;
    }

    // Close connection if needed
    public function closeConnection()
    {
        if ($this->conn) {
            $this->conn->close();
            logMessage("Database connection closed.");
        }
    }

    // Destructor to ensure connection is closed
    public function __destruct()
    {
        $this->closeConnection();
    }
}
