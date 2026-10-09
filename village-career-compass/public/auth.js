// Login + Signup page logic
(function () {
    const params = new URLSearchParams(location.search);

    // Only allow redirecting to a page on this site
    function safeNext() {
        const n = params.get('next') || '';
        return /^[A-Za-z0-9_\-./?=&]+$/.test(n) && !n.startsWith('//') && !n.includes('..') ? n : 'index.html';
    }

    const msg = document.getElementById('formMessage');
    function show(type, text) {
        msg.textContent = text;
        msg.className = 'rounded-lg px-4 py-3 text-sm border ' + (type === 'success'
            ? 'bg-green-500/10 border-green-500/40 text-green-300'
            : 'bg-red-500/10 border-red-500/40 text-red-300');
    }

    // Keep ?next= when moving between login and signup
    const other = document.getElementById('otherLink');
    if (other && params.get('next')) other.href += '?next=' + encodeURIComponent(params.get('next'));

    // Show / hide password
    document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.togglePassword);
            const reveal = input.type === 'password';
            input.type = reveal ? 'text' : 'password';
            btn.textContent = reveal ? 'Hide' : 'Show';
        });
    });

    // Already logged in? Skip this page.
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
        if (d && d.user) location.replace(safeNext());
    }).catch(() => {});

    async function submit(url, payload, btn, busyText, doneText) {
        const original = btn.textContent;
        btn.disabled = true;
        btn.textContent = busyText;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
                show('success', doneText);
                setTimeout(() => { location.href = safeNext(); }, 700);
                return;
            }
            show('error', data.message || 'Something went wrong. Please try again.');
        } catch (err) {
            show('error', 'Could not reach the server. Please check your connection and try again.');
        }
        btn.disabled = false;
        btn.textContent = original;
    }

    const val = (id) => document.getElementById(id).value;

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!val('email').trim() || !val('password')) return show('error', 'Please enter your email and password.');
            submit('/api/auth/login', { email: val('email').trim(), password: val('password') },
                document.getElementById('submitBtn'), 'Logging in...', 'Login successful! Redirecting...');
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pw = val('password');
            if (val('name').trim().length < 2) return show('error', 'Please enter your full name.');
            if (!val('email').trim()) return show('error', 'Please enter your email address.');
            if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return show('error', 'Password must be at least 8 characters with a letter and a number.');
            if (pw !== val('confirmPassword')) return show('error', 'Passwords do not match.');
            submit('/api/auth/signup', {
                name: val('name').trim(), email: val('email').trim(), phone: val('phone').trim(), password: pw,
            }, document.getElementById('submitBtn'), 'Creating account...', 'Account created! Redirecting...');
        });
    }
})();
