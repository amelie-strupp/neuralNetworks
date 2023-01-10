import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelPanelComponent } from './level-panel.component';

describe('LevelPanelComponent', () => {
  let component: LevelPanelComponent;
  let fixture: ComponentFixture<LevelPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LevelPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
