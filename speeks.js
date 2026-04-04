/* =========================================================
   SPEEKSNET | UNIVERSAL APP JAVASCRIPT
   ========================================================= */

// --- 1. API URLS ---
const CMS_URL = 'https://script.google.com/macros/s/AKfycbxZviJiiQKcQYyp3SK4tcNBHrHXkID7cmwwuONStVPE9DHCSAMappqAs9dBns7ufECI/exec';
const HOTKEYS_URL = 'https://script.google.com/macros/s/AKfycbyLburcVWM8xAKwDt2RHAQhZBLb_rJjb2__EzhoAKx1KgkNFi-BchVetgaTKvwCwqZiRw/exec';
const DOCS_URL = 'https://script.google.com/macros/s/AKfycbyRLeIuWH3v2lMeFmoWcCohDz_YB-AFOnG_QgPckjiYnjni1dUKm0jRqaXeJGAViSYkQg/exec';
const MONTHLY_KPI_URL = 'https://script.google.com/macros/s/AKfycby0ihq9A4yUQvdZdeAF9euC5jih24hP2XGG-J_balNtxop2RHBuIuigw_mH3XTeCkkhow/exec';
const VARIANCE_API_URL = 'https://script.google.com/macros/s/AKfycbxFO_W-PW4ZT4e5mXlQOhlYl2ccpZ9by8MZ6rF-RJ6x3lryCjbi5XxY7c57vLgfx7k/exec';
const HUB_URL = 'https://script.google.com/macros/s/AKfycbw3Ms5nc2bhbrjVW-da3xbZ3vKhyBx2TpeR-eSd1L05ZhV-h2Yh0yLmIV_E7TWDmwM69A/exec';
const WEEKLY_KPI_URL = 'https://script.google.com/macros/s/AKfycbyVBos-uJuhaqfLMBqoz9byNkvUG06igl4RX2_cs8hH15rbp7K4uFFEN-wpQgS2ChAU/exec';
const AUTH_URL = 'https://script.google.com/macros/s/AKfycbzAOcIrKP-GmKTe9zydMYb6X4yKvkDB3YIPMPSrW8upzw3ci5DyDWq71xIHR3QXJkDh/exec';
const RECORDS_URL = 'https://script.google.com/macros/s/AKfycbwPMcs33YfH84ewJyg3ikqIKZtOJByEI9X2PD3cONtavJk7oJCUnGYbP6sESBE6-j2RSA/exec';

// --- 2. GLOBAL HELPERS & UTILITIES ---
function parseNum(val) {
    if (!val && val !== 0) return 0;
    if (typeof val === 'number') return val;
    let num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
}

// --- 3. GLOBAL UI, MODALS & TABS ---
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    sidebar?.classList.toggle('collapsed');
    mainContent?.classList.toggle('expanded');
    toggleBtn?.classList.toggle('collapsed');
    localStorage.setItem('speeksSidebar', sidebar?.classList.contains('collapsed') ? 'collapsed' : 'expanded');
}

function closeAllModals() {
    ['notifDropdown', 'calendarDropdown', 'manageDocsDropdown', 'globalOverlay'].forEach(id => 
        document.getElementById(id)?.classList.remove('show')
    );
    if (!document.getElementById('authOverlay') || sessionStorage.getItem('speeksManagerUnlocked') === 'true') {
        document.body.classList.remove('no-scroll');
    }
}

// Universal Modal Engine
function toggleModal(modalId, badgeId = null) {
    const dropdown = document.getElementById(modalId);
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains('show');
    closeAllModals(); 
    if (!isOpen) {
        dropdown.classList.add('show');
        document.getElementById('globalOverlay')?.classList.add('show');
        if (badgeId) document.getElementById(badgeId)?.classList.remove('active');
        document.body.classList.add('no-scroll');
    }
}

function toggleNotifs() { toggleModal('notifDropdown', 'notifBadge'); }
function toggleCalendar() { toggleModal('calendarDropdown'); }

function switchAnnTab(tab) {
    const isRecent = tab === 'recent';
    document.getElementById('ann-container').style.display = isRecent ? 'block' : 'none';
    document.getElementById('archive-container').style.display = isRecent ? 'none' : 'block';
    document.getElementById('tab-recent').classList.toggle('active', isRecent);
    document.getElementById('tab-archive').classList.toggle('active', !isRecent);
}

window.addEventListener('click', (e) => { if (e.target === document.getElementById('globalOverlay')) closeAllModals(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });

// --- 4. GLOBAL DATA FETCHING (CMS) ---
async function loadCMS() {
    try {
        const response = await fetch(`${CMS_URL}?v=${Date.now()}`);
        const data = await response.json();
        
        const annContainer = document.getElementById('ann-container');
        if (annContainer) {
            let showBadge = false, recentHtml = "", archiveHtml = "", recentCount = 0, archiveCount = 0;
            if (data.announcements && data.announcements.length > 0) {
                const sortedAnns = [...data.announcements].reverse();
                const today = new Date(); today.setHours(0,0,0,0);

                sortedAnns.forEach(item => {
                    let displayDate = "", isArchived = false;
                    if (item.date) {
                        const annDate = new Date(item.date);
                        if (!isNaN(annDate.getTime())) {
                            displayDate = annDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                            const diffDays = (today - new Date(annDate.getFullYear(), annDate.getMonth(), annDate.getDate())) / 86400000;
                            if (diffDays <= 1 && diffDays >= 0) showBadge = true;
                            if (diffDays > 2) isArchived = true;
                        }
                    }
                    const html = `<div class="notif-item"><div class="ann-header"><span class="ann-author">${item.author || 'Announcement'}</span>${displayDate ? `<small class="ann-date">${displayDate}</small>` : ''}</div><hr /><div class="ann-text">${item.text || ''}</div></div>`;
                    isArchived ? (archiveHtml += html, archiveCount++) : (recentHtml += html, recentCount++);
                });
                recentHtml = recentCount === 0 ? '<div style="padding: 20px; color:#999; text-align:center;">No recent announcements</div>' : recentHtml;
                archiveHtml = archiveCount === 0 ? '<div style="padding: 20px; color:#999; text-align:center;">No archived announcements</div>' : archiveHtml;
            } else {
                recentHtml = archiveHtml = '<div style="padding: 20px; color:#999; text-align:center;">No announcements</div>';
            }
            annContainer.innerHTML = recentHtml;
            document.getElementById('archive-container').innerHTML = archiveHtml;
            if (showBadge) document.getElementById('notifBadge')?.classList.add('active');
        }

        const activeContainer = document.getElementById('active-container');
        if (activeContainer) {
            const act = data.active || [], upc = data.upcoming || [];
            activeContainer.innerHTML = act.length ? act.map(t => `<div class="cms-item cms-active">${t}</div>`).join('') : '<div class="cms-item">No active projects</div>';
            document.getElementById('upcoming-container').innerHTML = upc.length ? upc.map(t => `<div class="cms-item cms-upcoming">${t}</div>`).join('') : '<div class="cms-item">No upcoming projects</div>';
        }
    } catch (e) { console.error("CMS Failed", e); }
}

// --- 5. MODULE: HUB / HOTKEYS ---
async function loadHotkeys() {
    const tbody = document.getElementById('kbBody');
    if (!tbody) return;
    try {
        const data = await (await fetch(`${HOTKEYS_URL}?v=${Date.now()}`)).json();
        tbody.innerHTML = data.map(row => {
            const cols = Object.values(row), brand = cols[1] || "";
            if (brand.toLowerCase() === "brand" || !brand) return '';
            const bClass = brand.toLowerCase().includes('apple') ? 'b-apple' : (['dell','hp','lenovo','asus'].some(x => brand.toLowerCase().includes(x)) ? 'b-windows' : 'b-generic');
            return `<tr><td><span class="bubble ${bClass}">${brand}</span></td><td>${cols[2]}</td><td>${cols[3]}</td><td>${cols[4]}</td><td>${cols[5]}</td></tr>`;
        }).join('');
    } catch (e) {}
}

function filterKB() {
    const filter = document.getElementById("kbSearch").value.toUpperCase();
    const rows = document.getElementById("kbBody").getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++) rows[i].style.display = (rows[i].textContent || rows[i].innerText).toUpperCase().includes(filter) ? "" : "none";
}

// --- 6. MODULE: DOCS & POLICIES ---
let globalDocsData = []; 

function toggleManageDocs() {
  const dropdown = document.getElementById('manageDocsDropdown');
  if(!dropdown) return;
  if (!dropdown.classList.contains('show')) {
    const enteredPin = prompt("Please enter the PIN to manage policies:");
    if (enteredPin !== "2770") return enteredPin !== null ? alert("Incorrect PIN.") : null; 
  }
  populateManageModal();
  toggleModal('manageDocsDropdown');
}

function populateManageModal() {
    const list = document.getElementById('manageDocsList');
    list.innerHTML = '';
    globalDocsData.length === 0 ? addManageRow() : globalDocsData.forEach(doc => addManageRow(doc));
}

function addManageRow(doc = { category: '', icon: '📄', title: '', desc: '', link: '' }) {
    let baseCat = doc.category || '', isPinned = baseCat.toLowerCase().includes('pinned');
    if (isPinned) baseCat = baseCat.replace(/,?\s*["']?pinned["']?/ig, '').trim();

    const row = document.createElement('div'); row.className = 'manage-row';
    row.innerHTML = `
        <input type="text" class="m-category" placeholder="Category" value="${baseCat}">
        <label class="pin-label"><input type="checkbox" class="m-pinned" ${isPinned ? 'checked' : ''}> Pin</label>
        <input type="text" class="m-icon" placeholder="Icon" value="${doc.icon || ''}">
        <input type="text" class="m-title" placeholder="Title" value="${doc.title || ''}">
        <textarea class="m-desc" placeholder="Description">${doc.desc || ''}</textarea>
        <input type="text" class="m-link" placeholder="URL Link" value="${doc.link || ''}">
        <button class="del-btn" onclick="this.parentElement.remove()" title="Delete">✖</button>`;
    document.getElementById('manageDocsList').appendChild(row);
}

async function saveDocs() {
    const btn = document.getElementById('saveDocsBtn'), updatedDocs = [];
    document.querySelectorAll('.manage-row').forEach(row => {
        const title = row.querySelector('.m-title').value.trim();
        if(title) updatedDocs.push({
            category: row.querySelector('.m-pinned').checked ? (row.querySelector('.m-category').value.trim() ? `${row.querySelector('.m-category').value.trim()}, Pinned` : 'Pinned') : row.querySelector('.m-category').value.trim(),
            icon: row.querySelector('.m-icon').value.trim(), title: title,
            desc: row.querySelector('.m-desc').value.trim(), link: row.querySelector('.m-link').value.trim()
        });
    });

    btn.textContent = "Saving..."; btn.style.opacity = "0.7";
    try {
        const res = await fetch(DOCS_URL, { method: 'POST', body: JSON.stringify(updatedDocs) });
        if(res.ok) {
            globalDocsData = updatedDocs; localStorage.setItem('speeksDocsData', JSON.stringify(updatedDocs));
            renderDocs(updatedDocs); closeAllModals();
        } else alert("Error saving data.");
    } catch (e) { alert("Failed to connect to server."); } 
    finally { btn.textContent = "Save Changes"; btn.style.opacity = "1"; }
}

function renderDocs(docs) {
    const container = document.getElementById('content-container');
    if (!container) return;
    if (!docs || docs.length === 0) return container.innerHTML = '<div class="empty-state">No documents found.</div>';
    
    const groupedDocs = {};
    docs.forEach(doc => {
        let cleanCat = (doc.category || "Uncategorized").replace(/,?\s*["']?pinned["']?/ig, '').trim() || "General"; 
        if (!groupedDocs[cleanCat]) groupedDocs[cleanCat] = [];
        groupedDocs[cleanCat].push(doc);
        if ((doc.category || "").toLowerCase().includes('pinned')) {
            if (!groupedDocs['📌 Pinned']) groupedDocs['📌 Pinned'] = [];
            groupedDocs['📌 Pinned'].push(doc);
        }
    });

    container.innerHTML = Object.keys(groupedDocs).sort((a, b) => a === '📌 Pinned' ? -1 : (b === '📌 Pinned' ? 1 : a.localeCompare(b))).map(cat => {
        const isPin = cat === '📌 Pinned';
        return `<div class="category-section"><div class="category-title" style="${isPin ? 'color: var(--idea-gold); border-bottom-color: var(--idea-gold);' : ''}">${cat}</div><div class="docs-grid">` + 
            groupedDocs[cat].map(item => `<a href="${item.link}" target="_blank" class="doc-card" style="${isPin ? 'position: relative; border: 1px solid var(--idea-gold); box-shadow: 0 4px 10px rgba(245, 158, 11, 0.08);' : 'position: relative;'}" data-search="${`${item.title} ${item.desc} ${cat}`.toLowerCase()}">${isPin ? `<div style="position: absolute; top: 12px; right: 15px; font-size: 16px; filter: drop-shadow(0 2px 4px rgba(245,158,11,0.3));">📌</div>` : ''}<div class="doc-icon">${item.icon}</div><div class="doc-info"><div class="doc-title">${item.title}</div><div class="doc-desc">${item.desc}</div></div></a>`).join('') + `</div></div>`;
    }).join('');
    filterDocs();
}

async function loadDocs() {
    const cached = localStorage.getItem('speeksDocsData');
    if (cached) try { renderDocs(globalDocsData = JSON.parse(cached)); } catch (e) {}
    else document.getElementById('content-container').innerHTML = '<div class="empty-state">Loading Documents...</div>';

    try {
        globalDocsData = await (await fetch(`${DOCS_URL}?v=${Date.now()}`)).json();
        localStorage.setItem('speeksDocsData', JSON.stringify(globalDocsData));
        renderDocs(globalDocsData);
    } catch (e) { if (!cached) document.getElementById('content-container').innerHTML = '<div class="empty-state">Failed to load documents.</div>'; }
}

function filterDocs() {
    const search = document.getElementById('docSearch')?.value.toLowerCase() || "";
    let hasVis = false;
    document.querySelectorAll('.doc-card').forEach(c => {
        const match = c.getAttribute('data-search').includes(search);
        c.classList.toggle('hidden', !match);
        if (match) hasVis = true;
    });
    document.querySelectorAll('.category-section').forEach(s => s.classList.toggle('hidden', !s.querySelectorAll('.doc-card:not(.hidden)').length));
    document.getElementById('noResults')?.classList.toggle('hidden', hasVis || search === '');
}

// --- 7. MODULE: MANAGER DASHBOARD ---
let dynamicMonths = [], rawKPIData = [], monthlyKpiCache = {}, weeklyKpiCache = {}, liveVarianceDataCache = {}, hubDataCache = null, authFetchPromise = null;

function startAuthFetch() { authFetchPromise = fetch(`${AUTH_URL}?v=${Date.now()}`).then(r => r.ok ? r.json() : null).catch(() => null); }
async function hashString(str) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)))).map(b => b.toString(16).padStart(2, '0')).join(''); }

async function checkPIN() {
    const pin = document.getElementById('pinInput').value, 
          err = document.getElementById('pinError'), 
          btn = document.getElementById('unlockBtn');
          
    if(!pin) return;
    btn.innerText = "Verifying..."; 
    btn.style.opacity = "0.7"; 
    err.style.display = 'none';

    try {
        const payload = await authFetchPromise;
        if (!payload || !payload.users) throw new Error();
        
        // 1. Hash the PIN outside of the loop first
        const hashedPin = await hashString(pin);
        
        // 2. Use the already-hashed PIN inside the synchronous .find() method
        const matched = payload.users.find(u => String(u.hash).toLowerCase() === hashedPin.toLowerCase());
        
        if (matched) {
            sessionStorage.setItem('speeksManagerUnlocked', 'true'); 
            sessionStorage.setItem('speeksActiveManager', matched.name);
            // Save the new backend data
            sessionStorage.setItem('speeksUserRole', matched.role ? matched.role.toLowerCase() : 'employee');
            sessionStorage.setItem('speeksUserStore', matched.store ? matched.store.toUpperCase() : 'ALL');
            
            document.getElementById('authOverlay').style.display = 'none'; 
            document.body.style.overflow = 'auto';
            
            applyRoleBasedUI(); // Apply the defaults BEFORE fetching data
            initDashboardData();
        } else {
            err.innerText = "Incorrect PIN. Please try again."; 
            err.style.display = 'block'; 
            document.getElementById('pinInput').value = ''; 
        }
    } catch (e) { 
        err.innerText = "Connection/Security Error."; 
        err.style.display = 'block'; 
    } finally { 
        btn.innerText = "Unlock Portal"; 
        btn.style.opacity = "1"; 
    }
}

function formatSmartValue(val, name) {
    if (val === null || val === undefined || String(val).trim() === '') return '-';
    let num = parseFloat(val), nameL = name.toLowerCase();
    if (isNaN(num)) return String(val).trim();
    if (nameL.match(/%|rate|variance|margin|gm|cogs/)) return `${num.toFixed(2).replace(/\.00$/, '')}%`;
    const isCur = nameL.match(/sales|cost|refund|discount|profit|value|buying|confiscation/) || nameL === 'recycled inventory';       
    if (isCur && !nameL.match(/ranking|score|reviews|#|returning|time|gm/)) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num).replace(/\.00$/, '');
    return new Intl.NumberFormat('en-US').format(num);
}

function generateSparklineSVG(dataArray) {
    const valid = (dataArray || []).map(v => parseFloat(String(v).replace(/[$,%]/g, ''))).filter(n => !isNaN(n));
    if (!valid.length) return '';
    const min = Math.min(...valid), range = Math.max(...valid) - min || 1;
    return `<svg class="sparkline" viewBox="0 0 70 20"><path d="M ${valid.map((v, i) => `${2 + (i / (valid.length - 1)) * 66},${2 + 16 - ((v - min) / range) * 16}`).join(' L ')}"></path></svg>`;
}

function toggleCategory(el) { el.parentElement.classList.toggle('collapsed'); }

function groupKPIs(data) {
    const cats = { "Buying Metrics": [], "Inventory": [], "Gross Sales": [], "Net Sales & Margins": [], "Sales Channels": [], "Shipping Costs": [], "Rankings & Reviews": [], "Recycled & Confiscated": [], "Other Metrics": [] };
    const ignore = ['ebay rank', 'defect rate', 'late shipment', 'case w/no resolution', 'tracking uploaded', 'top rated', 'cases closed'];
    let all = [];
    if (Array.isArray(data)) data.forEach(item => item.metrics ? all.push(...item.metrics) : (item.name && all.push(item)));
    all.forEach(m => {
        if (!m?.name) return;
        let n = m.name.toLowerCase().replace(/\s+/g, ' ').trim();
        if (ignore.some(iw => n.includes(iw))) return; 
        if (n.match(/buying|buy vs|close rate|# of customers|buy value|# of items|returning|avg trans/)) cats["Buying Metrics"].push(m);
        else if (n.match(/inventory cost|% of inventory over/)) cats["Inventory"].push(m);
        else if (n.match(/gross sales|discount|refund|return/)) cats["Gross Sales"].push(m);
        else if (n.match(/net sales|cogs|gross profit/)) cats["Net Sales & Margins"].push(m);
        else if (n.match(/draft order|pos|online|non ebay/)) cats["Sales Channels"].push(m);
        else if (n.includes("shipping")) cats["Shipping Costs"].push(m);
        else if (n.match(/paymore|google/)) cats["Rankings & Reviews"].push(m);
        else if (n.match(/recycled|confiscation/)) cats["Recycled & Confiscated"].push(m);
        else cats["Other Metrics"].push(m);
    });
    return Object.keys(cats).map(c => ({ category: c, metrics: cats[c] })).filter(g => g.metrics.length > 0);
}

async function fetchKPIData(isRetry = false) {
    const store = document.getElementById('kpiStoreSelect')?.value, cont = document.getElementById('kpiDashboardContainer');
    if(!cont) return;

    const setDD = (p, c, arr) => {
        const currP = p.options[p.selectedIndex]?.text, currC = c.options[c.selectedIndex]?.text;
        p.innerHTML = ''; c.innerHTML = ''; arr.forEach((m, i) => { p.add(new Option(m, i)); c.add(new Option(m, i)); });
        p.value = arr.indexOf(currP) !== -1 ? arr.indexOf(currP) : arr.length - 1; 
        c.value = arr.indexOf(currC) !== -1 ? arr.indexOf(currC) : Math.max(0, arr.length - 2); 
    };

    if (monthlyKpiCache[store]) {
        dynamicMonths = monthlyKpiCache[store].months; rawKPIData = monthlyKpiCache[store].data;
        setDD(document.getElementById('primaryMonthSelect'), document.getElementById('compareMonthSelect'), dynamicMonths);
        return renderKPIDashboard(); 
    }
    
    try {
        const payload = await (await fetch(`${MONTHLY_KPI_URL}?store=${store}&v=${Date.now()}`)).json();
        monthlyKpiCache[store] = { months: payload.months, data: groupKPIs(payload.data) };
        dynamicMonths = monthlyKpiCache[store].months; rawKPIData = monthlyKpiCache[store].data;
        setDD(document.getElementById('primaryMonthSelect'), document.getElementById('compareMonthSelect'), dynamicMonths);
        renderKPIDashboard();
    } catch (e) { console.error("Monthly KPI fetch failed:", e); }
}

function renderKPIDashboard() {
    const store = document.getElementById('kpiStoreSelect').value, pIdx = document.getElementById('primaryMonthSelect').value, cIdx = document.getElementById('compareMonthSelect').value, cont = document.getElementById('kpiDashboardContainer');
    document.getElementById('header-primary-label').innerText = dynamicMonths[pIdx]; document.getElementById('header-compare-label').innerText = dynamicMonths[cIdx];
    const vId = `kpi-view-${store}-${pIdx}-${cIdx}`;
    Array.from(cont.children).forEach(c => c.style.display = 'none');
    if (document.getElementById(vId)) return document.getElementById(vId).style.display = 'block';

    setTimeout(() => {
        const newView = document.createElement('div'); newView.id = vId;
        newView.innerHTML = rawKPIData.map(cat => `<div class="kpi-category"><div class="kpi-category-header" onclick="toggleCategory(this)">${cat.category}<span class="chevron">▼</span></div><div class="kpi-category-content">` + 
            cat.metrics.map(m => {
                const rP = m.values[pIdx], rC = m.values[cIdx], dNum = parseNum(rP) - parseNum(rC);
                let dStr = m.name.toLowerCase().match(/%|rate|variance|margin|gm|cogs/) ? `${Math.abs(dNum).toFixed(2).replace(/\.00$/, '')}%` : formatSmartValue(Math.abs(dNum), m.name);
                let bClass = 'delta-neutral', sign = '';
                if (Math.abs(dNum) > 0.001) { sign = dNum > 0 ? '+' : '-'; bClass = dNum > 0 ? (m.inverse ? 'delta-neg' : 'delta-pos') : (m.inverse ? 'delta-pos' : 'delta-neg'); } else dStr = '0';
                return `<div class="kpi-row"><div class="kpi-name-col"><span class="kpi-name">${m.name}</span>${generateSparklineSVG(m.values)}</div><div class="kpi-value-col kpi-primary-val">${formatSmartValue(rP, m.name)}</div><div class="kpi-value-col" style="color: #888;">${formatSmartValue(rC, m.name)}</div><div class="kpi-delta-col"><span class="delta-badge ${bClass}">${sign}${dStr}</span></div></div>`;
            }).join('') + `</div></div>`).join('');
        cont.appendChild(newView);
    }, 10);
}

function formatVariancePct(num) { return Math.abs(num) < 0.001 ? '0.00%' : `${num < 0 ? '-' : '+'}${Math.abs(num).toFixed(2)}%`; }

function createVarianceStoreCard(sKey) {
    if (sKey === "NONE" || !liveVarianceDataCache[sKey]?.employees) return '';
    const d = liveVarianceDataCache[sKey];
    let pTxt = "Current", isNew = d.fileDate && (Date.now() - d.fileDate) < 604800000;
    if (d.fileName) pTxt = d.fileName.replace(new RegExp(`${sKey}\\s*`, 'i'), '').trim().replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/ig, m => ({"Jan":"January","Feb":"February","Mar":"March","Apr":"April","May":"May","Jun":"June","Jul":"July","Aug":"August","Sep":"September","Oct":"October","Nov":"November","Dec":"December"}[m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()] || m));
    
    return `<div style="border: 1px solid #eee; border-radius: 12px; background: white; overflow: hidden;"><div style="background: #f9fafb; padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-start;"><div style="display: flex; flex-direction: column; gap: 8px;"><div style="display: flex; align-items: center;"><span style="font-size: 16px; font-weight: 900; color: var(--slate-charcoal); text-transform: uppercase;">${sKey} TOTAL</span>${isNew ? `<span class="vw-pulse-badge" title="New Report Added This Week">🚨 NEW</span>` : ''}</div><div><span style="background: #e2e8f0; color: #334155; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">🗓️ ${pTxt}</span></div></div><span class="delta-badge ${d.total < 0 ? 'delta-neg' : (d.total > 0 ? 'delta-pos' : 'delta-neutral')}" style="font-size: 16px; padding: 8px 14px;">${formatVariancePct(d.total)}</span></div><div class="vw-scroll-area" style="display: flex; flex-direction: column;">${d.employees.map(e => `<div class="kpi-row" style="padding: 0 20px; height: 48px; grid-template-columns: 1fr auto; border-top: 1px solid #f5f5f5; border-radius: 0; border-left: none; border-right: none; margin: 0; background: white;"><span class="kpi-name">${e.name}</span><span class="delta-badge ${e.val < 0 ? 'delta-neg' : (e.val > 0 ? 'delta-pos' : 'delta-neutral')}">${formatVariancePct(e.val)}</span></div>`).join('')}</div></div>`;
}

function renderVariance() {
    const p = document.getElementById('vw-primary')?.value, c = document.getElementById('vw-compare')?.value, cont = document.getElementById('vw-dashboard-container');
    if(!cont || !p) return;
    cont.style.gridTemplateColumns = c === "NONE" ? "1fr" : "1fr 1fr"; cont.innerHTML = createVarianceStoreCard(p) + createVarianceStoreCard(c);
}

async function fetchVarianceData() {
    const cont = document.getElementById('vw-dashboard-container'); if(!cont) return;
    try {
        const d = await (await fetch(`${VARIANCE_API_URL}?v=${Date.now()}`)).json();
        if (d.error) return cont.innerHTML = `<div style="padding: 40px; text-align: center; color: #dc2626; font-weight: 600; grid-column: 1 / -1;">Error: ${d.error}</div>`;
        liveVarianceDataCache = d; renderVariance();
    } catch (e) { cont.innerHTML = '<div style="padding: 40px; text-align: center; color: #dc2626; font-weight: 600; grid-column: 1 / -1;">Failed to sync Variance data.</div>'; }
}

function formatTime(val) {
    if (!val) return ""; let s = String(val).trim();
    if (!s.includes(':')) return s.includes('.') ? s.split('.')[0] + ':' + (s.split('.')[1] + '0').substring(0,2) : (!isNaN(s) ? s + ':00' : s);
    return s.length <= 5 ? s : s;
}

function checkRule(r, v) {
    if (!v) return false; let n = parseNum(v);
    if (r === 'margin') return n < 51; if (r === 'conversion') return n < 85; if (r === 'nodeals') return n > 7;
    if (r === 'time') return (String(v).includes(':') ? parseInt(v.split(':')[0]) + (parseInt(v.split(':')[1])/60) : n) > 13;
    return false;
}

async function fetchWeeklyKPIs() {
    const cont = document.getElementById('weeklyKpiContainer'), store = document.getElementById('weeklyKpiStoreSelect')?.value, pB = document.getElementById('weeklyKpiPeriod');
    if(!cont || !store) return;
    const vId = `weekly-view-${store}`; Array.from(cont.children).forEach(c => c.style.display = 'none');
    
    if (document.getElementById(vId)) {
        document.getElementById(vId).style.display = 'contents'; 
        if (weeklyKpiCache[store]?.periodText) { pB.innerText = weeklyKpiCache[store].periodText; pB.style.display = "inline-block"; } else pB.style.display = "none"; return; 
    }

    let msg = document.getElementById('weekly-fetch-msg') || Object.assign(document.createElement('div'), { id: 'weekly-fetch-msg', style: 'padding: 40px; text-align: center; color: #888; font-weight: 600; grid-column: 1 / -1;' });
    if(!document.getElementById('weekly-fetch-msg')) cont.appendChild(msg); msg.innerText = 'Syncing...'; msg.style.display = 'block';

    try {
        const d = await (await fetch(`${WEEKLY_KPI_URL}?store=${store}&time=4-Week&v=${Date.now()}`)).json();
        let sAvg = {}, emps = [], fIdx = -1, sIdx = d.findLastIndex(r => String(r[0]).trim().toLowerCase() === "store");
        if (sIdx !== -1) {
            let st = d[sIdx]; sAvg = { buyVal: st[2], buyMargin: st[5], customers: st[6], conversion: st[8], time: formatTime(st[12]), noDeals: st[14], listed: st[20] };
            for (let i = Math.max(0, sIdx - 6); i <= Math.min(d.length - 1, sIdx + 6); i++) {
                if (i === sIdx) continue;
                let n = String(d[i][0]).trim(), lN = n.toLowerCase();
                if (n && !["name", "employee", "store", "store total", "ovl", "lee", "wsp", "mpl", "bal"].includes(lN) && !lN.includes("average") && !lN.includes("week")) {
                    if (String(d[i][2]).trim() !== "" || String(d[i][20]).trim() !== "") {
                        if (fIdx === -1) fIdx = i; 
                        emps.push({ name: n, buyVal: d[i][2], buyMargin: d[i][5], customers: d[i][6], conversion: d[i][8], time: formatTime(d[i][12]), noDeals: d[i][14], listed: d[i][20] });
                    }
                }
            }
        }

        let pTxt = "";
        if (fIdx !== -1) {
            let hR = d[fIdx - 3] || d[fIdx - 2];
            if (hR && hR[2] && hR[4] && hR[6]) pTxt = `🗓️ ${String(hR[2]).replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/ig, m => ({"Jan":"January","Feb":"February","Mar":"March","Apr":"April","May":"May","Jun":"June","Jul":"July","Aug":"August","Sep":"September","Oct":"October","Nov":"November","Dec":"December"}[m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()] || m))} ${hR[4]}-${hR[6]}`;
        }
        weeklyKpiCache[store] = { periodText: pTxt }; pB.innerText = pTxt; pB.style.display = pTxt ? "inline-block" : "none";

        if (!emps.length) { msg.innerText = 'No employee data.'; msg.style.color = '#dc2626'; return; }

        const bCol = (t, s1, sb, e1, eb, rN, pB) => `<div style="border: 1px solid #eee; border-radius: 12px; background: white; overflow: hidden;"><div style="background: #f9fafb; padding: 15px; border-bottom: 1px solid #eee; text-align: center;"><h4 style="font-size: 12px; font-weight: 800; color: var(--slate-charcoal); text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px; white-space: nowrap;">${t}</h4><div style="display: grid; grid-template-columns: 1fr 75px 55px; align-items: center; background: white; padding: 0 12px; height: 40px; border-radius: 8px; border: 1px solid #eee; gap: 8px;"><span style="font-size: 11px; font-weight: 800; color: #888; text-align: left;">STORE TOTAL</span><span style="font-size: 13px; font-weight: 800; text-align: right; white-space: nowrap; ${checkRule(rN, s1) ? 'color: var(--red-alert);' : 'color: var(--slate-charcoal);'}">${s1 || ''}</span>${eb && sb ? `<span style="display: flex; justify-content: flex-end;"><span class="delta-badge ${checkRule(rN, sb) ? 'delta-neg' : 'delta-neutral'}">${sb}${pB && !String(sb).includes('%') ? '%' : ''}</span></span>` : '<span></span>'}</div></div><div style="display: flex; flex-direction: column;">${emps.map(e => `<div class="kpi-row" style="display: grid; grid-template-columns: 1fr 75px 55px; align-items: center; padding: 0 15px; height: 48px; border-top: 1px solid #f5f5f5; border-radius: 0; background: white; margin: 0; border-left: none; border-right: none; gap: 8px;"><span class="kpi-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${e.name}</span><span style="text-align: right; font-size: 12px; font-weight: ${checkRule(rN, e[e1]) ? '900' : '700'}; color: ${checkRule(rN, e[e1]) ? 'var(--red-alert)' : '#555'}; white-space: nowrap;">${e[e1] || ''}</span>${eb && e[eb] ? `<span style="display: flex; justify-content: flex-end;"><span class="delta-badge ${checkRule(rN, e[eb]) ? 'delta-neg' : 'delta-neutral'}">${e[eb]}${pB && !String(e[eb]).includes('%') ? '%' : ''}</span></span>` : '<span></span>'}</div>`).join('')}</div></div>`;

        msg.style.display = 'none'; const nV = document.createElement('div'); nV.id = vId; nV.style.display = 'contents';
        nV.innerHTML = bCol('Buying Performance', sAvg.buyVal, sAvg.buyMargin, 'buyVal', 'buyMargin', 'margin', true) + bCol('Customer Conversion', sAvg.customers, sAvg.conversion, 'customers', 'conversion', 'conversion', true) + bCol('No Deals', '', sAvg.noDeals, '', 'noDeals', 'nodeals', false) + bCol('Avg Trans. Time', '', sAvg.time, '', 'time', 'time', false) + bCol('Processed / Listed', sAvg.listed, '', 'listed', '', null, false);
        cont.appendChild(nV);
    } catch (e) { msg.innerText = 'Failed to load Weekly KPI.'; msg.style.color = '#dc2626'; }
}

async function fetchHubData() {
    try { hubDataCache = await (await fetch(`${HUB_URL}?v=${Date.now()}`)).json(); if (document.getElementById('bs-buy-val')) renderBuyingSales(); if (document.getElementById('rev-list')) renderLiveData(hubDataCache); } catch(e) {}
}

function renderBuyingSales() {
    if(!hubDataCache) return; const store = document.getElementById('bsStoreSelect')?.value.toLowerCase(); if(!store) return;
    let bV = parseNum(hubDataCache[`${store}BuyVal`]), bP = parseNum(hubDataCache[`${store}BuyProj`]), mN = parseNum(hubDataCache[`${store}BuyMargin`]) * (String(hubDataCache[`${store}BuyMargin`]).includes('%') ? 1 : 100);
    document.getElementById('bs-buy-val').innerText = `$${Math.round(bV).toLocaleString()}`; document.getElementById('bs-buy-proj').innerText = `$${Math.round(bP).toLocaleString()}`;
    let mb = document.getElementById('bs-buy-margin'); mb.innerText = mN.toFixed(1) + '%'; mb.className = mN > 0 && mN < 51 ? 'delta-badge delta-neg' : 'delta-badge delta-neutral';
    let p = parseNum(hubDataCache[`${store}Pct`]); p = Math.round(p > 0 && p <= 1 && !String(hubDataCache[`${store}Pct`]).includes('%') ? p * 100 : p);
    document.getElementById('bs-pct').innerText = p + '%'; document.getElementById('bs-goal').innerText = `Goal: $${Math.round(parseNum(hubDataCache[`${store}Goal`])).toLocaleString()}`; document.getElementById('bs-t-gp').innerText = `$${Math.round(parseNum(hubDataCache[`${store}TrackGP`])).toLocaleString()}`;
    let bar = document.getElementById('bs-bar'); if(bar) { bar.style.strokeDashoffset = 402 - (Math.min(p, 100)/100)*402; bar.style.stroke = p < 100 ? "var(--red-alert)" : "var(--sage-professional)"; }
}

async function initChecklists() {
    const actM = sessionStorage.getItem('speeksActiveManager'), cont = document.getElementById('dynamicChecklistContainer');
    if (!actM || !cont) return; 
    let tCache = `speeksTasksCache_${actM}`, sCache = `speeksCheckState_${actM}`, tasks = JSON.parse(localStorage.getItem(tCache) || '[]'), state = JSON.parse(localStorage.getItem(sCache) || '{}');

    const rndr = (tArr, s) => {
        const bC = (tit, ic, ts) => `<div class="card" style="margin-bottom: 0; padding: 25px;"><div class="checklist-header">${ic} ${tit} Checklist</div>${ts.length ? ts.map(t => `<label class="checklist-item"><input type="checkbox" id="chk_${t.text.replace(/[^a-zA-Z0-9]/g, '')}" ${s["chk_"+t.text.replace(/[^a-zA-Z0-9]/g, '')] ? 'checked' : ''}> ${t.text}</label>`).join('') : `<div style="color:#888; font-size:12px; font-weight:600;">No tasks assigned.</div>`}</div>`;
        cont.innerHTML = bC('Daily', '⚡', tArr.filter(t => t.category === 'daily')) + bC('Weekly', '🔄', tArr.filter(t => t.category === 'weekly')) + bC('Monthly', '🎯', tArr.filter(t => t.category === 'monthly'));
        cont.querySelectorAll('input[type="checkbox"]').forEach(b => b.addEventListener('change', e => { state[b.id] = e.target.checked; localStorage.setItem(sCache, JSON.stringify(state)); fetch(AUTH_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ name: actM, checkState: state }) }).catch(()=>{}); }));
    };
    if (tasks.length) rndr(tasks, state);
    const pld = await authFetchPromise;
    if (pld?.users && pld?.tasks) {
        const u = pld.users.find(u => String(u.name).toLowerCase() === actM.toLowerCase());
        if (u?.checkState) try { state = JSON.parse(u.checkState); localStorage.setItem(sCache, JSON.stringify(state)); } catch(e) {}
        localStorage.setItem(tCache, JSON.stringify(tasks = pld.tasks.filter(t => ['all', actM.toLowerCase()].includes(t.manager)))); rndr(tasks, state);
    }
}

async function preloadAllStores() {
    if(!document.getElementById('kpiDashboardContainer')) return;
    ["OVL", "LEE", "WSP", "MPL", "BAL"].forEach(async s => { if (!monthlyKpiCache[s]) try { const p = await (await fetch(`${MONTHLY_KPI_URL}?store=${s}&v=${Date.now()}`)).json(); if (!p.error) monthlyKpiCache[s] = { months: p.months, data: groupKPIs(p.data) }; } catch(e) {} });
}

function initDashboardData() { initChecklists(); setTimeout(fetchHubData, 100); setTimeout(fetchVarianceData, 300); setTimeout(fetchWeeklyKPIs, 500); setTimeout(fetchKPIData, 700); setTimeout(preloadAllStores, 4000); }

// --- 8. MODULE: METRICS (CHARTS & RECORDS) ---
let mainChartInstance = null, currentTimeframe = '4-Week', recordsCache = JSON.parse(localStorage.getItem('speeksRecordsCache')) || null, kpiChartCache = JSON.parse(localStorage.getItem('speeksKpiChartCache')) || { '4-Week': null, 'Monthly': null };

function switchPageTab(tab) {
    ['trends', 'records'].forEach(t => { document.getElementById('pane-' + t)?.classList.toggle('active', t === tab); document.getElementById('tab-btn-' + t)?.classList.toggle('active', t === tab); });
    if (tab === 'records') renderRecords();
}

function setTimeframe(t) { currentTimeframe = t; document.getElementById('btn-4week')?.classList.toggle('active', t === '4-Week'); document.getElementById('btn-monthly')?.classList.toggle('active', t === 'Monthly'); loadKpiData(); }

function loadKpiData() { const m = document.getElementById('metricSelector')?.value; if (!m) return; kpiChartCache[currentTimeframe] ? renderKpiChart(kpiChartCache[currentTimeframe], m) : fetchChartData(currentTimeframe); }

async function fetchChartData(tf) {
    try {
        const d = await Promise.all([fetch(`${WEEKLY_KPI_URL}?store=OVL&time=${tf}`), fetch(`${WEEKLY_KPI_URL}?store=LEE&time=${tf}`), fetch(`${WEEKLY_KPI_URL}?store=WSP&time=${tf}`)]).then(rs => Promise.all(rs.map(r => r.json())));
        if (JSON.stringify(kpiChartCache[tf]) !== JSON.stringify(d) && currentTimeframe === tf) renderKpiChart(d, document.getElementById('metricSelector').value);
        kpiChartCache[tf] = d; try { localStorage.setItem('speeksKpiChartCache', JSON.stringify(kpiChartCache)); } catch(e) {}
    } catch (e) {} finally { if (document.getElementById('chartLoading')) document.getElementById('chartLoading').style.display = 'none'; }
}

function renderKpiChart(allData, metric) {
    if(!document.getElementById('mainKpiChart')) return;
    if (typeof Chart === 'undefined') { const l = document.getElementById('chartLoading'); if (l) { l.innerText = "Chart.js Library Missing!"; l.style.display = 'flex'; } return; }

    const t = { 'conversion': 'Customer Conversion %', 'margin': 'Buying Margin %', 'nodeals': 'Total No Deals', 'time': 'Transaction Time' }[metric], unit = metric === 'time' ? 'm' : (metric === 'nodeals' ? '' : '%'), isPct = metric === 'conversion' || metric === 'margin', strs = [ { key: 'OVL', color: '#5a8d3b', label: 'OVL Average' }, { key: 'LEE', color: '#0ea5e9', label: 'LEE Average' }, { key: 'WSP', color: '#f97316', label: 'WSP Average' } ];
    let lbls = [], fData = [], nums = [];
    allData.forEach((d, idx) => {
        let sData = [], sr=-1, sc=-1;
        for(let i=0; i<d.length; i++) { for(let j=0; j<d[i].length; j++) if(d[i][j] && String(d[i][j]).trim() === t) { sr=i; sc=j; break; } if(sr!==-1) break; } if(sr === -1) return;
        let sCol = d[sr+1].findIndex(v => String(v).toLowerCase() === 'store');
        if(!lbls.length) { for (let i = sr + 2; i < d.length; i++) { let l = String(d[i][sc - 1]).trim(); if (!l || l.includes('Store') || l.includes('%')) break; lbls.push(l); } }
        lbls.forEach((_, i) => { let v = d[sr+2+i][sCol]; if (v !== undefined && v !== "") { let p = parseNum(v); p = (isPct && p <= 1.1 && p > 0) ? p * 100 : p; sData.push(p); nums.push(p); } else sData.push(null); });
        fData.push({ label: strs[idx].label, data: sData, borderColor: strs[idx].color, backgroundColor: strs[idx].color, tension: 0.4, pointRadius: 5, spanGaps: true });
    });
    
    let yMin = 0, yMax = 100; if (nums.length) { let mx = Math.max(...nums), mn = Math.min(...nums); isPct ? (yMin = Math.max(0, Math.floor(mn/10)*10 - 10), yMax = Math.min(100, Math.ceil(mx/10)*10 + 10)) : (yMin = 0, yMax = Math.ceil(mx * 1.2)); }
    if (mainChartInstance) mainChartInstance.destroy();
    mainChartInstance = new Chart(document.getElementById('mainKpiChart').getContext('2d'), { type: 'line', plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : [], data: { labels: lbls, datasets: fData }, options: { responsive: true, maintainAspectRatio: false, animation: { duration: 400 }, plugins: { legend: { position: 'top' }, datalabels: { align: 'top', anchor: 'end', formatter: v => v !== null ? (Math.round(v*10)/10 + unit) : '' } }, scales: { y: { min: yMin, max: yMax, ticks: { callback: v => v + unit } }, x: { grid: { display: false } } } } });
}

function renderLiveData(d) {
    if (!d) return;
    ['ovl', 'lee', 'wsp'].forEach(id => {
        let pN = document.getElementById(`${id}-pct`); if(!pN) return;
        let p = Math.round(d[`${id}Pct`] || 0); pN.innerText = p + '%'; document.getElementById(`${id}-goal`).innerText = `Goal: $${Math.round(d[`${id}Goal`] || 0).toLocaleString()}`; document.getElementById(`${id}-t-gp`).innerText = `$${Math.round(d[`${id}TrackGP`] || 0).toLocaleString()}`;
        setTimeout(() => { let b = document.getElementById(`${id}-bar`); if (b) { b.style.strokeDashoffset = 402 - (Math.min(p, 100)/100)*402; b.style.stroke = p < 100 ? "var(--red-alert)" : "var(--sage-professional)"; } }, 50);
    });
    if (document.getElementById('rev-list')) {
        const sArr = [{n:'OVL', r:d.ovlRev, g:d.ovlGP}, {n:'LEE', r:d.leeRev, g:d.leeGP}, {n:'WSP', r:d.wspRev, g:d.wspGP}];
        document.getElementById('rev-list').innerHTML = [...sArr].sort((a,b)=>b.r-a.r).map((s,i)=>`<div class="lb-row"><div class="lb-rank ${i===0?'lb-gold':''}">#${i+1}</div><div class="lb-name">${s.n}</div><div class="lb-val">$${Math.round(s.r).toLocaleString()}</div></div>`).join('');
        document.getElementById('gp-list').innerHTML = [...sArr].sort((a,b)=>b.g-a.g).map((s,i)=>`<div class="lb-row"><div class="lb-rank ${i===0?'lb-gold':''}">#${i+1}</div><div class="lb-name">${s.n}</div><div class="lb-val">$${Math.round(s.g).toLocaleString()}</div></div>`).join('');
        const n = new Date(); document.getElementById('lastSyncedText').innerText = `Last Synced: ${n.getHours()%12||12}:${String(n.getMinutes()).padStart(2,'0')} ${n.getHours()>=12?'PM':'AM'}`;
    }
}

async function fetchRecordsData() { try { recordsCache = await (await fetch(`${RECORDS_URL}?v=${Date.now()}`)).json(); localStorage.setItem('speeksRecordsCache', JSON.stringify(recordsCache)); if (document.getElementById('pane-records')?.classList.contains('active')) renderRecords(); } catch (e) {} }

function renderRecords() {
    const cont = document.getElementById('recordsContainer'); if(!cont) return;
    if (!recordsCache?.length) return cont.innerHTML = '<div style="padding: 40px; text-align: center; color: #888; font-weight: 600;">Syncing Live Records...</div>';
    const map = {}; recordsCache.forEach(r => { let l = String(r.label).trim(), s = String(r.section).toUpperCase().trim(); if (!map[l]) map[l] = { c: null, s: [] }; if (s === 'COMPANY' || s === 'COMPANY WIDE') map[l].c = r; else map[l].s.push(r); });
    let bC = 0; cont.innerHTML = '<div class="records-masonry-grid">' + Object.keys(map).map(l => {
        let d = map[l]; bC++; let oId = 'overflow-board-' + bC; d.s.sort((a, b) => parseNum(b.value) - parseNum(a.value)); let cR = d.c || d.s[0];
        return `<div class="record-metric-card"><div class="rmc-header">${l}</div>${cR ? `<div class="rmc-champion"><div class="rmc-crown">👑 Company Record</div><div class="rmc-champ-val">${cR.value || '-'}</div><div class="rmc-champ-sub">${cR.subtext || ''}</div></div>` : ''}${d.s.length ? `<div class="rmc-list">${d.s.slice(0, 3).map((s, i) => `<div class="rmc-list-item"><div class="rmc-rank">${i===0?'🥇':(i===1?'🥈':'🥉')}</div><div class="rmc-store">${s.section}</div><div class="rmc-score"><span class="rmc-score-val">${s.value || '-'}</span><span class="rmc-score-date">${s.subtext || ''}</span></div></div>`).join('')}${d.s.length > 3 ? `<div id="${oId}" class="hidden-board">${d.s.slice(3).map((s, i) => `<div class="rmc-list-item"><div class="rmc-rank" style="font-size:11px; color:#999;">#${i+4}</div><div class="rmc-store">${s.section}</div><div class="rmc-score"><span class="rmc-score-val">${s.value || '-'}</span><span class="rmc-score-date">${s.subtext || ''}</span></div></div>`).join('')}</div><button class="rmc-expand-btn" onclick="toggleBoard('${oId}', this)">See Full Leaderboard ▾</button>` : ''}</div>` : ''}</div>`;
    }).join('') + '</div>';
}

function toggleBoard(id, btn) { const el = document.getElementById(id); el.classList.toggle('open'); btn.innerText = el.classList.contains('open') ? 'Hide Leaderboard ▴' : 'See Full Leaderboard ▾'; }
function syncAllData() { if (kpiChartCache[currentTimeframe]) renderKpiChart(kpiChartCache[currentTimeframe], document.getElementById('metricSelector')?.value); if (hubDataCache) renderLiveData(hubDataCache); fetchChartData(currentTimeframe); fetchHubData(); loadCMS(); fetchRecordsData(); }

// --- 9. INITIALIZATION ROUTER ---
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => document.body.classList.remove('preload'), 50);
    if (localStorage.getItem('speeksSidebar') === 'collapsed') { document.querySelector('.sidebar')?.classList.add('collapsed'); document.querySelector('.main-content')?.classList.add('expanded'); document.querySelector('.sidebar-toggle')?.classList.add('collapsed'); }
    loadCMS();
    
    if (document.getElementById('kbBody')) loadHotkeys();
    if (document.getElementById('content-container') && document.getElementById('docSearch')) { loadDocs(); document.getElementById('docSearch').addEventListener('keyup', filterDocs); }
    if (document.getElementById('authOverlay')) {
        if (sessionStorage.getItem('speeksManagerUnlocked') === 'true') { 
            document.getElementById('authOverlay').style.display = 'none'; 
            document.body.style.overflow = 'auto'; 
            
            applyRoleBasedUI(); // <--- ADD THIS HERE
            initDashboardData(); 
        } 
        else { 
            document.getElementById('authOverlay').style.display = 'flex'; 
            document.body.style.overflow = 'hidden'; 
            document.getElementById('pinInput')?.focus(); 
        }
        startAuthFetch();
        ['kpiStoreSelect', 'weeklyKpiStoreSelect', 'vw-primary', 'vw-compare'].forEach(id => document.getElementById(id)?.addEventListener('change', () => id === 'kpiStoreSelect' ? fetchKPIData(false) : (id === 'weeklyKpiStoreSelect' ? fetchWeeklyKPIs() : renderVariance())));
    }
    if (document.getElementById('mainKpiChart')) syncAllData();
});

// --- ROLE & PREFERENCE LOGIC ---
function applyRoleBasedUI() {
    const userRole = sessionStorage.getItem('speeksUserRole') || 'employee';
    const userStore = sessionStorage.getItem('speeksUserStore') || 'ALL';

    // 1. Optional: Hide specific things if they are JUST an employee (not a manager/admin)
    // You can add the class 'manager-only' to any HTML element you want to hide from standard employees
    if (userRole === 'employee') {
        document.querySelectorAll('.manager-only').forEach(el => el.style.display = 'none');
    }

    // 2. Set Default "Home Base" Store Dropdowns (but do NOT disable them)
    if (userStore !== 'ALL') {
        const storeDropdowns = ['kpiStoreSelect', 'weeklyKpiStoreSelect', 'bsStoreSelect', 'vw-primary'];
        
        storeDropdowns.forEach(id => {
            const dropdown = document.getElementById(id);
            if (dropdown) {
                // Ensure their store actually exists in this specific dropdown before setting it
                const optionExists = Array.from(dropdown.options).some(opt => opt.value === userStore);
                if (optionExists) {
                    dropdown.value = userStore;
                }
            }
        });
    }
}