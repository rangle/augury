import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-messageentry',
  template: `
    <form
      #formRef="ngForm"
      (ngSubmit)="onSend(formRef.value); formRef.reset();"
      class="flex items-center">
      <input
        type="text"
        ngModel
        name="message"
        class="input-reset ba br3 b--black-20 pa2 mb2 db w-50"
        placeholder="Type a message" />
      <button
        type="submit"
        class="f6 link dim br3 ph3 pv2 mb2 dib white bg-light-purple">
        Send
      </button>
    </form>
  `,
  styles: [`
    .input {
      margin-bottom: 0;
      margin-right: 1em;
    }
  `]
})
export class MessageEntryComponent {
  @Output() messageEvent = new EventEmitter<string>();

  onSend(data) {
    this.messageEvent.emit(data.message);
  }
}
