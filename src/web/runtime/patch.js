import { createPatchFunction } from "../../core/vdom/patch";
import * as nodeOps from '../../web/runtime/node-ops'


export const patch = createPatchFunction({nodeOps})
