import {loadFont as cargarAlfa} from '@remotion/google-fonts/AlfaSlabOne';
import {loadFont as cargarPlex} from '@remotion/google-fonts/IBMPlexSans';
import {loadFont as cargarOldStandard} from '@remotion/google-fonts/OldStandardTT';

/** Paleta del storyboard. */
export const C = {
	papel: '#F2EADB',
	tinta: '#1F1A17',
	rojo: '#D1453B',
	verdeAzulado: '#2A8C82',
	mostaza: '#E8B64C',
	azulCielo: '#9CC9E3',
	verdeBillete: '#6E9A5E',
	grisCalido: '#8C847A',
	blanco: '#FFFFFF',
} as const;

/**
 * Tonos derivados de la paleta (mezclas con papel o tinta) para cosas que el
 * storyboard pide pero que no tienen color propio: piel, madera, bolsa gris
 * claro, pared mostaza clara, piso, traje negro.
 */
export const D = {
	piel: '#F0C9A2',
	pielSombra: '#DDA77F',
	madera: '#B98250',
	maderaOscura: '#93613A',
	bolsa: '#DAD4C9',
	pared: '#F1D795',
	piso: '#D6CBB8',
	traje: '#2C2521',
	pantalon: '#5E574F',
	rojoOscuro: '#A8352D',
	bocaInterior: '#4A1E19',
	periodico: '#FBF7EE',
	pantallaCalc: '#BFD9C4',
} as const;

const {fontFamily: alfa} = cargarAlfa('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});
const {fontFamily: plex} = cargarPlex('normal', {weights: ['400', '600'], subsets: ['latin', 'latin-ext']});
const {fontFamily: oldStandard} = cargarOldStandard('normal', {weights: ['700'], subsets: ['latin', 'latin-ext']});

export const FUENTE = {
	/** Cifras, títulos y gritos. */
	cifras: `${alfa}, serif`,
	/** Texto general, rótulos y subtítulos (400 y 600). */
	texto: `${plex}, sans-serif`,
	/** Solo el anuncio del plano 7. */
	periodico: `${oldStandard}, serif`,
} as const;

/** Grosores de contorno base (px en pantalla). */
export const LINEA = {
	gruesa: 6,
	fina: 3,
	globo: 4,
} as const;
