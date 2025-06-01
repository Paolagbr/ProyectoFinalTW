import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresarUsuarioComponent } from './ingresar-usuario.component';

describe('IngresarUsuarioComponent', () => {
  let component: IngresarUsuarioComponent;
  let fixture: ComponentFixture<IngresarUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresarUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresarUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
