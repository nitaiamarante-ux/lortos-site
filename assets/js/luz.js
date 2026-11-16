
(function () {
  var doc = document.documentElement, d = document;
  if (!doc.classList.contains('luz') || doc.classList.contains('parado')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var temIO = 'IntersectionObserver' in window;
  function aoEntrar(el, limiar, fn) {
    var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { o.unobserve(el); fn(); } }); }, { threshold: limiar });
    o.observe(el);
  }

  
  if (temIO) [].forEach.call(d.querySelectorAll('[data-mov="digita"]'), function (h) {
    var sec = h.closest('section'), txt = h.textContent, cx = d.createElement('span'), lts = [], cur = d.createElement('span');
    h.setAttribute('aria-label', txt); cx.setAttribute('aria-hidden', 'true'); cur.className = 'cur';
    txt.split(/(\s+)/).forEach(function (w) {
      if (!w) return;
      if (/^\s+$/.test(w)) { cx.appendChild(d.createTextNode(w)); return; }
      var p = d.createElement('span'); p.className = 'pal';
      w.split('').forEach(function (c) { var s = d.createElement('span'); s.className = 'lt'; s.textContent = c; p.appendChild(s); lts.push(s); });
      cx.appendChild(p);
    });
    h.textContent = ''; h.appendChild(cx);
    if (sec) sec.classList.add('digitando');
    aoEntrar(h, 0.6, function () {
      var i = 0;
      setTimeout(function passo() {
        var s = lts[i++]; s.classList.add('on'); s.parentNode.insertBefore(cur, s.nextSibling);
        if (i < lts.length) setTimeout(passo, /[.,]/.test(s.textContent) ? 220 : 36);
        else { cur.classList.add('fim'); if (sec) { sec.classList.remove('digitando'); sec.classList.add('escrito'); } }
      }, sec && sec.classList.contains('fecho-virada') ? 600 : 150);
    });
  });

  
  if (temIO) [].forEach.call(d.querySelectorAll('[data-mov="tl"]'), function (tl) {
    var hs = tl.querySelectorAll('.tl-h'); if (hs.length < 2) return;
    var a = hs[0].textContent.split(':'), b = hs[1].textContent.split(':'), fim = hs[1].textContent;
    var m = +a[0] * 60 + +a[1], m1 = +b[0] * 60 + +b[1];
    if (!(m1 > m) || m1 - m > 30) return;
    aoEntrar(tl, 0.35, function () {
      hs[1].textContent = hs[0].textContent;
      setTimeout(function t() {
        m++; hs[1].textContent = ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2);
        if (m < m1) setTimeout(t, 85); else hs[1].textContent = fim;
      }, 1750);
    });
  });

  
  var au = d.querySelector('.aurora'), sec = d.querySelector('.virada-sec');
  if (!au || !sec) return;
  if (temIO) new IntersectionObserver(function (es) { es.forEach(function (e) { au.classList.toggle('fora', !e.isIntersecting); }); }).observe(au);
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  var x = 0, y = 0, pede = false;
  sec.addEventListener('pointermove', function (e) {
    var r = au.getBoundingClientRect();
    x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2))) * 14;
    y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2))) * 10;
    if (!pede) { pede = true; requestAnimationFrame(function () { pede = false; au.style.setProperty('--px', x.toFixed(1)); au.style.setProperty('--py', y.toFixed(1)); }); }
  }, { passive: true });
  sec.addEventListener('pointerleave', function () { au.style.setProperty('--px', 0); au.style.setProperty('--py', 0); });
})();
