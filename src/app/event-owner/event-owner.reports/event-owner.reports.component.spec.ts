import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventOwnerReportsComponent } from './event-owner.reports.component';

describe('EventOwnerReportsComponentComponent', () => {
  let component: EventOwnerReportsComponent;
  let fixture: ComponentFixture<EventOwnerReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventOwnerReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventOwnerReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
