import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service'; // <<-- NOVO IMPORT

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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000'; // <<-- AJUSTE PARA A PORTA REAL DA SUA API NODE.JS SE FOR DIFERENTE

  constructor(private http: HttpClient, private configService: ConfigService) { } // <<-- INJETAR ConfigService

  // Método auxiliar para obter os endpoints, garantindo que estejam carregados
  private get apiEndpoints(): any { // Retorna 'any' porque a estrutura de ENDPOINTS é dinâmica
    const config = this.configService.config;
    if (!config || !config.ENDPOINTS) {
      throw new Error('Configuração da API não carregada ou incompleta. Verifique ConfigService.');
    }
    return config.ENDPOINTS;
  }

  // --- Mocks ---
  getMocks(): Observable<string[]> {
    const url = this.apiUrl + this.apiEndpoints.mocks.list;
    console.log('API Call: GET Mocks - URL:', url);
    return this.http.get<string[]>(url);
  }

  getMockByKey(mockKey: string): Observable<Mock> {
    const encodedKey = encodeURIComponent(mockKey);
    const urlToGet = this.apiUrl + this.apiEndpoints.mocks.details.replace(':mockKey', encodedKey);
    console.log('API Call: GET Mock by Key - URL:', urlToGet);
    return this.http.get<Mock>(urlToGet);
  }

  createMock(mock: Mock): Observable<Mock> {
    const url = this.apiUrl + this.apiEndpoints.mocks.create;
    console.log('API Call: POST Mock - URL:', url, 'Body:', mock);
    return this.http.post<Mock>(url, mock);
  }

  deleteMock(indexKey: string): Observable<any> {
    const encodedKey = encodeURIComponent(indexKey);
    const urlToDelete = this.apiUrl + this.apiEndpoints.mocks.deleteSingle.replace(':path', encodedKey);
    console.log('API Call: DELETE Mock - URL:', urlToDelete);
    return this.http.delete(urlToDelete);
  }

  // --- Templates ---
  getTemplates(): Observable<string[]> {
    const url = this.apiUrl + this.apiEndpoints.templates.list;
    console.log('API Call: GET Templates - URL:', url);
    return this.http.get<string[]>(url);
  }

  getTemplateByName(name: string): Observable<Template> {
    const encodedName = encodeURIComponent(name);
    const urlToGet = this.apiUrl + this.apiEndpoints.templates.details.replace(':name', encodedName);
    console.log('API Call: GET Template by Name - URL:', urlToGet);
    return this.http.get<Template>(urlToGet);
  }

  createTemplate(template: Template): Observable<Template> {
    const url = this.apiUrl + this.apiEndpoints.templates.create;
    console.log('API Call: POST Template - URL:', url, 'Body:', template);
    return this.http.post<Template>(url, template);
  }

  deleteTemplate(name: string): Observable<any> {
    const encodedName = encodeURIComponent(name);
    const urlToDelete = this.apiUrl + this.apiEndpoints.templates.deleteSingle.replace(':name', encodedName);
    console.log('API Call: DELETE Template - URL:', urlToDelete);
    return this.http.delete(urlToDelete);
  }
}