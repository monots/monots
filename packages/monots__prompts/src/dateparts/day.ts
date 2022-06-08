import { DatePart } from './datepart';

const getOrdinal = (n: number) => {
  n = n % 10;
  return n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
};

export class Day extends DatePart {
  override up() {
    this.date.setDate(this.date.getDate() + 1);
  }

  override down() {
    this.date.setDate(this.date.getDate() - 1);
  }

  override setTo(val: string) {
    this.date.setDate(Number.parseInt(val.slice(-2)));
  }

  override toString() {
    const date = this.date.getDate();
    const day = this.date.getDay();
    return this.token === 'DD'
      ? String(date).padStart(2, '0')
      : this.token === 'Do'
      ? String(date + getOrdinal(date))
      : this.token === 'd'
      ? String(day + 1)
      : this.token === 'ddd'
      ? String(this.locales.weekdaysShort[day])
      : this.token === 'dddd'
      ? this.locales.weekdays[day] ?? ''
      : String(date);
  }
}
