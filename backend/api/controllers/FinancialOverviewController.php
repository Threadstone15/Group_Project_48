<?php
require_once __DIR__ . '/../models/FinancialOverviewModel.php';
require_once __DIR__ . '/../../logs/save.php';

class FinancialOverviewController {
    private $model;

    public function __construct() {
        $this->model = new FinancialOverviewModel();
        logMessage("FinancialOverviewController initialized with model.");
    }
   
    /*Get financial overview data for charts*/
    public function getOverviewData($request) {
        try{
            logMessage('Controller: Fetching financial overview data.');
            $period = $this->validatePeriod($request['period'] ?? 'monthly');
            $rawData = $this->model->getFinancialOverviewData($period);
    
            if($rawData === false){
                throw new Exception("Failed to fetch financial overview data.");
            }
            header('Content-Type: application/json');
            echo json_encode([
                "status" => "success",
                "data" => $this -> processOverviewData($rawData),
            ]);
        }catch(Exception $e){
           $this->handleError($e->getMessage());
        }
    }

     /*Process overview data for frontend*/
     private function processOverviewData($rawData) {
        $processed= [
            'labels' => [],
            'income' => [],
            'payment_count' => [],
            'growth_rate' => [],
        ];

        $previousIncome = null;
    
        foreach ($rawData as $row) {
            $dateLabel = date('M Y', strtotime($row['period_date']));
            $processed['labels'][] = $row['period_date'];
            $processed['income'][] = (float)$row['total_income'];
            $processed['payment_count'][] = (int)$row['payment_count'];

             // Calculate growth rate
            if($previousIncome !== null  && $previousIncome != 0){
                $growth = (($row['total_income'] - $previousIncome) / $previousIncome) * 100;
                $processed['growth_rate'][] = round($growth, 2);
            }else{
                $processed['growth_rate'][] = 0;
            }
            $previousIncome = $row['total_income'];
        }

       return $processed;
    }

    /*Validate period type*/    
    private function validatePeriod($period) {
        $validPeriods = ['daily', 'weekly', 'monthly'];
        $period = strtolower($period);
        if (!in_array($period, $validPeriods)) {
            throw new Exception("Invalid period type. Valid options are: " . implode(", ", $validPeriods));
        }
        return $period;
    }

    /*Handle errors and send response*/ 
    private function handleError($message) {
        logMessage("Error: $message");
        header('Content-Type: application/json');
        echo json_encode([
            "status" => "error",
            "message" => "Something went wrong with the period parameter.",
        ]);
        http_response_code(500);
        exit();
    }

   
    


}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $controller = new FinancialOverviewController();
    $controller->getOverviewData($_GET);
}


