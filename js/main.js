var order = {
    totalCount: 0,
    totalBill: 0,
    data: []
};

$(function() {
    init();
});

function init() {
    //侧边菜单
    $('.sidebar li').on('click', function() {
        $(this).addClass('active').siblings().removeClass('active');
        //跳到相应分类
        window.location.hash = '';
        window.location.hash = $(this).find('a').data('category');
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
            order.totalCount = order.totalCount - tempOrder.small - tempOrder.middle - tempOrder.big;
            order.totalBill = order.totalBill - tempOrder.small * tempOrder.smallPrice - tempOrder.middle * tempOrder.middlePrice - tempOrder.big * tempOrder.bigPrice;

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
            price = $(this).data('price');

        //添加到订单
        order.totalCount += 1;
        order.totalBill += +price;

        //id为一个产品唯一标识，先去找是否已经添加过该商品，如果找到，更新其信息，如果未找到，添加到订单
        var index = getIndexById(id);
        if (index > -1) {
            order.data[index][type] += 1;
            $priceContainer.find('.' + type).show().find('span').html(order.data[index][type]);
        } else {

            var tempOrder = {
                id: id,
                name: name,
                small: 0,
                smallPrice: 0,
                middle: 0,
                middlePrice: 0,
                big: 0,
                bigPrice: 0
            };

            //保存单价信息
            $(this).parents('.list-op').find('.btn.price').each(function() {
                var type = $(this).data('type');
                tempOrder[type + 'Price'] = $(this).data('price');
            });

            switch (type) {
                case 'small':
                    tempOrder.small = 1;
                    $priceContainer.find('.small').show().find('span').html(1);
                    break;
                case 'middle':
                    tempOrder.middle = 1;
                    $priceContainer.find('.middle').show().find('span').html(1);
                    break;
                case 'big':
                    tempOrder.big = 1;
                    $priceContainer.find('.big').show().find('span').html(1);
                    break;
            }

            order.data.push(tempOrder);

        }

        //显示到页面
        $('#count').html(order.totalCount);
        $('#money').html(order.totalBill);

        //显示删除按钮
        $(this).parents('.list-op').find('.btn.remove').show();

    });

    //选择完毕
    $('#checkout').on('click', function() {
        $('#index-navbar,#index-view').hide();
        $('#checkout-navbar,#checkout-view').show();

        //展示清单
        $('#bill-list').find('.item-row').remove();
        var tableContent = '';
        order.data.forEach(function(v, i) {
            tableContent += '<tr class="item-row">' +
                '<td>' + v.name + '</td>' +
                '<td>小 <span class="money">' + v.small + '</span> 中 <span class="money">' + v.middle + '</span> 大 <span class="money">' + v.big + '</span> </td>' +
                '<td><span class="money">￥' + (v.small * v.smallPrice + v.middle * v.middlePrice + v.big * v.bigPrice) + '</span></td>' +
                '</tr>';
        });
        $(tableContent).insertBefore($('#bill-list .money-row'));
        $('#bill-sum').html('￥' + order.totalBill);
    });

    //返回
    $('#back').on('click', function() {
        $('#index-navbar,#index-view').show();
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
        $.post('url',data, function() {
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