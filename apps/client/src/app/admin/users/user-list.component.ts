import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../shared/services/admin.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private adminService = inject(AdminService);

  users = signal<any[]>([]);
  isLoading = signal(true);
  isUpdating = signal<string | null>(null);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading.set(false);
      },
    });
  }

  toggleRole(user: any) {
    const newRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    if (!confirm(`Changer le rôle de ${user.email} en ${newRole} ?`)) return;

    this.isUpdating.set(user.id);
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        this.loadUsers();
        this.isUpdating.set(null);
      },
      error: (err) => {
        console.error('Error updating user role:', err);
        this.isUpdating.set(null);
      },
    });
  }
}
