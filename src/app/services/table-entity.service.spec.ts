import { TestBed } from '@angular/core/testing';

import { TableEntityService } from './table-entity.service';

describe('TableEntityService', () => {
  let service: TableEntityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableEntityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
