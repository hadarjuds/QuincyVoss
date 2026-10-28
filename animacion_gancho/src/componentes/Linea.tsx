import React, {createContext, useContext} from 'react';
import {LINEA} from '../estilo';

/**
 * Los contornos deben medir lo mismo en pantalla (6 px y 3 px) aunque la cámara
 * se acerque o un personaje se dibuje a otra escala. La cámara y cada personaje
 * multiplican este factor; los dibujos piden sus grosores con useLinea().
 */
const Contexto = createContext(1);

export const EscalaLinea: React.FC<{factor: number; children: React.ReactNode}> = ({factor, children}) => {
	const actual = useContext(Contexto);
	return <Contexto.Provider value={actual * factor}>{children}</Contexto.Provider>;
};

export const useLinea = (escalaPropia = 1) => {
	const k = useContext(Contexto) / escalaPropia;
	return {gruesa: LINEA.gruesa * k, fina: LINEA.fina * k, globo: LINEA.globo * k, k};
};

/** Atributos comunes de contorno. */
export const trazo = (ancho: number) => ({stroke: '#1F1A17', strokeWidth: ancho, strokeLinejoin: 'round', strokeLinecap: 'round'}) as const;
