<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

// รับข้อมูล JSON ที่ส่งมาจากหน้าเว็บ
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['status' => 'error', 'message' => 'ไม่พบข้อมูลที่ส่งมา']);
    exit;
}

$username   = $data['username'] ?? '';
$full_name  = $data['fullName'] ?? '';
$phone      = $data['phone'] ?? '';
$email      = $data['email'] ?? '';
$gender     = $data['gender'] ?? '';
$birth_date = !empty($data['birthDate']) ? $data['birthDate'] : null;
$address    = $data['address'] ?? '';
$skin_notes = $data['skinNotes'] ?? '';

try {
    // บันทึกข้อมูลลงตาราง customers ในฐานข้อมูล artanic
    $sql = "INSERT INTO customers (username, full_name, phone, email, gender, birth_date, address, skin_notes) 
            VALUES (:username, :full_name, :phone, :email, :gender, :birth_date, :address, :skin_notes)
            ON DUPLICATE KEY UPDATE 
                full_name = VALUES(full_name),
                phone = VALUES(phone),
                email = VALUES(email),
                gender = VALUES(gender),
                birth_date = VALUES(birth_date),
                address = VALUES(address),
                skin_notes = VALUES(skin_notes)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'username'   => $username,
        'full_name'  => $full_name,
        'phone'      => $phone,
        'email'      => $email,
        'gender'     => $gender,
        'birth_date' => $birth_date,
        'address'    => $address,
        'skin_notes' => $skin_notes
    ]);

    echo json_encode(['status' => 'success', 'message' => 'บันทึกข้อมูลลงฐานข้อมูลเรียบร้อยแล้ว!']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()]);
}
?>