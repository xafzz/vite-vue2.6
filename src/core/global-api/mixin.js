
import {mergeOptions} from "../util";

//就是一个合并 options 过程
export function initMixin(Vue ){
    Vue.mixin = (mixin) => {
        console.log('用到mixin的时候打印')
        this.options = mergeOptions(this.options,mixin)
        return this
    }
}
