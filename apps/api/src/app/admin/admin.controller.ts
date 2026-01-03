import { Controller, Get, Param, Put, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard) // All routes require admin access
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body('role') role: 'ADMIN' | 'CUSTOMER',
  ) {
    return this.adminService.updateUserRole(id, role);
  }
}
