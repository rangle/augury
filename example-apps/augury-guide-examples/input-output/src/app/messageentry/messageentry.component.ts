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
        class="input self-center"
        placeholder="Type a message" />
      <button
        type="submit"
        class="btn btn-primary self-center caps">
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
