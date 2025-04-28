<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class PaymentEvidence
{
    private $conn;
    private $table = "payment_evidence";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("PaymentEvidence model initialized with database connection.");
    }

    public function addPaymentEvidence($payment_id, $evidence_image)
    {
        logMessage("Adding new payment evidence record...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "INSERT INTO " . $this->table . " (payment_id, evidence_image) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for payment evidence insertion: " . $this->conn->error);
            return false;
        }

        // Bind parameters: "i" for INT (payment_id), "b" for BLOB (evidence_image)
        $null = NULL;
        $stmt->bind_param("sb", $payment_id, $null);

        // Send the data for the blob separately
        $stmt->send_long_data(1, $evidence_image);

        logMessage("Query bound for adding payment evidence with payment_id: $payment_id");

        if ($stmt->execute()) {
            logMessage("Payment evidence added successfully for payment_id: $payment_id");
            return true;
        } else {
            logMessage("Payment evidence insertion failed: " . $stmt->error);
            return false;
        }
    }
}
