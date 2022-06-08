import { DatePart } from './datepart';

export class Hours extends DatePart {
  override up() {
    this.date.setHours(this.date.getHours() + 1);
  }

  override down() {
    this.date.setHours(this.date.getHours() - 1);
  }

  override setTo(val: string) {
    this.date.setHours(Number.parseInt(val.slice(-2)));
  }

  override toString() {
    let hours = this.date.getHours();

    if (/h/.test(this.token)) {
      hours = hours % 12 || 12;
    }

    return this.token.length > 1 ? String(hours).padStart(2, '0') : String(hours);
  }
}
