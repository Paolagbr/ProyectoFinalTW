import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnProductoComponent } from './un-producto.component';

describe('UnProductoComponent', () => {
  let component: UnProductoComponent;
  let fixture: ComponentFixture<UnProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnProductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
