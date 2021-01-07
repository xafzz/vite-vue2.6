
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
