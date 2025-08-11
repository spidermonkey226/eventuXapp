import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMangerComponent } from './event-manger.component';

describe('EventMangerComponent', () => {
  let component: EventMangerComponent;
  let fixture: ComponentFixture<EventMangerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventMangerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventMangerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
