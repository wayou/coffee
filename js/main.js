var order = {
    totalCount: 0,
    totalBill: 0,
    data: []
};

var fromSideClick = false;
var userData;
var locationData;

$(function() {
    init();

    $(window).scroll(sticky_relocate);
    sticky_relocate();

});

function sticky_relocate() {

    var window_top = $(window).scrollTop();
    var div_top = $('.sidebar').offset().top;

    // if (window_top > div_top) {
    //     if (!$('.sidebar').hasClass('stick')) {
    //         $('.sidebar').addClass('stick');
    //     }
    // } else {
    //     $('.sidebar').removeClass('stick');
    // }
    if (window_top >= 148) {
        if (!$('.sidebar').hasClass('stick')) {
            $('.sidebar').addClass('stick');
            $('.banner').addClass('top');
        }
    } else {
        $('.sidebar').removeClass('stick');
        $('.banner').removeClass('top');
    }

    //如果是点击左侧菜单，则不对滚动事件做响应
    if (fromSideClick) return;

    $('.sidebar a').each(function() {
        var currLink = $(this);
        var refElement = $(currLink.data("category"));
        if (refElement.position().top <= window_top + 50) {
            $('.sidebar li').removeClass("active");
            currLink.parents('li').addClass("active");
        } else {
            if ($(this).parent().find('.media-body').html() != $('.sidebar li').first().find('.media-body').html()) {
                currLink.parents('li').removeClass("active");
            }else{
                //fix 快速到顶部第一个菜单未选中
                $('.sidebar li').first().addClass("active");
            }
        }
    });

}

function init() {

    $('#removeAll').hide();
    //侧边菜单
    $('.sidebar li').on('click', function() {

        fromSideClick = true;
        // $(window).unbind('scroll');
        $('.sidebar li').removeClass('active');
        $(this).addClass('active');

        $('body').stop().animate({
            scrollTop: $($(this).find('a').data('category')).offset().top
        }, 400, function() {
            fromSideClick = false;
        });
    });
    //默认高亮第一个
    $('.sidebar li').first().addClass('active');

    //删除
    $('.remove').on('click', function() {

        var $container = $(this).parents('.table-view-cell.media'),
            $priceContainer = $container.find('.list-head'),

            id = $container.data('id');

        $priceContainer.find('.order-count').hide();

        var index = getIndexById(id);
        if (index > -1) {
            //从总数中羞减去
            var tempOrder = order.data[index];
            var countToBeRemove = 0;
            var moneyToBeRemove = 0;
            tempOrder.counts.forEach(function(v, i) {
                countToBeRemove += v.count;
                moneyToBeRemove += v.price * v.count;
            });
            order.totalCount = order.totalCount - countToBeRemove;

            order.totalBill = order.totalBill - moneyToBeRemove;

            order.data.splice(index, 1);

            //显示到页面
            $('#count').html(order.totalCount);
            $('#money').html(order.totalBill);
        }

        $(this).hide();

    });

    //删除全部
    $('#removeAll').on('click', function() {
        order.data = [];
        order.totalCount = 0;
        order.totalBill = 0;

        $('.list-op .btn.remove').hide();
        $('.order-count').html('').hide();
        $('#count').html(0);
        $('#money').html(0);
    });

    //添加
    $('.price').on('click', function() {
        var $container = $(this).parents('.table-view-cell.media'),
            $priceContainer = $container.find('.list-head'),

            id = $container.data('id'),
            name = $container.find('.good-title').html(),
            type = $(this).data('type'),
            price = $(this).data('price'),
            sinleOrder;

        //添加到订单
        order.totalCount += 1;
        order.totalBill += +price;

        //id为一个产品唯一标识，先去找是否已经添加过该商品，如果找到，更新其信息，如果未找到，添加到订单
        var index = getIndexById(id);
        if (index > -1) {
            sinleOrder = order.data[index];
            order.data[index].counts.forEach(function(v, i) {
                if (v.type == type) {
                    v.count += 1;
                }
            });
            $priceContainer.find('.' + type).show().find('span').html(order.data[index][type]);
        } else {

            var tempOrder = {
                id: id,
                name: name,
                counts: []
            };

            //保存单价信息
            $(this).parents('.list-op').find('.btn.price').each(function() {
                tempOrder.counts.push({
                    type: $(this).data('type'),
                    count: type == $(this).data('type') ? 1 : 0,
                    price: $(this).data('price')
                });
            });

            order.data.push(tempOrder);

            sinleOrder = tempOrder;

        }

        //显示到页面
        $('#count').html(order.totalCount);
        $('#money').html(order.totalBill);

        //显示选择的商品
        var result = '';
        sinleOrder.counts.forEach(function(v, i) {
            if (v.count != 0) {
                result += v.type + '<span>' + v.count + '</span>';
            }
        });
        $priceContainer.find('.order-count').html(result).show();

        //显示删除按钮
        $(this).parents('.list-op').find('.btn.remove').show();

        //显示总删除按钮
        $('#removeAll').show();

    });

    //选择完毕
    $('#checkout').on('click', function() {
        $('#index-navbar,#index-view,.sidebar').hide();
        $('#checkout-navbar,#checkout-view').show();

        //展示清单
        $('#bill-list').find('.item-row').remove();
        var tableContent = '';
        order.data.forEach(function(v, i) {
            var orderDetail = '';
            var orderMoney = 0;
            v.counts.forEach(function(v2, i2) {
                if (v2.count != 0) {
                    orderMoney += v2.count * v2.price;
                    orderDetail += v2.type + '<span class="money">' + v2.count + '</span>';
                }
            });

            tableContent += '<tr class="item-row">' +
                '<td>' + v.name + '</td>' +
                '<td>' + orderDetail + '</td>' +
                '<td><span class="money">￥' + orderMoney + '</span></td>' +
                '</tr>';
        });
        $(tableContent).insertBefore($('#bill-list .money-row'));
        $('#bill-sum').html('￥' + order.totalBill);

        $('#money2').html(order.totalBill);

        //回填表单和下拉框
        if (userData) {
            fillForm(userData);
        } else {
            if ($('#building').val() == '建外SOHO东区') {
                $('#east').show();
                $('#east').removeAttr('disabled');
                // $('#east').val(userData.floor);
                $('#west').hide();
                $('#west').attr('disabled', 'disabled');
            } else {
                $('#east').hide();
                $('#east').attr('disabled', 'disabled');
                // $('#west').val(userData.floor);
                $('#west').show();
                $('#west').removeAttr('disabled');
            }

            //获取用户信息
            //----------------更改这里------------------
            // $.get('url',{wechat_code:'xxxx'},function(res){
            //     userData=res||{};
            //     fillForm(res);
            // });
        }

        if (!locationData) {
            //获取楼层信息
            //----------------更改这里,请楼层信息生成到页面------------------
            $.get('url', function(res) {
                locationData = res || {};

                var buildingOptions = '';
                res.forEach(function(v, i) {
                    buildingOptions += '<option value="' + Object.keys(v)[0] + '">'
                    Object.keys(v)[0] + '</option>';
                });

                //先清空
                $('#building').html('');
                $('#building').append(buildingOptions);

                //显示第一个楼的楼层
                var floorOptions = '';
                res[0][Object.keys(res[0])[0]].forEach(function(v, i) {
                    floorOptions += '<option value="' + v + '">' + v + '</option>';
                });

                //先清空
                $('#floor').html('');
                $('#floor').append(floorOptions);

            });
        }

        $('#building').change(function() {

            //待删除
            if ($(this).val() == '建外SOHO东区') {
                $('#west').hide();
                $('#west').attr('disabled', 'disabled');
                $('#east').show();
                $('#east').removeAttr('disabled');
            } else {
                $('#east').hide();
                $('#east').attr('disabled', 'disabled');
                $('#west').removeAttr('disabled');
                $('#west').show();
            }

            //根据第一个的选择来设置第二个下拉框
            var selectedBuilding = '';
            locationData.forEach(function(v, i) {
                if (Object.keys(v)[0] == $(this).val()) {
                    selectedBuilding = v;
                }
            });

            selectedBuilding[$(this).val()].forEach(function(v, i) {
                var floorOptions = '';
                res[0][Object.keys(res[0])[0]].forEach(function(v, i) {
                    floorOptions += '<option value="' + v + '">' + v + '</option>';
                });

                //先清空
                $('#floor').html('');
                $('#floor').append(floorOptions);
            });

        });

    });

    //返回
    $('#back').on('click', function() {
        $('#index-navbar,#index-view,.sidebar').show();
        $('#checkout-navbar,#checkout-view').hide();

        //修复有的机型返回后左边菜单位置不对
        $('.sidebar').removeClass('stick');

    });

    //下单按钮
    $('#submit').on('click', function() {
        var data = {
            order: order,
            user: $('#user-form').serializeArray()
        };
        $.post('url', data, function() {
            alert('下单成功');
        });
    });
}

function fillForm(data) {
    if (!data) return;
    $('#username').val(userData.username);
    $('#phone').val(userData.phone);
    $('#addr').val(userData.addr);
    $('#note').val(userData.note);
    $('#building').val(userData.building);
    //显示正确的下拉框
    if ($('#building').val() == '建外SOHO东区') {
        $('#east').show();
        $('#east').val(userData.floor);
        $('#west').hide();
    } else {
        $('#east').hide();
        $('#west').val(userData.floor);
        $('#west').show();
    }
}

function getIndexById(id) {
    var index = -1;
    order.data.forEach(function(v, i) {
        if (v.id == id) {
            index = i;
        }
    });
    return index;
}

//初始化选中某个商品
//@param id 商品id
//@param detail 选中详情,为数组，包含这种id的商品下面每种类型选中的数量
//示例 [{type:'小',count:1,price:12},{type:'大',count:2,price:12}]  会选中1个小分和2个大分
function preSelect(id, name, detail) {
    $('.list .table-view-cell.media').each(function(i, ele) {
        if ($(this).data('id') == id) {

            $container = $(this);

            detail.forEach(function(v) {
                order.totalBill += v.price * v.count;
                order.totalCount += v.count;
            });

            order.data.push({
                id: id,
                name: name,
                counts: detail
            });

            //显示选择的商品
            var result = '';
            detail.forEach(function(v, i) {
                if (v.count !== 0) {
                    result += v.type + '<span>' + v.count + '</span>';
                }
            });
            $container.find('.order-count').html(result).show();

            //显示删除按钮
            $container.find('.btn.remove').show();

        }
    });

    //显示到页面
    $('#count').html(order.totalCount);
    $('#money').html(order.totalBill);

    //显示总删除按钮
    $('#removeAll').show();

}