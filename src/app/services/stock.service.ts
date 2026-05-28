import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface Stock {
  id?: number;
  name: string;
  quantity: number;
  sku?: string;
  price?: number;
  supplier?: string;
  reorderLevel?: number;
  description?: string;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:5000/api/stocks';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getStocks(): Observable<Stock[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(map(items => items.map(i => this.mapStock(i))));
  }

  getStock(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createStock(stock: Stock): Observable<Stock> {
    return this.http.post<Stock>(this.apiUrl, stock, { headers: this.getHeaders() });
  }

  updateStock(id: number, stock: Stock): Observable<Stock> {
    return this.http.put<Stock>(`${this.apiUrl}/${id}`, stock, { headers: this.getHeaders() });
  }

  deleteStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  private mapStock(s: any): Stock {
    return {
      id: s.Id ?? s.id,
      name: s.Name ?? s.name,
      quantity: s.Quantity ?? s.quantity,
      sku: s.Sku ?? s.sku,
      price: s.Price ?? s.price,
      supplier: s.Supplier ?? s.supplier,
      reorderLevel: s.ReorderLevel ?? s.reorderLevel,
      description: s.Description ?? s.description,
      location: s.Location ?? s.location
    };
  }
}
