import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  SimpleChanges,
  Input,
  Output,
} from '@angular/core';

import {Highlightable} from '../../utils/highlightable';
import {highlightTime} from '../../../utils/configuration';
import {ObjectType} from '../../../tree';

/// The types of values that this editor can emit to its owner
export type EditorType = string | number | Object | Function;

/// The value we provide to the owner may be a value or a collection of values
export type EditorResult = EditorType | Array<EditorType>;

export enum State {
  Read,
  Write,
  Unparseable
}

@Component({
  selector: 'bt-property-editor',
  templateUrl: './property-editor.html',
  styleUrls: ['./property-editor.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyEditor {
  @Input() private key: string;
  @Input() private level: number;
  @Input() private initialValue;

  @Output() private cancel = new EventEmitter<void>();
  @Output() private submit = new EventEmitter<EditorResult>();

  @Output() private stateTransition = new EventEmitter<State>();

  State = State;
  state = State.Read;

  private value;

  private pulse: boolean;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  private get editor(): HTMLInputElement {
    return this.elementRef.nativeElement.querySelector('input');
  }

  focus() {
    this.editor.focus();
  }

  private ngOnChanges(changes: SimpleChanges) {
    if (this.hasChanged(changes)) {
      this.value = this.initialValue;
    }
  }

  private ngAfterViewChecked() {
    if (this.state === State.Write) {
      this.focus();
    }
  }

  private parseValue(value): EditorResult {
    try {
      return new Function(`return ${value}`)();
    }
    catch (e) {
      return value;
    }
  }

  private hasChanged(changes: SimpleChanges) {
    if (changes == null) {
      return false;
    }
    return changes.hasOwnProperty('initialValue');
  }

  private isUndefined(): boolean {
    return this.value === undefined;
  }

  private isNull(): boolean {
    return this.value === null;
  }

  private isEmptyString(): boolean {
    return typeof this.value === 'string' && this.value.length === 0;
  }

  private isRenderable(): boolean {
    return !this.isUndefined()
        && !this.isNull()
        && !this.isEmptyString();
  }

  private onKeypress(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.accept();
        break;
      case 'Escape':
        this.reject();
        break;
    }
  }

  private transition(state: State) {
    if (this.state === state) {
      return;
    }

    this.stateTransition.emit(state);

    this.state = state;

    switch (state) {
      case State.Write:
        this.changeDetector.detectChanges();
        this.focus();
        this.editor.select();
        this.moveCursorToEnd();
        break;
    }
  }

  private accept() {
    const parsed = this.parseValue(this.value);

    this.submit.emit(parsed);

    this.initialValue = parsed;

    this.transition(State.Read);
  }

  private reject() {
    this.value = this.initialValue;

    this.transition(State.Read);

    this.cancel.emit(void 0);
  }

  private updateTimer;

  private deferredUpdate(fn: () => void, timeout?: number) {
    clearTimeout(this.updateTimer);

    this.updateTimer = setTimeout(() => {
      fn();
      this.updateTimer = null;
    }, timeout || 0);
  }

  private invalid() {
    this.pulse = true;

    this.deferredUpdate(() => this.pulse = false, highlightTime);
  }

  private moveCursorToEnd() {
    const element = this.elementRef.nativeElement;

    if (typeof element.selectionStart === 'number') {
      element.selectionStart = element.selectionEnd = element.value.length;
    } else if (element.createTextRange) {
      element.focus();
      const range = element.createTextRange();
      range.collapse(false);
      range.select();
    }
  }

  onClick(event: MouseEvent) {
    switch (this.state) {
      case State.Read:
        this.transition(State.Write);
        break;
      case State.Write:
        break;
      case State.Unparseable:
        this.invalid();
        break;
    }
  }

  private onBlur(event: Event) {
    switch (this.state) {
      case State.Read:
        break;
      case State.Write:
        this.accept();
        break;
      case State.Unparseable:
        this.focus();
        this.invalid();
        break;
      default:
        throw new Error(`Unknown state: ${this.state}`);
    }
  }
}
