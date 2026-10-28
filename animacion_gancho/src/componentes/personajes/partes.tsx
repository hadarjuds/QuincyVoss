import React, {useId} from 'react';
import {C, D} from '../../estilo';
import {idSeguro, ik, Punto} from '../../util/anim';

const T = C.tinta;

// ---------------------------------------------------------------------------
// Ojo: blanco ovalado, pupila con brillo, párpado superior que baja.

type OjoProps = {
	cx: number;
	cy: number;
	rx: number;
	ry: number;
	/** Hacia dónde mira (-1 a 1 en cada eje). */
	mira?: Punto;
	/** Radio de la pupila como fracción de rx. */
	pupila?: number;
	/** 0 = abierto, 1 = cerrado. */
	parpado?: number;
	colorParpado: string;
	lw: number;
	/** Destello en forma de estrella (0 a 1). */
	estrella?: number;
};

export const Ojo: React.FC<OjoProps> = ({
	cx,
	cy,
	rx,
	ry,
	mira = {x: 0, y: 0},
	pupila = 0.5,
	parpado = 0,
	colorParpado,
	lw,
	estrella = 0,
}) => {
	const id = idSeguro(useId());
	const pr = rx * pupila;
	const px = cx + mira.x * (rx - pr * 0.7);
	const py = cy + mira.y * (ry - pr * 0.6);
	const p = Math.min(1, Math.max(0, parpado));
	const yParpado = cy - ry - 2 + (ry * 2 + 4) * p;
	return (
		<g>
			<clipPath id={`ojo-${id}`}>
				<ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
			</clipPath>
			<ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.blanco} />
			<g clipPath={`url(#ojo-${id})`}>
				<circle cx={px} cy={py} r={pr} fill={T} />
				<circle cx={px - pr * 0.35} cy={py - pr * 0.38} r={pr * 0.32} fill={C.blanco} />
				{estrella > 0.01 ? <Estrella cx={px} cy={py} r={pr * 1.25 * estrella} color={C.blanco} lw={0} /> : null}
				{p > 0.01 ? (
					<>
						<rect x={cx - rx - 4} y={cy - ry - 4} width={rx * 2 + 8} height={yParpado - (cy - ry - 4)} fill={colorParpado} />
						<line x1={cx - rx - 4} y1={yParpado} x2={cx + rx + 4} y2={yParpado} stroke={T} strokeWidth={lw * 0.8} />
					</>
				) : null}
			</g>
			<ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={T} strokeWidth={lw} />
		</g>
	);
};

// ---------------------------------------------------------------------------
// Estrella de cuatro puntas (destellos).

export const Estrella: React.FC<{cx: number; cy: number; r: number; color: string; lw: number; giro?: number}> = ({
	cx,
	cy,
	r,
	color,
	lw,
	giro = 0,
}) => {
	const pts: string[] = [];
	for (let i = 0; i < 8; i++) {
		const a = (i / 8) * Math.PI * 2 + (giro * Math.PI) / 180 - Math.PI / 2;
		const rr = i % 2 === 0 ? r : r * 0.32;
		pts.push(`${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`);
	}
	return <polygon points={pts.join(' ')} fill={color} stroke={lw > 0 ? T : 'none'} strokeWidth={lw} strokeLinejoin="round" />;
};

// ---------------------------------------------------------------------------
// Boca paramétrica: se puede mezclar entre expresiones sin saltos.

export type FormaBoca = {
	ancho: number;
	/** 0 = cerrada, 1 = abierta al máximo. */
	abierto: number;
	/** -1 = comisuras abajo, 1 = sonrisa. */
	sonrisa: number;
};

type BocaProps = FormaBoca & {cx: number; cy: number; altoMax: number; lw: number; dientes?: boolean};

export const Boca: React.FC<BocaProps> = ({cx, cy, ancho, abierto, sonrisa, altoMax, lw, dientes}) => {
	const id = idSeguro(useId());
	const w = ancho / 2;
	const c = sonrisa * ancho * 0.32;
	if (abierto < 0.04) {
		return (
			<path d={`M ${cx - w} ${cy} Q ${cx} ${cy + c * 2} ${cx + w} ${cy}`} fill="none" stroke={T} strokeWidth={lw} strokeLinecap="round" />
		);
	}
	const h = abierto * altoMax;
	const arriba = cy + c * 0.8 - h * 0.35;
	const abajo = cy + c * 1.2 + h * 1.7;
	const d = `M ${cx - w} ${cy} Q ${cx} ${arriba} ${cx + w} ${cy} Q ${cx} ${abajo} ${cx - w} ${cy} Z`;
	return (
		<g>
			<clipPath id={`boca-${id}`}>
				<path d={d} />
			</clipPath>
			<path d={d} fill={D.bocaInterior} />
			<g clipPath={`url(#boca-${id})`}>
				<ellipse cx={cx} cy={cy + h * 0.95} rx={w * 0.6} ry={h * 0.42} fill={C.rojo} />
				{dientes ? <rect x={cx - w} y={cy - h} width={w * 2} height={h * 1.05 + c * 0.6} fill={C.blanco} /> : null}
			</g>
			<path d={d} fill="none" stroke={T} strokeWidth={lw} strokeLinejoin="round" />
		</g>
	);
};

// ---------------------------------------------------------------------------
// Ceja: trazo grueso con un leve arco.

export const Ceja: React.FC<{cx: number; cy: number; largo: number; angulo: number; grosor: number; arco?: number}> = ({
	cx,
	cy,
	largo,
	angulo,
	grosor,
	arco = -0.15,
}) => (
	<path
		d={`M ${-largo / 2} 0 Q 0 ${arco * largo} ${largo / 2} 0`}
		transform={`translate(${cx} ${cy}) rotate(${angulo})`}
		fill="none"
		stroke={T}
		strokeWidth={grosor}
		strokeLinecap="round"
	/>
);

// ---------------------------------------------------------------------------
// Guante blanco de caricatura (manos de los brazos articulados).

export type PoseMano = 'abierta' | 'puno' | 'senala' | 'sujeta';

type GuanteProps = {
	x: number;
	y: number;
	/** Dirección de muñeca a dedos, en grados (0 = derecha, 90 = abajo). */
	angulo: number;
	tam: number;
	pose: PoseMano;
	/** Refleja el pulgar al otro lado. */
	espejo?: boolean;
	lw: number;
};

export const Guante: React.FC<GuanteProps> = ({x, y, angulo, tam: s, pose, espejo, lw}) => {
	const dedos: {a: number; l: number}[] =
		pose === 'abierta'
			? [
					{a: -24, l: 0.95},
					{a: 0, l: 1.05},
					{a: 24, l: 0.95},
				]
			: pose === 'senala'
				? [{a: 0, l: 1.15}]
				: pose === 'sujeta'
					? [
							{a: -14, l: 0.55},
							{a: 2, l: 0.6},
							{a: 18, l: 0.55},
						]
					: [];
	const formas = (relleno: boolean) => (
		<>
			{dedos.map((d, i) => {
				const r = (d.a * Math.PI) / 180;
				const bx = s * 0.75;
				return (
					<line
						key={i}
						x1={bx}
						y1={0}
						x2={bx + Math.cos(r) * s * d.l}
						y2={Math.sin(r) * s * d.l}
						strokeWidth={relleno ? s * 0.42 : s * 0.42 + lw * 2}
						stroke={relleno ? C.blanco : T}
						strokeLinecap="round"
					/>
				);
			})}
			{/* Pulgar */}
			<line
				x1={s * 0.55}
				y1={-s * 0.3}
				x2={s * (pose === 'abierta' ? 0.75 : 0.95)}
				y2={-s * (pose === 'abierta' ? 0.95 : 0.55)}
				strokeWidth={relleno ? s * 0.38 : s * 0.38 + lw * 2}
				stroke={relleno ? C.blanco : T}
				strokeLinecap="round"
			/>
			<ellipse
				cx={s * 0.6}
				cy={0}
				rx={s * 0.62}
				ry={s * 0.56}
				fill={relleno ? C.blanco : T}
				stroke={relleno ? 'none' : T}
				strokeWidth={lw * 2}
			/>
			{/* Puño de la manga del guante */}
			<rect
				x={-s * 0.12}
				y={-s * 0.5}
				width={s * 0.34}
				height={s}
				rx={s * 0.12}
				fill={relleno ? C.blanco : T}
				stroke={relleno ? 'none' : T}
				strokeWidth={lw * 2}
			/>
		</>
	);
	return (
		<g transform={`translate(${x} ${y}) rotate(${angulo}) scale(1 ${espejo ? -1 : 1})`}>
			{formas(false)}
			{formas(true)}
			<line x1={s * 0.22} y1={-s * 0.45} x2={s * 0.22} y2={s * 0.45} stroke={T} strokeWidth={lw * 0.5} />
			{pose === 'puno' || pose === 'sujeta' ? (
				<path
					d={`M ${s * 0.95} ${-s * 0.25} Q ${s * 1.1} 0 ${s * 0.95} ${s * 0.25}`}
					fill="none"
					stroke={T}
					strokeWidth={lw * 0.5}
					strokeLinecap="round"
				/>
			) : null}
		</g>
	);
};

// ---------------------------------------------------------------------------
// Brazo articulado (hombro y codo) que alcanza un punto con cinemática inversa.

type BrazoProps = {
	hombro: Punto;
	objetivo: Punto;
	l1: number;
	l2: number;
	doblez: 1 | -1;
	grosor: number;
	colorSup: string;
	colorInf: string;
	/** Puño de camisa arremangada en el codo. */
	remango?: boolean;
	/** Puño blanco de camisa en la muñeca (traje). */
	punoCamisa?: boolean;
	pose: PoseMano;
	tamMano: number;
	/** Giro extra de la mano respecto al antebrazo. */
	giroMano?: number;
	espejo?: boolean;
	lw: number;
	/** Algo que la mano sostiene (se dibuja en coordenadas de la muñeca). */
	sostiene?: React.ReactNode;
};

export const Brazo: React.FC<BrazoProps> = ({
	hombro,
	objetivo,
	l1,
	l2,
	doblez,
	grosor,
	colorSup,
	colorInf,
	remango,
	punoCamisa,
	pose,
	tamMano,
	giroMano = 0,
	espejo,
	lw,
	sostiene,
}) => {
	const {codo, muneca, anguloAntebrazo} = ik(hombro, objetivo, l1, l2, doblez);
	const pts = `${hombro.x},${hombro.y} ${codo.x},${codo.y} ${muneca.x},${muneca.y}`;
	const ux = (codo.x - hombro.x) / l1;
	const uy = (codo.y - hombro.y) / l1;
	const vx = (muneca.x - codo.x) / l2;
	const vy = (muneca.y - codo.y) / l2;
	return (
		<g>
			<polyline points={pts} fill="none" stroke={T} strokeWidth={grosor + lw * 2} strokeLinejoin="round" strokeLinecap="round" />
			<line x1={codo.x} y1={codo.y} x2={muneca.x} y2={muneca.y} stroke={colorInf} strokeWidth={grosor} strokeLinecap="round" />
			<line x1={hombro.x} y1={hombro.y} x2={codo.x} y2={codo.y} stroke={colorSup} strokeWidth={grosor} strokeLinecap="round" />
			{remango ? (
				<>
					<line
						x1={codo.x - ux * grosor * 0.55}
						y1={codo.y - uy * grosor * 0.55}
						x2={codo.x - ux * grosor * 0.05}
						y2={codo.y - uy * grosor * 0.05}
						stroke={T}
						strokeWidth={grosor * 1.3 + lw * 2}
						strokeLinecap="round"
					/>
					<line
						x1={codo.x - ux * grosor * 0.55}
						y1={codo.y - uy * grosor * 0.55}
						x2={codo.x - ux * grosor * 0.05}
						y2={codo.y - uy * grosor * 0.05}
						stroke={C.blanco}
						strokeWidth={grosor * 1.3}
						strokeLinecap="round"
					/>
				</>
			) : null}
			{punoCamisa ? (
				<line
					x1={muneca.x - vx * grosor * 0.5}
					y1={muneca.y - vy * grosor * 0.5}
					x2={muneca.x - vx * grosor * 0.1}
					y2={muneca.y - vy * grosor * 0.1}
					stroke={C.blanco}
					strokeWidth={grosor * 0.9}
				/>
			) : null}
			{sostiene ? <g transform={`translate(${muneca.x} ${muneca.y})`}>{sostiene}</g> : null}
			<Guante x={muneca.x} y={muneca.y} angulo={anguloAntebrazo + giroMano} tam={tamMano} pose={pose} espejo={espejo} lw={lw} />
		</g>
	);
};

// ---------------------------------------------------------------------------
// Gota de sudor.

export const Gota: React.FC<{x: number; y: number; tam: number; lw: number; opacidad?: number}> = ({x, y, tam, lw, opacidad = 1}) => (
	<path
		d={`M ${x} ${y - tam} Q ${x + tam * 0.75} ${y + tam * 0.1} ${x} ${y + tam * 0.55} Q ${x - tam * 0.75} ${y + tam * 0.1} ${x} ${y - tam} Z`}
		fill={C.azulCielo}
		stroke={T}
		strokeWidth={lw}
		strokeLinejoin="round"
		opacity={opacidad}
	/>
);
