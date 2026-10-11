// Builds the whole page from projects.json. You normally only edit that file.
(function () {
  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  // Only allow normal web links, in-page anchors and relative paths.
  function safeUrl(u) {
    u = String(u || '').trim();
    if (u === '' ) return '#';
    if (/^(https?:\/\/|#|\.?\/|[a-z0-9_\-]+\/)/i.test(u) && !/^\s*javascript:/i.test(u)) return u;
    return '#';
  }

  function renderProject(p) {
    var card = el('article', 'card');
    card.setAttribute('data-cat', (p.categories || []).join(' '));

    var shot = el('div', 'shot' + (p.tint === 'b' ? ' b' : p.tint === 'c' ? ' c' : ''));
    if (p.image) {
      var img = el('img');
      img.src = safeUrl(p.image);
      img.alt = p.title || '';
      img.loading = 'lazy';
      shot.appendChild(img);
    } else {
      shot.appendChild(el('span', null, 'Screenshot 16:9'));
    }
    card.appendChild(shot);

    var body = el('div', 'body');
    var tags = el('div', 'tags');
    (p.tags || []).forEach(function (t) { tags.appendChild(el('span', 'tag', t)); });
    body.appendChild(tags);
    body.appendChild(el('h3', null, p.title));
    body.appendChild(el('p', null, p.description));

    var meta = el('div', 'meta');
    meta.appendChild(el('span', null, p.meta || ''));
    if (p.linkText) {
      var a = el('a', null, p.linkText);
      a.href = safeUrl(p.linkUrl);
      if (/^https?:/i.test(a.href) && a.getAttribute('href') !== '#') { a.target = '_blank'; a.rel = 'noopener'; }
      meta.appendChild(a);
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

    if (d.notice) { $('notice').textContent = d.notice; $('notice').hidden = false; }

    document.title = (site.name || 'Portfolio') + ' | Roblox Portfolio';
    $('site-name').textContent = site.name || '';
    $('eyebrow').textContent = site.eyebrow || '';
    $('headline').textContent = site.headline || '';
    $('lede').textContent = site.lede || '';
    $('footer-left').textContent = site.footerLeft || '';
    $('footer-right').textContent = site.footerRight || '';

    // Stats
    var stats = $('stats');
    (d.stats || []).forEach(function (s) {
      var box = el('div', 'stat');
      box.appendChild(el('b', null, s.value));
      box.appendChild(el('span', null, s.label));
      stats.appendChild(box);
    });
    if (!(d.stats || []).length) stats.hidden = true;

    // Projects
    var grid = $('grid');
    (d.projects || []).forEach(function (p) { grid.appendChild(renderProject(p)); });

    // Filters
    var fbox = $('filters');
    var all = [{ id: 'all', label: 'All' }].concat(d.filters || []);
    var cards = grid.querySelectorAll('.card');
    all.forEach(function (f, i) {
      var b = el('button', null, f.label);
      b.type = 'button';
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        fbox.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        cards.forEach(function (c) {
          var cats = c.getAttribute('data-cat').split(' ');
          c.hidden = !(f.id === 'all' || cats.indexOf(f.id) !== -1);
        });
      });
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
        'If you opened index.html by double-clicking it, run it through a local server or view the published site instead. Details: ' + err.message
      ));
      document.querySelector('.wrap').insertBefore(box, document.querySelector('main'));
    });
})();
