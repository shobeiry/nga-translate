import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { describe } from 'vitest';
import { equals } from './util';

export function createFixture<T>(cmp: Type<T>): ComponentFixture<T> {
  const fixture = TestBed.createComponent(cmp);
  fixture.detectChanges();
  return fixture;
}

export function setPrefix(fixture: ComponentFixture<any>, prefix: string): void {
  fixture.componentInstance.prefix.set(prefix);
  fixture.detectChanges();
}

export function useLang(translate: TranslateService, fixture: ComponentFixture<any>, lang: 'en' | 'fa'): void {
  translate.use(lang);
  fixture.detectChanges();
}

describe('Translate utils', () => {
  it('should equal works', () => {
    expect(equals({ a: 'test' }, { a: 'test' })).toBe(true);
  });
});
