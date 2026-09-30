/* "Ask this page": in-browser TF-IDF retrieval over the page's own content.
   No language model, no API, no server, so it can only quote what is actually written.
   Every section in the HTML marked data-chunk="..." becomes one searchable chunk. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;


  const STOP = new Set('a an and are as at be by can could did do does for from has have he her his how i in into is it its me my of on or our she so than that the their them then there these they this to was we what when where which who whom why will with would you your any about tell give show list much many use used uses using he him does done project projects'.split(' '));
  const SYN = {
    internship:['intern','hitachi'], interned:['intern'], job:['intern','experience'], work:['experience','intern'], company:['hitachi'],
    cloud:['azure'], certificate:['certified','certification'], certifications:['certification','certified'], certs:['certification','certified'],
    ai:['llm','rag','gemini','groq'], genai:['llm','rag'], llm:['gemini','groq'], rag:['retrieval','citation'],
    accurate:['accuracy'], hallucinate:['hallucination'], hallucinates:['hallucination'],
    frontend:['react','next','design'], ui:['figma','design'], ux:['figma','design'], design:['figma'],
    college:['psvpec','engineering','cgpa'], education:['psvpec','engineering','cgpa'], studied:['engineering','ece','psvpec'], school:['sacred','psvpec'], degree:['engineering','ece'], study:['engineering','ece','psvpec','cgpa'], cgpa:['cgpa'], graduate:['2027','graduate'],
    leadership:['rotaract','secretary','director','lead','team'], lead:['rotaract','led'], rotaract:['rotaract','secretary'],
    contact:['email','linkedin'], reach:['email'], hire:['email','roles'], voice:['jarvis','speech'], latency:['response','median'], fast:['response','median'], speed:['response','median'], time:['response','processing'], search:['hybrid','retrieval'],
    database:['postgres','postgresql','supabase','chromadb','mongodb'], vector:['pgvector','chromadb','qdrant'], mcp:['mcp','agents'], agent:['agents','mcp'],
    languages:['java','python','javascript','tamil','english'], speak:['tamil','english','hindi','telugu','japanese']
  };
  const stem = w => w.length > 4 ? w.replace(/(ing|ed|es|s)$/,'') : w;
  const tokens = t => (t.toLowerCase().normalize('NFKD').match(/[a-z0-9.%+#-]+/g) || [])
    .map(w => w.replace(/^[.\-]+|[.\-]+$/g,'')).filter(w => w && !STOP.has(w)).map(stem);

  const UNIT = '.tags,p,li,h3,h4,.metric,.stat,.stack,a.email';
  const chunkEls = [...document.querySelectorAll('[data-chunk]')];
  const docs = chunkEls.map(el => {
    const units = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()){
      const n = walker.currentNode; if (!n.nodeValue.trim() || n.parentElement.closest('[aria-hidden="true"]') || n.parentElement.closest('[data-chunk]') !== el) continue;
      const u = n.parentElement.closest(UNIT) || n.parentElement;
      if (!el.contains(u) && u !== el) continue;
      if (!units.includes(u)) units.push(u);
    }
    const sentences = [];
    units.forEach(u => {
      const parts = []; const w2 = document.createTreeWalker(u, NodeFilter.SHOW_TEXT);
      while (w2.nextNode()) { const v = w2.currentNode.nodeValue.trim(); if (v) parts.push(v); }
      const isTags = u.matches('.tags');
      const t = (isTags ? 'Stack: ' + parts.join(', ') : parts.join(' ')).replace(/\s+/g,' ').replace(/\s([,.;:])/g,'$1').trim();
      if (!t) return;
      if (t.length > 180) (t.match(/.+?(?:[.!?](?=\s|$)|$)/g) || [t]).forEach(s => s.trim() && sentences.push(s.trim()));
      else sentences.push(t);
    });
    const text = sentences.join(' ');
    const tf = new Map(); tokens(el.dataset.chunk + ' ' + text).forEach(t => tf.set(t, (tf.get(t)||0) + 1));
    return { el, label: el.dataset.chunk, text, tf, sentences };
  });
  const df = new Map(); docs.forEach(d => d.tf.forEach((_,t) => df.set(t,(df.get(t)||0)+1)));
  const idf = t => Math.log(1 + docs.length / ((df.get(t)||0) + 0.5));
  docs.forEach(d => { let n = 0; d.tf.forEach((c,t) => { const w = (1 + Math.log(c)) * idf(t); n += w*w; }); d.norm = Math.sqrt(n) || 1; });

  function expand(q){
    const out = new Map();
    tokens(q).forEach(t => out.set(t, 1));
    q.toLowerCase().split(/[^a-z0-9]+/).forEach(w => {
      const syn = SYN[w] || SYN[w.replace(/s$/,'')] || SYN[w.replace(/es$/,'')] || [];
      syn.forEach(s => tokens(s).forEach(t => { if (!out.has(t)) out.set(t, 0.6); }));
    });
    return out;
  }
  function search(q){
    const qt = expand(q); if (!qt.size) return [];
    const scored = docs.map(d => {
      let s = 0; qt.forEach((qw,t) => { const c = d.tf.get(t); if (c) s += qw * (1 + Math.log(c)) * idf(t) * idf(t); });
      return { d, score: s / d.norm };
    }).filter(r => r.score > 0.08).sort((a,b) => b.score - a.score);
    if (!scored.length) return [];
    const top = scored[0].score;
    return scored.filter(r => r.score >= top * 0.3).slice(0,3).map(r => ({ ...r, qt }));
  }
  const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function snippet(d, qt){
    const labelT = new Set(tokens(d.label));
    const scored = d.sentences.map((s,i) => { const ts = new Set(tokens(s)); let v = 0; qt.forEach((w,t) => { if (ts.has(t)) v += w * idf(t) * (labelT.has(t) ? 0.25 : 1); }); return { s, i, v: (s.startsWith('Stack: ') ? 0.6 : 1) * v / Math.sqrt(1 + ts.size * 0.05) }; });
    const onlyLabel = [...qt.keys()].every(t => labelT.has(t) || !d.tf.has(t));
    let best = scored.slice().sort((a,b) => (b.v - a.v) || (Math.min(b.s.length,200) - Math.min(a.s.length,200)))[0];
    if (onlyLabel) { const long = scored.find(x => x.s.length > 80); if (long) best = { ...long, v: 1 }; }
    let text = best && best.v > 0 ? best.s : d.sentences[0];
    if (best && best.v > 0 && text.length < 70 && d.sentences[best.i+1]) text += (/[.!?]$/.test(text) ? ' ' : '. ') + d.sentences[best.i+1];
    if (text.length > 260) text = text.slice(0, 257).replace(/\s\S*$/,'') + '…';
    let html = esc(text);
    const words = [...new Set(text.split(/\s+/))].filter(w => { const t = tokens(w)[0]; return t && qt.has(t); }).map(w => w.replace(/[^\w%.+#-]/g,'').replace(/[.]+$/,'')).filter(Boolean);
    words.sort((a,b) => b.length - a.length).forEach(w => { html = html.replace(new RegExp('(^|[^\\w>])(' + w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')(?![\\w<])','g'), '$1<mark>$2</mark>'); });
    return html;
  }

  const answers = document.getElementById('answers'), input = document.getElementById('askInput');
  function run(q){
    q = q.trim(); if (!q) { answers.innerHTML = ''; return; }
    const res = search(q);
    if (!res.length){
      answers.innerHTML = '<p class="empty-note">Nothing on this page matches that. Try asking about projects, Hitachi, RAG, certifications or Rotaract.</p>';
      return;
    }
    answers.innerHTML = res.map((r,i) => `<div class="answer"><span class="n">${i+1}</span><div><p>${snippet(r.d, r.qt)}</p><button class="src" type="button" data-i="${docs.indexOf(r.d)}">Source: ${esc(r.d.label)}</button></div></div>`).join('');
  }
  document.getElementById('askForm').addEventListener('submit', e => { e.preventDefault(); run(input.value); });
  document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => { input.value = c.textContent; run(c.textContent); }));
  answers.addEventListener('click', e => {
    const b = e.target.closest('.src'); if (!b) return;
    const el = docs[+b.dataset.i].el;
    const target = el.closest('.box') || el;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    target.classList.remove('cite-flash'); void target.offsetWidth; target.classList.add('cite-flash');
  });
})();
