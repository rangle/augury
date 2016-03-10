import {Injectable} from 'angular2/core';

export default class Service1 {
  value: string = 'service1';
  constructor() {
    this.value = this.value + ' Id: ' + Math.floor(Math.random() * 500);
  }
}
