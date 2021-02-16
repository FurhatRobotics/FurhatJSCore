export interface Event {
    event_name: string;
    [key: string]: any;
}
export interface EventFunctions {
    [key: string]: EventCallback;
}
export declare type EventCallback = (event: Event) => void;
/**
 * Furhat main class. Maintains the websocket connection to furhatOS and
 * has methods to send events, subscribe to events and helper methods such as say,
 * gesture, etc.
 *
 * @param domain IP Address for furhatOS - localhost if SDK.
 * @param port port for RealTimeAPI module of furhatOS.
 * @param route route for RealTimeAPI module of furhatOS.
 */
export default class Furhat {
    private domain;
    private port;
    private route;
    private socket?;
    private eventFunctions;
    constructor(domain: string, port: number, route: string);
    /**
     * Initializes the connection and return a promise. Await for the promise to resolve before
     * using the object
     */
    init(): Promise<unknown>;
    /**
     * Sends an event to furhatOS
     * @param event Object containing the event. Mandtory to have event_name parameter in the object
     */
    send(event: Event): boolean;
    /**
     * Subscribes to the given event and triggers the supplied callback on event
     * @param eventName Name of the event to subscribe
     * @param callback Function which needs to be triggered when the given event is recieved
     * @param dontSend [Optional] [false by default] Boolean which determines wether to send
     * the subscribe event or not. use it to set callbacks for event that are already subscribed to,
     * for instance with group subscriptions
     */
    subscribe(eventName: string, callback: EventCallback, dontSend?: boolean): void;
    /**
     * Subscribes to the given event group
     * @param groupNumber Number(Assigned ENUM) of the group that needs to be subscribed to
     */
    subscribeGroup(groupNumber: number): void;
    /**
     * Says a given text
     * @param text Text which needs to be said by Furhat
     */
    say(text: string): void;
    /**
     * Stimulates the speech of a user in the interaction space
     * @param text Text which needs to be said by the user
     */
    userSpeech(text: string): void;
    /**
     * Stimulates SenseSpeechStart event. Can be used to stimulate user speech via typing
     */
    userSpeechStart(): void;
    /**
     * Performs the given gesture
     * @param name Name of the gesture that needs to be performed
     */
    gesture(name: string): void;
}
