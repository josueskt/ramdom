import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ramdomseed');
    form: FormGroup;
  results: { index: number, value: number }[] = [];
  a!: number;
  m!: number;
  errorMessage: string = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      X0: ['', [Validators.required]],
      k: ['', [Validators.required]],
      g: ['', [Validators.required]],
      c: ['', [Validators.required]],
      N: ['', [Validators.required]]
    });
  }

  generate() {
    this.errorMessage = '';
    this.results = [];

    try {
      // Convertir y validar entradas
      let X0 = parseInt(this.form.value.X0);
      let k = parseInt(this.form.value.k);
      let g = parseInt(this.form.value.g);
      let c = parseInt(this.form.value.c);
      let N = parseInt(this.form.value.N);

      if (isNaN(X0) || isNaN(k) || isNaN(g) || isNaN(c) || isNaN(N)) {
        throw new Error('Todos los campos deben ser números enteros.');
      }

      if (X0 < 0) throw new Error('X0 debe ser ≥ 0.');
      if (k < 0) throw new Error('k debe ser ≥ 0.');
      if (g < 1) throw new Error('g debe ser ≥ 1.');
      if (N < 1 || N > 10000) throw new Error('N debe estar entre 1 y 10000.');

      this.m = Math.pow(2, g);

      if (X0 >= this.m) throw new Error(`X0 debe ser menor que m = 2^g = ${this.m}.`);
      if (c < 0 || c >= this.m) throw new Error(`c debe estar entre 0 y m-1 = ${this.m-1}.`);

      this.a = 1 + 4 * k;

      let x = X0;
      for (let i = 0; i < N; i++) {
        x = (this.a * x + c) % this.m;
        this.results.push({ index: i + 1, value: x });
      }

    } catch (err: any) {
      this.errorMessage = err.message;
    }
  }
}
