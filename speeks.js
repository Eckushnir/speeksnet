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

// --- 2. GLOBAL UI & NAVIGATION ---
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
    document.getElementById('notifDropdown')?.classList.remove('show');
    document.getElementById('calendarDropdown')?.classList.remove('show');
    document.getElementById('manageDocsDropdown')?.classList.remove('show');
    document.getElementById('globalOverlay')?.classList.remove('show');
    
    if (!document.getElementById('authOverlay') || sessionStorage.getItem('speeksManagerUnlocked') === 'true') {
        document.body.classList.remove('no-scroll');
    }
}

function toggleNotifs() {
    const dropdown = document.getElementById('notifDropdown');
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains('show');
    closeAllModals(); 
    if (!isOpen) {
        dropdown.classList.add('show');
        document.getElementById('globalOverlay')?.classList.add('show');
        document.getElementById('notifBadge')?.classList.remove('active');
        document.body.classList.add('no-scroll');
    }
}

function toggleCalendar() {
    const dropdown = document.getElementById('calendarDropdown');
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains('show');
    closeAllModals(); 
    if (!isOpen) {
        dropdown.classList.add('show');
        document.getElementById('globalOverlay')?.classList.add('show');
        document.body.classList.add('no-scroll');
    }
}

function switchAnnTab(tab) {
    if (tab === 'recent') {
        document.getElementById('ann-container').style.display = 'block';
        document.getElementById('archive-container').style.display = 'none';
        document.getElementById('tab-recent').classList.add('active');
        document.getElementById('tab-archive').classList.remove('active');
    } else {
        document.getElementById('ann-container').style.display = 'none';
        document.getElementById('archive-container').style.display = 'block';
        document.getElementById('tab-archive').classList.add('active');
        document.getElementById('tab-recent').classList.remove('active');
    }
}

window.addEventListener('click', (e) => {
    const overlay = document.getElementById('globalOverlay');
    if (overlay && e.target === overlay) closeAllModals();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
});

// --- 3. GLOBAL DATA FETCHING (CMS) ---
async function loadCMS() {
    try {
        const response = await fetch(`${CMS_URL}?v=${Date.now()}`);
        const data = await response.json();
        
        const annContainer = document.getElementById('ann-container');
        const archiveContainer = document.getElementById('archive-container');
        const badge = document.getElementById('notifBadge');
        
        if (annContainer && archiveContainer) {
            let showBadge = false, recentHtml = "", archiveHtml = "", recentCount = 0, archiveCount = 0;
            if (data.announcements && data.announcements.length > 0) {
                const sortedAnns = [...data.announcements].reverse();
                const today = new Date();
                today.setHours(0,0,0,0);

                sortedAnns.forEach(item => {
                    const text = item.text || "", rawDate = item.date || "", author = item.author || "";
                    let displayDate = "", isArchived = false;

                    if (rawDate) {
                        const annDate = new Date(rawDate);
                        if (!isNaN(annDate.getTime())) {
                            displayDate = annDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                            const annDateOnly = new Date(annDate.getFullYear(), annDate.getMonth(), annDate.getDate());
                            const diffDays = (today - annDateOnly) / (1000 * 60 * 60 * 24);
                            if (diffDays <= 1 && diffDays >= 0) showBadge = true;
                            if (diffDays > 2) isArchived = true;
                        }
                    }

                    const htmlSnippet = `<div class="notif-item"><div class="ann-header"><span class="ann-author">${author || 'Announcement'}</span>${displayDate ? `<small class="ann-date">${displayDate}</small>` : ''}</div><hr /><div class="ann-text">${text}</div></div>`;
                    if (isArchived) { archiveHtml += htmlSnippet; archiveCount++; } else { recentHtml += htmlSnippet; recentCount++; }
                });
                if (recentCount === 0) recentHtml = '<div style="padding: 20px; color:#999; font-size:12px; text-align:center;">No recent announcements</div>';
                if (archiveCount === 0) archiveHtml = '<div style="padding: 20px; color:#999; font-size:12px; text-align:center;">No archived announcements</div>';
            } else {
                recentHtml = archiveHtml = '<div style="padding: 20px; color:#999; font-size:12px; text-align:center;">No announcements</div>';
            }
            annContainer.innerHTML = recentHtml;
            archiveContainer.innerHTML = archiveHtml;
            if (showBadge && badge) badge.classList.add('active');
        }

        const activeContainer = document.getElementById('active-container');
        if (activeContainer) {
            const activeProjects = data.active || [];
            activeContainer.innerHTML = activeProjects.length > 0
                ? activeProjects.map(txt => `<div class="cms-item cms-active">${txt}</div>`).join('') 
                : '<div class="cms-item">No active projects</div>';
        }

        const upcomingContainer = document.getElementById('upcoming-container');
        if (upcomingContainer) {
            const upcomingProjects = data.upcoming || [];
            upcomingContainer.innerHTML = upcomingProjects.length > 0
                ? upcomingProjects.map(txt => `<div class="cms-item cms-upcoming">${txt}</div>`).join('') 
                : '<div class="cms-item">No upcoming projects</div>';
        }
          
    } catch (e) { console.error("CMS Failed", e); }
}

// --- 4. MODULE: HUB / HOTKEYS ---
async function loadHotkeys() {
    const tbody = document.getElementById('kbBody');
    if (!tbody) return;
    try {
        const response = await fetch(`${HOTKEYS_URL}?v=${Date.now()}`);
        const data = await response.json();
        tbody.innerHTML = data.map((row) => {
            const cols = Object.values(row);
            const brand = cols[1] || "";
            if (brand.toLowerCase() === "brand" || !brand) return '';
            let bClass = 'b-generic';
            if (brand.toLowerCase().includes('apple')) bClass = 'b-apple';
            else if (['dell','hp','lenovo','asus'].some(x => brand.toLowerCase().includes(x))) bClass = 'b-windows';
            return `<tr><td><span class="bubble ${bClass}">${brand}</span></td><td>${cols[2]}</td><td>${cols[3]}</td><td>${cols[4]}</td><td>${cols[5]}</td></tr>`;
        }).join('');
    } catch (e) { console.error("KB Failed", e); }
}

function filterKB() {
    const filter = document.getElementById("kbSearch").value.toUpperCase();
    const rows = document.getElementById("kbBody").getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++) {
        const text = rows[i].textContent || rows[i].innerText;
        rows[i].style.display = text.toUpperCase().includes(filter) ? "" : "none";
    }
}

// --- 5. MODULE: DOCS & POLICIES ---
let globalDocsData = []; 

function toggleManageDocs() {
  const dropdown = document.getElementById('manageDocsDropdown');
  if(!dropdown) return;
  const isOpen = dropdown.classList.contains('show');
  
  if (!isOpen) {
    const enteredPin = prompt("Please enter the PIN to manage policies:");
    if (enteredPin !== "2770") {
      if (enteredPin !== null) alert("Incorrect PIN.");
      return; 
    }
  }

  closeAllModals();
  if (!isOpen) {
    populateManageModal();
    dropdown.classList.add('show');
    document.getElementById('globalOverlay')?.classList.add('show');
    document.body.classList.add('no-scroll');
  }
}

function populateManageModal() {
    const list = document.getElementById('manageDocsList');
    list.innerHTML = '';
    if (globalDocsData.length === 0) {
        addManageRow(); 
    } else {
        globalDocsData.forEach(doc => addManageRow(doc));
    }
}

function addManageRow(doc = { category: '', icon: '📄', title: '', desc: '', link: '' }) {
    const list = document.getElementById('manageDocsList');
    const row = document.createElement('div');
    row.className = 'manage-row';
    let baseCategory = doc.category || '';
    let isPinned = false;
    
    if (baseCategory.toLowerCase().includes('pinned')) {
        isPinned = true;
        baseCategory = baseCategory.replace(/,?\s*["']?pinned["']?/ig, '').trim();
    }

    row.innerHTML = `
        <input type="text" class="m-category" placeholder="Category" value="${baseCategory}">
        <label class="pin-label"><input type="checkbox" class="m-pinned" ${isPinned ? 'checked' : ''}> Pin</label>
        <input type="text" class="m-icon" placeholder="Icon" value="${doc.icon || ''}">
        <input type="text" class="m-title" placeholder="Title" value="${doc.title || ''}">
        <textarea class="m-desc" placeholder="Description">${doc.desc || ''}</textarea>
        <input type="text" class="m-link" placeholder="URL Link" value="${doc.link || ''}">
        <button class="del-btn" onclick="this.parentElement.remove()" title="Delete">✖</button>
    `;
    list.appendChild(row);
}

async function saveDocs() {
    const btn = document.getElementById('saveDocsBtn');
    const rows = document.querySelectorAll('.manage-row');
    const updatedDocs = [];
    
    rows.forEach(row => {
        const title = row.querySelector('.m-title').value.trim();
        if(title) { 
            let cat = row.querySelector('.m-category').value.trim();
            let isPinned = row.querySelector('.m-pinned').checked;
            updatedDocs.push({
                category: isPinned ? (cat ? `${cat}, Pinned` : 'Pinned') : cat,
                icon: row.querySelector('.m-icon').value.trim(),
                title: title,
                desc: row.querySelector('.m-desc').value.trim(),
                link: row.querySelector('.m-link').value.trim()
            });
        }
    });

    btn.textContent = "Saving..."; btn.style.opacity = "0.7";
    try {
        const response = await fetch(DOCS_URL, { method: 'POST', body: JSON.stringify(updatedDocs) });
        if(response.ok) {
            globalDocsData = updatedDocs;
            localStorage.setItem('speeksDocsData', JSON.stringify(updatedDocs));
            renderDocs(updatedDocs);
            closeAllModals();
        } else alert("Error saving data.");
    } catch (e) {
        alert("Failed to connect to server.");
    } finally {
        btn.textContent = "Save Changes"; btn.style.opacity = "1";
    }
}

function renderDocs(docs) {
    const container = document.getElementById('content-container');
    if (!container) return;
    if (!docs || docs.length === 0) {
        container.innerHTML = '<div class="empty-state">No documents found.</div>';
        return;
    }
    
    const groupedDocs = {};
    docs.forEach(doc => {
        let originalCategory = doc.category || "Uncategorized";
        let isPinned = originalCategory.toLowerCase().includes('pinned');
        let cleanCategory = originalCategory.replace(/,?\s*["']?pinned["']?/ig, '').trim() || "General"; 

        if (!groupedDocs[cleanCategory]) groupedDocs[cleanCategory] = [];
        groupedDocs[cleanCategory].push(doc);

        if (isPinned) {
            if (!groupedDocs['📌 Pinned']) groupedDocs['📌 Pinned'] = [];
            groupedDocs['📌 Pinned'].push(doc);
        }
    });

    const sortedCategories = Object.keys(groupedDocs).sort((a, b) => {
        if (a === '📌 Pinned') return -1;
        if (b === '📌 Pinned') return 1;
        return a.localeCompare(b);
    });

    let htmlContent = '';
    for (const category of sortedCategories) {
        const items = groupedDocs[category];
        const isPinnedCategory = category === '📌 Pinned';
        const titleStyle = isPinnedCategory ? 'color: var(--idea-gold); border-bottom-color: var(--idea-gold);' : '';
        
        htmlContent += `<div class="category-section"><div class="category-title" style="${titleStyle}">${category}</div><div class="docs-grid">`;
        
        items.forEach(item => {
            const searchKeywords = `${item.title} ${item.desc} ${category}`.toLowerCase();
            const cardStyle = isPinnedCategory ? 'position: relative; border: 1px solid var(--idea-gold); box-shadow: 0 4px 10px rgba(245, 158, 11, 0.08);' : 'position: relative;';
            const pinHtml = isPinnedCategory ? `<div style="position: absolute; top: 12px; right: 15px; font-size: 16px; filter: drop-shadow(0 2px 4px rgba(245,158,11,0.3));">📌</div>` : '';
            
            htmlContent += `
                <a href="${item.link}" target="_blank" class="doc-card" style="${cardStyle}" data-search="${searchKeywords}">
                    ${pinHtml}
                    <div class="doc-icon">${item.icon}</div>
                    <div class="doc-info">
                        <div class="doc-title">${item.title}</div>
                        <div class="doc-desc">${item.desc}</div>
                    </div>
                </a>`;
        });
        htmlContent += `</div></div>`;
    }
    container.innerHTML = htmlContent;
    filterDocs();
}

async function loadDocs() {
    const cachedDocs = localStorage.getItem('speeksDocsData');
    if (cachedDocs) {
        try {
            globalDocsData = JSON.parse(cachedDocs);
            renderDocs(globalDocsData);
        } catch (e) {}
    } else {
        document.getElementById('content-container').innerHTML = '<div class="empty-state">Loading Documents...</div>';
    }

    try {
        const response = await fetch(`${DOCS_URL}?v=${Date.now()}`);
        const docs = await response.json();
        globalDocsData = docs;
        localStorage.setItem('speeksDocsData', JSON.stringify(docs));
        renderDocs(docs);
    } catch (e) { 
        if (!cachedDocs) document.getElementById('content-container').innerHTML = '<div class="empty-state">Failed to load documents.</div>'; 
    }
}

function filterDocs() {
    const searchInput = document.getElementById('docSearch')?.value.toLowerCase() || "";
    const docCards = document.querySelectorAll('.doc-card');
    let hasVisibleCards = false;

    docCards.forEach(card => {
        const searchTerms = card.getAttribute('data-search');
        const isMatch = searchTerms.includes(searchInput);
        card.classList.toggle('hidden', !isMatch);
        if (isMatch) hasVisibleCards = true;
    });

    document.querySelectorAll('.category-section').forEach(section => {
        const visibleInGroup = section.querySelectorAll('.doc-card:not(.hidden)').length > 0;
        section.classList.toggle('hidden', !visibleInGroup);
    });

    document.getElementById('noResults')?.classList.toggle('hidden', hasVisibleCards || searchInput === '');
}

// --- 6. MODULE: MANAGER DASHBOARD (KPIs, Checklists, Variance, Weekly) ---
let dynamicMonths = [];
let rawKPIData = [];
let monthlyKpiCache = {}; 
let weeklyKpiCache = {}; 
let liveVarianceDataCache = {};
let hubDataCache = null; 
let authFetchPromise = null;

function startAuthFetch() {
    authFetchPromise = fetch(`${AUTH_URL}?v=${Date.now()}`)
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .catch(e => { return null; });
}

async function hashString(str) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkPIN() {
    const pinInput = document.getElementById('pinInput');
    const pinError = document.getElementById('pinError');
    const btn = document.getElementById('unlockBtn');
    const pin = pinInput.value;
    if(!pin) return;
    
    btn.innerText = "Verifying..."; btn.style.opacity = "0.7"; pinError.style.display = 'none';

    try {
        const authPayload = await authFetchPromise;
        if (!authPayload || !authPayload.users) throw new Error("Invalid payload");

        const hashed = await hashString(pin);
        const matchedUser = authPayload.users.find(u => String(u.hash).toLowerCase() === hashed.toLowerCase());
        
        if (matchedUser) {
            sessionStorage.setItem('speeksManagerUnlocked', 'true');
            sessionStorage.setItem('speeksActiveManager', matchedUser.name);
            document.getElementById('authOverlay').style.display = 'none';
            document.body.style.overflow = 'auto';
            initDashboardData();
        } else {
            pinError.innerText = "Incorrect PIN. Please try again.";
            pinError.style.display = 'block';
            pinInput.value = '';
        }
    } catch (err) {
        pinError.innerText = "Connection/Security Error.";
        pinError.style.display = 'block';
    } finally {
        btn.innerText = "Unlock Portal"; btn.style.opacity = "1";
    }
}

function formatSmartValue(val, name) {
    if (val === null || val === undefined || String(val).trim() === '') return '-';
    let num = parseFloat(val);
    if (isNaN(num)) return String(val).trim();
    let nameLower = name.toLowerCase();
    
    if (nameLower.includes('%') || nameLower.includes('rate') || nameLower.includes('variance') || nameLower.includes('margin') || nameLower.includes('gm') || nameLower.includes('cogs sold vs')) {
        return `${num.toFixed(2).replace(/\.00$/, '')}%`;
    }

    let isCurrency = nameLower.includes('sales') || nameLower.includes('cost') || nameLower.includes('refund') || nameLower.includes('discount') || nameLower.includes('profit') || nameLower.includes('cogs') || nameLower.includes('value') || nameLower.includes('buying') || nameLower.includes('confiscation') || nameLower === 'recycled inventory';       
    if (nameLower.includes('ranking') || nameLower.includes('score') || nameLower.includes('reviews') || nameLower.includes('#') || nameLower.includes('returning customers') || nameLower.includes('time') || nameLower === 'recycled % of inventory' || nameLower.includes('gm')) {
         isCurrency = false;
    }

    if (isCurrency) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num).replace(/\.00$/, '');
    return new Intl.NumberFormat('en-US').format(num);
}

function generateSparklineSVG(dataArray) {
    if (!dataArray || dataArray.length === 0) return '';
    const validData = dataArray.map(v => parseFloat(String(v).replace(/[$,%]/g, ''))).filter(n => !isNaN(n));
    if (validData.length === 0) return '';
    const min = Math.min(...validData);
    const max = Math.max(...validData);
    const width = 70, height = 20, padding = 2;
    const points = validData.map((val, i) => {
        const x = padding + (i / (validData.length - 1)) * (width - padding * 2);
        const range = max - min === 0 ? 1 : max - min; 
        const y = padding + (height - padding * 2) - ((val - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    });
    return `<svg class="sparkline" viewBox="0 0 ${width} ${height}"><path d="M ${points.join(' L ')}"></path></svg>`;
}

function toggleCategory(el) { el.parentElement.classList.toggle('collapsed'); }
function getRawNumber(v) { if(!v) return 0; let n = parseFloat(v); return isNaN(n) ? 0 : n; }

function groupKPIs(data) {
    const categories = { "Buying Metrics": [], "Inventory": [], "Gross Sales": [], "Net Sales & Margins": [], "Sales Channels": [], "Shipping Costs": [], "Rankings & Reviews": [], "Recycled & Confiscated": [], "Other Metrics": [] };
    const ignoreList = ['ebay rank', 'defect rate', 'late shipment', 'case w/no resolution', 'tracking uploaded', 'top rated', 'cases closed'];
    let allMetrics = [];
    if (Array.isArray(data)) data.forEach(item => { if (item.metrics) allMetrics.push(...item.metrics); else if (item.name) allMetrics.push(item); });
    allMetrics.forEach(metric => {
        if (!metric || !metric.name) return;
        let name = metric.name.toLowerCase().replace(/\s+/g, ' ').trim();
        if (ignoreList.some(iw => name.includes(iw))) return; 
        if (["buying", "buying gm", "buy vs sell variance", "customer close rate", "device close rate", "# of customers", "buy value/customer", "# of items purchased", "returning customers", "% of returning customers", "avg transaction time"].includes(name)) categories["Buying Metrics"].push(metric);
        else if (name.includes('inventory cost') || ["% of inventory over 30 days"].includes(name)) categories["Inventory"].push(metric);
        else if (["gross sales", "discounts", "refunds", "returns cancelled", "return rate"].includes(name)) categories["Gross Sales"].push(metric);
        else if (["net sales", "cogs", "gross profit", "gross profit %", "cogs sold vs. cogs listed"].includes(name)) categories["Net Sales & Margins"].push(metric);
        else if (name.includes("draft order") || name.includes("pos") || name.includes("online") || name.includes("non ebay")) categories["Sales Channels"].push(metric);
        else if (name.includes("shipping")) categories["Shipping Costs"].push(metric);
        else if (name.includes("paymore") || name.includes("google")) categories["Rankings & Reviews"].push(metric);
        else if (name.includes("recycled") || name.includes("confiscation")) categories["Recycled & Confiscated"].push(metric);
        else categories["Other Metrics"].push(metric);
    });
    return Object.keys(categories).map(cat => ({ category: cat, metrics: categories[cat] })).filter(g => g.metrics.length > 0);
}

async function fetchKPIData(isRetry = false) {
    const store = document.getElementById('kpiStoreSelect')?.value;
    const container = document.getElementById('kpiDashboardContainer');
    if(!container) return;

    // Helper function to safely set dropdown values based on the Month TEXT, not the index number
    const setSmartDropdowns = (pSel, cSel, monthsArray) => {
        const currPText = pSel.options[pSel.selectedIndex]?.text;
        const currCText = cSel.options[cSel.selectedIndex]?.text;
        
        pSel.innerHTML = ''; cSel.innerHTML = '';
        monthsArray.forEach((m, i) => { pSel.add(new Option(m, i)); cSel.add(new Option(m, i)); });
        
        // Find if the previously looked-at month exists in this store's history
        const matchedPIdx = monthsArray.findIndex(m => m === currPText);
        const matchedCIdx = monthsArray.findIndex(m => m === currCText);

        // If it exists, stay on that month. If not, default to the newest month
        pSel.value = matchedPIdx !== -1 ? matchedPIdx : monthsArray.length - 1; 
        cSel.value = matchedCIdx !== -1 ? matchedCIdx : Math.max(0, monthsArray.length - 2); 
    };

    // 1. INSTANT LOAD FROM CACHE (If the background preloader already grabbed it)
    if (monthlyKpiCache[store]) {
        dynamicMonths = monthlyKpiCache[store].months;
        rawKPIData = monthlyKpiCache[store].data;
        
        const pSel = document.getElementById('primaryMonthSelect');
        const cSel = document.getElementById('compareMonthSelect');
        
        setSmartDropdowns(pSel, cSel, dynamicMonths);
        renderKPIDashboard();
        return; 
    }
    
    // 2. FETCH FROM GOOGLE (If it hasn't been cached yet)
    try {
        const response = await fetch(`${MONTHLY_KPI_URL}?store=${store}&v=${Date.now()}`);
        const payload = await response.json();
        
        monthlyKpiCache[store] = { months: payload.months, data: groupKPIs(payload.data) };
        dynamicMonths = monthlyKpiCache[store].months;
        rawKPIData = monthlyKpiCache[store].data;

        const pSel = document.getElementById('primaryMonthSelect');
        const cSel = document.getElementById('compareMonthSelect');
        
        setSmartDropdowns(pSel, cSel, dynamicMonths);
        renderKPIDashboard();
    } catch (e) { 
        console.error("Monthly KPI fetch failed:", e); 
    }
}

function renderKPIDashboard() {
    const store = document.getElementById('kpiStoreSelect').value;
    const primaryIdx = document.getElementById('primaryMonthSelect').value;
    const compareIdx = document.getElementById('compareMonthSelect').value;
    const container = document.getElementById('kpiDashboardContainer');
    document.getElementById('header-primary-label').innerText = dynamicMonths[primaryIdx];
    document.getElementById('header-compare-label').innerText = dynamicMonths[compareIdx];

    const viewId = `kpi-view-${store}-${primaryIdx}-${compareIdx}`;
    Array.from(container.children).forEach(child => child.style.display = 'none');

    const existingView = document.getElementById(viewId);
    if (existingView) { existingView.style.display = 'block'; return; }

    setTimeout(() => {
        let html = '';
        rawKPIData.forEach(cat => {
            html += `<div class="kpi-category"><div class="kpi-category-header" onclick="toggleCategory(this)">${cat.category}<span class="chevron">▼</span></div><div class="kpi-category-content">`;
            cat.metrics.forEach(metric => {
                const rP = metric.values[primaryIdx], rC = metric.values[compareIdx];
                const deltaNum = getRawNumber(rP) - getRawNumber(rC);
                let isPct = metric.name.toLowerCase().match(/%|rate|variance|margin|gm|cogs/);
                let deltaStr = isPct ? `${Math.abs(deltaNum).toFixed(2).replace(/\.00$/, '')}%` : formatSmartValue(Math.abs(deltaNum), metric.name);
                let badgeClass = 'delta-neutral', sign = '';
                
                if (Math.abs(deltaNum) > 0.001) {
                    sign = deltaNum > 0 ? '+' : '-';
                    badgeClass = deltaNum > 0 ? (metric.inverse ? 'delta-neg' : 'delta-pos') : (metric.inverse ? 'delta-pos' : 'delta-neg');
                } else deltaStr = '0';

                html += `<div class="kpi-row"><div class="kpi-name-col"><span class="kpi-name">${metric.name}</span>${generateSparklineSVG(metric.values)}</div><div class="kpi-value-col kpi-primary-val">${formatSmartValue(rP, metric.name)}</div><div class="kpi-value-col" style="color: #888;">${formatSmartValue(rC, metric.name)}</div><div class="kpi-delta-col"><span class="delta-badge ${badgeClass}">${sign}${deltaStr}</span></div></div>`;
            });
            html += `</div></div>`;
        });
        const newView = document.createElement('div');
        newView.id = viewId; newView.innerHTML = html;
        container.appendChild(newView);
    }, 10);
}

// ----- VARIANCE REPORTS (RESTORED) -----
function formatVariancePct(num) {
  const formatted = Math.abs(num).toFixed(2) + '%';
  if (Math.abs(num) < 0.001) return '0.00%';
  return num < 0 ? `-${formatted}` : `+${formatted}`;
}

function createVarianceStoreCard(storeKey) {
  if (storeKey === "NONE" || !liveVarianceDataCache[storeKey] || !liveVarianceDataCache[storeKey].employees) return '';
  const data = liveVarianceDataCache[storeKey];
  const totalClass = data.total < 0 ? 'delta-neg' : (data.total > 0 ? 'delta-pos' : 'delta-neutral');
  
  let periodText = "Current", isNew = false;
  if (data.fileName) {
      periodText = data.fileName.replace(new RegExp(`${storeKey}\\s*`, 'i'), '').trim();
      const months = { "Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April", "May": "May", "Jun": "June", "Jul": "July", "Aug": "August", "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December" };
      periodText = periodText.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/ig, match => months[match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()] || match);
  }
  
  if (data.fileDate && (Date.now() - data.fileDate) < (7 * 24 * 60 * 60 * 1000)) isNew = true;
  
  let empHtml = data.employees.map(emp => {
    const badgeClass = emp.val < 0 ? 'delta-neg' : (emp.val > 0 ? 'delta-pos' : 'delta-neutral');
    return `<div class="kpi-row" style="padding: 0 20px; height: 48px; grid-template-columns: 1fr auto; border-top: 1px solid #f5f5f5; border-radius: 0; border-left: none; border-right: none; margin: 0; background: white;"><span class="kpi-name">${emp.name}</span><span class="delta-badge ${badgeClass}">${formatVariancePct(emp.val)}</span></div>`;
  }).join('');

  return `
    <div style="border: 1px solid #eee; border-radius: 12px; background: white; overflow: hidden;">
      <div style="background: #f9fafb; padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center;">
                <span style="font-size: 16px; font-weight: 900; color: var(--slate-charcoal); text-transform: uppercase;">${storeKey} TOTAL</span>
                ${isNew ? `<span class="vw-pulse-badge" title="New Report Added This Week">🚨 NEW</span>` : ''}
            </div>
            <div><span style="background: #e2e8f0; color: #334155; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">🗓️ ${periodText}</span></div>
        </div>
        <span class="delta-badge ${totalClass}" style="font-size: 16px; padding: 8px 14px;">${formatVariancePct(data.total)}</span>
      </div>
      <div class="vw-scroll-area" style="display: flex; flex-direction: column;">${empHtml}</div>
    </div>`;
}

function renderVariance() {
  const primary = document.getElementById('vw-primary')?.value;
  const compare = document.getElementById('vw-compare')?.value;
  const container = document.getElementById('vw-dashboard-container');
  if(!container || !primary) return;
  container.style.gridTemplateColumns = compare === "NONE" ? "1fr" : "1fr 1fr";
  container.innerHTML = createVarianceStoreCard(primary) + createVarianceStoreCard(compare);
}

async function fetchVarianceData() {
    const container = document.getElementById('vw-dashboard-container');
    if(!container) return;
    try {
        const response = await fetch(`${VARIANCE_API_URL}?v=${Date.now()}`);
        const data = await response.json();
        if (data.error) { container.innerHTML = `<div style="padding: 40px; text-align: center; color: #dc2626; font-weight: 600; grid-column: 1 / -1;">Error: ${data.error}</div>`; return; }
        liveVarianceDataCache = data;
        renderVariance();
    } catch (e) { container.innerHTML = '<div style="padding: 40px; text-align: center; color: #dc2626; font-weight: 600; grid-column: 1 / -1;">Failed to sync Variance data.</div>'; }
}

// ----- WEEKLY KPI BREAKDOWN (RESTORED) -----
function formatTime(val) {
    if (!val || val === "") return "";
    let s = String(val).trim();
    if (!s.includes(':')) {
        if (s.includes('.')) { let parts = s.split('.'); let sec = parts[1]; if (sec.length === 1) sec += '0'; return parts[0] + ':' + sec.substring(0,2); } 
        else if (!isNaN(s)) return s + ':00'; 
    }
    return s.length <= 5 && s.includes(':') ? s : s;
}

function checkRule(ruleName, val) {
    if (!val || val === "") return false;
    if (ruleName === 'margin') return parseFloat(val.replace(/[^0-9.-]/g, '')) < 51;
    if (ruleName === 'conversion') return parseFloat(val.replace(/[^0-9.-]/g, '')) < 85;
    if (ruleName === 'nodeals') return parseFloat(val.replace(/[^0-9.-]/g, '')) > 7;
    if (ruleName === 'time') {
        let s = val.toString(), mins = 0;
        if (s.includes(':')) { let parts = s.split(':'); mins = parseInt(parts[0]) + (parseInt(parts[1])/60); } else mins = parseFloat(s);
        return mins > 13;
    }
    return false;
}

async function fetchWeeklyKPIs() {
  const container = document.getElementById('weeklyKpiContainer');
  const store = document.getElementById('weeklyKpiStoreSelect')?.value;
  const periodBadge = document.getElementById('weeklyKpiPeriod');
  if(!container || !store) return;
  
  const viewId = `weekly-view-${store}`;
  Array.from(container.children).forEach(child => child.style.display = 'none');
  
  const existingView = document.getElementById(viewId);
  if (existingView) {
      existingView.style.display = 'contents'; 
      if (weeklyKpiCache[store] && weeklyKpiCache[store].periodText) { periodBadge.innerText = weeklyKpiCache[store].periodText; periodBadge.style.display = "inline-block"; } 
      else periodBadge.style.display = "none";
      return; 
  }

  let fetchMsg = document.getElementById('weekly-fetch-msg');
  if (!fetchMsg) {
      fetchMsg = document.createElement('div'); fetchMsg.id = 'weekly-fetch-msg';
      fetchMsg.style.cssText = 'padding: 40px; text-align: center; color: #888; font-weight: 600; grid-column: 1 / -1;';
      container.appendChild(fetchMsg);
  }
  fetchMsg.innerText = 'Syncing Live Weekly Data...'; fetchMsg.style.display = 'block';

  try {
      const response = await fetch(`${WEEKLY_KPI_URL}?store=${store}&time=4-Week&v=${Date.now()}`);
      const data = await response.json();
      let storeAvg = {}, employees = [], firstEmpRowIndex = -1, storeTotalRowIndex = -1;

      for (let i = data.length - 1; i >= 0; i--) { if (String(data[i][0]).trim().toLowerCase() === "store") { storeTotalRowIndex = i; break; } }

      if (storeTotalRowIndex !== -1) {
          let stRow = data[storeTotalRowIndex];
          storeAvg = { buyVal: stRow[2], buyMargin: stRow[5], customers: stRow[6], conversion: stRow[8], time: formatTime(stRow[12]), noDeals: stRow[14], listed: stRow[20] };

          for (let i = Math.max(0, storeTotalRowIndex - 6); i <= Math.min(data.length - 1, storeTotalRowIndex + 6); i++) {
              if (i === storeTotalRowIndex) continue;
              let name = String(data[i][0]).trim(), lowerName = name.toLowerCase();
              if (name && !["name", "employee", "store", "store total", "ovl", "lee", "wsp", "mpl", "bal"].includes(lowerName) && !lowerName.includes("average") && !lowerName.includes("week")) {
                  if (String(data[i][2]).trim() !== "" || String(data[i][20]).trim() !== "") {
                      if (firstEmpRowIndex === -1) firstEmpRowIndex = i; 
                      employees.push({ name: name, buyVal: data[i][2], buyMargin: data[i][5], customers: data[i][6], conversion: data[i][8], time: formatTime(data[i][12]), noDeals: data[i][14], listed: data[i][20] });
                  }
              }
          }
      }

      let periodTextToSave = "";
      if (firstEmpRowIndex !== -1) {
          let headerRowIndex = firstEmpRowIndex - 3; let headerRow = data[headerRowIndex];
          if (!headerRow || (!String(headerRow[2]).trim() && !String(headerRow[4]).trim())) headerRow = data[firstEmpRowIndex - 2];
          if (headerRow) {
              let rawMonth = String(headerRow[2] || '').trim(), rawStart = String(headerRow[4] || '').trim(), rawEnd = String(headerRow[6] || '').trim();
              let formattedMonth = rawMonth.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/ig, m => ({"Jan":"January","Feb":"February","Mar":"March","Apr":"April","May":"May","Jun":"June","Jul":"July","Aug":"August","Sep":"September","Oct":"October","Nov":"November","Dec":"December"}[m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()] || m));
              if (rawMonth && rawStart && rawEnd) { periodTextToSave = `🗓️ ${formattedMonth} ${rawStart}-${rawEnd}`; periodBadge.innerText = periodTextToSave; periodBadge.style.display = "inline-block"; } 
              else periodBadge.style.display = "none";
          }
      }
      weeklyKpiCache[store] = { periodText: periodTextToSave };

      if (employees.length === 0) { fetchMsg.innerText = 'No employee data found.'; fetchMsg.style.color = '#dc2626'; return; }

      const buildCol = (title, storeVal1, storeBadgeVal, empKey1, empBadgeKey, ruleName, isPctBadge) => {
         let hasBadge = empBadgeKey !== '', gridCols = '1fr 75px 55px';
         let empHtml = employees.map(emp => {
            let val1 = empKey1 ? String(emp[empKey1] || '').trim() : '';
            let val1Style = 'text-align: right; font-size: 12px; font-weight: 700; color: #555; white-space: nowrap;';
            let badge2Html = '<span></span>';
            if (hasBadge) {
               let val2 = String(emp[empBadgeKey] || '').trim();
               if (val2 !== "") {
                   let badgeClass = checkRule(ruleName, val2) ? 'delta-neg' : 'delta-neutral'; 
                   if (isPctBadge && !val2.includes('%')) val2 += '%';
                   badge2Html = `<span style="display: flex; justify-content: flex-end;"><span class="delta-badge ${badgeClass}">${val2}</span></span>`;
               }
            } else if (empKey1 && checkRule(ruleName, val1)) val1Style += ' color: var(--red-alert); font-weight: 900;';
            return `<div class="kpi-row" style="display: grid; grid-template-columns: ${gridCols}; align-items: center; padding: 0 15px; height: 48px; border-top: 1px solid #f5f5f5; border-radius: 0; background: white; margin: 0; border-left: none; border-right: none; gap: 8px;"><span class="kpi-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${emp.name}</span><span style="${val1Style}">${val1}</span>${badge2Html}</div>`;
         }).join('');

         let storeBadgeHtml = '<span></span>', storeVal1Style = 'font-size: 13px; font-weight: 800; color: var(--slate-charcoal); text-align: right; white-space: nowrap;';
         if (hasBadge && storeBadgeVal && storeBadgeVal !== "") {
             let finalVal = storeBadgeVal; if (isPctBadge && !String(finalVal).includes('%')) finalVal += '%';
             storeBadgeHtml = `<span style="display: flex; justify-content: flex-end;"><span class="delta-badge ${checkRule(ruleName, storeBadgeVal) ? 'delta-neg' : 'delta-neutral'}">${finalVal}</span></span>`;
         } else if (storeVal1 && storeVal1 !== "" && checkRule(ruleName, storeVal1)) storeVal1Style += ' color: var(--red-alert); font-weight: 900;';

         return `<div style="border: 1px solid #eee; border-radius: 12px; background: white; overflow: hidden;"><div style="background: #f9fafb; padding: 15px; border-bottom: 1px solid #eee; text-align: center;"><h4 style="font-size: 12px; font-weight: 800; color: var(--slate-charcoal); text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px; white-space: nowrap;">${title}</h4><div style="display: grid; grid-template-columns: ${gridCols}; align-items: center; background: white; padding: 0 12px; height: 40px; border-radius: 8px; border: 1px solid #eee; gap: 8px;"><span style="font-size: 11px; font-weight: 800; color: #888; text-align: left;">STORE TOTAL</span><span style="${storeVal1Style}">${storeVal1 || ''}</span>${storeBadgeHtml}</div></div><div style="display: flex; flex-direction: column;">${empHtml}</div></div>`;
      };

      fetchMsg.style.display = 'none';
      const newView = document.createElement('div'); newView.id = viewId; newView.style.display = 'contents';
      newView.innerHTML = `
         ${buildCol('Buying Performance', storeAvg.buyVal, storeAvg.buyMargin, 'buyVal', 'buyMargin', 'margin', true)}
         ${buildCol('Customer Conversion', storeAvg.customers, storeAvg.conversion, 'customers', 'conversion', 'conversion', true)}
         ${buildCol('No Deals', '', storeAvg.noDeals, '', 'noDeals', 'nodeals', false)}
         ${buildCol('Avg Trans. Time', '', storeAvg.time, '', 'time', 'time', false)}
         ${buildCol('Processed / Listed', storeAvg.listed, '', 'listed', '', null, false)}
      `;
      container.appendChild(newView);
  } catch (error) { fetchMsg.innerText = 'Failed to load Weekly KPI data.'; fetchMsg.style.color = '#dc2626'; }
}

function safeParse(val) {
    if (!val && val !== 0) return 0;
    if (typeof val === 'number') return val;
    let cleaned = String(val).replace(/[^0-9.-]/g, '');
    let num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

// Hub Data (Manager & Metrics share this)
async function fetchHubData() {
    try {
        const res = await fetch(`${HUB_URL}?v=${Date.now()}`);
        hubDataCache = await res.json();
        if (document.getElementById('bs-buy-val')) renderBuyingSales(); 
        if (document.getElementById('rev-list')) renderLiveData(hubDataCache); // For metrics page
    } catch(e) {}
}

function renderBuyingSales() {
    if(!hubDataCache) return;
    const store = document.getElementById('bsStoreSelect')?.value.toLowerCase();
    if(!store) return;
    
    let buyVal = safeParse(hubDataCache[`${store}BuyVal`]);
    let buyProj = safeParse(hubDataCache[`${store}BuyProj`]);
    let rawMargin = hubDataCache[`${store}BuyMargin`];
    let marginNum = (typeof rawMargin === 'string' && rawMargin.includes('%')) ? safeParse(rawMargin) : safeParse(rawMargin) * 100;

    document.getElementById('bs-buy-val').innerText = `$${Math.round(buyVal).toLocaleString()}`;
    let mb = document.getElementById('bs-buy-margin');
    mb.innerText = marginNum.toFixed(1) + '%';
    mb.className = marginNum > 0 && marginNum < 51 ? 'delta-badge delta-neg' : 'delta-badge delta-neutral';
    document.getElementById('bs-buy-proj').innerText = `$${Math.round(buyProj).toLocaleString()}`;

    let p = safeParse(hubDataCache[`${store}Pct`]);
    if (p > 0 && p <= 1 && !String(hubDataCache[`${store}Pct`]).includes('%')) p *= 100;
    p = Math.round(p);

    document.getElementById('bs-pct').innerText = p + '%';
    document.getElementById('bs-goal').innerText = `Goal: $${Math.round(safeParse(hubDataCache[`${store}Goal`])).toLocaleString()}`;
    document.getElementById('bs-t-gp').innerText = `$${Math.round(safeParse(hubDataCache[`${store}TrackGP`])).toLocaleString()}`;
    
    let bsBar = document.getElementById('bs-bar');
    if(bsBar) {
        bsBar.style.strokeDashoffset = 402 - (Math.min(p, 100)/100)*402;
        bsBar.style.stroke = p < 100 ? "var(--red-alert)" : "var(--sage-professional)";
    }
}

// Checklists Bootstrapper
async function initChecklists() {
    const activeManager = sessionStorage.getItem('speeksActiveManager');
    if (!activeManager || !document.getElementById('dynamicChecklistContainer')) return; 

    const cacheKeyTasks = `speeksTasksCache_${activeManager}`;
    const cacheKeyState = `speeksCheckState_${activeManager}`;
    const container = document.getElementById('dynamicChecklistContainer');

    let myTasks = JSON.parse(localStorage.getItem(cacheKeyTasks) || '[]');
    let checkState = JSON.parse(localStorage.getItem(cacheKeyState) || '{}');

    const renderTasks = (tasksToRender, state) => {
        const buildCard = (title, icon, tasks) => {
            let html = `<div class="card" style="margin-bottom: 0; padding: 25px;"><div class="checklist-header">${icon} ${title} Checklist</div>`;
            if (tasks.length === 0) html += `<div style="color:#888; font-size:12px; font-weight:600;">No tasks assigned.</div>`;
            else tasks.forEach(t => {
                let safeId = "chk_" + t.text.replace(/[^a-zA-Z0-9]/g, '');
                html += `<label class="checklist-item"><input type="checkbox" id="${safeId}" ${state[safeId] ? 'checked' : ''}> ${t.text}</label>`;
            });
            return html + `</div>`;
        };

        container.innerHTML = buildCard('Daily', '⚡', tasksToRender.filter(t => t.category === 'daily')) + 
                              buildCard('Weekly', '🔄', tasksToRender.filter(t => t.category === 'weekly')) + 
                              buildCard('Monthly', '🎯', tasksToRender.filter(t => t.category === 'monthly'));

        container.querySelectorAll('input[type="checkbox"]').forEach(box => {
            box.addEventListener('change', (e) => {
                checkState[box.id] = e.target.checked;
                localStorage.setItem(cacheKeyState, JSON.stringify(checkState)); 
                fetch(AUTH_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ name: activeManager, checkState: checkState }) }).catch(()=>{});
            });
        });
    };

    if (myTasks.length > 0) renderTasks(myTasks, checkState);
    const authPayload = await authFetchPromise;
    if (authPayload && authPayload.users && authPayload.tasks) {
        const managerData = authPayload.users.find(u => String(u.name).toLowerCase() === activeManager.toLowerCase());
        if (managerData && managerData.checkState) {
            try { checkState = JSON.parse(managerData.checkState); } catch(e) {}
            localStorage.setItem(cacheKeyState, JSON.stringify(checkState));
        }
        myTasks = authPayload.tasks.filter(t => t.manager === 'all' || t.manager === activeManager.toLowerCase());
        localStorage.setItem(cacheKeyTasks, JSON.stringify(myTasks));
        renderTasks(myTasks, checkState);
    }
}

// Background Manager Data loader
async function preloadAllStores() {
    if(!document.getElementById('kpiDashboardContainer')) return;
    const stores = ["OVL", "LEE", "WSP", "MPL", "BAL"];
    for (const s of stores) {
        if (!monthlyKpiCache[s]) {
            try {
                const res = await fetch(`${MONTHLY_KPI_URL}?store=${s}&v=${Date.now()}`);
                const payload = await res.json();
                if (!payload.error) monthlyKpiCache[s] = { months: payload.months, data: groupKPIs(payload.data) };
            } catch(e) {} 
        }
    }
}

function initDashboardData() {
    initChecklists(); 
    setTimeout(fetchHubData, 100);
    setTimeout(fetchVarianceData, 300); // Restored!
    setTimeout(fetchWeeklyKPIs, 500); // Restored!
    setTimeout(fetchKPIData, 700); 
    setTimeout(preloadAllStores, 4000);
}

// --- 7. MODULE: METRICS (CHARTS & RECORDS) ---
let mainChartInstance = null;
let currentTimeframe = '4-Week';
let recordsCache = JSON.parse(localStorage.getItem('speeksRecordsCache')) || null; 
let kpiChartCache = JSON.parse(localStorage.getItem('speeksKpiChartCache')) || { '4-Week': null, 'Monthly': null };

function switchPageTab(tab) {
    document.getElementById('pane-trends')?.classList.remove('active');
    document.getElementById('pane-records')?.classList.remove('active');
    document.getElementById('tab-btn-trends')?.classList.remove('active');
    document.getElementById('tab-btn-records')?.classList.remove('active');

    document.getElementById('pane-' + tab)?.classList.add('active');
    document.getElementById('tab-btn-' + tab)?.classList.add('active');

    if (tab === 'records') renderRecords();
}

function setTimeframe(t) { 
    currentTimeframe = t; 
    document.getElementById('btn-4week')?.classList.toggle('active', t === '4-Week');
    document.getElementById('btn-monthly')?.classList.toggle('active', t === 'Monthly');
    loadKpiData(); 
}

function loadKpiData() {
    const metric = document.getElementById('metricSelector')?.value;
    if (!metric) return;
    if (kpiChartCache[currentTimeframe]) renderKpiChart(kpiChartCache[currentTimeframe], metric);
    else fetchChartData(currentTimeframe);
}

async function fetchChartData(timeframe) {
    try {
        const responses = await Promise.all([
            fetch(`${WEEKLY_KPI_URL}?store=OVL&time=${timeframe}`),
            fetch(`${WEEKLY_KPI_URL}?store=LEE&time=${timeframe}`),
            fetch(`${WEEKLY_KPI_URL}?store=WSP&time=${timeframe}`)
        ]);
        const allData = await Promise.all(responses.map(r => r.json()));
        
        const isDataDifferent = JSON.stringify(kpiChartCache[timeframe]) !== JSON.stringify(allData);
        kpiChartCache[timeframe] = allData;
        try { localStorage.setItem('speeksKpiChartCache', JSON.stringify(kpiChartCache)); } catch(e) {}
        
        if (isDataDifferent && currentTimeframe === timeframe) {
            const metric = document.getElementById('metricSelector').value;
            renderKpiChart(allData, metric);
        }
    } catch (e) { console.error(e); } 
    finally { const loader = document.getElementById('chartLoading'); if (loader) loader.style.display = 'none'; }
}

function cleanValue(val, isPct = false) {
    if (val === undefined || val === null || val === "") return null;
    let str = String(val).trim(); if (str === "" || str.includes('#')) return null;
    if (str.includes(':')) { let parts = str.split(':'); if (parts.length === 3) return parseInt(parts[0])*60 + parseInt(parts[1]) + (parseInt(parts[2])/60); else if (parts.length === 2) return parseInt(parts[0]) + (parseInt(parts[1])/60); }
    let num = parseFloat(str.replace(/[$,%]/g, '')); if (isNaN(num)) return null;
    return (isPct && num <= 1.1 && num > 0) ? num * 100 : num;
}

function renderKpiChart(allData, metric) {
    if(!document.getElementById('mainKpiChart')) return;
    
    // Safety check to prevent crashing if Chart.js is not loaded
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library is missing! Add it to metrics.html.");
        const loader = document.getElementById('chartLoading');
        if (loader) { loader.innerText = "Chart.js Library Missing!"; loader.style.display = 'flex'; }
        return;
    }

    const metricTitles = { 'conversion': 'Customer Conversion %', 'margin': 'Buying Margin %', 'nodeals': 'Total No Deals', 'time': 'Transaction Time' };
    const searchTarget = metricTitles[metric];
    let unit = (metric === 'time') ? 'm' : (metric === 'nodeals' ? '' : '%');
    let isPct = (metric === 'conversion' || metric === 'margin');
    let stores = [ { key: 'OVL', color: '#5a8d3b', label: 'OVL Average' }, { key: 'LEE', color: '#0ea5e9', label: 'LEE Average' }, { key: 'WSP', color: '#f97316', label: 'WSP Average' } ];

    let labels = [], finalDatasets = [], allNumericValues = [];
    allData.forEach((data, idx) => {
        let storeData = [], sr=-1, sc=-1;
        for(let i=0; i<data.length; i++) { for(let j=0; j<data[i].length; j++) { if(data[i][j] && String(data[i][j]).trim() === searchTarget) { sr=i; sc=j; break; } } if(sr!==-1) break; }
        if(sr === -1) return;
        let sCol = -1; for(let j=sc; j<data[sr+1].length; j++){ if(String(data[sr+1][j]).toLowerCase() === 'store'){ sCol=j; break; } }
        if(labels.length === 0) { for (let i = sr + 2; i < data.length; i++) { let lbl = String(data[i][sc - 1]).trim(); if (!lbl || lbl.includes('Store') || lbl.includes('%')) break; labels.push(lbl); } }
        for(let i=0; i<labels.length; i++){ let val = cleanValue(data[sr+2+i][sCol], isPct); storeData.push(val); if(val !== null) allNumericValues.push(val); }
        finalDatasets.push({ label: stores[idx].label, data: storeData, borderColor: stores[idx].color, backgroundColor: stores[idx].color, tension: 0.4, pointRadius: 5, spanGaps: true });
    });
    
    let yMin = 0, yMax = 100;
    if (allNumericValues.length > 0) {
        let mx = Math.max(...allNumericValues), mn = Math.min(...allNumericValues);
        if (isPct) { yMin = Math.max(0, Math.floor(mn/10)*10 - 10); yMax = Math.min(100, Math.ceil(mx/10)*10 + 10); } else { yMin = 0; yMax = Math.ceil(mx * 1.2); }
    }
    
    if (mainChartInstance) mainChartInstance.destroy();
    
    // Safety check for ChartDataLabels
    const pluginsArr = typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : [];
    
    mainChartInstance = new Chart(document.getElementById('mainKpiChart').getContext('2d'), { 
        type: 'line', plugins: pluginsArr, data: { labels: labels, datasets: finalDatasets }, 
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 400 }, 
            plugins: { legend: { position: 'top' }, datalabels: { align: 'top', anchor: 'end', formatter: v => v !== null ? (Math.round(v*10)/10 + unit) : '' } }, 
            scales: { y: { min: yMin, max: yMax, ticks: { callback: v => v + unit } }, x: { grid: { display: false } } } 
        } 
    });
}

function renderLiveData(data) {
    if (!data) return;
    ['ovl', 'lee', 'wsp'].forEach(id => {
        let pctNode = document.getElementById(`${id}-pct`);
        if(!pctNode) return;
        let p = Math.round(data[`${id}Pct`] || 0); 
        pctNode.innerText = p + '%';
        document.getElementById(`${id}-goal`).innerText = `Goal: $${Math.round(data[`${id}Goal`] || 0).toLocaleString()}`;
        document.getElementById(`${id}-t-gp`).innerText = `$${Math.round(data[`${id}TrackGP`] || 0).toLocaleString()}`;
        
        setTimeout(() => {
            let bar = document.getElementById(`${id}-bar`);
            if (bar) {
                bar.style.strokeDashoffset = 402 - (Math.min(p, 100)/100)*402;
                bar.style.stroke = p < 100 ? "var(--red-alert)" : "var(--sage-professional)";
            }
        }, 50);
    });

    if (document.getElementById('rev-list')) {
        const stores = [{n:'OVL', r:data.ovlRev, g:data.ovlGP}, {n:'LEE', r:data.leeRev, g:data.leeGP}, {n:'WSP', r:data.wspRev, g:data.wspGP}];
        document.getElementById('rev-list').innerHTML = [...stores].sort((a,b)=>b.r-a.r).map((s,i)=>`<div class="lb-row"><div class="lb-rank ${i===0?'lb-gold':''}">#${i+1}</div><div class="lb-name">${s.n}</div><div class="lb-val">$${Math.round(s.r).toLocaleString()}</div></div>`).join('');
        document.getElementById('gp-list').innerHTML = [...stores].sort((a,b)=>b.g-a.g).map((s,i)=>`<div class="lb-row"><div class="lb-rank ${i===0?'lb-gold':''}">#${i+1}</div><div class="lb-name">${s.n}</div><div class="lb-val">$${Math.round(s.g).toLocaleString()}</div></div>`).join('');
        
        const n = new Date(); 
        document.getElementById('lastSyncedText').innerText = `Last Synced: ${n.getHours()%12||12}:${String(n.getMinutes()).padStart(2,'0')} ${n.getHours()>=12?'PM':'AM'}`;
    }
}

async function fetchRecordsData() {
    try {
        const response = await fetch(`${RECORDS_URL}?v=${Date.now()}`);
        recordsCache = await response.json();
        localStorage.setItem('speeksRecordsCache', JSON.stringify(recordsCache));
        if (document.getElementById('pane-records')?.classList.contains('active')) renderRecords();
    } catch (e) {}
}

function renderRecords() {
    const container = document.getElementById('recordsContainer');
    if(!container) return;
    if (!recordsCache || recordsCache.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #888; font-weight: 600;">Syncing Live Records...</div>';
        return;
    }

    const metricsMap = {};
    recordsCache.forEach(rec => {
        let label = String(rec.label).trim(), section = String(rec.section).toUpperCase().trim();
        if (!metricsMap[label]) metricsMap[label] = { company: null, stores: [] };
        if (section === 'COMPANY' || section === 'COMPANY WIDE') metricsMap[label].company = rec;
        else metricsMap[label].stores.push(rec);
    });

    let html = '<div class="records-masonry-grid">';
    let boardCounter = 0; 
    for (let label in metricsMap) {
        let data = metricsMap[label]; boardCounter++; let overflowId = 'overflow-board-' + boardCounter;
        data.stores.sort((a, b) => (parseFloat(String(b.value).replace(/[^0-9.-]/g, '')) || 0) - (parseFloat(String(a.value).replace(/[^0-9.-]/g, '')) || 0));
        let compRec = data.company; if (!compRec && data.stores.length > 0) compRec = data.stores[0];

        html += `<div class="record-metric-card"><div class="rmc-header">${label}</div>`;
        if (compRec) html += `<div class="rmc-champion"><div class="rmc-crown">👑 Company Record</div><div class="rmc-champ-val">${compRec.value || '-'}</div><div class="rmc-champ-sub">${compRec.subtext || ''}</div></div>`;
        
        if (data.stores.length > 0) {
            html += `<div class="rmc-list">`;
            data.stores.slice(0, 3).forEach((s, idx) => { html += `<div class="rmc-list-item"><div class="rmc-rank">${idx===0?'🥇':(idx===1?'🥈':'🥉')}</div><div class="rmc-store">${s.section}</div><div class="rmc-score"><span class="rmc-score-val">${s.value || '-'}</span><span class="rmc-score-date">${s.subtext || ''}</span></div></div>`; });
            if (data.stores.length > 3) {
                html += `<div id="${overflowId}" class="hidden-board">`;
                data.stores.slice(3).forEach((s, idx) => { html += `<div class="rmc-list-item"><div class="rmc-rank" style="font-size:11px; color:#999;">#${idx+4}</div><div class="rmc-store">${s.section}</div><div class="rmc-score"><span class="rmc-score-val">${s.value || '-'}</span><span class="rmc-score-date">${s.subtext || ''}</span></div></div>`; });
                html += `</div><button class="rmc-expand-btn" onclick="toggleBoard('${overflowId}', this)">See Full Leaderboard ▾</button>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
    }
    container.innerHTML = html + '</div>';
}

function toggleBoard(id, btn) {
    const el = document.getElementById(id);
    if (el.classList.contains('open')) { el.classList.remove('open'); btn.innerText = 'See Full Leaderboard ▾'; } 
    else { el.classList.add('open'); btn.innerText = 'Hide Leaderboard ▴'; }
}

function syncAllData() { 
    if (kpiChartCache[currentTimeframe]) renderKpiChart(kpiChartCache[currentTimeframe], document.getElementById('metricSelector')?.value);
    if (hubDataCache) renderLiveData(hubDataCache);
    fetchChartData(currentTimeframe); 
    fetchHubData(); 
    loadCMS(); 
    fetchRecordsData(); 
}

// --- 8. INITIALIZATION ROUTER ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Remove Animation Preload Locks FIRST so the screen never stays white if an error occurs
    setTimeout(() => {
        document.body.classList.remove('preload');
    }, 50);

    // 2. Sidebar Snapping
    if (localStorage.getItem('speeksSidebar') === 'collapsed') {
        document.querySelector('.sidebar')?.classList.add('collapsed');
        document.querySelector('.main-content')?.classList.add('expanded');
        document.querySelector('.sidebar-toggle')?.classList.add('collapsed');
    }

    // 3. Global Elements Check
    loadCMS();

    // 4. Conditional Page Routing
    if (document.getElementById('kbBody')) {
        // Hub Page
        loadHotkeys();
    }
    
    if (document.getElementById('content-container') && document.getElementById('docSearch')) {
        // Policies Page
        loadDocs();
        document.getElementById('docSearch').addEventListener('keyup', filterDocs);
    }
    
    if (document.getElementById('authOverlay')) {
        // Manager Portal Page
        if (sessionStorage.getItem('speeksManagerUnlocked') === 'true') {
            document.getElementById('authOverlay').style.display = 'none';
            document.body.style.overflow = 'auto';
            initDashboardData();
        } else {
            document.getElementById('authOverlay').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            document.getElementById('pinInput')?.focus();
        }
        startAuthFetch();
        
        // Listeners for Manager Page Selectors
        document.getElementById('kpiStoreSelect')?.addEventListener('change', () => fetchKPIData(false));
        document.getElementById('weeklyKpiStoreSelect')?.addEventListener('change', () => fetchWeeklyKPIs());
        document.getElementById('vw-primary')?.addEventListener('change', () => renderVariance());
        document.getElementById('vw-compare')?.addEventListener('change', () => renderVariance());
    }
    
    if (document.getElementById('mainKpiChart')) {
        // Metrics Page
        syncAllData();
    }
});