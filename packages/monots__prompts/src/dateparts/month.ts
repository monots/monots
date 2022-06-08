import { DatePart } from './datepart';

export class Month extends DatePart {
  override up() {
    this.date.setMonth(this.date.getMonth() + 1);
  }

  override down() {
    this.date.setMonth(this.date.getMonth() - 1);
  }

  override setTo(val: string) {
    const month = Number.parseInt(val.slice(-2)) - 1;
    this.date.setMonth(month < 0 ? 0 : month);
  }

  override toString() {
    const month = this.date.getMonth();
    const tl = this.token.length;
    return tl === 2
      ? String(month + 1).padStart(2, '0')
      : tl === 3
      ? this.locales.monthsShort[month] ?? ''
      : tl === 4
      ? this.locales.months[month] ?? ''
      : String(month + 1);
  }
}
