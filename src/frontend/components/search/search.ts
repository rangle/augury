import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

type SearchResult = any;

export interface SearchHandler {
  (text: string): Array<SearchResult> | Promise<Array<SearchResult>>;
}

export enum SearchState {
  Idle,        // no search performed
  Searching,   // waiting for search results
  Results,     // received search results
  Failure,     // search failed or no results found
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

  private SearchState = SearchState;

  private state = SearchState.Idle;

  private query: string;

  private results: Array<SearchResult>;

  /// Index of the current search result that the user has selected
  private current: number;

  private get total(): number {
    switch (this.state) {
      case SearchState.Idle:
      case SearchState.Failure:
      case SearchState.Searching:
        return 0;
      default:
        return this.results == null ||
               this.results.length === 0
                 ? 0
                 : this.results.length;
    }
  }

  private enableNext(): boolean {
    return this.current < this.total;
  }

  private enablePrevious(): boolean {
    return this.current > 0;
  }

  private onKeypress(event: KeyboardEvent) {
    if (this.state !== SearchState.Results) {
      return;
    }

    switch (event.keyCode) {
      case 10: // LF
      case 13: // CR
      case 40: // down arrow
        this.next();
        break;
      case 38: // up arrow
        this.previous();
        break;
    }
  }

  private onSearchChanged(value: string) {
    this.query = value;

    const response = (state: SearchState, results: Array<SearchResult>) => {
      this.state = state;
      this.results = results;
      this.current = 0;

      if (results.length > 0) {
        this.selectedResult.emit(this.results[this.current]);
      }
    };

    if (this.query == null || this.query.length === 0) {
      response(SearchState.Idle, new Array<SearchResult>());
      return;
    }

    this.state = SearchState.Searching;

    const result = this.handler(this.query);

    if (Array.isArray(result)) {
      response(SearchState.Results, result);
    }
    else if (typeof result.then === 'function') {
      result.then(searchResults => {
        response(SearchState.Results, searchResults);
      })
      .catch(error => {
        response(SearchState.Failure, new Array<SearchResult>());
      });
    }
  }

  private previous() {
    if (--this.current < 0) { // wrap
      this.current = this.total - 1;
    }

    this.selectedResult.emit(this.results[this.current]);
  }

  private next() {
    if (++this.current >= this.total) { // wrap
      this.current = 0;
    }

    this.selectedResult.emit(this.results[this.current]);
  }

  reload() {
    this.onSearchChanged(this.query);
  }

  reset() {
    this.onSearchChanged('');
  }
};
