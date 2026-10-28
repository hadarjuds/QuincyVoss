import React from 'react';
import {Composition} from 'remotion';
import {Gancho, PropsGancho} from './Gancho';
import {ALTO, ANCHO, DURACION_TOTAL, FPS} from './timing';

export const RemotionRoot: React.FC = () => (
	<Composition
		id="Gancho"
		component={Gancho}
		durationInFrames={DURACION_TOTAL}
		fps={FPS}
		width={ANCHO}
		height={ALTO}
		defaultProps={{showSubtitles: true} satisfies PropsGancho}
	/>
);
