
export function initInjections( vm ){
    let result = resolveInject(vm.$options.inject,vm)
}

export function resolveInject( inject,vm ){
    if( inject ){
        console.log('没有------>initInjections')
    }
}

export function initProvide(vm) {
    let provide = vm.$options.provide
    if (provide) {
        console.log('没有provide')
    }
}
