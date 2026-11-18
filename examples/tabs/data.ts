import {
    aesGcmDecrypt,
    aesGcmEncrypt,
    arrayBufferToBase64,
    base64ToArrayBuffer,
    clonePrimitive,
    deepAccessObject,
    equalsPrimitive,
    getKeyByValue,
    getOrCall,
    getTypedArray,
    objectMap,
    safeSetProperty,
    Serialization,
    TYPED_ARRAYS,
    type Serializer,
} from 'ts-browser-helpers'
import {defineTab} from '../lib/demo'
import source from './data.ts?raw'

export default defineTab({
    id: 'data',
    title: 'Data',
    intro: 'Base64 and typed arrays, AES-GCM encryption with a password, serialization with custom serializers, values that compare and clone, and helpers for objects and properties.',
    source,
    setup(tab) {
        tab.demo('base64', 'arrayBufferToBase64 and base64ToArrayBuffer', 'Bytes to Base64 text and back.', ({input, button, log}) => {
            // #region base64
            const text = input('Text', 'Hello, wörld')
            button('Encode and decode', async() => {
                const buffer = await new Blob([text.value]).arrayBuffer() // the text as UTF-8 bytes
                const base64 = arrayBufferToBase64(buffer)
                const back = new TextDecoder().decode(base64ToArrayBuffer(base64))
                log(`${buffer.byteLength} bytes -> "${base64}" -> "${back}"`)
            })
            // #endregion
        })

        tab.demo('typed-array', 'getTypedArray', 'Makes a typed array of a type, by name, on an <code>ArrayBuffer</code>. <code>TYPED_ARRAYS</code> maps the names to the constructors.', ({select, button, log}) => {
            // #region typed-array
            const type = select('View the bytes as', Object.keys(TYPED_ARRAYS), 'Uint8Array')
            const buffer = new Float32Array([1, 0.5, -2, 4]).buffer // 16 bytes: whole elements of every type, also the 8-byte ones
            button('View', () => {
                log(getTypedArray(type.value as keyof typeof TYPED_ARRAYS, buffer))
            })
            // #endregion
        })

        tab.demo('aes', 'aesGcmEncrypt and aesGcmDecrypt', 'Encrypts a string or bytes with a password (AES-GCM, the key is the SHA-256 of the password, a random IV each time). A string gives a string of byte values (0 to 255), so it is shown here in Base64. A wrong password throws "Decrypt failed".', ({input, button, log}) => {
            // #region aes
            const text = input('Secret text', 'The key is under the mat')
            const password = input('Password', 'hunter2')
            const decryptPassword = input('Password to decrypt', 'hunter2')
            let encrypted = ''
            button('Encrypt', async() => {
                encrypted = await aesGcmEncrypt(text.value, password.value)
                log(`Encrypted (Base64): ${btoa(encrypted)}`)
            }, {primary: true})
            button('Decrypt', async() => {
                if (!encrypted) return log('Encrypt something first')
                try {
                    log(`Decrypted: ${await aesGcmDecrypt(encrypted, decryptPassword.value)}`)
                } catch (e) {
                    log(`${(e as Error).message}: wrong password?`)
                }
            })
            // #endregion
        })

        tab.demo('serialization', 'Serialization and a Serializer', '<code>Serialization.Serialize</code> and <code>Deserialize</code> handle numbers (also <code>Infinity</code> and <code>NaN</code>), arrays, plain objects and classes marked with the decorators (see the Events tab). <code>RegisterSerializer</code> adds a type; here a <code>Date</code>.', ({button, log}) => {
            // #region serialization
            const dateSerializer: Serializer = {
                priority: 1, // lower numbers are checked first; the plain object one is last
                // isType gets the object when serializing, and the saved data when deserializing
                isType: (obj) => obj instanceof Date || obj?.type === 'Date',
                serialize: (date: Date) => ({type: 'Date', iso: date.toISOString()}),
                deserialize: (data) => new Date(data.iso),
            }
            Serialization.RegisterSerializer(dateSerializer)

            const project = {name: 'Plans', created: new Date(Date.UTC(2026, 0, 2)), limits: [0, Infinity], scale: NaN}
            button('Serialize', () => log(JSON.stringify(Serialization.Serialize(project))))
            button('Round trip', () => {
                const json = JSON.parse(JSON.stringify(Serialization.Serialize(project)))
                const back = Serialization.Deserialize(json, {limits: [0, 0], scale: 0})
                log(`created is a Date: ${back.created instanceof Date} (${back.created.toISOString()}), limits: [${back.limits}], scale: ${back.scale}`)
            })
            // #endregion
        })

        tab.demo('primitive', 'clonePrimitive and equalsPrimitive', 'A "primitive value" is a string, number, boolean, <code>null</code>, an array of them, or an object with <code>clone</code>, <code>equals</code> and <code>copy</code> (like a three.js vector). These compare and clone such values deeply; the undo helpers use them.', ({button, log}) => {
            // #region primitive
            class Vec2 {
                constructor(public x = 0, public y = 0) {}
                clone() { return new Vec2(this.x, this.y) as this }
                equals(v: Vec2) { return v.x === this.x && v.y === this.y }
                copy(v: Vec2) { this.x = v.x; this.y = v.y; return this }
            }
            button('Run', () => {
                const points = [new Vec2(1, 2), new Vec2(3, 4)]
                const copy = clonePrimitive(points)
                log(`equal after clone: ${equalsPrimitive(points, copy)}, same objects: ${copy[0] === points[0]}`)
                copy[1].x = 30
                log(`equal after a change: ${equalsPrimitive(points, copy)}`)
                log(`numbers: ${equalsPrimitive(1, 1)}, arrays: ${equalsPrimitive([1, [2, 3]], [1, [2, 3]])}`)
            })
            // #endregion
        })

        tab.demo('object', 'deepAccessObject, objectMap, getKeyByValue', 'Read a value at a path like <code>"a.b.0"</code> (like lodash <code>get</code>), map the values of an object (in place by default), and find the key of a value.', ({input, button, log}) => {
            // #region object
            const settings = {render: {lights: [{name: 'Sun', power: 3}], size: {width: 800, height: 600}}}
            const path = input('Path', 'render.lights.0.name')
            button('deepAccessObject', () => log(deepAccessObject(path.value, settings)))
            button('objectMap', () => {
                const half = objectMap(settings.render.size, (v) => v / 2, false) // false: a new object
                log(half, settings.render.size)
            })
            button('getKeyByValue', () => log(getKeyByValue({low: 1, medium: 2, high: 3}, 2)))
            // #endregion
        })

        tab.demo('obj-property', 'getOrCall and safeSetProperty', '<code>getOrCall</code> returns a value, or calls it when it is a function. <code>safeSetProperty</code> sets a property only if it can be written (a field or a setter, not a getter only) and tells if it did.', ({button, log}) => {
            // #region obj-property
            const fixedLabel = 'Save'
            const dynamicLabel = (count: number) => `Save ${count} files`
            button('getOrCall', () => {
                log(getOrCall(fixedLabel, 3), '|', getOrCall(dynamicLabel, 3))
            })
            button('safeSetProperty', () => {
                const file = {
                    name: 'a.txt',
                    get extension() { return this.name.split('.').pop() },
                }
                log(`set name: ${safeSetProperty(file, 'name', 'b.md')}, set extension: ${safeSetProperty(file, 'extension', 'png')}, extension is ${file.extension}`)
            })
            // #endregion
        })
    },
})
