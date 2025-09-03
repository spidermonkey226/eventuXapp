import { Component ,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { SubscriptionService } from '../services/subscription.service';
import { UserService } from '../services/user.service';
import { Subscription } from '../class/subscription';
import { User, SubscriptionLevel } from '../class/user';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscribe.component.html',
  styleUrl: './subscribe.component.css'
})
export class SubscribeComponent implements OnInit {
  plans: Subscription[] = [];
  loading = false;

  selecting: Subscription | null = null;
  successMsg = '';
  errorMsg = '';

  currentUser?: User;             
  currentUserId = 1;              // TODO: replace with real signed-in user id

  constructor(
    private subscriptionService: SubscriptionService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchPlans();

    this.userService.getMe().subscribe({
      next: (u) => (this.currentUser = u as User),
      error: () => { /* ignore for now */ }
    });
  }

  fetchPlans(): void {
    this.loading = true;
    this.subscriptionService.getAll().subscribe({
      next: (data) => {
        const order = ['BASIC', 'STANDARD', 'PRO', 'ULTIMATE'];
        this.plans = data.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load plans.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private defaultWindowFor(plan: Subscription): { start: Date; end: Date | null } {
    const start = new Date();
    if (plan.name === 'ULTIMATE') {
      return { start, end: null };
    }
    const end = new Date(start);
    end.setDate(end.getDate() + 30);
    return { start, end };
  }

  selectPlan(plan: Subscription): void {
    this.selecting = plan;
    this.successMsg = '';
    this.errorMsg = '';
  }

  confirm(): void {
  if (!this.selecting) return;
  const selectedPlan = this.selecting; // keep for query param
  this.successMsg = '';
  this.errorMsg = '';

  // Only navigate to payment. Do NOT update subscription here.
  this.router.navigate(['/payment'], { queryParams: { planId: selectedPlan.id } });
}


  cancel(): void {
    this.selecting = null;
  }

  planSubtitle(p: Subscription): string {
    if (p.name === 'ULTIMATE') return 'Unlimited invites';
    if (p.name === 'PRO') return '200 invites / event';
    return `${p.maxEvents} invites / event`;
  }

  // --- Banner helpers ---
  endDateText(): string {
    const raw = this.currentUser?.subscriptionEnd;
    if (!raw) return 'No expiry';
    const end = new Date(raw);
    return end.toLocaleDateString();
  }

  daysLeft(): number | null {
    const raw = this.currentUser?.subscriptionEnd;
    if (!raw) return null;
    const end = new Date(raw);
    const ms = end.getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  // Plan name → enum
  private mapPlanToLevel(plan: Subscription): SubscriptionLevel {
    switch (plan.name) {
      case 'BASIC': return SubscriptionLevel.Basic;
      case 'STANDARD': return SubscriptionLevel.Standard;
      case 'PRO': return SubscriptionLevel.Pro;
      case 'ULTIMATE': return SubscriptionLevel.Ultimate;
      default: return SubscriptionLevel.Free;
    }
  }
  planName(level?: SubscriptionLevel): string {
  switch (level) {
    case SubscriptionLevel.Basic: return 'BASIC';
    case SubscriptionLevel.Standard: return 'STANDARD';
    case SubscriptionLevel.Pro: return 'PRO';
    case SubscriptionLevel.Ultimate: return 'ULTIMATE';
    case SubscriptionLevel.Free:
    default: return 'FREE';
  }
}
}
