var YLupload = function(obj){
        return new YLupload.fn.init(obj);
    };

YLupload.fn = YLupload.prototype = {
    constructor: YLupload,
    /**
     * 构造器
     * @param  {Object} obj 配置参数
     * @return {Object}     YLupload
     */
    init: function(obj){
        this.up = 0; //上传总进度(0~1)
        this.load = 0; //加载总进度(0~1)
        this.opts = this.assign({},YLupload.defaults,obj);
        this.files = []; //待上传的文件
    },
    run: function(){
        var that = this;
        var opts = this.opts;
        if(opts.dropCell){
            opts.dropCell.addEventListener("dragover",function(e){
                e.stopPropagation();
                e.preventDefault();
                opts.dragenter(e);
            },false);

            opts.dropCell.addEventListener("dragleave",function(e){
                e.stopPropagation();
                opts.dragleave(e);
            },false);

            opts.dropCell.addEventListener("drop",function(e){
                e.preventDefault();
                opts.dragleave(e);
                that.getFiles(e);
                that.upload();
            },false);
        }

        if(opts.inputFile){
            opts.inputFile.addEventListener("change",function(e){},false);
        }

        return this;
    },
    upload: function(){
        var that = this,
            opts = this.opts,
            size = 0;

        
        for(var i = 0, file; file = this.files[i]; i++){
            // 文件总大小
            size += file.size;
            // 逐一上传
            (function(file){
                var xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("process",function(e){
                    opts.upProcess(file,e.loaded,e.total);
                },false);
                xhr.onreadystatechange = function(e){
                    if(xhr.readyState == 4){
                        if(xhr.status == 200){
                            opts.success(file,xhr.responseText);
                            that.deleteFile(file);
                            if (!that.files.length) { // 全部上传完成
                                opts.complete();
                            }
                        }else{
                            opts.fail(file,xhr.responseText);
                        }
                    }
                };
                xhr.open("POST", opts.url, true);
                xhr.setRequestHeader("FILENAME", encodeURIComponent(file.name));
                xhr.send(file);
            })(file);
        }
        
    },
    // 删除文件及回调
    deleteFile: function(fileDelete){
        var arrFile = [];
        for (var i = 0, file; file = this.files[i]; i++) {
            if (file != fileDelete) {
                arrFile.push(file);
            } else {
                // console.log(this.opts);
                this.opts.deleted(fileDelete);
            }
        }
        this.files = arrFile;
        return this;
    },
    // 获取文件与回调
    getFiles: function(e){
        var files = e.target.files || e.dataTransfer.files;
        for (var i = 0, file; file = files[i]; i++) {
            this.files.push(file);
        }
        this.opts.selected(files);
    }
};

YLupload.fn.init.prototype = YLupload.fn;
/**
 * 继承（拷贝）
 * @param  {Object} target  目标对象
 * @param  {Object} varArgs 源对象
 * @return {Object}         目标对象
 */
YLupload.assign = YLupload.fn.assign = function(target, varArgs){
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    var to = Object(target),
        nextSource = {},
        index = 1,
        len = arguments.length;
    // 参数只有一个时，拷贝到YLupload
    if(len == index){
        to = this;
        --index;
    }
    for (; index < len; index++) {
        nextSource = arguments[index];
        if (nextSource != null) { //跳过null参数
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) { //使用原型链方式筛选自身属性
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
    }
    return to;
};

YLupload.assign({
    /**
     * 默认参数配置
     * @param {Input file} inputFile file控件元素
     * @param {DOM}        dropCell  目标容器
     * @param {DOM}        upButton  上传按钮
     * @param {String}     url       文件上传地址
     * @param {String}     filter    文件类型筛选
     * @param {Function}   success   上传成功时的回调函数
     * @param {Function}   fail      上传失败时的回调函数
     * @param {Function}   complete  上传完成时的回调函数
     */
    defaults: {
        inputFile: null,
        dropCell: null,
        upButton: null,
        url: "",
        filter: "/",
        success: function(){},
        fail: function(){},
        complete: function(){},
        dragenter: function(){},
        dragleave: function(){},
        selected: function(){},
        upProcess:function(){},
        deleted: function(){}
    }
});

