# 从 vue-cli 到 webpack多入口打包（一）

## 从三个插件开始	

### 1、CommonsChunkPlugin

> commonsChunkPlugin 是webpack中的代码提取插件，可以分析代码中的引用关系然后根据所需的配置进行代码的提取到指定的文件中，常用的用法可以归为四类：（1）、提取node_modules中的模块到一个文件中；（2）、提取 webpack 的runtime代码到指定文件中；（3）、提取入口文件所引用的公共模块到指定文件中；（4）、提取异步加载文件中的公共模块到指定文件中。下面就具体说明以上四种用法。

>> 1.1 提取node_modules中的模块

>>>贴一段vue-cli 生成的代码
```
new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  minChunks(module) {
    // any required modules inside node_modules are extracted to vendor
    // 所有在node_modules中被引用的模块将被提取到vendor中
    return (
      module.resource &&
      /\.js$/.test(module.resource) &&
      module.resource.indexOf(
        path.join(__dirname, '../node_modules')
      ) === 0
    )
  }
})
```

>>> 通过查询 commonsChunkPlugin 的相关文档可以知道 options 的配置项中name用于 output 中的 filename的 [name] 占位符，也就是通过name可以指定提取出的文件的文件名或包含name的文件夹名称。minChunks 的取值比较多样
```
minChunks: number|Infinity|function(module, count) => boolean
```
这里我们用的是函数的形式，函数接受两个参数，且返回值是boolean类型。函数的作用是遍历所有被引用的模块（module.resource表示的是被引用模块的绝对路径）,由此我们可以通过module.resource进行判断，满足条件的我们返回true，反之返回false。返回值为true的模块将被提取到vender中。通过这一步我们可以完成node_modules中模块的提取。

>> 1.2 提取webpack的runtime代码

>>> 通过给minChunks传入Infinity这个参数，就可以实现提取webpack的运行时代码。按照官方文档的说法是：
```
// Passing `Infinity` just creates the commons chunk, but moves no modules into it.
// with more entries, this ensures that no other module goes into the vendor chunk
```

>>> 我个人理解：传入Infinity会生成一个没有包含任何模块的文件，生成这个文件的目的是为了保证vendor和其他公共模块的纯洁性，贴一段vue-cli中的webpack.prod.conf.js文件中的配置代码，并稍作解释：
```
// extract webpack runtime and module manifest[module manifest => 模块清单] to its own file in order to
// prevent vendor hash from being updated whenever app bundle is updated
new webpack.optimize.CommonsChunkPlugin({
  name: 'manifest',
  minChunks: Infinity
})
```

>>> 如`[]`中注释，manifest是一个模块清单，如果在没有manifest的情况下，我们在业务代码中新引入了一个自定义模块（不是在node_modules中的模块），我们会发现打包的vendeor会发生变化，变化就是因为在vendor中需要指明webpack的模块清单及模块的引用关系。这样我们就无法保证vendor的纯洁性，所以这就是我们提取manifest的必要性。下面会有两张对比图片

>> 1.3 提取入口文件所引用的公共模块

>>> 如果是在多入口的打包项目中，提取出公共文件可以减少冗余的打包代码。如果是在单入口的应用中，这一步骤可以省略，下面直接贴出代码：
```
/**
 * 该配置用于在多入口打包中，对 entry chunk中的公共代码进行提取
 */
new webpack.optimize.CommonsChunkPlugin({
  name: 'common', // 如果filename不存在，则使用该配置项的value进行对提取的公共代码进行命名
  filename: 'common/common-[hash].js', // filename 配置项可以指定index.html中的文件引用路径，及提取出来的代码放置路径
  chunks: [...utils.bundleModules], // 需要指定entry chunk 及 menifest
  minChunks: 2 // 指定最小引用次数
})
```

>>> 使用情况如注释中所言，不再赘述。

>> 1.4 提取异步入口中的公共模块到单独文件
>>> 如果我们在项目中使用了异步加载模块的形式进行代码打包，异步的文件会作为主入口下的子入口。比较典型的例子就是vue中的异步路由形式，每一个异步路由页面可以作为子入口，而这些入口中的公共代码我们可以将其提取出来到一个公共文件中，从而实现代码的精简。下面看一段路由代码：
```
routes: [
    {
      path: '/',
      name: 'Home',
      // 此处采用异步路由的形式，第一个参数是路由所对应的组件路径，最后一个参数是指定[name]占位符
      component: resolve => require.ensure(['@/modules/moduleA/Home'], resolve, 'moduleA/js/home')
    },
    {
      path: '/add',
      name: 'Add',
      component: resolve => require.ensure(['@/components/Add'], resolve, 'moduleA/js/add')
    }
]
```
再贴一段webpack配置代码：
```
// This instance extracts shared chunks from code splitted chunks and bundles them
// in a separate chunk, similar to the vendor chunk
// see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
new webpack.optimize.CommonsChunkPlugin({
  names: [...utils.bundleModules],
  async: 'vendor-async',
  children: true,
  minChunks: 2
})
```
以上两段代码会根据commonsChunkPlugin中names所指定的入口chunk名称进行分别提取，例如names中指定的值为`['moduleA', 'moduleB']`，webpack会分别找到moduleA和moduleB两个主入口，然后分别在两个主入口中查找异步模块，如果他们各自的异步模块中有共通引用的模块，则这些公共模块会被提取到一个名为vendr-async-moduleA和vendr-async-moduleB的两个文件夹中。

> 通过以上四个步骤我们基本上可以将常用的公共模块提取到指定的文件中，并且通过commonsChunkPlugin，webpack会自动将依赖文件注入到index.html文件中。完成代码的分割操作。


### 2、HTMLWebpackPlugin
> `htmlWebpackPlugin`这个插件是用来配置主入口html文件的，具体功能可以通过官方文件了解，这里不再赘述。此处需要说明的是在多入口中`htmlWebpackPlugin`的配置。
>> 下面贴上vue-cli中的配置：
```
// generate dist index.html with correct asset hash for caching.
// you can customize output by editing /index.html
// see https://github.com/ampedandwired/html-webpack-plugin
new HtmlWebpackPlugin({
	filename: config.build.index,
	template: 'index.html',
	inject: true,
	minify: {
		removeComments: true,
		collapseWhitespace: true,
		removeAttributeQuotes: true
		// more options:
		// https://github.com/kangax/html-minifier#options-quick-reference
	},
	// necessary to consistently work with multiple chunks via CommonsChunkPlugin
	chunksSortMode: 'dependency'
})
```
上面的配置中指定了template和filename，filename是打包后输出的文件名，filename值是一个字符串，所以可以配置输出的路径和文件名，template用于指定模板文件，同样可以通过字符串的形式指定template的路径和文件名。所以我们可以根据不同的入口配置多个htmlWebpackPlugin，并且指定不同的输出路径，这样就可以将多入口的打包的index.html文件进行区分了。
>> 在webpack的配置中`plugins`是一个数组，此处我们可以通过循环的方式生成多个htmlWebpackPlugin数组，然后将生成的数组与plugins数组进行合并。多入口配置如下：
```
// 生成htmlWebpackPlugin数组
const htmlOutput = (function () {
	// utils.bundleModules 是打包的模块列表
	return utils.bundleModules.map(item => {
	// 指定 template 路径
	let template = './src/modules/' + item + '/index.html'
	return new HtmlWebpackPlugin({
		// 指定每个index.html 的生成路径，现在的规则下是生成到dist目录下与入口chunk name相同的文件夹下
      	filename: path.resolve(__dirname, '../dist/' + item + '/index.html'),
      	template,
      	// 此处需要指定 chunks 的值，如果不指定该值，则会默认将所有生成js文件都注入到index.html文件中。实际上我们只希望得到跟当前入口相关的js文件
      	chunks: ['manifest', 'common', 'vendor', item],
      	// 对文件实行压缩混淆等操作
      	minify: {
	        removeComments: true,
	        collapseWhitespace: true,
	        removeAttributeQuotes: true
	    },
      	// necessary to consistently work with multiple chunks via CommonsChunkPlugin
      	chunksSortMode: 'dependency'
    })
  })
}())
```
```
// ...
// 将生成的htmlOutput 数组拼接到 plugins中
plugins: [
	// 其他插件 ...
	...htmlOutput
]
```

> 通过上面的配置我们就可以顺利将index.html 文件分别打包到我们指定的目录当中。

### 3、ExtractTextPlugin
> 通过以上两个配置我们完成了js文件和html文件的分离，并且将他们打包到了指定的目录下。最终我们还剩下css文件没有进行处理。css文件我们通过`extractTextPlugin`这个插件进行处理，相较于vue-cli中的默认配置，我们改动较小。只需要根据入口来指定打包的位置，见代码：
```
// vue-cli默认配置，
// extract css into its own file
new ExtractTextPlugin({
	// 所有的文件都统一打包到 dist目录下的css文件夹下
	filename: utils.assetsPath('css/[name].[contenthash].css'),
	// Setting the following option to `false` will not extract CSS from codesplit chunks.
	// Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
	// It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`, 
	// increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
	allChunks: true
})
```
```
// 多入口配置
new ExtractTextPlugin({
	// 将每个入口的css文件提取到各自独立的文件夹下
	// 这里的[name]就是占位符，表示的是 entry中的入口名称
	filename: utils.assetsPath('[name]/css/[name].[contenthash].css'),
	// Setting the following option to `false` will not extract CSS from codesplit chunks.
	// Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
	// It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`, 
	// increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
	allChunks: true
})
```

### 小结
通过以上三个插件我们基本可以将我们需要的代码打包的指定的路径下，并且完成index.html中的文件引用正常，下面我们要做的就是将这三个插件串起来，完成多入口项目的打包。




# 从 vue-cli 到 webpack多入口打包（二）

## 完成多入口打包配置
> 上一节我说完了三个关键的plugin，通过三个plugin我们可以做到将代码进行分割，并且将分割的代码打包到我们指定的路径下，完成打包的模块可以被index.html文件正确引用。这里我们需要贯穿整个流程。

### 1、yargs

> yargs 是一个非常强大的命令行参数处理工具，这里我们用到的功能比较简单，只需要获取从命令行传入的modules数组，这个数组表示所需打包的入口chunk。在vue-cli的默认安装包中并没有安装yargs这个模块，所以我们需要首先安装yargs模块。
```
// 通过npm安装yargs
npm install yargs -D
```

> 完成安装后，我们就能使用yargs进行命令行参数的获取，然后通过获取到的数组，按需打包我们需要的入口模块。例如：我们src下面有三个入口，分别为`moduleA`、`moduleB`、`moduleC`，但是本次我们发现`moduleC`的代码没有发生变动，我们只需要在打包时传入`moduleA`、`moduleB`这两个参数就能做到。首先我们需要将参数从命令行传入到我们的运行脚本中。

### 2、命令行传入参数

> 2.1 scripts 的命令行参数

>> 我们打包时运行的命令是`npm run build`，实际上我们执行的是package.json中的scripts中的脚本配置，vue-cli中默认的build配置是`"build": "node build/build.js"`，也就是说通过`npm run build`执行的是 build目录下的build.js文件。我们想要将参数传入到运行脚本中，就需要通过script脚本进行参数传递。

>> 关于script脚本参数传递，这里贴一篇阮一峰老师的一篇博文供参考 [npm scripts 使用指南](http://www.ruanyifeng.com/blog/2016/10/npm_scripts.html)，贴上我们需要的一段：
```
四、传参
向 npm 脚本传入参数，要使用--标明。
"lint": "jshint **.js"
向上面的npm run lint命令传入参数，必须写成下面这样。
$ npm run lint --  --reporter checkstyle > checkstyle.xml
也可以在package.json里面再封装一个命令。
"lint": "jshint **.js",
"lint:checkstyle": "npm run lint -- --reporter checkstyle > checkstyle.xml"
```
也就是说在npm脚本中传入参数我们需要使用 `-- --parameters`进行参数传递，我们在此使用的方式：`npm run build -- --modules=moduleA moduleB`

> 2.2 使用yargs的命令行参数传入

>> 通过npm脚本我们已经可以将我们需要的modules参数传入到我们开始运行的build.js代码中了，接下来我们就要通过yargs来获取到modules参数所传入的值，这里的值是`moduleA、moduleB`，直接贴上我们获取参数的代码：
```
// utils.js文件
// 引入yargs模块
const yargs = require('yargs')
/**
 * 获取 命令行传入的参数
 */
const args = yargs.array('modules').argv
// 这里如果没有传入modules参数则默认打包全部的模块
const modules = args.modules || ['moduleA', 'moduleB', 'moduleC']
// 我们将的到modules导出，以备其他模块使用
exports.bundleModules = modules
```
通过以上步骤我们就完成了参数的传递，可以通过命令行参数完成我们想要打包的模块。

### 3、入口处理

> 在vue-cli的默认入口中，是单入口应用的配置，所以我们需要修改为多入口的entry，根据webpack的文档，多入口配置采用的是对象的写法。我们在utils.js文件中通过方法生成entry，代码如下：
```
// utils.js
exports.entires = function () {
  // 模块主目录
  const BASE_PATH = path.resolve(__dirname, '..\\src\\modules')
  // 最终的返回结果
  let entriesMap = {}
  // 得到所有模块的主入口
  modules.forEach(item => {
    entriesMap[item] = BASE_PATH + '\\' + item + '\\main.js'
  })
  // 最终横撑的entriesMap是一个对象，key为模块的名称，这个名称可以作为output中[name]占位符的值，也是很重要的
  return entriesMap
}
```
这样我们就能通过modules得到我们需要打包的入口函数，接着我们将webpack.base.conf.js文件中的entry替换成我们生成的多入口形式，代码如下
```
// webpack.base.conf.js
module.exports = {
  context: path.resolve(__dirname, '../'),
  // 此处替换成我们自己的entry
  entry: utils.entires(),
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  }
  // ...
}
```
这样我们就处理好了入口处的webpack配置

### 4、出口处理
> vue-cli生成的webpack配置中，通过npm run build命令进行的打包配置文件，出口配置在webpack.prod.conf.js文件中，在这里的output配置我们只需要修改打包生成的文件路径，代码如下：
```
// webpack.prod.conf.js
output: {
	path: config.build.assetsRoot,
	// 默认的配置，这里是将打包好的文件统一放在assets/js文件夹下面
	// filename: utils.assetsPath('js/[name].[chunkhash].js'),
	// 修改后的配置，这里的[name]就是入口处的占位符，放到我们这里来说就分别是 moduleA|moduleB|moduleC，所以这里我们这么配置就是将不同的模块文件打包到各自的模块名称的js文件夹下
	filename: path.posix.join('[name]/js', '[name].[chunkhash].js'),
	// 这里是异步模块，就是上一篇中说的async打包模块，这里的[name]占位符是vue-router中配置的异步路由名称
	chunkFilename: utils.assetsPath('[name]/[id].[chunkhash].js')
}
```

### 5、最终
> 完成了本篇中的所有配置之后，再将上一篇中三个插件的配置全部添加到webpack.prod.conf.js文件中，我们就能完成多入口模块的打包。我们需要清楚一点，执行`npm run build` 和 `npm run dev`的区别。这两篇文章只是将build的代码实现了多入口的打包，我们并没有修改本地开发时的打包配置。下一篇文章我们会介绍一下前端多模块分布式发布时的打包配置，这个配置包含了本地开发环境的配置和build的配置。

> 完整版的代码仓库地址 [multipleModules](https://github.com/jxxbd91/multipleModules)

> 最后贴一张最终打包完成的目录图

