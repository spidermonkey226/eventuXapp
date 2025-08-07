import { TestBed } from '@angular/core/testing';

import { InvitedService } from './invited.service';

describe('InvitedService', () => {
  let service: InvitedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvitedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
