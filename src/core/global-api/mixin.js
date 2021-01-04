import {mergeOptions} from "../util";


export function initMixin( Vue ){
   Vue.mixin = function (mixin){
      console.log('这就是mixins吧，也是合并options应该其他地方还会有')
      this.options = mergeOptions(this.options,mixin)
      return this
   }
}
