import React from 'react';
import {useCurrentFrame} from 'remotion';
import {aPantalla, CAMARA_GENERAL} from '../componentes/Camara';
import {Globo} from '../componentes/Globo';
import {BotonRojo, Letrero, OFICINA, topeBoton} from '../componentes/objetos/Oficina';
import {Cartera} from '../componentes/objetos/Telefono';
import {BRAZOS_EJECUTIVO_REPOSO} from '../componentes/personajes/Ejecutivo';
import {
	BRAZOS_CON_CALCULADORA,
	BRAZOS_CRUZADOS,
	EXPRESIONES_ESPECIALISTA,
	expresionEspecialista,
} from '../componentes/personajes/Especialista';
import {C, FUENTE} from '../estilo';
import {PLANOS} from '../timing';
import {entre, mezclar, mezclarPunto, Punto, RESORTE, resorte, temblor} from '../util/anim';
import {BOCA_EJE_MUNDO, BOCA_ESP_MUNDO, CAM_EJECUTIVO, CAM_ESPECIALISTA, EscenaOficina, habla, localEjecutivo} from './Oficina1';

const mezclarBrazo = (a: {objetivo: Punto}, b: {objetivo: Punto}, t: number) => mezclarPunto(a.objetivo, b.objetivo, t);

/** Plano 14: el especialista cierra la calculadora de golpe y se cruza de brazos. */
export const Plano14: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p14.claves;
	const tapa = entre(f, K.tapa, K.tapaFin, [1, 0], (t) => t * t);
	const cruza = resorte(f, K.brazos, RESORTE.elastico);
	const clac = f >= K.tapaFin && f < K.tapaFin + 5 ? 1 - (f - K.tapaFin) / 5 : 0;
	const boca = aPantalla(BOCA_ESP_MUNDO, CAM_ESPECIALISTA);
	const calc = OFICINA.especialista;
	return (
		<EscenaOficina
			camara={CAM_ESPECIALISTA}
			semilla="p14"
			especialista={{
				expresion: {...EXPRESIONES_ESPECIALISTA.serio, abierto: habla(f, K.globo, K.globo + 34) * 0.7},
				mira: {x: 0.9, y: -0.3},
				calculadora: {x: 0, y: -300, tapa, pantalla: '600'},
				brazoIzq: {
					...BRAZOS_CON_CALCULADORA.izq,
					objetivo: mezclarBrazo(BRAZOS_CON_CALCULADORA.izq, BRAZOS_CRUZADOS.izq, cruza),
					pose: cruza > 0.5 ? 'puno' : 'sujeta',
				},
				brazoDer: {
					...BRAZOS_CON_CALCULADORA.der,
					objetivo: mezclarBrazo(BRAZOS_CON_CALCULADORA.der, BRAZOS_CRUZADOS.der, cruza),
					pose: cruza > 0.5 ? 'puno' : 'sujeta',
				},
				derechoAtras: true,
			}}
			encima={
				clac > 0 ? (
					<g stroke={C.tinta} strokeWidth={3} strokeLinecap="round" opacity={clac}>
						{[-60, -30, 0, 30, 60].map((a) => {
							const r = ((a - 90) * Math.PI) / 180;
							const cx = calc.x;
							const cy = calc.y + (-300 - 95) * calc.escala;
							return (
								<line
									key={a}
									x1={cx + Math.cos(r) * 60}
									y1={cy + Math.sin(r) * 30}
									x2={cx + Math.cos(r) * 100}
									y2={cy + Math.sin(r) * 60}
								/>
							);
						})}
					</g>
				) : null
			}
		>
			<Globo
				x={1120}
				y={470}
				lado="abajo"
				ancla={0.1}
				texto="No voy a cubrir esto."
				desde={K.globo}
				cola={{x: boca.x + 74, y: boca.y - 6}}
			/>
		</EscenaOficina>
	);
};

/** Plano 15: el ejecutivo no entiende: ceja arriba, cabeza ladeada y un «?» sobre el sombrero. */
export const Plano15: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p15.claves;
	const ladea = resorte(f, K.ceja, RESORTE.suave);
	const pregunta = resorte(f, K.interrogacion, RESORTE.elastico);
	const boca = aPantalla(BOCA_EJE_MUNDO, CAM_EJECUTIVO);
	return (
		<EscenaOficina
			camara={CAM_EJECUTIVO}
			semilla="p15"
			ejecutivo={{
				cabeza: 10 * ladea,
				expresion: 'seguro',
				hacia: {expresion: 'confundido', t: entre(f, K.ceja, K.ceja + 6, [0, 1])},
				habla: habla(f, K.globo, K.globo + 26) * 0.6,
				mira: {x: -0.6, y: 0.2},
			}}
			encima={
				f >= K.interrogacion ? (
					<text
						x={1190}
						y={176 + Math.sin(f / 6) * 3}
						textAnchor="middle"
						fontFamily={FUENTE.cifras}
						fontSize={52}
						fill={C.rojo}
						stroke={C.tinta}
						strokeWidth={2}
						paintOrder="stroke"
						transform={`translate(1190 160) scale(${pregunta}) rotate(${12 * (1 - pregunta)}) translate(-1190 -160)`}
					>
						?
					</text>
				) : null
			}
		>
			<Globo x={800} y={330} lado="abajo" ancla={0.65} texto="¿Tan mala es la oferta?" desde={K.globo} cola={{x: boca.x - 40, y: boca.y}} />
		</EscenaOficina>
	);
};

/** Plano 16: serio con la primera frase; en la segunda saca su cartera con entusiasmo. */
export const Plano16: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p16.claves;
	const cambio = entre(f, K.cambio, K.cambio + 6, [0, 1]);
	const brillo = resorte(f, K.brillo, RESORTE.elastico);
	const expresion = {
		...expresionEspecialista('serio', 'sonriente', cambio),
		brillo: brillo * cambio,
	};
	const hablando = habla(f, K.globo, K.globo + 30) + habla(f, K.cambio, K.cambio + 55);
	expresion.abierto = Math.min(1, expresion.abierto + hablando * 0.5);

	// La mano derecha baja al bolsillo y sube con la cartera (spring).
	const baja = entre(f, K.cartera, K.cartera + 6, [0, 1]);
	const sube = resorte(f, K.cartera + 6, RESORTE.elastico);
	const bolsillo = {x: 116, y: -196};
	const arriba = {x: 150, y: -392};
	let objetivoDer = mezclarPunto(BRAZOS_CRUZADOS.der.objetivo, bolsillo, baja);
	if (f >= K.cartera + 6) objetivoDer = mezclarPunto(bolsillo, arriba, sube);
	const conCartera = f >= K.cartera + 6;
	const boca = aPantalla(BOCA_ESP_MUNDO, CAM_ESPECIALISTA);
	return (
		<EscenaOficina
			camara={CAM_ESPECIALISTA}
			semilla="p16"
			especialista={{
				expresion,
				giroBrillo: f * 5,
				mira: {x: 0.8, y: -0.4},
				calculadora: {x: 0, y: -300, tapa: 0, pantalla: '600'},
				brazoIzq: {...BRAZOS_CRUZADOS.izq},
				brazoDer: {
					objetivo: objetivoDer,
					pose: conCartera ? 'sujeta' : 'puno',
					giroMano: conCartera ? -40 : 0,
					sostiene: conCartera ? (
						<g transform="translate(18 -46) rotate(-12)">
							<Cartera escala={1} />
						</g>
					) : undefined,
				},
				derechoAtras: f < K.cartera,
			}}
		>
			<Globo
				x={1120}
				y={470}
				lado="abajo"
				ancla={0.1}
				texto="Para ustedes, sí."
				desde={K.globo}
				hasta={K.cambio}
				cola={{x: boca.x + 74, y: boca.y - 6}}
			/>
			<Globo
				x={1120}
				y={470}
				lado="abajo"
				ancla={0.1}
				texto="¿Dónde compro la aspiradora?"
				desde={K.cambio}
				cola={{x: boca.x + 74, y: boca.y - 6}}
			/>
		</EscenaOficina>
	);
};

// ---------------------------------------------------------------------------
// Planos 17 y 18: el letrero y el botón.

/** Punto (mundo) donde la mano queda «a centímetros» del botón, y donde lo aprieta. */
const manoSobreBoton = (hundido: number, separacion: number) => {
	const t = topeBoton(hundido);
	return {x: t.x + 30, y: t.y - 26 - separacion};
};

/** Brazo izquierdo del ejecutivo apuntando al botón con el dedo. */
const brazoAlBoton = (objetivoMundo: Punto, t: number) => ({
	objetivo: mezclarPunto(BRAZOS_EJECUTIVO_REPOSO.izq.objetivo, localEjecutivo(objetivoMundo), t),
	pose: t > 0.15 ? ('senala' as const) : ('puno' as const),
	giroMano: mezclar(0, 25, t),
});

/** Plano 17: aparece el letrero y el botón; el especialista niega y el ejecutivo acerca la mano muy despacio. */
export const Plano17: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p17.claves;
	const cae = resorte(f, K.letrero, {damping: 8, stiffness: 140, mass: 0.9});
	const aparece = resorte(f, K.letrero + 6, RESORTE.elastico);
	const pulso = 0.5 + 0.5 * Math.sin((f / 30) * Math.PI * 1.6);

	const voltean = entre(f, K.voltean, K.voltean + 6, [0, 1]);
	const niega = entre(f, K.niega, K.niega + 6, [0, 1]);
	const u = entre(f, K.niega + 4, K.niegaFin, [0, 1], (t) => t);
	const giroCabeza = f >= K.niega + 4 && f <= K.niegaFin ? 12 * Math.sin(u * Math.PI * 6) * Math.min(1, (1 - u) * 4) : 0;

	const acerca = entre(f, K.mano, PLANOS.p17.duracion, [0, 1]);
	const brazoIzq = brazoAlBoton(manoSobreBoton(0, 46), acerca);
	const miraEsp = niega > 0 ? {x: 1, y: -0.45} : {x: mezclar(0.8, 0.9, voltean), y: mezclar(-0.4, 0.3, voltean)};
	return (
		<EscenaOficina
			camara={CAMARA_GENERAL}
			semilla="p17"
			ejecutivo={{
				mira: {x: mezclar(-0.8, -1, voltean), y: mezclar(0.3, 0.8, voltean)},
				cabeza: -6 * voltean,
				cuerpo: -5 * acerca,
				expresion: 'seguro',
				hacia: {expresion: 'satisfecho', t: acerca},
				brazoIzq,
			}}
			especialista={{
				mira: miraEsp,
				cabeza: giroCabeza,
				expresion: expresionEspecialista('calmado', 'indignado', niega),
				calculadora: {x: 0, y: -300, tapa: 0, pantalla: '600'},
			}}
			enPared={<Letrero dy={mezclar(-560, 0, cae)} brillo={1} />}
			delante={
				<g
					transform={`translate(${OFICINA.boton.x} ${OFICINA.boton.piso}) scale(${aparece}) translate(${-OFICINA.boton.x} ${-OFICINA.boton.piso})`}
				>
					<BotonRojo hundido={0} pulso={pulso} />
				</g>
			}
		/>
	);
};

/** Plano 18: el ejecutivo aprieta el botón y el especialista pone los ojos en blanco. Corte a negro. */
export const Plano18: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p18.claves;
	const hundido = entre(f, K.presiona, K.presiona + 6, [0, 1]);
	const separacion = mezclar(46, 0, entre(f, K.presiona, K.presiona + 6, [0, 1]));
	const parpadea = f >= K.parpadeo && f < K.parpadeo + 4 ? 0.1 : 1;
	const blanco = entre(f, K.ojosBlanco, K.ojosBlanco + 8, [0, 1]);
	const hombros = 16 * resorte(f, K.ojosBlanco + 2, RESORTE.suave);
	const clic = f >= K.clic && f < K.clic + 6 ? 1 - (f - K.clic) / 6 : 0;
	const tope = topeBoton(hundido);
	const pulso = 0.5 + 0.5 * Math.sin(((f + PLANOS.p17.duracion) / 30) * Math.PI * 1.6);

	if (f >= K.negro) return <div style={{position: 'absolute', inset: 0, backgroundColor: '#000000'}} />;

	return (
		<EscenaOficina
			camara={CAMARA_GENERAL}
			semilla="p18"
			ejecutivo={{
				mira: {x: -1, y: 0.8},
				cabeza: -6,
				cuerpo: -5,
				expresion: 'satisfecho',
				brazoIzq: brazoAlBoton(manoSobreBoton(hundido, separacion), 1),
			}}
			especialista={{
				mira: {x: 1, y: -0.45},
				expresion: expresionEspecialista('indignado', 'ojosEnBlanco', blanco),
				hombros,
				parpadeo: 0,
				calculadora: {x: 0, y: -300 + hombros * 0.8, tapa: 0, pantalla: '600'},
				brazoIzq: {...BRAZOS_CON_CALCULADORA.izq, objetivo: {x: -84, y: -300 + hombros * 0.8}},
				brazoDer: {...BRAZOS_CON_CALCULADORA.der, objetivo: {x: 84, y: -300 + hombros * 0.8}},
				temblor: blanco > 0 && blanco < 1 ? temblor(f, 'p18', 0.6) : {x: 0, y: 0},
			}}
			enPared={<Letrero dy={0} brillo={parpadea} />}
			delante={<BotonRojo hundido={hundido} pulso={pulso} />}
			encima={
				clic > 0 ? (
					<g stroke={C.tinta} strokeWidth={4} strokeLinecap="round" opacity={clic}>
						{[-150, -120, -60, -30].map((a) => {
							const r = (a * Math.PI) / 180;
							return (
								<line
									key={a}
									x1={tope.x + Math.cos(r) * 80}
									y1={tope.y + 10 + Math.sin(r) * 50}
									x2={tope.x + Math.cos(r) * 120}
									y2={tope.y + 10 + Math.sin(r) * 80}
								/>
							);
						})}
					</g>
				) : null
			}
		/>
	);
};
