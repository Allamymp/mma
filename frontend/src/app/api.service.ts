import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

// Definições de interface para os dados (opcional, mas recomendado para tipagem)
export interface Mock {
  method: string;
  path: string;
  responseStatus: number;
  responseHeaders?: { [key: string]: string };
  responseBody: any;
}

export interface Template {
  name: string;
  responseStatus: number;
  responseHeaders?: { [key: string]: string };
  responseBody: any;
}

// Interface para um objeto de Log de Requisição/Resposta
export interface LogEntry {
  type: 'request' | 'response';
  timestamp: string;
  sourceIp?: string;
  destinationIp?: string;
  method?: string;
  path?: string;
  query?: any;
  status?: number;
  headers: any;
  body: any;
  durationMs?: number;
  truncated?: string; // Para logs truncados
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000'; // <<-- AJUSTE PARA A PORTA REAL DA SUA API NODE.JS SE FOR DIFERENTE

  private apiEndpoints: any; // Será preenchido pelo ConfigService

  constructor(private http: HttpClient, private configService: ConfigService) {
    // Inscreve-se na configuração para ter os ENDPOINTS disponíveis
    this.configService.config$.subscribe(config => {
      if (config) {
        this.apiEndpoints = config.ENDPOINTS;
      }
    });
  }

  // Método auxiliar para obter os endpoints, garantindo que estejam carregados
  private get _apiEndpoints(): any { // Renomeado para evitar conflito com a propriedade
    if (!this.apiEndpoints) {
      throw new Error('Configuração da API não carregada. Aguarde a inicialização.');
    }
    return this.apiEndpoints;
  }

  // --- Mocks ---
  getMocks(): Observable<string[]> {
    const url = this.apiUrl + this._apiEndpoints.mocks.list;
    console.log('API Call: GET Mocks - URL:', url);
    return this.http.get<string[]>(url);
  }

  getMockByKey(mockKey: string): Observable<Mock> {
    const encodedKey = encodeURIComponent(mockKey);
    const urlToGet = this.apiUrl + this._apiEndpoints.mocks.details.replace(':mockKey', encodedKey);
    console.log('API Call: GET Mock by Key - URL:', urlToGet);
    return this.http.get<Mock>(urlToGet);
  }

  createMock(mock: Mock): Observable<Mock> {
    const url = this.apiUrl + this._apiEndpoints.mocks.create;
    console.log('API Call: POST Mock - URL:', url, 'Body:', mock);
    return this.http.post<Mock>(url, mock);
  }

  deleteMock(indexKey: string): Observable<any> {
    const encodedKey = encodeURIComponent(indexKey);
    const urlToDelete = this.apiUrl + this._apiEndpoints.mocks.deleteSingle.replace(':path', encodedKey);
    console.log('API Call: DELETE Mock - URL:', urlToDelete);
    return this.http.delete(urlToDelete);
  }

  // --- Templates ---
  getTemplates(): Observable<string[]> {
    const url = this.apiUrl + this._apiEndpoints.templates.list;
    console.log('API Call: GET Templates - URL:', url);
    return this.http.get<string[]>(url);
  }

  getTemplateByName(name: string): Observable<Template> {
    const encodedName = encodeURIComponent(name);
    const urlToGet = this.apiUrl + this._apiEndpoints.templates.details.replace(':name', encodedName);
    console.log('API Call: GET Template by Name - URL:', urlToGet);
    return this.http.get<Template>(urlToGet);
  }

  createTemplate(template: Template): Observable<Template> {
    const url = this.apiUrl + this._apiEndpoints.templates.create;
    console.log('API Call: POST Template - URL:', url, 'Body:', template);
    return this.http.post<Template>(url, template);
  }

  deleteTemplate(name: string): Observable<any> {
    const encodedName = encodeURIComponent(name);
    const urlToDelete = this.apiUrl + this._apiEndpoints.templates.deleteSingle.replace(':name', encodedName);
    console.log('API Call: DELETE Template - URL:', urlToDelete);
    return this.http.delete(urlToDelete);
  }

  // --- Logs (NOVOS MÉTODOS) ---
  getLogDates(): Observable<string[]> {
    const url = this.apiUrl + this._apiEndpoints.logs.listDates;
    console.log('API Call: GET Log Dates - URL:', url);
    return this.http.get<string[]>(url);
  }

  getLogsByDate(date: string): Observable<LogEntry[]> { // Retorna array de LogEntry
    const url = this.apiUrl + this._apiEndpoints.logs.getLogsByDate.replace(':date', date);
    console.log(`API Call: GET Logs for Date ${date} - URL:`, url);
    return this.http.get<LogEntry[]>(url);
  }
}