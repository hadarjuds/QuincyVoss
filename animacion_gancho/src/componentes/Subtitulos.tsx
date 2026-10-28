import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FUENTE} from '../estilo';
import {SUBTITULOS} from '../timing';

/** Narración: abajo al centro, máximo dos líneas, cambia por frase. */
export const Subtitulos: React.FC = () => {
	const frame = useCurrentFrame();
	const frase = SUBTITULOS.find((s) => frame >= s.desde && frame < s.hasta);
	if (!frase) return null;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				bottom: 56,
				display: 'flex',
				justifyContent: 'center',
				pointerEvents: 'none',
			}}
		>
			<div
				style={{
					maxWidth: 1360,
					padding: '10px 28px 12px',
					backgroundColor: 'rgba(31,26,23,0.7)',
					color: C.blanco,
					fontFamily: FUENTE.texto,
					fontWeight: 400,
					fontSize: 40,
					lineHeight: 1.3,
					textAlign: 'center',
					borderRadius: 6,
				}}
			>
				{frase.texto}
			</div>
		</div>
	);
};
