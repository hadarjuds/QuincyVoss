// Renderiza un PNG del frame central de cada plano (out/planos/plano-01.png …).
// Uso: npm run stills            (todos)
//      npm run stills -- 5 12    (solo los planos 5 y 12)
//      npm run stills -- f=1234  (un frame concreto, para revisar)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {FRAMES_CENTRALES} from '../src/timing.ts';

const raiz = path.resolve(import.meta.dirname, '..');
const salida = path.join(raiz, 'out', 'planos');
mkdirSync(salida, {recursive: true});

const args = process.argv.slice(2);
const sueltos = args.filter((a) => a.startsWith('f=')).map((a) => ({numero: null, frame: Number(a.slice(2))}));
const numeros = args.filter((a) => !a.startsWith('f=')).map(Number);
const pedidos = sueltos.length ? sueltos : FRAMES_CENTRALES.filter((p) => numeros.length === 0 || numeros.includes(p.numero));

const browserExecutable = process.env.REMOTION_CHROME || null;
const serveUrl = await bundle({entryPoint: path.join(raiz, 'src', 'index.ts')});
const composition = await selectComposition({serveUrl, id: 'Gancho', browserExecutable});

for (const p of pedidos) {
	const nombre = p.numero === null ? `frame-${String(p.frame).padStart(4, '0')}.png` : `plano-${String(p.numero).padStart(2, '0')}.png`;
	const output = path.join(salida, nombre);
	await renderStill({serveUrl, composition, frame: p.frame, output, browserExecutable, overwrite: true});
	console.log(`${nombre}  (frame ${p.frame}${p.titulo ? ` · ${p.titulo}` : ''})`);
}
