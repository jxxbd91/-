# js 中的数组

## js中数组的遍历方式

### for
for 循环遍历是最普通的一种方式，通过数组中自带的索引进行数组元素的获取，这种方式可以支持 break、continue、return的打断形式。具体如下：
```
for (var i = 0; i < arr.length; i++) {
	// 通过索引进行数组元素的获取
	console.log(arr[i])
	if (i === 3) {
		// 可以使用break跳出当前循环 效果跟 return 一样
		break
		// return
	} else if (i === 2) {
		// 可以使用continue跳过当次循环
		continue
	}
}
```
### forEach
forEach是一个方法，这个方法是在 Array 类的 prototype 上，所以所有的Array的实例上都有这个方法。forEach方法没有返回值，参数有两个。形式为：`arr.forEach(callbackFn[, thisValue])`，其中 `callbackFn` 是个函数，这个函数有三个参数，可以分别记为 `item、index、array`，见名知意：第一个参数 `item` 表示的是被遍历的数组每一项，`index` 表示的是当前被遍历项的数组下标，`array` 表示的是被遍历的数组对象，此处即为`arr`。`callbackFn` 是必传参数。forEach函数还有一个可传参数 `thisValue`，这个参数是一个对象，作用是在 `callbackFn` 函数中this的引用。如果不传 `thisValue`，则默认值为 `undefined`。

> 注意点：
1. forEach不能被break、continue、return打断；
2. 如果callbackFn是箭头函数，则传入的 thisValue 不起作用，因为箭头函数绑定的this是模块this

```
var arr1 = [1, 2, 3]
var arr2 = ['a', 'b', 'c']
arr1.forEach(function(item, index, array) {
	// 这个函数内的this指向arr2
	// item 是arr1数组中的每一项
	// index 是arr1数组的索引值，Number类型
}, arr2)
```

### for in
for in 不仅遍历数组还可以遍历对象（当然，数组也是一种特殊的对象），for in 有如下的特点：
1. 跟 forEach 一样不能被break、continue、return打断；
2. 可以遍历对象的属性；
3. 遍历的对象属性包含构造函数的 `prototype` 上添加的属性和当前实例上添加的属性（可以通过 `Object.prototype.hasOwnProperty` 方法进行区分是不是当前实例的属性）

具体以实例说明如下：
> 典型使用方式
```
var arr = [1, 2, 3, 4]
for (var attr in arr) {
	// 数组索引
	console.log(attr) // 输出的结果为 0, 1, 2, 3
	// 数组value
	console.log(arr[attr]) // 输出的结果为 1, 2, 3, 4
}
```

> 遍历Array.prototype 上添加的属性
```
Array.prototype.addProperty = 'myadd'
var arr = [1, 2, 3, 4]
for (var attr in arr) {
	console.log(attr) // 输出的结果为 0, 1, 2, 3, addProperty
}
```

> 遍历实例上添加的属性
```
var arr = [1, 2, 3, 4]
arr.instanceProperty = 'myadd'
for (var attr in arr) {
	console.log(attr) // 输出结果为 0, 1, 2, 3, instanceProperty
}
```

> 通过 hasOwnProperty 进行属性的区分
```
Array.prototype.addProperty = 'add'
var arr = [1, 2, 3, 4]
arr.instanceProperty = 'myadd'
for (var attr in arr) {
	if (arr.hasOwnProperty(attr)) {
		console.log(attr) // 输出结果为 0, 1, 2, 3, instanceProperty
	}
	console.log(attr) // 输出结果为 0, 1, 2, 3, instanceProperty, addProperty
}
```

### for of
`for of` 是 es6中新增的语句，用于遍历迭代器，也就是说只要实现了`iterator`接口的实例都能被`for of`所迭代。在js对象中实现了`iterator`接口的有：`String、Array、Map、Set、Generator、通过计算生成的entries|keys|values、类数组对象arguments|DOMList`，由于`Object`没有实现`iterator`接口，所以不能通过`for of`进行迭代。数组的迭代器方法可以通过`Array.prototype[Symbol.iterator]`找到。`for of`有如下特点：
1. 跟for循环一样可以被break、continue、return打断；
2. 不能遍历到Array原型上的属性；
3. 不能遍历到数组实例上添加的属性；
4. for of 只能遍历到数组的value，而不能得到数组的索引

具体实例说明如下：
> 典型用法
```
var arr = [1, 2, 3, 4]
// arr 上添加属性
arr.addProperty = 'add'
// Array.prototype 上添加属性
Array.prototype.addPro = 'test'
for(var attr of arr) {
	if (attr === 3) {
		continue
	}
	console.log(attr)  // 输出结果：1, 2, 4
	// 不能遍历到addProperty、addPro
}
```

### map
map的用法跟forEach非常的类似，跟forEach一样都是 `Array.ptototype` 上的方法，通过原型链，所有的Array实例都可以访问到map方法。map方法的参数跟forEach一样，一个回调函数和一个this对象：`arr.map(callbackFn[, thisValue])`，并且`callbackFn`的参数跟forEach中的`callbackFn`中的参数也是一样的。map跟forEach的区别在于，map是有返回值的，返回值是一个新的数组实例。map方法的目标并不是用来对原数组进行遍历，而是在原数组的基础上进行一些变换从而得到一个新的数组。这些变换并不会影响到原数组。下面看一下map方法的典型用法：
```
var arr = [1, 2, 3, 4]
// map 方法有返回值，返回值是一个新的数组
var arr2 = arr.map(function(curValue, index, ar) {
	// callbackFn 也需要返回值，返回值会成为新数组的子项。与原数组一一对应
	return curValue * 2
})
console.log(arr)
// 输出结果为：[1, 2, 3, 4]
console.log(arr2)
// 输出结果为：[2, 4, 6, 8]
```
forEach和map的 `callbackFn`中虽然可以得到被遍历数组的每一项，但是我们如果要改变原数组需要使用一点手段。`callbackFn`方法的参数传入同普通方法的参数一样，都是将数据的引用传入到了函数中。所以我们如果直接更改参数的引用的话，我们将不能变更原数组的内容。如下例所示：
```
var arr = [1, 2, 3, 4]
arr.map(function(curVal, index, ar) {
	curVal *= 2
})
console.log(arr) // 输出结果 1, 2, 3, 4
```
上面的做法并不能改变原数组，因为curVal是一个引用，我们在callbackFn中将curVal的引用重新进行了赋值，引用的指向改变了。所以arr中对应的值并不会发生改变，因为arr中对应的值的引用与curVal的引用指向已经不一样了。我们把实例改一下：
```
var arr = [
	{value: 1},
	{value: 2},
	{value: 3},
	{value: 4}
]
arr.map(function(curVal, index, ar) {
	curVal.value *= 2	
})
console.log(arr) // 输出结果为：[{value: 2}, {value: 4}, {value: 6}, {value: 8}]
```
这里我们将 curVal.value 的引用重新指向，但是curVal的指向并没有被修改，也就是说 curVal 的引用指向还是跟 arr 中对应项的引用指向保持一致，所以最终输出的结果会发生变化。还有一种做法，我们利用第二个和第三个参数来修改原来的数组：
```
var arr = [1, 2, 3, 4]
arr.map(function(curVal, index, ar) {
	ar[index] *= 2	
})
console.log(arr) // 输出的结果为：2, 4, 6, 8
```
*forEach 的效果同map*

### every
every 类似 forEach和map，都是 `Array.prototype`上的方法，该方法的返回值是boolean，`callbackFn`的返回值也是一个boolean，如果为true则继续遍历，直到返回值为false或者到达数组边界结束遍历。every方法常用来判断当前数组中所有项是否满足指定条件。
```
var arr = [1, 2, 3, 4, 5]
var b1 = arr.every(function(curVal) {
	return curVal < 10	
})
var b2 = arr.every(function(curVal) {
	return curVal < 4	
})
console.log(b1) // 结果为 true
console.log(b2) // 结果为 false
```

### iterator
iterator 是一个方法，Array 构造函数的原型上通过 `Symbol.iterator` 指向这个方法。该方法执行的到结果是一个 `Iterator` 对象，通过 `Object.prototype.toString.call(arr[Symbol.iterator])` 得到的结果是 `"object Array Iterator"`。所有的 数组实例都可以直接通过 `Symbol.iterator` 获得 iterator 方法。我们可以通过 iterator 进行数组的遍历。具体代码如下：
```
var arr = [1, 2, 3, 4]
var it = arr[Symbol.iterator]()
var item = null
while(!(item = it.next()).done) {
	console.log(item.value) // 结果： 1, 2, 3, 4
}
```
除了通过`next`方法进行遍历之外，我们还能使用 `for of` 来遍历iterator
```
var arr = [1, 2, 3, 4]
var it = arr[Symbol.iterator]()
for (var attr of it) {
	console.log(attr) // 结果：1, 2, 3, 4
}
```
*关于iterator的详细内容参见 [Iterator](https://developer.mozilla.org/en-US/docs/Archive/Web/Iterator) 和 [阮老师博客](http://es6.ruanyifeng.com/#docs/iterator)*

### keys、values、entries
这三个方法是 es6 中新增的，返回值是一个 iterator。得到 iterator 之后就可以使用 iterator 的遍历方式进行遍历。三个方法略有区别：
> keys：通过keys方法得到的iterator可以遍历数组的索引值
```
var arr = [1, 2, 3, 4]
var keys = arr.keys()
for (var attr of keys) {
	// 输出的是数组的索引值
	console.log(attr) // 结果：0, 1, 2, 3
}
```
> values：通过values方法得到iterator，可以遍历到一个对象，对象的形式为：`{value: 1}`。键为固定的value，值是对应的数组值。
```
var arr = [1, 2, 3, 4]
var values = arr.values()
for (var attr of values) {
	// 输出的是数组的索引值
	console.log(attr) // 结果：{value: 1}, {value: 2}, {value: 3}, {value: 4}
}
// 通过结构的方式
for (var { value } of values) {
	// 输出的是数组的索引值
	console.log(value) // 结果：1, 2, 3, 4
}
```
> entries：通过values方法得到iterator，可以遍历到一个数组，数组的形式为：`[index, value]`。数组的第一项是被遍历数组的索引，数组的第二项是被遍历数组的值。
```
for (var attr of [1, 2, 3, 4].entries()) {
	console.log(attr) // 结果为：[0, 1], [1, 2], [2, 3], [3, 4]
}
// 通过解构的方式进行遍历
for (var [index, value] of [1, 2, 3, 4].entries()){
	console.log(index) // 结果为 0, 1, 2, 3
	console.log(value) // 结果为 1, 2, 3, 4
}
```
（完）