"""Genera _texturas/papel.png: textura de papel sutil, sin costuras, 2048x2048,
escala de grises de 8 bits. Todo es ruido procedural (sin fotos de terceros).

Uso:  python3 generar_papel.py            (requiere numpy y Pillow)

Por qué no tiene costuras: todos los filtros se aplican en el dominio de
Fourier, que es periódico, así que el borde derecho continúa en el izquierdo
y el de abajo en el de arriba.
"""

import os
import numpy as np
from PIL import Image

N = 2048
SEMILLA = 1930
MEDIA = 232.0        # tono medio (claro: en Multiplicar casi no oscurece)
CONTRASTE = 9.0      # desviación típica en niveles de gris

rng = np.random.default_rng(SEMILLA)
fy = np.fft.fftfreq(N)[:, None]
fx = np.fft.fftfreq(N)[None, :]
radio = np.sqrt(fx ** 2 + fy ** 2)


def ruido(filtro):
    """Ruido blanco filtrado en frecuencia, normalizado a media 0 y desviación 1."""
    blanco = rng.standard_normal((N, N))
    r = np.real(np.fft.ifft2(np.fft.fft2(blanco) * filtro))
    return (r - r.mean()) / r.std()


def paso_bajo(f):
    return np.exp(-(radio / f) ** 2)


# Manchas grandes y suaves (variaciones de la pasta del papel).
manchas = ruido(paso_bajo(0.004))
# Nubosidad media.
nubes = ruido(paso_bajo(0.02))
# Grano fino.
grano = ruido(paso_bajo(0.30))

# Fibras: ruido muy alargado en varias direcciones; solo se conservan los picos,
# que forman trazos finos y cortos.
fibras = np.zeros((N, N))
for _ in range(8):
    th = rng.uniform(0, np.pi)
    u = fx * np.cos(th) + fy * np.sin(th)
    v = -fx * np.sin(th) + fy * np.cos(th)
    n = ruido(np.exp(-(u / 0.015) ** 2 - (v / 0.16) ** 2))
    fibras += np.maximum(np.abs(n) - 2.2, 0)
fibras /= fibras.std()

# Motas oscuras pequeñas y escasas (con vuelta al borde, para seguir sin costuras).
motas = np.zeros((N, N))
for _ in range(220):
    cy, cx = rng.integers(0, N, 2)
    r = rng.uniform(0.6, 1.8)
    peso = rng.uniform(0.5, 1.0)
    for dy in range(-3, 4):
        for dx in range(-3, 4):
            d2 = dy * dy + dx * dx
            motas[(cy + dy) % N, (cx + dx) % N] += peso * np.exp(-d2 / (2 * r * r))

t = 0.55 * manchas + 0.45 * nubes + 0.45 * grano - 0.16 * fibras - 1.0 * motas
t = (t - t.mean()) / t.std()
img = np.clip(MEDIA + CONTRASTE * t, 0, 255)
img = np.round(img).astype(np.uint8)

destino = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_texturas", "papel.png")
Image.fromarray(img, mode="L").save(destino, optimize=True)
print("Guardado:", os.path.normpath(destino))
print("media %.1f  desv %.1f  min %d  max %d" % (img.mean(), img.std(), img.min(), img.max()))
