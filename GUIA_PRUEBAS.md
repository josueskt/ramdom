# 🧪 Guía Rápida de Pruebas - Módulo de Validación LCG

## Pruebas Sugeridas para Estudiantes

### Test 1: Generador de Alta Calidad ✓
**Objetivo:** Verificar que un buen generador pase ambas pruebas

```
Parámetros:
g = 16
a = 44509 (o 1103515245 mod 65536)
c = 12345
X₀ = 1
N = 1000

Resultado Esperado: ✓ VÁLIDO (ambas pruebas aprobadas)
- Correlación < 0.05
- χ² < χ²crítico
```

### Test 2: Generador Simple (Calidad Media) ~
**Objetivo:** Probar con parámetros básicos

```
Parámetros:
g = 8
a = 137
c = 0
X₀ = 1
N = 256

Resultado: Verificar resultados
- Puede aprobar o fallar dependiendo de N
- Usar botón regenerar si falla
```

### Test 3: Generador Pobre ✗
**Objetivo:** Demostrar un generador de mala calidad

```
Parámetros:
g = 4
a = 2
c = 0
X₀ = 1
N = 16

Resultado Esperado: ✗ NO VÁLIDO (fallan pruebas)
- Alta correlación
- Distribución no uniforme
- Ciclo corto detectado
```

### Test 4: Probando el Botón Regenerar 🔄
**Objetivo:** Usar la función de regeneración automática

```
Paso 1: Ingresar parámetros que fallen (Test 3)
Paso 2: Hacer clic en "Generar"
Paso 3: Ver que aparece ✗ NO VÁLIDO
Paso 4: Hacer clic en "🔄 Regenerar con Nueva Semilla"
Paso 5: Sistema ajusta X₀ automáticamente
Paso 6: Repetir hasta obtener ✓ VÁLIDO
```

### Test 5: Comparación de Tamaños de Muestra
**Objetivo:** Entender el efecto de N en las pruebas

```
Configuración A:
g = 10, a = 421, c = 1, X₀ = 1, N = 100

Configuración B:
g = 10, a = 421, c = 1, X₀ = 1, N = 1000

Configuración C:
g = 10, a = 421, c = 1, X₀ = 1, N = 10000

Observar: ¿Cómo cambian los resultados con N?
```

## 📊 Qué Observar en Cada Prueba

### 1. Sección de Parámetros
- Valores ingresados (g, m, a, c, X₀, N)
- Detección de ciclos
- Longitud del ciclo si existe

### 2. Resultados de Validación
- **Prueba de Independencia:**
  - Valor de correlación
  - ¿Es < 0.05?
  - Color: verde (✓) o rojo (✗)

- **Prueba de Uniformidad:**
  - χ² calculado
  - χ² crítico
  - Grados de libertad
  - ¿Es χ² < χ²crítico?
  - Color: verde (✓) o rojo (✗)

### 3. Resultado General
- Mensaje global: VÁLIDOS o NO válidos
- Botón regenerar (si falló)

### 4. Gráfico de Dispersión
- Visualizar distribución de puntos
- Idealmente: puntos distribuidos uniformemente
- Detectar patrones visuales

## 🎯 Ejercicios Prácticos

### Ejercicio 1: Encontrar Buenos Parámetros
**Tarea:** Experimentar con diferentes valores de 'a' para g=8
```
Probar:
a = 5, 13, 21, 29, 37, 45, 53, 61, 69, 77, 85, 93, 101, 109, 117, 125, 133, 141, 149
c = 1
X₀ = 1
N = 256

¿Cuáles valores de 'a' dan mejores resultados?
```

### Ejercicio 2: Impacto de la Semilla
**Tarea:** Mismo LCG, diferentes semillas
```
Configuración fija:
g = 10, a = 421, c = 1, N = 1000

Probar X₀:
1, 100, 200, 500, 1000

¿La semilla afecta significativamente los resultados de las pruebas?
```

### Ejercicio 3: Detectar Ciclos Cortos
**Tarea:** Encontrar parámetros que generen ciclos
```
Experimento:
g = 6 (m = 64)
Probar diferentes combinaciones de a y c
Observar: Longitud de ciclo vs. m

¿Qué combinaciones dan ciclo máximo (m)?
```

### Ejercicio 4: Tabla Comparativa
**Tarea:** Crear tabla de resultados

| g | a | c | X₀ | N | Correlación | χ² | ¿Válido? |
|---|---|---|----|----|-------------|-----|----------|
| 8 | 137 | 0 | 1 | 256 | ? | ? | ? |
| 10 | 421 | 1 | 1 | 1024 | ? | ? | ? |
| 12 | 1597 | 51 | 42 | 4096 | ? | ? | ? |

Completar la tabla experimentando con el sistema.

## 🔬 Preguntas de Análisis

1. **Independencia:**
   - ¿Qué significa un coeficiente de correlación de 0.001?
   - ¿Y uno de 0.15?
   - ¿Por qué la independencia es importante?

2. **Uniformidad:**
   - ¿Qué significa que χ² = 15.2 con χ²crítico = 18.3?
   - ¿Por qué usamos nivel de significancia α = 0.05?
   - ¿Qué pasaría con α = 0.01?

3. **Ciclos:**
   - ¿Todos los LCG tienen ciclos?
   - ¿El ciclo afecta las pruebas de validación?
   - ¿Cuál es la longitud máxima de ciclo posible?

4. **Regeneración:**
   - ¿Por qué regenerar con X₀ + 137?
   - ¿Siempre funciona la regeneración?
   - ¿Hay mejores estrategias?

## 📝 Reporte de Práctica (Sugerido)

### Estructura:
1. **Introducción**
   - Objetivo de las pruebas
   - Parámetros probados

2. **Metodología**
   - Descripción de las pruebas
   - Criterios de aceptación

3. **Resultados**
   - Tabla con experimentos realizados
   - Capturas de pantalla

4. **Análisis**
   - ¿Qué configuraciones funcionaron mejor?
   - ¿Por qué algunas fallaron?
   - Patrones observados

5. **Conclusiones**
   - Importancia de validar números aleatorios
   - Limitaciones del LCG
   - Aprendizajes obtenidos

## 🌐 Acceso al Sistema

```bash
# Iniciar servidor
cd /home/k1/proyectos/ramdomseed
npm start

# Abrir navegador
http://localhost:4200/
```

## 💡 Tips para Mejores Resultados

1. **Usar N suficientemente grande:**
   - N < 100: Resultados poco confiables
   - N ≈ 1000: Bueno
   - N > 5000: Excelente

2. **Para m = 2^g, elegir a tal que:**
   - a mod 8 = 5 (si c = 0)
   - a mod 4 = 1 (si c es impar)

3. **Valores de c recomendados:**
   - c = 0 (multiplicativo puro)
   - c = 1, 3, 5, 7... (impares pequeños)
   - c grande e impar (mejor)

4. **Evitar:**
   - a par (genera ciclos muy cortos)
   - c par (reduce período)
   - g muy pequeño (< 8)

## 📞 Soporte

Consultar documentación completa en:
- `VALIDACION_README.md` - Teoría y matemática
- `RESUMEN.md` - Resumen de implementación

---

**¡Éxito en tus experimentos!** 🎲
