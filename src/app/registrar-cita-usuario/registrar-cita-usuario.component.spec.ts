import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarCitaUsuarioComponent } from './registrar-cita-usuario.component';

describe('RegistrarCitaUsuarioComponent', () => {
  let component: RegistrarCitaUsuarioComponent;
  let fixture: ComponentFixture<RegistrarCitaUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarCitaUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarCitaUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
