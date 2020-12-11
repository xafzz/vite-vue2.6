<template>
<div id="main" class="main"  style="background: red" @click="tag" v-show="show">
    <div class="top">
        这是一段正常的文字
    </div>
    <!-- 这是一段注释 -->
    <div class="center">
        <p>{{ msg }}</p>
    </div>
    <div class="bottom">
        <a href="/" target="_blank" title="11" id="link" class="link" name="a">这是A</a>
    </div>

</div>
</template>

<script>
export default {
    name: 'App',
    data(){
        return {
            msg:1,
            show:true
        }
    },
    methods:{
        tag(){
            console.log(11)
        }
    }
}
</script>