/**
 * Bootstrap Search Suggest
 * @desc    ����һ������ bootstrap ��ťʽ�����˵����������������������ʹ���ڰ�ťʽ�����˵�����ϡ�
 * @author  renxia <lzwy0820#qq.com>
 * @link    https://github.com/lzwme/bootstrap-suggest-plugin.git
 * @since   2014-10-09 - 2016-07-14
 *===============================================================================
 * (c) Copyright 2015-2016 lzw.me. All Rights Reserved.
 ********************************************************************************/
(function($) {
    //���ڶ� IE �ļ����ж�
    var isIe = !!window.ActiveXObject || 'ActiveXObject' in window;
    /**
     * ������
     */
    function handleError(e1, e2) {
        if (!window.console || !window.console.trace) {
            return;
        }
        console.trace(e1);
        if (e2) {
            console.trace(e2);
        }
    }
    /**
     * ��ȡ��ǰtr�еĹؼ�������
     */
    function getPointKeyword($list) {
        var data = {};
        data.id = $list.attr('data-id');
        data.key = $list.attr('data-key');
        data.index = $list.attr('data-index');

        return data;
    }
    /**
     * ����ѡ�е�ֵ
     */
    function setValue($input, keywords, options) {
        if (!keywords || !keywords.key) {
            return;
        }

        var separator = options.separator || ',',
            inputValList /*, inputIdList*/ ;

        if (options && options.multiWord) { //��ؼ���֧�֣�ֻ���� val
            inputValList = $input.val().split(separator);
            inputValList[inputValList.length - 1] = keywords.key;
            /*inputIdList = $input.attr('data-id').split(separator);
            inputIdList[inputIdList.length - 1] = id;*/

            $input.val(inputValList.join(separator))
                //.attr('data-id', inputIdList.join(options.separator))
                .focus();
        } else {
            $input.attr('data-id', keywords.id).focus().val(keywords.key);
        }

        $input.trigger('onSetSelectValue', [keywords, (options.data.value || options._lastData.value)[keywords.index]]);
    }
    /**
     * ����ѡ��˵�λ��
     * @param {Object} $input
     * @param {Object} $dropdownMenu
     * @param {Object} options
     */
    function adjustDropMenuPos($input, $dropdownMenu, options) {
        if (!$dropdownMenu.is(':visible')) {
            return;
        }

        if (options.autoDropup) {
            setTimeout(function() {
                if ( //�Զ��жϲ˵�����չ��
                    ($(window).height() + $(window).scrollTop() - $input.offset().top) < $dropdownMenu.height() && //�������»�ų�ҳ��
                    $input.offset().top > ($dropdownMenu.height() + $(window).scrollTop()) //�������ϲ���ŵ�����
                ) {
                    $dropdownMenu.parents('.input-group').addClass('dropup');
                } else {
                    $dropdownMenu.parents('.input-group.dropup').removeClass('dropup');
                }
            }, 10);
        }

        //�б���뷽ʽ
        var dmcss;
        if (options.listAlign === 'left') {
            dmcss = {
                'left': $input.siblings('div').width() - $input.parent().width(),
                'right': 'auto'
            };
        } else if (options.listAlign === 'right') {
            dmcss = {
                'left': 'auto',
                'right': '0'
            };
        }

        //ie �£�����ʾ��ťʱ�� top/bottom
        if (isIe && !options.showBtn) {
            if (!$dropdownMenu.parents('.input-group').hasClass('dropup')) {
                dmcss.top = $input.parent().height();
                dmcss.bottom = 'auto';
            } else {
                dmcss.top = 'auto';
                dmcss.bottom = $input.parent().height();
            }
        }

        //�Ƿ��Զ���С���
        if (options.autoMinWidth === false) {
            dmcss['min-width'] = $input.parent().width();
        }
        /* else {
            dmcss['width'] = 'auto';
        }*/

        $dropdownMenu.css(dmcss);

        return $input;
    }
    /**
     * ��������򱳾�ɫ
     * �������� indexId���������� data-id Ϊ��ʱ���������ؾ���ɫ
     */
    function setBackground($input, options) {
        //console.log('setBackground', options);
        var inputbg, bg, warnbg;

        if ((options.indexId === -1 && !options.idField) || options.multiWord) {
            return $input;
        }

        inputbg = $input.css('background-color').replace(/ /g, '').split(',', 3).join(',');
        //console.log(inputbg);
        bg = options.inputBgColor || 'rgba(255,255,255,0.1)';
        warnbg = options.inputWarnColor || 'rgba(255,255,0,0.1)';

        if ($input.attr('data-id')) {
            return $input.css('background', bg);
        }

        //������������ݣ����ñ���ɫ
        if (!~warnbg.indexOf(inputbg)) {
            $input.trigger('onUnsetSelectValue'); //����ȡ��data-id�¼�
            $input.css('background', warnbg);
        }

        return $input;
    }
    /**
     * ����������
     */
    function adjustScroll($input, $dropdownMenu, options) {
        //���ƻ�����
        var $hover = $input.parent().find('tbody tr.' + options.listHoverCSS),
            pos, maxHeight;
        if ($hover.length) {
            pos = ($hover.index() + 3) * $hover.height();
            maxHeight = Number($dropdownMenu.css('max-height').replace('px', ''));

            if (pos > maxHeight || $dropdownMenu.scrollTop() > maxHeight) {
                $dropdownMenu.scrollTop(pos - maxHeight);
            } else {
                $dropdownMenu.scrollTop(0);
            }
        }
    }
    /**
     * ��������б� hover ��ʽ
     */
    function unHoverAll($dropdownMenu, options) {
        $dropdownMenu.find('tr.' + options.listHoverCSS).removeClass(options.listHoverCSS);
    }
    /**
     * ��֤ $input �����Ƿ��������
     *   1. ����Ϊ bootstrap ����ʽ�˵�
     *   2. ����δ��ʼ����
     */
    function checkInput($input, options) {
        var $dropdownMenu = $input.parent('.input-group').find('ul.dropdown-menu'),
            data = $input.data('bsSuggest');

        //���˷� bootstrap ����ʽ�˵�����
        if (!$dropdownMenu.length) {
            return false;
        }

        //�Ƿ��Ѿ���ʼ���ļ��
        if (data) {
            return false;
        }

        $input.data('bsSuggest', {
            options: options
        });
        return true;
    }
    /**
     * ���ݸ�ʽ���
     * ��� ajax ���سɹ����ݻ� data ���������Ƿ���Ч
     * data ��ʽ��{"value": [{}, {}...]}
     */
    function checkData(data) {
        var isEmpty = true;
        for (var o in data) {
            if (o === 'value') {
                isEmpty = false;
                break;
            }
        }
        if (isEmpty) {
            handleError('�������ݸ�ʽ����!');
            return false;
        }
        if (!data.value.length) {
            //handleError('��������Ϊ��!');
            return false;
        }

        return data;
    }

    /**
     * �ж��ֶ����Ƿ��� options.effectiveFields ��������
     * @param  {String} field   Ҫ�жϵ��ֶ���
     * @param  {Object} options
     * @return {Boolean}        effectiveFields Ϊ��ʱʼ�շ��� true
     */
    function inEffectiveFields(field, options) {
        return !(field === '__index' ||
            $.isArray(options.effectiveFields) &&
            options.effectiveFields.length > 0 &&
            !~$.inArray(field, options.effectiveFields));
    }
    /**
     * �ж��ֶ����Ƿ��� options.searchFields �����ֶ�������
     */
    function inSearchFields(field, options) {
        return ~$.inArray(field, options.searchFields);
    }
    /**
     * �����б�ˢ��
     * ��Ϊ fnGetData �� callback ��������
     */
    function refreshDropMenu($input, data, options) {
        var $dropdownMenu = $input.parent().find('ul.dropdown-menu'),
            len, i, j, index = 0,
            tds,
            html = ['<table class="table table-condensed table-sm">'],
            idValue, keyValue; //��Ϊ����� data-id �����ݵ��ֶ�ֵ

        if (!data || !(len = data.value.length)) {
            $dropdownMenu.empty().hide();
            return $input;
        }

        //��ͬ���ݣ����ü�����Ⱦ��
        if (
            options._lastData &&
            JSON.stringify(options._lastData.value) === JSON.stringify(data.value) &&
            $dropdownMenu.find('tr').length === data.value.length
        ) {
            $dropdownMenu.show();
            adjustDropMenuPos($input, $dropdownMenu, options);
            return $input;
        }
        options._lastData = data;

        //���ɱ�ͷ
        if (options.showHeader) {
            html.push('<thead><tr>');
            for (j in data.value[0]) {
                if (inEffectiveFields(j, options) === false) {
                    continue;
                }

                if (index === 0) {
                    //��ͷ��һ�м�¼����
                    html.push('<th>' + (options.effectiveFieldsAlias[j] || j) + '(' + len + ')' + '</th>');
                } else {
                    html.push('<th>' + (options.effectiveFieldsAlias[j] || j) + '</th>');
                }

                index++;
            }
            html.push('</tr></thead>');
        }
        html.push('<tbody>');

        //console.log(data, len);
        //���м�����
        for (i = 0; i < len; i++) {
            index = 0;
            tds = [];
            idValue = data.value[i][options.idField] || '';
            keyValue = data.value[i][options.keyField] || '';

            for (j in data.value[i]) {
                //�����Ϊ value �� ��Ϊ id ��ֵ
                if (!keyValue && options.indexKey === index) {
                    keyValue = data.value[i][j];
                }
                if (!idValue && options.indexId === index) {
                    idValue = data.value[i][j];
                }

                index++;

                //������Ч�ֶ�
                if (inEffectiveFields(j, options) === false) {
                    continue;
                }

                tds.push('<td data-name="', j, '">', data.value[i][j], '</td>');
            }

            html.push('<tr data-index="', (data.value[i].__index || i), '" data-id="', idValue,
                '" data-key="', keyValue, '">', tds.join(''), '</tr>');
        }
        html.push('</tbody></table>');

        $dropdownMenu.html(html.join('')).show();

        //scrollbar ����ʱ������ padding����ʱ����������ʱ��ʼ
        setTimeout(function() {
            if (!isIe &&
                //$dropdownMenu.css('max-height') &&
                $dropdownMenu.height() < $dropdownMenu.find('table:eq(0)').height() &&
                Number($dropdownMenu.css('min-width').replace('px', '')) < $dropdownMenu.width()
            ) {
                $dropdownMenu.css('padding-right', '20px').find('table:eq(0)').css('margin-bottom', '20px');
            } else {
                $dropdownMenu.css('padding-right', 0).find('table:eq(0)').css('margin-bottom', 0);
            }
        }, 301);

        adjustDropMenuPos($input, $dropdownMenu, options);

        return $input;
    }
    /**
     * ajax ��ȡ����
     * @param  {Object} options
     * @return {Object}         $.Deferred
     */
    function ajax(options, keyword) {
        keyword = keyword || '';

        var ajaxParam = {
            type: 'GET',
            url: function() {
                var type = '?';

                if (/=$/.test(options.url)) {
                    type = '';
                } else if (/\?/.test(options.url)) {
                    type = '&';
                }

                return options.url + type + keyword;
            }(),
            dataType: options.jsonp ? 'jsonp' : 'json',
            timeout: 5000
        };

        //jsonp
        if (options.jsonp) {
            ajaxParam.jsonp = options.jsonp;
        }

        //�Զ��� ajax ����������ɷ���
        if ($.isFunction(options.fnAdjustAjaxParam)) {
            ajaxParam = $.extend(ajaxParam, options.fnAdjustAjaxParam(keyword, options));
        }

        return $.ajax(ajaxParam).done(function(result) {
            options.data = options.fnProcessData(result);
        }).fail(handleError);
    }
    /**
     * ��� keyword �� value �Ƿ���ڻ������
     * @param  {String}  keyword �û�����Ĺؼ���
     * @param  {String}  key     ƥ���ֶε� key
     * @param  {String}  value   key �ֶζ�Ӧ��ֵ
     * @param  {Object}  options
     * @return {Boolean}         ����/������
     */
    function isInWord(keyword, key, value, options) {
        value = $.trim(value);

        if (options.ignorecase) {
            keyword = keyword.toLocaleLowerCase();
            value = value.toLocaleLowerCase();
        }

        return value &&
            (inEffectiveFields(key, options) || inSearchFields(key, options)) &&
            (value.indexOf(keyword) !== -1 || keyword.indexOf(value) !== -1);
    }
    /**
     * ͨ�� ajax �� json ������ȡ����
     */
    function getData(keyword, $input, callback, options) {
        var data, validData, filterData = {
                value: []
            },
            i, key, len;

        keyword = keyword || '';
        //��ȡ����ǰ�Թؼ���Ԥ������
        if ($.isFunction(options.fnPreprocessKeyword)) {
            keyword = options.fnPreprocessKeyword(keyword, options);
        }

        //����url��������ӷ����� ajax ����
        //console.log(options.url + keyword);
        if (options.url) {
            ajax(options, keyword).done(function(result) {
                callback($input, options.data, options); //Ϊ refreshDropMenu
                $input.trigger('onDataRequestSuccess', result);
                if (options.getDataMethod === 'firstByUrl') {
                    options.url = null;
                }
            });
        } else {
            //û�и��� url ��������� data ������ȡ
            data = options.data;
            validData = checkData(data);
            //���ص� data ���ݣ����ڱ��ع���
            if (validData) {
                if (!keyword) {
                    filterData = data;
                } else {
                    //���벻Ϊ��ʱ�����ƥ��
                    len = data.value.length;
                    for (i = 0; i < len; i++) {
                        for (key in data.value[i]) {
                            if (
                                data.value[i][key] &&
                                isInWord(keyword, key, data.value[i][key] + '', options)
                            ) {
                                filterData.value.push(data.value[i]);
                                filterData.value[filterData.value.length - 1].__index = i;
                                break;
                            }
                        }
                    }
                }
            }

            callback($input, filterData, options);
        } //else
    }

    /**
     * ���ݴ���
     * url ��ȡ����ʱ�������ݵĴ�����Ϊ fnGetData ֮��Ļص�����
     */
    function processData(data) {
        return checkData(data);
    }
    /**
     * Ĭ�ϵ�����ѡ��
     * @type {Object}
     */
    var defaultOptions = {
        url: null,                      //�������ݵ� URL ��ַ
        jsonp: null,                    //���ô˲�������������jsonp���ܣ�����ʹ��json���ݽṹ
        data: {
            value: []
        },                              //��ʾ���õ����ݣ�ע���ʽ
        indexId: 0,                     //ÿ�����ݵĵڼ������ݣ���Ϊinput������ data-id����Ϊ -1 �� idField Ϊ�������ô�ֵ
        indexKey: 0,                    //ÿ�����ݵĵڼ������ݣ���Ϊinput����������
        idField: '',                    //ÿ�����ݵ��ĸ��ֶ���Ϊ data-id�����ȼ����� indexId ���ã��Ƽ���
        keyField: '',                   //ÿ�����ݵ��ĸ��ֶ���Ϊ��������ݣ����ȼ����� indexKey ���ã��Ƽ���

        /* ������� */
        autoSelect: true,               //��������/�·����ʱ���Ƿ��Զ�ѡ��ֵ
        allowNoKeyword: true,           //�Ƿ������޹ؼ���ʱ��������
        getDataMethod: 'firstByUrl',    //��ȡ���ݵķ�ʽ��url��һֱ��url����data���� options.data ��ȡ��firstByUrl����һ�δ�Url��ȡȫ�����ݣ�֮���options.data��ȡ
        delayUntilKeyup: false,         //��ȡ���ݵķ�ʽ Ϊ firstByUrl ʱ���Ƿ��ӳٵ�������ʱ����������
        ignorecase: false,              //ǰ������ƥ��ʱ���Ƿ���Դ�Сд
        effectiveFields: [],            //��Ч��ʾ���б��е��ֶΣ�����Ч�ֶζ�����ˣ�Ĭ��ȫ����
        effectiveFieldsAlias: {},       //��Ч�ֶεı����������� header ����ʾ
        searchFields: [],               //��Ч�����ֶΣ���ǰ��������������ʱʹ�ã�����һ����ʾ���б��С�effectiveFields �����ֶ�Ҳ��������������

        multiWord: false,               //�Էָ����ŷָ�Ķ�ؼ���֧��
        separator: ',',                 //��ؼ���֧��ʱ�ķָ�����Ĭ��Ϊ��Ƕ���

        /* UI */
        autoDropup: false,              //ѡ��˵��Ƿ��Զ��ж�����չ������Ϊ true���������˵��߶ȳ������壬�����Ϸ��򲻻ᱻ���帲�ǣ���ѡ��˵����ϵ���
        autoMinWidth: false,            //�Ƿ��Զ���С��ȣ���Ϊ false ����С��Ȳ�С���������
        showHeader: false,              //�Ƿ���ʾѡ���б�� header��Ϊ true ʱ����Ч�ֶδ���һ������ʾ��ͷ
        showBtn: true,                  //�Ƿ���ʾ������ť
        inputBgColor: '',               //����򱳾�ɫ��������������ɫ��ͬʱ��������Ҫ���������
        inputWarnColor: 'rgba(255,0,0,.1)', //��������ݲ��������б�ѡ��ʱ�ľ���ɫ
        listStyle: {
            'padding-top': 0,
            'max-height': '375px',
            'max-width': '800px',
            'overflow': 'auto',
            'width': 'auto',
            'transition': '0.3s',
            '-webkit-transition': '0.3s',
            '-moz-transition': '0.3s',
            '-o-transition': '0.3s'
        },                              //�б����ʽ����
        listAlign: 'left',              //��ʾ�б����λ�ã�left/right/auto
        listHoverStyle: 'background: #07d; color:#fff', //��ʾ���б������������ʽ
        listHoverCSS: 'jhover',         //��ʾ���б������������ʽ����

        /* key */
        keyLeft: 37,                    //�����������ͬ�Ĳ���ϵͳ���ܻ��в�������ж���
        keyUp: 38,                      //���Ϸ����
        keyRight: 39,                   //���ҷ����
        keyDown: 40,                    //���·����
        keyEnter: 13,                   //�س���

        /* methods */
        fnProcessData: processData,     //��ʽ�����ݵķ������������ݸ�ʽ�ο� data ����
        fnGetData: getData,             //��ȡ���ݵķ���������������һ�㲻������
        fnAdjustAjaxParam: null,        //���� ajax ����������������ڸ�����������������������ؼ�������һ�������޸ĳ�ʱʱ���
        fnPreprocessKeyword: null       //������������ǰ��������ؼ�������һ����������ע�⣬Ӧ�����ַ���
    };

    var methods = {
        init: function(options) {
            //��������
            var self = this;

            //Ĭ��������Ч��ʾ�ֶζ���һ��������ʾ�б��ͷ��������ʾ
            if (undefined === options.showHeader && options.effectiveFields && options.effectiveFields.length > 1) {
                options.showHeader = true;
            }

            options = $.extend(true, {}, defaultOptions, options);

            //�ɵķ�������
            if (options.processData) {
                options.fnProcessData = options.processData;
            }
            if (options.getData) {
                options.fnGetData = options.getData;
            }

            if (options.getDataMethod === 'firstByUrl' && options.url && !options.delayUntilKeyup) {
                ajax(options).done(function(result) {
                    options.url = null;
                    self.trigger('onDataRequestSuccess', result);
                });
            }

            //��껬������Ŀ��ʽ
            if (!$('#bsSuggest').length) {
                $('head:eq(0)').append('<style id="bsSuggest">.' + options.listHoverCSS + '{' + options.listHoverStyle + '}</style>');
            }

            return self.each(function() {
                var $input = $(this),
                    mouseenterDropdownMenu,
                    keyupTimer, //keyup �� input �¼���ʱ��ʱ��
                    $dropdownMenu = $input.parents('.input-group:eq(0)').find('ul.dropdown-menu');

                //��֤���������Ƿ��������
                if (checkInput($input, options) === false) {
                    console.warn('����һ����׼�� bootstrap ����ʽ�˵����ѳ�ʼ��:', $input);
                    return;
                }

                //�Ƿ���ʾ button ��ť
                if (!options.showBtn) {
                    $input.css('border-radius', '4px')
                        .parents('.input-group:eq(0)').css('width', '100%')
                        .find('.btn:eq(0)').hide();
                }

                //�Ƴ� disabled �࣬�������Զ����
                $input.removeClass('disabled').attr('disabled', false).attr('autocomplete', 'off');
                //dropdown-menu ��������
                $dropdownMenu.css(options.listStyle);

                //Ĭ�ϱ���ɫ
                if (!options.inputBgColor) {
                    options.inputBgColor = $input.css('background-color');
                }

                //��ʼ�¼�����
                $input.on('keydown', function(event) {
                    var currentList, tipsKeyword; //��ʾ�б��ϱ�ѡ�еĹؼ���
                    //console.log('input keydown');

                    //$input.attr('data-id', '');

                    //����ʾ����ʾʱ�ŶԼ����¼�����
                    if ($dropdownMenu.css('display') !== 'none') {
                        currentList = $dropdownMenu.find('.' + options.listHoverCSS);
                        tipsKeyword = ''; //��ʾ�б��ϱ�ѡ�еĹؼ���

                        if (event.keyCode === options.keyDown) {
                            //������������·����
                            if (!currentList.length) {
                                //�����ʾ�б�û��һ����ѡ��,���б��һ��ѡ��
                                tipsKeyword = getPointKeyword($dropdownMenu.find('table tbody tr:first').mouseover());
                            } else if (!currentList.next().length) {
                                //��������һ����ѡ��,��ȡ��ѡ��,������Ϊ�������ѡ�У����ָ������ֵ
                                unHoverAll($dropdownMenu, options);

                                if (options.autoSelect) {
                                    $input.val($input.attr('alt')).attr('data-id', '');
                                }
                            } else {
                                unHoverAll($dropdownMenu, options);
                                //ѡ����һ��
                                tipsKeyword = getPointKeyword(currentList.next().mouseover());
                            }
                            //���ƻ�����
                            adjustScroll($input, $dropdownMenu, options);

                            if (!options.autoSelect) {
                                return;
                            }
                        } else if (event.keyCode === options.keyUp) { //������������Ϸ����
                            if (!currentList.length) {
                                tipsKeyword = getPointKeyword($dropdownMenu.find('table tbody tr:last').mouseover());
                            } else if (!currentList.prev().length) {
                                unHoverAll($dropdownMenu, options);

                                if (options.autoSelect) {
                                    $input.val($input.attr('alt')).attr('data-id', '');
                                }
                            } else {
                                unHoverAll($dropdownMenu, options);
                                //ѡ��ǰһ��
                                tipsKeyword = getPointKeyword(currentList.prev().mouseover());
                            }

                            //���ƻ�����
                            adjustScroll($input, $dropdownMenu, options);

                            if (!options.autoSelect) {
                                return;
                            }
                        } else if (event.keyCode === options.keyEnter) {
                            tipsKeyword = getPointKeyword(currentList);
                            $dropdownMenu.hide().empty();
                        } else {
                            $input.attr('data-id', '');
                        }

                        //����ֵ tipsKeyword
                        //console.log(tipsKeyword);
                        setValue($input, tipsKeyword, options);
                    }
                }).on('keyup input', function(event) {
                    var word, words;

                    //�������ļ��ǻس������ϻ����·�����򷵻�
                    if (event.keyCode === options.keyDown || event.keyCode === options.keyUp || event.keyCode === options.keyEnter) {
                        $input.val($input.val()); //����������������
                        setBackground($input, options);
                        return;
                    } else if (event.keyCode) {
                        //$input.attr('data-id', '');
                        setBackground($input, options);
                    }

                    clearTimeout(keyupTimer);
                    keyupTimer = setTimeout(function() {
                        //console.log('input keyup', event);

                        word = $input.val();

                        //�������ֵû�иı���Ϊ���򷵻�
                        if ($.trim(word) !== '' && word === $input.attr('alt')) {
                            return;
                        }

                        //�����¼�֮ǰ��¼�����ֵ,�Է���鿴������ʱֵ��û�б�
                        $input.attr('alt', $input.val());

                        if (options.multiWord) {
                            words = word.split(options.separator);
                            word = words[words.length - 1];
                        }
                        //�Ƿ���������ݲ�ѯ
                        if (!word.length && !options.allowNoKeyword) {
                            return;
                        }

                        options.fnGetData($.trim(word), $input, refreshDropMenu, options);

                    }, 300);
                }).on('focus', function() {
                    //console.log('input focus');
                    adjustDropMenuPos($input, $dropdownMenu, options);
                }).on('blur', function() {
                    //console.log('blur');
                    if (!mouseenterDropdownMenu) { //���ǽ��������б�״̬���������б�
                        $dropdownMenu.css('display', '');
                    }
                }).on('click', function() {
                    //console.log('input click');
                    var word = $input.val(),
                        words;

                    if (
                        $.trim(word) !== '' &&
                        word === $input.attr('alt') &&
                        $dropdownMenu.find('table tr').length
                    ) {
                        return $dropdownMenu.show();
                    }

                    if ($dropdownMenu.css('display') !== 'none') {
                        return;
                    }

                    if (options.multiWord) {
                        words = word.split(options.separator);
                        word = words[words.length - 1];
                    }

                    //�Ƿ���������ݲ�ѯ
                    if (!word.length && !options.allowNoKeyword) {
                        return;
                    }

                    //console.log('word', word);
                    options.fnGetData($.trim(word), $input, refreshDropMenu, options);
                });

                //������ť���ʱ
                $input.parent().find('.btn:eq(0)').attr('data-toggle', '').on('click', function() {
                    /*var type = 'show';
                    if ($dropdownMenu.is(':visible')) {
                        type = 'hide';
                    }
                    $input.bsSuggest(type);

                    return false;*/

                    var display = 'none';
                    if ($dropdownMenu.css('display') === 'none') {
                        display = 'block';
                        if (options.url) {
                            $input.click().focus();
                            if (!$dropdownMenu.find('tr').length) {
                                display = 'none';
                            }
                        } else {
                            //���� keyword ��Ϊ���ˣ�չʾ���е�����
                            refreshDropMenu($input, options.data, options);
                        }
                    }

                    $dropdownMenu.css('display', display);
                    return false;
                });

                //�б��л���ʱ�������ʧȥ����
                $dropdownMenu.on('mouseenter', function() {
                        //console.log('mouseenter')
                        mouseenterDropdownMenu = 1;
                        $input.blur();
                        //$(this).show();
                    }).on('mouseleave', function() {
                        //console.log('mouseleave')
                        mouseenterDropdownMenu = 0;
                        $input.focus();
                    }).on('mouseenter', 'tbody tr', function() {
                        //���ϵ��ƶ��¼�
                        unHoverAll($dropdownMenu, options);
                        $(this).addClass(options.listHoverCSS);

                        return false; //��ֹð��
                    })
                    .on('mousedown', 'tbody tr', function() {
                        setValue($input, getPointKeyword($(this)), options);
                        setBackground($input, options);
                        $dropdownMenu.hide();
                    });
            });
        },
        show: function() {
            return this.each(function() {
                $(this).click();
            });
        },
        hide: function() {
            return this.each(function() {
                $(this).parent().find('ul.dropdown-menu').css('display', '');
            });
        },
        disable: function() {
            return this.each(function() {
                $(this).attr('disabled', true)
                    .parent().find('.btn:eq(0)').prop('disabled', true);
            });
        },
        enable: function() {
            return this.each(function() {
                $(this).attr('disabled', false)
                    .parent().find('.btn:eq(0)').prop('disabled', false);
            });
        },
        destroy: function() {
            return this.each(function() {
                $(this).off().removeData('bsSuggest').removeAttr('style')
                    .parent().find('.btn:eq(0)').off().attr('data-toggle', 'dropdown').prop('disabled', false) //.addClass('disabled');
                    .next().css('display', '').off();
            });
        },
        version: function() {
            return '0.1.8';
        }
    };

    $.fn.bsSuggest = function(options) {
        //�����ж�
        if (typeof options === 'string' && methods[options]) {
            var inited = true;
            this.each(function() {
                if (!$(this).data('bsSuggest')) {
                    return inited = false;
                }
            });
            //ֻҪ��һ��δ��ʼ������ȫ������ִ�з����������� init �� version
            if (!inited && 'init' !== options && 'version' !== options) {
                return false;
            }

            //����Ƿ������������һ��Ϊ���������ӵڶ�����ʼΪ��������
            return methods[options].apply(this, [].slice.call(arguments, 1));
        } else if (typeof options === 'object' || !options) {
            //���ó�ʼ������
            return methods.init.apply(this, arguments);
        }
    }
})(window.jQuery);
