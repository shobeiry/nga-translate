import { Directive, ElementRef, inject, input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { InterpolationParameters, TranslateParser, TranslateService } from '@ngx-translate/core';

import { getDefault } from './util';
import { Subscription } from 'rxjs';
import { TranslatePrefixDirective } from './translate-prefix.directive';
import { getTranslateKey } from './translate-key';
import { DefaultValue } from './translate.types';

/**
 * A wrapper directive on top of the translation pipe as the inbuilt translation directive from ngx-translate is too verbose and buggy
 */
@Directive({
  standalone: true,
  selector: '[ngaTranslate]',
})
export class TranslateDirective implements OnChanges, OnInit, OnDestroy {
  ngaTranslate = input<string>();
  translateValues = input<InterpolationParameters>();
  translatePrefix = inject(TranslatePrefixDirective, { optional: true });
  translateService = inject(TranslateService);
  translateParser = inject(TranslateParser);
  el = inject(ElementRef);

  defaults?: DefaultValue | null;

  onPrefixChange: Subscription | undefined;
  onTranslationChange: Subscription | undefined;
  onLangChange: Subscription | undefined;
  onDefaultLangChange: Subscription | undefined;
  onTranslationGets: Subscription[] = [];

  translationNotFoundMessage = 'translation-not-found';

  ngOnInit(): void {
    this.onTranslationChange = this.translateService.onTranslationChange.subscribe(() => this.getTranslation());
    this.onLangChange = this.translateService.onLangChange.subscribe(() => this.getTranslation());
    this.onDefaultLangChange = this.translateService.onFallbackLangChange.subscribe(() => this.getTranslation());
    this.onPrefixChange = this.translatePrefix?.onPrefixChange.subscribe(() => this.getTranslation());
  }

  ngOnChanges(): void {
    this.getTranslation();
  }

  ngOnDestroy(): void {
    this._dispose();
  }

  private getTranslation(): void {
    if (!this.defaults) {
      this.defaults = this.el.nativeElement.innerHTML;
    }
    const key = this.ngaTranslate();
    if (!key) {
      this.applyDefault('');
      return;
    }

    const translateKey = getTranslateKey(key, this.translatePrefix?.ngaTranslatePrefix());
    const translateValues = this.translateValues();

    const onGet = this.translateService.get(translateKey, translateValues).subscribe({
      next: (value: string) => {
        if (value === translateKey) {
          this.applyDefault(value);
        } else {
          this.el.nativeElement.innerHTML = value;
        }
      },
      error: () => `${this.translationNotFoundMessage}[${translateKey}]`,
    });

    this.onTranslationGets.push(onGet);
  }

  private applyDefault(value: string): void {
    this.el.nativeElement.innerHTML = getDefault(
      this.translateParser,
      this.translateService.getCurrentLang(),
      this.defaults ?? undefined,
      this.translateValues(),
      value,
    );
  }

  /**
   * Clean any existing subscription to change events
   */
  private _dispose(): void {
    this.onPrefixChange?.unsubscribe();
    this.onPrefixChange = undefined;
    this.onTranslationChange?.unsubscribe();
    this.onTranslationChange = undefined;
    this.onLangChange?.unsubscribe();
    this.onLangChange = undefined;
    this.onDefaultLangChange?.unsubscribe();
    this.onDefaultLangChange = undefined;
    for (const onTranslationGet of this.onTranslationGets) {
      onTranslationGet.unsubscribe();
    }
    this.onTranslationGets = [];
  }
}
