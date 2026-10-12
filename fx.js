// Ambient glow: golden butterflies and warm bokeh lights that stay in the side margins,
// so nothing flies across the content.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var CONTENT = 1080 + 40;   // content column plus page padding
  var layer = document.createElement('div');
  layer.className = 'fx';
  layer.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(layer, document.body.firstChild);

  function rand(a, b) { return a + Math.random() * (b - a); }

  function build() {
    layer.textContent = '';
    var vw = window.innerWidth;
    if (vw < 700) return;                   // phones: stay calm
    var side = Math.max(64, (vw - CONTENT) / 2);   // free space on each side (a thin edge strip on narrow windows)

    function xIn(width) {                   // a random x inside the left or right margin
      var room = Math.max(0, side - width - 8);
      var left = Math.random() < 0.5;
      return left ? rand(4, 4 + room) : vw - rand(4, 4 + room) - width;
    }

    // Bokeh lights
    for (var i = 0; i < 18; i++) {
      var s = rand(10, Math.min(44, side * 0.6));
      var o = document.createElement('i');
      o.className = 'orb';
      o.style.cssText = 'left:' + xIn(s).toFixed(0) + 'px;--y:' + rand(0, 100).toFixed(1) + '%;--s:' + s.toFixed(0) + 'px;--d:' + rand(14, 30).toFixed(1) + 's;--t:' + rand(3, 7).toFixed(1) + 's;--delay:' + (-rand(0, 30)).toFixed(1) + 's;--a:' + rand(0.25, 0.7).toFixed(2);
      layer.appendChild(o);
    }

    // Glowing butterflies: rise, sway and flap
    var count = Math.max(6, Math.min(22, Math.round(side / 22)));
    for (var j = 0; j < count; j++) {
      var size = rand(24, Math.min(80, side * 0.7));
      var sway = Math.min(36, side * 0.22);
      var rise = document.createElement('div');
      rise.className = 'bf';
      rise.style.cssText = 'left:' + xIn(size + sway * 2).toFixed(0) + 'px;--y:' + rand(0, 95).toFixed(1) + '%;--w:' + size.toFixed(0) + 'px;--d:' + rand(26, 52).toFixed(1) + 's;--delay:' + (-rand(0, 50)).toFixed(1) + 's;--sw:' + rand(4, 9).toFixed(1) + 's;--fl:' + rand(0.45, 0.9).toFixed(2) + 's;--r:' + rand(-35, 35).toFixed(0) + 'deg;--dx:' + sway.toFixed(0) + 'px';
      var sw = document.createElement('div');
      sw.className = 'bf-sway';
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'bf-wings');
      svg.setAttribute('viewBox', '0 0 100 80');
      var use = document.createElementNS(NS, 'use');
      use.setAttribute('href', '#bf');
      svg.appendChild(use);
      sw.appendChild(svg);
      rise.appendChild(sw);
      layer.appendChild(rise);
    }
  }

  build();
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 250); });
})();
