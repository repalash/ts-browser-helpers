# TS Browser Helpers

A collection of utility classes, functions and types for javascript/typescript projects, for use in the browser.

## Installation

```bash
npm install ts-browser-helpers
```

## Docs

[API documentation](https://repalash.com/ts-browser-helpers/)

## ArrayBuffer

| Name | Description |
| ------ | ------ |
| [TYPED\_ARRAYS](https://repalash.com/ts-browser-helpers/variables/TYPED_ARRAYS) | Mapping of typed array constructors by name |
| [arrayBufferToBase64](https://repalash.com/ts-browser-helpers/functions/arrayBufferToBase64) | Convert an ArrayBuffer to Base64 string |
| [base64ToArrayBuffer](https://repalash.com/ts-browser-helpers/functions/base64ToArrayBuffer) | Convert a Base64 string to ArrayBuffer |
| [getTypedArray](https://repalash.com/ts-browser-helpers/functions/getTypedArray) | Create a typed array from an ArrayBuffer by name |

## Browser

| Function | Description |
| ------ | ------ |
| [blobToDataURL](https://repalash.com/ts-browser-helpers/functions/blobToDataURL) | Convert a blob to a data url. |
| [downloadBlob](https://repalash.com/ts-browser-helpers/functions/downloadBlob) | Download a blob as a file in the browser. |
| [downloadFile](https://repalash.com/ts-browser-helpers/functions/downloadFile) | Download a file in the browser. |
| [uploadFile](https://repalash.com/ts-browser-helpers/functions/uploadFile) | Prompt the user to select a file or directory in the browser. |

## Color

| Function | Description |
| ------ | ------ |
| [LinearToSRGB](https://repalash.com/ts-browser-helpers/functions/LinearToSRGB) | Converts a single color channel from the linear color space to sRGB. |
| [SRGBToLinear](https://repalash.com/ts-browser-helpers/functions/SRGBToLinear) | Converts a single color channel from the sRGB color space to linear. |

## DOM

| Function | Description |
| ------ | ------ |
| [createCanvasElement](https://repalash.com/ts-browser-helpers/functions/createCanvasElement) | Creates a HTML canvas element. |
| [createDiv](https://repalash.com/ts-browser-helpers/functions/createDiv) | Creates an HTML div element. |
| [createImage](https://repalash.com/ts-browser-helpers/functions/createImage) | Creates a HTML image element from a url. |
| [createScriptFromURL](https://repalash.com/ts-browser-helpers/functions/createScriptFromURL) | Creates a HTML script element from a url. |
| [createStyles](https://repalash.com/ts-browser-helpers/functions/createStyles) | Creates a HTML style element with the given styles. |

## Decorators

| Function | Description |
| ------ | ------ |
| [onChange](https://repalash.com/ts-browser-helpers/functions/onChange) | Decorator that redefines a property with getter and setter, and calls a function when the property is changed. Parameters passed to the function are the property key and the new value. |
| [serialize](https://repalash.com/ts-browser-helpers/functions/serialize) | Decorator to mark a class property as serializable using the [Serialization](https://repalash.com/ts-browser-helpers/classes/Serialization) class. |

## Encryption

| Function | Description |
| ------ | ------ |
| [aesGcmDecrypt](https://repalash.com/ts-browser-helpers/functions/aesGcmDecrypt) | Decrypts ciphertext encrypted with aesGcmEncrypt() using supplied password. (c) Chris Veness MIT Licence |
| [aesGcmEncrypt](https://repalash.com/ts-browser-helpers/functions/aesGcmEncrypt) | Encrypts plaintext using AES-GCM with supplied password, for decryption with aesGcmDecrypt(). (c) Chris Veness MIT Licence https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a Modified to work with Uint8Array and string content. |

## HTML To Image

| Function | Description |
| ------ | ------ |
| [embedUrlRefs](https://repalash.com/ts-browser-helpers/functions/embedUrlRefs) | Find all URLs in svg, download them and replace with the URL in svg with the downloaded data URLs. |
| [htmlToCanvas](https://repalash.com/ts-browser-helpers/functions/htmlToCanvas) | Renders an HTML string to a canvas. This is done by first embedding HTML into a svg and then rendering the svg to a canvas. |
| [htmlToPng](https://repalash.com/ts-browser-helpers/functions/htmlToPng) | Renders an HTML string to a png. This is done by first embedding HTML into a svg and then rendering the svg to a png. |
| [htmlToSvg](https://repalash.com/ts-browser-helpers/functions/htmlToSvg) | Embeds an HTML string into a svg tag and converts to svg string or svg as data url |

## Images

| Function | Description |
| ------ | ------ |
| [imageBitmapToBase64](https://repalash.com/ts-browser-helpers/functions/imageBitmapToBase64) | Convert an image ImageBitmap or CanvasImageSource to a base64 data url. |
| [imageBitmapToBlob](https://repalash.com/ts-browser-helpers/functions/imageBitmapToBlob) | Convert an image ImageBitmap or CanvasImageSource to a blob. |
| [imageBitmapToCanvas](https://repalash.com/ts-browser-helpers/functions/imageBitmapToCanvas) | Convert an image ImageBitmap or CanvasImageSource to a new canvas with a max width. Good for resizing images keeping the aspect ratio and generating previews. |
| [imageToCanvas](https://repalash.com/ts-browser-helpers/functions/imageToCanvas) | Converts an HTML image to a canvas. This creates a new canvas element and draws the image on it. |
| [imageUrlToImageData](https://repalash.com/ts-browser-helpers/functions/imageUrlToImageData) | Downloads/parse the image from an url/data url and draw to an ImageData object. |

## JS Object

| Name | Description |
| ------ | ------ |
| [FnCaller](https://repalash.com/ts-browser-helpers/classes/FnCaller) | calls fn.call(obj) or fn() appropriately |
| [copyProps](https://repalash.com/ts-browser-helpers/functions/copyProps) | Copy properties from source to dest. Similar to Object.assign, but only copies properties that exist in source, dest and propList. |
| [deepAccessObject](https://repalash.com/ts-browser-helpers/functions/deepAccessObject) | Access property in an object using a string path. Similar to lodash.get |
| [getKeyByValue](https://repalash.com/ts-browser-helpers/functions/getKeyByValue) | Find the key of an object with a given value. |
| [getOrCall](https://repalash.com/ts-browser-helpers/functions/getOrCall) | Get value, but if it is a function, call it with args |
| [getPropertyDescriptor](https://repalash.com/ts-browser-helpers/functions/getPropertyDescriptor) | Get property descriptor from object or its prototype chain |
| [isPropertyWritable](https://repalash.com/ts-browser-helpers/functions/isPropertyWritable) | Check if property is writable in object or its prototype chain |
| [safeSetProperty](https://repalash.com/ts-browser-helpers/functions/safeSetProperty) | Set value only if setter exists |

## Maths

| Function | Description |
| ------ | ------ |
| [absMax](https://repalash.com/ts-browser-helpers/functions/absMax) | Returns the number which is larger in absolute value. |

## Other

| Name | Description |
| ------ | ------ |
| [Damper](https://repalash.com/ts-browser-helpers/classes/Damper) | The Damper class is a generic second-order critically damped system that does one linear step of the desired length of time. The only parameter is DECAY_MILLISECONDS. This common parameter makes all states converge at the same rate regardless of scale. xNormalization is a number to provide the rough scale of x, such that NIL_SPEED clamping also happens at roughly the same convergence for all states. |
| [JSUndoManager](https://repalash.com/ts-browser-helpers/classes/JSUndoManager) | Main class JSUndoManager |
| [PointerDragHelper](https://repalash.com/ts-browser-helpers/classes/PointerDragHelper) | A helper class to handle pointer events and dispatch drag events: `drag`, `dragStart` and `dragEnd` with NDC coordinates and time. |
| [SimpleEventDispatcher](https://repalash.com/ts-browser-helpers/classes/SimpleEventDispatcher) | A simple event dispatcher with typed event types, see [IEventDispatcher](https://repalash.com/ts-browser-helpers/interfaces/IEventDispatcher). |
| [IDisposable](https://repalash.com/ts-browser-helpers/interfaces/IDisposable) | Disposable interface for objects that can be disposed. Has a single method `dispose` |
| [IEvent](https://repalash.com/ts-browser-helpers/interfaces/IEvent) | A simple event interface with typed event types. |
| [IEventDispatcher](https://repalash.com/ts-browser-helpers/interfaces/IEventDispatcher) | A simple event dispatcher interface with [IEvent](https://repalash.com/ts-browser-helpers/interfaces/IEvent) as event type. |
| [IJSONSerializable](https://repalash.com/ts-browser-helpers/interfaces/IJSONSerializable) | Interface for objects that can be serialized to JSON, with to and from JSON methods |
| [ImageCanvasOptions](https://repalash.com/ts-browser-helpers/interfaces/ImageCanvasOptions) | Options for [imageToCanvas](https://repalash.com/ts-browser-helpers/functions/imageToCanvas). |
| [JSUndoManagerOptions](https://repalash.com/ts-browser-helpers/interfaces/JSUndoManagerOptions) | - |
| [AnyFunction](https://repalash.com/ts-browser-helpers/type-aliases/AnyFunction) | Type for any function |
| [AnyOptions](https://repalash.com/ts-browser-helpers/type-aliases/AnyOptions) | Type for any object |
| [Class](https://repalash.com/ts-browser-helpers/type-aliases/Class) | Generic type for class. |
| [Fof](https://repalash.com/ts-browser-helpers/type-aliases/Fof) | FoF - Short for `Function of` - a generic type for function |
| [JSUndoManagerCommand](https://repalash.com/ts-browser-helpers/type-aliases/JSUndoManagerCommand) | - |
| [JSUndoManagerCommand1](https://repalash.com/ts-browser-helpers/type-aliases/JSUndoManagerCommand1) | - |
| [JSUndoManagerCommand2](https://repalash.com/ts-browser-helpers/type-aliases/JSUndoManagerCommand2) | - |
| [PartialPick](https://repalash.com/ts-browser-helpers/type-aliases/PartialPick) | Partial pick type with all keys optional |
| [PartialRecord](https://repalash.com/ts-browser-helpers/type-aliases/PartialRecord) | Partial record type with all keys optional |
| [StringKeyOf](https://repalash.com/ts-browser-helpers/type-aliases/StringKeyOf) | Extract keys from object that are strings |
| [ValOrArr](https://repalash.com/ts-browser-helpers/type-aliases/ValOrArr) | Type for a value of type T or an array of values of type T |
| [ValOrArrOp](https://repalash.com/ts-browser-helpers/type-aliases/ValOrArrOp) | Type for a value of type `T|undefined` or an array of values of type `T|undefined` |
| [ValOrFunc](https://repalash.com/ts-browser-helpers/type-aliases/ValOrFunc) | Type for a value of type T or a function that returns a value of type T |
| [ValOrFuncOp](https://repalash.com/ts-browser-helpers/type-aliases/ValOrFuncOp) | Type for a value of type T|undefined or a function that returns a value of type T|undefined |
| [blobToImage](https://repalash.com/ts-browser-helpers/functions/blobToImage) | Load a Blob or a file containing an image and return an HTMLImageElement. |
| [canvasFlipY](https://repalash.com/ts-browser-helpers/functions/canvasFlipY) | Returns a new canvas with the image/canvas-content flipped vertically. Useful for putImageData(as it does not respect scale and translate) and WebGL textures, which are flipped vertically. |
| [clearBit](https://repalash.com/ts-browser-helpers/functions/clearBit) | Clears the bit at the given position. |
| [cloneScriptTag](https://repalash.com/ts-browser-helpers/functions/cloneScriptTag) | Clones a script tag. |
| [colorToDataUrl](https://repalash.com/ts-browser-helpers/functions/colorToDataUrl) | Creates an image data url from a color string. |
| [findLastIndex](https://repalash.com/ts-browser-helpers/functions/findLastIndex) | like Array.prototype.findIndex but from the end |
| [getFileHandle](https://repalash.com/ts-browser-helpers/functions/getFileHandle) | Open a handle to an existing file on the local file system. |
| [getNewFileHandle](https://repalash.com/ts-browser-helpers/functions/getNewFileHandle) | Create a handle to a new (text) file on the local file system. |
| [imageDataToCanvas](https://repalash.com/ts-browser-helpers/functions/imageDataToCanvas) | Converts an ImageData to a canvas. This creates a new canvas element and draws the image data on it. Image Data can be created from image pixels like from gl.readPixels This can be used to convert a WebGL texture/render target to a canvas/data url. Note: if the output is flipped, use [canvasFlipY](https://repalash.com/ts-browser-helpers/functions/canvasFlipY) after this, like `canvasFlipY(imageDataToCanvas(imageData))` |
| [includesAll](https://repalash.com/ts-browser-helpers/functions/includesAll) | Returns true if the array includes all the elements of the sub array |
| [isWebpExportSupported](https://repalash.com/ts-browser-helpers/functions/isWebpExportSupported) | Check if the browser supports exporting to webp, with the canvas.toDataURL('image/webp') method. |
| [longestCommonPrefix](https://repalash.com/ts-browser-helpers/functions/longestCommonPrefix) | Find the longest common prefix in an array of strings https://stackoverflow.com/questions/68702774/longest-common-prefix-in-javascript |
| [mobileAndTabletCheck](https://repalash.com/ts-browser-helpers/functions/mobileAndTabletCheck) | Check if the browser is running on a mobile or tablet device. |
| [objectHasOwn](https://repalash.com/ts-browser-helpers/functions/objectHasOwn) | Check if an object has a property. Same as Object.hasOwn or Object.hasOwnProperty |
| [objectMap](https://repalash.com/ts-browser-helpers/functions/objectMap) | Execute a function on each property of an object and return the result as a new object This allows in place modification of the object. To create a new object, set inPlace to false, or use [objectMap2](https://repalash.com/ts-browser-helpers/functions/objectMap2) to modify the keys as well Similar to Array.map but for objects. |
| [objectMap2](https://repalash.com/ts-browser-helpers/functions/objectMap2) | Shorthand for `Object.fromEntries(Object.entries(obj).map(fn))` Similar to [objectMap](https://repalash.com/ts-browser-helpers/functions/objectMap) but uses Object.fromEntries to create the new object, so keys can also be changed. |
| [onChange2](https://repalash.com/ts-browser-helpers/functions/onChange2) | Similar to [onChange](https://repalash.com/ts-browser-helpers/functions/onChange), but accepts any function and paramType defaults to 'void'. The function is called with no parameters. if 'void' |
| [onChange3](https://repalash.com/ts-browser-helpers/functions/onChange3) | Similar to [onChange](https://repalash.com/ts-browser-helpers/functions/onChange), but accepts any function and paramType defaults to 'object'. The function is called with an object parameter: `{key, value, oldValue, target}`. |
| [onChangeDispatchEvent](https://repalash.com/ts-browser-helpers/functions/onChangeDispatchEvent) | Similar to onChange but dispatches an event instead of calling a function. Requires `dispatchEvent` to be defined on the target. |
| [pathJoin](https://repalash.com/ts-browser-helpers/functions/pathJoin) | Join path parts with separator. Similar to PHP's pathJoin |
| [prettyScrollbar](https://repalash.com/ts-browser-helpers/functions/prettyScrollbar) | Styles the default scrollbar to be more pretty and less intrusive (especially on dark backgrounds), (similar to MacOS) |
| [readFile](https://repalash.com/ts-browser-helpers/functions/readFile) | Reads the raw text from a file. |
| [remoteWorkerURL](https://repalash.com/ts-browser-helpers/functions/remoteWorkerURL) | Returns a blob:// URL which points to a javascript file which will call importScripts with the given URL, to be used for cross-origin workers. https://stackoverflow.com/questions/21913673/execute-web-worker-from-different-origin |
| [safeReplaceString](https://repalash.com/ts-browser-helpers/functions/safeReplaceString) | Replace a string in a text, optionally prepending, appending, replacing all occurrences, and/or calling a callback if the string is not found |
| [serializable](https://repalash.com/ts-browser-helpers/functions/serializable) | Decorator to mark a class as serializable using the [Serialization](https://repalash.com/ts-browser-helpers/classes/Serialization) class. |
| [setInnerHTMLWithScripts](https://repalash.com/ts-browser-helpers/functions/setInnerHTMLWithScripts) | Sets the innerHTML of an element and recreates all script tags so they are executed. |
| [updateBit](https://repalash.com/ts-browser-helpers/functions/updateBit) | Updates the bit at the given position to the given value. |
| [uuidV4](https://repalash.com/ts-browser-helpers/functions/uuidV4) | Generate a UUID v4 https://stackoverflow.com/a/53723395/2229899 |
| [verifyPermission](https://repalash.com/ts-browser-helpers/functions/verifyPermission) | Verify the user has granted permission to read or write to the file, if permission hasn't been granted, request permission. |
| [wrapThisFunction](https://repalash.com/ts-browser-helpers/functions/wrapThisFunction) | Call f1 before calling f2 Sample usage `const logRender = ()=>console.log('render') obj.render = wrapThisFunction(logRender, obj.beforeRender) // now calling obj.beforeRender(), will log 'render' and then call obj.beforeRender()` |
| [wrapThisFunction2](https://repalash.com/ts-browser-helpers/functions/wrapThisFunction2) | Call f1 with the same params as f2 before calling f2 Sample usage `const logRender = ()=>console.log('render') obj.render = wrapThisFunction(logRender, obj.beforeRender) // now calling obj.beforeRender(), will log 'render' and then call obj.beforeRender()` |
| [writeFile](https://repalash.com/ts-browser-helpers/functions/writeFile) | Writes the contents to disk. |

## SVGs

| Function | Description |
| ------ | ------ |
| [makeColorSvg](https://repalash.com/ts-browser-helpers/functions/makeColorSvg) | Returns a data url for a 16x16 svg rectangle with the given color. |
| [makeColorSvgCircle](https://repalash.com/ts-browser-helpers/functions/makeColorSvgCircle) | Returns a data url for a 16x16 svg circle with the given color. |
| [makeTextSvg](https://repalash.com/ts-browser-helpers/functions/makeTextSvg) | Returns a data url for a svg with the given text. |
| [svgToCanvas](https://repalash.com/ts-browser-helpers/functions/svgToCanvas) | Renders an SVG to a canvas. |
| [svgToPng](https://repalash.com/ts-browser-helpers/functions/svgToPng) | Renders an SVG to a png data url. |

## Serialization

| Name | Description |
| ------ | ------ |
| [Serialization](https://repalash.com/ts-browser-helpers/classes/Serialization) | Serialization class with static methods for serializing and deserializing objects. Properties and classes can be marked serializable by adding [serialize](https://repalash.com/ts-browser-helpers/functions/serialize) and [serializable](https://repalash.com/ts-browser-helpers/functions/serializable) decorators. |
| [Serializer](https://repalash.com/ts-browser-helpers/interfaces/Serializer) | Serializer interface for primitive, array and struct/custom object types |

## Template Literals

| Function | Description                                                                                                                                                             |
| ------ |-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [css](https://repalash.com/ts-browser-helpers/functions/css) | A template literal tag that does nothing. Useful for syntax highlighting of CSS code.                                                                                   |
| [glsl](https://repalash.com/ts-browser-helpers/functions/glsl) | A template literal tag that does nothing. Useful for syntax highlighting of GLSL code.                                                                                  |
| [html](https://repalash.com/ts-browser-helpers/functions/html) | A template literal tag that does nothing. Useful for syntax highlighting of HTML code.                                                                                  |
| [svgUrl](https://repalash.com/ts-browser-helpers/functions/svgUrl) | Converts an SVG string to data url. This is useful for creating images from SVGs, or using SVGs in CSS. To use put in template string: ```url(${svgUrl`<svg>...</svg>`})``` |

## Text

| Function | Description |
| ------ | ------ |
| [escapeRegExp](https://repalash.com/ts-browser-helpers/functions/escapeRegExp) | Escape a string for use in a regular expression |
| [getFilenameFromPath](https://repalash.com/ts-browser-helpers/functions/getFilenameFromPath) | Get the filename from a path, similar to PHP's basename() |
| [parseFileExtension](https://repalash.com/ts-browser-helpers/functions/parseFileExtension) | Parse a file extension from a path |
| [replaceAll](https://repalash.com/ts-browser-helpers/functions/replaceAll) | Replace all occurrences of a string in another string |
| [toCamelCase](https://repalash.com/ts-browser-helpers/functions/toCamelCase) | Convert a string to camel case |
| [toTitleCase](https://repalash.com/ts-browser-helpers/functions/toTitleCase) | Convert a string to title case |

## Time

| Function | Description |
| ------ | ------ |
| [now](https://repalash.com/ts-browser-helpers/functions/now) | Returns the current time in milliseconds. If performance.now() is available, it is used, otherwise Date.now() is used. |
| [timeout](https://repalash.com/ts-browser-helpers/functions/timeout) | Returns a promise that resolves after the given duration. Basically a setTimeout that returns a promise. |

## URL

| Function | Description |
| ------ | ------ |
| [getUrlQueryParam](https://repalash.com/ts-browser-helpers/functions/getUrlQueryParam) | Get URL query parameter. If not found, return default value. Similar to PHP's $_GET |
| [setUrlQueryParam](https://repalash.com/ts-browser-helpers/functions/setUrlQueryParam) | Set URL query parameter. If value is null, remove parameter. Similar to PHP's $_GET |

## Used in

- [WebGi](https://webgi.xyz/docs) - Premium Photo-realistic 3D rendering framework and tools for web applications and online commerce.
- [ThreePipe](https://threepipe.org/) - A 3D viewer framework for the web.
- [uiconfig.js](https://repalash.com/uiconfig.js/) - A simple, lightweight and easy to use UI configuration library for javascript/typescript projects.

## References

Generated with [rollup-library-starter](https://github.com/repalash/rollup-library-starter)

