import {Injectable} from 'angular2/core';

export default class Service4 {
  value: string = 'service4';
  constructor() {
    this.value = this.value + ' Id: ' + Math.floor(Math.random() * 500);
  }
}
