/**
 * YLfile v1.1
 * author 何莹亮
 * date 2017/11/18
 */
(function(window){
    "use strict";
    /* 闭包优化 */
    var window = window,
        document = window.document;
/*------------- 内置方法 --------------------*/

/**
 * 获取模板（缓存模板）
 * 解析模板
 * 返回页面
 */

var _uid = 0;

/*------------- 插件主体 -----------------*/
    var YLfile = function(obj){
            return new YLfile.fn.init(obj);
        };

    YLfile.fn = YLfile.prototype = {
        constructor : YLfile,

        /* 构造器 */
        init : function(obj){
            this.up = 0; // 上传总进度(0~1)
            this.load = 0; // 加载总进度(0~1)
            this.files = []; // 待上传的文件组
            this.$paper = obj.paper ? document.querySelector(obj.paper) : null;
            this.$drop = obj.dropCell ? this.$paper.querySelector(obj.dropCell) : null;
            this.$filesBtn = obj.filesButton ? this.$paper.querySelector(obj.filesButton) : null;
            this.$preview = obj.showCell ? this.$paper.querySelector(obj.showCell) : null;
        },

        /* 监听 */
        listen : function(callback){
            var that = this;
            var drop = this.$drop;
            var filesBtn = this.$filesBtn;

            drop && (
                drop.addEventListener('dragover', function(e){
                    e.preventDefault();
                    that._justoneID = 1;
                }, false),

                drop.addEventListener("dragleave",function(e){
                    e.stopPropagation();

                     //修复离开子元素会触发事件的bug 
                    !drop.contains(e.relatedTarget) && (that._justoneID = 0);

                },false),

                drop.addEventListener("drop",function(e){
                    e.preventDefault();

                    that._justoneID = 0; // 标记离开$drop
                    that.getFiles(e); // 获取文件
                    that.autoUp && that.upload(); //立即上传？

                },false)
            );

            // 文件按钮监听
            filesBtn && filesBtn.addEventListener("change", function(e){
                that.getFiles(e);
            }, false);

            return this;
        },

        /* 拖拽进入 */
        dragenter : function(callback){
            var that = this;
            this.$drop && this.$drop.addEventListener('dragenter', function(e){
                !that._justoneID && callback();
            }, false);
        },

        /* 拖拽离开 */
        dragleave : function(callback){
            var that = this;
            this.$drop.addEventListener('dragleave', function(e){
                !e.currentTarget.contains(e.relatedTarget) && callback();
            }, false);
        },

        /* 拖拽放下 */
        drop : function(callback){
            var that = this;
            this.$drop.addEventListener('drop', function(e){
                callback({cache : that.files, current : e.dataTransfer.files})
            }, false);
        },

        /* 上传 */
        upload: function(){
            var that = this;
            var opts = this.opts;
            var amount = 0;
            var current = 0;
            
            opts.readyUp(this.files);

            for(var i = 0, file; file = this.files[i]; i++){
                // 文件总大小
                amount += file.size;
                // 逐一上传
                (function(file){
                    var xhr = new XMLHttpRequest();
                    // 上传过程
                    xhr.upload.addEventListener("progress", function(e){
                        that.up = ((current + e.loaded) / amount).toFixed(4);
                        opts.upProcess(file,e.loaded,e.total);
                    },false);
                    // 上传结束
                    xhr.upload.addEventListener("loadend",function(e){
                        
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

        /* 删除文件 */
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

        /* 获取文件 */
        getFiles: function(e){
            var files = e.target.files || e.dataTransfer.files;
            for (var i = 0, file; file = files[i]; i++) {
                file.index = i;
                this.files.push(file);
            }
            // this.opts.selected(this.files);

            // this.opts.autoUp && this.upload();  // 立即上传？
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
        var to = Object(target);
        var nextSource = {};
        var index = 1;
        var len = arguments.length;
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
        /* 节流 */
        throttle: function(){
            var isClear = arguments[0];
            var fn;
            var param;
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
                YLfile.throttle(true, fn); //递归

                fn._throttleID = setTimeout(function(){
                    fn.apply(p.context, p.args);
                }, p.time);
            }
        }

    });

    var Mediator = function(){
        var cache = {};
        return {
            register : function(type, node, tpl){
                (typeof cache[type] === 'undefined') && (cache[type] = []);
                cache[type].push({
                    node : node,
                    tpl : tpl
                });
            },
            send : function(that, type){
                if(cache[type]){
                    for (var i = 0; i < cache[type].length; i++) {
                        console.log(cache[type][i]);
                        that.render(cache[type][i]);
                    }
                }
            }
        };
    }();
    /* MVVM */
    YLfile.MVVM = function(opt){
        this.mod = document.querySelector(opt.el);
        this.data = opt.data || {};
        this.renderDom(this.mod);
        this.monitor(opt.data);
    }
    /* 模板 */
    YLfile.MVVM.prototype = {
        init : {
            sTag : '{{',
            eTag : '}}'
        },
        render : function(el, flg){
            // 是否为发布状态下解析
            var node = el.node || el;
            var tpl = el.tpl || node.textContent;

            var self = this;
            var reg = new RegExp(self.init.sTag + '(\\w\+)' + self.init.eTag, 'g');
            node.textContent = tpl.replace(reg, function(match, p1){
                flg && Mediator.register(p1, node, tpl); // 是否订阅？注：只在模板解析时进行订阅
                return self.data[p1] ? self.data[p1] : '';
            });
        },
        renderDom : function(dom){
            var self = this;
            var attrs = dom.attributes;
            var nodes = dom.childNodes;
            Array.prototype.forEach.call(attrs, function(item){
                self.render(item, true);
            });
            Array.prototype.forEach.call(nodes, function(item){
                if(item.nodeType === 1){
                    return self.renderDom(item);
                }
                self.render(item, true);
            });
        },
        defined : function(obj, key){
            var self = this;
            var value = obj[key];
            Object.defineProperty(obj, key, {
                enumerable : true,
                get : function(){
                    return value;
                },
                set : function(newvalue){
                    // 递归出口
                    if(value == newvalue){
                        return;
                    }
                    // 赋值
                    value = newvalue;
                    // console.log(self.render);
                    Mediator.send(self,key);
                }
            });
        },
        monitor : function(obj){
            for(var key in obj){
                this.defined(obj, key);
            }
            console.log(obj);
        }
    };

    window.YLfile = YLfile;
})(this);
