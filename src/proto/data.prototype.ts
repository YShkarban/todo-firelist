
  interface Date {
    firstDayOfMonth(): Date;
  }

Date.prototype.firstDayOfMonth = function (): Date {
  return new Date(this.getFullYear(), this.getMonth(), this.getDate());
};
