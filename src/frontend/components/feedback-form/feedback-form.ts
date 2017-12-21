import {Output, EventEmitter, Component, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

import {OverallExpControl, Experience} from './overall-exp/overall-exp';
import {GoogleService, FeedbackFormData} from './google-service/google-service';
import {Options, Theme} from '../../state';


@Component({
  selector: 'bt-feedback-form',
  template: require('./feedback-form.html'),
  styles: [require('to-string-loader!./feedback-form.css')],
  host: {
    '[class.dark]': 'isDarkTheme()'
  }
})

export class FeedbackForm {
  private isDarkTheme = () => this.options.theme === Theme.Dark;
  private feedbackControl: FormControl = new FormControl('');
  private isSubmitting = false;

  @Output() onCloseForm: EventEmitter<null> = new EventEmitter<null>();

  @ViewChild('experienceControl')
  private expControl: OverallExpControl;

  constructor(private options: Options, private googleForms: GoogleService) { }

  onSubmit() {
    this.isSubmitting = true;
    const feedback: FeedbackFormData = {
      overallExp: Experience[this.expControl.rating],
      feedback: this.feedbackControl.value,
    };

    this.googleForms.sendFeedback(feedback)
      .then(() => {
        this.isSubmitting = false;
        this.expControl.resetRating();
        this.feedbackControl.reset();
        this.onCloseForm.emit();
      });
  }
}
