export default class ParseData {

  static BOOLEAN_CONSTANTS = {
    'true': true,
    'false': false
  };

  public static parseNumber(data: any): number {
    return +data;
  }

  public static parseBoolean(data: any): boolean {
    return this.BOOLEAN_CONSTANTS[data.toLowerCase()];
  }

  public static convertToNumber(data: any, oldValue: number): number {
    const newValue: number = isNaN(+data) ? oldValue : +data;
    return newValue;
  }

  public static convertToBoolean(data: any, oldValue: boolean): boolean {
    let newValue: boolean =
      this.BOOLEAN_CONSTANTS[data.toLowerCase()] === undefined ?
        oldValue : this.BOOLEAN_CONSTANTS[data.toLowerCase()];
    return newValue;
  }

  public static getType(state: any, key: string): string {
    return typeof state[key];
  }

  public static checkType(state: any, key: string, value: any): boolean {
    return (typeof state[key]) === (typeof value);
  }
}
