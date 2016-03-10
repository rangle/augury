import {Injectable} from 'angular2/core';

export default class Service3 {
  value: string = 'service3';
  constructor() {
    this.value = this.value + ' Id: ' + Math.floor(Math.random() * 500);
  }
}
