/* admin-common.js - Shared Admin Logic */

function checkAdmin() {
    let user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!user || (typeof isAdmin === 'function' && !isAdmin())) {
        const admins = (typeof getData === 'function' ? getData('admins') : []) || [];
        if (admins.length > 0) {
            user = admins[0];
            if (typeof setCurrentUser === 'function') setCurrentUser(user);
        } else {
            window.location.href = '../login.html';
            return false;
        }
    }
    const nameEl = document.getElementById('adminName');
    if (nameEl) {
        let displayName = user.fullName || 'จัดการสิทธิ์ผู้เข้าใช้งาน';
        if (displayName === 'ผู้ดูแลระบบ' || displayName === 'ผู้ดูแลระบบ (ผู้ดูแลระบบ)') {
            displayName = 'จัดการสิทธิ์ผู้เข้าใช้งาน';
        }
        nameEl.textContent = displayName;
    }
    renderSidebar();
    return true;
}

function handleLogout() {
    if (confirm('ต้องการออกจากระบบหรือไม่?')) {
        localStorage.removeItem('currentUser');
        window.location.href = '../login.html';
    }
}

function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';

    const menuItems = [
        { label: 'เมนูหลัก', isHeader: true },
        { href: '../home.html', icon: 'fa-home', text: 'เมนู' },
        { href: 'dashboard.html', icon: 'fa-store', text: 'ระบบจัดการร้าน' },
        { href: 'customers.html', icon: 'fa-users', text: 'จัดการลูกค้า' },
        { href: 'permissions.html', icon: 'fa-user-shield', text: 'จัดการสิทธิ์ผู้ใช้งาน' },
        { label: 'บริการ', isHeader: true },
        { href: 'services.html', icon: 'fa-concierge-bell', text: 'โปรแกรมบริการ' },
        { href: 'bookings.html', icon: 'fa-calendar-check', text: 'จัดการจองคิว' },
        { href: 'queue-management.html', icon: 'fa-list-ol', text: 'ตารางคิว' },
        { href: 'service-usage.html', icon: 'fa-clipboard-list', text: 'การเข้าใช้บริการ' },
        { label: 'การเงิน & รายงาน', isHeader: true },
        { href: 'payments.html', icon: 'fa-credit-card', text: 'ชำระเงิน' },
        { href: 'reports.html', icon: 'fa-chart-bar', text: 'รายงานสรุป' },
        { label: 'อื่นๆ', isHeader: true },
        { href: '../home.html', icon: 'fa-home', text: 'กลับหน้าเว็บหลัก' }
    ];

    let html = `
        <div class="sidebar-header" style="display:flex;flex-direction:column;align-items:center;padding:20px 15px;">
            <img src="../images/eitanic-logo.jpg" alt="Logo" style="width:48px;height:48px;border-radius:12px;margin-bottom:8px;background:#fff;padding:3px;box-shadow:0 4px 10px rgba(0,0,0,0.15);">
            <h2 style="font-size:1.05rem;margin:0;">ร้านอายตานิค</h2>
            <p style="font-size:0.75rem;margin:3px 0 0;opacity:0.85;">สาขาอำเภอเมือง จ.ลพบุรี</p>
        </div>
        <ul class="sidebar-menu">
    `;

    menuItems.forEach(item => {
        if (item.isHeader) {
            html += `<li class="menu-label">${item.label}</li>`;
        } else {
            const isActive = currentFile === item.href ? 'class="active"' : '';
            html += `<li><a href="${item.href}" ${isActive}><i class="fas ${item.icon}"></i> <span>${item.text}</span></a></li>`;
        }
    });

    html += `</ul>`;
    sidebar.innerHTML = html;
}
