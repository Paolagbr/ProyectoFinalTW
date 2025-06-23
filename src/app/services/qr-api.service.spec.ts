import { TestBed } from '@angular/core/testing';

import { QrApiService } from './qr-api.service';

describe('QrApiService', () => {
  let service: QrApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QrApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
