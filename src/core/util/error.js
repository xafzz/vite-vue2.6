
import {
   isPromise
} from '@/shared/util'


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
