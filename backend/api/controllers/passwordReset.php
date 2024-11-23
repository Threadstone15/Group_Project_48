<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../vendor/autoload.php';
include_once "../../middleware/authMiddleware.php";

function pass_reset_mail()
{
    logMessage("Password reset mail check function invoked.");

    $data = json_decode(file_get_contents("php://input"), true);

    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        logMessage("Sanitized email: $email");
    
        $user = new User();
    
        // Check if the user exists
        if ($user_id = $user->userExists($email)) {
            logMessage("User exists for email: $email ID $user_id");

    
            // Generate a password reset token
            try {
                $token = generateTokenPassReset($user_id);
                logMessage("Generated password reset token for email: $email");
    
                $reset_link = "http://localhost:8080/Group_Project_48/resetPw?token=$token";
                logMessage("Generated reset link: $reset_link");
    
                // Send the email using PHPMailer
                $mail = new PHPMailer(true);
    
                try {
                    // SMTP configuration
                    logMessage("Configuring PHPMailer for email sending.");
                    $mail->isSMTP();
                    $mail->Host = 'smtp.gmail.com'; // Gmail SMTP server
                    $mail->SMTPAuth = true;
                    $mail->Username = 'gymverse.services@gmail.com'; // Replace with your SMTP username
                    $mail->Password = 'tizz sjfn wrwl gayt'; // Replace with your SMTP password
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port = 587;
    
                    // Email settings
                    $mail->setFrom('no-reply@yourwebsite.com', 'Your Team');
                    $mail->addAddress($email);
                    $mail->Subject = "Password Reset Request";
                    $mail->Body = "Hello,\n\nWe received a request to reset your password. Click the link below to reset it:\n\n$reset_link\n\nIf you didn't request this, you can safely ignore this email.\n\nBest Regards,\nYour Team";
    
                    logMessage("Attempting to send email to: $email");
                    $mail->send();
                    logMessage("Password reset email sent successfully to: $email");
                    
                    echo json_encode(["success" => true, "message" => "Password reset email sent.", "resetToken" => $token]);
    
                    // Optionally, save the token to the database for validation later
                    // $user->saveResetToken($email, $token);
                    logMessage("Reset token saved for email: $email");
    
                } catch (Exception $e) {
                    logMessage("Failed to send password reset email to: $email. PHPMailer Error: " . $mail->ErrorInfo);
                    echo json_encode(["success" => false, "message" => "Failed to send email."]);
                }
    
            } catch (Exception $e) {
                logMessage("Failed to generate token for email: $email. Error: " . $e->getMessage());
                echo json_encode(["success" => false, "message" => "An error occurred while processing your request."]);
            }
    
        } else {
            logMessage("No account found for email: $email");
            echo json_encode(["success" => false, "message" => "No account found for this email."]);
        }
    

}

function pass_reset()
{
    logMessage("Password reset function invoked.");

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['token']) || empty($data['password'])) {
        logMessage("Invalid input: Token or password missing.");
        echo json_encode(["success" => false, "message" => "Invalid input. Please provide a valid token and password."]);
        return;
    }

    $token = filter_var($data['token'], FILTER_SANITIZE_STRING);
    $password = filter_var($data['password'], FILTER_SANITIZE_STRING);
    logMessage("Sanitized inputs: token = $token, password = (hidden for security)");

    try {
        $user_id = getUserIDFromTokenPassReset($token);
        if (!$user_id) {
            logMessage("Invalid or expired token provided.");
            echo json_encode(["success" => false, "message" => "Invalid or expired token."]);
            return;
        }

        logMessage("Token verified. User ID retrieved: $user_id");

        $user = new User();

        if ($user->resetPassword($user_id, $password)) {
            logMessage("Password reset successfully for user ID: $user_id");

            echo json_encode(["success" => true, "message" => "Password reset successfully."]);
        } else {
            logMessage("Failed to reset password for user ID: $user_id");
            echo json_encode(["success" => false, "message" => "Failed to reset password."]);
        }
    } catch (Exception $e) {
        logMessage("Error during password reset process: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "An error occurred while processing your request."]);
    }
}


?>