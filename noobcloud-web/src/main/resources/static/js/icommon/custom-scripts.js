/*------------------------------------------------------
 Author : www.webthemez.com
 License: Commons Attribution 3.0
 http://creativecommons.org/licenses/by/3.0/
 ---------------------------------------------------------  */

(function ($) {
    "use strict";
    var mainApp = {

        initFunction: function () {
            /*MENU 
             ------------------------------------*/
            $('#main-menu').metisMenu();

            $(window).bind("load resize", function () {
                if ($(this).width() < 768) {
                    $('div.sidebar-collapse').addClass('collapse')
                } else {
                    $('div.sidebar-collapse').removeClass('collapse')
                }
            });

            /* MORRIS BAR CHART
             -----------------------------------------*/
            Morris.Bar({
                element: 'morris-bar-chart',
                data: [{
                    y: '1月',
                    a: 100,
                    b: 90
                }, {
                    y: '2月',
                    a: 75,
                    b: 65
                }, {
                    y: '3月',
                    a: 50,
                    b: 40
                }, {
                    y: '4月',
                    a: 75,
                    b: 65
                }, {
                    y: '5月',
                    a: 50,
                    b: 40
                }, {
                    y: '6月',
                    a: 75,
                    b: 65
                }, {
                    y: '7月',
                    a: 100,
                    b: 90
                }],
                xkey: 'y',
                ykeys: ['a', 'b'],
                labels: ['3G用户', '4G用户'],
                barColors: [
                    '#A6A6A6', '#8ceab9',
                    '#A8E9DC'
                ],
                hideHover: 'auto',
                resize: true
            });




            /* MORRIS LINE CHART
             ----------------------------------------*/
            Morris.Line({
                element: 'morris-line-chart',
                data: [
                    { y: '2016年7月', a: 50, b: 90},
                    { y: '2016年8月', a: 165,  b: 185},
                    { y: '2016年9月', a: 150,  b: 130},
                    { y: '2016年10月', a: 175,  b: 160},
                    { y: '2016年11月', a: 80,  b: 65},
                    { y: '2016年12月', a: 90,  b: 70},
                    { y: '2017年1月', a: 100, b: 125},
                    { y: '2017年2月', a: 155, b: 175},
                    { y: '2017年3月', a: 80, b: 85},
                    { y: '2017年4月', a: 145, b: 155},
                    { y: '2017年5月', a: 160, b: 195}
                ],


                xkey: 'y',
                ykeys: ['a', 'b'],
                labels: ['CLV价值', 'ARPU值'],
                fillOpacity: 0.6,
                hideHover: 'auto',
                behaveLikeLine: true,
                resize: true,
                pointFillColors: ['#ffffff'],
                pointStrokeColors: ['black'],
                lineColors: ['gray', '#8ceab9']

            });


            $('.bar-chart').cssCharts({type: "bar"});
            $('.donut-chart').cssCharts({type: "donut"}).trigger('show-donut-chart');
            $('.line-chart').cssCharts({type: "line"});

            $('.pie-thychart').cssCharts({type: "pie"});


        },

        initialization: function () {
            mainApp.initFunction();

        }

    }
    // Initializing ///

    $(document).ready(function () {
        //$(".dropdown-button").dropdown();
        //$("#sideNav").click(function () {
        //    if ($(this).hasClass('closed')) {
        //        $('.navbar-side').animate({left: '0px'});
        //        $(this).removeClass('closed');
        //        $('#page-wrapper').animate({'margin-left': '260px'});
        //
        //    }
        //    else {
        //        $(this).addClass('closed');
        //        $('.navbar-side').animate({left: '-260px'});
        //        $('#page-wrapper').animate({'margin-left': '0px'});
        //    }
        //});

        mainApp.initFunction();
    });

    $(".dropdown-button").dropdown();

}(jQuery));
