import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contact = {
    nom: '',
    email: '',
    sujet: '',
    message: ''
  };
  
  submitted = false;
  isLoading = false;

  onSubmit(): void {
    this.isLoading = true;
    
    // Simulation d'envoi
    setTimeout(() => {
      this.isLoading = false;
      this.submitted = true;
      
      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        this.submitted = false;
        this.contact = {
          nom: '',
          email: '',
          sujet: '',
          message: ''
        };
      }, 3000);
    }, 1500);
  }
}