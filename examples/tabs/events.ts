import {
    FnCaller,
    onChange,
    onChange2,
    onChange3,
    onChangeDispatchEvent,
    serializable,
    serialize,
    Serialization,
    SimpleEventDispatcher,
    type IEvent,
} from 'ts-browser-helpers'
import {defineTab} from '../lib/demo'
import source from './events.ts?raw'

export default defineTab({
    id: 'events',
    title: 'Events and changes',
    intro: 'A small typed event dispatcher, property decorators that call a function or send an event when a value changes, decorators that mark what to serialize, and <code>FnCaller</code>.',
    source,
    setup(tab) {
        tab.note('The decorators are TypeScript\'s legacy decorators: set <code>"experimentalDecorators": true</code> in <code>tsconfig.json</code>, and keep class fields as assignments (a <code>target</code> below <code>ES2022</code>, or <code>"useDefineForClassFields": false</code>), or a field hides the getter and setter of the decorator. This page compiles them with the repository\'s <code>tsconfig.json</code> (target <code>es2018</code>).')

        tab.demo('dispatcher', 'SimpleEventDispatcher', 'A class that extends it gets <code>addEventListener</code>, <code>removeEventListener</code>, <code>hasEventListener</code> and <code>dispatchEvent</code>, typed by the event names.', ({button, log}) => {
            // #region dispatcher
            class Timer extends SimpleEventDispatcher<'tick' | 'done'> {
                start(count: number) {
                    let n = 0
                    const id = setInterval(() => {
                        this.dispatchEvent({type: 'tick', n: ++n})
                        if (n === count) {
                            clearInterval(id)
                            this.dispatchEvent({type: 'done'})
                        }
                    }, 300)
                }
            }

            const timer = new Timer()
            const onTick = (e: IEvent<'tick' | 'done'>) => log(`tick ${e.n}`)
            timer.addEventListener('tick', onTick)
            timer.addEventListener('done', () => log('done'))

            button('Start (3 ticks)', () => timer.start(3))
            button('Toggle the tick listener', () => {
                if (timer.hasEventListener('tick', onTick)) timer.removeEventListener('tick', onTick)
                else timer.addEventListener('tick', onTick)
                log(`Listening to tick: ${timer.hasEventListener('tick', onTick)}`)
            })
            // #endregion
        })

        tab.demo('onchange', 'onChange, onChange2, onChange3', 'A decorated property calls a function when its value changes (not when it is set to the same value). <code>onChange</code> passes <code>(key, value, oldValue, target)</code>, <code>onChange2</code> nothing, <code>onChange3</code> one object.', ({input, button, log}) => {
            // #region onchange
            class Box {
                @onChange(Box.prototype.sizeChanged)
                width = 100

                @onChange2(Box.prototype.redraw)
                color = 'grey'

                @onChange3((e: {key: string, value: any, oldValue: any}) => log(`onChange3: ${JSON.stringify({key: e.key, value: e.value, oldValue: e.oldValue})}`))
                label = 'Box'

                sizeChanged(key: string, value: number, oldValue: number) {
                    log(`onChange: ${key} ${oldValue} -> ${value}`)
                }

                redraw() {
                    log(`onChange2: redraw, the colour is ${this.color}`)
                }
            }

            const box = new Box() // the first values call the functions too: the fields are set like any change
            const width = input('Width', '100', 'number')
            button('Set width', () => { box.width = Number(width.value) })
            const color = input('Colour', 'teal')
            button('Set colour', () => { box.color = color.value })
            button('Rename', () => { box.label = box.label + '!' })
            // #endregion
        })

        tab.demo('dispatch-event', 'onChangeDispatchEvent', 'Sends an event on the object itself, <code>&lt;key&gt;-changed</code> by default, with <code>{key, value, oldValue}</code> in <code>detail</code>. The object needs a <code>dispatchEvent</code>.', ({input, button, log}) => {
            // #region dispatch-event
            class Settings extends SimpleEventDispatcher<'theme-changed'> {
                @onChangeDispatchEvent()
                theme = 'light'
            }

            const settings = new Settings()
            settings.addEventListener('theme-changed', (e) => log(`theme-changed: ${JSON.stringify(e.detail)}`))

            const theme = input('Theme', 'dark')
            button('Set theme', () => { settings.theme = theme.value })
            // #endregion
        })

        tab.demo('serialize', 'serialize and serializable', '<code>@serialize()</code> marks a property to save, optionally under another key. <code>@serializable(id)</code> registers the class under an id that survives minification, so <code>Serialization.Deserialize</code> can make an instance of it again.', ({button, log}) => {
            // #region serialize
            @serializable('Note')
            class Note {
                @serialize() title = 'Shopping'
                @serialize('items') list: string[] = ['Milk', 'Bread']
                @serialize() due = Infinity
                draft = 'not saved: no decorator'
            }

            button('Serialize', () => {
                const note = new Note()
                note.list.push('Eggs')
                log(JSON.stringify(Serialization.Serialize(note)))
            })
            button('Deserialize', () => {
                const data = {serializableClassId: 'Note', title: 'Trip', items: ['Tickets'], due: 'Infinity'}
                const note = Serialization.Deserialize(data, undefined) as Note
                log(`instance of Note: ${note instanceof Note}, title: ${note.title}, list: ${note.list}, due: ${note.due}, draft: ${note.draft}`)
            })
            // #endregion
        })

        tab.demo('fncaller', 'FnCaller', '<code>FnCaller.callFunction(fn, obj, params)</code> calls <code>fn</code> as a method of <code>obj</code> when it is one (also after minification renames it), and as a plain function otherwise. The decorators above use it.', ({button, log}) => {
            // #region fncaller
            const counter = {
                count: 0,
                increment(by: number) {
                    this.count += by
                    return this.count
                },
            }
            const plain = (by: number) => `a plain function, called with ${by}`

            button('Call a method', () => {
                log(`counter.count is now ${FnCaller.callFunction(counter.increment, counter, [2])}`)
            })
            button('Call a plain function', () => {
                log(FnCaller.callFunction(plain, counter, [5]))
            })
            // #endregion
        })
    },
})
