import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventOwnerFilesComponent } from './event-owner.files.component';

describe('EventOwnerFilesComponentComponent', () => {
  let component: EventOwnerFilesComponent;
  let fixture: ComponentFixture<EventOwnerFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventOwnerFilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventOwnerFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
