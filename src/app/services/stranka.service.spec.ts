import { TestBed } from '@angular/core/testing';

import { StrankaService } from './stranka.service';

describe('StrankaService', () => {
  let service: StrankaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StrankaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
