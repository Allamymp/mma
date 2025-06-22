// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // <<-- MUITO IMPORTANTE!

// Angular Material Modules - Certifique-se de que TODOS estes estão importados!
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field'; // <<-- CRÍTICO!
import { MatInputModule } from '@angular/material/input';       // <<-- CRÍTICO!
import { MatSelectModule } from '@angular/material/select';     // <<-- CRÍTICO!
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

// Para a funcionalidade de busca em selects (ngx-mat-select-search)
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search'; // <<-- CORRIGIDO AQUI!

// Seus componentes declarados
import { App } from './app'; // Seu App Component (sem .ts, pois é um import padrão)
import { MockFormComponent } from './mock-form/mock-form.component'; // Corrigido o caminho do import
import { TemplateFormComponent } from './template-form/template-form.component'; // Corrigido o caminho do import

@NgModule({
  declarations: [
    App,
    MockFormComponent,
    TemplateFormComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule, // <<-- AQUI!
    FormsModule,         // <<-- AQUI! (necessário para ngModel em mat-select-search)

    // Angular Material Modules - TODOS devem estar aqui
    MatToolbarModule,
    MatTabsModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule, // <<-- AQUI!
    MatInputModule,     // <<-- AQUI!
    MatSelectModule,    // <<-- AQUI!
    MatSnackBarModule,
    MatCardModule,

    NgxMatSelectSearchModule // <<-- AQUI!
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }