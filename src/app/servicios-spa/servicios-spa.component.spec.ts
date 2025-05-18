import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosSPAComponent } from './servicios-spa.component';

describe('ServiciosSPAComponent', () => {
  let component: ServiciosSPAComponent;
  let fixture: ComponentFixture<ServiciosSPAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosSPAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiciosSPAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
