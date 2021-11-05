/**
 * Created by gloomysw on 2017/02/16.
 */

/**
 * 百度地图启动方法
 * 创建人:邵炜
 * 创建时间:2017年2月16日09:31:39
 */
function baiduMapRun(data) {
    var dataObj={
        divId:"",// 地图实例化元素ID
        isMapScrollDrag:true,// 地图是否支持拖拽
        positioningCity:"",// 地图初始化定位城市
        searchListElementId:"",// 地图搜索结果集合赋值元素ID名称
        isMarkerDrag:true,// 地图搜索打点是否支持拖拽
        onClickRBICallBack:null,// 地图描点点击回调事件
        onDraggingCallBack:null,// 地图描点拖拽事件
        isOpenClickAddMarker:false, // 是否默认开启地图点击打点
        isClearSearchMarker:false, // 是否默认搜索后删除地图打点
        changeTitleEmptyMessage:null // 地图打点如果没有时回调提示信息
    };
    var isMapAddoverlay=false;
    for (var key in data){
        dataObj[key]=data[key];
    }
    // 初始化地图对象
    var map=new BMap.Map(dataObj.divId);
    // 初始化后地址定位城市
    map.centerAndZoom(dataObj.positioningCity);
    // 使地图支持拖拽
    if (dataObj.isMapScrollDrag) {
        map.enableScrollWheelZoom(dataObj.isMapScrollDrag);
    }else{
        map.disableDragging();     //禁止拖拽
    }
    // 地图搜索初始化元素
    var local=new BMap.LocalSearch(map,{
        renderOptions:{
            map:map, // 地图搜索结果打点存放元素
            selectFirstResult:true
        },
        // 地图搜索后的回调事件 markArray为地图打点元素集合
        onMarkersSet:function (markArray) {
            if (dataObj.changeTitleEmptyMessage){
                dataObj.changeTitleEmptyMessage(markArray.length);
            }
            markArray.forEach(function(item,index){
                if (index != 0) {
                    return true;
                }
                if(dataObj.isMarkerDrag){
                    item.marker.enableDragging();// 打点元素支持拖拽
                }
               clickRBIFunc(item.marker);
               draggingRBIFunc(item.marker);
            });
        },
        // 地图设置添加标注后的回调函数
        onInfoHtmlSet:function(arrayList){
            if (dataObj.isClearSearchMarker) {
                dataObj.isClearSearchMarker=!dataObj.isClearSearchMarker;
                dataObj.clearResults();
            }else{
                map.getOverlays().forEach(function(item,index){
                    map.removeOverlay(item);
                    if (index===0){
                        var marker = new BMap.Marker(new BMap.Point(item.point.lng, item.point.lat));
                        if(dataObj.isMarkerDrag){
                            marker.enableDragging();// 打点元素支持拖拽
                        }
                        map.addOverlay(marker);
                        clickRBIFunc(marker);
                        draggingRBIFunc(marker);
                        if (marker.U&&marker.U.click) {
                            marker.U.click();
                        }
                        if (marker.V&&marker.V.click) {
                            marker.V.click();
                        }
                    }
                });
            }
        }
    });

    /**
     * 地图描点拖拽事件
     * 创建人:邵炜
     * 创建时间:2017年2月16日15:27:25
     * @param marker 描点元素对象
     */
    function draggingRBIFunc(marker) {
        // 打点元素拖拽回调事件
        marker.addEventListener("dragging",function(e){
            if (dataObj.onDraggingCallBack){
                dataObj.onDraggingCallBack(e);
            }
        });
    }

    /**
     * 地图打点点击事件
     * 创建人:邵炜
     * 创建时间:2017年2月16日15:26:09
     * @param marker 描点元素对象
     * @constructor
     */
    function clickRBIFunc(marker) {
        //  打点元素点击回调事件
        marker.addEventListener("click",function(e){
            if (dataObj.onClickRBICallBack){
                dataObj.onClickRBICallBack(e);
            }
        });
    }

    /**
     * 地图搜索
     * 创建人:邵炜
     * 创建时间:2017年2月16日15:10:12
     * @param searchName 需要搜索的名称
     */
    dataObj.search=function(searchName){
        dataObj.clearOverlays();
        if (!searchName) {
            searchName=dataObj.positioningCity;
        }
       return local.search(searchName);
    };

    // 判断是否开启地图点击打点
    if (dataObj.isOpenClickAddMarker){
        map.addEventListener("click", function (e) {
            var marker = new BMap.Marker(new BMap.Point(e.point.lng, e.point.lat)); // 创建点
            clickRBIFunc(marker);
            draggingRBIFunc(marker);
            map.addOverlay(marker);    // 增加点
            if (dataObj.onClickRBICallBack){
                dataObj.onClickRBICallBack(e);
            }
        });
    }
    
    var myGeo=new BMap.Geocoder();

    /**
     * 根据地图坐标反查城市地区
     * 创建人:邵炜
     * 创建时间:2017年2月17日10:54:23
     * @param lng 经度
     * @param lat 维度
     * @param callBack 回调函数
     */
    dataObj.getLocation=function(lng,lat,callBack){
        if (!lng||!lat){
            return;
        }
        if (typeof lng === "string") {
            lng=parseFloat(lng);
        }
        if (typeof lat === "string") {
            lat=parseFloat(lat);
        }
        myGeo.getLocation(new BMap.Point(lng,lat),callBack);
    };

    /**
     * 在地图设置打点位置
     * 创建人:邵炜
     * 创建时间:2017年2月19日17:54:52
     * @param lng 经度
     * @param lat 纬度
     */
    dataObj.setLocationArea=function(lng,lat){
        if (!lng||!lat){
            return;
        }
        dataObj.clearOverlays();
        if (typeof lng === "string") {
            lng=parseFloat(lng);
        }
        if (typeof lat === "string") {
            lat=parseFloat(lat);
        }
        var point = new BMap.Point(lng, lat);
      var marker=  new BMap.Marker(point);
        if (dataObj.isMarkerDrag) {
            // 打点元素支持拖拽
            marker.enableDragging();
        }
        clickRBIFunc(marker);
        draggingRBIFunc(marker);
        map.addOverlay(marker);    //增加点
        if (marker.U&&marker.U.click) {
            marker.U.click();
        }
        if (marker.V&&marker.V.click) {
            marker.V.click();
        }
        setTimeout(function(){
            dataObj.centerAndZoom(lng,lat);
        },1000);
    };

    /**
     * 设置地图中心点位置
     * 创建人:邵炜
     * 创建时间:2017年2月20日20:27:29
     * @param lng 经度
     * @param lat 纬度
     */
    dataObj.centerAndZoom=function(lng,lat){
        if (!lng||!lat){
            return;
        }
        if (typeof lng === "string") {
            lng=parseFloat(lng);
        }
        if (typeof lat === "string") {
            lat=parseFloat(lat);
        }
        var point = new BMap.Point(lng, lat);
        map.centerAndZoom(point, 15);
    };

    /**
     * 地图清除打点数据
     * 创建人:邵炜
     * 创建时间:2017年2月21日20:27:52
     */
    dataObj.clearOverlays=function (marker) {
        if (marker) {
            map.removeOverlay(marker);
        }else{
            map.clearOverlays();
        }
    };

    /**
     * 清除搜索结果
     * 创建人:邵炜
     * 创建时间:2017年2月22日10:58:42
     */
    dataObj.clearResults=function () {
        local.clearResults();
    };

    /**
     * 地图初始化
     * 创建人:邵炜
     * 创建时间:2017年3月9日20:28:58
     */
    dataObj.reset=function () {
      //map.reset();
        document.getElementById(dataObj.divId).innerHTML='';
       return new baiduMapRun(dataObj)
    };

    return dataObj;
}