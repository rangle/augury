import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'camelcase'})
export class CamelCasePipe implements PipeTransform {
  transform(value: string) : any {
    return value
            .replace(/\s(.)/g, function($1) { return $1.toUpperCase(); })
            .replace(/\s/g, '')
            .replace(/^(.)/, function($1) { return $1.toLowerCase(); });
  }
}
