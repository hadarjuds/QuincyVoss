import React from 'react';
import {C, D, FUENTE} from '../../estilo';
import {trazo, useLinea} from '../Linea';

/** Medidas de la oficina en coordenadas del mundo (plano general = cuadro completo). */
export const OFICINA = {
	piso: 860,
	escritorio: {x1: 880, x2: 1620, arriba: 630, frente: 662},
	ejecutivo: {x: 1100, y: 860, escala: 0.8},
	especialista: {x: 430, y: 890, escala: 0.85},
	boton: {x: 790, piso: 890},
	letrero: {x: 740, y: 112},
};

/** Pared mostaza clara, piso y ventana con cielo. */
export const FondoOficina: React.FC = () => {
	const {gruesa, fina} = useLinea();
	return (
		<g>
			<rect x={-2000} y={-1000} width={6000} height={OFICINA.piso + 1000} fill={D.pared} />
			{/* Rayas suaves del tapiz */}
			{Array.from({length: 24}, (_, i) => (
				<rect key={i} x={-200 + i * 110} y={-1000} width={36} height={OFICINA.piso + 1000} fill={C.mostaza} opacity={0.12} />
			))}
			<rect x={-2000} y={OFICINA.piso} width={6000} height={2600} fill={D.piso} />
			{/* Tablas del piso */}
			{Array.from({length: 18}, (_, i) => (
				<line
					key={i}
					x1={-2000}
					y1={OFICINA.piso + 70 + i * 140}
					x2={4000}
					y2={OFICINA.piso + 70 + i * 140}
					stroke={C.grisCalido}
					strokeOpacity={0.35}
					strokeWidth={fina}
				/>
			))}
			<rect x={-2000} y={OFICINA.piso - 26} width={6000} height={26} fill={D.madera} {...trazo(gruesa)} />
			{/* Ventana */}
			<g>
				<rect x={1330} y={130} width={360} height={330} rx={6} fill={C.azulCielo} {...trazo(gruesa)} />
				<path
					d="M 1380 260 q 20 -40 60 -24 q 20 -34 60 -10 q 40 -4 40 30 q 0 26 -30 26 l -110 0 q -30 0 -20 -22 z"
					fill={C.blanco}
					{...trazo(fina)}
				/>
				<path d="M 1560 360 q 14 -26 42 -16 q 16 -20 40 -4 q 24 2 22 22 l -96 0 z" fill={C.blanco} {...trazo(fina)} />
				<line x1={1510} y1={130} x2={1510} y2={460} stroke={C.blanco} strokeWidth={14} />
				<line x1={1330} y1={295} x2={1690} y2={295} stroke={C.blanco} strokeWidth={14} />
				<rect x={1330} y={130} width={360} height={330} rx={6} fill="none" {...trazo(gruesa)} />
				<rect x={1310} y={456} width={400} height={22} rx={6} fill={C.blanco} {...trazo(gruesa)} />
			</g>
		</g>
	);
};

/** Escritorio de madera con la placa «HOOVER». */
export const Escritorio: React.FC = () => {
	const {gruesa, fina} = useLinea();
	const {x1, x2, arriba, frente} = OFICINA.escritorio;
	return (
		<g>
			<rect x={x1 + 26} y={frente} width={x2 - x1 - 52} height={OFICINA.piso - frente + 6} fill={D.maderaOscura} {...trazo(gruesa)} />
			{/* Cajones */}
			<rect x={x2 - 290} y={frente + 30} width={230} height={70} rx={6} fill={D.madera} {...trazo(fina)} />
			<rect x={x2 - 290} y={frente + 118} width={230} height={70} rx={6} fill={D.madera} {...trazo(fina)} />
			<line x1={x2 - 205} y1={frente + 65} x2={x2 - 145} y2={frente + 65} {...trazo(fina * 2)} />
			<line x1={x2 - 205} y1={frente + 153} x2={x2 - 145} y2={frente + 153} {...trazo(fina * 2)} />
			<rect x={x1} y={arriba} width={x2 - x1} height={frente - arriba} rx={8} fill={D.madera} {...trazo(gruesa)} />
			{/* Placa */}
			<g transform={`translate(1360 ${arriba})`}>
				<path d="M -110 0 L -96 -54 L 96 -54 L 110 0 Z" fill={C.tinta} {...trazo(gruesa)} />
				<text x={0} y={-16} textAnchor="middle" fontFamily={FUENTE.texto} fontWeight={600} fontSize={32} letterSpacing={4} fill={C.mostaza}>
					HOOVER
				</text>
			</g>
		</g>
	);
};

/** Letrero de pared: «Buy £100, get £600» / «Launch the offer». */
export const Letrero: React.FC<{dy: number; brillo: number}> = ({dy, brillo}) => {
	const {gruesa, fina} = useLinea();
	const {x, y} = OFICINA.letrero;
	return (
		<g transform={`translate(${x} ${y + dy})`}>
			<line x1={-150} y1={-200} x2={-150} y2={0} stroke={C.tinta} strokeWidth={fina} />
			<line x1={150} y1={-200} x2={150} y2={0} stroke={C.tinta} strokeWidth={fina} />
			<rect x={-245} y={0} width={490} height={200} rx={14} fill={C.tinta} {...trazo(gruesa)} />
			<rect
				x={-231}
				y={14}
				width={462}
				height={172}
				rx={8}
				fill="none"
				stroke={C.mostaza}
				strokeWidth={fina}
				strokeDasharray="2 10"
				strokeLinecap="round"
				opacity={0.6 + 0.4 * brillo}
			/>
			<g opacity={0.35 + 0.65 * brillo}>
				<text
					x={0}
					y={90}
					textAnchor="middle"
					fontFamily={FUENTE.cifras}
					fontSize={48}
					fill={C.papel}
					textLength={430}
					lengthAdjust="spacingAndGlyphs"
				>
					Buy £100, get <tspan fill={C.mostaza}>£600</tspan>
				</text>
				<text x={0} y={156} textAnchor="middle" fontFamily={FUENTE.texto} fontWeight={600} fontSize={40} fill={C.rojo}>
					Launch the offer ↓
				</text>
			</g>
		</g>
	);
};

/** Gran botón rojo sobre un pedestal. `hundido` de 0 a 1 (1 = 20 % hundido). */
export const BotonRojo: React.FC<{hundido: number; pulso: number}> = ({hundido, pulso}) => {
	const {gruesa, fina} = useLinea();
	const {x, piso} = OFICINA.boton;
	const tope = piso - 290;
	const h = 56 * (1 - 0.2 * hundido);
	return (
		<g>
			{/* Brillo del botón */}
			<ellipse cx={x} cy={tope - 30} rx={110 + 24 * pulso} ry={70 + 16 * pulso} fill={C.rojo} opacity={0.1 + 0.18 * pulso} />
			<ellipse cx={x} cy={piso - 4} rx={110} ry={14} fill={C.tinta} opacity={0.12} />
			<path
				d={`M ${x - 50} ${piso} L ${x - 34} ${tope + 20} L ${x + 34} ${tope + 20} L ${x + 50} ${piso} Z`}
				fill={C.grisCalido}
				{...trazo(gruesa)}
			/>
			<rect x={x - 84} y={tope} width={168} height={30} rx={8} fill={C.grisCalido} {...trazo(gruesa)} />
			<rect x={x - 64} y={tope - 14} width={128} height={18} rx={6} fill={C.tinta} />
			<path
				d={`M ${x - 56} ${tope - 8} L ${x - 56} ${tope - 8 - h * 0.45} Q ${x} ${tope - 8 - h * 1.55} ${x + 56} ${tope - 8 - h * 0.45} L ${x + 56} ${tope - 8} Z`}
				fill={C.rojo}
				{...trazo(gruesa)}
			/>
			<path
				d={`M ${x - 32} ${tope - 8 - h * 0.75} Q ${x - 14} ${tope - 8 - h * 1.05} ${x + 6} ${tope - 8 - h * 1.08}`}
				fill="none"
				stroke={C.blanco}
				strokeOpacity={0.6}
				strokeWidth={fina * 2}
				strokeLinecap="round"
			/>
		</g>
	);
};

/** Superficie del botón (para que la mano lo alcance). */
export const topeBoton = (hundido: number) => {
	const {x, piso} = OFICINA.boton;
	return {x, y: piso - 290 - 8 - 56 * (1 - 0.2 * hundido)};
};
