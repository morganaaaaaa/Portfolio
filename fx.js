// Ambient glow: drifting golden butterflies and warm bokeh lights behind the page.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var layer = document.createElement('div');
  layer.className = 'fx';
  layer.setAttribute('aria-hidden', 'true');

  function rand(a, b) { return a + Math.random() * (b - a); }
  var small = window.innerWidth < 700;

  // Bokeh lights
  var orbs = small ? 14 : 34;
  for (var i = 0; i < orbs; i++) {
    var o = document.createElement('i');
    o.className = 'orb';
    var s = rand(10, 46);
    o.style.cssText = '--x:' + (Math.random() < 0.65 ? rand(52, 100) : rand(0, 45)).toFixed(1) + '%;--y:' + rand(0, 100).toFixed(1) + '%;--s:' + s.toFixed(0) + 'px;--d:' + rand(14, 30).toFixed(1) + 's;--t:' + rand(3, 7).toFixed(1) + 's;--delay:' + (-rand(0, 30)).toFixed(1) + 's;--a:' + rand(0.25, 0.7).toFixed(2);
    layer.appendChild(o);
  }

  // Glowing butterflies: rise, sway, and flap
  var count = small ? 10 : 30;
  for (var j = 0; j < count; j++) {
    var rise = document.createElement('div');
    rise.className = 'bf';
    var size = rand(24, 86);
    var right = Math.random() < 0.65;
    rise.style.cssText = '--x:' + (right ? rand(55, 98) : rand(1, 42)).toFixed(1) + '%;--y:' + rand(0, 95).toFixed(1) + '%;--w:' + size.toFixed(0) + 'px;--d:' + rand(26, 52).toFixed(1) + 's;--delay:' + (-rand(0, 50)).toFixed(1) + 's;--sw:' + rand(4, 9).toFixed(1) + 's;--fl:' + rand(0.45, 0.9).toFixed(2) + 's;--r:' + rand(-35, 35).toFixed(0) + 'deg;--dx:' + rand(-40, 40).toFixed(0) + 'px';
    var sway = document.createElement('div');
    sway.className = 'bf-sway';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'bf-wings');
    svg.setAttribute('viewBox', '0 0 100 80');
    var use = document.createElementNS(NS, 'use');
    use.setAttribute('href', '#bf');
    svg.appendChild(use);
    sway.appendChild(svg);
    rise.appendChild(sway);
    layer.appendChild(rise);
  }

  document.body.insertBefore(layer, document.body.firstChild);
})();
