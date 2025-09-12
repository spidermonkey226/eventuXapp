// event-owner.resolver.ts
import { Injectable, inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { EventOwnerStore } from './event-owner.store';

@Injectable({ providedIn: 'root' })
export class EventOwnerResolver implements Resolve<boolean> {
  private store = inject(EventOwnerStore);
  resolve(route: ActivatedRouteSnapshot) {
    const id = Number(route.paramMap.get('id'));
    this.store.bootstrap(id);
    return true;
  }
}
