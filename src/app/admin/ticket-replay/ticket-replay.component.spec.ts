import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketReplayComponent } from './ticket-replay.component';

describe('TicketReplayComponent', () => {
  let component: TicketReplayComponent;
  let fixture: ComponentFixture<TicketReplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketReplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketReplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
