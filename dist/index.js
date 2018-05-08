'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Constants
const OPEN = 'open';
const CLOSE = 'closed';
const FAIL = 'failed';

/**
 * Furhat main class. Maintains the websocket connection to furhatOS and
 * has methods to send events, subscribe to events and helper methods such as say,
 * gesture, etc.
 */
class Furhat {
  constructor() {
    this.eventFunctions = {};
  }

  /**
   * Initializes the furhat socket connection and executes the callback method.
   * @param domain IP Address for furhatOS - localhost if SDK.
   * @param port port for RealTimeAPI module of furhatOS.
   * @param route route for RealTimeAPI module of furhatOS.
   * @param callback callback method to be executed on successful opening of websocket.
   */
  init(domain, port, route, callback) {
    if (this.socket !== undefined) {
      this.socket.close();
    }
    console.log(`Initializing websocket connection to ws://${domain}:${port}/${route}`); // eslint-disable-line no-console
    this.socket = new window.WebSocket(`ws://${domain}:${port}/${route}`); // eslint-disable-line no-undef

    this.socket.onopen = () => {
      this.status = OPEN;
      if (callback !== undefined) {
        callback(OPEN, this);
      }
    };
    this.socket.onmessage = event => {
      if (this.eventFunctions[JSON.parse(event.data).event_name] !== undefined) {
        this.eventFunctions[JSON.parse(event.data).event_name](JSON.parse(event.data));
      }
    };
    this.socket.onclose = () => {
      this.status = CLOSE;
      if (callback !== undefined) {
        callback(CLOSE, this);
      }
    };
    this.socket.onerror = () => {
      this.status = FAIL;
      if (callback !== undefined) {
        callback(FAIL, this);
      }
    };
  }

  /**
   * Sends an event to furhatOS
   * @param event Object containing the event. Mandtory to have event_name parameter in the object
   */
  send(event) {
    if (this.socket.readyState === 2 || this.socket.readyState === 3) {
      // SHIT
    } else if (this.socket.readyState === 1) {
      this.socket.send(JSON.stringify(event));
    }
  }

  /**
   * Subscribes to the given event and triggers the supplied callback on event
   * @param eventName Name of the event to subscribe
   * @param callback Function which needs to be triggered when the given event is recieved
   * @param dontSend [Optional] [false by default] Boolean which determines wether to send
   * the subscribe event or not. use it to set callbacks for event that are already subscribed to,
   * for instance with group subscriptions
   */
  subscribe(eventName, callback, dontSend = false) {
    const event = { event_name: 'furhatos.event.actions.ActionRealTimeAPISubscribe', name: eventName };
    this.eventFunctions[eventName] = callback;
    if (!dontSend) {
      this.send(event);
    }
  }

  /**
   * Subscribes to the given event group
   * @param groupNumber Number(Assigned ENUM) of the group that needs to be subscribed to
   */
  subscribeGroup(groupNumber) {
    const event = { event_name: 'furhatos.event.actions.ActionRealTimeAPISubscribe', group: groupNumber };
    this.send(event);
  }

  /**
   * Says a given text
   * @param text Text which needs to be said by Furhat
   */
  say(text) {
    const event = { event_name: 'furhatos.event.actions.ActionSpeech', text };
    this.send(event);
  }

  /**
   * Stimulates the speech of a user in the interaction space
   * @param text Text which needs to be said by the user
   */
  userSpeech(text) {
    const event = { event_name: 'furhatos.event.senses.SenseTypingEnd', messageText: text };
    this.send(event);
  }

  /**
   * Stimulates SenseSpeechStart event. Can be used to stimulate user speech via typing
   */
  userSpeechStart() {
    const event = { event_name: 'furhatos.event.senses.SenseTypingStart' };
    this.send(event);
  }

  /**
   * Performs the given gesture
   * @param name Name of the gesture that needs to be performed
   */
  gesture(name) {
    const event = { event_name: 'furhatos.event.actions.ActionGesture', name };
    this.send(event);
  }
}

exports.default = Furhat;