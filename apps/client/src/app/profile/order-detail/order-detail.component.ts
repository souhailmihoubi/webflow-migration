import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../shared/services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  order = signal<any>(null);
  isLoading = signal(true);
  isConfirming = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.fetchOrder(id);
      }
    });
  }

  fetchOrder(id: string) {
    this.isLoading.set(true);
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching order:', err);
        this.isLoading.set(false);
      },
    });
  }

  cancelOrder() {
    const o = this.order();
    if (!o) return;

    console.log('Sending cancellation request to service for ID:', o.id);
    this.orderService.cancelOrder(o.id).subscribe({
      next: () => {
        console.log('Order cancelled successfully.');
        this.isConfirming.set(false);
        this.fetchOrder(o.id);
      },
      error: (err) => {
        console.error('Error cancelling order:', err);
        alert("Une erreur est survenue lors de l'annulation.");
        this.isConfirming.set(false);
      },
    });
  }

  askToCancel() {
    this.isConfirming.set(true);
  }

  abortCancel() {
    this.isConfirming.set(false);
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
