import React, {useId} from 'react';
import {C, D} from '../../estilo';
import {idSeguro} from '../../util/anim';
import {trazo, useLinea} from '../Linea';

/** Teléfono: rectángulo redondeado. Origen: centro. `ancho` de 1 (de frente) a ~0.2 (de canto). */
export const Telefono: React.FC<{x: number; y: number; giro: number; ancho?: number; aplasta?: number}> = ({
	x,
	y,
	giro,
	ancho = 1,
	aplasta = 1,
}) => {
	const {gruesa, fina} = useLinea();
	return (
		<g transform={`translate(${x} ${y}) rotate(${giro}) scale(${ancho * (2 - aplasta)} ${aplasta})`}>
			<rect x={-58} y={-108} width={116} height={216} rx={20} fill={C.tinta} {...trazo(gruesa)} />
			<rect x={-46} y={-90} width={92} height={170} rx={8} fill={C.azulCielo} />
			<path d="M -46 -30 L 10 -90 L 34 -90 L -46 -6 Z" fill={C.blanco} opacity={0.35} />
			<circle cx={0} cy={94} r={7} fill={C.grisCalido} />
			<rect x={-14} y={-102} width={28} height={5} rx={2.5} fill={C.grisCalido} />
			<rect x={-46} y={-90} width={92} height={170} rx={8} fill="none" stroke={D.traje} strokeWidth={fina} />
		</g>
	);
};

/** Coladera (rejilla de alcantarilla) en el piso, vista desde arriba en perspectiva. */
export const Coladera: React.FC<{x: number; y: number; capa: 'fondo' | 'rejilla'}> = ({x, y, capa}) => {
	const {gruesa, fina} = useLinea();
	const arriba = y - 36;
	const abajo = y + 40;
	const wA = 190;
	const wB = 230;
	const marco = `M ${x - wA - 26} ${arriba - 14} L ${x + wA + 26} ${arriba - 14} L ${x + wB + 30} ${abajo + 16} L ${x - wB - 30} ${abajo + 16} Z`;
	const hueco = `M ${x - wA} ${arriba} L ${x + wA} ${arriba} L ${x + wB} ${abajo} L ${x - wB} ${abajo} Z`;
	if (capa === 'fondo') {
		return (
			<g>
				<path d={marco} fill={C.grisCalido} {...trazo(gruesa)} />
				<path d={hueco} fill={C.tinta} />
			</g>
		);
	}
	const barras = 9;
	return (
		<g>
			{Array.from({length: barras}, (_, i) => {
				const t = (i + 1) / (barras + 1);
				return (
					<line
						key={i}
						x1={x - wA + 2 * wA * t}
						y1={arriba}
						x2={x - wB + 2 * wB * t}
						y2={abajo}
						stroke={C.grisCalido}
						strokeWidth={16}
						strokeLinecap="butt"
					/>
				);
			})}
			{Array.from({length: barras}, (_, i) => {
				const t = (i + 1) / (barras + 1);
				return (
					<line
						key={`c${i}`}
						x1={x - wA + 2 * wA * t - 8}
						y1={arriba}
						x2={x - wB + 2 * wB * t - 9}
						y2={abajo}
						stroke={C.tinta}
						strokeWidth={fina * 0.6}
					/>
				);
			})}
			<path d={hueco} fill="none" {...trazo(gruesa)} />
		</g>
	);
};

/** Recorte para que el teléfono desaparezca dentro de la coladera. */
export const useRecorteColadera = (x: number, y: number) => {
	const id = idSeguro(useId());
	const def = (
		<clipPath id={`coladera-${id}`}>
			<rect x={x - 2000} y={y - 3000} width={4000} height={3000} />
		</clipPath>
	);
	return {def, url: `url(#coladera-${id})`};
};

/** Cartera. Origen: centro. */
export const Cartera: React.FC<{escala?: number}> = ({escala = 1}) => {
	const {gruesa, fina} = useLinea(escala);
	return (
		<g transform={`scale(${escala})`}>
			<rect x={-14} y={-50} width={60} height={34} rx={4} fill={C.verdeBillete} {...trazo(fina)} />
			<rect x={-40} y={-30} width={84} height={58} rx={10} fill={D.maderaOscura} {...trazo(gruesa)} />
			<path d="M -40 -8 L 44 -8" stroke={C.tinta} strokeWidth={fina} />
			<circle cx={30} cy={4} r={6} fill={C.mostaza} {...trazo(fina)} />
		</g>
	);
};
