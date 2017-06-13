import ParseData from './parse-data';

test('utils/parse-data: parse number', () => {
  const value: any = '10.24';
  const parsedValue = ParseData.parseNumber(value);
  const type: string = typeof parsedValue;

  expect(type).toBe('number');
  expect(parsedValue + '').toBe(value);
});

test('utils/parse-data: parse boolean true', () => {
  const value: any = 'true';
  const parsedValue = ParseData.parseBoolean(value);
  const type: string = typeof parsedValue;

  expect(type).toBe('boolean');
  expect(parsedValue).toBe(true);
});

test('utils/parse-data: parse boolean false', () => {
  const value: any = 'false';
  const parsedValue = ParseData.parseBoolean(value);
  const type: string = typeof parsedValue;

  expect(type).toBe('boolean');
  expect(parsedValue).toBe(false);
});

test('utils/parse-data: convertToNumber with correct values', () => {
  const value: any = '10.23';
  const parsedValue = ParseData.convertToNumber(value, 0);
  const type: string = typeof parsedValue;

  expect(type).toBe('number');
  expect(parsedValue + '').toBe(value);
});

test('utils/parse-data: convertToNumber with wrong values', () => {
  const oldValue: number = 0;
  const value: any = 'wrong';
  const parsedValue = ParseData.convertToNumber(value, 0);
  const type: string = typeof parsedValue;

  expect(type).toBe('number');
  expect(parsedValue).toBe(oldValue);
});

test('utils/parse-data: convertToBoolean with correct values', () => {
  const value: any = 'true';
  const parsedValue = ParseData.convertToBoolean(value, false);
  const type: string = typeof parsedValue;

  expect(type).toBe('boolean');
  expect(parsedValue).toBe(true);
});

test('utils/parse-data: convertToBoolean with wrong values', () => {
  const value: any = 'asdas';
  const parsedValue = ParseData.convertToBoolean(value, false);
  const type: string = typeof parsedValue;

  expect(type).toBe('boolean');
  expect(parsedValue).toBe(false);
});

test('utils/parse-data: getTypeByValue', () => {
  const value1: string = 'hello';
  const type1: string = ParseData.getTypeByValue(value1);

  expect(type1).toBe('string');

  const value2: boolean = true;
  const type2: string = ParseData.getTypeByValue(value2);

  expect(type2).toBe('boolean');
});

test('utils/parse-data: checkType', () => {
  const value: string = 'hello';
  const state = {
    name: 'hello',
  };

  const typeCheck = ParseData.checkType(state, 'name', value);
  expect(typeCheck).toBe(true);
});

test('utils/parse-data: getType', () => {
  const state = {
    name: 'hello',
  };

  const typeCheck = ParseData.getType(state, 'name');
  expect(typeCheck).toBe('string');
});
