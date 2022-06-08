export class DatePart {
  token: string;
  date: Date;
  parts: DatePart[];
  locales: Locales;

  constructor(props: DatePartProps = {}) {
    this.token = props.token || '';
    this.date = props.date ?? new Date();
    this.parts = props.parts ?? [this];
    this.locales = props.locales ?? ({} as Locales);
  }

  up() {}
  down() {}

  next() {
    const currentIdx = this.parts.indexOf(this);
    return this.parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
  }

  prev() {
    const parts = [this.parts].flat().reverse();
    const currentIndex = parts.indexOf(this);
    return parts.find((part, index) => index > currentIndex && part instanceof DatePart);
  }

  setTo(_val: string) {}

  toString() {
    return String(this.date);
  }
}

export interface DatePartProps {
  token?: string;
  date?: Date;
  parts?: DatePart[];
  locales?: Locales;
}

export interface Locales {
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  weekdaysShort: string[];
}
