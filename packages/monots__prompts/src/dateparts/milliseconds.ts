import { DatePart } from './datepart';

export class Milliseconds extends DatePart {
  override up() {
    this.date.setMilliseconds(this.date.getMilliseconds() + 1);
  }

  override down() {
    this.date.setMilliseconds(this.date.getMilliseconds() - 1);
  }

  override setTo(val: string) {
    this.date.setMilliseconds(Number.parseInt(val.slice(-this.token.length)));
  }

  override toString() {
    return String(this.date.getMilliseconds()).padStart(4, '0').slice(0, this.token.length);
  }
}
