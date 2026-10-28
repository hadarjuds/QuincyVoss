import React from 'react';
import {C, D, FUENTE} from '../../estilo';
import {trazo, useLinea} from '../Linea';
import {Avion} from './Balanza';

type Props = {
	x: number;
	y: number;
	escala: number;
	giro: number;
	/** Resaltado de cada línea del titular (0 a 1, crece de izquierda a derecha). */
	resalte1: number;
	resalte2: number;
};

const ANCHO = 720;
const ALTO = 900;

/** Resaltador mostaza detrás de una línea de texto. */
const Resalte: React.FC<{x: number; y: number; w: number; h: number; t: number}> = ({x, y, w, h, t}) =>
	t > 0.01 ? (
		<path
			d={`M ${x + 8} ${y} L ${x + 8 + w * t} ${y} L ${x + w * t} ${y + h} L ${x} ${y + h} Z`}
			fill={C.mostaza}
			opacity={0.85}
			strokeLinejoin="round"
		/>
	) : null;

/**
 * Página de periódico con un anuncio inventado (diseño propio, no copia el
 * anuncio real): «TWO FREE FLIGHTS!», «UNBELIEVABLE!», avión y aspiradora.
 */
export const Periodico: React.FC<Props> = ({x, y, escala, giro, resalte1, resalte2}) => {
	const {gruesa, fina} = useLinea(escala);
	const P = FUENTE.periodico;
	const lineasTexto = (x0: number, y0: number, n: number, w: number) =>
		Array.from({length: n}, (_, i) => (
			<line
				key={i}
				x1={x0}
				y1={y0 + i * 14}
				x2={x0 + w * (i === n - 1 ? 0.6 : 1)}
				y2={y0 + i * 14}
				stroke={C.grisCalido}
				strokeWidth={fina * 1.6}
			/>
		));
	return (
		<g transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
			{/* Sombra y hoja */}
			<rect x={-ANCHO / 2 + 14} y={-ALTO / 2 + 16} width={ANCHO} height={ALTO} fill={C.tinta} opacity={0.18} />
			<rect x={-ANCHO / 2} y={-ALTO / 2} width={ANCHO} height={ALTO} fill={D.periodico} {...trazo(gruesa)} />
			{/* Encabezado de la página */}
			<text x={0} y={-396} textAnchor="middle" fontFamily={P} fontWeight={700} fontSize={22} letterSpacing={6} fill={C.tinta}>
				ADVERTISEMENT · NOVEMBER 1992
			</text>
			<line x1={-320} y1={-380} x2={320} y2={-380} stroke={C.tinta} strokeWidth={fina} />
			<line x1={-320} y1={-372} x2={320} y2={-372} stroke={C.tinta} strokeWidth={fina * 0.5} />
			{/* Marco del anuncio */}
			<rect x={-312} y={-352} width={624} height={760} fill="none" stroke={C.tinta} strokeWidth={gruesa * 0.8} />
			<rect x={-300} y={-340} width={600} height={736} fill="none" stroke={C.tinta} strokeWidth={fina * 0.6} />
			{/* Titular, línea 1 */}
			<Resalte x={-284} y={-322} w={568} h={84} t={resalte1} />
			<text
				x={0}
				y={-256}
				textAnchor="middle"
				fontFamily={P}
				fontWeight={700}
				fontSize={70}
				fill={C.tinta}
				textLength={560}
				lengthAdjust="spacingAndGlyphs"
			>
				TWO FREE FLIGHTS!
			</text>
			<text x={0} y={-206} textAnchor="middle" fontFamily={P} fontWeight={700} fontSize={24} fill={C.tinta}>
				when you spend £100 on any vacuum cleaner
			</text>
			{/* Dibujo: aspiradora y avión, unidos por una ruta punteada */}
			<g>
				<path
					d="M -120 120 Q -80 -40 110 -110"
					fill="none"
					stroke={C.tinta}
					strokeWidth={fina}
					strokeDasharray="4 12"
					strokeLinecap="round"
				/>
				<Avion x={150} y={-120} tam={80} color={D.periodico} giro={-24} lw={gruesa * 0.8} />
				<line x1={30} y1={-60} x2={70} y2={-80} stroke={C.tinta} strokeWidth={fina} strokeLinecap="round" />
				<line x1={40} y1={-30} x2={86} y2={-52} stroke={C.tinta} strokeWidth={fina} strokeLinecap="round" />
				{/* Aspiradora de grabado */}
				<g transform="translate(-160 150)" fill={D.periodico} {...trazo(gruesa * 0.8)}>
					<rect x={-56} y={-26} width={112} height={26} rx={12} />
					<rect x={-16} y={-190} width={32} height={166} rx={14} />
					<rect x={-40} y={-176} width={80} height={110} rx={30} />
					<line x1={0} y1={-190} x2={0} y2={-236} />
					<rect x={-24} y={-248} width={48} height={16} rx={8} />
					<circle cx={-34} cy={0} r={12} />
					<circle cx={34} cy={0} r={12} />
					<path d="M -24 -140 L 24 -140 M -24 -122 L 24 -122 M -24 -104 L 24 -104" strokeWidth={fina} />
				</g>
				<text x={110} y={130} textAnchor="middle" fontFamily={P} fontWeight={700} fontSize={30} fill={C.tinta}>
					to the U.S.A.
				</text>
				<text x={110} y={164} textAnchor="middle" fontFamily={P} fontWeight={700} fontSize={22} fill={C.tinta}>
					Return. For two.
				</text>
			</g>
			{/* Titular, línea 2 */}
			<Resalte x={-270} y={198} w={540} h={80} t={resalte2} />
			<text
				x={0}
				y={262}
				textAnchor="middle"
				fontFamily={P}
				fontWeight={700}
				fontSize={70}
				fill={C.tinta}
				textLength={520}
				lengthAdjust="spacingAndGlyphs"
			>
				UNBELIEVABLE!
			</text>
			{/* Letra chica */}
			<line x1={-280} y1={300} x2={280} y2={300} stroke={C.tinta} strokeWidth={fina * 0.6} />
			{lineasTexto(-280, 324, 4, 260)}
			{lineasTexto(20, 324, 4, 260)}
			<text x={0} y={392} textAnchor="middle" fontFamily={P} fontWeight={700} fontSize={16} fill={C.grisCalido}>
				*Terms and conditions apply.
			</text>
			{/* Columnas de otras noticias al pie de la página */}
			{lineasTexto(-320, 428, 1, 640)}
		</g>
	);
};
