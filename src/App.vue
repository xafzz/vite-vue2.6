<template>
<img id="main" class="main" v-bind:key="22222" style="width: 20px" @click="tag" src="/"/>
<div id="mains" class="main" style="background: red" @click="tag" v-show="show">
    <div class="top">
        这是一段正常的文字
    </div>
    <div v-for="(item,key) in list" :key="key">
        <p>{{item.name}}-{{item-age}}</p>
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
            show:true,
            list:[
                {name:1,age:2},
                {name:3,age:4},
                {name:5,age:6},
            ]
        }
    },
    methods:{
        tag(){
            console.log(11)
        }
    }
}
</script>