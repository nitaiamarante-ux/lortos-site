
(function () {
  function limpa(o) { return String(o || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40); }
  
  function ler(txt) {
    var s = String(txt == null ? '' : txt).replace(/R\$/gi, '').replace(/\s/g, '');
    if (!s) return null;
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    if (!/^\d+(\.\d+)?$/.test(s)) return null;
    var n = parseFloat(s);
    return isFinite(n) && n > 0 ? n : null;
  }
  function fmt(x, casas) {
    var p = Math.abs(x).toFixed(casas).split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (casas ? ',' + p[1] : '');
  }
  function horas(x) { return fmt(x, 1); }
  function reais(x) { return 'R$ ' + fmt(x, 2); }
  
  function calcular(notas, min, hora) {
    var hm = notas * min / 60;
    return { hm: hm, rm: hm * hora, ha: hm * 12, ra: hm * hora * 12 };
  }
  function faixa(hm) { return hm < 10 ? '<10' : hm < 40 ? '10-40' : '40+'; }
  function slug(f) { return f === '<10' ? 'menos-de-10' : f === '40+' ? '40-ou-mais' : f; }
  function textoWA(hm, o) {
    var t = 'Oi, fiz a conta na calculadora da Lortos: são ' + horas(hm) + ' horas por mês digitando nota.';
    o = limpa(o); if (o) t += ' (' + o + ')';
    return t;
  }
  function codifica(t) { return encodeURIComponent(t).replace(/\(/g, '%28').replace(/\)/g, '%29'); }
  function urlWA(base, hm, o) { return base + '?text=' + codifica(textoWA(hm, o)); }
  function textoResultado(r) {
    return ['Quanto custa digitar nota à mão (conta da Lortos)',
      'Por mês: ' + horas(r.hm) + ' horas e ' + reais(r.rm) + '.',
      'Por ano: ' + horas(r.ha) + ' horas e ' + reais(r.ra) + '.',
      'Isso é só o tempo de digitar. Não entra o custo do erro: nota lançada errada, estoque que não bate, imposto pago a mais.',
      '', 'lortos.com.br/calculadora'].join('\n');
  }
  function urlResultado(r) { return 'https://wa.me/?text=' + codifica(textoResultado(r)); }
  var ERRO = 'Preencha os três campos com um número maior que zero.';

  if (typeof window === 'undefined') {
    if (typeof module !== 'undefined' && module.exports) module.exports = { limpa: limpa, ler: ler, fmt: fmt, horas: horas, reais: reais, calcular: calcular, faixa: faixa, slug: slug, textoWA: textoWA, urlWA: urlWA, textoResultado: textoResultado, urlResultado: urlResultado, ERRO: ERRO };
    return;
  }

  var doc = document;
  function $(s) { return doc.querySelector(s); }
  var form = $('#cc-form'); if (!form) return;
  var m = /[?&]o=([^&#]*)/.exec(location.search), origem = '';
  if (m) { try { origem = limpa(decodeURIComponent(m[1])); } catch (e) {} }
  var wa = $('[data-cc-wa]'), base = wa.getAttribute('href').split('?')[0];
  var emite = function (nome, p) { if (window.lortosEvento) window.lortosEvento(nome, p || {}); };
  var como = $('#cc-como'), comoB = $('#cc-como-b'), erro = $('#cc-erro'), res = $('#cc-res');

  comoB.addEventListener('click', function (e) {
    e.preventDefault(); como.hidden = !como.hidden; comoB.setAttribute('aria-expanded', como.hidden ? 'false' : 'true');
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = ler($('#cc-notas').value), mi = ler($('#cc-min').value), h = ler($('#cc-hora').value);
    if (n === null || mi === null || h === null) { erro.textContent = ERRO; erro.hidden = false; res.hidden = true; return; }
    erro.hidden = true;
    var r = calcular(n, mi, h), f = faixa(r.hm);
    $('#cc-hm').textContent = horas(r.hm); $('#cc-rm').textContent = reais(r.rm);
    $('#cc-ha').textContent = horas(r.ha); $('#cc-ra').textContent = reais(r.ra);
    wa.setAttribute('href', urlWA(base, r.hm, origem));
    wa.setAttribute('data-origem-evento', 'calculadora-' + slug(f));
    $('#cc-zap').setAttribute('href', urlResultado(r));
    res.hidden = false; res.focus();
    emite('calculadora_fim', { faixa: f });
  });
  $('#cc-zap').addEventListener('click', function () { emite('calculadora_resultado_whatsapp'); });
})();
