


//options 不是完全体 可能会有问题
import {hasOwn, isPlainObject, noop} from "@/shared/util";
import {
   isReserved,
   bind,
   nativeWatch,
   isServerRendering
} from "../util";

const sharedPropertyDefinition = {
   enumerable: true,
   configurable: true,
   get: noop,
   set: noop
}

export function proxy(target,sourceKey,key){
   sharedPropertyDefinition.get = function proxyGetter(){
      return this[sourceKey][key]
   }
   sharedPropertyDefinition.set = function proxySetter(val){
      this[sourceKey][key] = val
   }
   Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function initState(vm ){
   vm._watcher = []
   let opts = vm.$options

   if( opts.props ){
      console.log('initState------>没有props')
   }
   //将 methods 挂载到 vm上
   if( opts.methods ){
      initMethods(vm,opts.methods)
   }

   /*
   proxy 这个方法
      a、将data整个object 挂载到 vm._data上
      b、将data里面到各个属性 挨个挂载到vm上
    */
   if( opts.data ){
      initData(vm)
   }else{
      //这个 _data 就是通过 initData(vm) 挂载到 vm 上的
      // observe(vm._data = {},true)
   }

   if( opts.computed ){
      initComputed(vm,opts.computed)
   }
   if( opts.watch && opts.watch !== nativeWatch ){

   }

}

//将 methods 挂载到 vm上
function initMethods( vm,methods ){
   const props = vm.$options.props
   for (const key in methods) {
      {
         if( typeof methods[key] !== 'function' ){
            console.warn(`Method '${key}' has type '${typeof methods[key]}' in the component definition.Did you reference the function correctly?`)
         }
         //检查props跟methods 是否有同名的
         if( props && hasOwn(props,key) ){
            console.warn(`Method "${key}" has already been defined as a prop.`)
         }
         // isReserved 检测字符串是否以 $ or _ 开头
         // 是否跟vue方法实例 同名
         if((key in vm) && isReserved(key)){
            console.warn(`Method "${key}" conflicts with an existing Vue instance method.Avoid defining component methods that start with _ or $. `)
         }
      }
      vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key],vm)
   }
}

//又到 src/core/util/options.js 合并 options
//合并data
function initData( vm ){
   let data = vm.$options.data
   data = vm._data = typeof data === 'function'
       ? getData(data,vm)
       : data || {}
   if( !isPlainObject(data) ){
      data = {}
      console.warn(`data functions should return an object:https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function`)
   }
   // proxy data on instance
   let keys = Object.keys(data)
   let props = vm.$options.props
   let methods = vm.$options.methods
   let i = keys.length
   while (i--){
      let key = keys[i]

      {
         //data与methods 名称重复
         if( methods && hasOwn(methods,key) ){
            console.warn(`Method "${key}" has already been defined as a data property.`)
         }
      }

      //data与 props 名称重复
      if( props && hasOwn(props,key) ){
         console.warn(`The data property "${key}" is already declared as a prop.Use prop default value instead. `)
      }

      //不是以 _ or $ 开头
      if( !isReserved(key) ){
         proxy(vm,`_data`,key)
      }
   }
   //处理成响应式数据
   //observe(data,true /* asRootData */)
}

export function getData(data,vm){
   //禁用 dep
   //pushTarget()
   try {
      return data.call(vm,vm)
   }catch (e) {
      console.log('----->getData',e)
   }finally {
      //popTarget()
   }
}


function initComputed(vm,computed){
   let watchers = vm._computedWatchers = Object.create(null)
   // computed properties are just getters during ssr
   let isSSR = isServerRendering()

   for (const key in computed) {
      let userDef = computed[key]
      let getter = typeof userDef === 'function' ? userDef :userDef.get

      if( getter == null ){
         console.warn(`Getter is missing for computed property "${key}".`)
      }

      // create internal watcher for the computed property.
      // 为计算属性创建内部监视程序
      if( !isSSR ){

      }
   }
}
