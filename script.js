const RAW = [
  ['Auburn', '68305', 'Nemaha', 'bpw', 40.39262, -95.83905],
  ['Nebraska City', '68410', 'Otoe', 'ars', 40.67653, -95.85869],
  ['Brownville', '68321', 'Nemaha', 'ars', 40.39778, -95.65805],
  ['Dunbar', '68346', 'Otoe', 'ars', 40.66806, -96.03001],
  ['Howe', '68305', 'Nemaha', 'ars', 40.32195, -95.81916],
  ['Lorton', '68382', 'Otoe', 'ars', 40.59807, -96.02423],
  ['Union', '68455', 'Cass', 'ars', 40.81334, -95.92278],
  ['Brock', '68320', 'Nemaha', 'city', 40.47937, -95.95989],
  ['Johnson', '68378', 'Nemaha', 'city', 40.41091, -95.9982],
  ['Julian', '68379', 'Nemaha', 'city', 40.52144, -95.86736],
  ['Peru', '68421', 'Nemaha', 'city', 40.48145, -95.73079],
  ['Stella', '68442', 'Richardson', 'city', 40.23306, -95.77333],
  ['Talmage', '68448', 'Otoe', 'city', 40.53056, -96.02167],
  ['Alvo', '68304', 'Cass', 'county'],
  ['Avoca', '68307', 'Cass', 'county'],
  ['Cedar Creek', '68016', 'Cass', 'county'],
  ['Eagle', '68347', 'Cass', 'county'],
  ['Elmwood', '68349', 'Cass', 'county'],
  ['Greenwood', '68366', 'Cass', 'county'],
  ['Louisville', '68037', 'Cass', 'county'],
  ['Manley', '68403', 'Cass', 'county'],
  ['Murdock', '68407', 'Cass', 'county'],
  ['Murray', '68409', 'Cass', 'county'],
  ['Nehawka', '68413', 'Cass', 'county'],
  ['Plattsmouth', '68048', 'Cass', 'county'],
  ['South Bend', '68058', 'Cass', 'county'],
  ['Weeping Water', '68463', 'Cass', 'county'],
  ['Nemaha', '68414', 'Nemaha', 'county'],
  ['Burr', '68324', 'Otoe', 'county'],
  ['Douglas', '68344', 'Otoe', 'county'],
  ['Otoe', '68417', 'Otoe', 'county'],
  ['Palmyra', '68418', 'Otoe', 'county'],
  ['Syracuse', '68446', 'Otoe', 'county'],
  ['Unadilla', '68454', 'Otoe', 'county'],
  ['Dawson', '68337', 'Richardson', 'county'],
  ['Falls City', '68355', 'Richardson', 'county'],
  ['Humboldt', '68376', 'Richardson', 'county'],
  ['Rulo', '68431', 'Richardson', 'county'],
  ['Salem', '68433', 'Richardson', 'county'],
  ['Shubert', '68437', 'Richardson', 'county'],
  ['Verdon', '68457', 'Richardson', 'county']
];

const GROUP = {
  ars: {c: '#1d7a46', l: 'We serve this town directly'},
  city: {c: '#e3a72f', l: 'Service is set up through City Hall'},
  bpw: {c: '#1f5f8b', l: 'In-town homes: Auburn Board of Public Works'}
};
const COUNTIES = new Set(['Cass', 'Nemaha', 'Otoe', 'Richardson']);
const PLACES = {};
const ZIP = {};
RAW.forEach(([name, zip, county, group, lat, lon]) => {
  PLACES[name] = {name, zip, county, group, lat, lon};
  if (zip && !ZIP[zip]) ZIP[zip] = name;
});

const $ = id => document.getElementById(id);
const PHOTON = 'https://photon.komoot.io/api/';
const BBOX = '-96.55,39.98,-95.40,41.12';
let filling = 0;

function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

document.querySelectorAll('.year').forEach(el => { el.textContent = String(new Date().getFullYear()); });

const closuresEl = $('closures');
if (closuresEl) {
  const upcoming = [
    ['2026-11-26', 'Nov. 26, 2026 (Thanksgiving)'],
    ['2026-11-28', 'Nov. 28, 2026 (Thanksgiving weekend)'],
    ['2026-12-25', 'Dec. 25, 2026 (Christmas)'],
    ['2026-12-26', 'Dec. 26, 2026 (Christmas)'],
    ['2027-01-01', 'Jan. 1, 2027 (New Year)'],
    ['2027-01-02', 'Jan. 2, 2027 (New Year)']
  ].filter(([iso]) => iso >= todayISO());
  closuresEl.replaceChildren();
  if (!upcoming.length) closuresEl.textContent = 'Call the scale house for holiday hours.';
  else upcoming.forEach((row, i) => {
    if (i) closuresEl.append(document.createElement('br'));
    closuresEl.append(row[1]);
  });
}

if (window.L && $('map')) {
  const map = L.map('map', {scrollWheelZoom: false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);
  const pts = [];
  Object.values(PLACES).forEach(p => {
    if (!GROUP[p.group] || p.lat == null) return;
    pts.push([p.lat, p.lon]);
    L.circleMarker([p.lat, p.lon], {
      radius: 10, color: '#fff', weight: 3, fillColor: GROUP[p.group].c, fillOpacity: 1
    }).addTo(map).bindPopup('<b>' + p.name + '</b><br>' + GROUP[p.group].l);
  });
  if (pts.length) map.fitBounds(pts, {padding: [30, 30]});
}

function norm(s) {
  return String(s || '').trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').replace(/,?\s*(ne|nebraska)$/, '');
}

function findPlace(town, zip) {
  const key = norm(town);
  if (key) {
    const name = Object.keys(PLACES).find(n => norm(n) === key);
    if (name) return PLACES[name];
  }
  if (zip && ZIP[zip]) return PLACES[ZIP[zip]];
  return null;
}

function line(street, town, zip) {
  return [street, town, town || zip ? 'NE' : '', zip].filter(Boolean).join(', ').replace(', NE,', ', NE');
}

function showResult(kind, title, parts, cta) {
  const r = $('result');
  if (!r) return;
  r.className = kind;
  r.hidden = false;
  r.replaceChildren();
  const strong = document.createElement('strong');
  strong.textContent = title;
  r.append(strong);
  parts.forEach(fill => {
    const p = document.createElement('p');
    fill(p);
    r.append(p);
  });
  if (cta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = 'contact.html?addr=' + encodeURIComponent(cta) + '#start';
    a.textContent = 'Start service for this address';
    p.append(a);
    r.append(p);
  }
}

function phones(p, lead) {
  if (lead) p.append(lead);
  const a = document.createElement('a');
  a.href = 'tel:+18006388492';
  a.textContent = '800-638-8492';
  const b = document.createElement('a');
  b.href = 'tel:+16607364949';
  b.textContent = '660-736-4949';
  p.append(a, ' or ', b, '.');
}

function runCheck() {
  const street = ($('street') && $('street').value.trim()) || '';
  const town = ($('town') && $('town').value.trim()) || '';
  const zip = ($('zip') && $('zip').value.trim()) || '';
  const rural = $('rural') && $('rural').checked;
  if (!town && !zip) {
    showResult('warn', 'Enter your town or ZIP', [
      p => { p.textContent = 'We need one of them to check coverage.'; }
    ]);
    return;
  }
  const hit = findPlace(town, zip);
  const where = line(street, (hit && hit.name) || town, zip || (hit && hit.zip) || '');
  if (!hit) {
    showResult('warn', 'Call us and we will check that address', [
      p => { p.textContent = 'That town is not in the checker. If it is in Cass, Nemaha, Otoe or Richardson County, we can look up the road.'; },
      p => phones(p, 'Call ')
    ]);
    return;
  }
  const place = hit.name;
  if (rural) {
    showResult('ok', 'Rural service is available near ' + place, [
      p => phones(p, 'We run rural routes in Cass, Nemaha, Otoe and Richardson counties. Call '),
      p => { p.textContent = 'We will confirm your road and give you a price.'; }
    ], where);
    return;
  }
  if (hit.group === 'ars') {
    showResult('ok', 'Yes, we serve ' + place, [
      p => phones(p, 'Home pickup is available in town. Call '),
      p => { p.textContent = 'Or send a request and we will call you back.'; }
    ], where);
    return;
  }
  if (hit.group === 'city') {
    showResult('warn', 'In ' + place + ', service goes through City Hall', [
      p => { p.textContent = 'Contact your City Hall to start home service in town. If you live outside town limits, check the rural box above.'; }
    ]);
    return;
  }
  if (hit.group === 'bpw') {
    showResult('warn', 'Auburn homes in town are served by the Board of Public Works', [
      p => {
        p.append('Call them at ');
        const a = document.createElement('a');
        a.href = 'tel:+14022744981';
        a.textContent = '402-274-4981';
        p.append(a, '. If you live outside city limits, check the rural box above.');
      },
      p => { p.textContent = 'Howe shares ZIP 68305 and is served by us directly. Enter Howe if that is your town.'; }
    ]);
    return;
  }
  showResult('warn', place + ' is in ' + hit.county + ' County', [
    p => phones(p, 'We run rural routes in that county, not regular in-town home pickup. Call '),
    p => { p.textContent = 'Ask us to confirm your road. If you live outside city limits, check the rural box above.'; }
  ]);
}

function labelFor(streetLine, city, zip) {
  return [streetLine, city, zip ? 'NE ' + zip : 'NE'].filter(Boolean).join(', ');
}

function localHits(query, townOnly) {
  const q = norm(query);
  if (q.length < 1) return [];
  return Object.values(PLACES).filter(p => {
    const n = p.name.toLowerCase();
    return n.startsWith(q) || n.includes(q);
  }).sort((a, b) => {
    const as = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bs = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return as - bs || a.name.localeCompare(b.name);
  }).slice(0, 6).map(p => ({
    label: townOnly ? p.name : labelFor('', p.name, p.zip),
    streetLine: '',
    city: p.name,
    zip: p.zip,
    county: p.county
  }));
}

const photonCache = new Map();
async function photonHits(query, signal) {
  const key = query.trim().toLowerCase();
  if (photonCache.has(key)) return photonCache.get(key);
  const url = PHOTON + '?q=' + encodeURIComponent(query.trim()) + '&limit=8&lang=en&lat=40.55&lon=-95.95&bbox=' + BBOX;
  const res = await fetch(url, {signal, headers: {Accept: 'application/json'}});
  if (!res.ok) throw new Error('lookup failed');
  const data = await res.json();
  const q = query.trim().toLowerCase();
  const num = (q.match(/^\d+/) || [''])[0];
  const items = [];
  const seen = new Set();
  (data.features || []).forEach(f => {
    const p = f.properties || {};
    if (p.state && p.state !== 'Nebraska') return;
    if (!COUNTIES.has(p.county)) return;
    if (['county', 'state', 'country'].includes(p.type)) return;
    const isStreet = p.type === 'street' || p.osm_key === 'highway';
    const streetName = p.street || (isStreet ? p.name : '');
    const streetLine = [p.housenumber, streetName].filter(Boolean).join(' ').trim();
    const city = p.city || '';
    const where = city || (p.county ? p.county + ' County' : '');
    if (!streetLine && !where) return;
    const useful = streetLine || p.osm_key === 'place' ||
      ['city', 'town', 'village', 'hamlet', 'locality', 'district'].includes(p.type);
    const nameL = (p.name || '').toLowerCase();
    if (!useful && !nameL.startsWith(q)) return;
    const zip = String(p.postcode || '').slice(0, 5);
    const label = labelFor(streetLine, where, zip);
    const id = label.toLowerCase();
    if (seen.has(id)) return;
    const streetL = streetLine.toLowerCase();
    const whereL = where.toLowerCase();
    if (!streetL.startsWith(q) && !whereL.startsWith(q) && !nameL.startsWith(q) && !label.toLowerCase().includes(q)) return;
    seen.add(id);
    let score = 0;
    if (streetL.startsWith(q) || nameL.startsWith(q)) score += 100;
    if (label.toLowerCase().startsWith(q)) score += 20;
    if (city) score += 25;
    if (streetLine) score += 8;
    if (num && p.housenumber && String(p.housenumber).startsWith(num)) score += 40;
    if (num && p.housenumber && !String(p.housenumber).startsWith(num)) score -= 15;
    items.push({label, streetLine, city, displayCity: where, zip, county: p.county, score});
  });
  items.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  let out = items.slice(0, 6);
  if (!out.length) {
    const parts = query.trim().match(/^(\d+)\s+([A-Za-z].{1,})$/);
    if (parts) {
      const streets = await photonHits(parts[2], signal);
      const prefix = parts[2].trim().toLowerCase();
      out = streets.filter(s => s.streetLine.toLowerCase().startsWith(prefix)).slice(0, 6).map(s => {
        const streetLine = parts[1] + ' ' + s.streetLine;
        const shown = s.displayCity || s.city;
        return {label: labelFor(streetLine, shown, s.zip), streetLine, city: s.city, displayCity: shown, zip: s.zip, county: s.county, score: (s.city ? 100 : 70)};
      }).sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
    }
  }
  photonCache.set(key, out);
  if (photonCache.size > 40) photonCache.delete(photonCache.keys().next().value);
  return out;
}

function mergeHits(local, remote) {
  const seen = new Set();
  const out = [];
  [...remote, ...local].forEach(item => {
    const id = item.label.toLowerCase();
    if (seen.has(id)) return;
    seen.add(id);
    out.push(item);
  });
  return out.slice(0, 6);
}

function attachCompleter(input, opts) {
  if (!input) return {commit() {}};
  const wrap = document.createElement('span');
  wrap.className = 'ac';
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);
  const list = document.createElement('div');
  list.className = 'ac-list';
  list.hidden = true;
  list.setAttribute('role', 'listbox');
  list.id = input.id + '-list';
  wrap.appendChild(list);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', list.id);
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.autocapitalize = 'words';

  let items = [];
  let active = -1;
  let typed = '';
  let timer = 0;
  let seq = 0;
  let ctrl = null;
  let lock = false;

  function typedValue() {
    if (input.selectionStart != null && input.selectionStart !== input.selectionEnd && input.selectionEnd === input.value.length) {
      return input.value.slice(0, input.selectionStart);
    }
    return input.value;
  }

  function close() {
    list.hidden = true;
    list.replaceChildren();
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    items = [];
    active = -1;
  }

  function ghost(item, query) {
    if (!item || document.activeElement !== input) return;
    if (!item.label.toLowerCase().startsWith(query.toLowerCase()) || item.label.length <= query.length) return;
    lock = true;
    input.value = item.label;
    const mark = () => input.setSelectionRange(query.length, item.label.length);
    mark();
    requestAnimationFrame(mark);
    lock = false;
  }

  function paint(next, query) {
    items = next;
    list.replaceChildren();
    if (!next.length || document.activeElement !== input) {
      close();
      return;
    }
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    active = 0;
    next.forEach((item, i) => {
      const opt = document.createElement('div');
      opt.className = 'ac-opt';
      opt.setAttribute('role', 'option');
      opt.id = list.id + '-' + i;
      opt.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      opt.textContent = item.label;
      opt.addEventListener('mousedown', e => {
        e.preventDefault();
        choose(i);
      });
      list.append(opt);
    });
    input.setAttribute('aria-activedescendant', list.id + '-0');
    ghost(next[0], query);
  }

  function move(dir) {
    if (!items.length) return;
    active = (active + dir + items.length) % items.length;
    [...list.children].forEach((opt, i) => opt.setAttribute('aria-selected', i === active ? 'true' : 'false'));
    input.setAttribute('aria-activedescendant', list.id + '-' + active);
    const opt = list.children[active];
    if (opt) opt.scrollIntoView({block: 'nearest'});
  }

  function choose(index) {
    const item = items[index];
    if (!item) return;
    close();
    lock = true;
    opts.onPick(item);
    lock = false;
    if (opts.afterPick) opts.afterPick();
  }

  function commit() {
    if (list.hidden || active < 0) return false;
    choose(active);
    return true;
  }

  async function lookup(query) {
    const local = localHits(query, !!opts.townList);
    paint(local, query);
    if (!opts.remote || query.trim().length < 3) return;
    const my = ++seq;
    if (ctrl) ctrl.abort();
    ctrl = new AbortController();
    const killer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const remote = await photonHits(query, ctrl.signal);
      if (my !== seq || typedValue() !== query) return;
      paint(mergeHits(localHits(query, !!opts.townList), remote), query);
    } catch (err) {
      if (err.name !== 'AbortError' && my === seq) paint(localHits(query, !!opts.townList), query);
    } finally {
      clearTimeout(killer);
    }
  }

  input.addEventListener('input', () => {
    if (lock || filling) return;
    typed = input.value;
    clearTimeout(timer);
    if (!typed.trim()) {
      close();
      return;
    }
    timer = setTimeout(() => lookup(typedValue()), opts.remote ? 280 : 0);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && !list.hidden) { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp' && !list.hidden) { e.preventDefault(); move(-1); }
    else if (e.key === 'Escape') {
      if (!list.hidden) {
        e.preventDefault();
        lock = true;
        input.value = typedValue();
        lock = false;
        close();
      }
    } else if (e.key === 'Enter' && !list.hidden) {
      e.preventDefault();
      choose(active < 0 ? 0 : active);
    }     else if (e.key === 'ArrowRight' && input.selectionStart !== input.selectionEnd) {
      e.preventDefault();
      choose(active < 0 ? 0 : active);
    } else if (e.key === 'Tab' && !list.hidden) {
      choose(active < 0 ? 0 : active);
    }
  });

  input.addEventListener('blur', () => {
    const pickOnLeave = !list.hidden && active >= 0;
    setTimeout(() => {
      if (wrap.contains(document.activeElement)) return;
      if (pickOnLeave && !list.hidden) choose(active);
      else close();
    }, 160);
  });

  if (opts.credit) {
    const form = input.form;
    if (form && !form.querySelector('.ac-credit')) {
      const note = document.createElement('p');
      note.className = 'note ac-credit';
      note.textContent = 'Address suggestions © OpenStreetMap.';
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.before(note);
      else form.append(note);
    }
  }

  return {commit};
}

const streetBox = attachCompleter($('street'), {
  remote: true,
  credit: true,
  onPick(item) {
    filling++;
    $('street').value = item.streetLine;
    if ($('town') && item.city) $('town').value = item.city;
    if ($('zip') && item.zip) $('zip').value = item.zip;
    filling--;
  },
  afterPick: runCheck
});

attachCompleter($('town'), {
  remote: false,
  townList: true,
  onPick(item) {
    filling++;
    $('town').value = item.city;
    if ($('zip') && item.zip) $('zip').value = item.zip;
    filling--;
  },
  afterPick: runCheck
});

const addrBox = attachCompleter($('s-addr'), {
  remote: true,
  credit: true,
  onPick(item) {
    filling++;
    $('s-addr').value = item.label;
    filling--;
  }
});

if ($('zip')) {
  $('zip').addEventListener('input', () => {
    const z = $('zip').value.replace(/\D/g, '').slice(0, 5);
    if (z !== $('zip').value) $('zip').value = z;
    if (z.length === 5 && ZIP[z] && $('town') && !$('town').value.trim()) $('town').value = ZIP[z];
  });
}

if ($('check')) $('check').addEventListener('submit', e => {
  e.preventDefault();
  streetBox.commit();
  runCheck();
});

if ($('startform')) $('startform').addEventListener('submit', e => {
  e.preventDefault();
  addrBox.commit();
  const f = new FormData(e.target);
  const body = 'Name: ' + (f.get('name') || '') + '\nPhone: ' + (f.get('phone') || '') + '\nService address: ' + (f.get('addr') || '') + '\nService needed: ' + (f.get('type') || '') + '\n\n' + (f.get('note') || '');
  let panel = document.getElementById('sent');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'sent';
    panel.className = 'sent';
    e.target.after(panel);
  }
  panel.replaceChildren();
  const p = document.createElement('p');
  p.textContent = 'Your email app should open with this request. If it does not, copy the text and send it to customerservice@arsinconline.com.';
  const ta = document.createElement('textarea');
  ta.readOnly = true;
  ta.rows = 6;
  ta.value = body;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn';
  btn.textContent = 'Copy request';
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(body);
      btn.textContent = 'Copied';
    } catch (err) {
      ta.focus();
      ta.select();
      btn.textContent = 'Select the text and copy it';
    }
  });
  panel.append(p, ta, btn);
  location.href = 'mailto:customerservice@arsinconline.com?subject=' + encodeURIComponent('Service request: ' + (f.get('type') || '')) + '&body=' + encodeURIComponent(body);
});

{ const q = new URLSearchParams(location.search).get('addr'); if (q && $('s-addr')) $('s-addr').value = q; }
