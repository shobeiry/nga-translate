import { InterpolationParameters } from '@ngx-translate/core';

export type DefaultString = string;
export type DefaultObject = Record<PropertyKey, string>;
export type DefaultValue = DefaultObject | DefaultString;

export type ParamsStringJson = string;
export type Params = InterpolationParameters | ParamsStringJson;
