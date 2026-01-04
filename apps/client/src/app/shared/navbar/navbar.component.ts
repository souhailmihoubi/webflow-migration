import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AuthModalComponent } from '../auth/auth-modal/auth-modal.component';
import { CategoryService } from '../services/category.service';
import { SearchModalComponent } from '../search/search-modal/search-modal.component';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AuthModalComponent,
    SearchModalComponent,
  ],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private router = inject(Router);

  // Expose signals from services
  currentUser = this.authService.currentUser;
  isAuthModalOpen = this.authService.isAuthModalOpen;
  categories = this.categoryService.categories;
  cartCount = this.cartService.cartCount;

  isUserDropdownOpen = false;
  isCategoriesDropdownOpen = false;
  isMobileMenuOpen = false;
  isSearchModalOpen = false;

  ngOnInit() {
    this.categoryService.fetchCategories().subscribe();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isUserDropdownOpen = false;
      this.isCategoriesDropdownOpen = false;
      this.isSearchModalOpen = false;
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  openSearchModal() {
    this.isSearchModalOpen = true;
    this.isMobileMenuOpen = false;
  }

  closeSearchModal() {
    this.isSearchModalOpen = false;
  }

  openAuthModal() {
    this.authService.openAuthModal();
  }

  closeAuthModal() {
    this.authService.closeAuthModal();
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
    this.router.navigate(['/']);
  }
}
