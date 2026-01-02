import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService, Client } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  currentClient: Client = this.getEmptyClient();
  isEditing = false;
  showModal = false;
  currentUser: string | null = null;
  errorMessage = '';

  constructor(
    private clientService: ClientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des clients';
        console.error('Erreur:', error);
      }
    });
  }

  openCreateModal(): void {
    this.currentClient = this.getEmptyClient();
    this.isEditing = false;
    this.showModal = true;
  }

  openEditModal(client: Client): void {
    this.currentClient = {...client};
    this.isEditing = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentClient = this.getEmptyClient();
    this.errorMessage = '';
  }

  saveClient(): void {
    console.log(this.currentClient);
    if (this.isEditing && this.currentClient.id) {
      this.clientService.updateClient(this.currentClient.id, this.currentClient).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la modification';
          console.error('Erreur:', error);
        }
      });
    } else {
      this.clientService.createClient(this.currentClient).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la création';
          console.error('Erreur:', error);
        }
      });
    }
  }

  deleteClient(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.loadClients();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  private getEmptyClient(): Client {
    return {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: ''
    };
  }
}