import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitedEventReportComponent } from './invited-event-report.component';

describe('InvitedEventReportComponent', () => {
  let component: InvitedEventReportComponent;
  let fixture: ComponentFixture<InvitedEventReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitedEventReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitedEventReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
