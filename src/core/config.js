
import { no } from "../shared/util.js";

export default {

    /**
     * Option merge strategies (used in core/util/options)
     */
    // $flow-disable-line
    optionMergeStrategies: Object.create(null),

    /**
     * Whether to record perf
     * 是否记录性能
     * 怎么查看 todo
     */
    performance: false,
    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no,

}