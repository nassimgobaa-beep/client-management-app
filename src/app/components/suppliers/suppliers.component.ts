import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { SupplierService, Supplier } from '../../services/supplier.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  currentSupplier: Supplier = this.getEmpty();
  showModal = false;
  isEditing = false;
  error = '';

  constructor(private supplierService: SupplierService) {}

  ngOnInit(): void { this.load(); }

  getEmpty(): Supplier { return { name: '', email: '', phone: '', address: '', contactPerson: '', notes: '' }; }

  load(): void {
    this.supplierService.getSuppliers().subscribe({ next: data => this.suppliers = data, error: () => this.error = 'Erreur chargement fournisseurs' });
  }

  openCreate(): void { this.currentSupplier = this.getEmpty(); this.isEditing = false; this.showModal = true; }
  openEdit(s: Supplier): void { this.currentSupplier = { ...s }; this.isEditing = true; this.showModal = true; }
  close(): void { this.showModal = false; this.currentSupplier = this.getEmpty(); }

  save(): void {
    if (this.isEditing && this.currentSupplier.id) {
      this.supplierService.updateSupplier(this.currentSupplier.id, this.currentSupplier).subscribe({ next: () => { this.load(); this.close(); }, error: () => this.error = 'Erreur modification' });
    } else {
      this.supplierService.createSupplier(this.currentSupplier).subscribe({ next: () => { this.load(); this.close(); }, error: () => this.error = 'Erreur création' });
    }
  }

  delete(id?: number): void { if (!id) return; if (!confirm('Supprimer ce fournisseur ?')) return; this.supplierService.deleteSupplier(id).subscribe({ next: () => this.load(), error: () => this.error = 'Erreur suppression' }); }
}
