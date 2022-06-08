import { DatePart } from './datepart';

export class Year extends DatePart {
  override up() {
    this.date.setFullYear(this.date.getFullYear() + 1);
  }

  override down() {
    this.date.setFullYear(this.date.getFullYear() - 1);
  }

  override setTo(val: string) {
    this.date.setFullYear(Number.parseInt(val.slice(-4), 10));
  }

  override toString() {
    const year = String(this.date.getFullYear()).padStart(4, '0');
    return this.token.length === 2 ? year.slice(-2) : year;
  }
}
