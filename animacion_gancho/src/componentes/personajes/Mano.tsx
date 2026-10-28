import React from 'react';
import {C} from '../../estilo';
import {mezclar} from '../../util/anim';
import {trazo, useLinea} from '../Linea';

export type PropsMano = {
	/** Muñeca (los dedos apuntan hacia abajo). */
	x: number;
	y: number;
	escala?: number;
	/** 0 = sujetando, 1 = dedos abiertos y tiesos. */
	abre: number;
	/** Vibración de los dedos tiesos (px). */
	vibra?: number;
};

/**
 * Mano de caricatura con guante blanco de cuatro dedos (tres dedos y pulgar),
 * que baja desde arriba con su manga.
 */
export const Mano: React.FC<PropsMano> = ({x, y, escala = 1, abre, vibra = 0}) => {
	const {gruesa, fina} = useLinea(escala);
	// Dedos: base, ángulo (0 = hacia abajo) y largo, de sujetando a abiertos.
	const dedos = [
		{bx: -40, a: mezclar(-12, 22, abre), l: mezclar(52, 96, abre)},
		{bx: 0, a: mezclar(-4, 4, abre), l: mezclar(56, 104, abre)},
		{bx: 40, a: mezclar(10, -20, abre), l: mezclar(52, 96, abre)},
	];
	const pulgar = {a: mezclar(-40, 62, abre), l: mezclar(58, 84, abre)};
	const dedo = (bx: number, by: number, a: number, l: number, ancho: number, relleno: boolean, key: string) => {
		const r = (a * Math.PI) / 180;
		return (
			<line
				key={key}
				x1={bx}
				y1={by}
				x2={bx - Math.sin(r) * l}
				y2={by + Math.cos(r) * l}
				stroke={relleno ? C.blanco : C.tinta}
				strokeWidth={relleno ? ancho : ancho + gruesa * 2}
				strokeLinecap="round"
			/>
		);
	};
	const formas = (relleno: boolean) => (
		<>
			{dedos.map((d, i) => dedo(d.bx, 92, d.a, d.l, 38, relleno, `d${i}`))}
			{dedo(-62, 40, pulgar.a, pulgar.l, 36, relleno, 'p')}
			<rect
				x={-70}
				y={0}
				width={140}
				height={112}
				rx={46}
				fill={relleno ? C.blanco : C.tinta}
				stroke={relleno ? 'none' : C.tinta}
				strokeWidth={gruesa * 2}
			/>
		</>
	);
	return (
		<g transform={`translate(${x + vibra} ${y}) scale(${escala})`}>
			{/* Manga */}
			<rect x={-62} y={-900} width={124} height={850} fill={C.verdeAzulado} {...trazo(gruesa)} />
			<line x1={-30} y1={-900} x2={-30} y2={-60} stroke={C.tinta} strokeOpacity={0.2} strokeWidth={fina} />
			{/* Puño del guante con tres costuras */}
			<rect x={-80} y={-64} width={160} height={70} rx={22} fill={C.blanco} {...trazo(gruesa)} />
			{formas(false)}
			{formas(true)}
			{[-26, 0, 26].map((dx) => (
				<line key={dx} x1={dx} y1={18} x2={dx} y2={58} stroke={C.tinta} strokeWidth={fina} strokeLinecap="round" />
			))}
			{/* Separación entre dedos */}
			<path d={`M -20 96 L -20 ${96 + 20 * (1 - abre)} M 20 96 L 20 ${96 + 20 * (1 - abre)}`} stroke={C.tinta} strokeWidth={fina} />
			{/* Líneas de «tieso» cuando se abre */}
			{abre > 0.9 ? (
				<g stroke={C.tinta} strokeWidth={fina} strokeLinecap="round" opacity={(abre - 0.9) * 10}>
					<line x1={-118} y1={150} x2={-140} y2={165} />
					<line x1={-112} y1={190} x2={-138} y2={198} />
					<line x1={112} y1={150} x2={134} y2={165} />
					<line x1={106} y1={190} x2={132} y2={198} />
				</g>
			) : null}
		</g>
	);
};
