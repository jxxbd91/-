### 看一个问题
```
function foo() {
	var result = []
	for (var i = 0; i < 10; i++) {
		result[i] = function() {
			return i
		}
	}
	return result
}
var result = foo()
console.log(result[5]())  // 输出结果为: 10
```

> 分析出现上面情况的原因：
1. var 变量声明没有块级作用域
2. 函数的作用域范围是在函数被声明时就已经决定了