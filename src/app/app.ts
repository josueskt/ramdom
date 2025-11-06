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
}
