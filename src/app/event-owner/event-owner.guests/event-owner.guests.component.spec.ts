import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventOwnerGuestsComponent } from './event-owner.guests.component';

describe('EventOwnerGuestsComponent', () => {
  let component: EventOwnerGuestsComponent;
  let fixture: ComponentFixture<EventOwnerGuestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventOwnerGuestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventOwnerGuestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
