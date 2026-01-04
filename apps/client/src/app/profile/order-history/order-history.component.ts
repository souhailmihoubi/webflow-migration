import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../shared/services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-history.component.html',
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<any[]>([]);
  isLoading = signal(true);
  confirmingOrderId = signal<string | null>(null);

  ngOnInit() {
    this.refreshOrders();
  }

  refreshOrders() {
    this.isLoading.set(true);
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.isLoading.set(false);
      },
    });
  }

  cancelOrder(orderId: string) {
    console.log('Sending cancellation request to service for ID:', orderId);
    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        console.log('Order cancelled successfully.');
        this.confirmingOrderId.set(null);
        this.refreshOrders();
      },
      error: (err) => {
        console.error('Error cancelling order:', err);
        alert("Une erreur est survenue lors de l'annulation de la commande.");
        this.confirmingOrderId.set(null);
      },
    });
  }

  askToCancel(orderId: string) {
    this.confirmingOrderId.set(orderId);
  }

  abortCancel() {
    this.confirmingOrderId.set(null);
  }

  getStatusClass(status: string): string {
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

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONFIRMED':
        return 'Confirmée';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  }
}
