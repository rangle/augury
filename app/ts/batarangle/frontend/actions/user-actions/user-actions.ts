import {Injectable} from 'angular2/angular2';
import {Dispatcher} from '../../dispatcher/dispatcher';
import {UserActionType} from '../action-constants';
import {BackendMessagingService} from '../../channel/backend-messaging-service';

@Injectable()
/**
 * User Actions
 */
export class UserActions {

  constructor(
    private dispatcher: Dispatcher,
    private messagingService: BackendMessagingService
  ) {
  }

  /**
   * Get the component data from back-end
   */
  getComponentData() {

    this.messagingService.sendMessageToBackend({
      actionType: UserActionType.GET_COMPONENT_DATA
    });

    // This is not strictly needed for now.
    // Just a broadcast that this was sent.
    // But, we might want to listen to this in the future.
    // For example: show indication that request has been sent on the UI
    this.dispatcher.messageBus.onNext({
      actionType: UserActionType.GET_COMPONENT_DATA
    });

  }

  /**
   * Select a node to be highlighted
   * @param  {Object} options.node
   */
  selectNode({ node }) {

    this.dispatcher.messageBus.onNext({
      actionType: UserActionType.SELECT_NODE,
      node
    });

  }

  /**
   * Search for a node to be highlighted
   * @param  {String} options.query
   */
  searchNode({ query }) {

    this.dispatcher.messageBus.onNext({
      actionType: UserActionType.SEARCH_NODE,
      query
    });

  }

}