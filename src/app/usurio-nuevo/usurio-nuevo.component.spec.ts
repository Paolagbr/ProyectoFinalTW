import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsurioNuevoComponent } from './usurio-nuevo.component';

describe('UsurioNuevoComponent', () => {
  let component: UsurioNuevoComponent;
  let fixture: ComponentFixture<UsurioNuevoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsurioNuevoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsurioNuevoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
