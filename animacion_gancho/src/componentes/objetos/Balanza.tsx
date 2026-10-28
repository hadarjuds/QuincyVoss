import React from 'react';
import {C, FUENTE} from '../../estilo';
import {Punto} from '../../util/anim';
import {trazo, useLinea} from '../Linea';

/** Medidas de la balanza: el plato toca el piso justo con la viga a 28°. */
export const BALANZA = {
	largo: 330,
	colgado: 335,
	/** Media anchura del plato. */
	plato: 130,
	/** Profundidad del plato bajo la orilla. */
	fondo: 40,
};

/** Centro de la orilla del plato (donde se apoyan las cosas). */
export const superficiePlato = (pivote: Punto, angulo: number, lado: 'izq' | 'der'): Punto => {
	const r = (angulo * Math.PI) / 180;
	const s = lado === 'izq' ? -1 : 1;
	return {
		x: pivote.x + s * BALANZA.largo * Math.cos(r),
		y: pivote.y + s * BALANZA.largo * Math.sin(r) + BALANZA.colgado,
	};
};

type Props = {
	pivote: Punto;
	suelo: number;
	/** Ángulo de la viga en grados: negativo baja el plato izquierdo, positivo el derecho. */
	angulo: number;
	contenidoIzq?: React.ReactNode;
	contenidoDer?: React.ReactNode;
	/** Aplastamiento del plato derecho al tocar el piso (1 = normal). */
	aplastaDer?: number;
};

/** Balanza de dos platos de latón (mostaza). Los platos siempre cuelgan derechos. */
export const Balanza: React.FC<Props> = ({pivote, suelo, angulo, contenidoIzq, contenidoDer, aplastaDer = 1}) => {
	const {gruesa, fina} = useLinea();
	const {largo, colgado, plato, fondo} = BALANZA;
	const r = (angulo * Math.PI) / 180;
	const extremo = (s: number) => ({x: pivote.x + s * largo * Math.cos(r), y: pivote.y + s * largo * Math.sin(r)});

	const platoEn = (s: -1 | 1, contenido: React.ReactNode, aplasta: number) => {
		const e = extremo(s);
		const sup = {x: e.x, y: e.y + colgado};
		return (
			<g>
				<path
					d={`M ${sup.x - plato + 8} ${sup.y} L ${e.x} ${e.y} L ${sup.x + plato - 8} ${sup.y}`}
					fill="none"
					stroke={C.grisCalido}
					strokeWidth={fina}
				/>
				<g transform={`translate(${sup.x} ${sup.y})`}>{contenido}</g>
				<g transform={`translate(${sup.x} ${sup.y}) scale(${1 + (1 - aplasta) * 0.6} ${aplasta})`}>
					<path d={`M ${-plato} 0 Q 0 ${fondo * 2} ${plato} 0 Z`} fill={C.mostaza} {...trazo(gruesa)} />
					<path
						d={`M ${-plato * 0.7} ${fondo * 0.35} Q 0 ${fondo * 1.1} ${plato * 0.7} ${fondo * 0.35}`}
						fill="none"
						stroke={C.blanco}
						strokeOpacity={0.5}
						strokeWidth={fina}
					/>
				</g>
				<circle cx={e.x} cy={e.y} r={9} fill={C.mostaza} {...trazo(fina)} />
			</g>
		);
	};

	return (
		<g>
			{/* Base y poste */}
			<path
				d={`M ${pivote.x - 110} ${suelo} Q ${pivote.x - 100} ${suelo - 40} ${pivote.x - 40} ${suelo - 46} L ${pivote.x + 40} ${suelo - 46} Q ${pivote.x + 100} ${suelo - 40} ${pivote.x + 110} ${suelo} Z`}
				fill={C.mostaza}
				{...trazo(gruesa)}
			/>
			<rect x={pivote.x - 16} y={pivote.y} width={32} height={suelo - 46 - pivote.y} fill={C.mostaza} {...trazo(gruesa)} />
			<line
				x1={pivote.x - 4}
				y1={pivote.y + 30}
				x2={pivote.x - 4}
				y2={suelo - 60}
				stroke={C.blanco}
				strokeOpacity={0.45}
				strokeWidth={fina}
			/>
			{/* Viga */}
			<g transform={`rotate(${angulo} ${pivote.x} ${pivote.y})`}>
				<rect
					x={pivote.x - largo - 14}
					y={pivote.y - 12}
					width={(largo + 14) * 2}
					height={24}
					rx={12}
					fill={C.mostaza}
					{...trazo(gruesa)}
				/>
			</g>
			{/* Fiel (aguja) */}
			<g transform={`rotate(${angulo} ${pivote.x} ${pivote.y})`}>
				<path
					d={`M ${pivote.x - 10} ${pivote.y} L ${pivote.x} ${pivote.y - 70} L ${pivote.x + 10} ${pivote.y} Z`}
					fill={C.rojo}
					{...trazo(fina)}
				/>
			</g>
			<circle cx={pivote.x} cy={pivote.y} r={22} fill={C.mostaza} {...trazo(gruesa)} />
			<circle cx={pivote.x} cy={pivote.y} r={6} fill={C.tinta} />
			{platoEn(-1, contenidoIzq, 1)}
			{platoEn(1, contenidoDer, aplastaDer)}
		</g>
	);
};

// ---------------------------------------------------------------------------

/** Silueta de avión simple apuntando a la derecha (tam ≈ ancho/2). */
export const Avion: React.FC<{x: number; y: number; tam: number; color: string; giro?: number; lw?: number; contorno?: string}> = ({
	x,
	y,
	tam,
	color,
	giro = 0,
	lw = 0,
	contorno = C.tinta,
}) => (
	<g transform={`translate(${x} ${y}) rotate(${giro}) scale(${tam / 50})`}>
		<path
			d="M -50 -4 Q -50 -10 -40 -10 L 36 -10 Q 52 -8 54 0 Q 52 8 36 10 L -40 10 Q -50 10 -50 4 Z M -6 -8 L 14 -8 L -14 -46 L -26 -46 Z M -6 8 L 14 8 L -14 46 L -26 46 Z M -46 -8 L -34 -8 L -44 -28 L -52 -28 Z"
			fill={color}
			stroke={lw > 0 ? contorno : 'none'}
			strokeWidth={lw * (50 / tam)}
			strokeLinejoin="round"
		/>
	</g>
);

/** Billete de £100. Origen: centro de la orilla de abajo. */
export const Billete: React.FC<{escala?: number; giro?: number}> = ({escala = 1, giro = 0}) => {
	const {gruesa, fina} = useLinea(escala);
	const w = 230;
	const h = 112;
	return (
		<g transform={`rotate(${giro}) scale(${escala}) translate(0 ${-h / 2})`}>
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={C.verdeBillete} {...trazo(gruesa)} />
			<rect
				x={-w / 2 + 12}
				y={-h / 2 + 12}
				width={w - 24}
				height={h - 24}
				rx={4}
				fill="none"
				stroke={C.papel}
				strokeOpacity={0.7}
				strokeWidth={fina}
			/>
			<ellipse cx={-62} cy={0} rx={28} ry={34} fill={C.papel} fillOpacity={0.35} stroke={C.papel} strokeOpacity={0.8} strokeWidth={fina} />
			<text x={-62} y={14} textAnchor="middle" fontFamily={FUENTE.cifras} fontSize={38} fill={C.papel}>
				£
			</text>
			<text
				x={36}
				y={18}
				textAnchor="middle"
				fontFamily={FUENTE.cifras}
				fontSize={52}
				fill={C.papel}
				stroke={C.tinta}
				strokeWidth={fina}
				paintOrder="stroke"
			>
				£100
			</text>
		</g>
	);
};

/** Boleto de avión con destino «USA». Origen: centro de la orilla de abajo. */
export const Boleto: React.FC<{escala?: number; giro?: number}> = ({escala = 1, giro = 0}) => {
	const {gruesa, fina} = useLinea(escala);
	const w = 220;
	const h = 92;
	return (
		<g transform={`rotate(${giro}) scale(${escala}) translate(0 ${-h / 2})`}>
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={C.azulCielo} {...trazo(gruesa)} />
			<line x1={w / 2 - 54} y1={-h / 2 + 8} x2={w / 2 - 54} y2={h / 2 - 8} stroke={C.tinta} strokeWidth={fina} strokeDasharray="6 7" />
			<Avion x={-62} y={0} tam={30} color={C.tinta} giro={-18} />
			<text x={8} y={16} textAnchor="middle" fontFamily={FUENTE.cifras} fontSize={44} fill={C.tinta}>
				USA
			</text>
			<rect x={w / 2 - 42} y={-26} width={28} height={52} rx={3} fill={C.blanco} fillOpacity={0.6} />
			{[0, 1, 2, 3, 4].map((i) => (
				<line key={i} x1={w / 2 - 38} y1={-20 + i * 10} x2={w / 2 - 18} y2={-20 + i * 10} stroke={C.tinta} strokeWidth={fina * 0.8} />
			))}
		</g>
	);
};

/** Etiqueta colgante «£600»: cuelga de (0, 0) con un hilo y gira como péndulo. */
export const EtiquetaPrecio: React.FC<{hilo: number; angulo: number}> = ({hilo, angulo}) => {
	const {gruesa, fina} = useLinea();
	return (
		<g transform={`rotate(${angulo})`}>
			<line x1={0} y1={0} x2={0} y2={hilo + 18} stroke={C.tinta} strokeWidth={fina} />
			<g transform={`translate(0 ${hilo})`}>
				<path d="M -34 0 L 34 0 L 88 38 L 88 118 L -88 118 L -88 38 Z" fill={C.blanco} {...trazo(gruesa)} />
				<circle cx={0} cy={18} r={7} fill={C.papel} {...trazo(fina)} />
				<text x={0} y={98} textAnchor="middle" fontFamily={FUENTE.cifras} fontSize={52} fill={C.rojo}>
					£600
				</text>
			</g>
		</g>
	);
};
