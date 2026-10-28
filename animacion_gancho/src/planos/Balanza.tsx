import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Lienzo} from '../componentes/Camara';
import {trazo, useLinea} from '../componentes/Linea';
import {Balanza, BALANZA, Billete, Boleto, EtiquetaPrecio, superficiePlato} from '../componentes/objetos/Balanza';
import {Aspiradora} from '../componentes/personajes/Aspiradora';
import {Rotulo} from '../componentes/Rotulo';
import {C, D, FUENTE} from '../estilo';
import {PLANOS} from '../timing';
import {entrada, entre, mezclar, oscilacion, parpadeo, Punto, RESORTE, resorte} from '../util/anim';

const PIVOTE = {x: 960, y: 330};
const SUELO = 860;
const ASPIRADORA = {x: 1590, escala: 0.5};
const CAIDA = 10; // frames que tarda en caer cada cosa
const BOLETOS = [
	{dx: -40, giro: -5, alto: 0},
	{dx: -28, giro: 7, alto: -26},
];

/** Desplazamiento vertical de algo que cae desde arriba del cuadro hasta el plato (0 al llegar). */
const caida = (f: number, inicio: number, desdeY: number) =>
	f < inicio ? null : mezclar(desdeY, 0, entre(f, inicio, inicio + CAIDA, [0, 1], entrada));

const Piso: React.FC = () => {
	const {gruesa} = useLinea();
	return (
		<>
			<rect x={-10} y={SUELO} width={1940} height={300} fill={D.piso} />
			<line x1={-10} y1={SUELO} x2={1930} y2={SUELO} {...trazo(gruesa)} />
		</>
	);
};

const NotaDolares: React.FC<{plato: Punto; opacidad: number}> = ({plato, opacidad}) => (
	<text
		x={plato.x}
		y={plato.y + BALANZA.fondo + 70}
		textAnchor="middle"
		fontFamily={FUENTE.texto}
		fontWeight={600}
		fontSize={30}
		fill={C.tinta}
		opacity={opacidad}
	>
		≈ $150 de entonces
	</text>
);

const BoletosEnPlato: React.FC<{offsets: (number | null)[]}> = ({offsets}) => (
	<>
		{BOLETOS.map((b, i) =>
			offsets[i] === null ? null : (
				<g key={i} transform={`translate(${b.dx} ${b.alto + (offsets[i] ?? 0)})`}>
					<Boleto escala={0.72} giro={b.giro} />
				</g>
			),
		)}
	</>
);

/** Plano 5: la balanza; de un lado cae el billete de £100, del otro los dos boletos. */
export const Plano05: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p05.claves;

	const aparece = resorte(f, K.balanza, RESORTE.suave);
	const llegaBillete = K.billete + CAIDA;
	const llegaBoleto1 = K.boleto1 + CAIDA;
	const llegaBoleto2 = K.boleto2 + CAIDA;
	// El billete baja el plato izquierdo (−6°) con rebote; los boletos lo regresan a nivel con oscilación amortiguada.
	const angulo =
		-6 * resorte(f, llegaBillete, RESORTE.elastico) +
		6 * resorte(f, llegaBoleto1, {damping: 3.5, stiffness: 70, mass: 1}) +
		oscilacion(f, llegaBoleto2, 1.6, 1.3, 1.8);

	const izq = superficiePlato(PIVOTE, angulo, 'izq');
	const billete = caida(f, K.billete, -izq.y - 150);
	const boletos = [caida(f, K.boleto1, -700), caida(f, K.boleto2, -700)];
	const giroBillete = f < llegaBillete ? mezclar(-12, 0, entre(f, K.billete, llegaBillete, [0, 1])) : 0;

	// La aspiradora mira lo que va cayendo.
	const mira =
		f < K.billete
			? {x: -0.7, y: 0}
			: f < K.boleto1
				? {x: -1, y: entre(f, K.billete, llegaBillete, [-0.6, 0.5])}
				: {x: -0.5, y: entre(f, K.boleto1, llegaBoleto2, [-0.6, 0.4])};

	return (
		<AbsoluteFill>
			<Lienzo>
				<Piso />
				<g opacity={Math.min(1, aparece * 1.4)} transform={`translate(960 600) scale(${0.9 + 0.1 * aparece}) translate(-960 -600)`}>
					<Balanza
						pivote={PIVOTE}
						suelo={SUELO}
						angulo={angulo}
						contenidoIzq={
							billete === null ? null : (
								<g transform={`translate(0 ${billete})`}>
									<Billete giro={giroBillete} />
								</g>
							)
						}
						contenidoDer={<BoletosEnPlato offsets={boletos} />}
					/>
					<NotaDolares plato={izq} opacidad={entre(f, K.nota, K.nota + 8, [0, 1])} />
				</g>
				<Aspiradora x={ASPIRADORA.x} y={SUELO} escala={ASPIRADORA.escala} mira={mira} parpadeo={parpadeo(f, 'p05')} />
			</Lienzo>
			<Rotulo texto="Hoover · Reino Unido · finales de 1992" desde={K.rotulo} />
		</AbsoluteFill>
	);
};

/** Plano 6: cae la etiqueta «£600», la balanza se inclina y la aspiradora brinca al plato. */
export const Plano06: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p06.claves;

	const angulo = 18 * resorte(f, K.inclina, RESORTE.rigido) + 10 * resorte(f, K.aterriza, RESORTE.rigido);
	const golpe = Math.max(0, 1 - Math.abs(f - K.aterriza - 1) / 4);
	const aplastaDer = 1 - 0.16 * golpe;
	const izq = superficiePlato(PIVOTE, angulo, 'izq');
	const der = superficiePlato(PIVOTE, angulo, 'der');

	// Etiqueta: cuelga de la viga, un poco hacia dentro, y se balancea como péndulo.
	const r = (angulo * Math.PI) / 180;
	const anclaEtiqueta = {x: PIVOTE.x + 0.8 * BALANZA.largo * Math.cos(r), y: PIVOTE.y + 0.8 * BALANZA.largo * Math.sin(r)};
	const llegaEtiqueta = K.etiqueta + 8;
	const caeEtiqueta = f < K.etiqueta ? null : mezclar(-900, 0, entre(f, K.etiqueta, llegaEtiqueta, [0, 1], entrada));
	const pendulo =
		oscilacion(f, llegaEtiqueta, 28, 1.1, 1.5) + oscilacion(f, K.inclina, -10, 1.1, 1.8) + oscilacion(f, K.aterriza, -8, 1.3, 2);

	// Saltito del billete por el impulso.
	const salto = f >= K.aterriza && f < K.aterriza + 12 ? -46 * Math.sin(((f - K.aterriza) / 12) * Math.PI) : 0;

	// Aspiradora: se agacha, brinca en arco y cae en el plato derecho.
	const pos = {x: ASPIRADORA.x, y: SUELO};
	const destino = {x: der.x + 62, y: der.y};
	let asp = pos;
	let aplasta = 1;
	if (f >= K.salto - 5 && f < K.salto) aplasta = 1 - 0.12 * ((f - (K.salto - 5)) / 5);
	if (f >= K.salto && f < K.aterriza) {
		const u = (f - K.salto) / (K.aterriza - K.salto);
		asp = {x: mezclar(pos.x, destino.x, u), y: mezclar(pos.y, destino.y, u) - 4 * 300 * u * (1 - u)};
		aplasta = 1.08;
	} else if (f >= K.aterriza) {
		asp = destino;
		aplasta = 1 - 0.18 * golpe;
	}
	const enVuelo = f >= K.salto && f < K.aterriza;

	return (
		<AbsoluteFill>
			<Lienzo>
				<Piso />
				<Balanza
					pivote={PIVOTE}
					suelo={SUELO}
					angulo={angulo}
					aplastaDer={aplastaDer}
					contenidoIzq={
						<g transform={`translate(0 ${salto})`}>
							<Billete />
						</g>
					}
					contenidoDer={<BoletosEnPlato offsets={[0, 0]} />}
				/>
				<NotaDolares plato={izq} opacidad={1} />
				{caeEtiqueta === null ? null : (
					<g transform={`translate(${anclaEtiqueta.x} ${anclaEtiqueta.y + caeEtiqueta})`}>
						<EtiquetaPrecio hilo={150} angulo={pendulo} />
					</g>
				)}
				{/* Líneas de impacto al tocar el piso */}
				{golpe > 0 ? (
					<g stroke={C.tinta} strokeWidth={4} strokeLinecap="round" opacity={golpe}>
						<line x1={der.x - 170} y1={SUELO - 10} x2={der.x - 210} y2={SUELO - 40} />
						<line x1={der.x + 170} y1={SUELO - 10} x2={der.x + 210} y2={SUELO - 40} />
						<line x1={der.x - 150} y1={SUELO - 50} x2={der.x - 175} y2={SUELO - 90} />
						<line x1={der.x + 150} y1={SUELO - 50} x2={der.x + 175} y2={SUELO - 90} />
					</g>
				) : null}
				<Aspiradora
					x={asp.x}
					y={asp.y}
					escala={ASPIRADORA.escala}
					aplasta={aplasta}
					inclinacion={enVuelo ? -10 : 0}
					mira={f < K.salto ? {x: -0.6, y: -0.3} : {x: 0, y: 0}}
					parpadeo={parpadeo(f, 'p06')}
					expresion="neutral"
					hacia={enVuelo ? {expresion: 'sorprendida', t: 1} : undefined}
				/>
			</Lienzo>
		</AbsoluteFill>
	);
};
