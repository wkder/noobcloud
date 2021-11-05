package com.cmcc.noobcloud.networkservice.utils;

public final class GeometryUtil {

    /**
     * 地球半径,单位 km
     */
    private static final double EARTH_RADIUS = 6378.137;

    /**
     * 根据经纬度，计算两点间的距离
     *
     * @param longitude1 第一个点的经度
     * @param latitude1  第一个点的纬度
     * @param longitude2 第二个点的经度
     * @param latitude2  第二个点的纬度
     * @return 返回距离 单位米
     */
    public static double getDistance(double longitude1, double latitude1, double longitude2, double latitude2) {
        // 纬度
        double lat1 = Math.toRadians(latitude1);
        double lat2 = Math.toRadians(latitude2);
        // 经度
        double lng1 = Math.toRadians(longitude1);
        double lng2 = Math.toRadians(longitude2);
        // 纬度之差
        double a = lat1 - lat2;
        // 经度之差
        double b = lng1 - lng2;
        // 计算两点距离的公式
        double s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(b / 2), 2)));
        // 弧长乘地球半径, 返回单位: 千米
        s =  s * EARTH_RADIUS;
        return s * 1000;
    }

    public static double[] MillierConvertion(double lat, double lon) {
        double L = 6381372 * Math.PI * 2;//地球周长
        double W=L;// 平面展开后，x轴等于周长
        double H=L/2;// y轴约等于周长一半
        double mill=2.3;// 米勒投影中的一个常数，范围大约在正负2.3之间
        double x = lon * Math.PI / 180;// 将经度从度数转换为弧度
        double y = lat * Math.PI / 180;// 将纬度从度数转换为弧度
        y=1.25 * Math.log( Math.tan( 0.25 * Math.PI + 0.4 * y ) );// 米勒投影的转换
        // 弧度转为实际距离
        x = ( W / 2 ) + ( W / (2 * Math.PI) ) * x;
        y = ( H / 2 ) - ( H / ( 2 * mill ) ) * y;
        double[] result=new double[2];
        result[0]=x;
        result[1]=y;
        return result;
    }

    public static double[] lngLat2Mercator(double lng, double lat) {
        double[] xy = new double[2];

        double x = lng * 20037508.342789 / 180;

        double y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);

        y = y * 20037508.34789 / 180;

        xy[0] = x;

        xy[1] = y;

        return xy;

    }

    public static double areaOfIntersectionOfCircles(double x1,double y1,double r1,double x2,double y2,double r2){
        double p,s;
        double ans;//表示相交的面积
        //表示两圆心之间的距离
        double len = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
        if(len >= r1+r2){//表示两圆不相交
            ans = 0;
        }else if(len <= Math.abs(r1-r2)){//包含了
            if(r1 < r2){
                ans = Math.PI*r1*r1;
            }else{
                ans = Math.PI*r2*r2;
            }
        }else{
            p = (len+r1+r2)/2;
            s = 2*Math.sqrt(p*(p-len)*(p-r1)*(p-r2));//海伦公式求四边形面积
            //余弦定理求扇形面积
            ans=Math.acos((r1*r1+len*len-r2*r2)/(2*r1*len))*r1*r1+Math.acos((r2*r2+len*len-r1*r1)/(2*r2*len))*r2*r2-s;
        }
        return ans;
    }
}