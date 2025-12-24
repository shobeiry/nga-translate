import { Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { TranslatePipe } from './translate.pipe';
import { TranslatePrefixDirective } from './translate-prefix.directive';
import { createFixture, setPrefix, useLang } from './utils.spec';

class DefaultComponent {
  public prefix = signal<string>('');
}

@Component({
  standalone: true,
  imports: [TranslatePipe, TranslatePrefixDirective],
  template: `<div [ngaTranslatePrefix]="prefix()">{{ { fa: 'تست', en: 'Test' } | ngaTranslate }}</div>`,
})
class ObjectKeyComponent extends DefaultComponent {}

@Component({
  standalone: true,
  imports: [TranslatePipe, TranslatePrefixDirective],
  template: `<div [ngaTranslatePrefix]="prefix()">{{ 'test' | ngaTranslate }}</div>`,
})
class StringKeyComponent extends DefaultComponent {}

@Component({
  standalone: true,
  imports: [TranslatePipe, TranslatePrefixDirective],
  template: `<div [ngaTranslatePrefix]="prefix()">{{ 'test' | ngaTranslate: 'Default Value' }}</div>`,
})
class StringKeyAndStringDefaultComponent extends DefaultComponent {}

@Component({
  standalone: true,
  imports: [TranslatePipe, TranslatePrefixDirective],
  template: `<div [ngaTranslatePrefix]="prefix()">{{ 'test' | ngaTranslate: 'Default Value [{ p1 }]' : { p1: 'Param 1' } }}</div>`,
})
class StringKeyAndStringDefaultAndParamsComponent extends DefaultComponent {}

@Component({
  standalone: true,
  imports: [TranslatePipe, TranslatePrefixDirective],
  template: `<div [ngaTranslatePrefix]="prefix()">
    {{ 'test' | ngaTranslate: { en: 'Hello [{ p1 }]', fa: 'سلام [{ p1 }]' } : { p1: 'Param 1' } }}
  </div>`,
})
class StringKeyAndObjectDefaultAndParamsComponent extends DefaultComponent {}

@Component({
  standalone: true,
  imports: [TranslatePipe, TranslatePrefixDirective],
  template: `<div [ngaTranslatePrefix]="prefix()">{{ { en: 'default translate' } | ngaTranslate }}</div>`,
})
class ObjectDefaultWithoutFaLangAndParamsComponent extends DefaultComponent {}

@Component({
  standalone: true,
  imports: [TranslatePipe, TranslatePrefixDirective],
  template: `<div [ngaTranslatePrefix]="prefix()">{{ { en: 'default translate [{ p1 }]' } | ngaTranslate: { p1: 'value' } }}</div>`,
})
class ObjectDefaultWithoutFaAndWithParamsComponent extends DefaultComponent {}

@Component({
  standalone: true,
  imports: [TranslatePipe, TranslatePrefixDirective],
  template: `<div [ngaTranslatePrefix]="prefix()">
    {{ { en: 'default [{ p1 }]', fa: 'دیفالت [{ p1 }]' } | ngaTranslate: { p1: 'value' } }}
  </div>`,
})
class ObjectDefaultWithParamsComponent extends DefaultComponent {}

const text = (fixture: ComponentFixture<any>): string => fixture.nativeElement.textContent.trim() as string;

describe('TranslatePipe', () => {
  let translate: TranslateService;
  const loader: TranslateLoader = { getTranslation: () => of({}) };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: loader },
        }),
      ],
    });

    translate = TestBed.inject(TranslateService);
    translate.use('en');
  });

  it('should translate from object key', () => {
    /*
     * in this test we send an object to pipe as language without string key, default value and parameters
     */

    const fixture = createFixture(ObjectKeyComponent);
    /* region case 1: en without change prefix */
    expect(text(fixture)).toBe('Test');
    /* endregion */
    /* region case 2: en with change prefix */
    setPrefix(fixture, 'test.');
    expect(text(fixture)).toBe('Test');
    /* endregion */
    /* region case 3: fa without change prefix */
    useLang(translate, fixture, 'fa');
    setPrefix(fixture, '');
    expect(text(fixture)).toBe('تست');
    /* endregion */
    /* region case 4: fa with change prefix */
    setPrefix(fixture, 'test.');
    expect(text(fixture)).toBe('تست');
    /* endregion */
  });

  it('should translate from string key', () => {
    /*
     * in this case we send a string key to pipe without default value and parameters
     */

    const fixture = createFixture(StringKeyComponent);
    const prefix = 'test.';
    const key = 'test';
    const path = `${prefix}${key}`;
    let _translate = 'Test Translate';

    /* region case 1: en without prefix and translation */
    expect(text(fixture)).toBe(key);
    /* endregion */
    /* region case 2: en with prefix and translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(path);
    /* endregion */
    /* region case 3: fa without prefix and translation */
    setPrefix(fixture, '');
    useLang(translate, fixture, 'fa');
    expect(text(fixture)).toBe(key);
    /* endregion */
    /* region case 4: fa with prefix and without translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(path);
    /* endregion */
    /* region case 5: en without prefix and with translation */
    useLang(translate, fixture, 'en');
    translate.set(key, _translate, 'en');
    setPrefix(fixture, '');
    expect(text(fixture)).toBe(_translate);
    /* endregion */
    /* region case 6: en with prefix and translation */
    _translate = 'Test Test Translate';
    useLang(translate, fixture, 'en');
    translate.set(path, _translate, 'en');
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(_translate);
    /* endregion */
    /* region case 7: fa without prefix and with translation */
    _translate = 'تست ترجمه';
    useLang(translate, fixture, 'fa');
    translate.set(key, _translate, 'fa');
    setPrefix(fixture, '');
    expect(text(fixture)).toBe(_translate);
    /* endregion */
    /* region case 8: fa with prefix and translation */
    _translate = 'تست تست ترجمه';
    useLang(translate, fixture, 'fa');
    translate.set(path, _translate, 'fa');
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(_translate);
    /* endregion */
  });

  it('should translate from string key with string default value', () => {
    /*
     * in this case we send a string key to pipe with string default value and without parameters
     */

    const fixture = createFixture(StringKeyAndStringDefaultComponent);
    const prefix = 'test.';
    const key = 'test';
    const path = `${prefix}${key}`;
    const defaultValue = 'Default Value';
    let _translate = 'Test Translate';

    /* region case 1: en without prefix and translation */
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 2: en with prefix and translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 3: fa without prefix and translation */
    setPrefix(fixture, '');
    useLang(translate, fixture, 'fa');
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 4: fa with prefix and without translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 5: en without prefix and with translation */
    useLang(translate, fixture, 'en');
    translate.set(key, _translate, 'en');
    setPrefix(fixture, '');
    expect(text(fixture)).toBe(_translate);
    /* endregion */
    /* region case 6: en with prefix and translation */
    _translate = 'Test Test Translate';
    useLang(translate, fixture, 'en');
    translate.set(path, _translate, 'en');
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(_translate);
    /* endregion */
    /* region case 7: fa without prefix and with translation */
    _translate = 'تست ترجمه';
    useLang(translate, fixture, 'fa');
    translate.set(key, _translate, 'fa');
    setPrefix(fixture, '');
    expect(text(fixture)).toBe(_translate);
    /* endregion */
    /* region case 8: fa with prefix and translation */
    _translate = 'تست تست ترجمه';
    useLang(translate, fixture, 'fa');
    translate.set(path, _translate, 'fa');
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(_translate);
    /* endregion */
  });

  it('should translate from string key with string default value and params', () => {
    /*
     * in this case we send a string key to pipe with default value and parameters
     */

    const fixture = createFixture(StringKeyAndStringDefaultAndParamsComponent);
    const prefix = 'test.';
    const key = 'test';
    const path = `${prefix}${key}`;
    const paramKey = 'p1';
    const paramValue = 'Param 1';
    const defaultValue = `Default Value ${paramValue}`;
    let _translate = `Test Translate [{${paramKey}}]`;

    /* region case 1: en without prefix and translation */
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 2: en with prefix and translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 3: fa without prefix and translation */
    setPrefix(fixture, '');
    useLang(translate, fixture, 'fa');
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 4: fa with prefix and without translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 5: en without prefix and with translation */
    useLang(translate, fixture, 'en');
    translate.set(key, _translate, 'en');
    setPrefix(fixture, '');
    expect(text(fixture)).toBe(_translate);
    /* endregion */
    /* region case 6: en with prefix and translation */
    _translate = `Test Test Translate [{${paramKey}}]`;
    useLang(translate, fixture, 'en');
    translate.set(path, _translate, 'en');
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(_translate);
    /* endregion */
    /* region case 7: fa without prefix and with translation */
    _translate = `تست ترجمه [{${paramKey}}]`;
    useLang(translate, fixture, 'fa');
    translate.set(key, _translate, 'fa');
    setPrefix(fixture, '');
    expect(text(fixture)).toBe(_translate);
    /* endregion */
    /* region case 8: fa with prefix and translation */
    _translate = `تست تست ترجمه [{${paramKey}}]`;
    useLang(translate, fixture, 'fa');
    translate.set(path, _translate, 'fa');
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(_translate);
    /* endregion */
  });

  it('should translate from string key with object default value and params', () => {
    /*
     * in this case we send a string key to pipe with object default value and parameters
     */

    const fixture = createFixture(StringKeyAndObjectDefaultAndParamsComponent);
    const prefix = 'test.';
    const key = 'test';
    const path = `${prefix}${key}`;
    const paramKey = 'p1';
    const paramValue = 'Param 1';
    const defaultValueEn = `Hello ${paramValue}`;
    const defaultValueFa = `سلام ${paramValue}`;
    let _translate = `Test Translate [{${paramKey}}]`;

    /* region case 1: en without prefix and translation */
    expect(text(fixture)).toBe(defaultValueEn);
    /* endregion */
    /* region case 2: en with prefix and translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(defaultValueEn);
    /* endregion */
    /* region case 3: fa without prefix and translation */
    setPrefix(fixture, '');
    useLang(translate, fixture, 'fa');
    expect(text(fixture)).toBe(defaultValueFa);
    /* endregion */
    /* region case 4: fa with prefix and without translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(defaultValueFa);
    /* endregion */
    /* region case 5: en without prefix and with translation */
    useLang(translate, fixture, 'en');
    translate.set(key, _translate, 'en');
    setPrefix(fixture, '');
    expect(text(fixture)).toBe(_translate);
    /* endregion */
    /* region case 6: en with prefix and translation */
    _translate = `Test Test Translate [{${paramKey}}]`;
    useLang(translate, fixture, 'en');
    translate.set(path, _translate, 'en');
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(_translate);
    /* endregion */
    /* region case 7: fa without prefix and with translation */
    _translate = `تست ترجمه [{${paramKey}}]`;
    useLang(translate, fixture, 'fa');
    translate.set(key, _translate, 'fa');
    setPrefix(fixture, '');
    expect(text(fixture)).toBe(_translate);
    /* endregion */
    /* region case 8: fa with prefix and translation */
    _translate = `تست تست ترجمه [{${paramKey}}]`;
    useLang(translate, fixture, 'fa');
    translate.set(path, _translate, 'fa');
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(_translate);
    /* endregion */
  });

  it('should translate from object key without default value and params without fa', () => {
    /*
     * in this case we send an object key to pipe with only one language and without default and parameters
     */

    const fixture = createFixture(ObjectDefaultWithoutFaLangAndParamsComponent);
    const prefix = 'test';
    const defaultValue = 'default translate';

    /* region case 1: en without prefix and translation */
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 2: en with prefix and translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 3: fa without prefix and translation */
    setPrefix(fixture, '');
    useLang(translate, fixture, 'fa');
    fixture.detectChanges();
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 4: fa with prefix and without translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
  });

  it('should translate from object key with default value and params without fa', () => {
    /*
     * in this case we send an object key to pipe with only one language and with parameters and without default
     */

    const fixture = createFixture(ObjectDefaultWithoutFaAndWithParamsComponent);
    const prefix = 'test';
    const paramValue = 'value';
    const defaultValue = `default translate ${paramValue}`;

    /* region case 1: en without prefix and translation */
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 2: en with prefix and translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 3: fa without prefix and translation */
    setPrefix(fixture, '');
    useLang(translate, fixture, 'fa');
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 4: fa with prefix and without translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
  });

  it('should translate from object key with default value and params', () => {
    /*
     * in this case we send a object key to pipe with parameters
     */

    const fixture = createFixture(ObjectDefaultWithParamsComponent);
    const prefix = 'test.';
    const paramValue = 'value';
    const defaultValueEn = `default ${paramValue}`;
    const defaultValueFa = `دیفالت ${paramValue}`;

    /* region case 1: en without prefix and translation */
    expect(text(fixture)).toBe(defaultValueEn);
    /* endregion */
    /* region case 2: en with prefix and translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(defaultValueEn);
    /* endregion */
    /* region case 3: fa without prefix and translation */
    setPrefix(fixture, '');
    useLang(translate, fixture, 'fa');
    expect(text(fixture)).toBe(defaultValueFa);
    /* endregion */
    /* region case 4: fa with prefix and without translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(defaultValueFa);
    /* endregion */
  });
});
