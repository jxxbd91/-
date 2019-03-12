vue 和 react生命周期方法的对比
vue
	初始化
		beforeCreate
		created
		beforeMount
		mounted

	更新
		beforeUpdate
		updated
	
	销毁
		beforeDestroy
		destroyed

react
	初始化
		componentWillMount
		render
		componentDidMount

	更新
		props
			componentWillReceiveProps
			shouldComponentUpdate
			componentWillUpdate
			render
			componentDidUpdate

		state
			shouldComponentUpdate
			componentWillUpdate
			render
			componentDidUpdate

	销毁
		componentWillUnmount


script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout


`Symbol.toStringTag`是对象的一个属性，如果这个属性存在，它的值会作为`toString`方法的结果。
```
var a = {}
a[Symbol.toStringTag] = 'A'
console.log(a.toString()) // "[object A]"
```