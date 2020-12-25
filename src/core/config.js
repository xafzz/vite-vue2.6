
import { no } from "../shared/util.js";

export default {

    /**
     * Whether to record perf
     * 是否记录性能
     */
    performance: false,
    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no,

}