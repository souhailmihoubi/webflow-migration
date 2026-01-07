import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../shared/services/category.service';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories-list.component.html',
})
export class CategoriesListComponent implements OnInit {
  private categoryService = inject(CategoryService);

  categories = this.categoryService.categories;

  ngOnInit() {
    this.categoryService.fetchCategories().subscribe();
  }
}
