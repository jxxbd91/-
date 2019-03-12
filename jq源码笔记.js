/*
	判断一个对象是否是function
*/
var isFunction = function isFunction( obj ) {

  // Support: Chrome <=57, Firefox <=52
  // In some browsers, typeof returns "function" for HTML <object> elements
  // (i.e., `typeof document.createElement( "object" ) === "function"`).
  // We don't want to classify *any* DOM node as a function.
  return typeof obj === "function" && typeof obj.nodeType !== "number";
};

// DOMEval 函数

// 无 new 构造函数
/*
	在使用jQuery方法的时候并不需要去实例化这个构造函数，而只是需要像普通函数的调用一样去执行jQuery方法，实际上是jQuery方法内部已经帮助实现了实例化操作。
*/

function jQuery(options) {
	// 此处实例化的是jQuery原型上的init构造函数
	// 为了保证通过init函数实例化的对象this指向时jQuery构造函数的原型对象，后面需要将init的prototype指向jQuery的prototype
	return new jQuery.prototype.init(options);
}

jQuery.fn = jQuery.prototype = {
	init: function(options) {
		// ...
	}
}

jQuery.prototype.init.prototype = jQuery.prototype


// extend


// jQuery的整体架构
// 首先声明了jQuery的构造函数、然后为了实现无new方式构建jQuery的实例在jQuery的prototype上添加了init构造函数
// 同时在jQuery构造函数上和jQuery的prototype上添加了extend方法，这个方法的功能多样，既可以用来扩展jQuery构造函数自身（构造函数上的静态方法）也可以用来扩展第三方对象
// 通过extend方法在jQuery上添加了几个工具方法