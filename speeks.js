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
const AUTH_URL = 'https://script.google.com/macros/s/AKfycbza40UZxFtBWwtm3Z52MqAaBtxRfilN7flkMIuE-ylco-VFli38_nK9avh4gDioHNZjKg/exec';
const RECORDS_URL = 'https://script.google.com/macros/s/AKfycbwPMcs33YfH84ewJyg3ikqIKZtOJByEI9X2PD3cONtavJk7oJCUnGYbP6sESBE6-j2RSA/exec';
const QUICK_MSG_URL = 'https://script.google.com/macros/s/AKfycbxpPxDhcyS5gJ90plzsW_I1zkiC9bCZ6WA3Pl22XJL3NLg6K8L5QfeYX6VNN5bECstIeg/exec';

// ⚠️ PASTE YOUR NEW GOALS APPS SCRIPT URL HERE:
const GOALS_API_URL = 'https://script.google.com/macros/s/AKfycbw_eV-2Nxizf85J8atBJ6Muyq0aOAjZAsSLwlx9abPjNKJub_RlzrMBKkQuTbcRTbF2/exec';

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
    ['notifDropdown', 'calendarDropdown', 'manageDocsDropdown', 'manageUsersDropdown', 'hotkeysDropdown', 'globalOverlay', 'ideaModal', 'quickMsgDropdown'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('show');
    });
    
    if (!document.getElementById('authOverlay') || sessionStorage.getItem('speeksUnlocked') === 'true') {
        document.body.classList.remove('no-scroll');
    }
}

// --- MANAGE USERS MODULE ---
let globalUsersData = [];

async function toggleManageUsers() {
    const dropdown = document.getElementById('manageUsersDropdown');
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains('show');
    closeAllModals(); 
    
    if (!isOpen) {
        dropdown.classList.add('show');
        document.getElementById('globalOverlay')?.classList.add('show');
        document.body.classList.add('no-scroll');

        const list = document.getElementById('manageUsersList');
        list.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">Loading user database...</div>';
        
        try {
            const res = await fetch(`${AUTH_URL}?v=${Date.now()}`);
            const data = await res.json();
            globalUsersData = data.users || [];
            populateUsersModal();
        } catch (e) {
            list.innerHTML = '<div style="color:var(--red-alert); padding:20px;">Failed to load users.</div>';
        }
    }
}

function populateUsersModal() {
    const list = document.getElementById('manageUsersList');
    list.innerHTML = '';
    if (globalUsersData.length === 0) {
        addManageUserRow();
    } else {
        globalUsersData.forEach(user => addManageUserRow(user));
    }
}

function addManageUserRow(user = { name: '', pin: '', store: 'LEE', role: 'Employee' }) {
    const row = document.createElement('div');
    row.className = 'user-manage-row';

    const stores = ['OVL', 'LEE', 'WSP', 'MPL', 'BAL', 'CORP'];
    const roles = ['CEO', 'District Manager', 'Manager', 'Employee', 'Training'];

    const storeOptions = stores.map(s => `<option value="${s}" ${(user.store || '').toUpperCase() === s ? 'selected' : ''}>${s}</option>`).join('');
    const roleOptions = roles.map(r => `<option value="${r}" ${(user.role || '').toLowerCase() === r.toLowerCase() ? 'selected' : ''}>${r}</option>`).join('');

    row.innerHTML = `
        <input type="text" class="u-name" placeholder="Full Name" value="${user.name}" style="flex: 2;">
        <input type="text" class="u-pin" placeholder="PIN" maxlength="4" value="${user.pin}" style="flex: 1; max-width: 80px;" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0,4)">
        <select class="u-store" style="flex: 1;">${storeOptions}</select>
        <select class="u-role" style="flex: 1.5;">${roleOptions}</select>
        <button class="del-btn" onclick="this.parentElement.remove()" title="Delete User">✖</button>
    `;
    document.getElementById('manageUsersList').appendChild(row);
}

async function saveManageUsers() {
    const btn = document.getElementById('saveUsersBtn');
    const updatedUsers = [];
    let valid = true;

    document.querySelectorAll('.user-manage-row').forEach(row => {
        const name = row.querySelector('.u-name').value.trim();
        const pin = row.querySelector('.u-pin').value.trim();
        const store = row.querySelector('.u-store').value;
        const role = row.querySelector('.u-role').value;

        if (name || pin) {
            if (pin.length !== 4) {
                alert(`Error: The PIN for ${name || 'a user'} must be exactly 4 digits.`);
                valid = false;
            }
            updatedUsers.push({ name, pin, store, role });
        }
    });

    if (!valid) return;

    btn.textContent = "Saving...";
    btn.style.opacity = "0.7";

    try {
        const res = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(updatedUsers)
        });

        if (res.ok) {
            alert("Database successfully updated!");
            startAuthFetch(); 
            closeAllModals();
        } else {
            alert("Error saving users.");
        }
    } catch (e) {
        console.error(e);
        alert("Failed to connect to server.");
    } finally {
        btn.textContent = "Save Changes";
        btn.style.opacity = "1";
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
function toggleIdeaModal() { toggleModal('ideaModal'); }

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
            return `<tr><td><span class="bubble ${bClass}">${brand}</span></td><td>${cols[2]}</td><td>${cols[3]}</td><td>${cols[4]}</td></tr>`;
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

function startAuthFetch() { 
    authFetchPromise = fetch(`${AUTH_URL}?v=${Date.now()}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null); 
}

async function checkPIN() {
    const pin = document.getElementById('pinInput').value;
    const err = document.getElementById('pinError');
    const btn = document.getElementById('unlockBtn');
          
    if (!pin) return;
    
    btn.innerText = "Verifying..."; 
    btn.style.opacity = "0.7"; 
    err.style.display = 'none';

    try {
        const payload = await authFetchPromise;
        if (!payload || !payload.users) throw new Error("Could not load users.");
        
        const matched = payload.users.find(u => u.pin === String(pin));
        
        if (matched) {
            sessionStorage.setItem('speeksUnlocked', 'true'); 
            sessionStorage.setItem('speeksUserName', matched.name);
            sessionStorage.setItem('speeksUserRole', matched.role ? matched.role.toLowerCase() : 'employee');
            sessionStorage.setItem('speeksUserStore', matched.store ? matched.store.toUpperCase() : 'ALL');
            
            const authOverlay = document.getElementById('authOverlay');
            if (authOverlay) authOverlay.style.display = 'none'; 
            document.body.style.overflow = 'auto';
            document.body.classList.remove('no-scroll');
            
            applyRoleBasedUI();
            if (typeof initDashboardData === 'function') initDashboardData();
        } else {
            err.innerText = "Incorrect PIN. Please try again."; 
            err.style.display = 'block'; 
            document.getElementById('pinInput').value = ''; 
        }
    } catch (e) { 
        console.error(e);
        err.innerText = "Connection Error."; 
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

async function preloadAllStores() {
    if(!document.getElementById('kpiDashboardContainer')) return;
    ["OVL", "LEE", "WSP", "MPL", "BAL"].forEach(async s => { if (!monthlyKpiCache[s]) try { const p = await (await fetch(`${MONTHLY_KPI_URL}?store=${s}&v=${Date.now()}`)).json(); if (!p.error) monthlyKpiCache[s] = { months: p.months, data: groupKPIs(p.data) }; } catch(e) {} });
}

function initDashboardData() { 
    if (typeof initChecklists === 'function') initChecklists(); 
    setTimeout(fetchHubData, 100); 
    setTimeout(fetchVarianceData, 300); 
    setTimeout(fetchWeeklyKPIs, 500); 
    setTimeout(fetchKPIData, 700); 
    setTimeout(preloadAllStores, 4000); 
    setTimeout(initListingGoals, 200);
    setTimeout(fetchDmGoalsData, 1000);
}

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


// --- QUICK MESSAGES MODULE ---
async function loadQuickMessages() {
    const contentDiv = document.getElementById('qmContent');
    if (contentDiv.innerHTML !== 'Loading messages...' && contentDiv.innerHTML.trim() !== '') return; 

    try {
        const response = await fetch(QUICK_MSG_URL);
        const data = await response.json();
        if (!data || data.length === 0) {
            contentDiv.innerHTML = '<p>No messages found in the Google Sheet.</p>';
            return;
        }

        const headers = Object.keys(data[0]);
        const categoryCol = headers[0]; 
        const nameCol = headers[1];     
        const msgCol = headers[2];      

        const groupedData = {};
        data.forEach(row => {
            const category = row[categoryCol];
            if (!groupedData[category]) groupedData[category] = [];
            groupedData[category].push(row);
        });

        let html = '';
        for (const [category, items] of Object.entries(groupedData)) {
            html += `
            <div class="qm-category-wrapper">
                <div class="qm-category" onclick="this.nextElementSibling.classList.toggle('open')">
                    📁 ${escapeHtml(category)}
                </div>
                <div class="qm-category-items">
                    ${items.map(item => `
                        <div class="qm-item">
                            <div class="qm-item-header">
                                <div class="qm-item-name" onclick="this.parentElement.nextElementSibling.classList.toggle('open')">
                                    ${escapeHtml(item[nameCol])}
                                </div>
                                <button class="qm-copy-btn" title="Copy Message" data-message="${escapeHtml(item[msgCol])}" onclick="copyQMToClipboard(this)">
                                    📋
                                </button>
                            </div>
                            <div class="qm-item-message">
                                ${escapeHtml(item[msgCol])}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }
        contentDiv.innerHTML = html;
    } catch (error) {
        console.error("Error loading Quick Messages:", error);
        contentDiv.innerHTML = '<p style="color:red;">Error loading messages. Check console.</p>';
    }
}

function copyQMToClipboard(button) {
    const textToCopy = button.getAttribute('data-message');
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalIcon = button.innerText;
        button.innerText = '✅'; 
        setTimeout(() => { button.innerText = originalIcon; }, 1500);
    }).catch(err => console.error('Failed to copy text: ', err));
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function injectGlobalAuth() {
    if (!document.getElementById('authOverlay')) {
        const overlayHtml = `
        <div id="authOverlay" class="auth-page" style="display: none;">
            <div class="auth-split-layout">
                <div class="auth-brand-side">
                    <img src="images/speeks_logo.png" alt="SPEEKS Logo" class="auth-logo">
                    <div class="auth-brand-text">
                        <h1>SPEEKSNET</h1>
                        <p>Internal Operations Portal</p>
                    </div>
                </div>
                <div class="auth-form-side">
                    <div class="auth-form-container">
                        <div class="auth-badge">SECURE ACCESS</div>
                        <h2>Welcome Back</h2>
                        <p id="authSubtitle">Please enter your 4-digit PIN to securely access the hub.</p>
                        <div id="pinInputContainer" class="pin-container">
                            <input type="password" id="pinInput" maxlength="4" placeholder="••••" onkeypress="if(event.key === 'Enter') checkPIN()">
                            <button id="unlockBtn" class="btn-primary auth-btn" onclick="checkPIN()">Unlock Portal</button>
                            <div id="pinError" class="pin-error">Incorrect PIN. Please try again.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', overlayHtml);
    }

    const topActions = document.querySelector('.top-actions');
    if (topActions && !document.getElementById('logoutBtn')) {
        const logoutBtn = document.createElement('a'); 
        logoutBtn.className = 'quick-link-pill logout-btn';
        logoutBtn.id = 'logoutBtn';
        logoutBtn.innerHTML = '🚪 Sign Out';
        logoutBtn.onclick = (e) => { e.preventDefault(); handleSignOut(); };
        topActions.appendChild(logoutBtn);
    }
}

function handleSignOut() {
    sessionStorage.removeItem('speeksUnlocked');
    sessionStorage.removeItem('speeksUserName');
    sessionStorage.removeItem('speeksUserRole');
    sessionStorage.removeItem('speeksUserStore');
    location.reload(); 
}

let isIdeaSubmitting = false; 

function injectIdeaModal() {
    if (!document.getElementById('ideaModal')) {
        const modalHtml = `
        <iframe name="hidden_iframe" id="hidden_iframe" style="display:none;" onload="handleIframeLoad()"></iframe>
        <div class="modal-menu idea-menu" id="ideaModal">
            <div class="modal-header">
                <h3>💡 Submit an Idea</h3>
                <button class="modal-close-btn" onclick="closeAllModals()">✖</button>
            </div>
            <div class="modal-content" style="padding: 25px;">
                <form id="ideaForm" action="https://formsubmit.co/ethan.kushnir@speekstechnology.com" method="POST" enctype="multipart/form-data" target="hidden_iframe" onsubmit="prepareIdeaSubmit()">
                    <input type="hidden" name="_captcha" value="false">
                    <input type="hidden" name="_subject" id="ideaDynamicSubject" value="New SPEEKS Idea">
                    <div style="margin-bottom: 15px;">
                        <label class="idea-label">Your Name</label>
                        <input type="text" id="ideaName" name="Name" class="idea-input" required placeholder="John Doe">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label class="idea-label">Category</label>
                        <select id="ideaCategory" name="Category" class="idea-input">
                            <option value="New Feature">New Feature</option>
                            <option value="Process Improvement">Process Improvement</option>
                            <option value="Bug Fix / Issue">Bug Fix / Issue</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label class="idea-label">Idea Details</label>
                        <textarea id="ideaDesc" name="Idea_Description" required rows="5" class="idea-input" placeholder="Describe your idea here..."></textarea>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label class="idea-label">Attach a File (Optional)</label>
                        <input type="file" id="ideaFile" name="Attachment" class="idea-input" accept="image/*,.pdf,.doc,.docx" style="padding: 10px;">
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button type="button" class="btn-secondary" onclick="closeAllModals()">Cancel</button>
                        <button type="submit" class="btn-primary" id="submitIdeaBtn">Submit Idea</button>
                    </div>
                </form>
                <div id="ideaSuccess" style="display:none; text-align:center; padding: 30px 10px;">
                    <div style="font-size: 40px; margin-bottom: 10px;">🎉</div>
                    <h3 style="color: var(--sage-professional); margin-bottom: 10px; font-weight: 800;">Idea Submitted!</h3>
                    <p style="color: #666; font-size: 14px; margin-bottom: 20px; font-weight: 500;">Thanks for helping us improve SPEEKS.</p>
                    <button class="btn-primary" onclick="closeAllModals(); setTimeout(() => { document.getElementById('ideaForm').style.display='block'; document.getElementById('ideaSuccess').style.display='none'; document.getElementById('ideaForm').reset(); }, 500);">Close</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

function prepareIdeaSubmit() {
    isIdeaSubmitting = true; 
    const btn = document.getElementById('submitIdeaBtn');
    btn.innerText = 'Sending...';
    btn.style.opacity = '0.7';
    const category = document.getElementById('ideaCategory').value;
    document.getElementById('ideaDynamicSubject').value = 'New SPEEKS Idea: ' + category;
}

function handleIframeLoad() {
    if (isIdeaSubmitting) {
        document.getElementById('ideaForm').style.display = 'none';
        document.getElementById('ideaSuccess').style.display = 'block';
        const btn = document.getElementById('submitIdeaBtn');
        btn.innerText = 'Submit Idea';
        btn.style.opacity = '1';
        isIdeaSubmitting = false; 
    }
}

// --- WIDGET RENDERERS ---

async function fetchScorecardData() {
    const container = document.getElementById('scorecard-widget-body');
    const titleElement = document.getElementById('scorecard-store-name');
    if (!container) return;
    container.innerHTML = '<div class="status-message" style="padding: 20px 0;">Syncing Data...</div>';
    const SCORECARD_URL = 'https://script.google.com/macros/s/AKfycbwvelWpXnlXCJZQGagZX5llMCN1k6CjronBpIcenNVDTjUdPISjF0mYhHYy2ry0Vdg0_Q/exec';

    let targetStore = sessionStorage.getItem('speeksUserStore') || 'OVL';
    if (targetStore === 'ALL' || targetStore === 'CORP') targetStore = 'OVL'; 

    try {
        const response = await fetch(SCORECARD_URL);
        const json = await response.json();
        if (!json.success) throw new Error(json.error);
        const storeData = json.data.find(item => String(item.store).toUpperCase() === targetStore.toUpperCase());

        if (!storeData) {
            container.innerHTML = `<div style="color: #888; text-align: center; padding: 20px 0; font-weight: bold;">No data found for ${targetStore}.</div>`;
            return;
        }

        if (titleElement) titleElement.innerHTML = `📊 ${storeData.store} Scorecard`;

        const latestScore = parseFloat(storeData.score) || 0; 
        const rawDate = storeData.date || 'Recent';

        let displayDate = rawDate;
        const parsedDate = new Date(rawDate);
        if (!isNaN(parsedDate.getTime())) {
            const day = parsedDate.getUTCDay(); 
            const diffToMonday = day === 0 ? -6 : 1 - day; 
            const mondayDate = new Date(parsedDate);
            mondayDate.setUTCDate(parsedDate.getUTCDate() + diffToMonday);
            displayDate = "Week of " + mondayDate.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });
        }

        const getScoreColor = (score) => {
            if (score > 8) return 'var(--sage-professional)';  
            if (score >= 6) return 'var(--idea-gold)';         
            return 'var(--red-alert)';                         
        };
        const scoreColor = getScoreColor(latestScore);

        const pulse = latestScore < 6 ? '<div class="notif-dot active" style="display:block; position:absolute; top:-6px; right:-6px; width:14px; height:14px; border-width: 2px;"></div>' : '';

        container.innerHTML = `
        <div class="scorecard-widget">
            ${pulse}
            <div class="scorecard-label">Latest Score</div>
            <div class="scorecard-date">${displayDate}</div>
            <div class="scorecard-val" style="color: ${scoreColor}; text-shadow: 0 4px 15px ${scoreColor}30;">
                ${latestScore.toFixed(1)}
            </div>
        </div>`;
    } catch (error) {
        console.error('Error fetching scorecard:', error);
        container.innerHTML = '<div style="color: var(--red-alert); font-weight: bold; padding: 20px 0; text-align: center;">Error syncing scorecard.</div>';
    }
}

async function fetchAlertsData() {
    const container = document.getElementById('alerts-widget-body');
    const titleElement = document.getElementById('alerts-store-name');
    if (!container) return;

    const ALERTS_URL = 'https://script.google.com/macros/s/AKfycbxap-4Jgdn5-ntkv_X-vFZLTWlTB29_bDLdwcFxhWd2su3ZQJ0ZS7UpUgZAK08lOIV6/exec';

    let targetStore = sessionStorage.getItem('speeksUserStore') || 'OVL';
    if (targetStore === 'ALL' || targetStore === 'CORP') targetStore = 'OVL'; 

    try {
        const response = await fetch(ALERTS_URL);
        const json = await response.json();
        if (!json.success) throw new Error(json.error);

        const storeData = json.data.find(item => String(item.store).toUpperCase() === targetStore.toUpperCase());
        if (!storeData) return;

        if (titleElement) titleElement.innerHTML = `🚨 Action Needed - eBay Performance`;

        const buildAlertCard = (title, value, severity) => {
            let bgColor = '#d1fae5';
            let textColor = '#065f46'; 
            let displayText = 'All Clear';
            let pulseHtml = '';

            if (value !== '') {
                displayText = value;
                if (severity === 'high') {
                    bgColor = '#fef3c7'; 
                    textColor = '#92400e';
                } else if (severity === 'very-high') {
                    bgColor = '#fee2e2';
                    textColor = '#991b1b';
                    pulseHtml = '<div class="notif-dot active" style="display:block; position:absolute; top:-4px; right:-4px; width:12px; height:12px; border-width: 2px; z-index: 5;"></div>';
                }
            }

            return `
            <div style="position: relative; background: #f9fafb; padding: 12px 15px; border-radius: 8px; border: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); flex: 1; min-height: 65px; box-sizing: border-box;">
                ${pulseHtml}
                <div style="font-size: 10px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 15px; flex-shrink: 0;">${title}</div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; flex-grow: 1; width: 60%;">
                    <div style="font-size: 11px; font-weight: 900; color: ${textColor}; background-color: ${bgColor}; padding: 4px 10px; border-radius: 6px; width: 100%; height: 46px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.2; box-sizing: border-box;">
                        ${displayText}
                    </div>
                </div>
            </div>`;
        };

        container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 15px; align-items: stretch; width: 100%; height: 100%;">
            <div style="display: flex; flex-direction: column; gap: 8px; justify-content: space-between; height: 100%;">
                <div style="font-size: 10px; font-weight: 800; color: var(--slate-charcoal); text-transform: uppercase; letter-spacing: 1px; padding-left: 5px;">Current Issues</div>
                ${buildAlertCard('High', storeData.currentHigh, 'high')}
                ${buildAlertCard('Very High', storeData.currentVeryHigh, 'very-high')}
            </div>
            <div style="width: 2px; background: repeating-linear-gradient(to bottom, #e2e8f0, #e2e8f0 6px, transparent 6px, transparent 12px); margin: 20px 0 0 0;"></div>
            <div style="display: flex; flex-direction: column; gap: 8px; justify-content: space-between; height: 100%;">
                <div style="font-size: 10px; font-weight: 800; color: var(--slate-charcoal); text-transform: uppercase; letter-spacing: 1px; padding-left: 5px;">Projected Issues</div>
                ${buildAlertCard('High', storeData.projectedHigh, 'high')}
                ${buildAlertCard('Very High', storeData.projectedVeryHigh, 'very-high')}
            </div>
        </div>`;
    } catch (error) {
        console.error('Error fetching alerts:', error);
    }
}

// ============================================================================
// WIDGET: DAILY LISTING GOALS (SANDBOX TESTING MODE)
// ============================================================================

let goalsRoster = []; 
let liveGoalsData = [];
let goalsTargetStore = 'OVL';
let currentAppDate = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' });

function runScheduledTasks() {
    const now = new Date();
    
    // Get exact Central Time details
    const ctDateStr = now.toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
    const ctTimeString = now.toLocaleString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', hour12: false });
    const hours = parseInt(ctTimeString, 10);
    
    // 1. Pulse Dot Logic (Active from 9:00 AM - 9:59 AM  &  7:00 PM - 7:59 PM Central)
    const isPulseTime = (hours === 9) || (hours === 19);
    const dot = document.getElementById('goals-pulse-dot');
    if (dot) dot.style.display = isPulseTime ? 'block' : 'none';

    // 2. Midnight Auto-Reset Logic (Visually wipes the board if left open overnight)
    if (ctDateStr !== currentAppDate) {
        currentAppDate = ctDateStr;
        const activeTab = document.getElementById('tab-daily')?.classList.contains('active') ? 'daily' : 'weekly';
        renderGoalsScoreboard(activeTab);
    }
}

async function initListingGoals() {
    // Run scheduled checks immediately, then run in the background every 60 seconds
    runScheduledTasks();
    setInterval(runScheduledTasks, 60000); 

    await fetchLiveGoalsData();
}

async function fetchLiveGoalsData() {
    const list = document.getElementById('goals-roster-list');
    if (!list) return;
    list.innerHTML = '<div class="status-message" style="text-align: center; color: #888; padding: 20px 0;">Syncing Live Goals...</div>';

    goalsTargetStore = sessionStorage.getItem('speeksUserStore') || 'OVL';
    if (goalsTargetStore === 'ALL' || goalsTargetStore === 'CORP') goalsTargetStore = 'OVL'; 

    try {
        // 1. Pull Employees from the Weekly KPI Sheet
        const d = await fetch(`${WEEKLY_KPI_URL}?store=${goalsTargetStore}&time=4-Week&v=${Date.now()}`).then(r => r.json());
        let emps = [];
        let sIdx = d.findLastIndex(r => String(r[0]).trim().toLowerCase() === "store" || String(r[0]).trim().toLowerCase() === "store total");
        
        if (sIdx !== -1) {
            for (let i = Math.max(0, sIdx - 6); i <= Math.min(d.length - 1, sIdx + 6); i++) {
                if (i === sIdx) continue;
                let n = String(d[i][0]).trim(), lN = n.toLowerCase();
                if (n && !["name", "employee", "store", "store total", "ovl", "lee", "wsp", "mpl", "bal"].includes(lN) && !lN.includes("average") && !lN.includes("week")) {
                    if (String(d[i][2]).trim() !== "" || String(d[i][20]).trim() !== "") emps.push(n);
                }
            }
        }
        goalsRoster = emps.length ? [...new Set(emps)] : ['No Employees Found'];

        // 2. FETCH DIRECTLY FROM GOOGLE SHEETS (NO CACHE)
        try {
            const res = await fetch(`${GOALS_API_URL}?store=${goalsTargetStore}&v=${Date.now()}`);
            liveGoalsData = await res.json();
        } catch (dbError) {
            console.error("Database read failed:", dbError);
            liveGoalsData = []; // Fallback to empty if DB fails
        }
        
        renderGoalsScoreboard('daily');
    } catch (e) {
        console.error('Error fetching goals roster:', e);
        list.innerHTML = '<div style="color: var(--red-alert); font-weight: bold; text-align: center; padding: 20px 0;">Error loading roster.</div>';
    }
}

function renderGoalsScoreboard(viewType = 'daily') {
    const list = document.getElementById('goals-roster-list');
    const dateDisplay = document.getElementById('goals-date-display');
    if (!list) return;
    let totalG = 0; let totalR = 0;
    let html = '';

    const todayStr = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
    const now = new Date();
    
    // Shift week start to Monday (0=Sun, 1=Mon, 2=Tue...)
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0,0,0,0);

    // Update Date UI
    if (dateDisplay) {
        if (viewType === 'daily') {
            dateDisplay.innerText = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        } else {
            dateDisplay.innerText = "Week of " + startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    goalsRoster.forEach(emp => {
        let empGoal = 0; let empResult = 0; let empRole = '-';
        let dailyStats = {};
        
        const empRecords = liveGoalsData.filter(r => r.employee === emp);
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        empRecords.forEach(record => {
            const isToday = record.date === todayStr;
            const recDate = new Date(record.date);
            const isThisWeek = recDate >= startOfWeek;

            if (viewType === 'daily' && isToday) {
                empGoal = parseInt(record.goal) || 0;
                empResult = parseInt(record.result) || 0;
                empRole = record.role || '-';
            } else if (viewType === 'weekly' && isThisWeek) {
                const rG = parseInt(record.goal) || 0;
                const rR = parseInt(record.result) || 0;
                empGoal += rG;
                empResult += rR;
                
                // Track daily breakdown for the sub-row
                const dayIdx = (recDate.getDay() + 6) % 7; 
                const dayName = daysOfWeek[dayIdx];
                dailyStats[dayName] = { goal: rG, result: rR };
            }
        });

        totalG += empGoal;
        totalR += empResult;

        // Dynamic Bubble Color Logic for Individuals
        let resultClass = 'delta-neutral';
        if (empGoal > 0 || empResult > 0) {
            resultClass = empResult >= empGoal ? 'delta-pos' : 'delta-neg';
        }

        // Build Daily Breakdown HTML with N/A Placeholders
        let dailyBreakdownHtml = '';
        if (viewType === 'weekly') {
            const currentDayIdx = (now.getDay() + 6) % 7; // Map Sun=0 to Mon=0
            dailyBreakdownHtml = '<div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #f0f0f0;">';
            
            daysOfWeek.forEach((dName, idx) => {
                if (dailyStats[dName]) {
                    // They logged goals! Show the score.
                    const dG = dailyStats[dName].goal;
                    const dR = dailyStats[dName].result;
                    const dClass = dR >= dG ? 'color: #065f46; background: #d1fae5;' : 'color: #991b1b; background: #fee2e2;';
                    dailyBreakdownHtml += `<div style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; ${dClass}">${dName}: ${dR}/${dG}</div>`;
                } else if (idx <= currentDayIdx) {
                    // Day has passed or is today, but no data logged. Show N/A.
                    dailyBreakdownHtml += `<div style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; color: #64748b; background: #f1f5f9;" title="Not Logged">${dName}: N/A</div>`;
                } else {
                    // Future day in the week. Show faint placeholder.
                    dailyBreakdownHtml += `<div style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; color: #cbd5e1; border: 1px dashed #e2e8f0; background: transparent;">${dName}</div>`;
                }
            });
            dailyBreakdownHtml += '</div>';
        }

        // Build the HTML with strict fixed-width bubbles (36x26) for perfect alignment
        html += `
        <div style="display: flex; flex-direction: column; border-bottom: 1px solid #f8fafc; padding: 6px 0;">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; align-items: center;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span class="goals-roster-name" style="font-size: 13px; font-weight: 800; color: var(--slate-charcoal); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${emp}</span>
                    ${viewType === 'daily' && empRole !== '-' ? `<span class="goals-roster-badge" style="font-size: 10px; background: #e2e8f0; color: var(--slate-charcoal); padding: 3px 6px; border-radius: 4px; display: inline-block; width: fit-content;">${empRole}</span>` : ''}
                </div>
                <div style="display: flex; justify-content: center;">
                    <span class="goals-roster-val target" style="font-size: 14px; text-align: center; font-weight: 900; color: var(--slate-charcoal); width: 36px; display: inline-block;">${empGoal || '-'}</span>
                </div>
                <div style="display: flex; justify-content: center; align-items: center;">
                    <span class="delta-badge ${resultClass}" style="font-size: 14px; width: 36px; height: 26px; padding: 0; display: inline-flex; justify-content: center; align-items: center;">${empResult || '-'}</span>
                </div>
            </div>
            ${dailyBreakdownHtml}
        </div>`;
    });

    list.innerHTML = html;
    document.getElementById('goals-total-target').innerText = totalG;
    
    const actualEl = document.getElementById('goals-total-actual');
    actualEl.innerText = totalR;
    
    // Dynamic Color Logic for Overall Total
    if (totalG > 0 || totalR > 0) {
        if (totalR >= totalG) {
            actualEl.style.backgroundColor = '#d1fae5'; 
            actualEl.style.color = '#065f46';           
        } else {
            actualEl.style.backgroundColor = '#fee2e2'; 
            actualEl.style.color = '#991b1b';           
        }
    } else {
        actualEl.style.backgroundColor = '#f1f5f9';     
        actualEl.style.color = 'var(--slate-charcoal)'; 
    }
}

function switchGoalTab(tab) {
    const tD = document.getElementById('tab-daily');
    const tW = document.getElementById('tab-weekly');
    const actionBtn = document.getElementById('goals-action-btn');

    if (tab === 'daily') {
        tD.className = 'goal-tab active';
        tW.className = 'goal-tab inactive';
        actionBtn.style.display = 'block';
        renderGoalsScoreboard('daily');
    } else {
        tW.className = 'goal-tab active';
        tD.className = 'goal-tab inactive';
        actionBtn.style.display = 'none'; 
        renderGoalsScoreboard('weekly');
    }
}

function flipGoalCard(showEdit) {
    const flipper = document.getElementById('goals-flipper');
    const tabContainer = document.querySelector('.goal-tab-container');
    
    if (showEdit) {
        buildGoalsEditForm();
        flipper.classList.add('is-flipped');
        // Disable Tabs
        if (tabContainer) {
            tabContainer.style.pointerEvents = 'none';
            tabContainer.style.opacity = '0.5';
        }
    } else {
        flipper.classList.remove('is-flipped');
        // Re-enable Tabs
        if (tabContainer) {
            tabContainer.style.pointerEvents = 'auto';
            tabContainer.style.opacity = '1';
        }
    }
}

function buildGoalsEditForm() {
    const container = document.getElementById('goals-edit-list');
    const todayStr = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
    let html = '';

    goalsRoster.forEach((emp, idx) => {
        const todayRecord = liveGoalsData.find(r => r.employee === emp && r.date === todayStr) || { role: '', goal: '', result: '' };
        
        const roles = ['B1', 'B2', 'L1', 'L2'];
        let rolesHtml = '';
        roles.forEach(r => {
            const isActive = todayRecord.role === r ? 'active' : '';
            rolesHtml += `<button type="button" class="role-dot ${isActive}" onclick="selectRole(this, '${emp}', '${r}')">${r}</button>`;
        });

        html += `
        <div class="goals-edit-item">
            <div class="goals-edit-name">${emp}</div>
            <div class="goals-edit-controls">
                <div class="goals-edit-roles" id="roles-${idx}">
                    ${rolesHtml}
                </div>
                <div style="display:flex; gap: 8px;">
                    <input type="number" id="input-goal-${idx}" class="goal-input" placeholder="Goal" value="${todayRecord.goal}" title="Target Goal" />
                    <input type="number" id="input-result-${idx}" class="goal-input" placeholder="Actual" value="${todayRecord.result}" title="Actual Result" style="border-color: #a7f3d0; background: #ecfdf5;" />
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

function selectRole(btn, emp, role) {
    const parent = btn.parentElement;
    Array.from(parent.children).forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('data-selected-role', role);
}

async function saveGoalsData() {
    const btn = document.getElementById('saveGoalsBtn');
    btn.innerText = "Saving to Database...";
    btn.style.opacity = "0.7";

    const todayStr = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
    let payloadEmployees = [];

    goalsRoster.forEach((emp, idx) => {
        const roleGroup = document.getElementById(`roles-${idx}`);
        const activeBtn = roleGroup?.querySelector('.active');
        const role = activeBtn ? (activeBtn.getAttribute('data-selected-role') || activeBtn.innerText) : '-';
        
        const goal = document.getElementById(`input-goal-${idx}`).value;
        const result = document.getElementById(`input-result-${idx}`).value;

        if (role !== '-' || goal !== '' || result !== '') {
            payloadEmployees.push({ employee: emp, role: role, goal: goal, result: result });
        }
    });

    try {
        const response = await fetch(GOALS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ store: goalsTargetStore, employees: payloadEmployees })
        });

        if(response.ok) {
            // Instantly update UI Memory so we don't have to wait for a refresh
            liveGoalsData = liveGoalsData.filter(r => r.date !== todayStr);
            payloadEmployees.forEach(p => {
                liveGoalsData.push({ date: todayStr, store: goalsTargetStore, employee: p.employee, role: p.role, goal: p.goal, result: p.result });
            });

            document.getElementById('goals-pulse-dot').style.display = 'none';
            const activeTab = document.getElementById('tab-daily').classList.contains('active') ? 'daily' : 'weekly';
            renderGoalsScoreboard(activeTab);
            flipGoalCard(false);
        } else {
            alert("Error saving goals to server.");
        }
    } catch (error) {
        console.error(error);
        alert("Connection failed. Please try again.");
    } finally {
        btn.innerText = "Save Changes";
        btn.style.opacity = "1";
    }
}

// --- GLOBAL INITIALIZER ATTACHMENTS ---
function applyRoleBasedUI() {
    const userRole = sessionStorage.getItem('speeksUserRole') || 'employee';
    const userStore = sessionStorage.getItem('speeksUserStore') || 'ALL';
    const userName = sessionStorage.getItem('speeksUserName') || 'User';

    const greetingEl = document.getElementById('userGreeting');
    if (greetingEl) greetingEl.innerText = `Welcome ${userName}!`;

    const userRoleClass = `role-${userRole.toLowerCase().replace(/\s+/g, '-')}`; 
    const userStoreClass = `store-${userStore.toLowerCase()}`;

    document.querySelectorAll('.dynamic-module').forEach(module => {
        const classes = Array.from(module.classList);
        const requiredRoles = classes.filter(c => c.startsWith('role-'));
        const requiredStores = classes.filter(c => c.startsWith('store-'));

        const passesRole = requiredRoles.length === 0 || requiredRoles.includes(userRoleClass);
        const passesStore = requiredStores.length === 0 || requiredStores.includes(userStoreClass);

        module.style.display = (passesRole && passesStore) ? 'block' : 'none';
    });

    if (userRole === 'employee') {
        document.querySelectorAll('.manager-only').forEach(el => el.style.display = 'none');
    }

    if (userStore !== 'ALL') {
        ['kpiStoreSelect', 'weeklyKpiStoreSelect', 'bsStoreSelect', 'vw-primary'].forEach(id => {
            const dropdown = document.getElementById(id);
            if (dropdown && Array.from(dropdown.options).some(opt => opt.value === userStore)) {
                dropdown.value = userStore;
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => document.body.classList.remove('preload'), 50);
    if (localStorage.getItem('speeksSidebar') === 'collapsed') { document.querySelector('.sidebar')?.classList.add('collapsed'); document.querySelector('.main-content')?.classList.add('expanded'); document.querySelector('.sidebar-toggle')?.classList.add('collapsed'); }
    
    loadCMS();
    if (document.getElementById('kbBody')) loadHotkeys();
    if (document.getElementById('content-container') && document.getElementById('docSearch')) { loadDocs(); document.getElementById('docSearch').addEventListener('keyup', filterDocs); }
    
    injectGlobalAuth();
    injectIdeaModal(); 
    startAuthFetch();

    if (sessionStorage.getItem('speeksUnlocked') === 'true') { 
        document.getElementById('authOverlay').style.display = 'none'; 
        document.body.style.overflow = 'auto'; 
        applyRoleBasedUI(); 
        initDashboardData(); 
    } else { 
        if(!window.location.href.includes('index.html') && document.getElementById('authOverlay')) {
            window.location.href = "index.html"; return;
        }
        document.getElementById('authOverlay').style.display = 'flex'; 
        document.body.style.overflow = 'hidden'; 
        document.getElementById('pinInput')?.focus(); 
    }
    
    ['kpiStoreSelect', 'weeklyKpiStoreSelect', 'vw-primary', 'vw-compare'].forEach(id => document.getElementById(id)?.addEventListener('change', () => id === 'kpiStoreSelect' ? fetchKPIData(false) : (id === 'weeklyKpiStoreSelect' ? fetchWeeklyKPIs() : renderVariance())));
    
    if (document.getElementById('mainKpiChart')) syncAllData();

    fetchScorecardData();
    fetchAlertsData();
});

// ============================================================================
// WIDGET: COMPACT DISTRICT COMMAND - LISTING GOALS
// ============================================================================

let allDistrictGoalsData = [];
let currentDmGoalView = 'daily';

async function fetchDmGoalsData() {
    const cont = document.getElementById('dm-compact-goals-container');
    if (!cont) return;

    const stores = ['OVL', 'LEE', 'WSP', 'MPL', 'BAL'];
    
    try {
        const fetches = stores.map(s => fetch(`${GOALS_API_URL}?store=${s}&v=${Date.now()}`).then(r => r.json()));
        const results = await Promise.all(fetches);
        allDistrictGoalsData = results.flat();
        renderCompactDmGoals();
    } catch (e) {
        console.error("Failed to sync district goals:", e);
        cont.innerHTML = '<div class="status-message" style="color:var(--red-alert);">Network Sync Failed.</div>';
    }
}

function switchCompactDmTab(view) {
    currentDmGoalView = view;
    document.getElementById('dm-compact-tab-daily').classList.toggle('active', view === 'daily');
    document.getElementById('dm-compact-tab-weekly').classList.toggle('active', view === 'weekly');
    renderCompactDmGoals();
}

function toggleDmStoreAccordion(store) {
    const rosterDiv = document.getElementById(`dm-roster-${store}`);
    const caret = document.getElementById(`dm-caret-${store}`);
    const isOpen = rosterDiv.style.display === 'block';
    
    // Close all other accordions first
    document.querySelectorAll('.dm-store-roster').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.dm-store-caret').forEach(el => el.style.transform = 'rotate(0deg)');

    // Toggle the clicked one
    if (!isOpen) {
        rosterDiv.style.display = 'block';
        caret.style.transform = 'rotate(180deg)';
    }
}

function renderCompactDmGoals() {
    const cont = document.getElementById('dm-compact-goals-container');
    if (!cont) return;

    const todayStr = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + (now.getDay() === 0 ? -6 : 1 - now.getDay()));
    startOfWeek.setHours(0,0,0,0);

    const stores = ['OVL', 'LEE', 'WSP', 'MPL', 'BAL'];
    let html = '<div style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: white;">';

    stores.forEach((store, idx) => {
        const storeData = allDistrictGoalsData.filter(r => r.store === store);
        let tGoal = 0, tResult = 0;
        let activeEmps = new Set();

        // Calculate Totals & Find Active Employees
        storeData.forEach(r => {
            const recDate = new Date(r.date);
            const isToday = r.date === todayStr;
            const isThisWeek = recDate >= startOfWeek;

            if ((currentDmGoalView === 'daily' && isToday) || (currentDmGoalView === 'weekly' && isThisWeek)) {
                tGoal += parseInt(r.goal) || 0;
                tResult += parseInt(r.result) || 0;
                activeEmps.add(r.employee);
            }
        });

        const progress = tGoal > 0 ? Math.min(100, Math.round((tResult / tGoal) * 100)) : 0;
        const colorClass = tResult >= tGoal && tGoal > 0 ? 'var(--sage-professional)' : (tResult > 0 ? 'var(--idea-gold)' : '#cbd5e1');
        const isMuted = tGoal === 0 && tResult === 0 ? 'opacity: 0.6;' : '';

        // Top Level Store Row (Standardized with lb-row classes)
        html += `
        <div onclick="toggleDmStoreAccordion('${store}')" class="lb-row" style="display: grid; grid-template-columns: 50px 1fr 70px 20px; align-items: center; border-bottom: 1px solid ${idx === stores.length-1 ? 'transparent' : '#f0f0f0'}; cursor: pointer; padding: 12px 15px; margin: 0; ${isMuted}">
            <span style="font-size: 14px; font-weight: 900; color: var(--slate-charcoal);">${store}</span>
            <div style="padding-right: 15px;">
                <div style="width: 100%; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; display: flex;">
                    <div style="height: 100%; width: ${progress}%; background: ${colorClass}; border-radius: 3px; transition: width 0.5s ease;"></div>
                </div>
            </div>
            <div style="text-align: right; font-size: 14px; font-weight: 900; color: var(--slate-charcoal);">
                ${tResult} <span style="font-size: 11px; color: #888; font-weight: 600;">/ ${tGoal}</span>
            </div>
            <div id="dm-caret-${store}" class="dm-store-caret" style="text-align: right; color: #cbd5e1; font-size: 10px; transition: transform 0.3s;">▼</div>
        </div>`;

        // The Hidden Dropdown Roster (Standardized background and strict bubble widths)
        html += `<div id="dm-roster-${store}" class="dm-store-roster" style="display: none; background: #fdfdfd; padding: 10px 20px; border-bottom: 1px solid #e2e8f0; box-shadow: inset 0 3px 6px rgba(0,0,0,0.02);">`;
        
        if (activeEmps.size === 0) {
            html += `<div style="font-size: 12px; color: #888; text-align: center; font-weight: 600; padding: 10px 0;">No data logged.</div></div>`;
            return;
        }

        Array.from(activeEmps).forEach(emp => {
            const empRecords = storeData.filter(r => r.employee === emp);
            let eG = 0, eR = 0;

            empRecords.forEach(r => {
                const recDate = new Date(r.date);
                if ((currentDmGoalView === 'daily' && r.date === todayStr) || (currentDmGoalView === 'weekly' && recDate >= startOfWeek)) {
                    eG += parseInt(r.goal) || 0;
                    eR += parseInt(r.result) || 0;
                }
            });

            const rClass = eG > 0 || eR > 0 ? (eR >= eG ? 'delta-pos' : 'delta-neg') : 'delta-neutral';

            html += `
            <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 15px; align-items: center; padding: 8px 0; border-bottom: 1px dashed #f0f0f0;">
                <span style="font-size: 13px; font-weight: 700; color: var(--slate-charcoal);">${emp}</span>
                <div style="display: flex; justify-content: center;">
                    <span style="font-size: 14px; font-weight: 800; color: #64748b; width: 36px; text-align: center; display: inline-block;">${eG || '-'}</span>
                </div>
                <div style="display: flex; justify-content: center; align-items: center;">
                    <span class="delta-badge ${rClass}" style="font-size: 14px; width: 36px; height: 26px; padding: 0; display: inline-flex; justify-content: center; align-items: center;">${eR || '-'}</span>
                </div>
            </div>`;
        });
        
        html += `</div>`; 
    });

    html += '</div>'; 
    cont.innerHTML = html;
}