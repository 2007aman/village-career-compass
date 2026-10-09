class CustomNavbar extends HTMLElement {
    connectedCallback() {
        const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        const links = [
            { href: 'index.html', label: 'Home' },
            { href: 'careers.html', label: 'Careers' },
            { href: 'quiz.html', label: 'Aptitude Quiz' },
            { href: 'scholarships.html', label: 'Scholarships' },
            { href: 'mentors.html', label: 'Mentors' },
            { href: 'apply.html', label: 'Apply' },
        ];
        const isActive = (href) => href === page || (href === 'index.html' && page === '');

        const desktopLinks = links.map((l) => `
            <li>
                <a href="${l.href}" class="px-3 py-2 rounded-full text-sm font-medium transition-colors ${isActive(l.href)
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                    : 'text-gray-300 hover:text-orange-400 hover:bg-slate-800/70 border border-transparent'}">${l.label}</a>
            </li>`).join('');

        const mobileLinks = links.map((l) => `
            <a href="${l.href}" class="block px-4 py-3 rounded-xl text-base font-medium ${isActive(l.href)
                ? 'bg-orange-500/15 text-orange-400'
                : 'text-gray-300 hover:bg-slate-800/70 hover:text-orange-400'}">${l.label}</a>`).join('');

        const guestDesktop = `
            <a href="login.html" class="px-4 py-2 rounded-full text-sm font-semibold text-gray-300 hover:text-orange-400 transition-colors">Log In</a>
            <a href="signup.html" class="gradient-btn px-5 py-2.5 rounded-full text-sm font-semibold">Sign Up</a>`;
        const guestMobile = `
            <div class="grid grid-cols-2 gap-3 mt-4">
                <a href="login.html" class="border-2 border-orange-500 text-center px-5 py-3 rounded-xl text-sm font-semibold text-orange-400">Log In</a>
                <a href="signup.html" class="gradient-btn text-center px-5 py-3 rounded-xl text-sm font-semibold">Sign Up</a>
            </div>`;

        this.innerHTML = `
        <nav class="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/70">
            <div class="container mx-auto px-6 h-20 flex items-center justify-between gap-4">
                <a href="index.html" class="flex items-center gap-3 shrink-0" aria-label="Village Career Compass home">
                    <span class="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                    </span>
                    <span class="text-lg sm:text-xl font-extrabold gradient-text leading-tight">Village Career Compass</span>
                </a>

                <ul class="hidden xl:flex items-center gap-1">${desktopLinks}</ul>

                <div class="flex items-center gap-2">
                    <div id="vcc-auth-desktop" class="hidden xl:flex items-center gap-2">${guestDesktop}</div>
                    <button type="button" id="vcc-menu-btn" class="xl:hidden text-gray-300 hover:text-orange-400 bg-slate-800/70 p-2.5 rounded-xl transition-colors" aria-label="Toggle menu" aria-expanded="false">
                        <svg id="vcc-icon-open" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                        <svg id="vcc-icon-close" class="hidden" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </div>

            <div id="vcc-mobile-menu" class="hidden xl:hidden border-t border-slate-800/70 bg-slate-950/95 px-6 py-4">
                <div class="space-y-1">${mobileLinks}</div>
                <div id="vcc-auth-mobile">${guestMobile}</div>
            </div>
        </nav>`;

        const btn = this.querySelector('#vcc-menu-btn');
        const menu = this.querySelector('#vcc-mobile-menu');
        const iconOpen = this.querySelector('#vcc-icon-open');
        const iconClose = this.querySelector('#vcc-icon-close');

        const setOpen = (open) => {
            menu.classList.toggle('hidden', !open);
            iconOpen.classList.toggle('hidden', open);
            iconClose.classList.toggle('hidden', !open);
            btn.setAttribute('aria-expanded', String(open));
        };
        btn.addEventListener('click', () => setOpen(menu.classList.contains('hidden')));
        menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
        window.addEventListener('resize', () => { if (window.innerWidth >= 1280) setOpen(false); });

        this.loadUser();
    }

    // Swap "Log In / Sign Up" for the user's name + Logout when a session exists
    async loadUser() {
        let user = null;
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) user = (await res.json()).user;
        } catch (_) { /* offline or opened as a file - keep guest buttons */ }
        if (!user) return;

        const firstName = (user.name || 'Student').split(' ')[0];
        const initial = firstName.charAt(0).toUpperCase();

        const desktop = this.querySelector('#vcc-auth-desktop');
        desktop.innerHTML = `
            <a href="dashboard.html" title="My Account" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/70 border border-slate-700/70 hover:border-orange-500/60 transition-colors">
                <span class="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-sm font-bold text-white" data-initial></span>
                <span class="text-sm font-medium text-gray-200 max-w-[120px] truncate" data-name></span>
            </a>
            <button type="button" data-logout class="border-2 border-orange-500 px-4 py-2 rounded-full text-sm font-semibold text-orange-400 hover:bg-orange-500 hover:text-white transition-all">Logout</button>`;

        const mobile = this.querySelector('#vcc-auth-mobile');
        mobile.innerHTML = `
            <div class="mt-4 flex items-center justify-between gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3">
                <a href="dashboard.html" class="flex items-center gap-3 min-w-0">
                    <span class="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-sm font-bold text-white shrink-0" data-initial></span>
                    <span class="text-sm font-medium text-gray-200 truncate" data-name></span>
                </a>
                <button type="button" data-logout class="border-2 border-orange-500 px-4 py-2 rounded-lg text-sm font-semibold text-orange-400 shrink-0">Logout</button>
            </div>`;

        // textContent (not innerHTML) so a hostile name can never inject markup
        this.querySelectorAll('[data-initial]').forEach((el) => { el.textContent = initial; });
        this.querySelectorAll('[data-name]').forEach((el) => { el.textContent = firstName; });
        this.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', async () => {
            try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (_) {}
            location.href = 'index.html';
        }));
    }
}

if (!customElements.get('custom-navbar')) customElements.define('custom-navbar', CustomNavbar);
