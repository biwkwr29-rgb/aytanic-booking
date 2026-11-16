<?php
/**
 * ร้านอายตานิค - Unified REST API for MySQL / phpMyAdmin (artanic)
 */

require_once __DIR__ . '/db.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// รับ payload จาก JSON body หรือ POST form
$rawInput = file_get_contents('php://input');
$jsonInput = json_decode($rawInput, true);
$data = is_array($jsonInput) ? $jsonInput : $_POST;

try {
    switch ($action) {
        // ==========================================
        // 1. ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล
        // ==========================================
        case 'status':
            $adminCount    = (int) $pdo->query("SELECT count(*) FROM admins")->fetchColumn();
            $customerCount = (int) $pdo->query("SELECT count(*) FROM customers")->fetchColumn();
            $serviceCount  = (int) $pdo->query("SELECT count(*) FROM services")->fetchColumn();
            $bookingCount  = (int) $pdo->query("SELECT count(*) FROM bookings")->fetchColumn();

            echo json_encode([
                'status'   => 'success',
                'database' => 'artanic',
                'connected'=> true,
                'counts'   => [
                    'admins'    => $adminCount,
                    'customers' => $customerCount,
                    'services'  => $serviceCount,
                    'bookings'  => $bookingCount
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 2. ดึงข้อมูลทั้งหมดของระบบ (สำหรับโหลดขึ้นเว็บ)
        // ==========================================
        case 'get_all':
            // Admins
            $stmt = $pdo->query("SELECT id, username, password, full_name as fullName, email, phone, role, created_at as createdAt FROM admins");
            $admins = $stmt->fetchAll();

            // Customers
            $stmt = $pdo->query("SELECT id, username, password, full_name as fullName, email, phone, gender, birth_date as birthDate, address, skin_notes as skinNotes, role, status, created_at as createdAt FROM customers ORDER BY id ASC");
            $customers = $stmt->fetchAll();

            // Services
            $stmt = $pdo->query("SELECT id, name, description, duration, price, icon, image, category, is_active as isActive FROM services WHERE is_active = 1 ORDER BY id ASC");
            $services = $stmt->fetchAll();

            // Bookings
            $stmt = $pdo->query("SELECT id, customer_id as customerId, service_id as serviceId, booking_date as date, booking_time as time, status, notes, created_at as createdAt FROM bookings ORDER BY booking_date DESC, booking_time ASC");
            $bookings = $stmt->fetchAll();

            // Queue Schedules
            $stmt = $pdo->query("SELECT id, schedule_date as date, schedule_time as time, max_slots as maxSlots, booked_slots as bookedSlots FROM queue_schedules ORDER BY schedule_date ASC, schedule_time ASC");
            $schedules = $stmt->fetchAll();

            // Service Usages
            $stmt = $pdo->query("SELECT id, booking_id as bookingId, customer_id as customerId, service_id as serviceId, usage_date as date, check_in_time as checkInTime, status, notes FROM service_usages ORDER BY usage_date DESC");
            $usages = $stmt->fetchAll();

            // Payments
            $stmt = $pdo->query("SELECT id, usage_id as usageId, customer_id as customerId, service_id as serviceId, amount, payment_date as date, method, status FROM payments ORDER BY payment_date DESC");
            $payments = $stmt->fetchAll();

            echo json_encode([
                'status'    => 'success',
                'database'  => 'artanic',
                'data'      => [
                    'admins'         => $admins,
                    'customers'      => $customers,
                    'services'       => $services,
                    'bookings'       => $bookings,
                    'queueSchedules' => $schedules,
                    'serviceUsages'  => $usages,
                    'payments'       => $payments
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 3. เข้าสู่ระบบ (Login)
        // ==========================================
        case 'login':
            $user_input = trim($data['username'] ?? '');
            $pass_input = trim($data['password'] ?? '');

            if (!$user_input || !$pass_input) {
                echo json_encode(['status' => 'error', 'message' => 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // เช็คใน admins
            $stmt = $pdo->prepare("SELECT id, username, password, full_name as fullName, email, phone, role FROM admins WHERE username = ?");
            $stmt->execute([$user_input]);
            $admin = $stmt->fetch();
            if ($admin && ($admin['password'] === $pass_input || password_verify($pass_input, $admin['password']))) {
                unset($admin['password']);
                echo json_encode(['status' => 'success', 'user' => $admin, 'role' => 'admin'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // เช็คใน customers
            $stmt = $pdo->prepare("SELECT id, username, password, full_name as fullName, email, phone, gender, birth_date as birthDate, address, skin_notes as skinNotes, role FROM customers WHERE username = ?");
            $stmt->execute([$user_input]);
            $cust = $stmt->fetch();
            if ($cust && ($cust['password'] === $pass_input || password_verify($pass_input, $cust['password']))) {
                unset($cust['password']);
                echo json_encode(['status' => 'success', 'user' => $cust, 'role' => 'customer'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            echo json_encode(['status' => 'error', 'message' => 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 4. สมัครสมาชิก (Register)
        // ==========================================
        case 'register':
            $username  = trim($data['username'] ?? '');
            $password  = trim($data['password'] ?? '');
            $fullName  = trim($data['fullName'] ?? '');
            $email     = trim($data['email'] ?? '');
            $phone     = trim($data['phone'] ?? '');
            $gender    = trim($data['gender'] ?? '');
            $address   = trim($data['address'] ?? '');

            if (!$username || !$password || !$fullName || !$email || !$phone) {
                echo json_encode(['status' => 'error', 'message' => 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // เช็คซ้ำ
            $chk = $pdo->prepare("SELECT id FROM customers WHERE username = ? OR email = ?");
            $chk->execute([$username, $email]);
            if ($chk->fetch()) {
                echo json_encode(['status' => 'error', 'message' => 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // สร้าง ID ลูกค้าใหม่ Cxxx
            $maxIdStmt = $pdo->query("SELECT id FROM customers WHERE id LIKE 'C%' ORDER BY id DESC LIMIT 1");
            $lastId = $maxIdStmt->fetchColumn();
            $num = $lastId ? (int) substr($lastId, 1) + 1 : 1;
            $newId = 'C' . str_pad($num, 3, '0', STR_PAD_LEFT);

            $stmt = $pdo->prepare("INSERT INTO customers (id, username, password, full_name, email, phone, gender, address, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'customer')");
            $stmt->execute([$newId, $username, $password, $fullName, $email, $phone, $gender, $address]);

            $newCust = [
                'id'        => $newId,
                'username'  => $username,
                'fullName'  => $fullName,
                'email'     => $email,
                'phone'     => $phone,
                'gender'    => $gender,
                'address'   => $address,
                'role'      => 'customer'
            ];

            echo json_encode(['status' => 'success', 'message' => 'สมัครสมาชิกสำเร็จ!', 'user' => $newCust], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 5. บันทึก / แก้ไขข้อมูลส่วนตัวลูกค้า (Save Profile)
        // ==========================================
        case 'save_profile':
            $id        = trim($data['id'] ?? '');
            $username  = trim($data['username'] ?? '');
            $fullName  = trim($data['fullName'] ?? '');
            $phone     = trim($data['phone'] ?? '');
            $email     = trim($data['email'] ?? '');
            $gender    = trim($data['gender'] ?? '');
            $birthDate = !empty($data['birthDate']) ? $data['birthDate'] : null;
            $address   = trim($data['address'] ?? '');
            $skinNotes = trim($data['skinNotes'] ?? '');
            $password  = trim($data['password'] ?? '');
            $status    = trim($data['status'] ?? 'active');

            if (!$id && !$username) {
                echo json_encode(['status' => 'error', 'message' => 'ไม่พบข้อมูลลูกค้ารายนี้'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $sql = "UPDATE customers SET 
                full_name = :full_name,
                phone = :phone,
                email = :email,
                gender = :gender,
                birth_date = :birth_date,
                address = :address,
                skin_notes = :skin_notes,
                status = :status";
            if (!empty($password)) {
                $sql .= ", password = :password";
            }
            $sql .= " WHERE id = :id OR username = :username";

            $stmt = $pdo->prepare($sql);
            $params = [
                'full_name'  => $fullName,
                'phone'      => $phone,
                'email'      => $email,
                'gender'     => $gender,
                'birth_date' => $birthDate,
                'address'    => $address,
                'skin_notes' => $skinNotes,
                'status'     => $status ?: 'active',
                'id'         => $id,
                'username'   => $username
            ];
            if (!empty($password)) {
                $params['password'] = $password;
            }
            $stmt->execute($params);

            echo json_encode(['status' => 'success', 'message' => 'บันทึกข้อมูลส่วนตัวลงฐานข้อมูล phpMyAdmin เรียบร้อยแล้ว!'], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 6. แอดมิน: จัดการลูกค้า (Add/Edit Customer)
        // ==========================================
        case 'save_customer':
            $editId    = trim($data['id'] ?? '');
            $username  = trim($data['username'] ?? '');
            $password  = trim($data['password'] ?? '');
            $fullName  = trim($data['fullName'] ?? '');
            $email     = trim($data['email'] ?? '');
            $phone     = trim($data['phone'] ?? '');
            $gender    = trim($data['gender'] ?? '');
            $birthDate = !empty($data['birthDate']) ? $data['birthDate'] : null;
            $address   = trim($data['address'] ?? '');
            $skinNotes = trim($data['skinNotes'] ?? '');

            if (!$fullName || !$email || !$phone || !$username) {
                echo json_encode(['status' => 'error', 'message' => 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($editId) {
                // อัปเดตข้อมูลลูกค้าเดิม
                $sql = "UPDATE customers SET 
                    username = :username,
                    full_name = :full_name,
                    email = :email,
                    phone = :phone,
                    gender = :gender,
                    birth_date = :birth_date,
                    address = :address,
                    skin_notes = :skin_notes";
                $params = [
                    'username'   => $username,
                    'full_name'  => $fullName,
                    'email'      => $email,
                    'phone'      => $phone,
                    'gender'     => $gender,
                    'birth_date' => $birthDate,
                    'address'    => $address,
                    'skin_notes' => $skinNotes,
                    'id'         => $editId
                ];
                if ($password) {
                    $sql .= ", password = :password";
                    $params['password'] = $password;
                }
                $sql .= " WHERE id = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);

                echo json_encode(['status' => 'success', 'message' => 'แก้ไขข้อมูลลูกค้าในฐานข้อมูลสำเร็จ'], JSON_UNESCAPED_UNICODE);
            } else {
                // เพิ่มลูกค้าใหม่
                $chk = $pdo->prepare("SELECT id FROM customers WHERE username = ?");
                $chk->execute([$username]);
                if ($chk->fetch()) {
                    echo json_encode(['status' => 'error', 'message' => 'ชื่อผู้ใช้นี้มีในระบบแล้ว'], JSON_UNESCAPED_UNICODE);
                    exit;
                }

                $maxIdStmt = $pdo->query("SELECT id FROM customers WHERE id LIKE 'C%' ORDER BY id DESC LIMIT 1");
                $lastId = $maxIdStmt->fetchColumn();
                $num = $lastId ? (int) substr($lastId, 1) + 1 : 1;
                $newId = 'C' . str_pad($num, 3, '0', STR_PAD_LEFT);

                $stmt = $pdo->prepare("INSERT INTO customers (id, username, password, full_name, email, phone, gender, birth_date, address, skin_notes, role) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'customer')");
                $stmt->execute([$newId, $username, $password ?: 'pass123', $fullName, $email, $phone, $gender, $birthDate, $address, $skinNotes]);

                echo json_encode(['status' => 'success', 'message' => 'เพิ่มข้อมูลลูกค้าใหม่ลงฐานข้อมูลสำเร็จ!'], JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'delete_customer':
            $delId = trim($data['id'] ?? '');
            if (!$delId) {
                echo json_encode(['status' => 'error', 'message' => 'ไม่พบรหัสลูกค้าที่ต้องการลบ'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM customers WHERE id = ?");
            $stmt->execute([$delId]);
            echo json_encode(['status' => 'success', 'message' => 'ลบข้อมูลลูกค้าจากฐานข้อมูลสำเร็จ'], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 7. จัดการข้อมูลการจองคิว (Bookings)
        // ==========================================
        case 'save_booking':
            $id         = trim($data['id'] ?? '');
            $customerId = trim($data['customerId'] ?? '');
            $serviceId  = trim($data['serviceId'] ?? '');
            $date       = trim($data['date'] ?? '');
            $time       = trim($data['time'] ?? '');
            $status     = trim($data['status'] ?? 'pending');
            $notes      = trim($data['notes'] ?? '');

            if (!$customerId || !$serviceId || !$date || !$time) {
                echo json_encode(['status' => 'error', 'message' => 'ข้อมูลการจองไม่ครบถ้วน'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (!$id) {
                $maxB = $pdo->query("SELECT id FROM bookings WHERE id LIKE 'B%' ORDER BY id DESC LIMIT 1")->fetchColumn();
                $num = $maxB ? (int) substr($maxB, 1) + 1 : 1;
                $id = 'B' . str_pad($num, 3, '0', STR_PAD_LEFT);
            }

            $sql = "INSERT INTO bookings (id, customer_id, service_id, booking_date, booking_time, status, notes)
                    VALUES (:id, :cust, :svc, :dt, :tm, :st, :nt)
                    ON DUPLICATE KEY UPDATE 
                        service_id = VALUES(service_id),
                        booking_date = VALUES(booking_date),
                        booking_time = VALUES(booking_time),
                        status = VALUES(status),
                        notes = VALUES(notes)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                'id'   => $id,
                'cust' => $customerId,
                'svc'  => $serviceId,
                'dt'   => $date,
                'tm'   => $time,
                'st'   => $status,
                'nt'   => $notes
            ]);

            // อัปเดตสถิติคิวจอง
            $pdo->prepare("UPDATE queue_schedules SET booked_slots = booked_slots + 1 WHERE schedule_date = ? AND schedule_time = ?")->execute([$date, $time]);

            echo json_encode(['status' => 'success', 'message' => 'บันทึกการจองคิวลงฐานข้อมูลเรียบร้อยแล้ว!', 'bookingId' => $id], JSON_UNESCAPED_UNICODE);
            break;

        case 'cancel_booking':
            $bId = trim($data['id'] ?? '');
            $stmt = $pdo->prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?");
            $stmt->execute([$bId]);
            echo json_encode(['status' => 'success', 'message' => 'ยกเลิกการจองคิวเรียบร้อยแล้ว'], JSON_UNESCAPED_UNICODE);
            break;

        case 'delete_booking':
            $bId = trim($data['id'] ?? '');
            if ($bId) {
                $stmt = $pdo->prepare("DELETE FROM bookings WHERE id = ?");
                $stmt->execute([$bId]);
            }
            echo json_encode(['status' => 'success', 'message' => 'ลบรายการจองคิวเรียบร้อยแล้ว'], JSON_UNESCAPED_UNICODE);
            break;

        case 'clear_cancelled_bookings':
            $pdo->query("DELETE FROM bookings WHERE status = 'cancelled'");
            echo json_encode(['status' => 'success', 'message' => 'ลบรายการที่ยกเลิกทั้งหมดเรียบร้อย'], JSON_UNESCAPED_UNICODE);
            break;

        case 'clear_dummy_bookings':
            $pdo->query("DELETE FROM bookings WHERE customer_id NOT IN (SELECT id FROM customers) OR status = 'cancelled'");
            echo json_encode(['status' => 'success', 'message' => 'ล้างข้อมูลจำลองเรียบร้อย'], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 8. จัดการโปรแกรมบริการ (Services)
        // ==========================================
        case 'save_service':
            $id          = trim($data['id'] ?? '');
            $name        = trim($data['name'] ?? '');
            $description = trim($data['description'] ?? '');
            $duration    = (int) ($data['duration'] ?? 60);
            $price       = (float) ($data['price'] ?? 0);
            $icon        = trim($data['icon'] ?? 'fa-spa');
            $image       = trim($data['image'] ?? '');
            $category    = trim($data['category'] ?? 'facial');

            if (!$name || $price <= 0) {
                echo json_encode(['status' => 'error', 'message' => 'กรุณาระบุชื่อบริการและราคาให้ถูกต้อง'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (!$id) {
                $maxS = $pdo->query("SELECT id FROM services WHERE id LIKE 'S%' ORDER BY id DESC LIMIT 1")->fetchColumn();
                $num = $maxS ? (int) substr($maxS, 1) + 1 : 1;
                $id = 'S' . str_pad($num, 3, '0', STR_PAD_LEFT);
            }

            $sql = "INSERT INTO services (id, name, description, duration, price, icon, image, category)
                    VALUES (:id, :name, :desc, :dur, :price, :icon, :image, :cat)
                    ON DUPLICATE KEY UPDATE 
                        name = VALUES(name),
                        description = VALUES(description),
                        duration = VALUES(duration),
                        price = VALUES(price),
                        icon = VALUES(icon),
                        image = VALUES(image),
                        category = VALUES(category)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                'id'    => $id,
                'name'  => $name,
                'desc'  => $description,
                'dur'   => $duration,
                'price' => $price,
                'icon'  => $icon,
                'image' => $image,
                'cat'   => $category
            ]);

            echo json_encode(['status' => 'success', 'message' => 'บันทึกโปรแกรมบริการลงฐานข้อมูลเรียบร้อยแล้ว'], JSON_UNESCAPED_UNICODE);
            break;

        case 'delete_service':
            $sId = trim($data['id'] ?? '');
            $stmt = $pdo->prepare("DELETE FROM services WHERE id = ?");
            $stmt->execute([$sId]);
            echo json_encode(['status' => 'success', 'message' => 'ลบโปรแกรมบริการเรียบร้อยแล้ว'], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 9. บันทึกการเข้าใช้บริการจริง (Service Usage)
        // ==========================================
        case 'save_usage':
            $id          = trim($data['id'] ?? '');
            $bookingId   = trim($data['bookingId'] ?? '');
            $customerId  = trim($data['customerId'] ?? '');
            $serviceId   = trim($data['serviceId'] ?? '');
            $date        = trim($data['date'] ?? date('Y-m-d'));
            $checkInTime = trim($data['checkInTime'] ?? date('H:i'));
            $status      = trim($data['status'] ?? 'completed');
            $notes       = trim($data['notes'] ?? '');

            if (!$customerId || !$serviceId) {
                echo json_encode(['status' => 'error', 'message' => 'ข้อมูลไม่ครบถ้วน'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (!$id) {
                $maxU = $pdo->query("SELECT id FROM service_usages WHERE id LIKE 'U%' ORDER BY id DESC LIMIT 1")->fetchColumn();
                $num = $maxU ? (int) substr($maxU, 1) + 1 : 1;
                $id = 'U' . str_pad($num, 3, '0', STR_PAD_LEFT);
            }

            $sql = "INSERT INTO service_usages (id, booking_id, customer_id, service_id, usage_date, check_in_time, status, notes)
                    VALUES (:id, :bid, :cid, :sid, :dt, :chk, :st, :nt)
                    ON DUPLICATE KEY UPDATE 
                        status = VALUES(status),
                        notes = VALUES(notes)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                'id'  => $id,
                'bid' => $bookingId,
                'cid' => $customerId,
                'sid' => $serviceId,
                'dt'  => $date,
                'chk' => $checkInTime,
                'st'  => $status,
                'nt'  => $notes
            ]);

            // อัปเดตสถานะ booking ให้เป็น completed ถ้ามี
            if ($bookingId) {
                $pdo->prepare("UPDATE bookings SET status = 'completed' WHERE id = ?")->execute([$bookingId]);
            }

            echo json_encode(['status' => 'success', 'message' => 'บันทึกการเข้าใช้บริการลงฐานข้อมูลสำเร็จ', 'usageId' => $id], JSON_UNESCAPED_UNICODE);
            break;

        // ==========================================
        // 10. บันทึกการชำระเงิน (Payments)
        // ==========================================
        case 'save_payment':
            $id         = trim($data['id'] ?? '');
            $usageId    = trim($data['usageId'] ?? '');
            $customerId = trim($data['customerId'] ?? '');
            $serviceId  = trim($data['serviceId'] ?? '');
            $amount     = (float) ($data['amount'] ?? 0);
            $date       = trim($data['date'] ?? date('Y-m-d'));
            $method     = trim($data['method'] ?? 'cash');
            $status     = trim($data['status'] ?? 'paid');

            if (!$id) {
                $maxP = $pdo->query("SELECT id FROM payments WHERE id LIKE 'P%' ORDER BY id DESC LIMIT 1")->fetchColumn();
                $num = $maxP ? (int) substr($maxP, 1) + 1 : 1;
                $id = 'P' . str_pad($num, 3, '0', STR_PAD_LEFT);
            }

            $sql = "INSERT INTO payments (id, usage_id, customer_id, service_id, amount, payment_date, method, status)
                    VALUES (:id, :uid, :cid, :sid, :amt, :dt, :met, :st)
                    ON DUPLICATE KEY UPDATE 
                        amount = VALUES(amount),
                        method = VALUES(method),
                        status = VALUES(status)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                'id'  => $id,
                'uid' => $usageId,
                'cid' => $customerId,
                'sid' => $serviceId,
                'amt' => $amount,
                'dt'  => $date,
                'met' => $method,
                'st'  => $status
            ]);

            echo json_encode(['status' => 'success', 'message' => 'บันทึกการชำระเงินลงฐานข้อมูลสำเร็จ'], JSON_UNESCAPED_UNICODE);
            break;

        default:
            echo json_encode(['status' => 'error', 'message' => 'ไม่พบ Action ที่เรียก: ' . htmlspecialchars($action)], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
