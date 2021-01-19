
import {identity, no, noop} from "../shared/util.js";

export default {

    /**
     * Option merge strategies (used in core/util/options)
     */
    // $flow-disable-line
    optionMergeStrategies: Object.create(null),

    /**
     * Whether to record perf
     * 是否记录性能
     * 怎么查看 ?
     * 在浏览器控制台中 window.performance.getEntries() 当然还有其它方法
     */
    performance: true,
    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no,
    /**
     * Parse the real tag name for the specific platform.
     */
    //identity 返回相同的值
    parsePlatformTagName: identity,
    /**
     * Perform updates asynchronously. Intended to be used by Vue Test Utils
     * This will significantly reduce performance if set to false.
     */
    async: true,

    /**
     * Warn handler for watcher warns
     */
    warnHandler: null,
    /**
     * Whether to suppress warnings.
     */
    silent: false,

    /**
     * Custom user key aliases for v-on
     */
    // $flow-disable-line
    keyCodes: Object.create(null),

    /**
     * Get the namespace of an element
     */
    getTagNamespace: noop,


    /**
     * Whether to enable devtools
     */
    devtools: true,

    /**
     *
     * Show production mode tip message on boot?
     */
    productionTip:true,
    /**
     * Ignore certain custom elements
     */
    ignoredElements: [],

    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: no
}
