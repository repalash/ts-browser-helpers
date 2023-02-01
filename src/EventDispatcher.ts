/**
 * A simple event interface with typed event types.
 */
export interface IEvent<T> {
    type: T;
    target?: any;
    [attachment: string]: any;
}

/**
 * A simple event dispatcher interface with {@link IEvent} as event type.
 */
export interface IEventDispatcher<T> {

    /**
     * Adds a listener to an event type.
     * @param type The type of event to listen to.
     * @param listener The function that gets called when the event is fired.
     */
    addEventListener(type: T, listener: (event: IEvent<T>) => void): void;

    /**
     * Checks if listener is added to an event type.
     * @param type The type of event to listen to.
     * @param listener The function that gets called when the event is fired.
     */
    hasEventListener(type: T, listener: (event: IEvent<T>) => void): boolean;

    /**
     * Removes a listener from an event type.
     * @param type The type of the listener that gets removed.
     * @param listener The listener function that gets removed.
     */
    removeEventListener(type: T, listener: (event: IEvent<T>) => void): void;

    /**
     * Fire an event type.
     * @param event.type The type of event that gets fired.
     */
    dispatchEvent(event: IEvent<T>): void;
}

/**
 * A simple event dispatcher with typed event types, see {@link IEventDispatcher}.
 */
export class SimpleEventDispatcher<T extends string> implements IEventDispatcher<T> {

    constructor() {
        this.dispatchEvent = this.dispatchEvent.bind(this)
        this.addEventListener = this.addEventListener.bind(this)
        this.removeEventListener = this.removeEventListener.bind(this)
        this.hasEventListener = this.hasEventListener.bind(this)
    }

    private _eventListeners: Record<string, ((event: IEvent<T>) => void)[]> = {}

    addEventListener(type: T, listener: (event: IEvent<T>) => void): void {

        const listeners = this._eventListeners
        if (listeners[ type ] === undefined) listeners[type] = []
        if (!listeners[ type ].includes(listener)) listeners[type].push(listener)

    }

    hasEventListener(type: T, listener: (event: IEvent<T>) => void): boolean {

        const listeners = this._eventListeners
        return listeners[ type ] !== undefined && listeners[ type ].includes(listener)

    }

    removeEventListener(type: T, listener: (event: IEvent<T>) => void): void {

        const listeners = this._eventListeners
        const listenerArray = listeners[ type ]
        if (listenerArray !== undefined) {
            const index = listenerArray.indexOf(listener)
            if (index !== -1) listenerArray.splice(index, 1)
        }

    }

    dispatchEvent(event: IEvent<T>): void {

        const listeners = this._eventListeners
        const listenerArray = listeners[ event.type ]

        if (listenerArray !== undefined) {
            event.target = this
            // Make a copy, in case listeners are removed while iterating.
            const array = listenerArray.slice(0)
            for (let i = 0, l = array.length; i < l; i++) array[i].call(this, event)

        }

    }

}
