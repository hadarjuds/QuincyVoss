import React, {useId} from 'react';
import {C, D, FUENTE} from '../../estilo';
import {idSeguro} from '../../util/anim';
import {trazo, useLinea} from '../Linea';

export const REGLAS = [
	'Envía tu recibo en 14 días',
	'Regresa el formulario en 14 días',
	'Elige 3 fechas y aeropuertos en 30 días',
	'Hoover puede rechazar tus opciones',
	'…',
];

type Props = {
	/** Centro de la orilla de arriba (donde lo sujetan las manos). */
	x: number;
	y: number;
	ancho: number;
	/** Cuánto papel se ha desenrollado (px hacia abajo). */
	largo: number;
	/** Giro del cilindro en grados (las rayas avanzan al rodar). */
	giro: number;
	/** Separación entre reglas. */
	paso?: number;
};

/**
 * Pergamino: un rectángulo que crece hacia abajo y un cilindro en el borde.
 * El texto se revela con el desenrollado (clipPath).
 */
export const Pergamino: React.FC<Props> = ({x, y, ancho, largo, giro, paso = 150}) => {
	const {gruesa, fina} = useLinea();
	const id = idSeguro(useId());
	const radio = 26;
	const fin = y + largo;
	const fase = ((giro % 360) + 360) % 360;
	return (
		<g>
			<clipPath id={`pergamino-${id}`}>
				<rect x={x - ancho / 2} y={y} width={ancho} height={Math.max(0, largo)} />
			</clipPath>
			<rect x={x - ancho / 2} y={y} width={ancho} height={Math.max(0, largo)} fill={D.periodico} {...trazo(gruesa)} />
			<g clipPath={`url(#pergamino-${id})`}>
				<text x={x} y={y + 54} textAnchor="middle" fontFamily={FUENTE.cifras} fontSize={30} fill={C.rojo}>
					REGLAS
				</text>
				{REGLAS.map((r, i) => {
					const ry = y + 120 + i * paso;
					const palabras = r.split(' ');
					const mitad = Math.ceil(palabras.length / 2);
					const lineas = r.length > 22 ? [palabras.slice(0, mitad).join(' '), palabras.slice(mitad).join(' ')] : [r];
					return (
						<g key={i}>
							{r !== '…' ? (
								<text x={x - ancho / 2 + 26} y={ry + 6} fontFamily={FUENTE.cifras} fontSize={26} fill={C.grisCalido}>
									{i + 1}.
								</text>
							) : null}
							{lineas.map((l, j) => (
								<text
									key={j}
									x={x + 16}
									y={ry + j * 32}
									textAnchor="middle"
									fontFamily={FUENTE.texto}
									fontWeight={600}
									fontSize={25}
									fill={C.tinta}
								>
									{l}
								</text>
							))}
							<line
								x1={x - ancho / 2 + 24}
								y1={ry + paso / 2 + 4}
								x2={x + ancho / 2 - 24}
								y2={ry + paso / 2 + 4}
								stroke={C.grisCalido}
								strokeOpacity={0.4}
								strokeWidth={fina}
								strokeDasharray="3 8"
							/>
						</g>
					);
				})}
			</g>
			{/* Cilindro */}
			<g>
				<rect
					x={x - ancho / 2 - 14}
					y={fin - radio}
					width={ancho + 28}
					height={radio * 2}
					rx={radio}
					fill={D.periodico}
					{...trazo(gruesa)}
				/>
				{[0, 1, 2].map((i) => {
					const a = ((fase + i * 120) * Math.PI) / 180;
					const yy = fin + Math.sin(a) * radio * 0.8;
					return Math.cos(a) > 0 ? (
						<line
							key={i}
							x1={x - ancho / 2}
							y1={yy}
							x2={x + ancho / 2}
							y2={yy}
							stroke={C.grisCalido}
							strokeWidth={fina}
							strokeOpacity={0.7}
						/>
					) : null;
				})}
				<ellipse cx={x - ancho / 2 - 14 + radio * 0.3} cy={fin} rx={radio * 0.3} ry={radio} fill={D.bolsa} {...trazo(fina)} />
				<ellipse cx={x + ancho / 2 + 14 - radio * 0.3} cy={fin} rx={radio * 0.3} ry={radio} fill={D.bolsa} {...trazo(fina)} />
			</g>
		</g>
	);
};
