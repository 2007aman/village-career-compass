document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('applicationForm');
    if (!form) return;

    // Preselect program when arriving from the scholarships page (?program=tata)
    const wanted = new URLSearchParams(location.search).get('program');
    const programSelect = document.getElementById('program');
    if (wanted && programSelect && [...programSelect.options].some(o => o.value === wanted)) {
        programSelect.value = wanted;
    }

    // Applying needs an account: send guests to log in, then bring them back here
    const goLogin = () => {
        const here = (location.pathname.split('/').pop() || 'apply.html') + location.search;
        location.href = 'login.html?next=' + encodeURIComponent(here);
    };

    // Logged in -> prefill their details
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
        if (!d || !d.user) return goLogin();
        [['fullName', d.user.name], ['email', d.user.email], ['phone', d.user.phone]].forEach(([id, v]) => {
            const el = document.getElementById(id);
            if (el && v && !el.value) el.value = v;
        });
    }).catch(() => {});

    const submitBtn = form.querySelector('button[type="submit"]');
    const submitHTML = submitBtn.innerHTML;

    // Status message area (styled with the existing theme classes), placed above the buttons
    const status = document.createElement('div');
    status.className = 'hidden rounded-lg px-4 py-3 text-sm';
    status.setAttribute('role', 'alert');
    submitBtn.closest('div').before(status);

    function showStatus(type, text) {
        status.textContent = text;
        status.className = 'rounded-lg px-4 py-3 text-sm border ' + (type === 'success'
            ? 'bg-green-500/10 border-green-500/40 text-green-300'
            : 'bg-red-500/10 border-red-500/40 text-red-300');
        status.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const wordCount = (t) => t.trim().split(/\s+/).filter(Boolean).length;
    const val = (id) => (document.getElementById(id)?.value || '').trim();

    form.addEventListener('reset', () => status.className = 'hidden');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (wordCount(val('essay1')) > 150) {
            showStatus('error', 'Your answer to the first question is longer than 150 words. Please shorten it.');
            return;
        }

        const payload = {
            fullName: val('fullName'),
            phone: val('phone'),
            email: val('email'),
            village: val('village'),
            district: val('district'),
            // Send the readable program name instead of the internal option value
            program: document.getElementById('program').selectedOptions[0]?.text.trim() || '',
            education: document.getElementById('education').selectedOptions[0]?.text.trim() || '',
            essay1: val('essay1'),
            essay2: val('essay2'),
            essay3: val('essay3'),
        };

        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-60', 'cursor-not-allowed');
        submitBtn.textContent = 'Submitting...';

        try {
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));

            if (res.status === 401) return goLogin();

            if (res.ok && data.success) {
                form.reset();
                showStatus('success', `Application submitted successfully! Your application ID is #${data.applicationId}. You can track it in My Account.`);
            } else {
                showStatus('error', data.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error('Application error:', err);
            showStatus('error', 'Could not reach the server. Please check your internet connection and try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-60', 'cursor-not-allowed');
            submitBtn.innerHTML = submitHTML;
            if (typeof feather !== 'undefined') feather.replace();
        }
    });

    if (typeof feather !== 'undefined') feather.replace();
});
