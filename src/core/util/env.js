
// can we use __proto__?
export const hasProto = '__proto__' in {}

//window 在小程序里面 就没有window对象 但是在这儿都是ture吧
export const inBrowser = typeof window !== 'undefined'
//weex？
export const inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform


// Firefox has a "watch" function on Object.prototype...
export const nativeWatch = ({}).watch

export function isNative (Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
//因为之前可能需要vue，所以需要延迟评估
//vue服务器呈现程序可以设置vue_ENV
let _isServer
export function isServerRendering(){
    if (_isServer === undefined) {
        /* istanbul ignore if */
        if (!inBrowser && !inWeex && typeof global !== 'undefined') {
            // detect presence of vue-server-renderer and avoid
            // Webpack shimming the process
            _isServer = global['process'] && global['process'].env.VUE_ENV === 'server'
        } else {
            _isServer = false
        }
    }
    return _isServer
}









