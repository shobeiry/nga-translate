import { ChangeDetectorRef, Injectable, OnDestroy, Optional, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { InterpolationParameters, StrictTranslation, TranslateParser, TranslateService, TranslationChangeEvent } from '@ngx-translate/core';
import { equals, exchangeParam, isDefined } from './util';
import { TranslatePrefixDirective } from './translate-prefix.directive';
import { getTranslateKey } from './translate-key';

type KeyType = Record<string, string> | string;
type DefaultType = Record<string, string> | string;

@Injectable({ providedIn: 'root' })
@Pipe({
  standalone: true,
  name: 'ngaTranslate',
  pure: false, // required to update the value when the promise is resolved
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private value: StrictTranslation = '';
  private lastKey: KeyType | null = null;
  private lastParams?: InterpolationParameters;
  private lastDefaults?: DefaultType;
  private readonly subs: Record<PropertyKey, Subscription> = {};

  constructor(
    private translate: TranslateService,
    private parser: TranslateParser,
    private cdr: ChangeDetectorRef,
    @Optional() private translatePrefixDirective?: TranslatePrefixDirective,
  ) {}

  updateValue(key: KeyType, defaults?: DefaultType, interpolateParams?: InterpolationParameters): void {
    const translateKey = typeof key === 'string' ? getTranslateKey(key, this.translatePrefixDirective?.ngaTranslatePrefix()) : '';
    if (typeof key === 'string') {
      this.subs['onTranslation'] = this.translate.stream(translateKey, interpolateParams).subscribe((res?: StrictTranslation): void => {
        const value = res ?? translateKey;

        if (value === translateKey) {
          this.applyDefault(defaults, interpolateParams, value);
        } else {
          this.value = value;
        }

        this.lastKey = key;
        this.cdr.markForCheck();
      });
    } else {
      this.applyDefault(key, interpolateParams, JSON.stringify(key));
    }
  }

  transform(query: string, defaults?: DefaultType | string, params?: InterpolationParameters | string): any;
  transform(defaults: DefaultType, params?: InterpolationParameters | string): any;
  transform(query: string | DefaultType, defaults?: DefaultType | string, params?: InterpolationParameters | string): any {
    if (typeof query === 'string' && !query.length) {
      return query;
    }

    // if we ask another time for the same key, return the last value
    if (equals(query, this.lastKey) && equals(params, this.lastParams) && equals(defaults, this.lastDefaults)) {
      return this.value;
    }

    if (typeof query !== 'string') {
      params = defaults;
    }

    let interpolateParams: InterpolationParameters | undefined = undefined;

    if (isDefined(params)) {
      if (typeof params === 'string' && params.length) {
        // we accept objects written in the template such as {n:1}, {'n':1}, {n:'v'}
        // which is why we might need to change it to real JSON objects such as {"n":1} or {"n":"v"}
        const validArgs: string = params.replace(/(')?(\w+)(')?(\s)?:/g, '"$2":').replace(/:(\s)?(')(.*?)(')/g, ':"$3"');
        try {
          interpolateParams = JSON.parse(validArgs);
        } catch (e) {
          throw new SyntaxError(`Wrong parameter in TranslatePipe. Expected a valid Object, received: ${params}`);
        }
      } else if (typeof params === 'object' && !Array.isArray(params)) {
        interpolateParams = params;
      }
    }

    // store the query, in case it changes
    this.lastKey = query;

    // store the params, in case they change
    this.lastParams = { ...interpolateParams };

    // store the defaults, in case they change
    this.lastDefaults = defaults;

    // if there is a subscription to onLangChange, clean it
    this._dispose();

    // set the value
    this.updateValue(query, defaults, interpolateParams);

    // subscribe to onTranslationChange event, in case the translations change
    if (!('onTranslationChange' in this.subs)) {
      this.subs['onTranslationChange'] = this.translate.onTranslationChange.subscribe((event: TranslationChangeEvent) => {
        if (this.lastKey && event.lang === this.translate.getCurrentLang()) {
          this.lastKey = null;
          this.updateValue(query, defaults, interpolateParams);
        }
      });
    }

    // subscribe to onDefaultLangChange event, in case the default language changes
    if (!('onDefaultLangChange' in this.subs)) {
      this.subs['onDefaultLangChange'] = this.translate.onFallbackLangChange.subscribe(() => {
        if (this.lastKey) {
          this.lastKey = null; // we want to make sure it doesn't return the same value until it's been updated
          this.updateValue(query, defaults, interpolateParams);
        }
      });
    }

    // subscribe to onPrefixChange event, in case the default language changes
    if (!('onPrefixChange' in this.subs) && this.translatePrefixDirective) {
      this.subs['onPrefixChange'] = this.translatePrefixDirective.onPrefixChange.subscribe(() => {
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

  private applyDefault(defaults: DefaultType | undefined, interpolateParams: InterpolationParameters | undefined, value: string): void {
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
    } else if (defaults && this.translate.getCurrentLang() in (defaults as Record<string, string>)) {
      const default1 = exchangeParam((defaults as any)[this.translate.getCurrentLang()]);
      this.value = this.parser.interpolate(default1, interpolateParams) ?? '';
    } else {
      this.value = value;
    }
  }

  /**
   * Clean any existing subscription to change events
   */
  private _dispose(keys?: string[]): void {
    const entries = keys?.length ? keys : Object.keys(this.subs);
    for (const k of entries) {
      if (k in this.subs) {
        this.subs[k].unsubscribe();
        delete this.subs[k];
      }
    }
  }
}
