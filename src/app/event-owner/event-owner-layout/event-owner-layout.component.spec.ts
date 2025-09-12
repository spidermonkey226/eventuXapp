import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventOwnerLayoutComponent } from './event-owner-layout.component';

describe('EventOwnerLayoutComponent', () => {
  let component: EventOwnerLayoutComponent;
  let fixture: ComponentFixture<EventOwnerLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventOwnerLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventOwnerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
