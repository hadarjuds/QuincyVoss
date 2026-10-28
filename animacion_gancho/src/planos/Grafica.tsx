import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Camara, EstadoCamara, Lienzo} from '../componentes/Camara';
import {
	Barra,
	EjeBase,
	IconoDisco,
	IconoGasolina,
	IconoPizza,
	IconoServidor,
	IconoSonda,
	IconoTelefono,
} from '../componentes/objetos/Grafica';
import {Aspiradora} from '../componentes/personajes/Aspiradora';
import {C} from '../estilo';
import {PLANOS} from '../timing';
import {entre, lineal, mezclar, oscilacion, parpadeoEn, RESORTE, resorte, salida} from '../util/anim';

const BASE = 880;
const PRIMERA = {x: 300, ancho: 150, alto: 120};
const BARRAS = [
	{alto: 420, color: C.mostaza, icono: IconoSonda, tinta: true},
	{alto: 780, color: C.verdeAzulado, icono: IconoServidor, tinta: false},
	{alto: 1200, color: C.azulCielo, icono: IconoDisco, tinta: true},
	{alto: 1700, color: C.verdeBillete, icono: IconoPizza, tinta: false},
	{alto: 2300, color: C.grisCalido, icono: IconoTelefono, tinta: false},
	{alto: 3000, color: C.tinta, icono: IconoGasolina, tinta: false},
].map((b, i) => ({...b, x: 520 + i * 200}));

const CAMARA_ARRIBA: EstadoCamara = {x: 960, y: -760, zoom: 1};
const CAMARA_PRIMERA_BARRA: EstadoCamara = {x: 640, y: 660, zoom: 1.35};

type EstadoBarra = {alto: number; destello: number; icono?: {y: number; opacidad: number}};

const Escena: React.FC<{
	camara: EstadoCamara;
	eje: number;
	primera: number;
	etiqueta?: string;
	barras: EstadoBarra[];
	children?: React.ReactNode;
}> = ({camara, eje, primera, etiqueta, barras, children}) => (
	<AbsoluteFill>
		<Camara {...camara}>
			<Lienzo>
				<EjeBase x1={120} x2={1800} y={BASE} progreso={eje} />
				{barras.map((b, i) => {
					const def = BARRAS[i];
					const Icono = def.icono;
					return (
						<Barra
							key={i}
							x={def.x}
							base={BASE}
							ancho={150}
							alto={b.alto}
							color={def.color}
							destello={b.destello}
							icono={b.icono ? {...b.icono, dibujo: <Icono color={def.tinta ? C.tinta : C.blanco} />} : undefined}
						/>
					);
				})}
				<Barra x={PRIMERA.x} base={BASE} ancho={PRIMERA.ancho} alto={primera} color={C.rojo} etiqueta={etiqueta} />
				{children}
			</Lienzo>
		</Camara>
	</AbsoluteFill>
);

/** Plano 2: eje vacío; al decir la cifra crece la barra roja de $72M. */
export const Plano02: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p02.claves;
	const eje = entre(f, K.eje, K.ejeFin, [0, 1]);
	const crece = resorte(f, K.barra, RESORTE.elastico);
	const cifra = Math.round(lineal(f, K.barra, K.conteoFin, [0, 72]));
	return (
		<Escena
			camara={{x: 960, y: 540, zoom: 1}}
			eje={eje}
			primera={PRIMERA.alto * crece}
			etiqueta={f >= K.barra ? `$${cifra}M` : undefined}
			barras={[]}
		/>
	);
};

const camaraSube = (f: number) => {
	const K = PLANOS.p03.claves;
	const t = entre(f, 0, K.camaraFin, [0, 1], Easing.inOut(Easing.quad));
	return {x: 960, y: mezclar(540, CAMARA_ARRIBA.y, t), zoom: 1};
};

/** Plano 3: seis barras disparadas, cada una con un ícono un instante; la cámara sube. */
export const Plano03: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p03.claves;
	const camara = camaraSube(f);
	const arribaVisible = camara.y - 540;
	const barras: EstadoBarra[] = BARRAS.map((b, i) => {
		const inicio = K.primeraBarra + Math.round(i * (K.entreBarras || 8));
		if (f < inicio) return {alto: 0, destello: 0};
		const crece = resorte(f, inicio, {damping: 11, stiffness: 240, mass: 0.55});
		const alto = b.alto * crece;
		const ini = inicio + 2;
		const fin = ini + K.iconoDura;
		const enIcono = f >= ini && f < fin;
		const opacidad = enIcono
			? interpolate(f, [ini, ini + 1, fin - 2, fin], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
			: 0;
		const y = Math.min(BASE - 90, Math.max(BASE - alto + 90, arribaVisible + 300));
		return {
			alto,
			destello: enIcono ? 0.85 * (1 - (f - ini) / K.iconoDura) : 0,
			icono: enIcono ? {y, opacidad} : undefined,
		};
	});
	return <Escena camara={camara} eje={1} primera={PRIMERA.alto} etiqueta="$72M" barras={barras} />;
};

/** Plano 4: la cámara regresa a la barra de $72M y entra la aspiradora rodando. */
export const Plano04: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p04.claves;
	const baja = resorte(f, K.camaraBaja, {damping: 20, stiffness: 120, mass: 0.7}, K.camaraFin - K.camaraBaja);
	const camara = {
		x: mezclar(CAMARA_ARRIBA.x, CAMARA_PRIMERA_BARRA.x, baja),
		y: mezclar(CAMARA_ARRIBA.y, CAMARA_PRIMERA_BARRA.y, baja),
		zoom: mezclar(1, CAMARA_PRIMERA_BARRA.zoom, baja),
	};

	// Aspiradora: entra rodando desde la derecha y frena junto a la barra.
	const escala = 0.72;
	const xIni = 1700;
	const xFin = 560;
	const x = entre(f, K.aspiradoraEntra, K.aspiradoraFrena, [xIni, xFin], salida);
	const xAntes = entre(f - 1, K.aspiradoraEntra, K.aspiradoraFrena, [xIni, xFin], salida);
	const velocidad = Math.abs(x - xAntes);
	const recorrido = xIni - x;
	const giroRuedas = -((recorrido / (26 * escala)) * 180) / Math.PI;
	const rebote = velocidad > 1 ? -Math.abs(Math.sin((f * Math.PI) / 4)) * 4 : 0;
	const inclinacion = oscilacion(f, K.aspiradoraFrena, -5, 1.8, 2.6) + (velocidad > 1 ? -2 : 0);
	const mira =
		f < K.miraBarra
			? {x: -0.6, y: 0}
			: f < K.miraCamara
				? {x: entre(f, K.miraBarra, K.miraBarra + 5, [-0.6, -1]), y: entre(f, K.miraBarra, K.miraBarra + 5, [0, -0.5])}
				: {x: entre(f, K.miraCamara, K.miraCamara + 5, [-1, 0]), y: entre(f, K.miraCamara, K.miraCamara + 5, [-0.5, 0])};
	const parpadeo = parpadeoEn(f, K.miraCamara + 6);
	const lineasVelocidad = Math.min(1, velocidad / 25);

	return (
		<Escena camara={camara} eje={1} primera={PRIMERA.alto} etiqueta="$72M" barras={BARRAS.map((b) => ({alto: b.alto, destello: 0}))}>
			{f >= K.aspiradoraEntra ? (
				<>
					{lineasVelocidad > 0.05 ? (
						<g stroke={C.tinta} strokeWidth={4} strokeLinecap="round" opacity={lineasVelocidad}>
							<line x1={x + 110} y1={880} x2={x + 210} y2={880} />
							<line x1={x + 130} y1={820} x2={x + 250} y2={820} />
							<line x1={x + 100} y1={760} x2={x + 180} y2={760} />
						</g>
					) : null}
					{/* Humo del frenón */}
					{f >= K.aspiradoraFrena - 4 && f < K.aspiradoraFrena + 10 ? (
						<g fill={C.blanco} stroke={C.tinta} strokeWidth={3} opacity={entre(f, K.aspiradoraFrena + 2, K.aspiradoraFrena + 10, [1, 0])}>
							<circle cx={x - 90} cy={938} r={entre(f, K.aspiradoraFrena - 4, K.aspiradoraFrena + 10, [6, 18])} />
							<circle cx={x - 60} cy={930} r={entre(f, K.aspiradoraFrena - 4, K.aspiradoraFrena + 10, [4, 12])} />
						</g>
					) : null}
					<Aspiradora
						x={x}
						y={945 + rebote}
						escala={escala}
						inclinacion={inclinacion}
						giroRuedas={giroRuedas}
						mira={mira}
						parpadeo={parpadeo}
					/>
				</>
			) : null}
		</Escena>
	);
};
