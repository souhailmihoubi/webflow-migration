import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../shared/services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  stats = signal<any>(null);
  recentOrders = signal<any[]>([]);
  recentProducts = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data.stats);
        this.recentOrders.set(data.recentOrders);
        this.recentProducts.set(data.recentProducts);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching dashboard stats:', err);
        this.isLoading.set(false);
      },
    });
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-700';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}
