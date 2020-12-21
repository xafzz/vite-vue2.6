# 第五步 优化器 ast到optimize 打静态标记

## 问题
    
    刚上来代码没敲2行 markStatic 直接给我return了，把我整懵B了

## 小结
    
    要不趁现在还早 把柯里化跟options 各搞一个分支把
---------

### 关于options 
   
    必须之前加上 在parse阶段 跳过去了
    opzimize 阶段又用到了，
    重新搞下options，然后在重新梳理 parse跟opzimize阶段
    