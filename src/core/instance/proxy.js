import {makeMap} from "../../compiler/helpers";
import {isNative} from "../util";

let initProxy
// not type checking this file because flow doesn't play well with Proxy
//不检查此文件的类型，因为流不能很好地使用代理
//生产环境不走这块
const allowedGlobal = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
)

//什么时候没有值？
const hasProxy = typeof Proxy !== 'undefined' && isNative(Proxy)

const hasHandler = {
   has( target,key ){
      let has = key in target

      console.log('没有走到这儿----->hasHandler')

      return has
   }
}

const getHandler={
   get( target,key ){
      console.log('没有走到这儿----->getHandler')
      return target[key]
   }
}

initProxy = function initProxy(vm){
   if( hasProxy ){
      // 使用下面的 处理程序
      // determine which proxy handler to use
      let options = vm.$options
      //undefined
      let handlers = options.render && options.render._withStripped
                     ? getHandler
                     : hasHandler
      vm._renderProxy = new Proxy( vm,handlers )
   }else{
      vm._renderProxy = vm
   }
}
export { initProxy }
