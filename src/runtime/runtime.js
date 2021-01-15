
import Vue from "../core/core";
import {getTagNamespace, isReservedTag, query} from "../util";
import {inBrowser, noop} from '../core/util'
import { mountComponent } from '../core/instance/lifecycle'

// todo 在 替换 config 里面的，但是没有替换的了 好尴尬
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isReservedTag = isReservedTag

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? noop : noop
//这个过程更像是挂载的过程
//后期在写吧
// public mount method
Vue.prototype.$mount = function(el,hydrating){

    el =el && inBrowser ? query(el) : undefined

    return mountComponent(this,el,hydrating)
}


export default Vue
