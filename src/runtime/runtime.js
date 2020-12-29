
import Vue from "../core/core";
import {query} from "../util/index";
import { inBrowser } from '../core/util'
import { mountComponent } from '../core/instance/lifecycle'

//这个过程更像是挂载的过程
//后期在写吧
// public mount method
Vue.prototype.$mount = function(el,hydrating){

    el =el && inBrowser ? query(el) : undefined

    return mountComponent(this,el,hydrating)
}

export default Vue
