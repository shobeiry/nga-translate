import { Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { TranslateDirective } from './translate.directive';
import { TranslatePrefixDirective } from './translate-prefix.directive';
import { createFixture, setPrefix, useLang } from './utils.spec';

class DefaultComponent {
  public prefix = signal<string>('');
}

@Component({
  standalone: true,
  imports: [TranslateDirective, TranslatePrefixDirective],
  template: `<div [ngaTranslatePrefix]="prefix()"><p ngaTranslate>Hello, world!</p></div>`,
})
class DirectiveDefaultComponent extends DefaultComponent {}

@Component({
  standalone: true,
  imports: [TranslateDirective, TranslatePrefixDirective],
  template: `<div [ngaTranslatePrefix]="prefix()"><p ngaTranslate="test">Hello, world!</p></div>`,
})
class DirectiveWithKeyComponent extends DefaultComponent {}

@Component({
  standalone: true,
  imports: [TranslateDirective, TranslatePrefixDirective],
  template: `<div [ngaTranslatePrefix]="prefix()">
    <p ngaTranslate="test" [translateValues]="{ p1: 'world' }">Hello, [&lcub; p1 &rcub;]!</p>
  </div>`,
})
class DirectiveWithKeyAndParamComponent extends DefaultComponent {}

@Component({
  standalone: true,
  imports: [TranslateDirective, TranslatePrefixDirective],
  template: `<div [ngaTranslatePrefix]="prefix()">
    <p ngaTranslate="test" [translateValues]="{ p1: 'world' }">
      &lcub; en: 'Hello, [&lcub; p1 &rcub;]',fa: 'سلام, [&lcub; p1 &rcub;]' &rcub;
    </p>
  </div>`,
})
class DirectiveWithKeyAndObjectDefaultAndParamComponent extends DefaultComponent {}

const text = (fixture: ComponentFixture<any>): string => fixture.nativeElement.querySelector('p')?.textContent?.trim() as string;

describe('TranslateDirective', () => {
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

  it('should show default value when key is not found', () => {
    const fixture = createFixture(DirectiveDefaultComponent);

    const defaultValue = 'Hello, world!';

    /* region case 1: en without change prefix */
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 2: en with change prefix */
    setPrefix(fixture, 'test');
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 3: fa without change prefix */
    setPrefix(fixture, '');
    useLang(translate, fixture, 'fa');
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
    /* region case 4: fa with change prefix */
    setPrefix(fixture, 'test');
    expect(text(fixture)).toBe(defaultValue);
    /* endregion */
  });

  it('should show key value when key is found', () => {
    const fixture = createFixture(DirectiveWithKeyComponent);

    const defaultValue = 'Hello, world!';
    const prefix = 'test.';
    const key = 'test';
    const path = `${prefix}${key}`;
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

  it('should show key value when key is found and replace params', () => {
    const fixture = createFixture(DirectiveWithKeyAndParamComponent);

    const param = 'world';
    const defaultValue = `Hello, ${param}!`;
    const prefix = 'test.';
    const key = 'test';
    const path = `${prefix}${key}`;
    let _translateKey = 'Test Translate {{ p1 }}';
    let _translateValue = `Test Translate ${param}`;

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
    translate.set(key, _translateKey, 'en');
    setPrefix(fixture, '');
    expect(text(fixture)).toBe(_translateValue);
    /* endregion */
    /* region case 6: en with prefix and translation */
    useLang(translate, fixture, 'en');
    translate.set(path, `Test ${_translateKey}`, 'en');
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(`Test ${_translateValue}`);
    /* endregion */
    /* region case 7: fa without prefix and with translation */
    _translateKey = 'تست ترجمه {{ p1 }}';
    _translateValue = `تست ترجمه ${param}`;
    useLang(translate, fixture, 'fa');
    translate.set(key, _translateKey, 'fa');
    setPrefix(fixture, '');
    expect(text(fixture)).toBe(_translateValue);
    /* endregion */
    /* region case 8: fa with prefix and translation */
    useLang(translate, fixture, 'fa');
    translate.set(path, `تست ${_translateKey}`, 'fa');
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(`تست ${_translateValue}`);
    /* endregion */
  });

  it('should show default value by language when key is not found and replace params', () => {
    const fixture = createFixture(DirectiveWithKeyAndObjectDefaultAndParamComponent);

    const param = 'world';
    const defaultValue = `Hello, ${param}`;
    const faDefaultValue = `سلام, ${param}`;
    const prefix = 'test.';

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
    expect(text(fixture)).toBe(faDefaultValue);
    /* endregion */
    /* region case 4: fa with prefix and without translation */
    setPrefix(fixture, prefix);
    expect(text(fixture)).toBe(faDefaultValue);
    /* endregion */
  });
});
