import {Injectable} from '@angular/core';
import {Http} from '@angular/http';


const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/18VuNfbKUzFXNkPv7-QhSDmgKHhfOeWJBKugD2o37Wu8/formResponse';

export interface FeedbackFormData {
  overallExp: string;
  feedback: string;
}

/**
 * Service for sending feedback to google forms
 * to be saved into a google spreadsheet.
 */
@Injectable()
export class GoogleService {
  constructor(private http: Http) {
  }

  public sendFeedback(data: FeedbackFormData) {
    return this.http.get(this._getFinalUrl(data)).toPromise();
  }

  private _getFinalUrl(feedbackData: FeedbackFormData) {
    // Entry ids are found by inspected the source of the live google form.
    // Searching for `name="entry.` in order to find each ID.
    const params = `?entry.1709491946=${feedbackData.overallExp}&entry.593240098=${feedbackData.feedback}`;
    return GOOGLE_FORM_URL + params;
  }
}
