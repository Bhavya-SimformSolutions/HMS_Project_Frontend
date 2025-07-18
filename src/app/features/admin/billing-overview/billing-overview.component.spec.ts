import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingOverviewComponent } from './billing-overview.component';

describe('BillingOverviewComponent', () => {
  let component: BillingOverviewComponent;
  let fixture: ComponentFixture<BillingOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
