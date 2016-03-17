import * as test from 'tape';
import ParseData from './parse-data';

test('utils/parse-data: parse number', t => {
  t.plan(2);
  const value: any = '10.24';
  const parsedValue = ParseData.parseNumber(value);
  const type: string = typeof parsedValue;

  t.deepEqual(type, 'number', 'should be of type number');
  t.deepEqual(parsedValue + '', value, 'values should be same');
  t.end();
})

test('utils/parse-data: parse boolean true', t => {
  t.plan(2);
  const value: any = 'true';
  const parsedValue = ParseData.parseBoolean(value);
  const type: string = typeof parsedValue;

  t.deepEqual(type, 'boolean', 'should be of type boolean');
  t.deepEqual(parsedValue, true, 'values should be same');
  t.end();
})

test('utils/parse-data: parse boolean false', t => {
  t.plan(2);
  const value: any = 'false';
  const parsedValue = ParseData.parseBoolean(value);
  const type: string = typeof parsedValue;

  t.deepEqual(type, 'boolean', 'should be of type boolean');
  t.deepEqual(parsedValue, false, 'values should be same');
  t.end();
})

test('utils/parse-data: convertToNumber with correct values', t => {
  t.plan(2);
  const value: any = '10.23';
  const parsedValue = ParseData.convertToNumber(value, 0);
  const type: string = typeof parsedValue;

  t.deepEqual(type, 'number', 'should be of type number');
  t.deepEqual(parsedValue + '', value, 'values should be same');
  t.end();
})

test('utils/parse-data: convertToNumber with wrong values', t => {
  t.plan(2);
  const oldValue: number = 0;
  const value: any = 'wrong';
  const parsedValue = ParseData.convertToNumber(value, 0);
  const type: string = typeof parsedValue;

  t.deepEqual(type, 'number', 'should be of type number');
  t.deepEqual(parsedValue, oldValue, 'values should be same');
  t.end();
})

test('utils/parse-data: convertToBoolean with correct values', t => {
  t.plan(2);
  const value: any = 'true';
  const parsedValue = ParseData.convertToBoolean(value, false);
  const type: string = typeof parsedValue;

  t.deepEqual(type, 'boolean', 'should be of type boolean');
  t.deepEqual(parsedValue, true, 'values should be same');
  t.end();
})

test('utils/parse-data: convertToBoolean with wrong values', t => {
  t.plan(2);
  const value: any = 'asdas';
  const parsedValue = ParseData.convertToBoolean(value, false);
  const type: string = typeof parsedValue;

  t.deepEqual(type, 'boolean', 'should be of type boolean');
  t.deepEqual(parsedValue, false, 'values should be same');
  t.end();
})

test('utils/parse-data: getTypeByValue', t => {
  t.plan(2);
  const value1: string = 'hello';
  const type1: string = ParseData.getTypeByValue(value1);

  t.deepEqual(type1, 'string', 'should be of type string');

  const value2: boolean = true;
  const type2: string = ParseData.getTypeByValue(value2);

  t.deepEqual(type2, 'boolean', 'should be of type boolean');

  t.end();
})

test('utils/parse-data: checkType', t => {
  t.plan(1);
  const value: string = 'hello';
  const state = {
    name: 'hello'
  };

  const typeCheck = ParseData.checkType(state, 'name', value);
  t.deepEqual(typeCheck, true, 'should be of type boolean');

  t.end();
})

test('utils/parse-data: getType', t => {
  t.plan(1);
  const state = {
    name: 'hello'
  };

  const typeCheck = ParseData.getType(state, 'name');
  t.deepEqual(typeCheck, 'string', 'should be of type boolean');

  t.end();
})