//你也有用的时候
// patch 用到了 起码我目前没有用到 猜测应该是 SSR相关的
export const SSR_ATTR = 'data-server-rendered'

// initMixin 的时候
export const ASSET_TYPES = [
    'component',
    'directive',
    'filter'
]

//生命周期的钩子函数
export const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated',
    'errorCaptured',
    'serverPrefetch'
]
