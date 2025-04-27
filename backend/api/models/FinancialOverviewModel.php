<?php
// api/models/FinancialOverviewModel.php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class FinancialOverviewModel
{
    private $conn;
    private $overview_table = "financial_overview";
    private $paymentsTable = "payments";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("FinancialOverviewModel initialized with database connection.");
    }

    public function getFinancialOverviewData($periodType, $limit = 12)
    {
        logMessage("Fetching aggregated financial data for period: $periodType");

        $query = "SELECT period_date, total_income, payment_count
                    FROM $this->overview_table 
                     WHERE period_type = ? 
                    ORDER BY period_date DESC 
                    LIMIT ?";

        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            logMessage("Error preparing statement for fetching financial overview: " . $this->conn->error);
            return false;
        }
        if (!$stmt->bind_param("si", $periodType, $limit)) {
            logMessage("Error binding parameters for fetching financial overview: " . $stmt->error);
            return false;
        }
        if (!$stmt->execute()) {
            logMessage("Error executing statement for fetching financial overview: " . $stmt->error);
            return false;
        }
        $result = $stmt->get_result();
        $data = [];
        if ($result && $result->num_rows > 0) {
            $data = $result->fetch_all(MYSQLI_ASSOC);
            logMessage("Financial overview data fetched successfully.");
        } else {
            logMessage("No financial overview data found for the specified period type: $periodType.");
        }
        $stmt->close();
        return $data;
    }


    public function updateFinancialOverview()
    {
        logMessage("Starting financial overview update...");
        try {
            $this->conn->begin_transaction();
            logMessage("Transaction started for financial overview update.");

            //daily overview
            $this->updateDailyOverview();

            //weekly overview
            $this->updateWeeklyOverview();

            //monthly overview
            if (date('j') == 1) {
                $this->updateMonthlyAggregates();
            }

            $this->conn->commit();
            logMessage("Transaction committed successfully for financial overview update.");
        } catch (Exception $e) {
            $this->conn->rollback();
            logMessage("Transaction rolled back due to error: " . $e->getMessage());
            return false;
        }
    }

    private function updateDailyOverview()
    {
        logMessage("Updating daily financial overview...");

        $query = "
        INSERT INTO {$this->overview_table} (period_date, period_type, total_income, payment_count)
        SELECT DATE(date_time) AS period_date, 'daily' AS period_type,
            SUM(amount) AS total_income, COUNT(*) AS payment_count
        FROM {$this->paymentsTable}
        WHERE DATE(date_time) = CURDATE()
          AND status = 'Success'
        GROUP BY DATE(date_time)
        ON DUPLICATE KEY UPDATE 
            total_income = VALUES(total_income), 
            payment_count = VALUES(payment_count);
    ";

        if ($this->conn->query($query) === TRUE) {
            logMessage("Daily financial overview updated successfully.");
        } else {
            logMessage("Error updating daily financial overview: " . $this->conn->error);
        }
    }


    private function updateWeeklyOverview()
    {
        logMessage("Updating weekly financial overview...");
        $query = "
        INSERT INTO {$this->overview_table} (period_date, period_type, total_income, payment_count)
        SELECT DATE(date_time) AS period_date, 'weekly' AS period_type,
            SUM(amount) AS total_income, COUNT(*) AS payment_count
        FROM {$this->paymentsTable}
        WHERE YEARWEEK(date_time, 1) = YEARWEEK(CURDATE(), 1)
          AND status = 'Success'
        GROUP BY YEARWEEK(date_time, 1)
        ON DUPLICATE KEY UPDATE 
            total_income = VALUES(total_income), 
            payment_count = VALUES(payment_count);
    ";

        if ($this->conn->query($query) === TRUE) {
            logMessage("Weekly financial overview updated successfully.");
        } else {
            logMessage("Error updating weekly financial overview: " . $this->conn->error);
        }
    }


    private function updateMonthlyAggregates()
    {
        logMessage("Updating monthly financial overview...");
        $query = "
        INSERT INTO {$this->overview_table} (period_date, period_type, total_income, payment_count)
        SELECT DATE_FORMAT(date_time, '%Y-%m-01') AS period_date, 'monthly' AS period_type,
            SUM(amount) AS total_income, COUNT(*) AS payment_count
        FROM {$this->paymentsTable}
        WHERE MONTH(date_time) = MONTH(CURDATE()) 
          AND YEAR(date_time) = YEAR(CURDATE())
          AND status = 'Success'
        GROUP BY DATE_FORMAT(date_time, '%Y-%m-01')
        ON DUPLICATE KEY UPDATE 
            total_income = VALUES(total_income), 
            payment_count = VALUES(payment_count);
    ";

        if ($this->conn->query($query) === TRUE) {
            logMessage("Monthly financial overview updated successfully.");
        } else {
            logMessage("Error updating monthly financial overview: " . $this->conn->error);
        }
    }


    private function executeQuery($query, $periodType)
    {
        logMessage("Executing query for period type: $periodType");
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            throw new Exception("Prepare failed for $periodType: " . $this->conn->error);
        }

        if (!$stmt->execute()) {
            throw new Exception("Execute failed for $periodType: " . $stmt->error);
        }
        $stmt->close();
        logMessage("$periodType query executed successfully.");
    }

    public function updateWeeklyOverviewPublic()
    {
        return $this->updateWeeklyOverview();
    }
    public function updateDailyOverviewPublic()
    {
        return $this->updateDailyOverview();
    }
    public function updateMonthlyAggregatesPublic()
    {
        return $this->updateMonthlyAggregates();
    }
}
