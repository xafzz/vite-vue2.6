
//初始化事件
export function initEvents( vm ){
   //创建一个空对象
   vm._events = Object.create(null)
   //干啥
   vm._hasHookEvent = false

   // init parent attached events
   //_parentListeners 都没这个
   let listeners = vm.$options._parentListeners
   if( listeners ){
      console.log('有了我会再回来的----->initEvents')
   }


}
