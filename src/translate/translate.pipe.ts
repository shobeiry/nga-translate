import { ChangeDetectorRef, Injectable, OnDestroy, Optional, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { InterpolationParameters, TranslateParser, TranslateService, TranslationChangeEvent } from '@ngx-translate/core';
import { equals, getDefault, isDefined, normalizeJson } from './util';
import { TranslatePrefixDirective } from './translate-prefix.directive';
import { getTranslateKey } from './translate-key';
import { DefaultObject, DefaultValue, Params } from './translate.types';

@Injectable({ providedIn: 'root' })
@Pipe({
  standalone: true,
  name: 'ngaTranslate',
  pure: false, // required to update the value when the promise is resolved
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  value: string = '';
  lastKey: string | DefaultObject | null = null;
  lastParams?: InterpolationParameters | string;
  lastDefaults?: DefaultValue;
  onTranslation: Subscription | undefined;
  onTranslationChange: Subscription | undefined;
  onLangChange: Subscription | undefined;
  onDefaultLangChange: Subscription | undefined;
  onPrefixChange: Subscription | undefined;

  constructor(
    private translate: TranslateService,
    private parser: TranslateParser,
    private _ref: ChangeDetectorRef,
    @Optional() private translatePrefixDirective?: TranslatePrefixDirective,
  ) {}

  updateValue(key: string | DefaultObject, defaults?: DefaultValue, interpolateParams?: InterpolationParameters): void {
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

    if (typeof key === 'string') {
      this.onTranslation?.unsubscribe();
      this.onTranslation = this.translate.get(translateKey, interpolateParams).subscribe(onTranslation);
    } else {
      this.applyDefault(key, interpolateParams, JSON.stringify(key));
    }
  }

  transform(query: string, defaults?: DefaultValue, params?: Params): any;
  transform(defaults: DefaultObject, params?: Params): any;
  transform(query: string | DefaultObject, defaults?: DefaultValue, params?: Params): any {
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

    let interpolateParams: InterpolationParameters | undefined = undefined;

    if (isDefined(params)) {
      if (typeof params === 'string' && params.length) {
        // we accept objects written in the template such as {n:1}, {'n':1}, {n:'v'}
        // which is why we might need to change it to real JSON objects such as {"n":1} or {"n":"v"}
        try {
          interpolateParams = JSON.parse(normalizeJson(params));
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

    if (!this.onLangChange) {
      this.onLangChange = this.translate.onLangChange.subscribe(() => {
        if (this.lastKey) {
          this.lastKey = null;
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

  private applyDefault(defaults: DefaultValue | undefined, interpolateParams: InterpolationParameters | undefined, value: string): void {
    this.value = getDefault(this.parser, this.translate.getCurrentLang(), defaults, interpolateParams, value);
  }

  /**
   * Clean any existing subscription to change events
   */
  private _dispose(): void {
    this.onTranslationChange?.unsubscribe();
    this.onTranslationChange = undefined;
    this.onTranslation?.unsubscribe();
    this.onTranslation = undefined;
    this.onDefaultLangChange?.unsubscribe();
    this.onDefaultLangChange = undefined;
    this.onLangChange?.unsubscribe();
    this.onLangChange = undefined;
    this.onPrefixChange?.unsubscribe();
    this.onPrefixChange = undefined;
  }
}
