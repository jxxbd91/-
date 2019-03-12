## tapable
### SyncHook
> 用法：
```
class A {
	constructor() {
		this.hooks = {
			syncHook: new SyncHook(['param1'])
		}
	}
}
let a = new A()
a.hooks.syncHook.tap('fir', params => {
	console.log(`hello ${params}`)	
})

a.hooks.syncHook.call('workd') // 输出的结果是： hello world
```