import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

interface Article {
  id: string;
  title: string;
  sku?: string;
  price?: number;
  category?: string;
  description?: string;
  imageDataUrl?: string;
  createdAt: string;
  updatedAt?: string;
  history?: Array<{ when: string; action: string; note?: string }>;
}

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent {
  articles: Article[] = [];
  filtered: Article[] = [];

  editing = false;
  showForm = false;
  form: Partial<Article> = {};
  currentImagePreview = '';

  searchTerm = '';
  selectedCategory = '';

  importError = '';

  showHistoryModal = false;
  historyTarget: Article | null = null;

  private storageKey = 'app_articles_v1';

  // Pagination
  pageSize = 10;
  currentPage = 1;
  public Math = Math;

  constructor() {
    this.loadArticles();
    this.applyFilters();
  }

  private nowIso() {
    return new Date().toISOString();
  }

  private loadArticles() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        this.articles = JSON.parse(raw) as Article[];
      } else {
        this.articles = [];
      }
    } catch (e) {
      console.error('Erreur lecture articles', e);
      this.articles = [];
    }
    this.applyFilters();
  }

  private saveArticles() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.articles));
    this.applyFilters();
  }

  openCreate() {
    this.editing = false;
    this.showForm = true;
    this.form = { title: '', price: 0, category: '', description: '' };
    this.currentImagePreview = '';
    this.importError = '';
  }

  openEdit(a: Article) {
    this.editing = true;
    this.showForm = true;
    this.form = { ...a };
    this.currentImagePreview = a.imageDataUrl || '';
    this.importError = '';
  }

  closeForm() {
    this.showForm = false;
    this.form = {};
    this.currentImagePreview = '';
  }

  saveForm() {
    if (!this.form.title || this.form.title.trim() === '') {
      this.importError = 'Le titre est requis.';
      return;
    }
    if (this.editing && this.form.id) {
      const idx = this.articles.findIndex(x => x.id === this.form.id);
      if (idx >= 0) {
        const updated: Article = {
          ...(this.articles[idx]),
          title: (this.form.title as string).trim(),
          sku: this.form.sku,
          price: Number(this.form.price) || 0,
          category: this.form.category,
          description: this.form.description,
          imageDataUrl: this.currentImagePreview || this.articles[idx].imageDataUrl,
          updatedAt: this.nowIso(),
          history: (this.articles[idx].history || []).concat([{ when: this.nowIso(), action: 'modified' }])
        };
        this.articles[idx] = updated;
        this.saveArticles();
        this.closeForm();
        return;
      }
    } else {
      const newArticle: Article = {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
        title: (this.form.title || '').trim(),
        sku: this.form.sku,
        price: Number(this.form.price) || 0,
        category: this.form.category,
        description: this.form.description,
        imageDataUrl: this.currentImagePreview || '',
        createdAt: this.nowIso(),
        history: [{ when: this.nowIso(), action: 'created' }]
      };
      this.articles.unshift(newArticle);
      this.saveArticles();
      this.closeForm();
    }
  }

  confirmDelete(id?: string) {
    if (!id) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    this.articles = this.articles.filter(a => a.id !== id);
    // adjust page if needed after deletion
    this.applyFilters();
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.saveArticles();
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.currentImagePreview = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }

  get categories(): string[] {
    const set = new Set(this.articles.map(a => a.category || '').filter(Boolean));
    return Array.from(set).sort();
  }

  applyFilters() {
    let list = [...this.articles];
    if (this.searchTerm && this.searchTerm.trim()) {
      const q = this.searchTerm.trim().toLowerCase();
      list = list.filter(a =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.sku || '').toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q)
      );
    }
    if (this.selectedCategory) {
      list = list.filter(a => a.category === this.selectedCategory);
    }
    this.filtered = list;
    // reset to first page after filtering
    this.currentPage = 1;
  }

  // Pagination helpers
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedArticles(): Article[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  goToPage(n: number) {
    if (n < 1) n = 1;
    if (n > this.totalPages) n = this.totalPages;
    this.currentPage = n;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  exportCSV() {
    const header = ['id', 'title', 'sku', 'price', 'category', 'description', 'imageDataUrl', 'createdAt', 'updatedAt'];
    const rows = this.articles.map(a => [
      this.csvEscape(a.id),
      this.csvEscape(a.title),
      this.csvEscape(a.sku || ''),
      this.csvEscape(String(a.price || '')),
      this.csvEscape(a.category || ''),
      this.csvEscape(a.description || ''),
      this.csvEscape(a.imageDataUrl || ''),
      this.csvEscape(a.createdAt),
      this.csvEscape(a.updatedAt || '')
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'articles_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  private csvEscape(value?: string) {
    if (value == null) return '""';
    const safe = String(value).replace(/"/g, '""');
    return `"${safe}"`;
  }

  async importCSVFile(ev: Event) {
    this.importError = '';
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
      if (lines.length < 2) throw new Error('CSV vide ou sans en-têtes.');
      const headers = this.parseCsvLine(lines[0]);
      const required = ['title'];
      for (const r of required) {
        if (!headers.includes(r)) {
          throw new Error(`En-tête manquant: ${r}`);
        }
      }
      const newItems: Article[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = this.parseCsvLine(lines[i]);
        const obj: any = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = cols[j] || '';
        }
        const article: Article = {
          id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
          title: obj.title || 'Sans titre',
          sku: obj.sku || '',
          price: Number(obj.price) || 0,
          category: obj.category || '',
          description: obj.description || '',
          imageDataUrl: obj.imageDataUrl || '',
          createdAt: this.nowIso(),
          history: [{ when: this.nowIso(), action: 'imported' }]
        };
        newItems.push(article);
      }
      this.articles = [...newItems, ...this.articles];
      this.saveArticles();
    } catch (err: any) {
      console.error(err);
      this.importError = err?.message || 'Erreur import CSV';
    } finally {
      if (input) input.value = '';
    }
  }

  private parseCsvLine(line: string) {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  }

  openHistory(a: Article) {
    this.historyTarget = a;
    this.showHistoryModal = true;
  }

  closeHistory() {
    this.historyTarget = null;
    this.showHistoryModal = false;
  }
}
