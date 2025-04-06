<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class Payment
{
    private $conn;
    private $table = "payments";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Payment model initialized");
    }

    public function createPayment($membership_plan_id, $user_id, $payment_id, $amount, $currency, $status, $method)
    {
        logMessage("Adding new payment record...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // Use the correct data types for binding parameters
        $query = "INSERT INTO " . $this->table . " (membership_plan_id, user_id, payment_id, amount, currency, status, method)
              VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for payment insertion: " . $this->conn->error);
            return false;
        }
        logMessage("parameters: $membership_plan_id, $user_id, $payment_id, $amount, $currency, $status, $method");

        // Correct binding of parameters with the appropriate data types
        $stmt->bind_param("sisdsss", $membership_plan_id, $user_id, $payment_id, $amount, $currency, $status, $method);
        logMessage("Query bound for adding payment with payment_id: $payment_id");


        if ($stmt->execute()) {
            logMessage("Payment added successfully for payment_id: $payment_id");
            return true;
        } else {
            logMessage("Payment insertion failed: " . $stmt->error);
            return false;
        }
    }


    public function getPaymentByPaymentId($payment_id)
    {
        logMessage("Fetching payment data for payment_id: $payment_id");

        $query = "SELECT * FROM " . $this->table . " WHERE payment_id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching payment record: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("s", $payment_id);
        logMessage("Query bound for fetching payment: $payment_id");

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $payment = $result->fetch_assoc();
            logMessage("Payment data fetched successfully for payment_id: $payment_id");
            return $payment;
        } else {
            logMessage("Error fetching payment data: " . $stmt->error);
            return false;
        }
    }

    public function confirmPayment($user_id, $payment_id)
    {
        logMessage("Confirming payment for payment_id: $payment_id");

        $query = "UPDATE " . $this->table . " SET status = ? WHERE user_id = ? AND payment_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for confirming payment: " . $this->conn->error);
            return false;
        }

        $status = 'Confirmed'; // Set the payment status as confirmed
        $stmt->bind_param("sis", $status, $user_id, $payment_id);
        logMessage("Query bound for confirming payment: $payment_id");

        if ($stmt->execute()) {
            logMessage("Payment confirmed successfully for payment_id: $payment_id");
            return true;
        } else {
            logMessage("Payment confirmation failed: " . $stmt->error);
            return false;
        }
    }

    public function getLatestPaymentByUserId($user_id)
    {
        logMessage("Fetching latest payment record for user_id: $user_id");

        $query = "
        SELECT p.membership_plan_id, p.amount, p.status, p.date_time, m.plan_name, m.benefits
        FROM {$this->table} AS p
        JOIN membership_plan AS m ON p.membership_plan_id = m.membership_plan_id
        WHERE p.user_id = ?
        ORDER BY p.date_time DESC
        LIMIT 1
    ";

        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching latest user payment: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("i", $user_id);
        logMessage("Query bound for fetching latest payment of user_id: $user_id");

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $payment = $result->fetch_assoc();

            if ($payment) {
                logMessage("Fetched latest payment for user_id: $user_id");
                return $payment;
            } else {
                logMessage("No payment record found for user_id: $user_id");
                return null;
            }
        } else {
            logMessage("Error executing statement: " . $stmt->error);
            return false;
        }
    }

    public function getPaymentsByUserId($user_id)
    {
        logMessage("Fetching payment records for user_id: $user_id");

        $query = "SELECT membership_plan_id, amount, status, date_time 
                  FROM " . $this->table . " 
                  WHERE user_id = ?";

        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching user payments: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("i", $user_id);
        logMessage("Query bound for fetching payments of user_id: $user_id");

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $payments = [];

            while ($row = $result->fetch_assoc()) {
                $payments[] = $row;
            }

            logMessage("Fetched " . count($payments) . " payments for user_id: $user_id");
            return $payments;
        } else {
            logMessage("Error executing statement: " . $stmt->error);
            return false;
        }
    }
}
