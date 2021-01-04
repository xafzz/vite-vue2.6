


export function initExtend( Vue ){
   /**
    *每个实例构造函数（包括Vue）都有一个唯一的
    *cid。这使我们能够创建包装的“子对象”
    *用于原型继承和缓存它们的构造函数。
    */
   Vue.cid = 0
   let cid = 1

   // 类继承
   Vue.extend = function ( extendOptions ){
      extendOptions = extendOptions || {}
      const Super = this
      const SuperId = Super.cid
      console.log('Vue.extend----->没有走到这儿')
   }
}
