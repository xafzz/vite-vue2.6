


export function initExtend( Vue ){

    /**
     * Each instance constructor, including Vue, has a unique
     * cid. This enables us to create wrapped "child
     * constructors" for prototypal inheritance and cache them.
     * 每个实例构造函数（包括Vue）都有一个唯一的cid。
     * 这使我们能够为原型继承创建包装的“子构造函数”并对其进行缓存。
     * 说的好玄乎啊
     */
    Vue.cid = 0
    let cid = 1

    /**
     * 类继承
     * @param extendOptions { Object }
     */
    Vue.extend = (extendOptions) => {
        console.log('到我了 extend')
    }
}
