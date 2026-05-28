import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { StockService, Stock } from '../../services/stock.service';
import { SupplierService, Supplier } from '../../services/supplier.service';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  stocks: Stock[] = [];
  currentStock: Stock = this.getEmptyStock();
  isEditing = false;
  showModal = false;
  loading = false;
  error: string | null = null;

  suppliersList: Supplier[] = [];

  constructor(private stockService: StockService, private supplierService: SupplierService) {}

  ngOnInit(): void {
    this.loadStocks();
    this.loadSuppliers();
  }

  private getEmptyStock(): Stock {
    return { name: '', quantity: 0, location: '', sku: '', price: 0, supplier: '', reorderLevel: 0, description: '' };
  }

  loadStocks(): void {
    this.loading = true;
    this.stockService.getStocks().subscribe({
      next: (res) => { this.stocks = res; this.loading = false; },
      error: (err) => { this.error = 'Erreur lors du chargement des stocks'; this.loading = false; }
    });
  }

  openCreateModal(): void {
    this.currentStock = this.getEmptyStock();
    this.isEditing = false;
    this.showModal = true;
    this.error = null;
  }
  openEditModal(s: Stock): void {
    this.currentStock = { ...s };
    this.isEditing = true;
    this.showModal = true;
    this.error = null;
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({ next: (s) => this.suppliersList = s, error: () => {/* ignore */} });
  }

  closeModal(): void {
    this.showModal = false;
    this.currentStock = this.getEmptyStock();
    this.isEditing = false;
    this.error = null;
  }

  saveStock(): void {
    if (this.isEditing && this.currentStock.id) {
      this.stockService.updateStock(this.currentStock.id, this.currentStock).subscribe({
        next: () => { this.loadStocks(); this.closeModal(); },
        error: () => this.error = 'Erreur lors de la modification'
      });
    } else {
      this.stockService.createStock(this.currentStock).subscribe({
        next: () => { this.loadStocks(); this.closeModal(); },
        error: () => this.error = 'Erreur lors de la création'
      });
    }
  }

  deleteStock(id?: number): void {
    if (!id) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce stock ?')) return;
    this.stockService.deleteStock(id).subscribe({
      next: () => this.loadStocks(),
      error: () => this.error = 'Erreur lors de la suppression'
    });
  }
}
