<?php
/**
 * ร้านอายตานิค - Database Connection (MySQL / phpMyAdmin)
 * ฐานข้อมูล: artanic
 */

// เปิดการรายงาน error สำหรับดีบัก
error_reporting(E_ALL);
ini_set('display_errors', 0);

// กำหนด CORS Headers เพื่อให้เรียกใช้งานได้ทั้งจาก http://localhost และ file:///
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host     = '127.0.0.1';
$port     = 3306;
$dbname   = 'artanic';
$username = 'root';
$password = '';
$charset  = 'utf8mb4';

$dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'เชื่อมต่อฐานข้อมูล MySQL ไม่สำเร็จ: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
