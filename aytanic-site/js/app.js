/* ========================================
   ร้านอายตานิค - Main Application JavaScript
   ======================================== */

// ========= Initialize Sample Data =========
function initSampleData() {
    // Customers
    if (!localStorage.getItem('customers')) {
        const customers = [
            { id: 'C001', fullName: 'สมหญิง แสนสวย', email: 'somying@email.com', phone: '081-234-5678', username: 'somying', password: 'pass123', role: 'customer', gender: 'female', birthDate: '1996-05-12', address: 'อ.เมืองลพบุรี จ.ลพบุรี', skinNotes: 'ผิวแพ้ง่าย ไวต่อสารเคมี', createdAt: '2026-09-01' },
            { id: 'C002', fullName: 'นิตยา รักสวย', email: 'nittaya@email.com', phone: '082-345-6789', username: 'nittaya', password: 'pass123', role: 'customer', gender: 'female', birthDate: '1994-08-20', address: 'อ.พัฒนานิคม จ.ลพบุรี', skinNotes: 'ผิวมัน เป็นสิวง่าย', createdAt: '2026-09-05' },
            { id: 'C003', fullName: 'วิภา ดีงาม', email: 'vipa@email.com', phone: '083-456-7890', username: 'vipa', password: 'pass123', role: 'customer', gender: 'female', birthDate: '1998-11-04', address: 'อ.ท่าวุ้ง จ.ลพบุรี', skinNotes: 'ผิวผสม ปกติ', createdAt: '2026-09-10' },
            { id: 'C004', fullName: 'พรทิพย์ สุขใจ', email: 'porntip@email.com', phone: '084-567-8901', username: 'porntip', password: 'pass123', role: 'customer', gender: 'female', birthDate: '1992-02-18', address: 'อ.เมืองลพบุรี จ.ลพบุรี', skinNotes: 'ผิวแห้ง ต้องการความชุ่มชื้น', createdAt: '2026-09-15' },
            { id: 'C005', fullName: 'จันทร์เพ็ญ ผ่องใส', email: 'chanpen@email.com', phone: '085-678-9012', username: 'chanpen', password: 'pass123', role: 'customer', gender: 'female', birthDate: '1995-07-25', address: 'อ.บ้านหมี่ จ.ลพบุรี', skinNotes: 'ไม่มีประวัติแพ้', createdAt: '2026-09-20' },
        ];
        localStorage.setItem('customers', JSON.stringify(customers));
    }

    // Admin user
    if (!localStorage.getItem('admins')) {
        const admins = [
            { id: 'A001', fullName: 'จัดการสิทธิ์ผู้เข้าใช้งาน', email: 'admin@artanic.com', phone: '036-123-456', username: 'admin', password: 'admin123', role: 'admin', createdAt: '2026-01-01' }
        ];
        localStorage.setItem('admins', JSON.stringify(admins));
    } else {
        // อัปเดตชื่อผู้ดูแลระบบใน admins ให้เป็น จัดการสิทธิ์ผู้เข้าใช้งาน
        let curAdmins = JSON.parse(localStorage.getItem('admins') || '[]');
        let updated = false;
        curAdmins = curAdmins.map(a => {
            if (a.role === 'admin' && (!a.fullName || a.fullName === 'ผู้ดูแลระบบ' || a.fullName.includes('ผู้ดูแลระบบ'))) {
                a.fullName = 'จัดการสิทธิ์ผู้เข้าใช้งาน';
                updated = true;
            }
            return a;
        });
        if (updated) {
            localStorage.setItem('admins', JSON.stringify(curAdmins));
        }
    }

    // อัปเดต currentUser ที่ล็อกอินอยู่หากมีชื่อเดิม
    try {
        let curUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (curUser && curUser.role === 'admin' && (!curUser.fullName || curUser.fullName === 'ผู้ดูแลระบบ' || curUser.fullName.includes('ผู้ดูแลระบบ'))) {
            curUser.fullName = 'จัดการสิทธิ์ผู้เข้าใช้งาน';
            localStorage.setItem('currentUser', JSON.stringify(curUser));
        }
    } catch(e) {}

    // Services
    const defaultServices = [
        { id: 'S001', name: 'นวดหน้า ดีพคลีนซิ่ง', description: 'ทำความสะอาดผิวหน้าอย่างล้ำลึก พร้อมมาส์กบำรุง ช่วยให้ผิวกระจ่างใส', duration: 60, price: 800, icon: 'fa-spa', image: 'images/facial-cleansing.jpg', category: 'facial' },
        { id: 'S002', name: 'นวดตัวอโรม่า', description: 'นวดผ่อนคลายด้วยน้ำมันหอมระเหย ช่วยลดความเครียด ผ่อนคลายกล้ามเนื้อ', duration: 90, price: 1200, icon: 'fa-hand-sparkles', image: 'images/body-massage.jpg', category: 'massage' },
        { id: 'S003', name: 'ทำเล็บเจล', description: 'ทำเล็บเจลสวยงาม ทนทาน พร้อมออกแบบลวดลายตามใจ', duration: 45, price: 500, icon: 'fa-paint-brush', image: 'images/gel-nails.jpg', category: 'nail' },
        { id: 'S004', name: 'ทรีทเมนท์ผม', description: 'บำรุงเส้นผมเสียแห้งกรอบ ให้กลับมานุ่มสลวยเงางาม', duration: 60, price: 900, icon: 'fa-cut', image: 'images/hair-treatment.jpg', category: 'hair' },
        { id: 'S005', name: 'สครับผิวกาย', description: 'ขัดผิวกายด้วยสครับธรรมชาติ ผิวนุ่มเนียน กระชับ สดใส', duration: 45, price: 700, icon: 'fa-leaf', image: 'images/body-scrub.jpg', category: 'body' },
        { id: 'S006', name: 'แว็กซ์ขนหน้า', description: 'กำจัดขนบนใบหน้าด้วยแว็กซ์คุณภาพ อ่อนโยนต่อผิว', duration: 30, price: 350, icon: 'fa-magic', image: 'images/face-waxing.jpg', category: 'facial' },
        { id: 'S007', name: 'ต่อขนตา', description: 'ต่อขนตาเส้นต่อเส้น ดูเป็นธรรมชาติ ตาโตสวยมีเสน่ห์', duration: 90, price: 1500, icon: 'fa-eye', image: 'images/eyelash.jpg', category: 'eye' },
        { id: 'S008', name: 'แพ็คเกจ VIP สปาเต็มตัว', description: 'แพ็คเกจครบวงจร นวดหน้า นวดตัว สครับ มาส์กทั่วตัว', duration: 180, price: 3500, icon: 'fa-crown', image: 'images/vip-spa.jpg', category: 'package' },
    ];

    const existingServices = JSON.parse(localStorage.getItem('services') || '[]');
    if (!localStorage.getItem('services') || existingServices.length === 0) {
        localStorage.setItem('services', JSON.stringify(defaultServices));
    } else {
        // Auto-patch images if missing
        let updated = false;
        existingServices.forEach(s => {
            const def = defaultServices.find(d => d.id === s.id);
            if (def && (!s.image || s.image !== def.image)) {
                s.image = def.image;
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem('services', JSON.stringify(existingServices));
        }
    }

    // Bookings
    if (!localStorage.getItem('bookings')) {
        localStorage.setItem('bookings', JSON.stringify([]));
    }

    // Queue Schedules
    if (!localStorage.getItem('queueSchedules')) {
        const schedules = [];
        const today = new Date();
        for (let d = 0; d < 7; d++) {
            const date = new Date(today.getTime() + d * 86400000);
            const dateStr = formatDateISO(date);
            const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
            times.forEach(time => {
                schedules.push({ id: generateId(), date: dateStr, time: time, maxSlots: 2, bookedSlots: 0 });
            });
        }
        localStorage.setItem('queueSchedules', JSON.stringify(schedules));
    }

    // Service Usages
    if (!localStorage.getItem('serviceUsages')) {
        const usages = [
            { id: 'U001', bookingId: 'B004', customerId: 'C004', serviceId: 'S003', date: formatDateISO(new Date(new Date().getTime() - 86400000)), checkInTime: '10:55', status: 'completed' },
            { id: 'U002', bookingId: 'B005', customerId: 'C005', serviceId: 'S008', date: formatDateISO(new Date(new Date().getTime() - 172800000)), checkInTime: '08:50', status: 'completed' },
        ];
        localStorage.setItem('serviceUsages', JSON.stringify(usages));
    }

    // Payments
    if (!localStorage.getItem('payments')) {
        const payments = [
            { id: 'P001', usageId: 'U001', customerId: 'C004', serviceId: 'S003', amount: 500, date: formatDateISO(new Date(new Date().getTime() - 86400000)), method: 'cash', status: 'paid' },
            { id: 'P002', usageId: 'U002', customerId: 'C005', serviceId: 'S008', amount: 3500, date: formatDateISO(new Date(new Date().getTime() - 172800000)), method: 'transfer', status: 'paid' },
        ];
        localStorage.setItem('payments', JSON.stringify(payments));
    }
}

// ========= Utility Functions =========
function formatDateISO(date) {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const parts = dateStr.split('-');
    const day = parseInt(parts[2]);
    const month = months[parseInt(parts[1]) - 1];
    const year = parseInt(parts[0]) + 543;
    return `${day} ${month} ${year}`;
}

function formatCurrency(amount) {
    return '฿' + Number(amount).toLocaleString('th-TH');
}

function generateId() {
    return 'ID' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ========= Date Selector Helper for วัน/เดือน/ปี (ว/ด/ป ค.ศ. ปัจจุบันไล่ไปอดีต) =========
function initBirthDateSelectors(daySelectId, monthSelectId, yearSelectId, hiddenInputId) {
    const daySelect = document.getElementById(daySelectId);
    const monthSelect = document.getElementById(monthSelectId);
    const yearSelect = document.getElementById(yearSelectId);
    const hiddenInput = document.getElementById(hiddenInputId);

    if (!daySelect || !monthSelect || !yearSelect || !hiddenInput) return;

    // Populate Months (01 - 12)
    const thMonths = [
        'มกราคม (01)', 'กุมภาพันธ์ (02)', 'มีนาคม (03)', 'เมษายน (04)',
        'พฤษภาคม (05)', 'มิถุนายน (06)', 'กรกฎาคม (07)', 'สิงหาคม (08)',
        'กันยายน (09)', 'ตุลาคม (10)', 'พฤศจิกายน (11)', 'ธันวาคม (12)'
    ];
    monthSelect.innerHTML = '<option value="">-- เดือน --</option>';
    thMonths.forEach((m, idx) => {
        const val = String(idx + 1).padStart(2, '0');
        monthSelect.innerHTML += `<option value="${val}">${m}</option>`;
    });

    // Populate Years: ค.ศ. ปัจจุบัน ไล่ไปอดีต (Current A.D. year descending to past)
    let currentYear = new Date().getFullYear();
    if (currentYear > 2400) currentYear -= 543; // Safety check for Buddhist Era year in system
    yearSelect.innerHTML = '<option value="">-- ปี (ค.ศ.) --</option>';
    for (let y = currentYear; y >= currentYear - 100; y--) {
        yearSelect.innerHTML += `<option value="${y}">ค.ศ. ${y} (${y + 543})</option>`;
    }

    // Function to calculate and populate days based on selected month & year
    function updateDayOptions() {
        const selectedDay = daySelect.value;
        const y = parseInt(yearSelect.value) || 2024;
        const m = parseInt(monthSelect.value) || 0;
        let daysInMonth = 31;
        if (m > 0) {
            daysInMonth = new Date(y, m, 0).getDate();
        }

        let options = '<option value="">-- วัน --</option>';
        for (let d = 1; d <= daysInMonth; d++) {
            const val = String(d).padStart(2, '0');
            options += `<option value="${val}">${d}</option>`;
        }
        daySelect.innerHTML = options;

        if (selectedDay && parseInt(selectedDay, 10) <= daysInMonth) {
            daySelect.value = selectedDay;
        }
        updateHiddenValue();
    }

    function updateHiddenValue() {
        const y = yearSelect.value;
        const m = monthSelect.value;
        const d = daySelect.value;
        if (y && m && d) {
            hiddenInput.value = `${y}-${m}-${d}`;
        } else {
            hiddenInput.value = '';
        }
    }

    updateDayOptions();

    monthSelect.addEventListener('change', updateDayOptions);
    yearSelect.addEventListener('change', updateDayOptions);
    daySelect.addEventListener('change', updateHiddenValue);
}

function setBirthDateSelectors(daySelectId, monthSelectId, yearSelectId, hiddenInputId, dateStr) {
    const daySelect = document.getElementById(daySelectId);
    const monthSelect = document.getElementById(monthSelectId);
    const yearSelect = document.getElementById(yearSelectId);
    const hiddenInput = document.getElementById(hiddenInputId);

    if (!daySelect || !monthSelect || !yearSelect || !hiddenInput) return;

    hiddenInput.value = dateStr || '';

    if (dateStr && typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length >= 3) {
            let y = parseInt(parts[0], 10);
            if (y > 2400) y -= 543;
            const yStr = String(y);
            const mStr = String(parseInt(parts[1], 10)).padStart(2, '0');
            const dStr = String(parseInt(parts[2], 10)).padStart(2, '0');

            yearSelect.value = yStr;
            monthSelect.value = mStr;

            const daysInMonth = new Date(y, parseInt(parts[1], 10), 0).getDate();
            let options = '<option value="">-- วัน --</option>';
            for (let d = 1; d <= daysInMonth; d++) {
                const val = String(d).padStart(2, '0');
                options += `<option value="${val}">${d}</option>`;
            }
            daySelect.innerHTML = options;
            daySelect.value = dStr;

            hiddenInput.value = `${yStr}-${mStr}-${dStr}`;
            return;
        }
    }

    yearSelect.value = '';
    monthSelect.value = '';
    daySelect.value = '';
}


// ========= Toast Notifications =========
function showNotification(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const iconMap = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${iconMap[type] || iconMap.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100px)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ========= Auth Functions =========
function login(username, password) {
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) {
        const role = admin.role || 'admin';
        localStorage.setItem('currentUser', JSON.stringify({ ...admin, role: role }));
        return { success: true, user: admin, role: role };
    }
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find(c => c.username === username && c.password === password);
    if (customer) {
        const role = customer.role || 'customer';
        localStorage.setItem('currentUser', JSON.stringify({ ...customer, role: role }));
        return { success: true, user: customer, role: role };
    }
    return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = window.location.pathname.includes('/admin/') ? '../login.html' : 'login.html';
}

function register(data) {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    if (customers.find(c => c.username === data.username)) {
        return { success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' };
    }
    if (customers.find(c => c.email === data.email)) {
        return { success: false, message: 'อีเมลนี้ถูกใช้แล้ว' };
    }
    const newCustomer = {
        id: 'C' + String(customers.length + 1).padStart(3, '0'),
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        gender: data.gender || '',
        address: data.address || '',
        username: data.username,
        password: data.password,
        role: 'customer',
        createdAt: formatDateISO(new Date())
    };
    customers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customers));
    return { success: true, user: newCustomer };
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

// ========= Navigation =========
function initNavigation() {
    // Scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    // Mobile toggle
    const toggle = document.querySelector('.navbar-toggle');
    const menu = document.querySelector('.navbar-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => menu.classList.toggle('open'));
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                menu.classList.remove('open');
            }
        });
    }

    // Active state
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });

    // Update nav based on login
    updateNavAuth();

    // กำจัดทุกลิงก์ my-bookings.html ออกจาก DOM ทันที
    document.querySelectorAll('a[href*="my-bookings.html"]').forEach(el => el.remove());
}

function updateNavAuth() {
    const navMenu = document.getElementById('navMenu');
    const user = getCurrentUser();

    // Dynamic hero buttons on homepage
    const heroButtons = document.getElementById('heroAuthButtons');
    if (heroButtons) {
        if (user) {
            if (user.role === 'admin') {
                heroButtons.innerHTML = `
                    <a href="admin/dashboard.html" class="btn btn-primary"><i class="fas fa-store"></i> ระบบจัดการร้าน (Admin)</a>
                    <a href="access-rights.html" class="btn btn-secondary"><i class="fas fa-shield-halved"></i> จัดการสิทธิ์ผู้เข้าใช้งาน</a>
                `;
            } else {
                heroButtons.innerHTML = `
                    <a href="booking.html" class="btn btn-primary" style="background:linear-gradient(135deg,#e11d48,#f43f5e);border-color:#e11d48;"><i class="fas fa-calendar-plus"></i> จองคิวใช้บริการ</a>
                    <a href="queue-schedule.html" class="btn btn-secondary"><i class="fas fa-calendar-alt"></i> ดูตารางคิว & สถานะคิว</a>
                `;
            }
        } else {
            heroButtons.innerHTML = `
                <a href="register.html" class="btn btn-primary"><i class="fas fa-user-plus"></i> สมัครสมาชิก</a>
                <a href="login.html" class="btn btn-secondary"><i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ</a>
            `;
        }
    }

    if (!navMenu) return;

    const isInAdmin = window.location.pathname.includes('/admin/');
    const prefix = isInAdmin ? '../' : '';
    const currentFile = window.location.pathname.split('/').pop() || 'home.html';
    const isAct = (file) => (currentFile === file || (file === 'home.html' && currentFile === 'index.html') ? 'active' : '');

    if (user && user.role === 'customer') {
        // เรียงตามคำขอ: หน้าแรก - ข้อมูลลูกค้า - โปรแกรมบริการ - จองคิว - ตารางคิว
        navMenu.innerHTML = `
            <a href="${prefix}home.html" class="${isAct('home.html')}" style="white-space:nowrap !important;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-home"></i> หน้าแรก</a>
            <a href="${prefix}profile.html" class="${isAct('profile.html')}" style="white-space:nowrap !important;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-id-card"></i> ข้อมูลลูกค้า</a>
            <a href="${prefix}services.html" class="${isAct('services.html')}" style="white-space:nowrap !important;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-concierge-bell"></i> โปรแกรมบริการ</a>
            <a href="${prefix}booking.html" class="${isAct('booking.html')}" style="white-space:nowrap !important;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-calendar-plus"></i> จองคิว</a>
            <a href="${prefix}queue-schedule.html" class="${isAct('queue-schedule.html')}" style="white-space:nowrap !important;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-calendar-alt"></i> ตารางคิว</a>
            <a href="#" onclick="logout();return false;" style="color:var(--danger);margin-left:auto;white-space:nowrap !important;display:inline-flex;align-items:center;gap:4px;font-size:0.82rem;padding-left:6px;" title="ออกจากระบบ"><i class="fas fa-sign-out-alt"></i> ออกจากระบบ</a>
        `;
    } else if (user && user.role === 'admin') {
        // เมนูของแอดมิน: หน้าแรก, ระบบจัดการร้าน, จัดการสิทธิ์ผู้เข้าใช้งาน, ออกจากระบบ
        navMenu.innerHTML = `
            <a href="${prefix}home.html" class="${isAct('home.html')}" style="white-space:nowrap !important;word-break:keep-all !important;display:inline-flex;align-items:center;gap:4px;flex-shrink:0;"><i class="fas fa-home"></i> หน้าแรก</a>
            <a href="${prefix}admin/dashboard.html" class="${isInAdmin ? 'active' : ''}" style="white-space:nowrap !important;word-break:keep-all !important;display:inline-flex;align-items:center;gap:4px;flex-shrink:0;"><i class="fas fa-store"></i> ระบบจัดการร้าน</a>
            <a href="${prefix}admin/permissions.html" class="${isAct('permissions.html')}" style="color:var(--accent);font-size:0.86rem;margin-left:auto;white-space:nowrap !important;word-break:keep-all !important;display:inline-flex;align-items:center;gap:6px;font-weight:600;padding-left:8px;text-decoration:none;" title="จัดการสิทธิ์ผู้เข้าใช้งาน">
                <i class="fas fa-shield-alt"></i> จัดการสิทธิ์ผู้เข้าใช้งาน
            </a>
            <a href="#" onclick="logout();return false;" style="color:var(--danger);white-space:nowrap !important;word-break:keep-all !important;display:inline-flex;align-items:center;gap:4px;flex-shrink:0;font-size:0.85rem;" title="ออกจากระบบ"><i class="fas fa-sign-out-alt"></i> ออกจากระบบ</a>
        `;
    } else {
        // ยังไม่ได้เข้าสู่ระบบ
        navMenu.innerHTML = `
            <a href="${prefix}home.html" class="${isAct('home.html')}"><i class="fas fa-home"></i> หน้าแรก</a>
            <a href="${prefix}profile.html" class="${isAct('profile.html')}"><i class="fas fa-id-card"></i> ข้อมูลลูกค้า</a>
            <a href="${prefix}services.html" class="${isAct('services.html')}"><i class="fas fa-concierge-bell"></i> โปรแกรมบริการ</a>
            <a href="${prefix}booking.html" class="${isAct('booking.html')}"><i class="fas fa-calendar-plus"></i> จองคิว</a>
            <a href="${prefix}queue-schedule.html" class="${isAct('queue-schedule.html')}"><i class="fas fa-calendar-alt"></i> ตารางคิว</a>
            <a href="${prefix}login.html" class="${isAct('login.html')}"><i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ</a>
            <a href="${prefix}register.html" class="btn btn-sm btn-primary" style="color:#fff;"><i class="fas fa-user-plus"></i> สมัครสมาชิก</a>
        `;
    }
}

// ========= Modal Helpers =========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

// ========= CRUD Helpers with MySQL Auto-Sync =========
function getData(key) {
    const raw = localStorage.getItem(key);
    if (!raw) {
        if (typeof initSampleData === 'function') initSampleData();
        return JSON.parse(localStorage.getItem(key) || '[]');
    }
    const parsed = JSON.parse(raw);
    if (key === 'services' && (!parsed || parsed.length === 0)) {
        if (typeof initSampleData === 'function') initSampleData();
        return JSON.parse(localStorage.getItem('services') || '[]');
    }
    return parsed || [];
}
function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
function addItem(key, item) {
    const data = getData(key);
    data.push(item);
    setData(key, data);
    syncEntityToDb(key, item, 'add');
}
function updateItem(key, id, updates) {
    const data = getData(key);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        setData(key, data);
        syncEntityToDb(key, data[index], 'update');
        return true;
    }
    return false;
}
function deleteItem(key, id) {
    const data = getData(key);
    const filtered = data.filter(item => item.id !== id);
    setData(key, filtered);
    syncEntityToDb(key, { id: id }, 'delete');
}
function getItemById(key, id) {
    return getData(key).find(item => item.id === id);
}

function syncEntityToDb(key, item, op) {
    if (!item) return;
    if (op === 'delete') {
        if (key === 'customers') callApi('delete_customer', { id: item.id });
        else if (key === 'services') callApi('delete_service', { id: item.id });
        else if (key === 'bookings') callApi('cancel_booking', { id: item.id });
        return;
    }
    // op === 'add' or 'update'
    if (key === 'customers') callApi('save_customer', item);
    else if (key === 'services') callApi('save_service', item);
    else if (key === 'bookings') callApi('save_booking', item);
    else if (key === 'serviceUsages') callApi('save_usage', item);
    else if (key === 'payments') callApi('save_payment', item);
}

// ========= MySQL / phpMyAdmin API Communication =========
function getApiBaseUrl() {
    if (window.location.protocol.startsWith('http')) {
        const path = window.location.pathname;
        if (path.includes('/admin/')) {
            return '../api.php';
        }
        return 'api.php';
    }
    // เข้าถึงผ่าน file:/// protocol ในเครื่อง
    return 'http://localhost/aytanic1/api.php';
}

async function callApi(action, data = null, method = 'POST') {
    try {
        const url = `${getApiBaseUrl()}?action=${action}`;
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }
        const res = await fetch(url, options);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        return json;
    } catch (err) {
        console.warn('API connection notice:', err.message);
        return null;
    }
}

// ซิงค์ข้อมูลล่าสุดจากฐานข้อมูล MySQL (phpMyAdmin)
async function syncDataFromDb() {
    const res = await callApi('get_all', null, 'GET');
    if (res && res.status === 'success' && res.data) {
        if (res.data.admins && res.data.admins.length > 0) setData('admins', res.data.admins);
        if (res.data.customers && res.data.customers.length > 0) setData('customers', res.data.customers);
        if (res.data.services && res.data.services.length > 0) setData('services', res.data.services);
        if (res.data.bookings && res.data.bookings.length > 0) setData('bookings', res.data.bookings);
        if (res.data.queueSchedules && res.data.queueSchedules.length > 0) setData('queueSchedules', res.data.queueSchedules);
        if (res.data.serviceUsages && res.data.serviceUsages.length > 0) setData('serviceUsages', res.data.serviceUsages);
        if (res.data.payments && res.data.payments.length > 0) setData('payments', res.data.payments);

        updateDbStatusBadge(true, res.database || 'artanic');
        return true;
    } else {
        updateDbStatusBadge(false);
        return false;
    }
}

// แสดงสถานะการเชื่อมต่อฐานข้อมูลบนหน้าเว็บ
function updateDbStatusBadge(isConnected, dbName = 'artanic') {
    let badge = document.getElementById('dbStatusBadge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'dbStatusBadge';
        badge.style.cssText = `
            position: fixed;
            bottom: 14px;
            right: 14px;
            z-index: 9999;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 0.8rem;
            font-family: 'Kanit', 'Prompt', sans-serif;
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.4s ease;
            max-width: 90vw;
        `;
        document.body.appendChild(badge);
    }

    if (isConnected) {
        badge.style.background = '#eafaf1';
        badge.style.color = '#27ae60';
        badge.style.border = '1.5px solid #a9dfbf';
        badge.innerHTML = `
            <i class="fas fa-database"></i> 
            <span>เชื่อมต่อฐานข้อมูล MySQL (phpMyAdmin: <strong>${dbName}</strong>) สำเร็จ</span>
            <span onclick="this.parentElement.remove()" style="margin-left:8px;cursor:pointer;font-weight:700;padding:0 4px;font-size:1rem;line-height:1;opacity:0.6;">&times;</span>
        `;
        badge.title = 'เชื่อมต่อฐานข้อมูล MySQL ใน XAMPP สำเร็จ';
        // ซ่อนอัตโนมัติหลังเชื่อมต่อสำเร็จ 4 วินาที เพื่อไม่ให้บังหน้าจอ
        setTimeout(() => {
            if (badge && badge.parentNode) {
                badge.style.opacity = '0';
                badge.style.transform = 'translateY(10px)';
                setTimeout(() => badge.remove(), 400);
            }
        }, 4000);
    } else {
        badge.style.background = '#fdf2e9';
        badge.style.color = '#d35400';
        badge.style.border = '1.5px solid #f5cba7';
        badge.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> 
            <span>ฐานข้อมูล MySQL ออฟไลน์ (กำลังใช้โหมด LocalStorage)</span>
            <span onclick="this.parentElement.remove()" title="ปิดการแจ้งเตือน" style="margin-left:8px;cursor:pointer;font-weight:700;padding:0 5px;font-size:1.1rem;line-height:1;color:#b03a2e;">&times;</span>
        `;
        badge.title = 'กรุณากด Start ที่ MySQL ใน XAMPP Control Panel หากต้องการใช้ MySQL';
        // ซ่อนอัตโนมัติหลัง 6 วินาที
        setTimeout(() => {
            if (badge && badge.parentNode) {
                badge.style.opacity = '0';
                badge.style.transform = 'translateY(10px)';
                setTimeout(() => badge.remove(), 400);
            }
        }, 6000);
    }
}

// ฟังก์ชัน Login ที่เชื่อมต่อฐานข้อมูล MySQL
async function loginAsync(username, password) {
    const res = await callApi('login', { username, password });
    if (res && res.status === 'success') {
        localStorage.setItem('currentUser', JSON.stringify({ ...res.user, role: res.role }));
        return { success: true, user: res.user, role: res.role };
    }
    if (!res) {
        // Fallback local
        return login(username, password);
    }
    return { success: false, message: res.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
}

// ฟังก์ชัน Register ที่เชื่อมต่อฐานข้อมูล MySQL
async function registerAsync(data) {
    const res = await callApi('register', data);
    if (res && res.status === 'success') {
        const customers = getData('customers');
        customers.push(res.user);
        setData('customers', customers);
        return { success: true, user: res.user };
    }
    if (!res) {
        // Fallback local
        return register(data);
    }
    return { success: false, message: res.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' };
}

// ฟังก์ชันบันทึกข้อมูลส่วนตัวลงฐานข้อมูล MySQL
async function saveProfileToDb(updates) {
    const res = await callApi('save_profile', updates);
    return res;
}

// ฟังก์ชันบันทึกการจองคิวลงฐานข้อมูล MySQL
async function saveBookingToDb(bookingData) {
    const res = await callApi('save_booking', bookingData);
    return res;
}

// ฟังก์ชันยกเลิกการจองคิวในฐานข้อมูล MySQL
async function cancelBookingInDb(bookingId) {
    const res = await callApi('cancel_booking', { id: bookingId });
    return res;
}

// ฟังก์ชันจัดการลูกค้า (Admin)
async function saveCustomerToDb(custData) {
    const res = await callApi('save_customer', custData);
    return res;
}

async function deleteCustomerFromDb(custId) {
    const res = await callApi('delete_customer', { id: custId });
    return res;
}

// ฟังก์ชันจัดการโปรแกรมบริการ (Admin)
async function saveServiceToDb(svcData) {
    const res = await callApi('save_service', svcData);
    return res;
}

async function deleteServiceFromDb(svcId) {
    const res = await callApi('delete_service', { id: svcId });
    return res;
}

// ฟังก์ชันบันทึกการเข้าใช้บริการจริง (Admin)
async function saveUsageToDb(usageData) {
    const res = await callApi('save_usage', usageData);
    return res;
}

// ฟังก์ชันบันทึกการชำระเงิน (Admin)
async function savePaymentToDb(paymentData) {
    const res = await callApi('save_payment', paymentData);
    return res;
}

// ========= Initialize =========
document.addEventListener('DOMContentLoaded', async function() {
    initSampleData();
    initNavigation();
    await syncDataFromDb();
});
