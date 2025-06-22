import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:3000';  

  constructor(private http: HttpClient) { }

  // --- Mocks ---
  getMocks(): Observable<string[]> {
    const url = `${this.apiUrl}/mocks`;
    console.log('API Call: GET Mocks - URL:', url);
    return this.http.get<string[]>(url);
  }

  getMockByKey(mockKey: string): Observable<Mock> {
    const encodedKey = encodeURIComponent(mockKey);
    const urlToGet = `<span class="math-inline">\{this\.apiUrl\}/mocks/details/</span>{encodedKey}`;
    console.log('API Call: GET Mock by Key - URL:', urlToGet);
    return this.http.get<Mock>(urlToGet);
  }

  createMock(mock: Mock): Observable<Mock> {
    const url = `${this.apiUrl}/mocks`;
    console.log('API Call: POST Mock - URL:', url, 'Body:', mock);
    return this.http.post<Mock>(url, mock);
  }

  deleteMock(indexKey: string): Observable<any> {
    const encodedKey = encodeURIComponent(indexKey);
    const urlToDelete = `<span class="math-inline">\{this\.apiUrl\}/mocks/</span>{encodedKey}`;
    console.log('API Call: DELETE Mock - URL:', urlToDelete);
    return this.http.delete(urlToDelete);
  }

  // --- Templates ---
  getTemplates(): Observable<string[]> {
    const url = `${this.apiUrl}/templates`;
    console.log('API Call: GET Templates - URL:', url);
    return this.http.get<string[]>(url);
  }

  getTemplateByName(name: string): Observable<Template> {
    const encodedName = encodeURIComponent(name);
    const urlToGet = `<span class="math-inline">\{this\.apiUrl\}/templates/</span>{encodedName}`;
    console.log('API Call: GET Template by Name - URL:', urlToGet);
    return this.http.get<Template>(urlToGet);
  }

  createTemplate(template: Template): Observable<Template> {
    const url = `${this.apiUrl}/templates`;
    console.log('API Call: POST Template - URL:', url, 'Body:', template);
    return this.http.post<Template>(url, template);
  }

  deleteTemplate(name: string): Observable<any> {
    const encodedName = encodeURIComponent(name);
    const urlToDelete = `<span class="math-inline">\{this\.apiUrl\}/templates/</span>{encodedName}`;
    console.log('API Call: DELETE Template - URL:', urlToDelete);
    return this.http.delete(urlToDelete);
  }
}