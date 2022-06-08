import { DatePart } from './datepart';

export class Meridiem extends DatePart {
  override up() {
    this.date.setHours((this.date.getHours() + 12) % 24);
  }

  override down() {
    this.up();
  }

  override toString() {
    const meridiem = this.date.getHours() > 12 ? 'pm' : 'am';
    return /A/.test(this.token) ? meridiem.toUpperCase() : meridiem;
  }
}
