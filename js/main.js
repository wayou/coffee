var order = {
    totalCount: 0,
    totalBill: 0,
    data: []
};

var fromSideClick = false;

$(function() {
    init();

    $('#index-view').scroll(sticky_relocate);
    sticky_relocate();

});

function sticky_relocate() {

    //如果是点击左侧菜单，则不对滚动事件做响应
    if (fromSideClick) return;

    var window_top = $('#index-view').scrollTop();
    var div_top = $('.sidebar').offset().top;
    // if (window_top > div_top) {
    //     if (!$('.sidebar').hasClass('stick')) {
    //         $('.sidebar').addClass('stick');
    //     }
    // } else {
    //     $('.sidebar').removeClass('stick');
    // }
    if (window_top >= 150) {
        if (!$('.sidebar').hasClass('stick')) {
            $('.sidebar').addClass('stick');
        }
    } else {
        $('.sidebar').removeClass('stick');
    }

    var scrollPos = $('#index-view').scrollTop();
    $('.sidebar a').each(function() {
        var currLink = $(this);
        var refElement = $(currLink.data("category"));
        // if (refElement.position().top <= scrollPos) {
        //     $('.sidebar li').removeClass("active");
        //     currLink.parents('li').addClass("active");
        // } else {
        //     currLink.parents('li').removeClass("active");
        // }
        if (refElement.position().top <= 30) {
            $('.sidebar li').removeClass("active");
            currLink.parents('li').addClass("active");
        } else {
            currLink.parents('li').removeClass("active");
        }
    });
}

function init() {
    //侧边菜单
    $('.sidebar li').on('click', function() {
        fromSideClick = true;
        $(this).addClass('active').siblings().removeClass('active');
        //跳到相应分类
        window.location.hash = '';
        window.location.hash = $(this).find('a').data('category');
        setTimeout(function() {
            var window_top = $('#index-view').scrollTop();
            var div_top = $('.sidebar').offset().top;
            if (window_top >= 150) {
                if (!$('.sidebar').hasClass('stick')) {
                    $('.sidebar').addClass('stick');
                }
            } else {
                $('.sidebar').removeClass('stick');
            }
            fromSideClick = false;
        });
    });

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

        //显示正确的下拉框
        if ($('#building').val() == '建外SOHO东区') {
            $('#west').hide();
            $('#east').show();
        } else {
            $('#east').hide();
            $('#west').show();
        }

        $('#building').change(function() {
            console.log($(this).val());
            if ($(this).val() == '建外SOHO东区') {
                $('#west').hide();
                $('#east').show();
            } else {
                $('#east').hide();
                $('#west').show();
            }
        });

    });

    //返回
    $('#back').on('click', function() {
        $('#index-navbar,#index-view,.sidebar').show();
        $('#checkout-navbar,#checkout-view').hide();
    });

    //下单按钮
    $('#submit').on('click', function() {
        var data = {
            order: order,
            user: $('#user-form').serializeArray()
        };
        // $.post('url',JSON.stringify(data), function() {
        //     alert('下单成功');
        // });
        $.post('url', data, function() {
            alert('下单成功');
        });
    });

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