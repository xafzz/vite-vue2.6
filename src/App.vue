<template>
    <div id="main" title="1" class="main" style="background: red;border: 1px solid red;" >
        <div class="top">
            这是一段正常的文字br
            <div class="btn">
                <input type="text" id="input" class="input" name="input" value="这是默认值" v-if="1" v-on:click="tag"  v-model="msg" />
                <button  @click="tag" > 点击 </button>
            </div>
        </div>
        <!-- 这是一段注释 -->
        <div class="center" v-for="(item,key) in 10" :key="key">
            <p>{{ msg }},{{ changeComputed }},{{computedParams(2)}}</p>
        </div>
        <div class="v-once" v-once >
            v-once
        </div>
        <div class="bottom">
            <a href="/" target="_blank" :title="msg" id="link" class="link" :class="cla" name="a">第三方的身份</a>
        </div>
    </div>
</template>

<script>
export default {
    name: 'App',
    data(){
        return {
            msg:1,
            show:false,
            list:[
                {name:1,age:2},
                {name:3,age:4},
                {name:5,age:6},
            ],
            cla:'class'
        }
    },
    beforeCreate () {
        document.querySelector('#app').append('----- beforeCreate -----')
        console.log('beforeCreate')
    },
    created() {
        document.querySelector('#app').append('----- created -----')
        console.log('created')
    },
    beforeMount() {
        console.log('beforeMount')
    },
    mounted() {
        console.log('mounted')
    },
    beforeUpdate() {
        console.log('beforeUpdate')
    },
    updated() {
        console.log('updated')
    },
    activated(){
        console.log('activated')
    },
    deactivated() {
        console.log('deactivated')
    },
    beforeDestroy() {
        console.log('beforeDestroy')
    },
    destroyed() {
        console.log('destroyed')
    },
    errorCaptured(err, vm, info) {
        console.log('errorCaptured')
    },
    watch:{
        show(){
            console.log('show is change',this.show)
        },
    },
    computed:{
        changeComputed(){
            return this.msg * 2
        },
        computedParams(){
            return (param)=>{
                return this.msg * param * 2
            }
        }
    },
    methods:{
        tag(){
            this.show = !this.show
            this.msg += 1
            console.log(11)
        }
    }
}
</script>
