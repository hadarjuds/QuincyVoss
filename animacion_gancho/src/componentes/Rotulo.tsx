import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FUENTE} from '../estilo';
import {entre, salida} from '../util/anim';

/** Etiqueta arriba a la izquierda; entra deslizándose desde la izquierda en 10 frames. */
export const Rotulo: React.FC<{texto: string; desde: number}> = ({texto, desde}) => {
	const frame = useCurrentFrame();
	const t = entre(frame, desde, desde + 10, [0, 1], salida);
	if (frame < desde) return null;
	return (
		<div
			style={{
				position: 'absolute',
				left: 64,
				top: 56,
				transform: `translateX(${(t - 1) * 120}%)`,
				backgroundColor: C.tinta,
				color: C.papel,
				fontFamily: FUENTE.texto,
				fontWeight: 600,
				fontSize: 28,
				padding: '10px 20px 11px',
				borderRadius: 4,
				letterSpacing: 0.3,
			}}
		>
			{texto}
		</div>
	);
};
