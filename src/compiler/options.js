
import {genStaticKeys} from "../shared/util.js";
import {
    mustUseProp,
    isReservedTag,
    isPreTag,
    getTagNamespace,
    isUnaryTag,
    canBeLeftOpenTag,
} from '../util/index.js'
import directives from './directives/index.js'
import modules from './modules/index.js'

export const baseOptions = {
    expectHTML: true,
    mustUseProp,
    isPreTag,
    isReservedTag,
    getTagNamespace,
    isUnaryTag,
    canBeLeftOpenTag,    //colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source
    directives,
    modules,
    staticKeys: genStaticKeys(modules)
}