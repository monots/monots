import { DatePart } from './datepart';

export class Seconds extends DatePart {
  override up() {
    this.date.setSeconds(this.date.getSeconds() + 1);
  }

  override down() {
    this.date.setSeconds(this.date.getSeconds() - 1);
  }

  override setTo(val: string) {
    this.date.setSeconds(Number.parseInt(val.slice(-2)));
  }

  override toString() {
    const s = this.date.getSeconds();
    return this.token.length > 1 ? String(s).padStart(2, '0') : String(s);
  }
}
