/* ═══════════════════════════════════════════════════
   AniPub API Docs — app.js v3
   IDs match exactly what's in index.html
   ═══════════════════════════════════════════════════ */

const html = document.documentElement;

/* ── THEME ── */
const themeBtn = document.getElementById('themeBtn');
function setTheme(t) {
  html.setAttribute('data-theme', t);
  localStorage.setItem('anipub-theme', t);
}
if (themeBtn) {
  themeBtn.addEventListener('click', () =>
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')
  );
}
const savedTheme = localStorage.getItem('anipub-theme');
if (savedTheme) setTheme(savedTheme);

/* ── MOBILE NAV — uses exact IDs from index.html ── */
const mobBtn   = document.getElementById('mobMenuBtn');
const sidebar  = document.getElementById('sidebar');
const backdrop = document.getElementById('navBackdrop');

function openNav()  {
  sidebar?.classList.add('open');
  backdrop?.classList.add('open');
  mobBtn?.classList.add('open');
}
function closeNav() {
  sidebar?.classList.remove('open');
  backdrop?.classList.remove('open');
  mobBtn?.classList.remove('open');
}

mobBtn?.addEventListener('click', () =>
  sidebar?.classList.contains('open') ? closeNav() : openNav()
);
backdrop?.addEventListener('click', closeNav);
document.querySelectorAll('.sb-link').forEach(l =>
  l.addEventListener('click', () => { if (window.innerWidth <= 1024) closeNav(); })
);

/* ── SCROLL SPY ── */
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.sb-link[data-s]').forEach(l => l.classList.remove('active'));
      document.querySelector(`.sb-link[data-s="${e.target.id}"]`)?.classList.add('active');
    }
  });
}, { rootMargin: '-18% 0px -68% 0px' });
document.querySelectorAll('[id]').forEach(s => spy.observe(s));

/* ── CODE TABS ── */
document.querySelectorAll('.code-block').forEach(block => {
  block.querySelectorAll('.ctab').forEach(tab => {
    tab.addEventListener('click', () => {
      block.querySelectorAll('.ctab').forEach(t => t.classList.remove('active'));
      block.querySelectorAll('.code-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target)?.classList.add('active');
    });
  });
});

/* ── COPY CODE BUTTONS ── */
document.addEventListener('click', e => {
  if (!e.target.classList.contains('cb-copy')) return;
  const pre = e.target.closest('.code-pane')?.querySelector('pre');
  if (!pre) return;
  navigator.clipboard.writeText(pre.innerText).then(() => {
    const orig = e.target.textContent;
    e.target.textContent = '✓ Copied';
    e.target.style.cssText = 'background:var(--grn);color:#fff;border-color:var(--grn)';
    setTimeout(() => { e.target.textContent = orig; e.target.style.cssText = '' }, 1800);
  });
});

/* ── COPY TEXT (inline) ── */
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const o = btn.innerHTML;
    btn.innerHTML = '✓';
    setTimeout(() => btn.innerHTML = o, 1600);
  });
}

/* ── TRY PANELS ── */
function toggleTry(id) {
  document.getElementById(id)?.classList.toggle('open');
}

/* ── HELPERS ── */
function fixImg(p) {
  if (!p) return '';
  return (p.startsWith('https://') || p.startsWith('http://')) ? p : `https://anipub.xyz/${p}`;
}

function syntaxHL(json) {
  return json
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, m => {
      let c = 'json-num';
      if (/^"/.test(m)) c = /:$/.test(m) ? 'json-key' : 'json-str';
      else if (/true|false/.test(m)) c = 'json-bool';
      else if (/null/.test(m))       c = 'json-null';
      return `<span class="${c}">${m}</span>`;
    });
}

function showLoading(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="tp-loading"><div class="spin"></div>Sending request…</div>`;
}

function showResult(id, data, status, ms) {
  const el = document.getElementById(id);
  if (!el) return;
  const cls = status < 300 ? 'ok' : status < 500 ? 'warn' : 'err';
  el.innerHTML =
    `<div class="tp-res-bar">
       <span class="stag ${cls}">${status}</span>
       <span style="font-size:.68rem;color:#2e4460;font-family:'JetBrains Mono',monospace">application/json</span>
       <span class="tp-time">${ms}ms</span>
     </div>
     <div class="tp-res-body">${syntaxHL(JSON.stringify(data,null,2))}</div>`;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.innerHTML =
    `<div class="tp-res-bar"><span class="stag err">Error</span></div>
     <div class="tp-res-body" style="color:var(--red)">${msg}</div>`;
}

function renderPager(id, page, hasMore, fn) {
  const el = document.getElementById(id);
  if (!el) return;
  const pages = [];
  if (page > 1) pages.push(page - 1);
  pages.push(page);
  if (hasMore) pages.push(page + 1);
  el.innerHTML = pages.map(p =>
    `<button class="pg-btn${p===page?' active':''}" onclick="${fn}(${p})">${p}</button>`
  ).join('');
}

function renderGcCards(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!items?.length) { el.innerHTML = `<div style="color:var(--txt3);font-size:.83rem;padding:10px 0">No results.</div>`; return; }
  el.innerHTML = `<div class="gc-grid">${items.map(a => {
    const img  = fixImg(a.ImagePath || a.Image || '');
    const desc = (a.DescripTion || a.Description || '').substring(0,130);
    return `<div class="gc">
      <div class="gc-img">${img?`<img src="${img}" alt="" loading="lazy" onerror="this.style.display='none'">`:''}</div>
      <div class="gc-body">
        <div class="gc-name">${a.Name||'—'}</div>
        <div class="gc-score">⭐ ${a.MALScore||'N/A'}</div>
        <div class="gc-desc">${desc}${desc.length>=130?'…':''}</div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

/* ── LOAD TOTAL COUNT ── */
async function loadCount() {
  try {
    const n = await (await fetch('https://www.anipub.xyz/api/getAll')).json();
    ['heroCount','sbCount'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = (+n).toLocaleString();
    });
  } catch(_) {}
}
loadCount();

/* ── URL PREVIEW UPDATERS ── */
function prevInfo() {
  const v = document.getElementById('info-inp')?.value.trim();
  const e = document.getElementById('info-prev');
  if (e) e.textContent = `GET https://www.anipub.xyz/api/info/${v||'…'}`;
}
function prevFind() {
  const v = document.getElementById('find-inp')?.value.trim();
  const e = document.getElementById('find-prev');
  if (e) e.textContent = `GET https://www.anipub.xyz/api/find/${encodeURIComponent(v||'')||'…'}`;
}
function prevGenre() {
  const g = document.getElementById('genre-inp')?.value.trim();
  const p = document.getElementById('genre-page')?.value || 1;
  const e = document.getElementById('genre-prev');
  if (e) e.textContent = `GET https://www.anipub.xyz/api/findbyGenre/${g||'…'}?Page=${p}`;
}
function prevRating() {
  const p = document.getElementById('rating-page')?.value || 1;
  const e = document.getElementById('rating-prev');
  if (e) e.textContent = `GET https://www.anipub.xyz/api/findbyrating?page=${p}`;
}
function prevSearch() {
  const v = document.getElementById('search-inp')?.value.trim();
  const e = document.getElementById('search-prev');
  if (e) e.textContent = `GET https://www.anipub.xyz/api/search/${encodeURIComponent(v||'')||'…'}`;
}
function prevSearchAll() {
  const v = document.getElementById('sall-inp')?.value.trim();
  const p = document.getElementById('sall-page')?.value || 1;
  const e = document.getElementById('sall-prev');
  if (e) e.textContent = `GET https://www.anipub.xyz/api/searchall/${encodeURIComponent(v||'')||'…'}?page=${p}`;
}

/* ═══ TRY-IT HANDLERS ═══ */

/* /api/info/:id */
async function runInfo() {
  const val = document.getElementById('info-inp')?.value.trim();
  if (!val) return;
  showLoading('info-res');
  document.getElementById('info-vis').innerHTML = '';
  const t0 = Date.now();
  try {
    const res  = await fetch(`https://www.anipub.xyz/api/info/${encodeURIComponent(val)}`);
    const data = await res.json();
    showResult('info-res', data, res.status, Date.now()-t0);
    if (res.ok) {
      const img    = fixImg(data.ImagePath || data.Cover || '');
      const genres = (data.Genres||[]).slice(0,4).map(g=>`<span class="ac-tag">${g}</span>`).join('');
      document.getElementById('info-vis').innerHTML = `
        <div class="anime-card">
          <div class="ac-img">${img?`<img src="${img}" alt="" loading="lazy" onerror="this.style.display='none'">`:''}</div>
          <div class="ac-body">
            <div class="ac-title">${data.Name||'—'}</div>
            <div class="ac-score">⭐ ${data.MALScore||'N/A'}</div>
            <div class="ac-tags">${genres}</div>
            <div class="ac-desc">${data.DescripTion||data.Description||''}</div>
          </div>
        </div>`;
    }
  } catch(e) { showError('info-res', e.message) }
}

/* /api/getAll */
async function runGetAll() {
  showLoading('ga-res');
  const t0 = Date.now();
  try {
    const res  = await fetch('https://www.anipub.xyz/api/getAll');
    const data = await res.json();
    showResult('ga-res', data, res.status, Date.now()-t0);
  } catch(e) { showError('ga-res', e.message) }
}

/* /api/find/:name */
async function runFind() {
  const name = document.getElementById('find-inp')?.value.trim();
  if (!name) return;
  showLoading('find-res');
  document.getElementById('find-vis').innerHTML = '';
  const t0 = Date.now();
  try {
    const res  = await fetch(`https://www.anipub.xyz/api/find/${encodeURIComponent(name)}`);
    const data = await res.json();
    showResult('find-res', data, res.status, Date.now()-t0);
    const vis = document.getElementById('find-vis');
    if (data.exist) {
      vis.innerHTML = `<div class="find-card"><div class="find-ico ok">✅</div><div>
        <div class="find-name">${name} — found!</div>
        <div class="find-meta"><span>ID: <code>${data.id}</code></span><span>Episodes: <code>${data.ep}</code></span></div>
      </div></div>`;
    } else {
      vis.innerHTML = `<div class="find-card"><div class="find-ico no">❌</div><div>
        <div class="find-name">${name}</div>
        <div style="font-size:.8rem;color:var(--red)">Not found in database</div>
      </div></div>`;
    }
  } catch(e) { showError('find-res', e.message) }
}

/* /v1/api/details/:id
   IMPORTANT: local.link = EP 1 (top-level, NOT in ep[])
              local.ep[] starts at EP 2, EP 3, EP 4... */
async function runStream() {
  const id = document.getElementById('stream-inp')?.value;
  if (!id) return;
  showLoading('stream-res');
  document.getElementById('stream-vis').innerHTML = '';
  const t0 = Date.now();
  try {
    const res  = await fetch(`https://www.anipub.xyz/v1/api/details/${id}`);
    const data = await res.json();
    showResult('stream-res', data, res.status, Date.now()-t0);
    if (res.ok && data.local) {
      const strip = s => (s||'').replace(/^src=/, '');
      // Build full episode list: EP1 = local.link, EP2+ = local.ep[]
      const allEps = [];
      if (data.local.link) {
        allEps.push({ num: 1, src: strip(data.local.link) });
      }
      (data.local.ep || []).forEach((e, i) => {
        allEps.push({ num: i + 2, src: strip(e.link) });
      });

      const visible = allEps.slice(0, 10);
      const items = visible.map(({ num, src }) => `
        <div class="ep-item">
          <div class="ep-num">${num}</div>
          <div class="ep-src">${src}</div>
          <button class="ep-cp" onclick="copyText('${src.replace(/'/g,"\\'")}',this)">Copy</button>
        </div>`).join('');

      document.getElementById('stream-vis').innerHTML =
        `<div style="font-size:.68rem;color:var(--txt3);margin-bottom:6px;font-family:'JetBrains Mono',monospace">
           EP 1 = <code style="color:var(--amb)">local.link</code> &nbsp;·&nbsp;
           EP 2+ = <code style="color:var(--amb)">local.ep[]</code>
         </div>
         <div class="ep-list">${items}</div>` +
        (allEps.length > 10 ? `<div style="font-size:.72rem;color:var(--txt3);padding:5px 0">…+${allEps.length - 10} more episodes</div>` : '');
    }
  } catch(e) { showError('stream-res', e.message) }
}

/* /anime/api/details/:id */
async function runAdet() {
  const id = document.getElementById('adet-inp')?.value;
  if (!id) return;
  showLoading('adet-res');
  document.getElementById('adet-vis').innerHTML = '';
  const t0 = Date.now();
  try {
    const res  = await fetch(`https://www.anipub.xyz/anime/api/details/${id}`);
    const data = await res.json();
    showResult('adet-res', data, res.status, Date.now()-t0);
    if (res.ok) {
      const vis = document.getElementById('adet-vis');
      if (data.local) {
        const img    = fixImg(data.local.ImagePath || data.local.Cover || '');
        const genres = (data.local.Genres||[]).slice(0,4).map(g=>`<span class="ac-tag">${g}</span>`).join('');
        vis.innerHTML = `<div class="anime-card">
          <div class="ac-img">${img?`<img src="${img}" alt="" loading="lazy" onerror="this.style.display='none'">`:''}</div>
          <div class="ac-body">
            <div class="ac-title">${data.local.Name||'—'}</div>
            <div class="ac-score">⭐ ${data.local.MALScore||'N/A'}</div>
            <div class="ac-tags">${genres}</div>
            <div class="ac-desc">${data.local.DescripTion||''}</div>
          </div>
        </div>`;
      }
      if (data.characters?.length) {
        const cards = data.characters.slice(0,8).map(c => {
          const img = c.character?.images?.jpg?.image_url || '';
          return `<div class="va-card">
            ${img?`<img class="va-img" src="${img}" alt="" loading="lazy" onerror="this.style.display='none'">`:'' }
            <div class="va-body">
              <div class="va-name">${c.character?.name||'—'}</div>
              <div class="va-role">${c.role||''}</div>
              ${c.voice_actors?.[0]?`<div class="va-lang">${c.voice_actors[0].language}</div>`:''}
            </div>
          </div>`;
        }).join('');
        vis.innerHTML += `<div style="margin-top:10px">
          <div style="font-size:.62rem;color:var(--txt3);text-transform:uppercase;letter-spacing:1px;margin-bottom:7px">Characters</div>
          <div class="va-grid">${cards}</div>
        </div>`;
      }
    }
  } catch(e) { showError('adet-res', e.message) }
}

/* /api/findbyGenre */
let _genreQ = 'harem', _genrePg = 1;
async function runGenre() {
  const g = document.getElementById('genre-inp')?.value.trim();
  const p = parseInt(document.getElementById('genre-page')?.value) || 1;
  if (!g) return;
  _genreQ = g; _genrePg = p;
  showLoading('genre-res');
  document.getElementById('genre-vis').innerHTML = '';
  document.getElementById('genre-pager').innerHTML = '';
  const t0 = Date.now();
  try {
    const res  = await fetch(`https://www.anipub.xyz/api/findbyGenre/${g}?Page=${p}`);
    const data = await res.json();
    showResult('genre-res', data, res.status, Date.now()-t0);
    if (res.ok) {
      renderGcCards('genre-vis', data.wholePage);
      renderPager('genre-pager', p, (data.wholePage?.length||0) >= 10, 'goGenrePg');
    }
  } catch(e) { showError('genre-res', e.message) }
}
function goGenrePg(p) {
  const inp = document.getElementById('genre-page');
  if (inp) inp.value = p;
  prevGenre(); runGenre();
}

/* /api/check */
async function runCheck() {
  const name = document.getElementById('ck-name')?.value.trim();
  const gRaw = document.getElementById('ck-genre')?.value.trim();
  if (!name) return;
  const genre = gRaw.includes(',') ? gRaw.split(',').map(s=>s.trim()) : gRaw;
  showLoading('check-res');
  document.getElementById('check-vis').innerHTML = '';
  const t0 = Date.now();
  try {
    const res  = await fetch('https://anipub.xyz/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name: name, Genre: genre })
    });
    const data = await res.json();
    showResult('check-res', data, res.status, Date.now()-t0);
    const matched = data?.match || data?.found || data?.exist || (data && Object.keys(data).length > 0 && !data.error);
    document.getElementById('check-vis').innerHTML = `
      <div class="check-card">
        <div class="check-ico ${matched?'ok':'no'}">${matched?'✅':'❌'}</div>
        <div>
          <div style="font-weight:700;font-size:.88rem">${name}</div>
          <div style="font-size:.78rem;color:${matched?'var(--grn)':'var(--red)'}">${matched?'Match found':'No match found'}</div>
        </div>
      </div>`;
  } catch(e) { showError('check-res', e.message) }
}

/* /api/findbyrating */
let _ratingPg = 1;
async function runRating() {
  const p = parseInt(document.getElementById('rating-page')?.value) || 1;
  _ratingPg = p;
  showLoading('rating-res');
  document.getElementById('rating-vis').innerHTML = '';
  document.getElementById('rating-pager').innerHTML = '';
  const t0 = Date.now();
  try {
    const res  = await fetch(`https://www.anipub.xyz/api/findbyrating?page=${p}`);
    const data = await res.json();
    showResult('rating-res', data, res.status, Date.now()-t0);
    if (res.ok) {
      renderGcCards('rating-vis', data.AniData);
      renderPager('rating-pager', p, (data.AniData?.length||0) >= 10, 'goRatingPg');
    }
  } catch(e) { showError('rating-res', e.message) }
}
function goRatingPg(p) {
  const inp = document.getElementById('rating-page');
  if (inp) inp.value = p;
  prevRating(); runRating();
}

/* /api/search/:name  — flat array: [{Name, Id, Image, finder}] */
async function runSearch() {
  const q = document.getElementById('search-inp')?.value.trim();
  if (!q) return;
  showLoading('search-res');
  document.getElementById('search-vis').innerHTML = '';
  const t0 = Date.now();
  try {
    const res  = await fetch(`https://www.anipub.xyz/api/search/${encodeURIComponent(q)}`);
    const data = await res.json();
    showResult('search-res', data, res.status, Date.now()-t0);
    if (res.ok && Array.isArray(data)) {
      const items = data.slice(0,12);
      document.getElementById('search-vis').innerHTML = `
        <div class="search-grid">
          ${items.map(r => {
            const img = fixImg(r.Image || r.ImagePath || '');
            return `<div class="sr-item">
              ${img
                ? `<img class="sr-img" src="${img}" alt="" loading="lazy" onerror="this.style.display='none'">`
                : `<div class="sr-img" style="display:flex;align-items:center;justify-content:center;color:var(--txt3);font-size:.62rem;font-family:'JetBrains Mono',monospace">#${r.Id}</div>`}
              <div class="sr-body">
                <div class="sr-name">${r.Name||'—'}</div>
                <div class="sr-id">ID: ${r.Id} · ${r.finder}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
        ${data.length > 12 ? `<div style="font-size:.72rem;color:var(--txt3);padding:6px 0">…+${data.length-12} more results</div>` : ''}`;
    }
  } catch(e) { showError('search-res', e.message) }
}

/* /api/searchall/:name — {currentPage, AniData:[...]} */
let _sallQ = 'One Piece', _sallPg = 1;
async function runSearchAll() {
  const q = document.getElementById('sall-inp')?.value.trim();
  const p = parseInt(document.getElementById('sall-page')?.value) || 1;
  if (!q) return;
  _sallQ = q; _sallPg = p;
  showLoading('sall-res');
  document.getElementById('sall-vis').innerHTML = '';
  document.getElementById('sall-pager').innerHTML = '';
  const t0 = Date.now();
  try {
    const res  = await fetch(`https://www.anipub.xyz/api/searchall/${encodeURIComponent(q)}?page=${p}`);
    const data = await res.json();
    showResult('sall-res', data, res.status, Date.now()-t0);
    if (res.ok) {
      renderGcCards('sall-vis', data.AniData);
      renderPager('sall-pager', p, (data.AniData?.length||0) >= 10, 'goSallPg');
    }
  } catch(e) { showError('sall-res', e.message) }
}
function goSallPg(p) {
  const pg = document.getElementById('sall-page');
  if (pg) pg.value = p;
  prevSearchAll(); runSearchAll();
}

/* ── PLAYGROUND ── */
function togglePgBody() {
  const m  = document.getElementById('pg-method')?.value;
  const el = document.getElementById('pg-body-row');
  if (el) el.style.display = m === 'POST' ? 'block' : 'none';
}
async function runPlayground() {
  const method = document.getElementById('pg-method')?.value;
  const url    = document.getElementById('pg-url')?.value.trim();
  if (!url) return;
  const el = document.getElementById('pg-res');
  el.innerHTML = `<div class="tp-loading"><div class="spin"></div>Running…</div>`;
  const t0 = Date.now();
  try {
    const opts = { method };
    if (method === 'POST') {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = document.getElementById('pg-body')?.value;
    }
    const res  = await fetch(url, opts);
    const data = await res.json();
    const ms   = Date.now() - t0;
    const cls  = res.status < 300 ? 'ok' : res.status < 500 ? 'warn' : 'err';
    el.innerHTML = `
      <div class="tp-res-bar">
        <span class="stag ${cls}">${res.status} ${res.statusText}</span>
        <span class="tp-time">${ms}ms</span>
      </div>
      <div class="tp-res-body">${syntaxHL(JSON.stringify(data,null,2))}</div>`;
  } catch(e) {
    el.innerHTML = `<div class="tp-res-bar"><span class="stag err">Error</span></div><div class="tp-res-body" style="color:var(--red)">${e.message}</div>`;
  }
}

/* ── GENRE BROWSER ── */
let _bGenre = '', _bPage = 1;
async function quickGenre(genre, btn) {
  document.querySelectorAll('.gchip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  _bGenre = genre; _bPage = 1;
  await loadBrowser(genre, 1);
}
async function loadBrowser(genre, page) {
  const idle  = document.getElementById('browser-idle');
  const hdr   = document.getElementById('browser-hdr');
  const grid  = document.getElementById('browser-grid');
  const title = document.getElementById('browser-title');
  const pager = document.getElementById('browser-pager');

  if (idle) idle.style.display = 'none';
  if (hdr)  hdr.style.display  = 'none';
  if (grid) grid.innerHTML = `<div style="grid-column:1/-1"><div class="tp-loading"><div class="spin"></div>Loading ${genre}…</div></div>`;

  try {
    const res   = await fetch(`https://www.anipub.xyz/api/findbyGenre/${genre}?Page=${page}`);
    const data  = await res.json();
    const items = data.wholePage || [];

    if (title) title.textContent = `${genre.charAt(0).toUpperCase()+genre.slice(1)} — ${items.length} result${items.length!==1?'s':''}`;
    if (hdr) hdr.style.display = 'flex';

    if (grid) {
      grid.className = 'gc-grid';
      grid.innerHTML = items.map(a => {
        const img  = fixImg(a.ImagePath || '');
        const desc = (a.DescripTion || a.Description || '').substring(0,130);
        return `<div class="gc">
          <div class="gc-img">${img?`<img src="${img}" alt="" loading="lazy" onerror="this.style.display='none'">`:''}</div>
          <div class="gc-body">
            <div class="gc-name">${a.Name||'—'}</div>
            <div class="gc-score">⭐ ${a.MALScore||'N/A'}</div>
            <div class="gc-desc">${desc}${desc.length>=130?'…':''}</div>
          </div>
        </div>`;
      }).join('') || `<div style="color:var(--txt3);font-size:.83rem;padding:20px 0;grid-column:1/-1">No results for "${genre}".</div>`;
    }

    if (pager) renderPager('browser-pager', page, items.length >= 10, 'goBrowserPg');
  } catch(e) {
    if (grid) grid.innerHTML = `<div style="color:var(--red);padding:20px 0;grid-column:1/-1">${e.message}</div>`;
    if (idle) idle.style.display = 'block';
  }
}
function goBrowserPg(p) { _bPage = p; loadBrowser(_bGenre, p); }