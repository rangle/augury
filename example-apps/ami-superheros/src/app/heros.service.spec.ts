/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HerosService } from './heros.service';

describe('Service: Heros', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HerosService]
    });
  });

  it('should ...', inject([HerosService], (service: HerosService) => {
    expect(service).toBeTruthy();
  }));
});
