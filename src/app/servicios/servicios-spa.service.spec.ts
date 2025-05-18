import { TestBed } from '@angular/core/testing';

import { ServiciosSPAService } from './servicios-spa.service';

describe('ServiciosSPAService', () => {
  let service: ServiciosSPAService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiciosSPAService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
