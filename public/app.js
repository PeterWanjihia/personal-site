let systemState = null;
let isSystemReady = false;

/**
 * CORE: Boot Sequence
 * Synchronizes data fetch with UI initialization.
 */
async function boot() {
    try {
        console.log("[SHELL] Initiating system boot...");
        const res = await fetch('/api/state');
        
        if (!res.ok) throw new Error(`Kernel returned status: ${res.status}`);
        
        systemState = await res.json();
        isSystemReady = true; 
        
        console.log("[SHELL] System state loaded successfully.");
        
        // Default entry view: The Sleek About Page
        renderAbout();
        
        // Initialize Telemetry ONLY after data and DOM are ready
        const sessionId = Math.random().toString(16).substr(2, 8).toUpperCase();
        const sessionIdElement = document.getElementById('session-id');
        if (sessionIdElement) sessionIdElement.innerText = sessionId;

        // Start background monitoring loops
        setInterval(updateTelemetry, 1000);
        setInterval(updateHealth, 5000);
            
    } catch (err) {
        console.error("[SHELL] Boot failed:", err);
        const main = document.getElementById('view-port');
        if (main) {
            main.innerHTML = `
                <h1 style="color: red;">SYSTEM_HALT: BOOT_FAILURE</h1>
                <p>Error: ${err.message}</p>
                <p>Run 'make build' and ensure sys_data.json is valid.</p>
            `;
        }
    }
}

/**
 * VIEW: About / CV Module
 * Optimized for JKUAT (2023-2027) profile.
 */
function renderAbout() {
    const main = document.getElementById('view-port');
    if (!main) return;

    if (!isSystemReady || !systemState.identity) {
        main.innerHTML = "<h1>SYSTEM_INITIALIZING...</h1>";
        return;
    }

    const id = systemState.identity;

    main.innerHTML = `
        <div class="cv-container">
            <header class="cv-header">
                <div class="profile-frame">USER_IMAGE</div>
                <div class="profile-text">
                    <h1>${id.identity.name}</h1>
                    <p class="role-title">${id.identity.role}</p>
                    <div class="contact-strip">
                        <a href="${id.identity.github}" target="_blank">GH://PeterWanjihia</a> | 
                        <span>JKUAT_CS_2023_2027</span>
                    </div>
                </div>
            </header>

            <div class="grid-layout">
                <div class="main-col">
                    <section class="cv-section">
                        <h2 class="section-tag">// EXECUTIVE_SUMMARY</h2>
                        <p class="bio-text">${id.identity.synopsis}</p>
                    </section>

                    <section class="cv-section">
                        <h2 class="section-tag">// MISSION_HISTORY</h2>
                        ${(id.history || []).map(item => `
                            <div class="timeline-item">
                                <div class="time-label">${item.period}</div>
                                <div class="time-content">
                                    <strong>${item.title}</strong>
                                    <p>${item.desc}</p>
                                </div>
                            </div>
                        `).join('')}
                    </section>

                    <section class="cv-section">
                        <h2 class="section-tag">// INTEL_&_INTERESTS</h2>
                        <div class="interest-cloud">
                            ${(id.interests || []).map(i => `<span class="tag">${i}</span>`).join(' ')}
                        </div>
                    </section>
                </div>

                <aside class="sidebar-col">
                    <section class="cv-section">
                        <h2 class="section-tag">// CORE_SPECIALTIES</h2>
                        <div class="specialty-list">
                            ${(id.specialties || []).map(s => `<div class="spec-item">${s}</div>`).join('')}
                        </div>
                    </section>

                    <section class="cv-section">
                        <h2 class="section-tag">// STACK_DUMP</h2>
                        ${Object.entries(id.skills || {}).map(([cat, list]) => `
                            <div class="mini-cat">
                                <h3>${cat}</h3>
                                <ul>${list.map(l => `<li>${l}</li>`).join('')}</ul>
                            </div>
                        `).join('')}
                    </section>
                </aside>
            </div>

            <div class="cv-actions">
                <button onclick="window.print()" class="btn-primary">[ EXPORT_PDF ]</button>
            </div>
        </div>
    `;
    main.scrollTop = 0;
}

/**
 * VIEW: Projects / Bin Module
 */
function renderProjects() {
    const main = document.getElementById('view-port');
    if (!main || !isSystemReady) return;

    main.innerHTML = `<h1>EXECUTABLES (/bin)</h1>` + (systemState.projects || []).map(p => `
        <div class="card">
            <h3>${p.title} [${p.lang}]</h3>
            <p>${p.description}</p>
            <small>STATUS: ${p.status}</small>
        </div>
    `).join('');
}

/**
 * VIEW: Blog / Log Module
 */
function renderBlog() {
    const main = document.getElementById('view-port');
    if (!main || !isSystemReady) return;

    const postsHtml = (systemState.posts || []).map(post => `
        <div class="card" onclick="renderPost('${post.slug}')" style="cursor: pointer;">
            <h3>${post.metadata.title}</h3>
            <small>${post.metadata.date} | TAGS: ${(post.metadata.tags || []).join(', ')}</small>
        </div>
    `).join('');
    
    main.innerHTML = `<h1>SYSTEM_LOGS (/var/log)</h1>` + postsHtml;
}

function renderPost(slug) {
    const main = document.getElementById('view-port');
    if (!main || !isSystemReady) return;

    const post = systemState.posts.find(p => p.slug === slug);
    if (!post) {
        main.innerHTML = `<h1>ERROR: 404_NOT_FOUND</h1>`;
        return;
    }

    main.innerHTML = `
        <div class="post-view">
            <button onclick="renderBlog()" class="btn-primary">[ BACK_TO_LOGS ]</button>
            <h1>${post.metadata.title}</h1>
            <div class="post-meta">DATE: ${post.metadata.date} | SLUG: ${post.slug}</div>
            <div class="post-content">${post.content}</div>
        </div>
    `;
}

/**
 * INTERFACE: Command Palette Logic
 */
const commands = [
    { cmd: 'ls /bin', action: renderProjects, desc: 'List project executables' },
    { cmd: 'ls /var/log', action: renderBlog, desc: 'List system logs' },
    { cmd: 'man peter', action: renderAbout, desc: 'Open user manual (CV)' },
    { cmd: 'cd ~', action: renderAbout, desc: 'Return to home' }
];

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
                <input type="text" id="cmd-input" placeholder="Type command..." autocomplete="off">
                <div id="cmd-results"></div>
            </div>
        `;
        document.body.appendChild(palette);
    }
    palette.style.display = palette.style.display === 'flex' ? 'none' : 'flex';
    if (palette.style.display === 'flex') document.getElementById('cmd-input').focus();
}

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
        const input = document.getElementById('cmd-input');
        if (input) input.value = '';
    }
}

/**
 * OBSERVABILITY: Telemetry & Health Monitoring
 */
async function updateTelemetry() {
    const footer = document.querySelector('footer');
    if (!footer || !isSystemReady) return;

    const projectCount = systemState.projects ? systemState.projects.length : 0;
    const postCount = systemState.posts ? systemState.posts.length : 0;
    const sessionIdElement = document.getElementById('session-id');
    const sessionId = sessionIdElement ? sessionIdElement.innerText : "UNKNOWN";
    
    footer.innerHTML = `
        SESSION_ID: <span id="session-id">${sessionId}</span> | 
        OBJ_COUNT: ${projectCount + postCount} | 
        STATUS: STABLE | 
        UPTIME: ${Math.floor(performance.now() / 1000)}s
    `;
}

async function updateHealth() {
    const statusBar = document.getElementById('status-bar');
    if (!statusBar) return; 

    try {
        const res = await fetch('/api/sys-health');
        if (!res.ok) return;
        const health = await res.json();
        statusBar.innerHTML = `UPTIME: ${Math.floor(health.uptime)}s | MEM: ${(health.memory / 1024 / 1024).toFixed(2)}MB | LAST_BUILD: ${new Date(health.last_build).toLocaleTimeString()}`;
    } catch (err) {
        console.warn("[KERNEL] Health monitor unreachable.");
    }
}

// Initial Boot
boot();