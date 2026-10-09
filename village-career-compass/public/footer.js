class CustomFooter extends HTMLElement {
    connectedCallback() {
        const year = new Date().getFullYear();
        this.innerHTML = `
        <footer class="bg-slate-950 border-t border-slate-800/70 mt-12">
            <div class="container mx-auto px-6 py-12">
                <div class="grid md:grid-cols-3 gap-10">
                    <div>
                        <div class="flex items-center gap-3 mb-4">
                            <span class="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                            </span>
                            <span class="text-lg font-extrabold gradient-text">Village Career Compass</span>
                        </div>
                        <p class="text-gray-400 text-sm leading-relaxed">Smart career guidance, mentorship, scholarships and skill training for students from rural India.</p>
                    </div>

                    <div>
                        <h4 class="text-white font-semibold mb-4">Explore</h4>
                        <ul class="space-y-2 text-sm">
                            <li><a href="careers.html" class="text-gray-400 hover:text-orange-400 transition-colors">Career Paths</a></li>
                            <li><a href="quiz.html" class="text-gray-400 hover:text-orange-400 transition-colors">Aptitude Quiz</a></li>
                            <li><a href="scholarships.html" class="text-gray-400 hover:text-orange-400 transition-colors">Scholarships &amp; Training</a></li>
                            <li><a href="mentors.html" class="text-gray-400 hover:text-orange-400 transition-colors">Connect with Mentors</a></li>
                            <li><a href="apply.html" class="text-gray-400 hover:text-orange-400 transition-colors">Apply Now</a></li>
                            <li><a href="dashboard.html" class="text-gray-400 hover:text-orange-400 transition-colors">My Account</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-white font-semibold mb-4">Our Mission</h4>
                        <p class="text-gray-400 text-sm leading-relaxed mb-4">Every talented student deserves a clear path forward, no matter where they were born.</p>
                        <a href="mentors.html" class="gradient-btn inline-flex px-5 py-2.5 rounded-full text-sm font-semibold">Talk to a Mentor</a>
                    </div>
                </div>

                <div class="border-t border-slate-800/70 mt-10 pt-6 text-center text-gray-500 text-sm">
                    &copy; ${year} Village Career Compass. All rights reserved.
                </div>
            </div>
        </footer>`;
    }
}

if (!customElements.get('custom-footer')) customElements.define('custom-footer', CustomFooter);
