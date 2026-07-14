let currentTab = 'pin';

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-pin').classList.toggle('active', tab === 'pin');
  document.getElementById('tab-name').classList.toggle('active', tab === 'name');
  document.getElementById('search-pin').style.display  = tab === 'pin'  ? 'block' : 'none';
  document.getElementById('search-name').style.display = tab === 'name' ? 'block' : 'none';
  document.getElementById('pinResults').style.display  = 'none';
  document.getElementById('nameResults').style.display = 'none';
  if (tab === 'name') {
    document.getElementById('nameInput').focus();
    // Re-run if already has text
    if (document.getElementById('nameInput').value.trim()) searchByName();
  } else {
    document.getElementById('pinInput').focus();
  }
}

// ── Pincode search ────────────────────────────────────────────────────
document.getElementById('pinInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') searchByPin();
});

function searchByPin() {
  const pin = document.getElementById('pinInput').value.trim();
  if (pin.length !== 6 || !/^\d+$/.test(pin)) {
    showToast('Please enter a valid 6-digit pincode'); return;
  }
  const entries = MAPPING[pin] || [];
  const tbody   = document.getElementById('pinTableBody');
  const count   = document.getElementById('pinCount');
  document.getElementById('pinResults').style.display  = 'block';
  document.getElementById('nameResults').style.display = 'none';

  count.textContent = `${entries.length} result${entries.length !== 1 ? 's' : ''}`;

  if (!entries.length) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="no-results">
      <div class="icon">🔍</div>No service centres found for <strong>${pin}</strong>.
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = entries.map(e => {
    const c = CENTRES[e.centre_id];
    if (!c) return '';
    const sc  = (e.claimer_id||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const smc = (e.model_category||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `<tr>
      <td class="pin">${pin}</td>
      <td class="centre"><a onclick="showDetail('${e.centre_id}','${sc}','${smc}')">${c.name}</a></td>
      <td>${e.model_category ? `<span class="tag tag-model">${e.model_category}</span>` : '—'}</td>
      <td>${e.claimer_id    ? `<span class="tag tag-geo">${e.claimer_id}</span>`    : '—'}</td>
    </tr>`;
  }).join('');
}

// ── Name search → cards ───────────────────────────────────────────────
function searchByName() {
  const q = document.getElementById('nameInput').value.trim().toLowerCase();
  const grid  = document.getElementById('cardsGrid');
  const count = document.getElementById('nameCount');
  document.getElementById('pinResults').style.display  = 'none';
  document.getElementById('nameResults').style.display = 'block';

  if (!q) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1">
      <div class="icon">🔍</div>Start typing to search centres…</div>`;
    count.textContent = '';
    return;
  }

  const matched = Object.entries(CENTRES).filter(([id, c]) =>
    c.name.toLowerCase().includes(q) ||
    c.city.toLowerCase().includes(q) ||
    c.state.toLowerCase().includes(q)
  );

  count.textContent = `${matched.length} centre${matched.length !== 1 ? 's' : ''}`;

  if (!matched.length) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1">
      <div class="icon">🔍</div>No centres match "<strong>${document.getElementById('nameInput').value.trim()}</strong>".</div>`;
    return;
  }

  grid.innerHTML = matched.map(([id, c]) => {
    const initials = c.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
    return `<div class="centre-card" onclick="showDetail('${id}','','')">
      <div class="cc-avatar">${initials}</div>
      <div class="cc-name">${c.name}</div>
      <div class="cc-loc">📍 ${c.city}, ${c.state}</div>
      <div class="cc-meta">
        ${c.contact ? `<div class="cc-row">📞 <span>${c.contact}</span></div>` : ''}
        ${c.email   ? `<div class="cc-row">✉️ <span>${c.email}</span></div>`   : ''}
      </div>
    </div>`;
  }).join('');
}

// ── Detail Modal ──────────────────────────────────────────────────────
function showDetail(id, claimerId, modelCategory) {
  const c = CENTRES[id];
  if (!c) return;
  const initials = c.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  document.getElementById('mAvatar').textContent = initials;
  document.getElementById('mName').textContent   = c.name;
  document.getElementById('mSub').textContent    = `${c.city}, ${c.state}`;

  document.getElementById('mBody').innerHTML = `
    ${(claimerId || modelCategory) ? `
    <div class="scenario-strip">
      ${claimerId    ? `<div class="s-card"><div class="key">Geography</div><div class="val">${claimerId}</div></div>` : ''}
      ${modelCategory ? `<div class="s-card"><div class="key">Model Category</div><div class="val">${modelCategory}</div></div>` : ''}
    </div>` : ''}
    <div class="m-section">
      <div class="m-label">Contact Information</div>
      <div class="m-grid">
        <div class="m-item">
          <div class="key">Contact Person</div>
          <div class="val">${c.contact_person || '—'}</div>
        </div>
        <div class="m-item">
          <div class="key">Phone</div>
          <div class="val">${c.contact ? `<a href="tel:${c.contact}">${c.contact}</a>` : '—'}</div>
        </div>
        <div class="m-item full">
          <div class="key">Email</div>
          <div class="val">${c.email ? `<a href="mailto:${c.email}">${c.email}</a>` : '—'}</div>
        </div>
        <div class="m-item full">
          <div class="key">Address</div>
          <div class="val">${c.address || '—'}</div>
        </div>
        <div class="m-item">
          <div class="key">City</div>
          <div class="val">${c.city || '—'}</div>
        </div>
        <div class="m-item">
          <div class="key">State</div>
          <div class="val">${c.state || '—'}</div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}
