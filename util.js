/**
 *  动态加载css、js后执行方法
 * @param file 需要加载的js或者css
 * @param cb 加载后的回调
 * @returns {loadFiles}
 */
function loadFiles( file, cb ) {
    var isCss = /\.css$/,
        isJs = /\.js$/,
        origin = window.location.origin;
    if(isCss.test(file)) {
        var ele = crateElement("link", {
            type:'text/css',
            rel: 'stylesheet',
            href: origin + file,
            load: function () {
                cb && cb();
            }

        });
        document.head.appendChild(ele)
    } else if ( isJs.test(file)) {
        var ele = crateElement("script", {
            type:'text/javascript',
            src: origin + file,
            load: function () {
                cb && cb();
            }
        })
        document.body.append(ele)
    }else {
        throw new Error(file + "是无法识别的类型的外部文件");
    }
    return this
}

/**
 *
 * @param eleName 创建类型（'link','script'）
 * @param param 创建的元素的属性（‘src’，‘href’，‘load’）
 * @returns {HTMLAnchorElement | HTMLAppletElement | HTMLAreaElement | HTMLAudioElement | HTMLBaseElement | HTMLBaseFontElement | HTMLQuoteElement | HTMLBodyElement | HTMLBRElement | HTMLButtonElement | HTMLCanvasElement | HTMLTableCaptionElement | HTMLTableColElement | HTMLTableColElement | HTMLDataElement | HTMLDataListElement | HTMLModElement | HTMLDirectoryElement | HTMLDivElement | HTMLDListElement | HTMLEmbedElement | HTMLFieldSetElement | HTMLFontElement | HTMLFormElement | HTMLFrameElement | HTMLFrameSetElement | HTMLHeadingElement | HTMLHeadingElement | HTMLHeadingElement | HTMLHeadingElement | HTMLHeadingElement | HTMLHeadingElement | HTMLHeadElement | HTMLHRElement | HTMLHtmlElement | HTMLIFrameElement | HTMLImageElement | HTMLInputElement | HTMLModElement | HTMLUnknownElement | HTMLLabelElement | HTMLLegendElement | HTMLLIElement | HTMLLinkElement | HTMLPreElement | HTMLMapElement | HTMLMarqueeElement | HTMLMenuElement | HTMLMetaElement | HTMLMeterElement | HTMLUnknownElement | HTMLObjectElement | HTMLOListElement | HTMLOptGroupElement | HTMLOptionElement | HTMLOutputElement | HTMLParagraphElement | HTMLParamElement | HTMLPictureElement | HTMLPreElement | HTMLProgressElement | HTMLQuoteElement | HTMLScriptElement | HTMLSelectElement | HTMLSourceElement | HTMLSpanElement | HTMLStyleElement | HTMLTableElement | HTMLTableSectionElement | HTMLTableDataCellElement | HTMLTemplateElement | HTMLTextAreaElement | HTMLTableSectionElement | HTMLTableHeaderCellElement | HTMLTableSectionElement | HTMLTimeElement | HTMLTitleElement | HTMLTableRowElement | HTMLTrackElement | HTMLUListElement | HTMLVideoElement | MSHTMLWebViewElement | HTMLPreElement}
 */
function crateElement( eleName, param ) {
    var ele = document.createElement( eleName );
    if(param) {
        for( var i in param) {
            if( i=='load'){
                ele.onload = param[i]
            } else {
                ele[i] = param[i]
            }
        }
    };
    return ele;
}

/**
 *  获取get请求地址上的参数
 * @param name 参数名
 * @returns {*} 参数值
 * @constructor
 */
function getQueryString(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  decodeURI(r[2]); return null;
}


/**
 * ajax操作  默认 （ post  120秒 异步）
 * @param o  传入ajax的参数和回调
 * @param limitTime   请求接口时间
 */
function ajaxHandle(o, limitTime ) {
    if ($(o.lock).hasClass('btnLock')) {
        return;
    }
    $(o.lock).addClass('btnLock');
    $.ajax({
        type: o.type? o.type: 'POST',
        url: o.url,
        data: o.data,
        async: o.async ? o.async : true,
        timeout: limitTime || 120000,
        success: function ( res ) {
            _res = typeof res == 'object' ? res : $.parseJSON(res);

            if (o.lock) {
                $(o.lock).removeClass('btnLock');
            }

            if (_res.code > 0) {
                var err = _res.error;
                if (Array.isArray(err) && err.length > 0) {
                    layer.msg(err[0].value)
                } else {
                    layer.msg(res.msg);
                }
            } else {
                //成功回调
                o.callback && o.callback( _res );
            }
        },
        error: function (err_msg) {
            var tipsTxt,
                online = window.navigator.onLine;

            if (err_msg.statusText == "timeout") {
                tipsTxt = "请求超时!";
            } else {
                tipsTxt = "系统错误!";
            }

            if (online) {
               layer.msg(tipsTxt);
            } else {
                layer.msg('哎呀，网络好像有问题，请检查网络连接！')
            }
            if (o.lock) {
                $(o.lock).removeClass('btnLock');
            }
        }
    })

}


/**
 * layui layer的弹出框
 * @param errormsg 弹出信息
 * @param errorType 弹框类型  msg(默认) open confirm
 * @param cb confir类型的确认回调 （取消回调在opts下的cb2）
 * @param opts object  opts.title 提示头    tops.cb2 confirm的取消回调   tops.btn  confirm的按钮
 */
function tipHandle(errormsg, errorType, cb, opts) {
    //alert:layer.open提示
    //tip:layer.msg提示
    //comfirm:layer.confirm提示
    var opts = opts || {};
    var _type = errorType || 'msg';
    var _title = opts.title || "提示信息";
    var btn = opts.btn || ["确定", "取消"];
    var cb2=opts.cb2;
    switch (_type) {
        case 'msg':
            layer.msg(errormsg);
            break;
        case 'confirm':
            layer.confirm(errormsg, {
                btn: btn
            }, function () {
                layer.closeAll();
                if (typeof cb === 'function') {
                    cb();
                }
            },function(){
                layer.closeAll();
                if (typeof cb2 === 'function') {
                    cb2();
                }
            });
            break;
        case 'open':
            layer.open({
                title: _title,
                content: errormsg
            });
            break;
        default:
            layer.open({
                title: "xxxxxxxxxx",
                content: "tipHandle方法第二个参数错误（弹框类型）"
            });

    }

};

var promiseAjax = function (o) {
    return new Promise(function ( resolve, reject ) {
        $.ajax({
            url: o.url,
            type: o.type || "post",
            dataType: "json",
            data: o.data,
            success: function (res) {
                if(res.code){
                    // xxxxx
                    reject(xxx)
                }
                o.callback && o.callback( res );
                resolve(res);
            },
            error: function (res) {
                reject(res);
            }
        })
    })
};


return {
    loadFiles:loadFiles, // 动态加载css、js后执行方法
    crateElement:crateElement, // 创建类型（'link','script'）
    getQueryString:getQueryString, // 获取get请求地址上的参数
    ajaxHandle:ajaxHandle, //ajax操作
    tipHandle:tipHandle ,// layer的弹出框
    promiseAjax:promiseAjax, // ajax的promise
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 * @param o 接口参数和回调
 * @param limitTime 请求最大时间120
 * @returns {string}  ajax的返回数据
 */
function ajaxHandle(o, limitTime ) {
    if ($(o.lock).hasClass('btnLock')) {
        return;
    }
    $(o.lock).addClass('btnLock');

    var returnRes = '';

    $.ajax({
        type: o.type? o.type: 'POST',
        url: o.url,
        data: o.data,
        async: o.async,
        timeout: limitTime || 120000,
        success: function ( res ) {
            returnRes =  res;
            _res = typeof res == 'object' ? res : $.parseJSON(res);

            if (_res.code > 0) {
                if (o.lock) {
                    $(o.lock).removeClass('btnLock');
                }
                var err = _res.error;
                if (Array.isArray(err) && err.length > 0) {
                    layer.msg(err[0].value)
                } else {
                    layer.msg(res.msg);
                }
            } else {
                //成功回调
                o.callback && o.callback( _res );
            }
        },
        error: function (err_msg) {
            var tipsTxt,
                online = window.navigator.onLine;

            if (err_msg.statusText == "timeout") {
                tipsTxt = "请求超时!";
            } else {
                tipsTxt = "系统错误!";
            }

            if (online) {
                layer.msg(tipsTxt);
            } else {
                layer.msg('哎呀，网络好像有问题，请检查网络连接！')
            }
            if (o.lock) {
                $(o.lock).removeClass('btnLock');
            }
        }
    });
    return returnRes;
}

/**
 *
 * @param o ajax请求的参数和回调
 * @param column 分页一页显示几条数据 默认10
 * @param curr 建立分页是的初始页码
 * @constructor
 */
function OpenPagination( o, column, curr ) {
    o.async = false;
    var res = ajaxHandle(o),
        _curr = curr || 1,
        _column = column || 10;

    var total =  Math.ceil(res.data.total/_column);
    //实例化插件
    $(".M-box4").pagination({
        pageCount:total,
        current: _curr,
        jump:false,
        coping:true,
        isHide:false,
        homePage:"首页",
        endPage:"末页",
        prevCount:"上页" ,
        nextCount:"下页",
        callback: function(api) {
            o.data.page = api.getCurrent();
            ajaxHandle(o);
        }
    })
}
