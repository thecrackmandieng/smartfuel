import { TestBed } from '@angular/core/testing';

import { PompisteService } from './pompiste.service';

describe('PompisteService', () => {
  let service: PompisteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PompisteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
