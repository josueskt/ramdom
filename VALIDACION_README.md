# Módulo de Validación de Números Pseudoaleatorios

## Descripción General

Este módulo implementa pruebas estadísticas para validar la calidad de los números pseudoaleatorios generados por el Generador Congruencial Lineal (LCG).

## Pruebas Implementadas

### 1. Prueba de Independencia (Correlation Test)

**Objetivo:** Verificar que no existe correlación significativa entre números consecutivos.

**Método:** Coeficiente de Correlación de Pearson

**Fórmula:**
```
r = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi - x̄)² × Σ(yi - ȳ)²]
```

Donde:
- xi: valor normalizado en posición i
- yi: valor normalizado en posición i+1
- x̄, ȳ: medias de las respectivas secuencias

**Criterio de Aceptación:**
- |r| < 0.05: Los números son independientes ✓
- |r| ≥ 0.05: Existe correlación significativa ✗

**Interpretación:**
Un valor de correlación cercano a 0 indica que no hay relación lineal entre números consecutivos, lo cual es deseable en un generador de números pseudoaleatorios de calidad.

### 2. Prueba de Uniformidad (Chi-Square Test)

**Objetivo:** Verificar que los números están distribuidos uniformemente en el intervalo [0,1].

**Método:** Prueba Chi-cuadrado (χ²)

**Proceso:**
1. Dividir el intervalo [0,1] en k subintervalos (bins)
2. Contar la frecuencia observada en cada intervalo
3. Calcular la frecuencia esperada: n/k (donde n = total de números)
4. Calcular el estadístico χ²

**Fórmula:**
```
χ² = Σ[(Oi - Ei)² / Ei]
```

Donde:
- Oi: frecuencia observada en el intervalo i
- Ei: frecuencia esperada en el intervalo i
- k: número de intervalos

**Criterio de Aceptación:**
- χ² < χ²crítico: Distribución uniforme ✓
- χ² ≥ χ²crítico: Distribución no uniforme ✗

**Parámetros:**
- Nivel de significancia (α): 0.05 (5%)
- Grados de libertad: k - 1
- χ²crítico: obtenido de tabla estadística

**Interpretación:**
Si el estadístico calculado es menor que el valor crítico, no hay evidencia suficiente para rechazar la hipótesis de uniformidad.

## Estructura del Código

### Propiedades Añadidas (app.ts)

```typescript
validationResults = {
  independenceTest: { 
    passed: boolean,
    correlation: number,
    threshold: number 
  },
  uniformityTest: { 
    passed: boolean,
    chiSquare: number,
    criticalValue: number,
    degreesOfFreedom: number 
  },
  overallValid: boolean
};
testsPerformed: boolean;
```

### Métodos Principales

#### performValidationTests()
Ejecuta ambas pruebas y determina la validez general de los números generados.

#### independenceTest()
Calcula el coeficiente de correlación de Pearson entre números consecutivos.

**Retorna:**
```typescript
{
  passed: boolean,
  correlation: number,
  threshold: number
}
```

#### uniformityTest()
Realiza la prueba Chi-cuadrado para verificar uniformidad.

**Retorna:**
```typescript
{
  passed: boolean,
  chiSquare: number,
  criticalValue: number,
  degreesOfFreedom: number
}
```

#### regenerate()
Genera nuevos números con una semilla ajustada cuando las pruebas fallan.

**Estrategia:** Incrementa la semilla X₀ en 137 (número primo) y genera nuevamente.

## Interfaz de Usuario

### Sección de Resultados de Validación

La UI muestra:

1. **Indicadores visuales:**
   - ✓ Verde: Prueba pasada
   - ✗ Rojo: Prueba fallida

2. **Prueba de Independencia:**
   - Correlación calculada
   - Umbral de aceptación
   - Estado (pasó/falló)

3. **Prueba de Uniformidad:**
   - χ² calculado
   - χ² crítico
   - Grados de libertad
   - Estado (pasó/falló)

4. **Resultado General:**
   - Mensaje de validación global
   - Botón "Regenerar" (solo si falló)

### Ejemplo de Uso

1. Ingresar parámetros del LCG:
   - g = 8
   - a = 137
   - c = 0
   - X₀ = 1
   - N = 256

2. Hacer clic en "Generar"

3. Revisar resultados de validación:
   - Ver coeficiente de correlación
   - Ver estadístico χ²
   - Verificar si ambas pruebas pasaron

4. Si las pruebas fallan:
   - Hacer clic en "🔄 Regenerar con Nueva Semilla"
   - El sistema ajustará X₀ automáticamente

## Recomendaciones para Obtener Buenos Resultados

### Selección de Parámetros

Para que el LCG genere números de calidad:

1. **Módulo (m = 2^g):**
   - Usar valores grandes (g ≥ 8)
   - Ejemplo: g = 16 → m = 65536

2. **Multiplicador (a):**
   - Debe cumplir: a mod 8 = 5 (si m es potencia de 2)
   - Ejemplos buenos: 5, 13, 21, 29, 37, 45, 53, 61, 69, 77, 85, 93, 101, 109, 117, 125, 133, 141, 149...

3. **Constante aditiva (c):**
   - c debe ser impar
   - c y m deben ser coprimos (gcd(c,m) = 1)
   - Ejemplo: c = 1, 3, 5, 7, 9...

4. **Semilla (X₀):**
   - Puede ser cualquier valor entre 0 y m-1
   - Si las pruebas fallan, el botón regenerar probará con otra semilla

### Combinaciones Recomendadas

**Ejemplo 1: Calidad Alta**
```
g = 16
a = 25214903917 mod 2^16 = 44485
c = 11
X₀ = 42
N = 10000
```

**Ejemplo 2: Calidad Media**
```
g = 10
a = 1103515245 mod 2^10 = 461
c = 12345 mod 2^10 = 57
X₀ = 1
N = 1000
```

**Ejemplo 3: Demostración de Fallo**
```
g = 4
a = 2
c = 0
X₀ = 1
N = 16
```
(Este ejemplo debería fallar las pruebas)

## Fundamento Teórico

### ¿Por qué estas pruebas?

1. **Independencia:** Los números aleatorios verdaderos no tienen "memoria". Un número no debe predecir el siguiente.

2. **Uniformidad:** Cada valor en [0,1] debe tener la misma probabilidad de aparecer. Sin uniformidad, algunos valores aparecerían más frecuentemente.

### Limitaciones del LCG

Aunque las pruebas pasen, el LCG tiene limitaciones conocidas:
- Período limitado (máximo m)
- Patrones en dimensiones superiores
- No es criptográficamente seguro

Para aplicaciones críticas, considerar generadores más robustos como Mersenne Twister o ChaCha20.

## Referencias

1. Knuth, D. E. (1997). *The Art of Computer Programming, Volume 2: Seminumerical Algorithms*
2. L'Ecuyer, P. (1990). "Random numbers for simulation"
3. Marsaglia, G. (1968). "Random numbers fall mainly in the planes"

## Autor

Módulo de validación implementado como práctica educativa para el curso de Simulación.
