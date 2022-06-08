import { DatePart } from './datepart';

export class Minutes extends DatePart {
  override up() {
    this.date.setMinutes(this.date.getMinutes() + 1);
  }

  override down() {
    this.date.setMinutes(this.date.getMinutes() - 1);
  }

  override setTo(val: string) {
    this.date.setMinutes(Number.parseInt(val.slice(-2)));
  }

  override toString() {
    const m = this.date.getMinutes();
    return this.token.length > 1 ? String(m).padStart(2, '0') : String(m);
  }
}
