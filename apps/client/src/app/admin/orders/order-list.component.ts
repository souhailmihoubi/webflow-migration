import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../shared/services/admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './order-list.component.html',
})
export class OrderListComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  orders = signal<any[]>([]);
  totalItems = signal(0);
  itemsPerPage = signal(10);
  currentPage = signal(1);
  isLoading = signal(true);
  isUpdating = signal<string | null>(null);

  // Order details modal
  selectedOrder = signal<any | null>(null);
  showDetailsModal = signal(false);

  // Filter states
  searchTerm = signal('');
  statusFilter = signal('ALL');
  startDate = signal('');
  endDate = signal('');

  statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);

    const params: any = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
    };

    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.statusFilter() !== 'ALL') params.status = this.statusFilter();
    if (this.startDate()) params.startDate = this.startDate();
    if (this.endDate()) params.endDate = this.endDate();

    this.adminService.getAllOrders(params).subscribe({
      next: (response: any) => {
        const data = response.data || [];
        const total = response.total || 0;

        this.orders.set(data);
        this.totalItems.set(total);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.toast.error('Erreur lors du chargement des commandes');
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadOrders();
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadOrders();
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.applyFilters();
  }

  onStatusFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value);
    this.applyFilters();
  }

  onDateChange(type: 'start' | 'end', event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (type === 'start') {
      this.startDate.set(value);
    } else {
      this.endDate.set(value);
    }
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm.set('');
    this.statusFilter.set('ALL');
    this.startDate.set('');
    this.endDate.set('');
    this.applyFilters();
  }

  updateStatus(orderId: string, status: string, orderNumber: string) {
    this.isUpdating.set(orderId);
    this.adminService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.toast.success(`Statut de la commande #${orderNumber} mis à jour`);
        this.loadOrders();
        this.isUpdating.set(null);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.toast.error('Erreur lors de la mise à jour du statut');
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

  getStatusLabel(status: string) {
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

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatPrice(price: number | string) {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `${numPrice.toFixed(3)} TND`;
  }

  viewOrderDetails(order: any) {
    this.selectedOrder.set(order);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedOrder.set(null);
  }
}
