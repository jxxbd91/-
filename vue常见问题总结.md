### vue 常见问题总结
1、vue data中声明了某个属性，有些时候却发现该属性没有发生响应式变更
  问题描述：在data中声明了某个属性，后面给该属性赋值，正常逻辑下与该属性绑定的UI会发生响应。但是由于代码编写失误，会造成UI不发生响应的情况。
  发生这个问题需要了解vue的响应式原理，vue使用Object.defineProperty进行响应式操作。初始化data数据的时候，vue会递归地遍历声明过得data属性，对该属性的每一个子属性都应用Object.property发放进行响应式绑定。如果当这个属性或者属性中的某一个子属性发生内存引用的改变或者基本数据类型的变更时。就会触发对应的响应式函数，在对应的响应式函数中可以修改UI，最终达到响应式效果。
  问题是，当我们第一次修改了整个属性的内存指向时，当新的内存中不存在最初声明的子属性时，与子属性发生绑定的UI就无法再次发生响应。这就是问题所在。
  vue官方给出了定义单个属性的方式，组件内的用法如下：
  ```
    // ...
    methods: {
      change () {
        this.$set(obj, 'property', value)
        // 通过以上方式可以给obj对象的property属性设置value值，并且会重新发生响应式绑定
      }
    }
    // ...
  ```
  需要注意的是：vue中只有被声明的属性发生引用改变或者基本数据类型的变动时，才能出发响应式操作。实例如下
  ```
    // ...
    data: {
      obj1: {
        pro1: ''
      }
    }
    // ...
  ```

2、watch 和 事件的执行先后顺序
3、computed 属性 发生赋值操作
4、自定义组件需要使用v-model指令
5、style中scoped条件下修改组件内的样式
6、v-model 是 v-bind:value 和 v-on:input 的语法糖，有时候需要拆开使用
  在vue1.x版本中可以对 v-model使用过滤器，而在vue2.x版本中取消了这个功能，我们要实现这个功能可以通过 将 v-model 拆分为 v-bind:value 和 v-on:input 的形式来完成这个功能
  ```
    <template>
      <input v-bind:value="msg" v-on:input="inputHandle($event)" />
    </template>

    <script>
      new Vue({
        data: {
          msg: '',
          realMsg: ''
        },
        methods: {
          inputHandle (e) {
            // 给展示的数据增加 过滤效果
            this.msg = filter(e.target.value)
            // 给真实数据取消过滤效果
            this.realMsg = deFilter(e.target.value)
          }
        }
      })
    </script>

  ```
7、父子组件的生命周期
8、多层级父子组件数据传递时不使用vuex的处理方式
9、watch的函数形式
  ```
    created () {
      this.$watch(() => this.model[this.data.prop], (newVal, oldVal) => {
          // ...
        })
    }

  ```
  被watch的属性可以是一个函数的返回值，在函数执行时会求解 返回的表达式的值
10、vue组件中的data需要使用函数返回值的形式
  ```
    data () {
      return {
        // ... your data
      }
    }

  ```
  原因：我们使用组件的目的是为了充分地复用，也就是说声明的组件是会被很多父组件所引用的，在js中对象类型的数据是引用类型，为了防止在多个父组件中修改同一个data 所指向的内存空间，我们必须给每一个父组件所引用的组件一个单独的data对象。而函数的返回值恰恰可以做到这点。