// @flow

// Constants
const OPEN = 'open';
const CLOSE = 'closed';
const FAIL = 'failed';
const EVENT = 'event';

/**
 * Furhat class.
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
     */
  init(domain, port, route, callback) {
    if (this.socket !== undefined) {
      this.socket.close();
    }
    console.log(`initializing ws://${domain}:${port}/${route}`);
    this.socket = new WebSocket(`ws://${domain}:${port}/${route}`);

    this.socket.onopen = (event) => {
      this.status = OPEN;
      if (callback !== undefined) {
        callback(OPEN, this);
      }
    };
    this.socket.onmessage = (event) => {
      if (this.eventFunctions[JSON.parse(event.data).event_name] !== undefined)
        this.eventFunctions[JSON.parse(event.data).event_name](event);
      // console.log(JSON.parse(event.data));
    };
    this.socket.onclose = (event) => {
      this.status = CLOSE;
      if (callback !== undefined) {
        callback(CLOSE, this);
      }
    };
    this.socket.onerror = (event) => {
      this.status = FAIL;
      if (callback !== undefined) {
        callback(FAIL, this);
      }
    };
  }

  send(event) {
    if (this.socket.readyState === 2 || this.socket.readyState === 3) {
      // SHIT
    } else if (this.socket.readyState === 1) {
      this.socket.send(JSON.stringify(event));
    }
  }

  sendEvent(event) {
    if (event.event_name === undefined) {
      event.event_name = 'furhatos.event.CustomEvent'
    }
    this.send(event);
  }

  subscribe(eventName, callback, dontSend = false) {
    const event = { event_name: 'furhatos.event.actions.ActionRealTimeAPISubscribe', name: eventName };
    this.eventFunctions[eventName] = callback;
    if (!dontSend) {
      this.send(event);
    }
  }

  subscribeGroup(groupNumber) {
    const event = { event_name: 'furhatos.event.actions.ActionRealTimeAPISubscribe', group: groupNumber };
    this.send(event);
  }

  say(text) {
    const event = { event_name: 'furhatos.event.actions.ActionSpeech', text };
    this.send(event);
  }

  userSpeech(text, user) {
    const event = { event_name: 'furhatos.event.senses.SenseTypingEnd', messageText: text };
    this.send(event);
  }

  userSpeechStart() {
    const event = { event_name: 'furhatos.event.senses.SenseTypingStart' };
    this.send(event);
  }

  gesture(name) {
    const event = { event_name: 'furhatos.event.actions.ActionGesture', name };
    this.send(event);
  }
}

export default Furhat;
