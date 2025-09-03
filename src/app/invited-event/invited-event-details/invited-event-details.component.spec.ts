import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitedEventDetailsComponent } from './invited-event-details.component';

describe('InvitedEventDetailsComponent', () => {
  let component: InvitedEventDetailsComponent;
  let fixture: ComponentFixture<InvitedEventDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitedEventDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitedEventDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
