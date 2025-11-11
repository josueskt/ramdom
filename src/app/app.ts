import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-root',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  protected readonly title = signal('ramdomseed');
  form: FormGroup;
  results: { index: number, value: number, normalized: number }[] = [];
  g!: number;
  m!: number;
  N!: number;
  a!: number;
  c!: number;
  X0!: number;
  errorMessage: string = '';
  cycleLength: number = 0;
  cycleDetected: boolean = false;
  
  // Validation test results
  validationResults = {
    independenceTest: { passed: false, correlation: 0, threshold: 0.05 },
    uniformityTest: { passed: false, chiSquare: 0, criticalValue: 0, degreesOfFreedom: 0 },
    overallValid: false
  };
  testsPerformed: boolean = false;
  
  @ViewChild('scatterChart', { static: false }) scatterChartRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      g: ['', [Validators.required, Validators.min(1), Validators.max(20)]],
      a: ['', [Validators.required, Validators.min(1)]],
      c: ['', [Validators.required, Validators.min(0)]],
      X0: ['', [Validators.required, Validators.min(0)]],
      N: ['', [Validators.required, Validators.min(1), Validators.max(100000)]]
    });

    // Cuando cambia g, actualizar N automáticamente
    this.form.get('g')?.valueChanges.subscribe(value => {
      if (value && !isNaN(value)) {
        const calculatedM = Math.pow(2, parseInt(value));
        this.form.patchValue({ N: calculatedM }, { emitEvent: false });
      }
    });
  }

  ngAfterViewInit() {
    // Chart will be initialized after first generation
  }

  generate() {
    this.errorMessage = '';
    this.results = [];
    this.cycleDetected = false;
    this.cycleLength = 0;

    try {
      // Convertir y validar entradas
      this.g = parseInt(this.form.value.g);
      this.a = parseInt(this.form.value.a);
      this.c = parseInt(this.form.value.c);
      this.X0 = parseInt(this.form.value.X0);
      this.N = parseInt(this.form.value.N);

      // Validar que sean números enteros
      if (isNaN(this.g) || isNaN(this.a) || isNaN(this.c) || isNaN(this.X0) || isNaN(this.N)) {
        throw new Error('Todos los campos deben ser números enteros.');
      }

      // Validar g
      if (this.g < 1) throw new Error('El exponente (g) debe ser ≥ 1.');
      if (this.g > 20) throw new Error('El exponente (g) debe ser ≤ 20 para evitar desbordamiento.');

      // Calcular m
      this.m = Math.pow(2, this.g);

      // Validar N
      if (this.N < 1 || this.N > 100000) {
        throw new Error('N debe estar entre 1 y 100000.');
      }

      // Validar rangos
      if (this.a < 1) throw new Error('El multiplicador (a) debe ser ≥ 1.');
      if (this.c < 0) throw new Error('La constante aditiva (c) debe ser ≥ 0.');
      if (this.X0 < 0 || this.X0 >= this.m) throw new Error(`La semilla (X₀) debe cumplir: 0 ≤ X₀ < m = ${this.m}.`);
      if (this.a >= this.m) throw new Error(`El multiplicador (a) debe ser menor que m = ${this.m}.`);
      if (this.c >= this.m) throw new Error(`La constante (c) debe ser menor que m = ${this.m}.`);

      // Confirmar si se generan más de 100 números
     

      // Implementar LCG con detección de ciclo
      let x = this.X0;
      const seen = new Map<number, number>(); // valor -> índice donde apareció
      seen.set(x, 0);

      for (let i = 0; i < this.N; i++) {
        x = (this.a * x + this.c) % this.m;
        const normalized = x / this.m;
        
        this.results.push({ 
          index: i + 1, 
          value: x,
          normalized: normalized
        });

        // Detectar ciclo
        if (seen.has(x) && !this.cycleDetected) {
          this.cycleDetected = true;
          this.cycleLength = i + 1 - seen.get(x)!;
        }
        
        if (!seen.has(x)) {
          seen.set(x, i + 1);
        }
      }

      // Update the scatter chart after Angular renders the canvas
      setTimeout(() => {
        this.updateChart();
        this.performValidationTests();
      }, 0);

    } catch (err: any) {
      this.errorMessage = err.message;
    }
  }

  reset() {
    this.form.reset();
    this.results = [];
    this.errorMessage = '';
    this.cycleDetected = false;
    this.cycleLength = 0;
    this.testsPerformed = false;
    this.validationResults = {
      independenceTest: { passed: false, correlation: 0, threshold: 0.05 },
      uniformityTest: { passed: false, chiSquare: 0, criticalValue: 0, degreesOfFreedom: 0 },
      overallValid: false
    };
    
    // Destroy chart if exists
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  updateChart() {
    if (!this.scatterChartRef) {
      console.log('scatterChartRef no está disponible');
      return;
    }

    const canvas = this.scatterChartRef.nativeElement;
    if (!canvas) {
      console.log('canvas no está disponible');
      return;
    }

    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.log('context no está disponible');
      return;
    }

    // Destroy previous chart if exists
    if (this.chart) {
      this.chart.destroy();
    }

    // Prepare data for scatter plot (normalized values)
    const scatterData = this.results.map(r => ({
      x: r.index,
      y: r.normalized
    }));

    console.log('Creando gráfico con', scatterData.length, 'puntos');

    // Create new chart
    this.chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Valores Normalizados (uₖ = Xₖ / m)',
          data: scatterData,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Diagrama de Dispersión (Índice vs Valor Normalizado)',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Índice',
              font: {
                size: 14
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Valor Normalizado (uₖ)',
              font: {
                size: 14
              }
            },
            min: 0,
            max: 1
          }
        }
      }
    });
  }

  /**
   * Perform validation tests on the generated numbers
   */
  performValidationTests() {
    this.testsPerformed = true;
    
    // Test 1: Independence Test (Correlation)
    this.validationResults.independenceTest = this.independenceTest();
    
    // Test 2: Uniformity Test (Chi-Square)
    this.validationResults.uniformityTest = this.uniformityTest();
    
    // Overall validation
    this.validationResults.overallValid = 
      this.validationResults.independenceTest.passed && 
      this.validationResults.uniformityTest.passed;
  }

  /**
   * Independence Test: Check for correlation between consecutive numbers
   * Uses Pearson correlation coefficient
   */
  independenceTest(): { passed: boolean, correlation: number, threshold: number } {
    const threshold = 0.05; // Correlation should be close to 0 (< 0.05 is good)
    
    if (this.results.length < 2) {
      return { passed: false, correlation: 0, threshold };
    }

    // Calculate correlation between consecutive normalized values
    const values = this.results.map(r => r.normalized);
    const n = values.length - 1;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    
    for (let i = 0; i < n; i++) {
      const x = values[i];
      const y = values[i + 1];
      
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    }
    
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    const numerator = sumXY - n * meanX * meanY;
    const denominator = Math.sqrt((sumX2 - n * meanX * meanX) * (sumY2 - n * meanY * meanY));
    
    const correlation = denominator === 0 ? 0 : Math.abs(numerator / denominator);
    
    return {
      passed: correlation < threshold,
      correlation: correlation,
      threshold: threshold
    };
  }

  /**
   * Uniformity Test: Chi-Square test
   * Divides [0,1] into k intervals and checks if distribution is uniform
   */
  uniformityTest(): { passed: boolean, chiSquare: number, criticalValue: number, degreesOfFreedom: number } {
    const k = Math.min(20, Math.floor(Math.sqrt(this.results.length))); // Number of intervals
    const alpha = 0.05; // Significance level
    const degreesOfFreedom = k - 1;
    
    // Chi-square critical values table for alpha = 0.05
    const chiSquareCritical = this.getChiSquareCriticalValue(degreesOfFreedom, alpha);
    
    // Count frequencies in each interval
    const observed = new Array(k).fill(0);
    const expected = this.results.length / k;
    
    for (const result of this.results) {
      const intervalIndex = Math.min(Math.floor(result.normalized * k), k - 1);
      observed[intervalIndex]++;
    }
    
    // Calculate chi-square statistic
    let chiSquare = 0;
    for (let i = 0; i < k; i++) {
      chiSquare += Math.pow(observed[i] - expected, 2) / expected;
    }
    
    return {
      passed: chiSquare < chiSquareCritical,
      chiSquare: chiSquare,
      criticalValue: chiSquareCritical,
      degreesOfFreedom: degreesOfFreedom
    };
  }

  /**
   * Get Chi-Square critical value for given degrees of freedom and alpha
   */
  getChiSquareCriticalValue(df: number, alpha: number): number {
    // Chi-square critical values table for alpha = 0.05
    const chiSquareTable: { [key: number]: number } = {
      1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488, 5: 11.070,
      6: 12.592, 7: 14.067, 8: 15.507, 9: 16.919, 10: 18.307,
      11: 19.675, 12: 21.026, 13: 22.362, 14: 23.685, 15: 24.996,
      16: 26.296, 17: 27.587, 18: 28.869, 19: 30.144, 20: 31.410,
      25: 37.652, 30: 43.773, 40: 55.758, 50: 67.505, 60: 79.082,
      70: 90.531, 80: 101.879, 90: 113.145, 100: 124.342
    };
    
    if (chiSquareTable[df]) {
      return chiSquareTable[df];
    }
    
    // Approximation for large df
    return df + Math.sqrt(2 * df) * 1.645; // Using normal approximation
  }

  /**
   * Regenerate numbers with adjusted parameters
   */
  regenerate() {
    // Strategy: Try to find better parameters
    // Option 1: Increase the seed
    const currentX0 = parseInt(this.form.value.X0);
    const newX0 = (currentX0 + 137) % this.m; // Add prime number and wrap
    
    this.form.patchValue({
      X0: newX0
    });
    
    // Generate again
    this.generate();
  }
}
