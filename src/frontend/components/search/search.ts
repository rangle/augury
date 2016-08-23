import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

type SearchResult = any;

export interface SearchHandler {
  (text: string): Array<SearchResult>;
}

@Component({
  selector: 'search',
  template: require('./search.html'),
  styles: [require('to-string!./search.css')],
})
export class Search {
  /// A function that is capable of executing a search and returning results
  @Input() private handler: SearchHandler;

  /// A placeholder string that will be placed in an empty search field
  @Input() private placeholder: string;

  /// Invoked when the user hits the next or previous buttons
  @Output() private selectedResult = new EventEmitter<SearchResult>();

  private search: string;

  private results: Array<SearchResult>;

  private current: number;

  private get total(): number {
    if (this.results == null ||
        this.results.length === 0) {
      return 0;
    }
    return this.results.length;
  }

  private enableNext(): boolean {
    return this.current < this.total;
  }

  private enablePrevious(): boolean {
    return this.current > 0;
  }

  private onKeypress(event: KeyboardEvent) {
    switch (event.keyCode) {
      case 10:
      case 13:
        this.onNextResult();
        break;
    }
  }

  private onSearchChanged(event: KeyboardEvent) {
    if (this.search) {
      this.results = this.handler(this.search) || [];
    }
    else {
      this.results = [];
    }
  }

  private onNextResult() {
    if (++this.current >= this.total) { // wrap
      this.current = 0;
    }

    this.selectedResult.emit(this.results[this.current]);
  }

  private onPreviousResult() {
    if (--this.current < 0) { // wrap
      this.current = 0;
    }

    this.selectedResult.emit(this.results[this.current]);
  }
};
