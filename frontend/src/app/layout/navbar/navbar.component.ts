import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, MatIconModule, MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly auth = inject(AuthService);

  protected readonly menuOpen = signal(false);
  protected readonly currentUser = toSignal<any>(
    this.auth.user.pipe(startWith(null as any)),
    {
      initialValue: null,
    },
  );
  protected readonly isAdmin = computed(
    () => !!this.currentUser()?.roles?.includes('Admin'),
  );
  @ViewChild('navbar') nav!: ElementRef;

  protected login() {
    this.auth.login();
  }

  protected logout() {
    this.auth.logout();
  }

  protected toggleMenu() {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu() {
    this.menuOpen.set(false);
  }

  @HostListener('window:scroll', ['$event'])
  protected scrolled(event: Event) {
    if (!this.nav) {
      return;
    }

    if ((event.currentTarget as Window).scrollY > 50) {
      (this.nav.nativeElement as HTMLElement).classList.contains(
        'bg-opacity-70',
      ) &&
        (this.nav.nativeElement as HTMLElement).classList.remove(
          'bg-opacity-70',
        );
    } else {
      !(this.nav.nativeElement as HTMLElement).classList.contains(
        'bg-opacity-70',
      ) &&
        (this.nav.nativeElement as HTMLElement).classList.add('bg-opacity-70');
    }
  }
}
