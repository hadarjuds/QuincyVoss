import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Subtitulos} from './componentes/Subtitulos';
import {FondoPapel, Textura} from './componentes/Textura';
import {Plano01} from './planos/Plano01';
import {Plano02, Plano03, Plano04} from './planos/Grafica';
import {Plano05, Plano06} from './planos/Balanza';
import {Plano07, Plano08} from './planos/Anuncio';
import {Plano09, Plano10, Plano11, Plano12, Plano13} from './planos/Oficina1';
import {Plano14, Plano15, Plano16, Plano17, Plano18} from './planos/Oficina2';
import {IdPlano, LISTA_PLANOS} from './timing';

export type PropsGancho = {
	/** Muestra la narración como subtítulos (para revisar el ritmo sin voz). */
	showSubtitles: boolean;
};

const COMPONENTES: Record<IdPlano, React.FC> = {
	p01: Plano01,
	p02: Plano02,
	p03: Plano03,
	p04: Plano04,
	p05: Plano05,
	p06: Plano06,
	p07: Plano07,
	p08: Plano08,
	p09: Plano09,
	p10: Plano10,
	p11: Plano11,
	p12: Plano12,
	p13: Plano13,
	p14: Plano14,
	p15: Plano15,
	p16: Plano16,
	p17: Plano17,
	p18: Plano18,
};

/** Composición principal: un <Sequence> por plano, subtítulos y textura de papel encima. */
export const Gancho: React.FC<PropsGancho> = ({showSubtitles}) => (
	<AbsoluteFill>
		<FondoPapel />
		{LISTA_PLANOS.map((p) => {
			const Componente = COMPONENTES[p.id];
			return (
				<Sequence key={p.id} from={p.inicio} durationInFrames={p.duracion} name={`${p.numero}. ${p.titulo}`}>
					<Componente />
				</Sequence>
			);
		})}
		{showSubtitles ? <Subtitulos /> : null}
		<Textura />
	</AbsoluteFill>
);
