
(function () {
  var CHAVE = 'lortos_cookies', VALE_MS = 365 * 24 * 3600 * 1000;

  function lerEscolha(ls, agora) {
    try {
      var o = JSON.parse(ls.getItem(CHAVE));
      if (o && o.v === 1 && agora - o.t >= 0 && agora - o.t < VALE_MS) return { a: !!o.a, d: !!o.d };
    } catch (e) {}
    return null;
  }
  function gravarEscolha(ls, e, agora) {
    try { ls.setItem(CHAVE, JSON.stringify({ v: 1, a: !!e.a, d: !!e.d, t: agora })); } catch (x) {}
  }
  
  function estado(e) {
    var d = e && e.d ? 'granted' : 'denied', a = e && e.a ? 'granted' : 'denied';
    return { ad_storage: d, ad_user_data: d, ad_personalization: d, analytics_storage: a };
  }
  function limpa(o) { return String(o || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40); }
  function origemUrl(busca) {
    var m = /[?&]o=([^&#]*)/.exec(busca || ''); if (!m) return '';
    try { return limpa(decodeURIComponent(m[1])); } catch (e) { return ''; }
  }

  if (typeof window === 'undefined') {
    if (typeof module !== 'undefined' && module.exports) module.exports = { lerEscolha: lerEscolha, gravarEscolha: gravarEscolha, estado: estado, origemUrl: origemUrl, limpa: limpa };
    return;
  }

  var win = window, doc = win.document, ls = win.localStorage;
  var cfg = doc.currentScript || doc.querySelector('script[data-pixel],script[data-google]');
  var ga4 = (cfg && cfg.getAttribute('data-google')) || '', pixel = (cfg && cfg.getAttribute('data-pixel')) || '';
  var equipe = false; try { equipe = ls.getItem('lortos_equipe') === '1'; } catch (e) {}
  var escolha = lerEscolha(ls, Date.now());

  function anexa(src) { var s = doc.createElement('script'); s.async = true; s.src = src; doc.head.appendChild(s); }

  function carregaGoogle() {
    win.dataLayer = win.dataLayer || [];
    win.gtag = function () { win.dataLayer.push(arguments); };
    win.gtag('consent', 'default', estado(escolha));   
    win.gtag('js', new Date());
    if (/^GTM-/.test(ga4)) {   
      win.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      anexa('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(ga4));
    } else {
      win.gtag('config', ga4);
      anexa('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga4));
    }
  }
  function carregaMeta() {
    if (!win.fbq) {
      var n = win.fbq = function () { if (n.callMethod) n.callMethod.apply(n, arguments); else n.queue.push(arguments); };
      if (!win._fbq) win._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    }
    win.fbq('consent', 'revoke');                      
    win.fbq('init', pixel);
    if (escolha && escolha.d) win.fbq('consent', 'grant');
    win.fbq('track', 'PageView');
    anexa('https://connect.facebook.net/en_US/fbevents.js');
  }

  if (!equipe) {
    if (ga4) carregaGoogle();
    if (pixel) carregaMeta();
  }

  function aplica(e) {
    if (equipe) return;
    if (ga4 && win.gtag) win.gtag('consent', 'update', estado(e));
    if (pixel && win.fbq) win.fbq('consent', e.d ? 'grant' : 'revoke');
  }

  
  doc.addEventListener('click', function (ev) {
    if (equipe) return;
    var a = ev.target && ev.target.closest && ev.target.closest('a'); if (!a) return;
    var href = a.getAttribute('href') || '', marca = a.getAttribute('data-origem');
    var o = origemUrl(win.location && win.location.search) || limpa(marca) || 'site';
    if (/^https:\/\/wa\.me\//.test(href)) {
      if (win.gtag) win.gtag('event', 'generate_lead', { origem: o });
      if (win.fbq) win.fbq('track', 'Contact');
    } else if (marca && win.gtag) {
      win.gtag('event', 'select_content', { content_type: 'botao', item_id: limpa(marca), origem: limpa(marca) });
    }
  });

  
  function inicia() {
    var aviso = doc.getElementById('aviso-cookies'); if (!aviso) return;
    var c1 = aviso.querySelector('[data-ck-camada="1"]'), c2 = aviso.querySelector('[data-ck-camada="2"]');
    var chaves = {};
    function mostra(camada) { aviso.hidden = false; c1.hidden = camada !== 1; c2.hidden = camada !== 2; }
    function pinta() {
      var sw = aviso.querySelectorAll('[data-ck-chave]');
      for (var i = 0; i < sw.length; i++) {
        var on = !!chaves[sw[i].getAttribute('data-ck-chave')];
        sw[i].setAttribute('aria-checked', on ? 'true' : 'false');
        var t = sw[i].querySelector('.ck-so'); if (t) t.textContent = on ? 'Ligado' : 'Desligado';
      }
    }
    function fecha(e) { gravarEscolha(ls, e, Date.now()); escolha = e; aplica(e); aviso.hidden = true; }
    function abre(camada) { chaves = { a: !!(escolha && escolha.a), d: !!(escolha && escolha.d) }; pinta(); mostra(camada); }
    aviso.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('[data-ck],[data-ck-chave]'); if (!b) return;
      var k = b.getAttribute('data-ck'), ch = b.getAttribute('data-ck-chave');
      if (ch) { chaves[ch] = !chaves[ch]; pinta(); return; }
      if (k === 'escolher') { chaves = { a: !!(escolha && escolha.a), d: !!(escolha && escolha.d) }; pinta(); mostra(2); }
      else if (k === 'salvar') fecha({ a: ga4 ? !!chaves.a : false, d: !!chaves.d });
      else if (k === 'aceitar') fecha({ a: !!ga4, d: true });
      else if (k === 'recusar') fecha({ a: false, d: false });
    });
    doc.addEventListener('click', function (ev) {
      var l = ev.target.closest && ev.target.closest('[data-cookies]'); if (!l) return;
      ev.preventDefault(); abre(1);
    });
    if (!escolha) abre(1);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', inicia); else inicia();
})();
