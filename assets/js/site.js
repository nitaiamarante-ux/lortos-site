
(function () {
  var temDoc = typeof document !== 'undefined';
  var doc = temDoc ? document.documentElement : null, body = temDoc ? document.body : null;

  
  var IAS = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com', 'claude.ai'];
  var BUSCAS = ['google.', 'bing.com', 'duckduckgo.com', 'search.yahoo.', 'ecosia.org', 'yandex.'];
  var SOCIAIS = ['instagram.com', 'facebook.com', 'linkedin.com', 't.co', 'twitter.com', 'x.com', 'youtube.com', 'tiktok.com', 'whatsapp.com', 'wa.me', 'l.facebook.com', 'lm.facebook.com'];
  function hostDe(ref) { try { return new URL(ref).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  function casa(h, lista) { for (var i = 0; i < lista.length; i++) { var d = lista[i]; if (h === d || h.slice(-(d.length + 1)) === '.' + d || (d.slice(-1) === '.' && h.indexOf(d) === 0) || (d.slice(-1) === '.' && h.indexOf('.' + d) > -1)) return true; } return false; }
  function origem(ref, busca, hostAtual) {
    var q = new URLSearchParams(busca || '');
    var src = (q.get('src') || '').toLowerCase();
    if (src === 'gbp') return 'perfil_google';
    if (q.get('gclid') || q.get('fbclid') && q.get('utm_medium') === 'cpc' || /^(cpc|ppc|paid|anuncio)/.test((q.get('utm_medium') || '').toLowerCase())) return 'anuncio';
    if (src === 'indicacao' || (q.get('utm_source') || '').toLowerCase() === 'indicacao') return 'indicacao';
    var h = hostDe(ref || '');
    if (!h || h === hostAtual) return 'direto';
    if (casa(h, IAS)) return 'ia';
    if (casa(h, BUSCAS)) return 'busca';
    if (casa(h, SOCIAIS)) return 'social';
    return 'outro';
  }
  function marcos(pct, ja) { var r = []; [50, 90].forEach(function (m) { if (pct >= m && ja.indexOf(m) < 0) r.push(m); }); return r; }
  if (typeof module !== 'undefined') { module.exports = { origem: origem, marcos: marcos }; }
  if (typeof window === 'undefined' || !body) return;
  var cab = document.getElementById('cab');
  var api = body.getAttribute('data-api') || '';

  
  var bt = cab && cab.querySelector('.cab-menu');
  var painel = document.getElementById('painel');
  if (bt && painel) {
    var fecha = function () {
      painel.classList.remove('aberto'); body.classList.remove('menu-aberto');
      bt.setAttribute('aria-expanded', 'false'); bt.textContent = bt.getAttribute('data-abrir');
    };
    bt.addEventListener('click', function (e) {
      e.preventDefault();
      var abre = !painel.classList.contains('aberto');
      if (!abre) return fecha();
      painel.classList.add('aberto'); body.classList.add('menu-aberto');
      bt.setAttribute('aria-expanded', 'true'); bt.textContent = bt.getAttribute('data-fechar');
      var p = painel.querySelector('a'); if (p) p.focus();
    });
    painel.addEventListener('click', function (e) { if (e.target.closest('a')) fecha(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && painel.classList.contains('aberto')) { fecha(); bt.focus(); } });
    window.matchMedia('(min-width:1100px)').addEventListener('change', fecha);
  }

  
  var sec = document.querySelector('.virada-sec');
  if (cab && sec) {
    var ligado = false, tick = false;
    var alvo = function () { return window.matchMedia('(min-width:900px)').matches ? sec : (sec.querySelector('.virada-faixa') || sec); };
    var atualiza = function () {
      tick = false;
      var base = alvo().getBoundingClientRect().bottom, h = cab.offsetHeight;
      if (!ligado && base <= h) ligado = true;
      else if (ligado && base > h + 48) ligado = false;
      cab.classList.toggle('com-logo', ligado);
      cab.classList.toggle('rolado', ligado);
    };
    var pede = function () { if (!tick) { tick = true; requestAnimationFrame(atualiza); } };
    window.addEventListener('scroll', pede, { passive: true });
    window.addEventListener('resize', pede);
    atualiza();
  }

  
  var pronto = /[?&]pronto=1/.test(location.search) || doc.classList.contains('parado');
  var menos = pronto || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (pronto) doc.classList.add('vira-fim');

  
  var blocos = document.querySelectorAll('[data-mov]');
  if (!menos && blocos.length && 'IntersectionObserver' in window) {
    blocos.forEach(function (b) {
      if (b.getAttribute('data-mov') === 'seq') [].forEach.call(b.children, function (li, i) { li.style.setProperty('--i', i); });
    });
    doc.classList.add('mov');
    var ob = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('ativo'); }); });
          ob.unobserve(el);
        }
      });
    }, { threshold: 0.35 });
    blocos.forEach(function (b) {
      var r = b.getBoundingClientRect();
      ob.observe(b);
    });
  }

  
  var svg = document.querySelector('.virada-svg');
  if (svg) {
    var reduz = menos;
    var ctm = svg.getScreenCTM && svg.getScreenCTM();
    if (!reduz && ctm && ctm.a > 0 && !doc.classList.contains('vira-fim')) {
      var faixa = svg.closest('.virada-faixa') || svg;
      var largura = Math.max(sec ? sec.getBoundingClientRect().right : 0, faixa.getBoundingClientRect().right, window.innerWidth);
      var xDivisa = ctm.e + 1021 * ctm.a;
      var d = Math.max(0, (largura - xDivisa) / ctm.a);
      svg.style.setProperty('--d', d.toFixed(1) + 'px');
    }
    doc.classList.add('vira');
    if (!reduz && !pronto) doc.classList.add('laco-anim');
  }

  
  if (body.getAttribute('data-medicao') === '1' && api) {
    var equipe = false; try { equipe = localStorage.getItem('lortos_equipe') === '1'; } catch (e) {}
    var pagina = body.getAttribute('data-pagina') || location.pathname;
    var org = origem(document.referrer, location.search, location.hostname.replace(/^www\./, ''));
    var envia = function (evento, extra) {
      var dados = { evento: evento, pagina: pagina, origem: org };
      if (equipe) dados.equipe = true;
      if (extra) for (var k in extra) dados[k] = extra[k];
      var corpo = JSON.stringify(dados);
      try {
        if (navigator.sendBeacon) navigator.sendBeacon(api + '/evento', new Blob([corpo], { type: 'text/plain' }));
        else fetch(api + '/evento', { method: 'POST', body: corpo, keepalive: true, credentials: 'omit' });
      } catch (e) {}
    };
    envia('visita');
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      var acao = a.getAttribute('data-acao');
      if (acao === 'whatsapp' || /wa\.me\//.test(a.href)) envia('clique_whatsapp');
      else if (acao === 'area_cliente') envia('clique_area_cliente');
      else if (acao === 'contato' || /\/contato\/$/.test(a.pathname)) envia('clique_contato');
    });
    var ja = [], rolou = false;
    window.addEventListener('scroll', function () {
      rolou = true;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var pct = h > 0 ? (window.scrollY / h) * 100 : 100;
      marcos(pct, ja).forEach(function (m) { ja.push(m); envia('rolagem_' + m); });
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      var vistos = {};
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          var id = en.target.id;
          if (en.isIntersecting && rolou && !vistos[id]) { vistos[id] = 1; envia('bloco', { bloco: id }); }
        });
      }, { threshold: 0.5 });
      document.querySelectorAll('main section[id], main article[id]').forEach(function (s) { io.observe(s); });
    }
  }

  
  var form = document.getElementById('form-contato');
  if (form && api) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var estado = form.querySelector('.form-estado');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var dados = {}; new FormData(form).forEach(function (v, k) { dados[k] = v; });
      var b = form.querySelector('button[type=submit]'); var txt = b.textContent;
      b.disabled = true; b.textContent = 'Enviando';
      fetch(api + '/contato', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados), credentials: 'omit' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); estado.textContent = estado.getAttribute('data-ok'); form.reset(); })
        .catch(function () { estado.textContent = estado.getAttribute('data-erro'); })
        .then(function () { b.disabled = false; b.textContent = txt; });
    });
  }
})();
