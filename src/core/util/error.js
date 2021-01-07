
import {
    isPromise
} from '@/shared/util'
import {popTarget, pushTarget} from "../observer/dep";
import config from "../config";
import {inBrowser, inWeex} from "./env";

export function invokeWithErrorHandling(handler,context,args,vm,info){

    let res
    try {
        // apply/call的注释在 src/core/instance/instance.js
        res = args
            ? handler.apply(context,args)
            : handler.call(context)
        //_isVue 标记 被实例
        //_handled 没有设置
        //isPromise 异步
        if( res && !res._isVue && isPromise(res) && !res._handled ){
            console.log('没有走到这儿---->invokeWithErrorHandling')
        }
    }catch (e) {
        console.log(e)
    }
    return res
}


export function handleError (err, vm, info) {
    // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
    // See: https://github.com/vuejs/vuex/issues/1505
    pushTarget()
    try {
        if (vm) {
            let cur = vm
            while ((cur = cur.$parent)) {
                const hooks = cur.$options.errorCaptured
                if (hooks) {
                    for (let i = 0; i < hooks.length; i++) {
                        try {
                            const capture = hooks[i].call(cur, err, vm, info) === false
                            if (capture) return
                        } catch (e) {
                            globalHandleError(e, cur, 'errorCaptured hook')
                        }
                    }
                }
            }
        }
        globalHandleError(err, vm, info)
    } finally {
        popTarget()
    }
}

function globalHandleError (err, vm, info) {
    if (config.errorHandler) {
        try {
            return config.errorHandler.call(null, err, vm, info)
        } catch (e) {
            // if the user intentionally throws the original error in the handler,
            // do not log it twice
            if (e !== err) {
                logError(e, null, 'config.errorHandler')
            }
        }
    }
    logError(err, vm, info)
}

function logError (err, vm, info) {
    {
        console.warn(`Error in ${info}: "${err.toString()}"`, vm)
    }
    /* istanbul ignore else */
    if ((inBrowser || inWeex) && typeof console !== 'undefined') {
        console.error(err)
    } else {
        throw err
    }
}
