import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../estilo';
import {ALTO, ANCHO} from '../timing';

/** Fondo color papel (va debajo de todo). */
export const FondoPapel: React.FC<{color?: string}> = ({color = C.papel}) => <AbsoluteFill style={{backgroundColor: color}} />;

/**
 * Grano animado (feTurbulence de frecuencia alta, opacidad 7 %) y viñeta suave.
 * Va encima de todo.
 */
export const Textura: React.FC = () => {
	const frame = useCurrentFrame();
	// El grano cambia cada 2 frames, como película.
	const semilla = Math.floor(frame / 2) % 24;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<svg width={ANCHO} height={ALTO} style={{position: 'absolute', opacity: 0.07, mixBlendMode: 'multiply'}}>
				<filter id="grano" x="0" y="0" width="100%" height="100%">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={semilla} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width={ANCHO} height={ALTO} filter="url(#grano)" />
			</svg>
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse at center, rgba(31,26,23,0) 58%, rgba(31,26,23,0.22) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};
