# YL-upFile

## 参数列表
|  参数 | 默认值 | 说明 |
| :---: | :----: |:---:| 
| paper | ".paper" | 功能包裹层（CSS选择器，如：".paper>div"）注：仅选择第一个匹配项
| filesButton | "" | file控件按钮（CSS选择器）
| dropCell | "" | 目标容器（CSS选择器）
| showCell | "" | 预览容器（CSS选择器）
| upButton | "" | 上传按钮（CSS选择器）
| url | "" | 文件上传地址（例："www.demo.com/upload.php"）
| filter | "/" | 文件类型筛选（例："image"、"png"）
| autoUp | false | 是否立即上传
| success | function(response){} | 上传成功时运行
| fail | function(response){} | 上传失败时运行
| complete | function(){} | 文件全部上传完成时运行
| dragenter | function(){} | 进入目标容器时运行
| dragleave | function(){} | 离开目标容器时运行
| selected | function(files){} | 文件选择后运行
| upProcess | function(file,loaded,total){} | 正在上传时运行
| deleted | function(file){} | 缓存文件被删除时运行（当一个文件上传成功时即删除缓存）
| readyUp | funtion(files){} | 上传就绪

