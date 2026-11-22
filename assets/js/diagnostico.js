
(function () {
  var TOTAL = 8;
  
  var PRIORIDADE = [4, 8, 1, 2, 3, 5, 7, 6];
  function faixa(n) { return n <= 2 ? '0-2' : n <= 5 ? '3-5' : '6-8'; }
  function limpa(o) { return String(o || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40); }
  function conta(r) { var n = 0; for (var i = 0; i < r.length; i++) if (r[i] === true) n++; return n; }
  function textoWA(n, o, titulo1) {
    var t = titulo1 ? 'Oi, fiz o autodiagnóstico da Lortos: deu ' + n + ' de ' + TOTAL + ' e o plano começa por ' + titulo1 + '.'
                    : 'Oi, fiz o autodiagnóstico da Lortos e deu ' + n + ' de ' + TOTAL + '.';
    o = limpa(o); if (o) t += ' (' + o + ')';
    return t;
  }
  function codifica(t) { return encodeURIComponent(t).replace(/\(/g, '%28').replace(/\)/g, '%29'); }
  function urlWA(base, n, o, titulo1) { return base + '?text=' + codifica(textoWA(n, o, titulo1)); }
  
  function marcadas(r, lista) { var out = []; for (var i = 0; i < lista.length; i++) if (r[lista[i] - 1] === true) out.push(lista[i]); return out; }
  
  function simsOrdenados(r) { var out = []; for (var i = 0; i < PRIORIDADE.length; i++) if (r[PRIORIDADE[i] - 1] === true) out.push(PRIORIDADE[i]); return out; }
  
  function plano(r, cat) {
    var s = simsOrdenados(r); if (!s.length) return null;
    var dias = [], i, p;
    for (i = 0; i < 5; i++) {
      if (i < s.length) { p = cat.passos[s[i]]; dias.push({ dia: i + 1, q: s[i], titulo: p.titulo, passo: p.texto }); }
      else dias.push({ dia: i + 1, q: 0, titulo: cat.fixos.continua.titulo, passo: cat.fixos.continua.texto });
    }
    dias.push({ dia: 6, q: 0, titulo: cat.fixos[6].titulo, passo: cat.fixos[6].texto });
    dias.push({ dia: 7, q: 0, titulo: cat.fixos[7].titulo, passo: cat.fixos[7].texto });
    var porque = '';
    for (i = 0; i < cat.porque.length; i++) if (cat.porque[i].qs.indexOf(s[0]) >= 0) porque = cat.porque[i].texto;
    return { primeira: s[0], porque: porque, dias: dias };
  }
  
  function textoPlano(n, pl) {
    var L = ['Meu plano dos próximos 7 dias (Lortos)', 'Deu ' + n + ' de ' + TOTAL + '.', '', 'Por onde começar: ' + pl.porque, ''];
    for (var i = 0; i < pl.dias.length; i++) L.push('Dia ' + pl.dias[i].dia + ' (' + pl.dias[i].titulo + '): ' + pl.dias[i].passo);
    L.push('', 'lortos.com.br/diagnostico');
    return L.join('\n');
  }
  function urlPlano(n, pl) { return 'https://wa.me/?text=' + codifica(textoPlano(n, pl)); }

  
  function criar(emit) {
    var r = [], i = 0, iniciou = false;
    return {
      indice: function () { return i; },
      respostas: function () { return r.slice(); },
      terminou: function () { return i >= TOTAL; },
      total: function () { return conta(r); },
      responder: function (sim) {
        if (i >= TOTAL) return;
        if (!iniciou) { iniciou = true; emit('diagnostico_inicio', {}); }
        r[i] = !!sim; i++;
        if (i >= TOTAL) emit('diagnostico_fim', { faixa: faixa(conta(r)) });
      },
      voltar: function () { if (i > 0) i--; },
      refazer: function () { r = []; i = 0; iniciou = false; }
    };
  }

  if (typeof window === 'undefined') {
    if (typeof module !== 'undefined' && module.exports) module.exports = { TOTAL: TOTAL, PRIORIDADE: PRIORIDADE, faixa: faixa, limpa: limpa, conta: conta, textoWA: textoWA, urlWA: urlWA, marcadas: marcadas, simsOrdenados: simsOrdenados, plano: plano, textoPlano: textoPlano, urlPlano: urlPlano, criar: criar };
    return;
  }

  var doc = document;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  var perguntas = $$('.dg-p'), quiz = $('#dg-quiz'), res = $('#dg-res'), prog = $('#dg-prog');
  if (!perguntas.length || !res) return;
  var m = /[?&]o=([^&#]*)/.exec(location.search), origem = '';
  if (m) { try { origem = limpa(decodeURIComponent(m[1])); } catch (e) {} }
  var was = $$('[data-dg-wa]'), base = was[0].getAttribute('href').split('?')[0];
  var emite = function (nome, p) { if (window.lortosEvento) window.lortosEvento(nome, p || {}); };
  var d = criar(emite);

  
  var cat = { passos: {}, fixos: {}, porque: [] };
  $$('#dg-cat [data-q]').forEach(function (e) { cat.passos[e.getAttribute('data-q')] = { titulo: e.getAttribute('data-titulo'), texto: e.textContent.trim() }; });
  $$('#dg-cat [data-fixo]').forEach(function (e) { cat.fixos[e.getAttribute('data-fixo')] = { titulo: e.getAttribute('data-titulo'), texto: e.textContent.trim() }; });
  $$('#dg-cat [data-porque]').forEach(function (e) { cat.porque.push({ qs: e.getAttribute('data-porque').split(',').map(Number), texto: e.textContent.trim() }); });
  var atual = null;   

  function lista(ol, dias, folha) {
    ol.innerHTML = '';
    dias.forEach(function (x) {
      var li = doc.createElement('li');
      var a = doc.createElement('span'); a.className = folha ? 'dgf-dn' : 'dg-dn'; a.textContent = 'Dia ' + x.dia;
      var t = doc.createElement('p'); t.className = folha ? 'dgf-dt' : 'dg-dt'; t.textContent = x.titulo;
      var p = doc.createElement('p'); p.className = folha ? 'dgf-dp' : 'dg-dp'; p.textContent = x.passo;
      li.appendChild(a); li.appendChild(t); li.appendChild(p); ol.appendChild(li);
    });
  }

  function pinta() {
    var i = d.indice(), r = d.respostas();
    if (d.terminou()) {
      var n = d.total(), f = faixa(n);
      quiz.hidden = true; prog.hidden = true; $('#dg-sub').hidden = true; res.hidden = false;
      $('#dg-x').textContent = n;
      $$('.dg-faixa').forEach(function (p) { p.hidden = p.getAttribute('data-faixa') !== f; });
      atual = plano(r, cat);
      $('#dg-zero').hidden = !!atual; $('#dg-plano').hidden = !atual;
      if (atual) {
        $('#dg-porque').textContent = atual.porque;
        lista($('#dg-dias'), atual.dias, false);
        $('#dg-zap').setAttribute('href', urlPlano(n, atual));
        $('#dgf-deu').textContent = 'Deu ' + n + ' de ' + TOTAL + '.';
        $('#dgf-porque').textContent = atual.porque;
        lista($('#dgf-dias'), atual.dias, true);
        $('#dgf-data').textContent = new Date().toLocaleDateString('pt-BR');
      }
      var algum = false;
      $$('.dg-g').forEach(function (g) {
        var lst = g.getAttribute('data-perguntas').split(',').map(Number), ms = marcadas(r, lst), ul = $('.dg-l', g);
        ul.innerHTML = '';
        ms.forEach(function (q) { var li = doc.createElement('li'); li.textContent = $('#dq' + q).textContent; ul.appendChild(li); });
        g.hidden = !ms.length; if (ms.length) algum = true;
      });
      $('#dg-marcou').hidden = !algum;
      was.forEach(function (wa) { wa.setAttribute('href', urlWA(base, n, origem, atual ? atual.dias[0].titulo : '')); wa.setAttribute('data-origem-evento', 'diagnostico-' + f); });
      var t = $('#dg-titulo'); t.setAttribute('tabindex', '-1'); t.focus();
      return;
    }
    res.hidden = true; quiz.hidden = false; prog.hidden = false; $('#dg-sub').hidden = i > 0;
    perguntas.forEach(function (p, k) {
      p.hidden = k !== i;
      $$('.dg-b', p).forEach(function (b) { b.setAttribute('aria-pressed', r[k] === (b.getAttribute('data-r') === 'sim') && r[k] !== undefined ? 'true' : 'false'); });
    });
    $('#dg-n').textContent = (i + 1) + ' de ' + TOTAL;
    $('#dg-barra').style.width = ((i + 1) / TOTAL * 100) + '%';
    prog.setAttribute('aria-valuenow', i + 1);
    $('#dg-voltar').hidden = i === 0;
  }
  quiz.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dg-b');
    if (b) { d.responder(b.getAttribute('data-r') === 'sim'); pinta(); if (!d.terminou()) { var nb = $('.dg-b', perguntas[d.indice()]); if (nb) nb.focus(); } return; }
    if (e.target.closest && e.target.closest('#dg-voltar')) { d.voltar(); pinta(); }
  });
  $('#dg-pdf').addEventListener('click', function () { emite('diagnostico_plano_pdf'); window.print(); });
  $('#dg-zap').addEventListener('click', function () { emite('diagnostico_plano_whatsapp'); });
  $('#dg-refazer').addEventListener('click', function (e) { e.preventDefault(); d.refazer(); atual = null; was.forEach(function (wa) { wa.removeAttribute('data-origem-evento'); }); pinta(); window.scrollTo(0, 0); });
  pinta();
})();
