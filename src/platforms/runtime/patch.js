import * as nodeOps from './node-ops'
import {createPatchFunction} from "../../core/vdom/patch";
import platformModules from './modules'
import baseModules from '../../core/vdom/modules'

const modules = platformModules.concat(baseModules)

export const patch = createPatchFunction({ nodeOps,modules })
