import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AuthModalComponent } from '../auth/auth-modal/auth-modal.component';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthModalComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);

  isAuthModalOpen = false;
  isUserDropdownOpen = false;
  isCategoriesDropdownOpen = false;

  // Expose signals from services
  currentUser = this.authService.currentUser;
  categories = this.categoryService.categories;

  ngOnInit() {
    this.categoryService.fetchCategories().subscribe();
  }

  openAuthModal() {
    this.isAuthModalOpen = true;
  }

  closeAuthModal() {
    this.isAuthModalOpen = false;
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    if (this.isUserDropdownOpen) this.isCategoriesDropdownOpen = false;
  }

  toggleCategoriesDropdown(event?: Event) {
    if (event) event.preventDefault();
    this.isCategoriesDropdownOpen = !this.isCategoriesDropdownOpen;
    if (this.isCategoriesDropdownOpen) this.isUserDropdownOpen = false;
  }

  closeDropdowns() {
    this.isUserDropdownOpen = false;
    this.isCategoriesDropdownOpen = false;
  }

  logout() {
    this.authService.logout();
    this.isUserDropdownOpen = false;
  }
}
