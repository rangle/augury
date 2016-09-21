/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VillansService } from './villans.service';

describe('Service: Villans', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VillansService]
    });
  });

  it('should ...', inject([VillansService], (service: VillansService) => {
    expect(service).toBeTruthy();
  }));
});
