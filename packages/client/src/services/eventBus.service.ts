// importing types
import type { EventHandler, Events } from '../types';

class EventBus {
    private events: Events = {};

    on(event: string, handler: EventHandler) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
    }

    off(event: string, handler: EventHandler) {
        this.events[event] = (this.events[event] || []).filter(h => h !== handler);
    }

    emit(event: string, ...args: any[]) {
        (this.events[event] || []).forEach(handler => handler(...args));
    }
}

export const eventBus = new EventBus();