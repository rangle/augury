import {Injectable} from 'angular2/core';

export default class Service2 {
  value: string = 'service2';
  constructor() {
    this.value = this.value + ' Id: ' + Math.floor(Math.random() * 500);
  }
}
