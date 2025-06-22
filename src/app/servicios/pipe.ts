import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'moneda',
  standalone: true
})
export class MonedaPipe implements PipeTransform {
  transform(value: number, currencySymbol: string = '$'): string {
    if (isNaN(value)) return '';
    return currencySymbol + value.toFixed(2);
  }
}