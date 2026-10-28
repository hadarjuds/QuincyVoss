import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Camara, Lienzo} from '../componentes/Camara';
import {Periodico} from '../componentes/objetos/Periodico';
import {Aspiradora} from '../componentes/personajes/Aspiradora';
import {PLANOS} from '../timing';
import {entre, mezclar, parpadeo, respira, resorte, salida} from '../util/anim';

const PAGINA = {x: 960, y: 486, escala: 0.92};

/** Plano 7: la página de periódico entra girando y se resalta cada línea del titular. */
export const Plano07: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p07.claves;
	const s = resorte(f, K.entra, {damping: 15, stiffness: 110, mass: 0.8}, K.entraFin - K.entra);
	const giro = -720 * (1 - s);
	const escala = mezclar(0.1, 1, s) * (f > K.entraFin ? respira(f - K.entraFin, 1.6, 0.02) : 1);
	return (
		<AbsoluteFill>
			<Lienzo>
				<Periodico
					x={PAGINA.x}
					y={PAGINA.y}
					escala={PAGINA.escala * escala}
					giro={giro}
					resalte1={entre(f, K.linea1, K.linea1 + 9, [0, 1], salida)}
					resalte2={entre(f, K.linea2, K.linea2 + 9, [0, 1], salida)}
				/>
			</Lienzo>
		</AbsoluteFill>
	);
};

/** Plano 8: la aspiradora se asoma, lee el anuncio, voltea a cámara y asiente muy seria. */
export const Plano08: React.FC = () => {
	const f = useCurrentFrame();
	const K = PLANOS.p08.claves;
	const asoma = resorte(f, K.asoma, {damping: 13, stiffness: 140, mass: 0.7}, K.asomaFin - K.asoma + 6);
	const y = mezclar(1700, 1120, asoma);

	// Lectura: dos barridos de izquierda a derecha (uno por línea del titular).
	const mitad = Math.round((K.leeInicio + K.leeFin) / 2);
	let mira = {x: -0.9, y: -0.4};
	if (f >= K.leeInicio && f < mitad) mira = {x: entre(f, K.leeInicio, mitad, [-1, -0.45]), y: -0.55};
	else if (f >= mitad && f < K.voltea) mira = {x: entre(f, mitad, K.leeFin, [-1, -0.45]), y: 0.15};
	else if (f >= K.voltea) mira = {x: entre(f, K.voltea, K.voltea + 5, [-0.45, 0]), y: entre(f, K.voltea, K.voltea + 5, [0.15, 0])};

	// Asiente dos veces, despacio, y se queda quieta.
	const u = entre(f, K.asiente, K.asienteFin, [0, 1], (t) => t);
	const asiente = f >= K.asiente && f <= K.asienteFin ? 0.5 - 0.5 * Math.cos(u * Math.PI * 4) : 0;
	const seria = entre(f, K.voltea, K.voltea + 6, [0, 1]);

	return (
		<AbsoluteFill>
			<Camara x={1160} y={540} zoom={1}>
				<Lienzo>
					<Periodico x={PAGINA.x} y={PAGINA.y} escala={PAGINA.escala} giro={0} resalte1={1} resalte2={1} />
					<Aspiradora
						x={1720}
						y={y}
						escala={1.15}
						inclinacion={f < K.voltea ? entre(f, K.asomaFin, K.leeInicio, [0, -4]) : entre(f, K.voltea, K.voltea + 6, [-4, 0])}
						asiente={asiente}
						mira={{x: mira.x, y: mira.y + asiente * 0.5}}
						parpadeo={f < K.voltea ? parpadeo(f, 'p08') : 0}
						expresion="neutral"
						hacia={{expresion: 'seria', t: seria}}
					/>
				</Lienzo>
			</Camara>
		</AbsoluteFill>
	);
};
