import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { GuestInfoPopupComponent } from './shared/components/guest-info-popup/guest-info-popup.component';
import { BackButtonComponent } from './shared/components/back-button/back-button.component';
import { ScrollToTopComponent } from './shared/components/scroll-to-top/scroll-to-top.component';
import { WhatsappButtonComponent } from './shared/components/whatsapp-button/whatsapp-button.component';

@Component({
  imports: [
    RouterModule,
    NavbarComponent,
    FooterComponent,
    ToastContainerComponent,
    GuestInfoPopupComponent,
    BackButtonComponent,
    ScrollToTopComponent,
    WhatsappButtonComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'LARTISTOU MEUBLE';
}
