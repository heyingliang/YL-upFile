# YL-upFile

## 参数列表
|  参数 | 默认值 | 说明 |
| :---: | :----: |:---:| 
| inputFile | null | DOM，file控件元素
| dropCell | null | DOM，目标容器
| upButton | null | DOM，上传按钮
| url | "" | 文件上传地址
| filter | "/" | 文件类型筛选
| autoUp | false | 是否立即上传
| success | function(){} | 上传成功时运行
| fail | function(){} | 上传失败时运行
| complete | function(){} | 文件全部上传完成时运行
| dragenter | function(){} | 进入目标容器时运行
| dragleave | function(){} | 离开目标容器时运行
| selected | function(){} | 文件选择后运行
| upProcess | function(){} | 正在上传时运行
| deleted | function(){} | 缓存文件被删除时运行（当一个文件上传成功时即删除缓存）

