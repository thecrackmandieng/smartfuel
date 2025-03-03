import { TestBed } from '@angular/core/testing';

import { FuelLevelService } from './fuel-level.service';

describe('FuelLevelService', () => {
  let service: FuelLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FuelLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
