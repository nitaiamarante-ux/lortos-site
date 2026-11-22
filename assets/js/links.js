
(function () {
  function limpa(o) { return String(o || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40); }
  function comOrigem(href, o) {
    o = limpa(o);
    if (!o || href.indexOf('https://wa.me/') !== 0 || href.indexOf('?text=') < 0) return href;
    return href + encodeURIComponent(' (' + o + ')').replace(/\(/g, '%28').replace(/\)/g, '%29');
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { limpa: limpa, comOrigem: comOrigem }; return; }
  var m = /[?&]o=([^&#]*)/.exec(location.search);
  if (!m) return;
  var o; try { o = decodeURIComponent(m[1]); } catch (e) { return; }
  var as = document.querySelectorAll('a[data-origem]');
  for (var i = 0; i < as.length; i++) as[i].setAttribute('href', comOrigem(as[i].getAttribute('href'), o));
})();
