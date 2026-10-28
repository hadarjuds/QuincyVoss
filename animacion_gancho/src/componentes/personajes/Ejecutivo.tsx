import React from 'react';
import {C, D} from '../../estilo';
import {mezclarObj, Punto} from '../../util/anim';
import {trazo, useLinea} from '../Linea';
import {Boca, Brazo, Ceja, Ojo, PoseMano} from './partes';

export type ExpresionEjecutivo = {
	/** Párpado superior (0.5 = entrecerrados, muy seguro de sí mismo). */
	parpado: number;
	cejaIzq: number;
	cejaDer: number;
	ancho: number;
	abierto: number;
	sonrisa: number;
};

export const EXPRESIONES_EJECUTIVO = {
	seguro: {parpado: 0.5, cejaIzq: 0, cejaDer: 0, ancho: 24, abierto: 0, sonrisa: 0.25},
	confundido: {parpado: 0.3, cejaIzq: -2, cejaDer: 16, ancho: 18, abierto: 0, sonrisa: -0.35},
	satisfecho: {parpado: 0.55, cejaIzq: 2, cejaDer: 2, ancho: 28, abierto: 0, sonrisa: 0.6},
} satisfies Record<string, ExpresionEjecutivo>;

export type NombreExpresionEjecutivo = keyof typeof EXPRESIONES_EJECUTIVO;

export type BrazoPose = {objetivo: Punto; pose?: PoseMano; giroMano?: number; sostiene?: React.ReactNode};

/** Manos apoyadas en el escritorio (coordenadas locales con escala 0.8 y escritorio en y = 630). */
export const BRAZOS_EJECUTIVO_REPOSO = {
	izq: {objetivo: {x: -112, y: -292}, pose: 'puno'},
	der: {objetivo: {x: 112, y: -292}, pose: 'puno'},
} satisfies Record<string, BrazoPose>;

export const HOMBRO_EJECUTIVO = {izq: {x: -74, y: -592}, der: {x: 74, y: -592}};
export const BOCA_EJECUTIVO = {x: 0, y: -664};

export type PropsEjecutivo = {
	x: number;
	y: number;
	escala?: number;
	expresion?: NombreExpresionEjecutivo;
	hacia?: {expresion: NombreExpresionEjecutivo; t: number};
	/** Apertura extra de la boca al hablar (0 a 1). */
	habla?: number;
	mira?: Punto;
	parpadeo?: number;
	/** Inclinación de la cabeza en grados. */
	cabeza?: number;
	/** Inclinación del cuerpo desde la cadera, en grados. */
	cuerpo?: number;
	/** Escala vertical por respiración (1 a 1.01). */
	respiracion?: number;
	brazoIzq?: BrazoPose;
	brazoDer?: BrazoPose;
	/** Para dibujar los brazos encima del escritorio: 'cuerpo' sin brazos, 'brazos' solo brazos. */
	capa?: 'todo' | 'cuerpo' | 'brazos';
};

/**
 * Ejecutivo: alto y delgado, traje negro, corbata roja, sombrero de copa y
 * bigote. Origen: entre los pies.
 */
export const Ejecutivo: React.FC<PropsEjecutivo> = ({
	x,
	y,
	escala = 1,
	expresion = 'seguro',
	hacia,
	habla = 0,
	mira = {x: 0, y: 0},
	parpadeo = 0,
	cabeza = 0,
	cuerpo = 0,
	respiracion = 1,
	brazoIzq = BRAZOS_EJECUTIVO_REPOSO.izq,
	brazoDer = BRAZOS_EJECUTIVO_REPOSO.der,
	capa = 'todo',
}) => {
	const {gruesa, fina} = useLinea(escala);
	const e = hacia
		? mezclarObj(EXPRESIONES_EJECUTIVO[expresion], EXPRESIONES_EJECUTIVO[hacia.expresion], hacia.t)
		: EXPRESIONES_EJECUTIVO[expresion];
	const brazo = (b: BrazoPose, lado: 'izq' | 'der') => (
		<Brazo
			hombro={HOMBRO_EJECUTIVO[lado]}
			objetivo={b.objetivo}
			l1={168}
			l2={158}
			doblez={lado === 'izq' ? 1 : -1}
			grosor={34}
			colorSup={D.traje}
			colorInf={D.traje}
			punoCamisa
			pose={b.pose ?? 'abierta'}
			tamMano={36}
			giroMano={b.giroMano}
			espejo={lado === 'der'}
			lw={gruesa}
			sostiene={b.sostiene}
		/>
	);
	const conCuerpo = capa !== 'brazos';
	const conBrazos = capa !== 'cuerpo';
	return (
		<g transform={`translate(${x} ${y}) scale(${escala})`}>
			{conCuerpo ? (
				<>
					{/* Piernas */}
					<rect x={-44} y={-370} width={36} height={360} fill={D.traje} {...trazo(gruesa)} />
					<rect x={8} y={-370} width={36} height={360} fill={D.traje} {...trazo(gruesa)} />
					<ellipse cx={-30} cy={-10} rx={36} ry={13} fill={C.tinta} />
					<ellipse cx={30} cy={-10} rx={36} ry={13} fill={C.tinta} />
				</>
			) : null}
			{/* Torso y cabeza: respiran y se inclinan desde la cadera */}
			<g transform={`translate(0 -350) rotate(${cuerpo}) scale(1 ${respiracion}) translate(0 350)`}>
				{conCuerpo ? (
					<>
						{/* Cuello */}
						<rect x={-15} y={-652} width={30} height={50} fill={D.piel} {...trazo(gruesa)} />
						{/* Saco */}
						<path d="M -78 -600 Q -88 -470 -64 -338 L 64 -338 Q 88 -470 78 -600 Q 0 -626 -78 -600 Z" fill={D.traje} {...trazo(gruesa)} />
						<path d="M -32 -613 L 0 -515 L 32 -613 Z" fill={C.blanco} {...trazo(fina)} />
						<path d="M -11 -610 L 11 -610 L 8 -592 L -8 -592 Z" fill={C.rojo} {...trazo(fina)} />
						<path d="M -8 -592 L 8 -592 L 15 -508 L 0 -486 L -15 -508 Z" fill={C.rojo} {...trazo(fina)} />
						<path
							d="M -32 -613 L -14 -470 M 32 -613 L 14 -470"
							stroke={C.grisCalido}
							strokeWidth={fina}
							fill="none"
							strokeLinecap="round"
						/>
						<circle cx={0} cy={-440} r={6} fill={C.grisCalido} />
						<circle cx={0} cy={-400} r={6} fill={C.grisCalido} />
						<path d="M 34 -540 L 58 -540" stroke={C.blanco} strokeWidth={fina * 2} strokeLinecap="round" />
					</>
				) : null}
				{conBrazos ? brazo(brazoIzq, 'izq') : null}
				{conBrazos ? brazo(brazoDer, 'der') : null}
				{/* Cabeza (gira en el cuello) */}
				{conCuerpo ? (
					<g transform={`rotate(${cabeza} 0 -640)`}>
						<ellipse cx={-50} cy={-718} rx={11} ry={17} fill={D.piel} {...trazo(gruesa)} />
						<ellipse cx={50} cy={-718} rx={11} ry={17} fill={D.piel} {...trazo(gruesa)} />
						<ellipse cx={0} cy={-722} rx={50} ry={80} fill={D.piel} {...trazo(gruesa)} />
						{/* Patillas */}
						<path d="M -47 -760 L -47 -728 M 47 -760 L 47 -728" stroke={C.grisCalido} strokeWidth={fina * 2.4} strokeLinecap="round" />
						{[-20, 20].map((cx) => (
							<Ojo
								key={cx}
								cx={cx}
								cy={-738}
								rx={13}
								ry={12}
								mira={mira}
								pupila={0.55}
								parpado={Math.max(e.parpado, parpadeo)}
								colorParpado={D.piel}
								lw={fina * 1.2}
							/>
						))}
						<Ceja cx={-21} cy={-760 - e.cejaIzq} largo={28} angulo={-4 - e.cejaIzq * 0.6} grosor={fina * 2.4} />
						<Ceja cx={21} cy={-760 - e.cejaDer} largo={28} angulo={4 + e.cejaDer * 0.6} grosor={fina * 2.4} />
						{/* Nariz */}
						<path d="M -2 -730 Q 18 -706 6 -694 Q 0 -690 -6 -696" fill={D.piel} {...trazo(fina)} />
						<Boca
							cx={BOCA_EJECUTIVO.x}
							cy={BOCA_EJECUTIVO.y}
							ancho={e.ancho}
							abierto={Math.min(1, e.abierto + habla)}
							sonrisa={e.sonrisa}
							altoMax={11}
							lw={fina}
						/>
						{/* Bigote */}
						<path
							d="M 0 -688 Q -22 -700 -42 -686 Q -50 -676 -42 -670 Q -24 -679 0 -676 Q 24 -679 42 -670 Q 50 -676 42 -686 Q 22 -700 0 -688 Z"
							fill={C.tinta}
							stroke={C.tinta}
							strokeWidth={fina}
							strokeLinejoin="round"
						/>
						{/* Sombrero de copa */}
						<rect x={-48} y={-916} width={96} height={130} rx={6} fill={D.traje} {...trazo(gruesa)} />
						<rect x={-48} y={-822} width={96} height={24} fill={C.rojo} {...trazo(fina)} />
						<rect x={-76} y={-796} width={152} height={16} rx={8} fill={D.traje} {...trazo(gruesa)} />
					</g>
				) : null}
			</g>
		</g>
	);
};
