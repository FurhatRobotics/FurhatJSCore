"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Furhat main class. Maintains the websocket connection to furhatOS and
 * has methods to send events, subscribe to events and helper methods such as say,
 * gesture, etc.
 *
 * @param domain IP Address for furhatOS - localhost if SDK.
 * @param port port for RealTimeAPI module of furhatOS.
 * @param route route for RealTimeAPI module of furhatOS.
 */
class Furhat {
    constructor(domain, port, route) {
        this.eventFunctions = {};
        this.domain = domain;
        this.port = port;
        this.route = route;
    }
    /**
     * Initializes the connection and return a promise. Await for the promise to resolve before
     * using the object
     */
    init() {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(`ws://${this.domain}:${this.port}/${this.route}`);
            this.socket.onopen = () => {
                resolve("Success");
            };
            this.socket.onmessage = (message) => {
                const event = JSON.parse(message.data);
                // If a callback is available then call it
                this.eventFunctions[event.event_name] !== undefined &&
                    this.eventFunctions[event.event_name](event);
            };
            this.socket.onerror = () => {
                reject("Error on socket");
            };
        });
    }
    /**
     * Sends an event to furhatOS
     * @param event Object containing the event. Mandtory to have event_name parameter in the object
     */
    send(event) {
        var _a, _b, _c;
        if (((_a = this.socket) === null || _a === void 0 ? void 0 : _a.readyState) === 2 || ((_b = this.socket) === null || _b === void 0 ? void 0 : _b.readyState) === 3) {
            console.warn("Cannot send event. Socket is not ready.");
            return false;
        }
        else if (((_c = this.socket) === null || _c === void 0 ? void 0 : _c.readyState) === 1) {
            this.socket.send(JSON.stringify(event));
            return true;
        }
        return false;
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
