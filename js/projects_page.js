(() => {
/* State */
let PROJECTS = [];
let currentPage = 1;
let activeCategory = "all";

const searchEl = document.getElementById("proj-search");
const sortEl = document.getElementById("proj-sort");
const perpageEl = document.getElementById("proj-perpage");
const gridEl = document.getElementById("proj-grid");
const paginEl = document.getElementById("proj-pagination");
const countEl = document.getElementById("proj-count");
const emptyEl = document.getElementById("proj-empty");
const pillsEl = document.getElementById("filter-pills");

/* Tag label map */
const TAG_LABELS = { remote: "Remote Sensing", spatial: "Spatial Analysis", tool: "Tool", ee: "Earth Engine" }
                        // ml: "Machine Learning", "geo-ai": "GeoAI", dl: "Deep Learning"};
const TAG_CLASS = { remote: "tag-remote", spatial: "tag-spatial", tool: "tag-tool", ee: "tag-ee" }
                    // ml: "tag-ml", "geo-ai": "tag-geo-ai", dl: "tag-dl"};

function getButtonIcon(ctaText) {
    if (ctaText && ctaText.toLowerCase().includes("github")) return '<i class="ph ph-github-logo" style="margin-right:.4em;"></i>';
    if (ctaText && ctaText.toLowerCase().includes("demo"))   return '<i class="ph ph-display"></i>';
    return '';

}

/* Filter + sort logic */
function getFiltered() {
    const q = searchEl.value.trim().toLowerCase();
    let list = PROJECTS.filter(p => {
    const catMatch = activeCategory === "all" || p.tags.includes(activeCategory);
    const searchMatch = !q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    return catMatch && searchMatch;
    });

    const sort = sortEl.value;
    if (sort === "name-asc")  list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "name-desc") list.sort((a, b) => b.title.localeCompare(a.title));
    if (sort === "newest")    list.sort((a, b) => b.date.localeCompare(a.date));
    if (sort === "oldest")    list.sort((a, b) => a.date.localeCompare(b.date));

    return list;
}

/* Render */
function render() {
    const filtered = getFiltered();
    const total = filtered.length;
    const perpageVal = perpageEl.value;
    const perPage = perpageVal === "all" ? total : parseInt(perpageVal);
    const totalPages = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;

    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * perPage;
    const page = perpageVal === "all" ? filtered : filtered.slice(start, start + perPage);

    /* count label */
    countEl.textContent = `${total} project${total !== 1 ? "s" : ""}`;

    /* empty state */
    emptyEl.style.display = total === 0 ? "block" : "none";
    gridEl.style.display = total === 0 ? "none"  : "";

    /* cards */
    gridEl.innerHTML = page.map(p => {
    const tagHTML = p.tags.map(t =>
        `<span class="project-tag ${TAG_CLASS[t]}">${TAG_LABELS[t]}</span>`
    ).join("");
    const buttonIcon = getButtonIcon(p.cta);
    return `
        <div class="col-12 col-md-6 reveal is-visible">
        <article class="project-card h-100">
            <img src="${p.img}" class="project-card-img" alt="${p.imgAlt}" loading="lazy">
            <div class="project-card-body">
            <div>${tagHTML}</div>
            <h2>${p.title}</h2>
            <p>${p.desc}</p>
            <a href="${p.href}" target="${p.target}" rel="noopener"
                class="btn btn-primary btn-sm mt-1">${buttonIcon}${p.cta}</a>
            </div>
        </article>
        </div>`;
    }).join("");

    /* pagination */
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    if (totalPages <= 1) { paginEl.innerHTML = ""; return; }

    const pages = [];
    if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    }

    let html = `<button class="pg-btn" data-pg="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}
                aria-label="Previous page"><i class="ph ph-caret-left"></i></button>`;
    for (const p of pages) {
    if (p === "…") {
        html += `<span class="pg-ellipsis">…</span>`;
    } else {
        html += `<button class="pg-btn${p === currentPage ? " active" : ""}" data-pg="${p}"
                    aria-label="Page ${p}" ${p === currentPage ? 'aria-current="page"' : ""}>${p}</button>`;
    }
    }
    html += `<button class="pg-btn" data-pg="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}
                aria-label="Next page"><i class="ph ph-caret-right"></i></button>`;
    paginEl.innerHTML = html;
}

function goToPage(p) {
    currentPage = p;
    render();
    document.getElementById("proj-grid").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* Event listeners */
searchEl.addEventListener("input",  () => { currentPage = 1; render(); });
sortEl.addEventListener("change",   () => { currentPage = 1; render(); });
perpageEl.addEventListener("change",() => { currentPage = 1; render(); });

pillsEl.addEventListener("click", e => {
    const pill = e.target.closest(".pill");
    if (!pill) return;
    pillsEl.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    activeCategory = pill.dataset.cat;
    currentPage = 1;
    render();
});

paginEl.addEventListener("click", e => {
    const btn = e.target.closest(".pg-btn");
    if (!btn || btn.disabled) return;
    goToPage(parseInt(btn.dataset.pg));
});

/* Loading state */
function showLoading() {
    gridEl.innerHTML = `
    <div class="col-12 text-center py-5" id="proj-loading">
        <div class="spinner-border spinner-border-sm text-secondary mb-3" role="status" aria-hidden="true"></div>
        <p style="color:var(--clr-text-muted); font-size:0.875rem;">Loading projects…</p>
    </div>`;
}

function showError(msg) {
    gridEl.innerHTML = `
    <div class="col-12 text-center py-5">
        <i class="ph ph-warning-circle" style="font-size:2rem; color:var(--clr-text-muted); display:block; margin-bottom:0.75rem;"></i>
        <p style="color:var(--clr-text-muted); font-size:0.875rem;">${msg}</p>
    </div>`;
}

/* Init: fetch projects.json */
showLoading();
fetch("projects/projects.json")
    .then(res => {
    if (!res.ok) throw new Error(`Could not load projects.json (${res.status})`);
    return res.json();
    })
    .then(data => {
    PROJECTS = data;
    render();
    })
    .catch(err => {
    console.error(err);
    showError("Projects could not be loaded. Make sure projects/projects.json exists and you are running a local server.");
    });
})();