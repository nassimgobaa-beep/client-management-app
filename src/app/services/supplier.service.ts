import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface Supplier {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private apiUrl = 'http://localhost:5000/api/suppliers';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
  }

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(map(items => items.map(i => this.mapSupplier(i))));
  }

  getSupplier(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createSupplier(s: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, s, { headers: this.getHeaders() });
  }

  updateSupplier(id: number, s: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, s, { headers: this.getHeaders() });
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  private mapSupplier(s: any): Supplier {
    return {
      id: s.Id ?? s.id,
      name: s.Name ?? s.name,
      email: s.Email ?? s.email,
      phone: s.Phone ?? s.phone,
      address: s.Address ?? s.address,
      contactPerson: s.ContactPerson ?? s.contactPerson,
      notes: s.Notes ?? s.notes
    };
  }
}
