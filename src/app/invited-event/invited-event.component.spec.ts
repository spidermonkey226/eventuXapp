import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitedEventComponent } from './invited-event.component';

describe('InvitedEventComponent', () => {
  let component: InvitedEventComponent;
  let fixture: ComponentFixture<InvitedEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitedEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitedEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
