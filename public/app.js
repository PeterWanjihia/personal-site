let systemState = null;

async function boot() {
    try {
        console.log("[SHELL] Initiating system boot...");
        const res = await fetch('/api/state');
        
        if (!res.ok) throw new Error(`Kernel returned status: ${res.status}`);
        
        systemState = await res.json();
        console.log("[SHELL] System state loaded successfully.");
        
        renderHome();
        
        document.getElementById('session-id').innerText = 
            Math.random().toString(16).substr(2, 8).toUpperCase();
            
    } catch (err) {
        console.error("[SHELL] Boot failed:", err);
        document.getElementById('view-port').innerHTML = `
            <h1 style="color: red;">SYSTEM_HALT: BOOT_FAILURE</h1>
            <p>Error: ${err.message}</p>
            <p>Check terminal for Kernel status and run 'make build'.</p>
        `;
    }
}
// Module: View Router - Home
function renderHome() {
    const main = document.getElementById('view-port');
    main.innerHTML = `
        <h1>USER_PROFILE: PETER</h1>
        <p>Systems Developer focused on C, C++, and Blockchain Architecture.</p>
        <p>Currently building systems from first principles at JKUAT.</p>
    `;
}

// Module: View Router - Blog List
function renderBlog() {
    const main = document.getElementById('view-port');
    const postsHtml = systemState.posts.map(post => `
        <div class="card" onclick="renderPost('${post.slug}')" style="cursor: pointer;">
            <h3>${post.metadata.title}</h3>
            <small>${post.metadata.date} | TAGS: ${post.metadata.tags.join(', ')}</small>
        </div>
    `).join('');
    
    main.innerHTML = `<h1>SYSTEM_LOGS (/var/log)</h1>` + postsHtml;
}

// Module: View Router - Single Post View
function renderPost(slug) {
    const main = document.getElementById('view-port');
    const post = systemState.posts.find(p => p.slug === slug);

    if (!post) {
        main.innerHTML = `<h1>ERROR: 404_NOT_FOUND</h1>`;
        return;
    }

    main.innerHTML = `
        <div class="post-view">
            <button onclick="renderBlog()" style="background:none; border:1px solid #00ff41; color:#00ff41; cursor:pointer; margin-bottom:20px;">
                [ BACK_TO_LOGS ]
            </button>
            <h1>${post.metadata.title}</h1>
            <div class="post-meta" style="color: #008f11; margin-bottom: 20px;">
                DATE: ${post.metadata.date} | SLUG: ${post.slug}
            </div>
            <div class="post-content">
                ${post.content}
            </div>
        </div>
    `;
}

// Module: View Router - Projects
function renderProjects() {
    const main = document.getElementById('view-port');
    main.innerHTML = `<h1>EXECUTABLES (/bin)</h1>` + systemState.projects.map(p => `
        <div class="card">
            <h3>${p.title} [${p.lang}]</h3>
            <p>${p.description}</p>
            <small>STATUS: ${p.status}</small>
        </div>
    `).join('');
}

// Module: View Router - Man Page (About)
function renderAbout() {
    const main = document.getElementById('view-port');
    main.innerHTML = `
        <div class="cv-container">
            <section class="cv-header">
                <div class="profile-frame">
                    <div class="img-placeholder">IMAGE_PENDING_UPLOAD</div>
                </div>
                <div class="profile-text">
                    <h1>PETER_NDUATI</h1>
                    <p class="role-title">Systems Architect & Blockchain Engineer</p>
                    <p class="dim">LOC: Juja, Kenya | TZ: UTC+3</p>
                </div>
            </section>

            <section class="cv-section">
                <h2 class="section-tag">// SYNOPSIS</h2>
                <p class="bio-text">
                    Dedicated to building high-performance systems from first principles. 
                    Specializing in low-level memory management (C/Rust) and distributed 
                    state machines (Blockchain/MEV). Currently optimizing the 2026 play.
                </p>
            </section>

            <section class="cv-section">
                <h2 class="section-tag">// STACK_DUMP</h2>
                <div class="skills-grid">
                    <div class="skill-category">
                        <h3>SYSTEMS</h3>
                        <ul><li>C/C++</li><li>Rust</li><li>Go</li><li>Linux Kernel</li></ul>
                    </div>
                    <div class="skill-category">
                        <h3>WEB3</h3>
                        <ul><li>EVM Mechanics</li><li>MEV Extraction</li><li>Solidity</li></ul>
                    </div>
                    <div class="skill-category">
                        <h3>INFRA</h3>
                        <ul><li>Docker (from scratch)</li><li>Git (from scratch)</li><li>Node.js</li></ul>
                    </div>
                </div>
            </section>

            <section class="cv-section">
                <h2 class="section-tag">// MISSION_HISTORY</h2>
                <div class="timeline-item">
                    <div class="time-label">2025-2026</div>
                    <div class="time-content">
                        <strong>GDSC JKUAT - Executive Member</strong>
                        <p>Leading blockchain initiatives and technical workshops for 500+ students.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="time-label">2026-PRESENT</div>
                    <div class="time-content">
                        <strong>Full-Stack Portfolio System</strong>
                        <p>Architecting a modular pre-compiled SSG pipeline using Python and Node.js.</p>
                    </div>
                </div>
            </section>

            <footer class="cv-footer">
                [ End of Manual ] - Press Ctrl+K to Navigate
            </footer>
        </div>
    `;
}

// Add this to your global state
const commands = [
    { cmd: 'ls /bin', action: renderProjects, desc: 'List all project executables' },
    { cmd: 'ls /var/log', action: renderBlog, desc: 'List all system logs' },
    { cmd: 'man peter', action: renderAbout, desc: 'Open user manual (CV)' },
    { cmd: 'cd ~', action: renderHome, desc: 'Return to home directory' }
];

// Global Keyboard Listener for 'Ctrl + K'
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
    }
});

function toggleCommandPalette() {
    let palette = document.getElementById('palette');
    if (!palette) {
        palette = document.createElement('div');
        palette.id = 'palette';
        palette.innerHTML = `
            <div class="palette-inner">
                <input type="text" id="cmd-input" placeholder="Type a command (e.g., ls /bin)..." autocomplete="off">
                <div id="cmd-results"></div>
            </div>
        `;
        document.body.appendChild(palette);
    }
    palette.style.display = palette.style.display === 'flex' ? 'none' : 'flex';
    if (palette.style.display === 'flex') document.getElementById('cmd-input').focus();
}

// Logic to execute commands (Simplified)
document.addEventListener('input', (e) => {
    if (e.target.id === 'cmd-input') {
        const val = e.target.value.toLowerCase();
        const results = commands.filter(c => c.cmd.includes(val));
        document.getElementById('cmd-results').innerHTML = results.map(r => `
            <div class="cmd-item" onclick="executeCmd('${r.cmd}')">
                <strong>${r.cmd}</strong> - ${r.desc}
            </div>
        `).join('');
    }
});

function executeCmd(cmdName) {
    const command = commands.find(c => c.cmd === cmdName);
    if (command) {
        command.action();
        toggleCommandPalette();
        document.getElementById('cmd-input').value = '';
    }
}

async function updateTelemetry() {
    const footer = document.querySelector('footer');
    const projectCount = systemState.projects.length;
    const postCount = systemState.posts.length;
    
    // Aesthetic: Simulated memory usage and real-time project count
    footer.innerHTML = `
        SESSION_ID: <span id="session-id">${document.getElementById('session-id').innerText}</span> | 
        OBJ_COUNT: ${projectCount + postCount} | 
        STATUS: STABLE | 
        UPTIME: ${Math.floor(performance.now() / 1000)}s
    `;
}
// Run telemetry every second
setInterval(updateTelemetry, 1000);

async function updateHealth() {
    const res = await fetch('/api/sys-health');
    const health = await res.json();
    document.getElementById('status-bar').innerHTML = 
        `UPTIME: ${Math.floor(health.uptime)}s | MEM: ${(health.memory / 1024 / 1024).toFixed(2)}MB | LAST_BUILD: ${new Date(health.last_build).toLocaleTimeString()}`;
}
setInterval(updateHealth, 5000); // Poll every 5 seconds

boot();