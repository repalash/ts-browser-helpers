import {safeSetProperty} from './obj-property'
import {findLastIndex} from './misc'

/**
 * Serializer interface for primitive, array and struct/custom object types
 * @category Serialization
 */
export interface Serializer{
    serialize: (obj: any, meta?: any) => any
    deserialize: (data: any, obj: any, meta?: any) => any // todo: handle when data is already deserialized for Texture, Material etc
    isType: (obj: any) => boolean
    priority?: number // lower priority serializers are checked first
}

const objSerializer: Serializer = { // object
    priority: Infinity,
    serialize: (obj: any, meta?: any)=> Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, Serialization.Serialize(v, meta, false)])),
    deserialize: (data: any, obj: any, meta: any)=>
        Object.assign(obj||{}, Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Serialization.Deserialize(v, obj?.[k], meta, false)]))),
    isType: (obj: any) => (obj.constructor||Object) === Object,
}
/**
 * Serialization class with static methods for serializing and deserializing objects.
 * Properties and classes can be marked serializable by adding {@link serialize} and {@link serializable} decorators.
 * @category Serialization
 */
export class Serialization{
    static TypeMap = new Map<ObjectConstructor, [string, string][]>()
    static SerializableClasses = new Map<string, any>()

    /**
     * Serializers for primitive, array and struct/custom object types
     */
    static Serializers: Serializer[] = [
        { // arrays
            priority: 0,
            isType: (obj: any) => Array.isArray(obj),
            serialize: (obj: any, meta?: any)=> obj.map((v: any) => Serialization.Serialize(v, meta, false)),
            deserialize: (data: any, obj: any, meta: any)=>{
                const l = data.length
                if (!Array.isArray(obj)) obj = []
                for (let i = 0; i < l; i++) {
                    const d = data[i]
                    const de = obj.length > i ? Serialization.Deserialize(d, obj[i], meta, false) : Serialization.Deserialize(d, undefined, meta, false)
                    if (obj.length <= i) obj.push(de)
                    else obj[i] = de
                }
                return obj
            },
        },
        { // primitives
            priority: 0,
            isType: (obj: any) => !obj || typeof obj !== 'object',
            serialize: (obj: any)=> {
                if (obj && typeof obj === 'number') {
                    if (obj === Infinity) return 'Infinity'
                    if (obj === -Infinity) return '-Infinity'
                    if (isNaN(obj)) return 'NaN'
                }
                return obj
            },
            deserialize: (data: any, obj: any)=>{
                if (typeof obj === 'number') {
                    if (data === 'Infinity') return Infinity as any
                    if (data === '-Infinity') return -Infinity as any
                    if (data === 'NaN') return NaN as any

                    if (typeof data === 'number' || !data) return data
                }
                return data
            },
        },
        objSerializer,
    ]

    static GetSerializer(obj: any){
        return Serialization.Serializers.find(s => s.isType(obj))
    }

    static RegisterSerializer(...serializers: Serializer[]){
        for (const serializer of serializers) {
            const priority = serializer.priority ?? 1e10
            const i = findLastIndex(Serialization.Serializers, s => s.priority !== undefined && s.priority < priority)
            if (i >= 0) Serialization.Serializers.splice(i+1, 0, serializer)
            else Serialization.Serializers.push(serializer)
        }
    }

    static UnregisterSerializer(...serializers: Serializer[]){
        for (const serializer of serializers) {
            const i = Serialization.Serializers.indexOf(serializer)
            if (i >= 0) Serialization.Serializers.splice(i, 1)
        }
    }


    /**
     * Serialize an object
     * @param obj - object to serialize
     * @param meta - Optional object to store common meta-data/resources across the serialization process of multiple objects
     @param isThis - true if called from inside the serialization function, like custom {@link IJSONSerializable.toJSON}.
     */
    static Serialize(obj: any, meta?: Record<string, Record<string, any>>, isThis = false){
        if (typeof obj === 'function') return undefined

        if(!isThis) {
            const serializer = Serialization.GetSerializer(obj)
            if (serializer) return serializer.serialize(obj, meta)

            // Handle classes with explicit serialization with toJSON and fromJSON functions
            // toJSON functions can call Serialize(with isThis=true) to serialize the properties with @serialize decorator
            if (typeof obj.toJSON === 'function') {
                const res = obj.toJSON(meta)
                if (obj.serializableClassId && res) res.serializableClassId = obj.serializableClassId
                return res
            }
        }

        // Handle classes with @serializable decorator and serialize all properties with @serialize decorator
        let type = obj.constructor ?? Object
        const result: any = {}
        // Loop through all parent classes and serialize properties with @serialize decorator
        while (type && type !== Object) {
            const Type = Serialization.TypeMap.get(type) ?? []
            for (const [key, propKey] of Type) {
                result[key] = Serialization.Serialize(obj[propKey], meta, false)
            }
            type = Object.getPrototypeOf(type)
        }
        if (obj.serializableClassId) result.serializableClassId = obj.serializableClassId
        return result
    }

    /**
     * Deserialize an object
     * @param data - data to deserialize
     * @param obj - current object that's set. If of the same class/type the data is deserialized into that instead of creating new objects.
     * @param meta - Optional object to retrieve common meta-data/resources across the deserialization process of multiple objects. Objects in meta must be class instances, not js objects. (like Material, Texture, Object3D etc)
     * @param isThis - true if called from inside the deserialization function, like custom {@link IJSONSerializable.fromJSON}
     */
    static Deserialize(data: any, obj: any, meta?: Record<string, any>, isThis = false){
        if (data === undefined) return obj // undefined is not deserialized
        if(obj === data) return obj // same object

        // let isResource = false
        // If data is an embedded resource in meta
        if(data && typeof data === 'object' && (data.constructor||Object) === Object && data.resource && typeof data.resource === 'string' && data.uuid){
            const res = meta?.[data.resource]
            if(res) {
                // isResource = true
                data = res[data.uuid]
                if(typeof data === 'object') {
                    data.__useCount = data.__useCount ? data.__useCount + 1 : 1 // used for materials for now, see AssetManagerPlugin.importViewerConfig
                }
                if(!data) console.warn(`Resource ${data.resource} with uuid ${data.uuid} not found`)
                if(obj === data) return obj // same object
                if(data && typeof data === 'object' ) {
                    const isDeserializedClass = (data.constructor||Object) !== Object // data is already deserialized
                    if(isDeserializedClass) {
                        if (!obj) {
                            return data
                        } else {
                            // todo: if data is deserialized already and !== obj.
                            // obj is not null, could be a Texture, Material, Object etc
                            // should we ignore the current object and assign one from meta or copy data from meta to current object
                            // for textures, it should be replaced. should we copy if uuid is same?
                            // for materials, if uuid is same and type is same it should be copied otherwise replaced
                            // for vector3d, copy data
                            // todo: need to implement.
                            console.warn("replacing object", obj, 'with deserialized object from meta', data)
                            return data;
                        }
                    }else { // data is not deserialized, or is a normal object
                        // this is not supported. meta should only have class instances, not js objects
                        console.error('Deserialize; meta should only have class instances, not js objects', data, obj, meta)
                        if(!obj){
                            // continue deserializing and return deserialized - done
                        }else {
                            // continue deserializing then copy to current obj?
                        }
                    }
                }
            }
            else {
                console.warn(`Resource ${data.resource} not found`)
                return obj
            }
        }
        if(data && typeof data === 'object' && (data.constructor||Object) !== Object && !Array.isArray(data)){
            console.warn('Data might already be deserialized. It will be cloned, or copied to source', data, "source", obj, data.constructor, data.constructor !== Object)
        }

        // Create new object if not provided
        if (data && typeof data === 'object') {
            // if data is deserialized already and obj is null. then should we clone the data or assign it directly?
            // if it's a resource from meta then assign it directly(done above), otherwise clone (done just below).
            if (data.serializableClassId && (!obj || obj.serializableClassId !==data.serializableClassId) ) { // if the data is already deserialized, it will be cloned
                const constructor = Serialization.SerializableClasses.get(data.serializableClassId)
                if (constructor) {
                    if (constructor.DataInConstructor) // not used anywhere right now. todo: remove? because we are anyway assigning the data to the object after the constructor using @serialize and support fromJSON
                        obj = new constructor(data)
                    else obj = new constructor()
                }
            } else if ((data.constructor||Object) === Object && !obj) {
                obj = {}
            } else if (Array.isArray(data) && !obj) {
                obj = []
            }
        }
        if (typeof obj === 'function') {
            console.error('cannot deserialize over function', obj, data)
            return obj // throw error maybe?}
        }

        if(!isThis) {
            const serializer = Serialization.GetSerializer(data)
            if (serializer && serializer !== objSerializer) return serializer.deserialize(data, obj, meta)
        }

        if (!data || obj === undefined || obj === null || typeof obj !== 'object') {
            return data
        }

        // Handle classes with explicit serialization with toJSON and fromJSON functions
        // fromJSON functions can call Deserialize(with isThis=true) to deserialize the properties with @serialize decorator
        if (!isThis && typeof obj?.fromJSON === 'function') {
            obj.fromJSON(data, meta)
            return obj // cannot be sure what the return value is
        }

        let type = obj.constructor ?? Object

        if(type === Object) return objSerializer.deserialize(data, obj, meta)

        // Loop through all parent classes and deserialize properties with @serialize decorator
        while (type && type !== Object) {
            const Type = Serialization.TypeMap.get(type) ?? []
            for (const [key, propKey] of Type) {
                const current = obj[propKey]
                const newVal = Serialization.Deserialize(data[key], current, meta, false)
                if (newVal !== current) safeSetProperty(obj, propKey as any, newVal, true)
            }
            type = Object.getPrototypeOf(type)
        }
        return obj

    }

}
