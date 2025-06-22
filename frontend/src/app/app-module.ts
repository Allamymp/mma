// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // <<-- VERIFIQUE AQUI TAMBÉM

// Angular Material Modules - Certifique-se de que TODOS estes estão importados corretamente!
// Cada import deve vir de seu pacote específico (ex: @angular/material/toolbar)
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

// Para a funcionalidade de busca em selects (ngx-mat-select-search)
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search'; // <<-- ATENÇÃO AO NOME AQUI!

// Seus componentes declarados
import { App } from './app'; // Seu App Component
import { MockFormComponent } from './mock-form/mock-form.component'; // Corrija o caminho se for diferente
import { TemplateFormComponent } from './template-form/template-form.component'; // Corrija o caminho se for diferente

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
    ReactiveFormsModule,
    FormsModule,

    // Angular Material Modules - A ordem não é estritamente importante, mas a presença SIM.
    MatToolbarModule,
    MatTabsModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatCardModule,

    NgxMatSelectSearchModule // <<-- Confirme que está aqui e sem erros de digitação no nome
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }