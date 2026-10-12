// Builds the whole page from projects.json. You normally only edit that file.
(function () {
  // Missing elements get a throwaway div, so an out-of-date page can never crash the script
  function $(id) { return document.getElementById(id) || document.createElement('div'); }

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
  var EMBED_HOSTS = ['open.spotify.com', 'w.soundcloud.com', 'www.youtube.com', 'www.youtube-nocookie.com', 'bandcamp.com', 'www.tiktok.com'];
  function embedUrl(u) {
    try {
      var x = new URL(String(u || '').trim());
      if (x.protocol === 'https:' && EMBED_HOSTS.indexOf(x.hostname) !== -1) return x.href;
    } catch (e) { /* not a valid URL */ }
    return '';
  }

  function externalLink(a) {
    if (/^https?:/i.test(a.href)) { a.target = '_blank'; a.rel = 'noopener'; }
  }

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

    var tint = p.tint === 'b' ? ' b' : p.tint === 'c' ? ' c' : '';
    var shot = el('div', 'shot' + tint);

    if (p.image) {
      var src = safeUrl(p.image);
      shot.className += ' has-img';
      var img = el('img');
      img.src = src;
      img.alt = p.title || '';
      img.loading = 'lazy';
      if (type === 'art' || type === 'roblox') {
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
    // Animations: a video file (mp4/webm) or a TikTok / YouTube embed
    var vsrc = p.video ? safeUrl(p.video) : '';
    var vframe = type !== 'music' ? embedUrl(p.embed) : '';
    if (vsrc && vsrc !== '#') {
      var v = el('video', 'clip');
      v.controls = true;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = 'metadata';
      v.src = vsrc;
      if (p.image) v.poster = safeUrl(p.image);
      card.appendChild(v);
      shot.hidden = true;
    } else if (vframe) {
      var vf = el('iframe', 'embed clip-embed');
      vf.src = vframe;
      vf.title = (p.title || 'Video') + ' player';
      vf.loading = 'lazy';
      vf.height = String(p.embedHeight || 740);
      vf.setAttribute('allow', 'encrypted-media; fullscreen');
      vf.setAttribute('allowfullscreen', '');
      vf.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-presentation');
      card.appendChild(vf);
      shot.hidden = true;
    }

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
      externalLink(l);
      meta.appendChild(l);
    }
    body.appendChild(meta);
    card.appendChild(body);
    return card;
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
    var secEls = {};
    var projects = d.projects || [];

    if (d.notice) { $('notice').textContent = d.notice; $('notice').hidden = false; }

    document.title = (site.name ? site.name + ' | ' : '') + 'Portfolio';
    $('site-name').textContent = site.name || '';
    $('eyebrow').textContent = site.eyebrow || '';
    $('headline').textContent = site.headline || '';
    $('lede').textContent = site.lede || '';
    $('footer-left').textContent = site.footerLeft || '';
    $('footer-right').textContent = site.footerRight || '';

    // One stacked section per discipline, in the order listed in "disciplines"
    var secBox = $('sections');
    disciplines.forEach(function (x) {
      var sec = el('section');
      sec.id = x.id;

      var head = el('div', 'sec-head');
      var left = el('div', 'sec-title');
      left.appendChild(el('h2', null, x.heading || x.label));
      if (x.blurb) left.appendChild(el('p', 'sec-blurb', x.blurb));
      head.appendChild(left);
      if (x.linkText && x.linkUrl) {
        var b = el('a', 'btn', x.linkText);
        b.href = safeUrl(x.linkUrl);
        externalLink(b);
        head.appendChild(b);
      }
      sec.appendChild(head);

      var grid = el('div', 'grid');
      projects.forEach(function (p) {
        if ((p.type || 'roblox') === x.id) grid.appendChild(renderProject(p));
      });
      sec.appendChild(grid);
      secEls[x.id] = sec;
      secBox.appendChild(sec);
    });

    // Tabs: "All" shows the sections stacked in order, a tab shows only that section
    var tabsBox = $('tabs');
    var tabBtns = [];
    function showTab(id) {
      tabBtns.forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === id ? 'true' : 'false'); });
      disciplines.forEach(function (x) { secEls[x.id].hidden = !(id === 'all' || id === x.id); });
    }
    [{ id: 'all', label: 'All' }].concat(disciplines).forEach(function (x) {
      var b = el('button', null, x.label);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('data-tab', x.id);
      if (x.id !== 'all') {
        var n = projects.filter(function (p) { return (p.type || 'roblox') === x.id; }).length;
        b.appendChild(el('span', 'n', String(n)));
      }
      b.addEventListener('click', function () { showTab(x.id); });
      tabsBox.appendChild(b);
      tabBtns.push(b);
    });
    showTab('all');

    // Stats
    var stats = $('stats');
    (d.stats || []).forEach(function (s) {
      var box = el('div', 'stat');
      box.appendChild(el('b', null, s.value));
      box.appendChild(el('span', null, s.label));
      stats.appendChild(box);
    });
    if (!(d.stats || []).length) stats.hidden = true;

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

    // About me (photo, bio, fun cards) near the top
    var fun = d.fun || {};
    if ((fun.items || []).length || (fun.bio || []).length || fun.image) {
      $('fun').hidden = false;
      $('fun-title').textContent = fun.title || 'About me';
      var ph = $('me-photo');
      if (fun.image) {
        var pi = el('img');
        pi.src = safeUrl(fun.image);
        pi.alt = fun.imageAlt || 'Photo';
        ph.appendChild(pi);
      } else {
        ph.appendChild(el('span', null, 'Your photo here'));
      }
      (fun.bio || []).forEach(function (t) { $('me-bio').appendChild(el('p', null, t)); });
      (fun.items || []).forEach(function (it) {
        var c = el('div', 'fun-item');
        c.appendChild(el('small', null, it.label));
        c.appendChild(el('span', null, it.value));
        $('fun-list').appendChild(c);
      });
    }

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

  function fail(msg, err) {
    var box = el('div', 'load-error');
    box.appendChild(el('strong', null, msg));
    box.appendChild(document.createTextNode('Details: ' + (err && err.message ? err.message : err)));
    document.querySelector('.wrap').insertBefore(box, document.querySelector('main'));
  }

  fetch('projects.json', { cache: 'no-cache' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (d) {
      try { render(d); } catch (e) { fail('The page hit a problem while building itself. Try a hard refresh (Ctrl+Shift+R). ', e); }
    })
    .catch(function (e) {
      fail('The portfolio data could not be loaded. Check that projects.json is next to index.html and has no typos (a missing comma or quote breaks it). ', e);
    });
})();
