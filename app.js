// Builds the whole page from projects.json. You normally only edit that file.
(function () {
  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  // Allows web links, in-page anchors and plain relative file names like
  // "harbor-town.png" or "images/harbor-town.png". Blocks javascript: and similar.
  function safeUrl(u) {
    u = String(u || '').trim();
    if (u === '') return '#';
    if (/^[a-z][a-z0-9+.\-]*:/i.test(u) && !/^https?:/i.test(u)) return '#';
    return u;
  }

  // Only embed players from music and video sites.
  var EMBED_HOSTS = ['open.spotify.com', 'w.soundcloud.com', 'www.youtube.com', 'www.youtube-nocookie.com', 'bandcamp.com'];
  function embedUrl(u) {
    try {
      var x = new URL(String(u || '').trim());
      if (x.protocol === 'https:' && EMBED_HOSTS.indexOf(x.hostname) !== -1) return x.href;
    } catch (e) { /* not a valid URL */ }
    return '';
  }

  var labels = {};
  var cards = [];
  var current = 'all';

  // Lightbox for artwork
  var dlg = $('lightbox');
  function openLightbox(src, title) {
    if (!dlg || typeof dlg.showModal !== 'function') return;
    $('lightbox-img').src = src;
    $('lightbox-img').alt = title || '';
    $('lightbox-caption').textContent = title || '';
    dlg.showModal();
  }
  if (dlg) {
    $('lightbox-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  function renderProject(p) {
    var type = p.type || 'roblox';
    var card = el('article', 'card ' + type);
    card.setAttribute('data-type', type);

    var tint = p.tint === 'b' ? ' b' : p.tint === 'c' ? ' c' : '';
    var shot = el('div', 'shot' + tint);
    shot.appendChild(el('em', 'badge', labels[type] || type));

    if (p.image) {
      var src = safeUrl(p.image);
      var img = el('img');
      img.src = src;
      img.alt = p.title || '';
      img.loading = 'lazy';
      if (type === 'art') {
        var zoom = el('button', 'zoom');
        zoom.type = 'button';
        zoom.setAttribute('aria-label', 'View ' + (p.title || 'artwork') + ' larger');
        zoom.appendChild(img);
        zoom.addEventListener('click', function () { openLightbox(src, p.title); });
        shot.appendChild(zoom);
      } else {
        shot.appendChild(img);
      }
    } else {
      shot.appendChild(el('span', null, type === 'art' ? 'Artwork' : type === 'music' ? 'Cover art' : 'Screenshot'));
    }
    card.appendChild(shot);

    var body = el('div', 'body');
    var tags = el('div', 'tags');
    (p.tags || []).forEach(function (t) { tags.appendChild(el('span', 'tag', t)); });
    body.appendChild(tags);
    body.appendChild(el('h3', null, p.title));
    body.appendChild(el('p', null, p.description));

    if (type === 'music') {
      var audioSrc = p.audio ? safeUrl(p.audio) : '';
      var frame = embedUrl(p.embed);
      if (audioSrc && audioSrc !== '#') {
        var a = el('audio', 'player');
        a.controls = true;
        a.preload = 'none';
        a.src = audioSrc;
        body.appendChild(a);
      } else if (frame) {
        var f = el('iframe', 'embed');
        f.src = frame;
        f.title = (p.title || 'Track') + ' player';
        f.loading = 'lazy';
        f.height = String(p.embedHeight || 152);
        f.setAttribute('allow', 'encrypted-media');
        f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
        body.appendChild(f);
      }
    }

    var meta = el('div', 'meta');
    meta.appendChild(el('span', null, p.meta || ''));
    if (p.linkText && p.linkUrl) {
      var l = el('a', null, p.linkText);
      l.href = safeUrl(p.linkUrl);
      if (/^https?:/i.test(l.href)) { l.target = '_blank'; l.rel = 'noopener'; }
      meta.appendChild(l);
    }
    body.appendChild(meta);
    card.appendChild(body);
    return card;
  }

  function setFilter(id) {
    current = id;
    document.querySelectorAll('#filters button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-filter') === id ? 'true' : 'false');
    });
    cards.forEach(function (c) {
      c.hidden = !(id === 'all' || c.getAttribute('data-type') === id);
    });
  }

  function copyText(text, btn) {
    var reset = function (label) { btn.textContent = label; setTimeout(function () { btn.textContent = 'Copy'; }, 1500); };
    try {
      navigator.clipboard.writeText(text).then(function () { reset('Copied'); }, function () { reset('Select it'); });
    } catch (e) { reset('Select it'); }
  }

  function render(d) {
    var site = d.site || {};
    var disciplines = d.disciplines || [];
    var projects = d.projects || [];
    disciplines.forEach(function (x) { labels[x.id] = x.label; });

    if (d.notice) { $('notice').textContent = d.notice; $('notice').hidden = false; }

    document.title = (site.name ? site.name + ' | ' : '') + 'Portfolio';
    $('site-name').textContent = site.name || '';
    $('eyebrow').textContent = site.eyebrow || '';
    $('headline').textContent = site.headline || '';
    $('lede').textContent = site.lede || '';
    $('footer-left').textContent = site.footerLeft || '';
    $('footer-right').textContent = site.footerRight || '';

    // Discipline tiles (click to filter the work below)
    var tiles = $('disciplines');
    disciplines.forEach(function (x) {
      var n = projects.filter(function (p) { return (p.type || 'roblox') === x.id; }).length;
      var t = el('button', 'tile');
      t.type = 'button';
      t.appendChild(el('b', null, x.label));
      t.appendChild(el('span', 'blurb', x.blurb || ''));
      t.appendChild(el('small', null, x.tools || ''));
      t.appendChild(el('span', 'count', n + (n === 1 ? ' project' : ' projects')));
      t.addEventListener('click', function () {
        setFilter(x.id);
        $('work').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      tiles.appendChild(t);
    });
    if (!disciplines.length) tiles.hidden = true;

    // Stats
    var stats = $('stats');
    (d.stats || []).forEach(function (s) {
      var box = el('div', 'stat');
      box.appendChild(el('b', null, s.value));
      box.appendChild(el('span', null, s.label));
      stats.appendChild(box);
    });
    if (!(d.stats || []).length) stats.hidden = true;

    // Work grid
    var grid = $('grid');
    projects.forEach(function (p) {
      var c = renderProject(p);
      cards.push(c);
      grid.appendChild(c);
    });

    // Filters
    var fbox = $('filters');
    [{ id: 'all', label: 'All' }].concat(disciplines).forEach(function (f) {
      var b = el('button', null, f.label);
      b.type = 'button';
      b.setAttribute('data-filter', f.id);
      b.setAttribute('aria-pressed', f.id === 'all' ? 'true' : 'false');
      b.addEventListener('click', function () { setFilter(f.id); });
      fbox.appendChild(b);
    });

    // Skills
    var sk = $('skills-list');
    (d.skills || []).forEach(function (g) {
      var col = el('div');
      col.appendChild(el('h3', null, g.group));
      col.appendChild(el('p', 'sub', g.sub || ''));
      var ul = el('ul');
      (g.items || []).forEach(function (it) {
        var li = el('li', null, it.name);
        li.appendChild(el('span', null, it.level || ''));
        ul.appendChild(li);
      });
      col.appendChild(ul);
      sk.appendChild(col);
    });

    // About
    var about = d.about || {};
    var com = $('commissions');
    var state = el('div', 'state');
    state.appendChild(el('span', 'dot' + (about.available === false ? ' off' : '')));
    state.appendChild(document.createTextNode(about.available === false ? 'Not taking commissions' : (about.availableText || 'Taking commissions')));
    com.appendChild(state);
    com.appendChild(el('p', null, about.availableNote || ''));
    var at = $('about-text');
    (about.paragraphs || []).forEach(function (t) { at.appendChild(el('p', null, t)); });

    // Contact
    var cl = $('contact-list');
    (d.contact || []).forEach(function (c) {
      var item = el('div', 'contact-item');
      item.appendChild(el('small', null, c.label));
      item.appendChild(el('span', 'val', c.value));
      if (c.type === 'link') {
        var a = el('a', 'link', c.linkText || 'Open');
        a.href = safeUrl(c.href);
        a.target = '_blank';
        a.rel = 'noopener';
        item.appendChild(a);
      } else {
        var b = el('button', null, 'Copy');
        b.type = 'button';
        b.addEventListener('click', function () { copyText(c.value, b); });
        item.appendChild(b);
      }
      cl.appendChild(item);
    });
  }

  fetch('projects.json', { cache: 'no-cache' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(render)
    .catch(function (err) {
      var box = el('div', 'load-error');
      box.appendChild(el('strong', null, 'The portfolio data could not be loaded. '));
      box.appendChild(document.createTextNode(
        'Check that projects.json is next to index.html and has no typos (a missing comma or quote breaks it). ' +
        'If you opened index.html by double-clicking it, view the published site instead. Details: ' + err.message
      ));
      document.querySelector('.wrap').insertBefore(box, document.querySelector('main'));
    });
})();
