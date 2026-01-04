import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container.component';

@Component({
  imports: [
    RouterModule,
    NavbarComponent,
    FooterComponent,
    ToastContainerComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'LARTISTOU MEUBLE';
}
