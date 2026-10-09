// Career Assessment Quiz
(function () {
    const CATEGORIES = {
        technical: {
            title: 'Technical & Engineering',
            text: 'You enjoy fixing things, solving problems and working with technology. Skills like computer support and solar installation are in high demand, even in villages.',
            careers: ['IT Support Specialist', 'Solar Panel Technician'],
        },
        creative: {
            title: 'Creative & Digital Media',
            text: 'You have an eye for design and love creating new things. You can build a freelance career from home with just a phone or laptop.',
            careers: ['Graphic Designer'],
        },
        business: {
            title: 'Business & Finance',
            text: 'You are good with people and money. Helping families and small businesses grow is a respected and rewarding career.',
            careers: ['Micro-Finance Executive'],
        },
        education: {
            title: 'Education & Community Training',
            text: 'You enjoy sharing what you know. Teaching digital skills in your community creates real change for many families.',
            careers: ['Digital Literacy Trainer'],
        },
        agriculture: {
            title: 'Agriculture & AgriTech',
            text: 'You are connected to the land and curious about better ways of farming. Modern AgriTech needs people who understand both fields and technology.',
            careers: ['Agri-Drone Operator'],
        },
    };

    const QUESTIONS = [
        {
            q: 'Which activity sounds the most exciting to you?',
            options: [
                ['Fixing a phone, computer or electrical gadget', 'technical'],
                ['Drawing, designing posters or making videos', 'creative'],
                ['Helping people save money or start a small shop', 'business'],
                ['Teaching others something I have learned', 'education'],
                ['Working with crops, plants or animals', 'agriculture'],
            ],
        },
        {
            q: 'Which school subject do you enjoy the most?',
            options: [
                ['Maths and Science', 'technical'],
                ['Art and Drawing', 'creative'],
                ['Commerce and Economics', 'business'],
                ['Languages and Social Studies', 'education'],
                ['Biology and Environmental Science', 'agriculture'],
            ],
        },
        {
            q: 'How do you like to work?',
            options: [
                ['Solving problems with tools and machines', 'technical'],
                ['Creating something new and unique', 'creative'],
                ['Meeting people and making deals', 'business'],
                ['Guiding and explaining things to groups', 'education'],
                ['Outdoors in the open fields', 'agriculture'],
            ],
        },
        {
            q: 'What would you like to be known for in your village?',
            options: [
                ['The person who brings new technology and fixes everything', 'technical'],
                ['The one who makes beautiful things', 'creative'],
                ['The one who helps families with money and business', 'business'],
                ['The teacher who helped many children learn', 'education'],
                ['The farmer who introduced modern farming', 'agriculture'],
            ],
        },
        {
            q: 'Which new skill would you learn first, for free?',
            options: [
                ['Mobile / computer repair or solar installation', 'technical'],
                ['Canva, photo or video editing', 'creative'],
                ['Accounting and banking basics', 'business'],
                ['Spoken English and basic computer teaching', 'education'],
                ['Drone use and modern farming methods', 'agriculture'],
            ],
        },
    ];

    const total = QUESTIONS.length;
    const answers = new Array(total).fill(null); // stores the chosen option index per question
    let current = 0;

    const container = document.getElementById('quiz-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const counter = document.getElementById('question-counter');
    const bar = document.getElementById('progress-bar');
    const steps = document.querySelectorAll('.step-indicator');
    const lines = document.querySelectorAll('.step-line');
    if (!container || !prevBtn || !nextBtn) return;
    const navRow = prevBtn.parentElement;

    function refreshIcons() { if (typeof feather !== 'undefined') feather.replace(); }

    function updateProgress() {
        counter.textContent = `${Math.min(current + 1, total)} / ${total}`;
        bar.style.width = `${((current + 1) / total) * 100}%`;
        steps.forEach((s, i) => {
            s.classList.toggle('active', i === current);
            s.classList.toggle('completed', i < current);
        });
        lines.forEach((l, i) => l.classList.toggle('completed', i < current));
    }

    function renderQuestion() {
        const item = QUESTIONS[current];
        container.innerHTML = `
            <p class="text-sm text-orange-400 font-semibold mb-2">Question ${current + 1} of ${total}</p>
            <h2 class="text-2xl font-bold text-white mb-6">${item.q}</h2>
            <div class="space-y-3" role="radiogroup">
                ${item.options.map((o, i) => `
                    <button type="button" role="radio" aria-checked="${answers[current] === i}" data-index="${i}"
                        class="quiz-option ${answers[current] === i ? 'selected' : ''}">${o[0]}</button>`).join('')}
            </div>`;

        container.querySelectorAll('.quiz-option').forEach((btn) => {
            btn.addEventListener('click', () => {
                answers[current] = Number(btn.dataset.index);
                container.querySelectorAll('.quiz-option').forEach((b) => {
                    const on = b === btn;
                    b.classList.toggle('selected', on);
                    b.setAttribute('aria-checked', String(on));
                });
                nextBtn.disabled = false;
            });
        });

        prevBtn.disabled = current === 0;
        nextBtn.disabled = answers[current] === null;
        const last = current === total - 1;
        nextBtn.innerHTML = `${last ? 'See Results' : 'Next'}<i data-feather="${last ? 'check' : 'arrow-right'}" class="w-5 h-5 inline ml-2"></i>`;
        updateProgress();
        refreshIcons();
    }

    function showResults() {
        const score = { technical: 0, creative: 0, business: 0, education: 0, agriculture: 0 };
        answers.forEach((a, qi) => { if (a !== null) score[QUESTIONS[qi].options[a][1]]++; });
        const ranked = Object.keys(score).sort((a, b) => score[b] - score[a]);
        const top = CATEGORIES[ranked[0]];
        const second = score[ranked[1]] > 0 ? CATEGORIES[ranked[1]] : null;

        steps.forEach((s) => { s.classList.remove('active'); s.classList.add('completed'); });
        lines.forEach((l) => l.classList.add('completed'));
        bar.style.width = '100%';
        counter.textContent = 'Completed';
        navRow.classList.add('hidden');

        container.innerHTML = `
            <div class="text-center">
                <span class="scholarship-badge">Your Top Match</span>
                <h2 class="text-3xl md:text-4xl font-extrabold gradient-text mt-4 mb-4">${top.title}</h2>
                <p class="text-gray-300 leading-relaxed mb-6">${top.text}</p>
                <div class="text-left bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 mb-4">
                    <div class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Recommended careers</div>
                    <div class="flex flex-wrap gap-2">${top.careers.map((c) => `<span class="scholarship-badge">${c}</span>`).join('')}</div>
                </div>
                ${second ? `<p class="text-sm text-gray-400 mb-6">You also showed interest in <span class="text-orange-400 font-semibold">${second.title}</span>.</p>` : '<div class="mb-6"></div>'}
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href="careers.html?category=${ranked[0]}" class="gradient-btn px-6 py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2">Explore Careers <i data-feather="arrow-right" class="w-4 h-4"></i></a>
                    <a href="scholarships.html" class="border-2 border-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-all inline-flex items-center justify-center">Find Scholarships</a>
                    <a href="mentors.html" class="border-2 border-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-all inline-flex items-center justify-center">Talk to a Mentor</a>
                </div>
                <p id="save-note" class="mt-6 text-sm text-gray-400"></p>
                <button type="button" id="retake-btn" class="mt-3 text-sm text-gray-400 hover:text-orange-400 underline">Retake the quiz</button>
            </div>`;

        // Save to the student's account (or invite guests to log in)
        const saveNote = document.getElementById('save-note');
        fetch('/api/auth/me').then((r) => r.json()).then(async (d) => {
            if (d && d.user) {
                const res = await fetch('/api/quiz/result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: ranked[0], scores: score }),
                });
                saveNote.innerHTML = res.ok
                    ? 'Result saved to <a href="dashboard.html" class="text-orange-400 font-semibold underline">My Account</a>.'
                    : 'We could not save your result right now.';
            } else {
                saveNote.innerHTML = '<a href="login.html?next=quiz.html" class="text-orange-400 font-semibold underline">Log in</a> or <a href="signup.html?next=quiz.html" class="text-orange-400 font-semibold underline">sign up</a> to save this result to your account.';
            }
        }).catch(() => { saveNote.textContent = ''; });

        document.getElementById('retake-btn').addEventListener('click', () => {
            answers.fill(null);
            current = 0;
            navRow.classList.remove('hidden');
            renderQuestion();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        refreshIcons();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    prevBtn.addEventListener('click', () => { if (current > 0) { current--; renderQuestion(); } });
    nextBtn.addEventListener('click', () => {
        if (answers[current] === null) return;
        if (current < total - 1) { current++; renderQuestion(); } else { showResults(); }
    });

    renderQuestion();
})();
