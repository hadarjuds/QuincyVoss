import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ALTO, ANCHO} from '../timing';
import {EscalaLinea} from './Linea';

export type EstadoCamara = {x: number; y: number; zoom: number};

export const CAMARA_GENERAL: EstadoCamara = {x: ANCHO / 2, y: ALTO / 2, zoom: 1};

type Props = EstadoCamara & {
	/** Desplazamiento extra en pantalla (temblor). */
	temblor?: {x: number; y: number};
	/** Desenfoque de movimiento simulado: copias del cuadro con baja opacidad. */
	estela?: {dx: number; dy?: number; copias: number};
	children: React.ReactNode;
};

/** Convierte un punto del mundo a coordenadas de pantalla para una cámara. */
export const aPantalla = (p: {x: number; y: number}, cam: EstadoCamara) => ({
	x: ANCHO / 2 + (p.x - cam.x) * cam.zoom,
	y: ALTO / 2 + (p.y - cam.y) * cam.zoom,
});

/**
 * Envuelve la escena y aplica translate y scale. (x, y) es el punto del mundo
 * que queda al centro de la pantalla.
 */
export const Camara: React.FC<Props> = ({x, y, zoom, temblor, estela, children}) => {
	const capa = (dx: number, dy: number, opacidad: number, key: string) => (
		<div
			key={key}
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: ANCHO,
				height: ALTO,
				transformOrigin: '0 0',
				opacity: opacidad,
				transform: `translate(${ANCHO / 2 + (temblor?.x ?? 0) + dx}px, ${ALTO / 2 + (temblor?.y ?? 0) + dy}px) scale(${zoom}) translate(${-x}px, ${-y}px)`,
			}}
		>
			{children}
		</div>
	);
	const copias = estela && (Math.abs(estela.dx) > 0.5 || Math.abs(estela.dy ?? 0) > 0.5) ? estela.copias : 0;
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<EscalaLinea factor={1 / zoom}>
				{Array.from({length: copias}, (_, i) => {
					const f = (copias - i) / (copias + 1);
					return capa(-(estela?.dx ?? 0) * f, -(estela?.dy ?? 0) * f, 0.22, `estela-${i}`);
				})}
				{capa(0, 0, 1, 'principal')}
			</EscalaLinea>
		</AbsoluteFill>
	);
};

/** SVG del tamaño del cuadro (coordenadas del mundo) que deja ver lo que se sale. */
export const Lienzo: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<svg
		width={ANCHO}
		height={ALTO}
		viewBox={`0 0 ${ANCHO} ${ALTO}`}
		style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}
	>
		{children}
	</svg>
);
