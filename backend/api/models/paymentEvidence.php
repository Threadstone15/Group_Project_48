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

    function getFullPaymentDetailsWithEvidence()
    {
        logMessage("Fetching full payment details with evidence...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return json_encode(["success" => false, "message" => "Database connection error"]);
        }

        try {
            $query = "CALL GetFullPaymentDetailsWithEvidence()";
            $result = $this->conn->query($query);

            if ($result === false) {
                logMessage("Error executing stored procedure: " . $this->conn->error);
                return json_encode(["success" => false, "message" => "Database error"]);
            }

            $data = [];
            while ($row = $result->fetch_assoc()) {
                // Convert blob to base64 if image exists
                if (isset($row['evidence_image'])) {
                    $row['evidence_image'] = base64_encode($row['evidence_image']);
                }
                $data[] = $row;
            }

            $result->free();
            while ($this->conn->more_results() && $this->conn->next_result()) {
                $this->conn->use_result();
            }

            logMessage("Retrieved " . count($data) . " payment records with evidence.");
            return json_encode(["success" => true, "payments" => $data]);
        } catch (Exception $e) {
            logMessage("Exception: " . $e->getMessage());
            return json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }
}
