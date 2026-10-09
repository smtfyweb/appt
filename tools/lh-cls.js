const r = require(require('path').resolve(process.argv[2]));
const A = r.audits || {};
const it = id => (A[id] && A[id].details && A[id].details.items) || [];
console.log('CLS total:', A['cumulative-layout-shift'] && A['cumulative-layout-shift'].displayValue);
console.log('\nELEMENTOS QUE SE MOVERAM:');
it('layout-shifts').slice(0, 8).forEach(i => console.log('  ', (i.score != null ? Number(i.score).toFixed(3) : '?'), String((i.node && i.node.snippet) || JSON.stringify(i)).slice(0, 150)));
const c = A['cls-culprits-insight'];
console.log('\nCULPADOS:'); if (c && c.details) console.log('  ', JSON.stringify(c.details).slice(0, 700));
console.log('\nFONTES:'); it('font-display-insight').slice(0, 6).forEach(x => console.log('  ', JSON.stringify(x).slice(0, 200)));
