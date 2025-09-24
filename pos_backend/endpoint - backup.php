<?php
include "conn.php";

ini_set('display_errors', 0);
error_reporting(0);

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Max-Age: 60");

    if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
        header("Access-Control-Allow-Methods: POST, OPTIONS");
        header("Access-Control-Allow-Headers: Authorization, Content-Type, Accept, Origin, cache-control");
        http_response_code(200);
        die;
    }
}

if ($_SERVER['REQUEST_METHOD'] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "method_not_allowed"]);
    die;
}

function print_Jsonresponse($dictionary = [], $error = "none")
{
    echo json_encode([
        "error" => $error,
        "command" => $_REQUEST['command'] ?? '',
        "response" => $dictionary
    ]);
    exit;
}

if (!isset($_REQUEST['command']) || $_REQUEST['command'] === null) {
    print_Jsonresponse([], "missing_command");
}

if (!isset($_REQUEST['data']) || $_REQUEST['data'] === null) {
    print_Jsonresponse([], "missing_data");
}

$response_json = json_decode($_REQUEST['data'], true);
if ($response_json === null) {
    print_Jsonresponse([], "invalid_json");
}

function anti_sql($value)
{
    global $conn;
    return mysqli_real_escape_string($conn, $value);
}

switch ($_REQUEST['command']) {
    case "register":
        if (
            empty($response_json["name"]) ||
            empty($response_json["username"]) ||
            empty($response_json["email"]) ||
            empty($response_json["password"])
        ) {
            print_Jsonresponse([], "missing_parameters");
        }

        $name = anti_sql($response_json["name"]);
        $username = anti_sql($response_json["username"]);
        $email = anti_sql($response_json["email"]);
        $password = anti_sql($response_json["password"]);

        $check_email_sql = "SELECT id FROM users WHERE email='$email'";
        $check_email_result = mysqli_query($conn, $check_email_sql);

        if (mysqli_num_rows($check_email_result) > 0) {
            print_Jsonresponse([], "email_already_exists");
        }

        $check_username_sql = "SELECT id FROM users WHERE username='$username'";
        $check_username_result = mysqli_query($conn, $check_username_sql);

        if (mysqli_num_rows($check_username_result) > 0) {
            print_Jsonresponse([], "username_already_exists");
        }

        $sql = "INSERT INTO users (name, username, email, password) 
                VALUES ('$name', '$username', '$email', '$password')";
        $result = mysqli_query($conn, $sql);

        if ($result) {
            print_Jsonresponse(["ok" => true, "message" => "User registered successfully"]);
        } else {
            print_Jsonresponse([], "insert_failed");
        }
        break;

    case "login":
        if (empty($response_json["username"]) || empty($response_json["password"])) {
            print_Jsonresponse([], "missing_parameters");
        }

        $username = anti_sql($response_json["username"]);
        $password = anti_sql($response_json["password"]);

        $sql = "SELECT * FROM users WHERE username='$username' AND password='$password'";
        $result = mysqli_query($conn, $sql);

        if (!$result || mysqli_num_rows($result) !== 1) {
            print_Jsonresponse([], "invalid_credentials");
        }

        $user = mysqli_fetch_assoc($result);

        print_Jsonresponse([
            "ok" => true,
            "message" => "Login successful",
            "user" => [
                "id" => $user["id"],
                "name" => $user["name"],
                "username" => $user["username"],
                "email" => $user["email"]
            ]
        ]);
        break;

    case "create_transaction":
        //  Required fields
        $required_fields = [
            "user_id", "customer_name", "container", "total_amount",
            "payment", "pos_name", "area_id", "unit_price",
            "image_base64", "days_counter", "item_id"
        ];

        foreach ($required_fields as $field) {
            if (!isset($response_json[$field]) || $response_json[$field] === "") {
                echo json_encode(["status" => "error", "message" => "missing_parameters: $field"]);
                exit;
            }
        }

        
        // Convert SVG path to full SVG XML
        $svg_path_data = $response_json["image_base64"];
        $svg_content = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'
            . '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">'
            . '<path d="' . $svg_path_data . '" fill="none" stroke="#000" stroke-width="2"/>'
            . '</svg>';


        // Save to a temp .svg file
        $temp_svg = tempnam(sys_get_temp_dir(), "svg_") . ".svg";
        file_put_contents($temp_svg, $svg_content);

        // Read and convert to base64
        $image_data = file_get_contents($temp_svg);
        
        // Optionally delete temp file
        unlink($temp_svg);
        
        //  Sanitize & assign variables
        $user_id        = (int)$response_json["user_id"];
        $customer_name  = $response_json["customer_name"];
        $container      = (int)$response_json["container"];
        $total_amount   = (float)$response_json["total_amount"];
        $payment        = (float)$response_json["payment"];
        $pos_name       = $response_json["pos_name"];
        $area_id        = (int)$response_json["area_id"];
        $unit_price     = (float)$response_json["unit_price"];
        $image_base64 = base64_encode($image_data);
        $days_counter   = (int)$response_json["days_counter"];
        $item_id        = (int)$response_json["item_id"];
        $notes          = isset($response_json["notes"]) ? $response_json["notes"] : "";
        $wc_swap        = isset($response_json["wc_swap"]) ? $response_json["wc_swap"] : 0;
        $isDeleted      = 0; // default

        //  Calculate balance
        $balance = $total_amount - $payment;
        if ($balance < 0) $balance = 0;

        //  Get total previous balance (balance + previous_balance from last transaction)
        $previous_balance = 0;
        $stmt = $conn->prepare("
            SELECT (balance + previous_balance) AS total_balance
            FROM transactions
            WHERE customer_name = ?
            ORDER BY id DESC
            LIMIT 1
        ");
        $stmt->bind_param("s", $customer_name);
        $stmt->execute();
        $stmt->bind_result($total_balance);
        if ($stmt->fetch()) {
            $previous_balance = $total_balance;
        }
        $stmt->close();

        //  Start transaction to ensure both inserts succeed
        $conn->begin_transaction();

        try {
            //  1) Insert into containers table
            $containers_remaining = $container;
            $stmt1 = $conn->prepare("
                INSERT INTO containers (containers, unit_price, total_amount, containers_remaining, item_id) 
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt1->bind_param("iddii", $container, $unit_price, $total_amount, $containers_remaining, $item_id);
            $stmt1->execute();
            $container_id = $stmt1->insert_id; //  get the inserted container_id
            $stmt1->close();

            //  2) Insert into transactions table (now storing container_id)
            
            $swap_container = $container;
            $stmt2 = $conn->prepare("
                INSERT INTO transactions (
                    user_id, customer_name, container_id, container, total_amount, payment, balance, previous_balance,
                    wc_swap, pos_name, area_id, unit_price, image_base64, swap_container,
                    days_counter, notes, isDeleted
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt2->bind_param(
                "isiiddddsisdsiisi",
                $user_id, $customer_name, $container_id, $container, $total_amount, $payment, $balance, $previous_balance,
                $wc_swap, $pos_name, $area_id, $unit_price, $image_base64, $swap_container,
                $days_counter, $notes, $isDeleted
            );
            $stmt2->execute();
            $stmt2->close();

            //  Commit transaction
            $conn->commit();
            echo json_encode(["status" => "success", "message" => "Transaction created successfully"]);

        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["status" => "error", "message" => "insert_failed", "error" => $e->getMessage()]);
        }

        break;

    case "search_customers":
        if (empty($response_json["query"])) {
            print_Jsonresponse(["customers" => []], "missing_parameters");
        }

        $query = anti_sql($response_json["query"]);
        $sql = "SELECT DISTINCT customer_name FROM transactions WHERE customer_name LIKE '%$query%' LIMIT 10";
        $result = mysqli_query($conn, $sql);

        $customers = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $customers[] = $row["customer_name"];
            }
        }

        print_Jsonresponse(["customers" => $customers]);
        break;

    case "fetch_transactions":
        $search = isset($response_json["search"]) ? anti_sql($response_json["search"]) : "";
        $area = isset($response_json["area"]) ? anti_sql($response_json["area"]) : "";

        $sql = "
            SELECT 
                t.id AS transactID,
                t.customer_name,
                t.area_id,
                a.name AS area_name,
                i.item_name,
                c.containers,
                t.total_amount,
                t.payment,
                (t.balance + t.previous_balance) AS balance,
                t.date_created
            FROM transactions t
            LEFT JOIN containers c ON t.container_id = c.id
            LEFT JOIN item i ON c.item_id = i.id
            LEFT JOIN areas a ON t.area_id = a.id
            WHERE balance > 0
        ";

        if (!empty($search)) {
            $sql .= " AND t.customer_name LIKE '%$search%'";
        }

        if (!empty($area)) {
            $sql .= " AND t.area_id = '$area'";
        }

        $sql .= " ORDER BY t.id DESC";

        $result = mysqli_query($conn, $sql);
        $transactions = [];

        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $transactions[] = $row;
            }
        }

        print_Jsonresponse(["transactions" => $transactions]);
        break;


    case "fetch_items":
        $stmt = $conn->prepare("SELECT id, item_name FROM item ORDER BY item_name ASC");
        $stmt->execute();
        $result = $stmt->get_result();

        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }

        print_Jsonresponse([
            "ok" => true,
            "items" => $items
        ]);
        break;

    case "fetch_areas":
        $stmt = $conn->prepare("SELECT id, `name` FROM areas WHERE active = 1 ORDER BY `name` ASC");
        $stmt->execute();
        $result = $stmt->get_result();

        $areas = [];
        while ($row = $result->fetch_assoc()) {
            $areas[] = $row;
        }

        print_Jsonresponse([
            "ok" => true,
            "areas" => $areas
        ]);
        break;



    default:
        print_Jsonresponse([], "invalid_command");
}
?>
