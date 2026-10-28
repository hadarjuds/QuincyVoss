import {Easing, interpolate, random, spring} from 'remotion';
import {FPS} from '../timing';

export const suave = Easing.inOut(Easing.cubic);
export const salida = Easing.out(Easing.cubic);
export const entrada = Easing.in(Easing.quad);

/** Interpola entre dos frames con easing suave (por defecto) y valores fijos fuera del rango. */
export const entre = (frame: number, desde: number, hasta: number, valores: [number, number], easing: (t: number) => number = suave) => {
	if (hasta <= desde) return frame < desde ? valores[0] : valores[1];
	return interpolate(frame, [desde, hasta], valores, {
		easing,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
};

/** Movimiento lineal (solo para contadores y el rollo que rueda). */
export const lineal = (frame: number, desde: number, hasta: number, valores: [number, number]) =>
	entre(frame, desde, hasta, valores, Easing.linear);

type ConfigResorte = {damping?: number; stiffness?: number; mass?: number; overshootClamping?: boolean};

export const RESORTE = {
	suave: {damping: 18, stiffness: 120, mass: 1},
	elastico: {damping: 9, stiffness: 160, mass: 0.8},
	rigido: {damping: 14, stiffness: 420, mass: 0.6},
	muyRigido: {damping: 12, stiffness: 900, mass: 0.4},
	oscilante: {damping: 3.2, stiffness: 90, mass: 1},
} satisfies Record<string, ConfigResorte>;

/** Resorte que arranca en el frame `inicio` (0 antes, ~1 al final). */
export const resorte = (frame: number, inicio: number, config: ConfigResorte = RESORTE.suave, duracion?: number) =>
	spring({frame: frame - inicio, fps: FPS, config, durationInFrames: duracion});

export const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;

/** Mezcla dos objetos con los mismos campos numéricos. */
export const mezclarObj = <T extends Record<string, number>>(a: T, b: T, t: number): T => {
	const out = {} as Record<string, number>;
	for (const k of Object.keys(a)) out[k] = mezclar(a[k], b[k], t);
	return out as T;
};

/** Respiración: escala vertical de 1 a 1 + amplitud, con un ciclo cada `periodo` segundos. */
export const respira = (frame: number, periodo = 2, amplitud = 0.01, fase = 0) =>
	1 + amplitud * (0.5 - 0.5 * Math.cos(((frame / FPS + fase) / periodo) * Math.PI * 2));

/**
 * Parpadeo automático cada 3 a 4 s (determinista con semilla).
 * Devuelve 0 (abierto) a 1 (cerrado).
 */
export const parpadeo = (frame: number, semilla: string, cadaMin = 3, cadaMax = 4) => {
	const dur = 6;
	let t = Math.round((0.6 + random(`${semilla}-0`) * 1.6) * FPS);
	let i = 1;
	while (t + dur < frame) {
		t += Math.round((cadaMin + random(`${semilla}-${i}`) * (cadaMax - cadaMin)) * FPS);
		i++;
	}
	const d = frame - t;
	if (d < 0 || d > dur) return 0;
	return 1 - Math.abs(d - dur / 2) / (dur / 2);
};

/** Parpadeo forzado en un frame concreto (0 → 1 → 0 en 6 frames). */
export const parpadeoEn = (frame: number, en: number) => {
	const d = frame - en;
	if (d < 0 || d > 6) return 0;
	return 1 - Math.abs(d - 3) / 3;
};

/** Temblor determinista de ±amplitud px. */
export const temblor = (frame: number, semilla: string, amplitud: number) => ({
	x: (random(`${semilla}-x-${frame}`) * 2 - 1) * amplitud,
	y: (random(`${semilla}-y-${frame}`) * 2 - 1) * amplitud,
});

/** Oscilación amortiguada que empieza en `inicio`: 0 antes, sale de `amplitud` y decae. */
export const oscilacion = (frame: number, inicio: number, amplitud: number, ciclosPorSeg = 2, decaimiento = 3) => {
	const t = (frame - inicio) / FPS;
	if (t < 0) return 0;
	return amplitud * Math.cos(t * ciclosPorSeg * Math.PI * 2) * Math.exp(-t * decaimiento);
};

export type Punto = {x: number; y: number};

/**
 * Cinemática inversa de dos segmentos (hombro → codo → muñeca).
 * `doblez` = 1 o -1 elige hacia qué lado se dobla el codo.
 */
export const ik = (hombro: Punto, objetivo: Punto, l1: number, l2: number, doblez: 1 | -1) => {
	const dx = objetivo.x - hombro.x;
	const dy = objetivo.y - hombro.y;
	const dist = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
	const base = Math.atan2(dy, dx);
	const a = Math.acos((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist));
	const angSup = base + doblez * a;
	const codo = {x: hombro.x + l1 * Math.cos(angSup), y: hombro.y + l1 * Math.sin(angSup)};
	const fin = {x: hombro.x + dist * Math.cos(base), y: hombro.y + dist * Math.sin(base)};
	const angInf = Math.atan2(fin.y - codo.y, fin.x - codo.x);
	const muneca = {x: codo.x + l2 * Math.cos(angInf), y: codo.y + l2 * Math.sin(angInf)};
	return {codo, muneca, anguloAntebrazo: (angInf * 180) / Math.PI};
};

export const mezclarPunto = (a: Punto, b: Punto, t: number): Punto => ({x: mezclar(a.x, b.x, t), y: mezclar(a.y, b.y, t)});

/** Id seguro para usar en url(#...) a partir de React.useId(). */
export const idSeguro = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '');
