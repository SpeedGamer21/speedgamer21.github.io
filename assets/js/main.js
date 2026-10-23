const GITHUB_USER = 'SpeedGamer21';
const MAX_PROJECTS = 6;

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== Header shadow + progress bar on scroll ===== */
const header = document.getElementById('header');
const progress = document.getElementById('progress');
const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--p', max > 0 ? scrollY / max : 0);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ===== Mobile menu ===== */
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

function setMenu(open) {
    navMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    navToggle.querySelector('i').className = open ? 'bx bx-x' : 'bx bx-menu';
}

navToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('open')));
navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

/* ===== Theme toggle ===== */
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

function currentTheme() {
    return root.dataset.theme
        || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
}

function syncThemeIcon() {
    themeToggle.querySelector('i').className = currentTheme() === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
}

themeToggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncThemeIcon();
});
syncThemeIcon();

/* ===== Active nav link ===== */
const navLinks = [...document.querySelectorAll('.nav__link')];
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
    });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => sectionObserver.observe(s));

/* ===== Reveal on scroll ===== */
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.querySelectorAll('[data-count]').forEach(countUp);
            if (entry.target.matches('[data-count]')) countUp(entry.target);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
const observeReveals = () => document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
observeReveals();

/* ===== Count-up stats ===== */
function countUp(el) {
    const target = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now();
    const step = now => {
        const t = Math.min((now - start) / 1200, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

/* ===== Typed roles in hero ===== */
const ROLES = ['Systems Administrator', 'Proxmox & Virtualization', 'Networking & Firewalls', 'Backup & Disaster Recovery', 'PC Builder since 2013'];
const typed = document.getElementById('typed');

async function typeRoles() {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; ; i = (i + 1) % ROLES.length) {
        const word = ROLES[i];
        for (let n = 1; n <= word.length; n++) { typed.textContent = word.slice(0, n); await wait(55); }
        await wait(1800);
        for (let n = word.length; n >= 0; n--) { typed.textContent = word.slice(0, n); await wait(25); }
        await wait(300);
    }
}
if (!reduceMotion) setTimeout(typeRoles, 1500);

/* ===== Cursor spotlight on cards ===== */
let litCard = null;
document.addEventListener('pointermove', e => {
    const card = e.target.closest('.skill-card, .project');
    if (litCard && litCard !== card) litCard.style.removeProperty('--mx');
    litCard = card;
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
});

/* ===== Footer year ===== */
document.getElementById('year').textContent = new Date().getFullYear();

/* ===== Projects from GitHub ===== */
const LANG_ICONS = {
    JavaScript: 'bxl-javascript',
    TypeScript: 'bxl-typescript',
    HTML: 'bxl-html5',
    CSS: 'bxl-css3',
    Python: 'bxl-python',
    Java: 'bxl-java',
    PHP: 'bxl-php',
    'C++': 'bxl-c-plus-plus',
    'C#': 'bx-code-alt',
};

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function projectCard(repo) {
    const icon = LANG_ICONS[repo.language] || 'bx-folder';
    const homepage = repo.homepage
        ? `<a href="${escapeHtml(repo.homepage)}" target="_blank" rel="noopener" aria-label="Live site for ${escapeHtml(repo.name)}"><i class='bx bx-link-external'></i></a>`
        : '';
    return `
        <article class="card project">
            <div class="project__top">
                <i class='bx ${icon}'></i>
                <div class="project__links">
                    <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener" aria-label="Source for ${escapeHtml(repo.name)}"><i class='bx bxl-github'></i></a>
                    ${homepage}
                </div>
            </div>
            <h3>${escapeHtml(repo.name.replace(/[-_]/g, ' '))}</h3>
            <p>${escapeHtml(repo.description || 'No description yet.')}</p>
            <div class="project__meta">
                ${repo.language ? `<span><i class='bx bx-code-alt'></i>${escapeHtml(repo.language)}</span>` : ''}
                <span><i class='bx bx-star'></i>${repo.stargazers_count}</span>
                <span><i class='bx bx-time-five'></i>${new Date(repo.pushed_at).getFullYear()}</span>
            </div>
        </article>`;
}

async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=100`);
        if (!res.ok) throw new Error(res.status);
        const repos = (await res.json()).filter(r => !r.fork && !r.archived);

        document.getElementById('repo-count').textContent = repos.length;

        if (!repos.length) throw new Error('no repos');
        grid.innerHTML = repos
            .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
            .slice(0, MAX_PROJECTS)
            .map(projectCard)
            .join('');
    } catch (err) {
        grid.innerHTML = `<p class="projects__fallback">Couldn't load projects right now —
            <a href="https://github.com/${GITHUB_USER}?tab=repositories" target="_blank" rel="noopener">see them on GitHub</a>.</p>`;
    }
}

loadProjects();
