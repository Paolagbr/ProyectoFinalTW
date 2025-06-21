import { TestBed } from '@angular/core/testing';

import { IngresarUsuarioService } from './ingresar-usuario.service';

describe('IngresarUsuarioService', () => {
  let service: IngresarUsuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngresarUsuarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
