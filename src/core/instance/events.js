
export function initEvents(vm){

    //存放事件的对象
    //父子组件的时候，父组件绑定在当前组件上的事件
    //单个vue组件 _events {}
    vm._events = Object.create(null)
    // 该属性表示父组件是否通过"@xx:"把钩子函数绑定在当前组件上
    vm._hasHookEvent = false

    // init parent attached events
    // 初始化父组件添加的事件
    const listeners = vm.$options._parentListeners
    if( listeners ){
        console.log('有了我会再回来的----->initEvents')
    }
}

//给组件实例附加$on,$off,$emit,$once方法。
export function eventsMixin( Vue ){

    const hookRE = /^hook:/
    /**
     * @description 监听当前实例上的自定义事件。事件可以由 vm.$emit 触发。回调函数会接收所有传入事件触发函数的额外参数。
     * @param event { string | Array }
     * @param fn { Function }
     */
    Vue.prototype.$on = function ( event,fn ){
        let vm = this
        return vm
    }

    /**
     * @description 监听一个自定义事件，但是只触发一次。一旦触发之后，监听器就会被移除。
     * @param event { string }
     * @param fn { Function }
     */
    Vue.prototype.$once = function (event,fn){

        let vm = this
        return vm
    }

    /**
     *
     * @param event { ? string | Array }
     * @param fn { ? Function }
     */
    Vue.prototype.$off = function (event,fn){

        let vm = this
        return vm
    }

    /**
     * @description 触发当前实例上的事件。附加参数都会传给监听器回调。
     * @param event { string }
     */
    Vue.prototype.$emit = function (event){

        let vm = this
        return vm
    }

}
