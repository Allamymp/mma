// src/app/app.ts
import { Component, OnInit } from '@angular/core';
import { ApiService, Mock, Template } from './api.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MockFormComponent } from './mock-form/mock-form.component';
import { TemplateFormComponent } from './template-form/template-form.component';
import { ConfigService } from './config.service';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: false
})
export class App implements OnInit {
  activeTab: 'mocks' | 'templates' = 'mocks';
  mocks: string[] = [];
  templates: string[] = [];
  selectedMockDetail: Mock | null = null;
  selectedTemplateDetail: Template | null = null;

  searchTermMocks: string = '';
  searchTermTemplates: string = '';
  filteredMocks: string[] = [];
  filteredTemplates: string[] = [];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private configService: ConfigService
  ) { }

  ngOnInit(): void {
    this.configService.loadConfig().pipe(
      filter(config => config !== null),
      switchMap(() => {
        this.loadMocks();
        this.loadTemplates();
        return this.configService.config$;
      })
    ).subscribe({
      error: (err) => this.showError('Erro crítico ao carregar configuração inicial: ' + err.message)
    });
  }

  // --- Funções de Carregamento ---
  loadMocks(): void {
    this.apiService.getMocks().subscribe({
      next: (data) => {
        this.mocks = data;
        this.applyMockFilter();
      },
      error: (err) => this.showError('Erro ao carregar mocks: ' + err.message)
    });
  }

  loadTemplates(): void {
    this.apiService.getTemplates().subscribe({
      next: (data) => {
        this.templates = data;
        this.applyTemplateFilter();
      },
      error: (err) => this.showError('Erro ao carregar templates: ' + err.message)
    });
  }

  // --- Funções de Filtragem ---
  applyMockFilter(): void {
    if (!this.searchTermMocks) {
      this.filteredMocks = [...this.mocks];
    } else {
      this.filteredMocks = this.mocks.filter(mockKey =>
        mockKey.toLowerCase().includes(this.searchTermMocks.toLowerCase())
      );
    }
  }

  applyTemplateFilter(): void {
    if (!this.searchTermTemplates) {
      this.filteredTemplates = [...this.templates];
    } else {
      this.filteredTemplates = this.templates.filter(templateName =>
        templateName.toLowerCase().includes(this.searchTermTemplates.toLowerCase())
      );
    }
  }

  onSearchMocksChange(event: Event): void {
    this.searchTermMocks = (event.target as HTMLInputElement).value;
    this.applyMockFilter();
  }

  onSearchTemplatesChange(event: Event): void {
    this.searchTermTemplates = (event.target as HTMLInputElement).value;
    this.applyTemplateFilter();
  }

  // --- Funções de Detalhes de Templates (já existentes e funcionando) ---
  getTemplateDetails(name: string): void {
    this.apiService.getTemplateByName(name).subscribe({
      next: (data) => this.selectedTemplateDetail = data,
      error: (err) => this.showError('Erro ao carregar detalhes do template: ' + err.message)
    });
  }

  viewTemplateDetail(name: string): void {
    this.getTemplateDetails(name);
  }

  editTemplate(templateName: string): void {
    this.apiService.getTemplateByName(templateName).subscribe({
      next: (templateData) => {
        const dialogRef = this.dialog.open(TemplateFormComponent, {
          width: '600px',
          data: { template: templateData, name: templateName }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.apiService.deleteTemplate(templateName).subscribe(() => {
              this.apiService.createTemplate(result).subscribe({
                next: () => {
                  this.showSuccess('Template atualizado com sucesso!');
                  this.loadTemplates();
                  if (this.selectedTemplateDetail?.name === templateName) {
                    this.selectedTemplateDetail = result;
                  }
                },
                error: (err) => this.showError('Erro ao atualizar template: ' + (err.error?.error || err.message))
              });
            }, (err) => this.showError('Erro ao deletar template para atualização: ' + (err.error?.error || err.message)));
          }
        });
      },
      error: (err) => this.showError('Erro ao carregar template para edição: ' + err.message)
    });
  }


  // --- Funções de Ação para Mocks ---
  openAddMockDialog(): void {
    const dialogRef = this.dialog.open(MockFormComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.createMock(result).subscribe({
          next: () => {
            this.showSuccess('Mock criado com sucesso!');
            this.loadMocks();
          },
          error: (err) => this.showError('Erro ao criar mock: ' + (err.error?.error || err.message))
        });
      }
    });
  }

  deleteMock(mockKey: string): void {
    if (confirm(`Tem certeza que deseja deletar o mock "${mockKey}"?`)) {
      this.apiService.deleteMock(mockKey).subscribe({
        next: () => {
          this.showSuccess('Mock deletado com sucesso!');
          this.loadMocks();
          if (this.selectedMockDetail && this.getMockKey(this.selectedMockDetail) === mockKey) {
            this.selectedMockDetail = null;
          }
        },
        error: (err) => this.showError('Erro ao deletar mock: ' + (err.error?.error || err.message))
      });
    }
  }

  // --- Funções de Visualização e Edição de Mocks (NOVAS E ATUALIZADAS) ---

  // Obtém e exibe os detalhes de um mock em um card
  viewMockDetail(mockKey: string): void {
    this.apiService.getMockByKey(mockKey).subscribe({
      next: (data) => this.selectedMockDetail = data, // Armazena os dados completos do mock
      error: (err) => this.showError('Erro ao carregar detalhes do mock: ' + err.message)
    });
  }

  // Abre o formulário de mock para edição
  editMock(mockKey: string): void {
    this.apiService.getMockByKey(mockKey).subscribe({
      next: (mockData) => {
        const dialogRef = this.dialog.open(MockFormComponent, {
          width: '600px',
          data: { mock: mockData, indexKey: mockKey } // Passa os dados do mock para o formulário
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // Lógica de edição: deletar o mock antigo e criar o novo
            this.apiService.deleteMock(mockKey).subscribe(() => {
              this.apiService.createMock(result).subscribe({
                next: () => {
                  this.showSuccess('Mock atualizado com sucesso!');
                  this.loadMocks();
                  // Se o detalhe do mock estava aberto, atualiza-o
                  if (this.selectedMockDetail && this.getMockKey(this.selectedMockDetail) === mockKey) {
                    this.selectedMockDetail = result;
                  }
                },
                error: (err) => this.showError('Erro ao atualizar mock: ' + (err.error?.error || err.message))
              });
            }, (err) => this.showError('Erro ao deletar mock para atualização: ' + (err.error?.error || err.message)));
          }
        });
      },
      error: (err) => this.showError('Erro ao carregar mock para edição: ' + err.message)
    });
  }


  // --- Funções de Ação para Templates ---
  openAddTemplateDialog(): void {
    const dialogRef = this.dialog.open(TemplateFormComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.createTemplate(result).subscribe({
          next: () => {
            this.showSuccess('Template criado com sucesso!');
            this.loadTemplates();
          },
          error: (err) => this.showError('Erro ao criar template: ' + (err.error?.error || err.message))
        });
      }
    });
  }

  deleteTemplate(templateName: string): void {
    if (confirm(`Tem certeza que deseja deletar o template "${templateName}"?`)) {
      this.apiService.deleteTemplate(templateName).subscribe({
        next: () => {
          this.showSuccess('Template deletado com sucesso!');
          this.loadTemplates();
          if (this.selectedTemplateDetail?.name === templateName) {
            this.selectedTemplateDetail = null;
          }
        },
        error: (err) => this.showError('Erro ao deletar template: ' + (err.error?.error || err.message))
      });
    }
  }

  // --- Utilidades ---
  showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 5000, panelClass: ['error-snackbar'] });
  }

  getMockKey(mock: Mock): string {
    return mock.method + '_' + mock.path;
  }
}