(function () {
    const CATEGORY_TITLES = {
        technical: 'Technical & Engineering',
        creative: 'Creative & Digital Media',
        business: 'Business & Finance',
        education: 'Education & Community Training',
        agriculture: 'Agriculture & AgriTech',
    };
    const $ = (id) => document.getElementById(id);
    const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');

    function el(tag, className, text) {
        const e = document.createElement(tag);
        if (className) e.className = className;
        if (text !== undefined) e.textContent = text; // textContent: user data can never inject HTML
        return e;
    }

    async function load() {
        let user = null;
        try { user = (await (await fetch('/api/auth/me')).json()).user; } catch (_) {}
        if (!user) { location.replace('login.html?next=dashboard.html'); return; }

        $('greeting').textContent = 'Hello, ' + user.name.split(' ')[0] + '!';
        $('p-name').textContent = user.name;
        $('p-email').textContent = user.email;
        $('p-phone').textContent = user.phone || 'Not added';
        $('p-since').textContent = fmtDate(user.createdAt);

        $('logoutBtn').addEventListener('click', async () => {
            try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (_) {}
            location.href = 'index.html';
        });

        loadQuiz();
        loadApplications();
    }

    async function loadQuiz() {
        const box = $('quiz-box');
        box.textContent = '';
        try {
            const d = await (await fetch('/api/me/quiz')).json();
            if (!d.data) {
                box.append(el('p', 'mb-4', 'You have not taken the quiz yet.'));
                const a = el('a', 'gradient-btn px-4 py-2 rounded-lg text-sm font-semibold inline-block', 'Take the Quiz');
                a.href = 'quiz.html';
                box.append(a);
                return;
            }
            box.append(el('p', 'text-lg font-bold text-white mb-1', CATEGORY_TITLES[d.data.category] || d.data.category));
            box.append(el('p', 'mb-4', 'Taken on ' + fmtDate(d.data.created_at)));
            const a = el('a', 'gradient-btn px-4 py-2 rounded-lg text-sm font-semibold inline-block mr-2', 'See Matching Careers');
            a.href = 'careers.html?category=' + encodeURIComponent(d.data.category);
            const b = el('a', 'text-orange-400 underline text-sm', 'Retake');
            b.href = 'quiz.html';
            box.append(a, b);
        } catch (_) {
            box.textContent = 'Could not load your quiz result.';
        }
    }

    async function loadApplications() {
        const box = $('apps-box');
        box.textContent = '';
        try {
            const d = await (await fetch('/api/me/applications')).json();
            if (!d.data || d.data.length === 0) {
                box.append(el('p', 'mb-4', 'You have not applied for anything yet. Browse scholarships and training programs to get started.'));
                const a = el('a', 'text-orange-400 underline', 'Find Scholarships');
                a.href = 'scholarships.html';
                box.append(a);
                return;
            }
            const list = el('div', 'space-y-3');
            d.data.forEach((app) => {
                const row = el('div', 'bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3');
                const left = el('div');
                left.append(el('p', 'text-white font-semibold', app.program || 'Application'));
                left.append(el('p', 'text-xs text-gray-400 mt-1', [app.education, [app.village, app.district].filter(Boolean).join(', ')].filter(Boolean).join(' • ')));
                const right = el('div', 'text-right');
                right.append(el('span', 'scholarship-badge', 'Submitted'));
                right.append(el('p', 'text-xs text-gray-500 mt-2', '#' + app.id + ' • ' + fmtDate(app.createdAt)));
                row.append(left, right);
                list.append(row);
            });
            box.append(list);
        } catch (_) {
            box.textContent = 'Could not load your applications.';
        }
    }

    load();
})();
