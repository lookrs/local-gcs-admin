import { TestBed } from '@angular/core/testing';

import { GcsServiceService } from './gcs-service.service';

describe('GcsServiceService', () => {
  let service: GcsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GcsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
