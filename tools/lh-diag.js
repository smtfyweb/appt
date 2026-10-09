// uso: node tools/lh-diag.js arquivo-lighthouse.json
const r = require(require('path').resolve(process.argv[2]));
const A = r.audits || {};
const sc = k => Math.round(((r.categories[k] || {}).score || 0) * 100);
const m = k => (A[k] && A[k].displayValue) || '-';
const items = id => (A[id] && A[id].details && A[id].details.items) || [];
console.log(`NOTAS: perf ${sc('performance')} | a11y ${sc('accessibility')} | boas-práticas ${sc('best-practices')} | seo ${sc('seo')}`);
console.log(`LCP ${m('largest-contentful-paint')} | FCP ${m('first-contentful-paint')} | TBT ${m('total-blocking-time')} | CLS ${m('cumulative-layout-shift')} | SI ${m('speed-index')}`);
const lt = items('largest-contentful-paint-element')[0];
const node = lt && lt.items && lt.items[0] && lt.items[0].node;
console.log('ELEMENTO DO LCP:', node ? String(node.snippet || '').slice(0, 160) : '(n/d)');
console.log('\nAUDITORIAS REPROVADAS (nota < 90):');
Object.values(A).filter(a => a.score !== null && a.score < 0.9 && !['informative', 'notApplicable', 'manual'].includes(a.scoreDisplayMode))
  .sort((x, y) => x.score - y.score).slice(0, 25)
  .forEach(a => console.log(`  ${String(Math.round(a.score * 100)).padStart(3)}  ${a.id} | ${a.title}${a.displayValue ? ' | ' + a.displayValue : ''}`));
console.log('\nERROS NO CONSOLE:');
items('errors-in-console').slice(0, 8).forEach(i => console.log('  ', String(i.description || (i.sourceLocation && i.sourceLocation.url) || JSON.stringify(i)).slice(0, 160)));
console.log('\nBLOQUEIAM A RENDERIZAÇÃO:');
(items('render-blocking-resources').length ? items('render-blocking-resources') : items('render-blocking-insight')).slice(0, 10)
  .forEach(i => console.log('  ', String(i.url || '').slice(0, 110), i.wastedMs ? `(${Math.round(i.wastedMs)} ms)` : ''));
console.log('\nJS NÃO USADO:');
items('unused-javascript').slice(0, 6).forEach(i => console.log('  ', String(i.url || '').slice(0, 90), Math.round((i.wastedBytes || 0) / 1024) + ' KB'));
console.log('\nMAIORES REQUISIÇÕES:');
items('network-requests').sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0)).slice(0, 10)
  .forEach(i => console.log('  ', Math.round((i.transferSize || 0) / 1024) + ' KB ', String(i.url || '').slice(0, 100)));
