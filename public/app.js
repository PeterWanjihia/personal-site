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

boot();