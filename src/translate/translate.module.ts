import { NgModule } from '@angular/core';
import { TranslateDirective } from './translate.directive';
import { TranslatePipe } from './translate.pipe';
import { TranslatePrefixDirective } from './translate-prefix.directive';

@NgModule({
  imports: [TranslatePrefixDirective, TranslateDirective, TranslatePipe],
  exports: [TranslateDirective, TranslatePipe, TranslatePrefixDirective],
})
export class NgaTranslateModule {}
