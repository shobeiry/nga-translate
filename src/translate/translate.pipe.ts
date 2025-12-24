import { ChangeDetectorRef, Injectable, OnDestroy, Optional, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { InterpolationParameters, TranslateParser, TranslateService, TranslationChangeEvent } from '@ngx-translate/core';
import { equals, exchangeParam, isDefined } from './util';
import { TranslatePrefixDirective } from './translate-prefix.directive';
import { getTranslateKey } from './translate-key';

@Injectable({ providedIn: 'root' })
@Pipe({
  standalone: true,
  name: 'ngaTranslate',
  pure: false, // required to update the value when the promise is resolved
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  value: string = '';
  lastKey: string | object | null = null;
  lastParams?: InterpolationParameters | string;
  lastDefaults?: object | string;
  onTranslationChange: Subscription | undefined;
  onLangChange: Subscription | undefined;
  onDefaultLangChange: Subscription | undefined;
  onPrefixChange: Subscription | undefined;

  constructor(
    private translate: TranslateService,
    @Optional() private translatePrefixDirective: TranslatePrefixDirective | undefined,
    private parser: TranslateParser,
    private _ref: ChangeDetectorRef,
  ) {}

  updateValue(key: string | object, defaults?: object | string, interpolateParams?: object): void {
    const translateKey = typeof key === 'string' ? getTranslateKey(key, this.translatePrefixDirective?.ngaTranslatePrefix()) : '';

    const onTranslation = (res?: string): void => {
      const value = res ?? translateKey;

      if (value === translateKey) {
        this.applyDefault(defaults, interpolateParams, value);
      } else {
        this.value = value;
      }

      this.lastKey = key as string;
      this._ref.markForCheck();
    };

    /*if (translations && typeof key === 'string') {
      const res = this.translate.getParsedResult(translations, translateKey, interpolateParams);
      if (isObservable(res.subscribe)) {
        res.subscribe(onTranslation);
      } else {
        onTranslation(res);
      }
    }*/

    if (typeof key === 'string') {
      this.translate.get(translateKey, interpolateParams).subscribe(onTranslation);
    } else {
      this.applyDefault(key, interpolateParams, JSON.stringify(key));
    }
  }

  transform(query: string, defaults?: object | string, params?: object | string): any;
  transform(defaults: object, params?: object | string): any;
  transform(query: string | object, defaults?: object | string, params?: object | string): any {
    if (typeof query === 'string' && !query.length) {
      return query;
    }

    // if we ask another time for the same key, return the last value
    if (equals(query, this.lastKey) && equals(params, this.lastParams) && equals(defaults, this.lastDefaults)) {
      return this.value;
    }

    if (typeof query === 'object') {
      params = defaults;
    }

    let interpolateParams: object | undefined = undefined;

    if (isDefined(params)) {
      if (typeof params === 'string' && params.length) {
        // we accept objects written in the template such as {n:1}, {'n':1}, {n:'v'}
        // which is why we might need to change it to real JSON objects such as {"n":1} or {"n":"v"}
        const validArgs: string = params.replace(/(')?(\w+)(')?(\s)?:/g, '"$2":').replace(/:(\s)?(')(.*?)(')/g, ':"$3"');
        try {
          interpolateParams = JSON.parse(validArgs);
        } catch (e) {
          throw new SyntaxError(`Wrong parameter in TranslatePipe. Expected a valid object, received: ${params}`);
        }
      } else if (typeof params === 'object' && !Array.isArray(params)) {
        interpolateParams = params;
      }
    }

    // store the query, in case it changes
    this.lastKey = query;

    // store the params, in case they change
    this.lastParams = params;

    // store the defaults, in case they change
    this.lastDefaults = defaults;

    // set the value
    this.updateValue(query, defaults, interpolateParams);

    // if there is a subscription to onLangChange, clean it
    this._dispose();

    // subscribe to onTranslationChange event, in case the translations change
    if (!this.onTranslationChange) {
      this.onTranslationChange = this.translate.onTranslationChange.subscribe((event: TranslationChangeEvent) => {
        if (this.lastKey && event.lang === this.translate.getCurrentLang()) {
          this.lastKey = null;
          this.updateValue(query, defaults, interpolateParams);
        }
      });
    }

    // subscribe to onLangChange event, in case the language changes
    if (!this.onLangChange) {
      this.onLangChange = this.translate.onLangChange.subscribe(() => {
        if (this.lastKey) {
          this.lastKey = null; // we want to make sure it doesn't return the same value until it's been updated
          this.updateValue(query, defaults, interpolateParams);
        }
      });
    }

    // subscribe to onDefaultLangChange event, in case the default language changes
    if (!this.onDefaultLangChange) {
      this.onDefaultLangChange = this.translate.onFallbackLangChange.subscribe(() => {
        if (this.lastKey) {
          this.lastKey = null; // we want to make sure it doesn't return the same value until it's been updated
          this.updateValue(query, defaults, interpolateParams);
        }
      });
    }

    // subscribe to onPrefixChange event, in case the default language changes
    if (!this.onPrefixChange) {
      this.onPrefixChange = this.translatePrefixDirective?.onPrefixChange.subscribe(() => {
        if (this.lastKey) {
          this.lastKey = null;
          this.updateValue(query, defaults, interpolateParams);
        }
      });
    }

    return this.value;
  }

  ngOnDestroy(): void {
    this._dispose();
  }

  private applyDefault(defaults: object | string | undefined, interpolateParams: object | undefined, value: string): void {
    if (typeof defaults === 'string' && defaults.length) {
      const validArgs: string = defaults.replace(/(')?(\w+)(')?(\s)?:/g, '"$2":').replace(/:(\s)?(')(.*?)(')/g, ':"$3"');
      try {
        defaults = JSON.parse(validArgs);
        const default1 = exchangeParam((defaults as any)[this.translate.getCurrentLang()]);
        this.value = this.parser.interpolate(default1, interpolateParams) ?? '';
      } catch (e) {
        const defaults1 = exchangeParam(defaults as string);
        this.value = this.parser.interpolate(defaults1, interpolateParams) ?? '';
      }
    } else if (defaults && this.translate.getCurrentLang() in (defaults as object)) {
      const default1 = exchangeParam((defaults as any)[this.translate.getCurrentLang()]);
      this.value = this.parser.interpolate(default1, interpolateParams) ?? '';
    } else {
      this.value = value;
    }
  }

  /**
   * Clean any existing subscription to change events
   */
  private _dispose(): void {
    if (typeof this.onTranslationChange !== 'undefined') {
      this.onTranslationChange.unsubscribe();
      this.onTranslationChange = undefined;
    }
    if (typeof this.onLangChange !== 'undefined') {
      this.onLangChange.unsubscribe();
      this.onLangChange = undefined;
    }
    if (typeof this.onDefaultLangChange !== 'undefined') {
      this.onDefaultLangChange.unsubscribe();
      this.onDefaultLangChange = undefined;
    }
    if (typeof this.onPrefixChange !== 'undefined') {
      this.onPrefixChange.unsubscribe();
      this.onPrefixChange = undefined;
    }
  }
}
