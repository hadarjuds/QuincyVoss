import React from 'react';
import {C, FUENTE} from '../../estilo';
import {trazo, useLinea} from '../Linea';

/** Eje base horizontal en gris cálido, que se dibuja de izquierda a derecha (0 a 1). */
export const EjeBase: React.FC<{x1: number; x2: number; y: number; progreso: number}> = ({x1, x2, y, progreso}) => {
	const {gruesa} = useLinea();
	const largo = x2 - x1;
	return (
		<line
			x1={x1}
			y1={y}
			x2={x2}
			y2={y}
			stroke={C.grisCalido}
			strokeWidth={gruesa * 1.4}
			strokeLinecap="round"
			strokeDasharray={largo}
			strokeDashoffset={largo * (1 - progreso)}
		/>
	);
};

type BarraProps = {
	/** Centro de la barra. */
	x: number;
	/** Línea base. */
	base: number;
	ancho: number;
	alto: number;
	color: string;
	etiqueta?: string;
	/** Destello blanco dentro de la barra (0 a 1). */
	destello?: number;
	/** Ícono dentro de la barra: altura (y del mundo) y opacidad. */
	icono?: {y: number; opacidad: number; dibujo: React.ReactNode};
};

/** Barra con esquinas superiores redondeadas y la cifra arriba en Alfa Slab One. */
export const Barra: React.FC<BarraProps> = ({x, base, ancho, alto, color, etiqueta, destello = 0, icono}) => {
	const {gruesa} = useLinea();
	const h = Math.max(0, alto);
	const r = Math.min(20, h / 2, ancho / 2);
	const izq = x - ancho / 2;
	const der = x + ancho / 2;
	const arriba = base - h;
	const d =
		h <= 0.5
			? ''
			: `M ${izq} ${base} L ${izq} ${arriba + r} Q ${izq} ${arriba} ${izq + r} ${arriba} L ${der - r} ${arriba} Q ${der} ${arriba} ${der} ${arriba + r} L ${der} ${base} Z`;
	return (
		<g>
			{d ? <path d={d} fill={color} {...trazo(gruesa)} /> : null}
			{d && destello > 0.01 ? <path d={d} fill={C.blanco} opacity={destello} /> : null}
			{icono && icono.opacidad > 0.01 ? (
				<g transform={`translate(${x} ${icono.y}) scale(1.25)`} opacity={icono.opacidad}>
					{icono.dibujo}
				</g>
			) : null}
			{etiqueta ? (
				<text x={x} y={arriba - 22} textAnchor="middle" fontFamily={FUENTE.cifras} fontSize={58} fill={C.tinta}>
					{etiqueta}
				</text>
			) : null}
		</g>
	);
};

// ---------------------------------------------------------------------------
// Íconos de línea simples, de un solo color, dibujados en una caja de ~100 px.

type IconoProps = {color: string};

const useIconoTrazo = (color: string) => {
	const {fina} = useLinea(1.25);
	return {stroke: color, strokeWidth: fina * 1.6, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round'} as const;
};

export const IconoSonda: React.FC<IconoProps> = ({color}) => {
	const t = useIconoTrazo(color);
	return (
		<g {...t}>
			<rect x={-14} y={-12} width={28} height={28} />
			<path d="M -24 -40 Q 0 -14 24 -40 Z" />
			<line x1={0} y1={-27} x2={0} y2={-12} />
			<rect x={-52} y={-8} width={30} height={20} />
			<rect x={22} y={-8} width={30} height={20} />
			<line x1={-37} y1={-8} x2={-37} y2={12} />
			<line x1={37} y1={-8} x2={37} y2={12} />
			<line x1={-6} y1={16} x2={-12} y2={34} />
			<line x1={6} y1={16} x2={12} y2={34} />
		</g>
	);
};

export const IconoServidor: React.FC<IconoProps> = ({color}) => {
	const t = useIconoTrazo(color);
	return (
		<g {...t}>
			<rect x={-32} y={-42} width={64} height={84} rx={6} />
			<line x1={-32} y1={-14} x2={32} y2={-14} />
			<line x1={-32} y1={14} x2={32} y2={14} />
			{[-28, 0, 28].map((y) => (
				<g key={y}>
					<circle cx={-18} cy={y} r={3} fill={color} />
					<line x1={-4} y1={y} x2={20} y2={y} />
				</g>
			))}
		</g>
	);
};

export const IconoDisco: React.FC<IconoProps> = ({color}) => {
	const t = useIconoTrazo(color);
	return (
		<g {...t}>
			<rect x={-34} y={-44} width={68} height={88} rx={8} />
			<circle cx={0} cy={-8} r={24} />
			<circle cx={0} cy={-8} r={4} fill={color} />
			<path d="M 24 30 L 8 2" />
			<circle cx={24} cy={30} r={4} fill={color} />
		</g>
	);
};

export const IconoPizza: React.FC<IconoProps> = ({color}) => {
	const t = useIconoTrazo(color);
	return (
		<g {...t}>
			<path d="M -36 -30 Q 0 -46 36 -30 L 0 44 Z" />
			<path d="M -30 -22 Q 0 -36 30 -22" />
			<circle cx={-8} cy={-8} r={6} />
			<circle cx={10} cy={4} r={5} />
			<circle cx={-2} cy={22} r={4} />
		</g>
	);
};

export const IconoTelefono: React.FC<IconoProps> = ({color}) => {
	const t = useIconoTrazo(color);
	return (
		<g {...t}>
			<rect x={-24} y={-44} width={48} height={88} rx={9} />
			<rect x={-16} y={-32} width={32} height={56} rx={3} />
			<circle cx={0} cy={34} r={3} fill={color} />
		</g>
	);
};

export const IconoGasolina: React.FC<IconoProps> = ({color}) => {
	const t = useIconoTrazo(color);
	return (
		<g {...t}>
			<rect x={-30} y={-42} width={40} height={84} rx={5} />
			<rect x={-22} y={-32} width={24} height={18} />
			<line x1={-38} y1={42} x2={18} y2={42} />
			<path d="M 10 -20 Q 34 -20 32 2 L 32 26 Q 32 34 24 30" />
			<path d="M 26 -30 L 38 -18" />
		</g>
	);
};
