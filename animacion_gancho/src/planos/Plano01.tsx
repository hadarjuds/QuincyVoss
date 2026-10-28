import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Lienzo} from '../componentes/Camara';
import {trazo, useLinea} from '../componentes/Linea';
import {Coladera, Telefono, useRecorteColadera} from '../componentes/objetos/Telefono';
import {Mano} from '../componentes/personajes/Mano';
import {C, D} from '../estilo';
import {PLANOS} from '../timing';
import {entre, entrada, mezclar, RESORTE, resorte, temblor} from '../util/anim';

const K = PLANOS.p01.claves;
const X = 960;
const COLADERA_Y = 880;
const PISO_Y = 780;

/** Plano 1: una mano con guante deja caer un teléfono que se cuela por la coladera. */
export const Plano01: React.FC = () => {
	const f = useCurrentFrame();
	const {gruesa} = useLinea();
	const recorte = useRecorteColadera(X, COLADERA_Y + 4);

	// Mano: entra desde arriba con spring y se queda.
	const manoY = mezclar(-420, 230, resorte(f, K.manoEntra, RESORTE.elastico));
	const abre = entre(f, K.telefonoGira, K.telefonoGira + 4, [0, 1]);
	const vibra = f >= K.telefonoGira && f < K.telefonoGira + 14 ? temblor(f, 'mano', 2.2).x : 0;

	// Teléfono.
	const sujeto = manoY + 212;
	const sujetoFinal = 230 + 212;
	const impacto = COLADERA_Y - 104;
	let y = sujeto;
	let giro = 0;
	let ancho = 1;
	let aplasta = 1;
	if (f >= K.telefonoGira && f < K.rebote) {
		// Cae con aceleración.
		y = mezclar(sujetoFinal, impacto, entre(f, K.telefonoGira, K.rebote, [0, 1], entrada));
		giro = entre(f, K.telefonoGira, K.telefonoGira + 6, [0, -15]);
	} else if (f >= K.rebote && f < K.seCuela) {
		// Rebota una vez en la rejilla, con un leve aplastamiento al tocar.
		const u = (f - K.rebote) / (K.seCuela - K.rebote);
		y = impacto - 4 * 64 * u * (1 - u);
		giro = mezclar(-15, -6, u);
		aplasta = 1 - 0.14 * Math.max(0, 1 - (f - K.rebote) / 3);
	} else if (f >= K.seCuela) {
		// Se pone de canto y se cuela entre las rendijas.
		const u = entre(f, K.seCuela, K.desaparece, [0, 1], entrada);
		ancho = entre(f, K.seCuela, K.seCuela + 4, [1, 0.18]);
		giro = entre(f, K.seCuela, K.seCuela + 4, [-6, 0]);
		y = impacto + u * 260;
		aplasta = 1 - 0.1 * Math.max(0, 1 - (f - K.seCuela) / 3);
	}

	return (
		<AbsoluteFill>
			<Lienzo>
				{/* Banqueta */}
				<rect x={-10} y={PISO_Y} width={1940} height={400} fill={D.piso} />
				<line x1={-10} y1={PISO_Y} x2={1930} y2={PISO_Y} {...trazo(gruesa)} />
				{[300, 760, 1160, 1620].map((x) => (
					<line key={x} x1={x} y1={PISO_Y} x2={x - 60} y2={1080} stroke={C.grisCalido} strokeWidth={gruesa * 0.5} />
				))}
				<Coladera x={X} y={COLADERA_Y} capa="fondo" />
				<Coladera x={X} y={COLADERA_Y} capa="rejilla" />
				{recorte.def}
				<g clipPath={recorte.url}>
					<Telefono x={X + vibra * 0.5} y={y} giro={giro} ancho={ancho} aplasta={aplasta} />
				</g>
				<Mano x={X} y={manoY} abre={abre} vibra={vibra} />
			</Lienzo>
		</AbsoluteFill>
	);
};
