const API_BASE = 'http://127.0.0.1:8000/api/v1';

function initNavbar() {
    const access = localStorage.getItem('access');
    const username = localStorage.getItem('username') || 'Користувач';
    const authSection = document.getElementById('nav-auth-section');
    if (!authSection) return;

    if (access) {
        authSection.innerHTML = `
            <span style="font-weight: 600; margin-right: 10px;">👤 ${username}</span>
            <button type="button" id="global-logout-btn" class="logout-btn" style="width: auto; padding: 8px 15px;">Вийти</button>
        `;
        document.getElementById('global-logout-btn').addEventListener('click', handleLogout);
    } else {
        authSection.innerHTML = `
            <button type="button" onclick="location.href='login.html'" style="width: auto; padding: 8px 15px;">Увійти</button>
        `;
    }
}

async function apiFetch(url, options = {}) {
    let access = localStorage.getItem('access');
    options.headers = options.headers || {};
    if (access) {
        options.headers['Authorization'] = `Bearer ${access}`;
    }

    let response = await fetch(url, options);

    if (response.status === 401 && localStorage.getItem('refresh')) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            options.headers['Authorization'] = `Bearer ${localStorage.getItem('access')}`;
            response = await fetch(url, options);
        } else {
            await handleLogout();
            window.location.href = 'login.html';
            return null;
        }
    }
    return response;
}

async function refreshAccessToken() {
    const refresh = localStorage.getItem('refresh');
    try {
        const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh })
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('access', data.access);
            return true;
        }
    } catch (e) {
        console.error(e);
    }
    return false;
}

async function handleLogout() {
    const refresh = localStorage.getItem('refresh');
    if (refresh) {
        try {
            await apiFetch(`${API_BASE}/auth/logout/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh })
            });
        } catch (e) {
            console.error(e);
        }
    }
    localStorage.clear();
    window.location.href = 'index.html';
}
