<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class SystemHistory
{
    private $conn;

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("SystemHistory model initialized");
    }

    public function getAttendanceHistory()
    {
        logMessage("Fetching attendance history...");
        return $this->callStoredProcedure("GetAttendanceHistory");
    }

    public function getMaintenanceHistory()
    {
        logMessage("Fetching maintenance history...");
        return $this->callStoredProcedure("GetAllDeletedMaintenance");
    }

    public function getApplicationsHistory()
    {
        logMessage("Fetching applications history...");
        return $this->callStoredProcedure("GetDeletedTrainerApplications");
    }

    public function getJobsHistory()
    {
        logMessage("Fetching jobs history...");
        return $this->callStoredProcedure("GetAllCareers");
    }

    public function getEquipmentsHistory()
    {
        logMessage("Fetching equipment history...");
        return $this->callStoredProcedure("GetAllEquipment");
    }

    private function callStoredProcedure($procedureName)
    {
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "CALL $procedureName()";
        $result = $this->conn->query($query);

        if ($result === false) {
            logMessage("Stored procedure call to $procedureName failed: " . $this->conn->error);
            return false;
        }

        $data = [];
        while ($row = $result->fetch_row()) {
            $data[] = $row;
        }

        logMessage("Procedure $procedureName executed. " . count($data) . " rows fetched.");
        $result->close();
        $this->conn->next_result(); // Clear result buffer for subsequent calls

        return $data;
    }
}
