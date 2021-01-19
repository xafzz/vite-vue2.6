
import Vue from "../../core/core";
import {getTagNamespace, isReservedTag, isUnknownElement, mustUseProp, query} from "../util";
import {inBrowser, noop} from '../../core/util'
import { mountComponent } from '../../core/instance/lifecycle'
import {patch} from "./patch";

// todo 在 替换 config 里面的，但是没有替换的了 好尴尬
// install platform specific utils
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
// Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop
//这个过程更像是挂载的过程
//后期在写吧
// public mount method
Vue.prototype.$mount = function(el,hydrating){

    el =el && inBrowser ? query(el) : undefined

    return mountComponent(this,el,hydrating)
}


export default Vue
