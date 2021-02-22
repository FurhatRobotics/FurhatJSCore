export interface Event {
  event_name: string
  [key: string]: any
}
export interface EventFunctions {
  [key: string]: EventCallback
}

export type EventCallback = (event: Event) => void

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
  private domain: string
  private port: number
  private route: string
  private socket?: WebSocket
  private eventFunctions: EventFunctions = {}

  constructor(domain: string, port: number, route: string) {
    this.domain = domain
    this.port = port
    this.route = route
  }

  /**
   * Initializes the connection and return a promise. Await for the promise to resolve before 
   * using the object
   */
  init(): Promise<{error: boolean, message: string}> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(`ws://${this.domain}:${this.port}/${this.route}`)

      this.socket.onopen = () => {
        resolve({error: false, message: "Success"})
      }

      this.socket.onmessage = (message) => {
        const event: Event = JSON.parse(message.data)

        // If a callback is available then call it
        this.eventFunctions[event.event_name] !== undefined &&
          this.eventFunctions[event.event_name](event)
      }

      this.socket.onerror = () => {
        reject({error: true, message: "Error while opening socket"})
      }
    })
  }

  /**
   * Method to set a callback that will be triggered `onerror` of the underlying websocket
   * @param callback Callback function to be trigger on WebSocket connection error
   */
  onConnectionError(callback: (this: WebSocket, ev: globalThis.Event) => any) { this.socket && (this.socket.onerror = callback) }

  /**
   * Method to set a callback that will be triggered `onclose` of the underlying websocket
   * @param callback Callback function to be trigger on WebSocket connection close
   */
  onConnectionClose(callback: (this: WebSocket, ev: globalThis.Event) => any) { this.socket && (this.socket.onclose = callback) }
  
  /**
   * Sends an event to furhatOS
   * @param event Object containing the event. Mandtory to have event_name parameter in the object
   */
  send(event: Event): boolean {
    if (this.socket?.readyState === 2 || this.socket?.readyState === 3) {
      console.warn("Cannot send event. Socket is not ready.")
      return false
    } else if (this.socket?.readyState === 1) {
      this.socket.send(JSON.stringify(event))
      return true
    }

    return false
  }

  /**
   * Subscribes to the given event and triggers the supplied callback on event
   * @param eventName Name of the event to subscribe
   * @param callback Function which needs to be triggered when the given event is recieved
   * @param dontSend [Optional] [false by default] Boolean which determines wether to send
   * the subscribe event or not. use it to set callbacks for event that are already subscribed to,
   * for instance with group subscriptions
   */
  subscribe(eventName: string, callback: EventCallback, dontSend: boolean = false): boolean {
    const event: Event = { event_name: 'furhatos.event.actions.ActionRealTimeAPISubscribe', name: eventName }
    this.eventFunctions[eventName] = callback
    if (!dontSend) {
      return this.send(event)
    }
    return true
  }

  /**
   * Subscribes to the given event group
   * @param groupNumber Number(Assigned ENUM) of the group that needs to be subscribed to
   */
  subscribeGroup(groupNumber: number): boolean {
    const event: Event = { event_name: 'furhatos.event.actions.ActionRealTimeAPISubscribe', group: groupNumber }
    return this.send(event)
  }

  /**
   * Says a given text
   * @param text Text which needs to be said by Furhat
   */
  say(text: string): boolean {
    const event: Event = { event_name: 'furhatos.event.actions.ActionSpeech', text }
    return this.send(event)
  }

  /**
   * Stimulates the speech of a user in the interaction space
   * @param text Text which needs to be said by the user
   */
  userSpeech(text: string): boolean {
    const event: Event = { event_name: 'furhatos.event.senses.SenseTypingEnd', messageText: text }
    return this.send(event)
  }

  /**
   * Stimulates SenseSpeechStart event. Can be used to stimulate user speech via typing
   */
  userSpeechStart(): boolean {
    const event: Event = { event_name: 'furhatos.event.senses.SenseTypingStart' }
    return this.send(event)
  }

  /**
   * Performs the given gesture
   * @param name Name of the gesture that needs to be performed
   */
  gesture(name: string): boolean {
    const event: Event = { event_name: 'furhatos.event.actions.ActionGesture', name }
    return this.send(event)
  }
}