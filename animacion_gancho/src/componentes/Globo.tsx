import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {C, FUENTE} from '../estilo';
import {ALTO, ANCHO} from '../timing';
import {entre, Punto, RESORTE, resorte} from '../util/anim';
import {useLinea} from './Linea';

type BaseProps = {
	/** Frame en que aparece (con un saltito de escala). */
	desde: number;
	/** Frame en que desaparece (opcional). */
	hasta?: number;
	/** Punta de la cola: hacia la boca de quien habla (coordenadas de pantalla). */
	cola: Punto;
};

const usePop = (desde: number, hasta: number | undefined, config = RESORTE.elastico) => {
	const frame = useCurrentFrame();
	const visible = frame >= desde && (hasta === undefined || frame < hasta);
	const escala = 0.55 + 0.45 * resorte(frame, desde, config);
	const salida = hasta === undefined ? 1 : entre(frame, hasta - 4, hasta, [1, 0]);
	return {visible, escala, opacidad: salida};
};

/** Triángulo de la cola: base dentro del globo, punta en `cola`. */
const puntosCola = (base: Punto, ancho: number, cola: Punto) => {
	const dx = cola.x - base.x;
	const dy = cola.y - base.y;
	const largo = Math.hypot(dx, dy) || 1;
	// Perpendicular a la cola para abrir la base.
	const px = (-dy / largo) * ancho;
	const py = (dx / largo) * ancho;
	return `${base.x + px},${base.y + py} ${cola.x},${cola.y} ${base.x - px},${base.y - py}`;
};

type GloboProps = BaseProps & {
	/** Punto del borde del globo (inferior o superior) donde nace la cola. */
	x: number;
	y: number;
	/** Borde del que sale la cola. El globo crece hacia el lado contrario. */
	lado: 'abajo' | 'arriba';
	/** Qué parte del globo queda sobre `x`: 0 = orilla izquierda, 0.5 = centro, 1 = orilla derecha. */
	ancla?: number;
	anchoMax?: number;
	texto: string;
	/** Cuántas palabras se ven (para el texto que aparece palabra por palabra). */
	palabrasVisibles?: number;
	/** Palabra que crece al aparecer. */
	enfasis?: {palabra: string; frame: number};
	tamano?: number;
};

/**
 * Globo de diálogo: blanco, contorno de 4 px y cola hacia quien habla.
 * El contorno del globo y de la cola se une dibujando primero todo con trazo
 * doble y luego todo el relleno blanco encima.
 */
export const Globo: React.FC<GloboProps> = ({
	x,
	y,
	lado,
	ancla = 0.5,
	anchoMax = 820,
	texto,
	palabrasVisibles,
	enfasis,
	tamano = 44,
	desde,
	hasta,
	cola,
}) => {
	const frame = useCurrentFrame();
	const {globo: borde} = useLinea();
	const {visible, escala, opacidad} = usePop(desde, hasta);
	if (!visible) return null;

	const palabras = texto.split(' ');
	const limpiar = (p: string) => p.replace(/[¿?¡!.,…]/g, '').toLowerCase();
	const base = {x, y: lado === 'abajo' ? y - 16 : y + 16};
	const triangulo = puntosCola(base, 26, cola);

	const caja = (relleno: boolean): React.CSSProperties => ({
		position: 'absolute',
		left: x,
		...(lado === 'abajo' ? {bottom: ALTO - y} : {top: y}),
		transform: `translateX(${-ancla * 100}%)`,
		maxWidth: anchoMax,
		width: 'max-content',
		padding: '22px 34px 24px',
		borderRadius: 46,
		backgroundColor: C.blanco,
		boxShadow: relleno ? undefined : `0 0 0 ${borde}px ${C.tinta}`,
		fontFamily: FUENTE.texto,
		fontWeight: 600,
		fontSize: tamano,
		lineHeight: 1.25,
		color: C.tinta,
		textAlign: 'center',
	});

	return (
		<AbsoluteFill style={{transform: `scale(${escala})`, transformOrigin: `${cola.x}px ${cola.y}px`, opacity: opacidad}}>
			{/* 1. Contorno de la cola (trazo doble, la mitad queda tapada). */}
			<svg width={ANCHO} height={ALTO} style={{position: 'absolute', overflow: 'visible'}}>
				<polygon points={triangulo} fill={C.blanco} stroke={C.tinta} strokeWidth={borde * 2} strokeLinejoin="round" />
			</svg>
			{/* 2. Globo con su contorno. */}
			<div style={caja(false)}>
				{palabras.map((p, i) => {
					const vis = palabrasVisibles === undefined || i < palabrasVisibles;
					const esEnfasis = enfasis && limpiar(p) === limpiar(enfasis.palabra);
					const crece = esEnfasis ? 1 + 0.45 * resorte(frame, enfasis.frame, RESORTE.elastico) : 1;
					return (
						<React.Fragment key={i}>
							<span
								style={{
									opacity: vis ? 1 : 0,
									display: 'inline-block',
									transform: `scale(${crece})`,
									transformOrigin: '0% 75%',
									color: esEnfasis ? C.rojo : undefined,
								}}
							>
								{p}
							</span>{' '}
						</React.Fragment>
					);
				})}
			</div>
			{/* 3. Relleno de la cola encima, para borrar el contorno del globo en la unión. */}
			<svg width={ANCHO} height={ALTO} style={{position: 'absolute', overflow: 'visible'}}>
				<polygon points={triangulo} fill={C.blanco} />
			</svg>
		</AbsoluteFill>
	);
};

type GritoProps = BaseProps & {
	/** Centro del globo dentado. */
	x: number;
	y: number;
	ancho: number;
	alto: number;
	lineas: string[];
	tamano?: number;
};

/** Globo dentado para gritos, con texto en Alfa Slab One. */
export const GloboGrito: React.FC<GritoProps> = ({x, y, ancho, alto, lineas, tamano = 72, desde, hasta, cola}) => {
	const frame = useCurrentFrame();
	const {globo: borde} = useLinea();
	const {visible, escala, opacidad} = usePop(desde, hasta, RESORTE.muyRigido);
	if (!visible) return null;

	const picos = 22;
	const puntos: string[] = [];
	for (let i = 0; i < picos * 2; i++) {
		const a = (i / (picos * 2)) * Math.PI * 2;
		const afuera = i % 2 === 0;
		const r = afuera ? 1 + 0.1 * random(`grito-${i}`) : 0.84;
		puntos.push(`${x + Math.cos(a) * (ancho / 2) * r},${y + Math.sin(a) * (alto / 2) * r}`);
	}
	const forma = puntos.join(' ');
	// Cola en zigzag, como rayo.
	const dx = cola.x - x;
	const dy = cola.y - y;
	const n = Math.hypot(dx, dy) || 1;
	const ux = dx / n;
	const uy = dy / n;
	const r0 = Math.min(ancho, alto) * 0.3;
	const ini = {x: x + ux * r0, y: y + uy * r0};
	const perp = {x: -uy, y: ux};
	const m = {x: (ini.x + cola.x) / 2, y: (ini.y + cola.y) / 2};
	const colaPts = [
		`${ini.x + perp.x * 40},${ini.y + perp.y * 40}`,
		`${m.x + perp.x * 26},${m.y + perp.y * 26}`,
		`${m.x - perp.x * 4},${m.y - perp.y * 4}`,
		`${cola.x},${cola.y}`,
		`${m.x - perp.x * 26},${m.y - perp.y * 26}`,
		`${m.x - perp.x * 0},${m.y - perp.y * 0}`,
		`${ini.x - perp.x * 40},${ini.y - perp.y * 40}`,
	].join(' ');
	const vibra = Math.sin(frame * 2.1) * 1.5;

	return (
		<AbsoluteFill style={{transform: `scale(${escala}) rotate(${vibra * 0.3}deg)`, transformOrigin: `${x}px ${y}px`, opacity: opacidad}}>
			<svg width={ANCHO} height={ALTO} style={{position: 'absolute', overflow: 'visible'}}>
				<g stroke={C.tinta} strokeWidth={borde * 2} strokeLinejoin="round" fill={C.blanco}>
					<polygon points={colaPts} />
					<polygon points={forma} />
				</g>
				<g fill={C.blanco}>
					<polygon points={colaPts} />
					<polygon points={forma} />
				</g>
				{lineas.map((l, i) => (
					<text
						key={i}
						x={x}
						y={y + (i - (lineas.length - 1) / 2) * tamano * 1.08 + tamano * 0.35}
						textAnchor="middle"
						fontFamily={FUENTE.cifras}
						fontSize={tamano}
						fill={C.rojo}
						stroke={C.tinta}
						strokeWidth={2}
						paintOrder="stroke"
					>
						{l}
					</text>
				))}
			</svg>
		</AbsoluteFill>
	);
};
