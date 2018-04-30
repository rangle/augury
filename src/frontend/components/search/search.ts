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
  templateUrl: './search.html',
  styleUrls: ['./search.css'],
})
export class Search {
  /// A function that is capable of executing a search and returning results
  @Input() private handler: SearchHandler;

  /// A placeholder string that will be placed in an empty search field
  @Input() placeholder: string;

  /// Invoked when the user hits the next or previous buttons
  @Output() private selectedResult = new EventEmitter<SearchResult>();

  SearchState = SearchState;

  state = SearchState.Idle;

  query: string;

  private results: Array<SearchResult>;

  /// Index of the current search result that the user has selected
  current: number;

  get total(): number {
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

  enableNext(): boolean {
    return this.current < this.total;
  }

  enablePrevious(): boolean {
    return this.current > 0;
  }

  onKeypress(event: KeyboardEvent) {
    if (this.state !== SearchState.Results) {
      return;
    }

    if (event.key === 'Enter') {
      if (event.getModifierState('Shift')) {
        this.previous();
      } else {
        this.next();
      }
    }
  }

  onSearchChanged(value: string) {
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

  previous() {
    if (--this.current < 0) { // wrap
      this.current = this.total - 1;
    }

    this.selectedResult.emit(this.results[this.current]);
  }

  next() {
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
}
