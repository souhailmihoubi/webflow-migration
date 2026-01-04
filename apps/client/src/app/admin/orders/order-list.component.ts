import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../shared/services/admin.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.component.html',
})
export class OrderListComponent implements OnInit {
  private adminService = inject(AdminService);

  orders = signal<any[]>([]);
  isLoading = signal(true);
  isUpdating = signal<string | null>(null);

  statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.adminService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.isLoading.set(false);
      },
    });
  }

  updateStatus(orderId: string, status: string) {
    this.isUpdating.set(orderId);
    this.adminService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.loadOrders();
        this.isUpdating.set(null);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.isUpdating.set(null);
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
