/**
 * YLfile v1.0
 * author 何莹亮
 * date 2017/11/18
 */
(function(document){
    var document = document;
    var YLfile = function(obj){
            return new YLfile.fn.init(obj);
        };

    YLfile.fn = YLfile.prototype = {
        constructor: YLfile,
        /**
         * 构造器
         * @param  {Object} obj 配置参数
         * @return {Object}     YLfile
         */
        init: function(obj){
            this.up = 0; // 上传总进度(0~1)
            this.load = 0; // 加载总进度(0~1)
            this.opts = this.assign({},YLfile.defaults,obj); // 自定义参数覆盖默认
            this.files = []; // 待上传的文件组
            this.contain = this.opts.paper ? document.querySelector(this.opts.paper) : null;
        },
        run: function(callback){
            var that = this,
                opts = this.opts,
                drop = opts.dropCell ? this.contain.querySelector(opts.dropCell) : null,
                filesBtn = opts.filesButton ? this.contain.querySelector(opts.filesButton) : null;

            if(drop){
                drop.addEventListener("dragover",function(e){
                    e.stopPropagation();
                    e.preventDefault();

                    /* 修复重复执行的bug,模拟不冒泡的dragenter（从子元素移入不触发） */
                    if(!opts.dragenter._justoneID){
                        opts.dragenter();
                    }
                    opts.dragenter._justoneID = 1; 
                    
                },false);

                drop.addEventListener("dragleave",function(e){
                    e.stopPropagation();

                    /* 修复离开子元素会触发事件的bug */
                    !e.currentTarget.contains(e.relatedTarget) && (
                        opts.dragleave(), opts.dragenter._justoneID = 0
                    );

                },false);

                drop.addEventListener("drop",function(e){
                    e.preventDefault();

                    // 回调与获取文件
                    opts.dragleave();
                    that.getFiles(e);

                    opts.dragenter._justoneID = 0;
                },false);
            }

            filesBtn && filesBtn.addEventListener("change",function(e){that.getFiles(e)},false);

            callback && callback(this);
            return this;
        },
        upload: function(){
            var that = this,
                opts = this.opts,
                amount = 0,
                current = 0;
            
            opts.readyUp(this.files);

            for(var i = 0, file; file = this.files[i]; i++){
                // 文件总大小
                amount += file.size;
                // 逐一上传
                (function(file){
                    var xhr = new XMLHttpRequest();
                    xhr.addEventListener("progress", function(e){
                        that.up = ((current + e.loaded) / amount).toFixed(4);
                        opts.upProcess(file,e.loaded,e.total);
                    },false);

                    xhr.addEventListener("loadend",function(e){
                        
                    },false);

                    xhr.onreadystatechange = function(e){
                        if(xhr.readyState == 4){
                            if(xhr.status == 200){
                                current += file.size;
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
                    xhr.setRequestHeader("FILENAME", encodeURIComponent(file.name));  // 自定义请求头
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
                    this.opts.deleted(fileDelete);
                }
            }
            this.files = arrFile;
            return this;
        },
        /* 获取文件与回调 */
        getFiles: function(e){
            var files = e.target.files || e.dataTransfer.files;
            for (var i = 0, file; file = files[i]; i++) {
                file.index = i;
                this.files.push(file);
            }
            this.opts.selected(this.files);

            this.opts.autoUp && this.upload();  // 立即上传？
        }
    };

    YLfile.fn.init.prototype = YLfile.fn;
    /**
     * 继承（拷贝）
     * @param  {Object} target  目标对象
     * @param  {Object} varArgs 源对象
     * @return {Object}         目标对象
     */
    YLfile.assign = YLfile.fn.assign = function(target, varArgs){
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var to = Object(target),
            nextSource = {},
            index = 1,
            len = arguments.length;
        // 参数只有一个时，拷贝到YLfile
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

    YLfile.assign({
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
         * @param {Function}   dragenter 移入时回调
         */
        defaults: {
            paper: "",
            filesButton: "",
            dropCell: "",
            showCell: "",
            upButton: "",
            url: "",
            filter: "/",
            autoUp: false,
            success: function(response){},
            fail: function(response){},
            complete: function(){},
            dragenter: function(){},
            dragleave: function(){},
            selected: function(files){},
            upProcess: function(file,loaded,total){},
            deleted: function(file){},
            readyUp: function(files){}
        },
        throttle: function(){
            var isClear = arguments[0],
                fn,
                param;
            if (typeof isClear === 'boolean') {
                fn = arguments[1];
                fn._throttleID && clearTimeout(fn._throttleID)
            }else{
                fn = isClear;
                param = arguments[1];
                var p = YLfile.assign({
                    context: null,
                    args: [],
                    time: 300
                }, param);

                // arguments.callee(true, fn); // 严格模式下callee失效
                YLfile.throttle(true, fn);

                fn._throttleID = setTimeout(function(){
                    fn.apply(p.context, p.args);
                }, p.time);
            }
        }
    });

    window.YLfile = YLfile;
})(window.document);

