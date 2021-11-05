package com.cmcc.noobcloud.networkservice.utils;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.sql.Date;
import java.util.*;

public class MapUtil {

    private static final String TOTAL_INFO = "合计:";

    private MapUtil() {
    }

    public static Map<String, Object> newHashMap() {
        return new HashMap<>();
    }

    /**
     * 将map转换为一个对象
     *
     * @param map
     * @param beanClass
     * @return
     * @throws Exception
     */
    public static Object map2Object(Map<String, Object> map, Class<?> beanClass) throws Exception {
        if (map == null)
            return null;

        Object obj = beanClass.newInstance();

        BeanInfo beanInfo = Introspector.getBeanInfo(obj.getClass());
        PropertyDescriptor[] propertyDescriptors = beanInfo.getPropertyDescriptors();
        for (PropertyDescriptor property : propertyDescriptors) {
            Method setter = property.getWriteMethod();
            if (setter != null) {
                setter.invoke(obj, map.get(property.getName()));
            }
        }

        return obj;
    }

    /**
     * 将对象转换为map
     *
     * @param obj
     * @return
     * @throws Exception
     */
    public static Map<String, Object> obj2Map(Object obj) {

        Map<String, Object> map = new HashMap();
        // 获取f对象对应类中的所有属性域
        Class clazz = obj.getClass();
        List<Field> fieldsList = new ArrayList();
        while (clazz != null) {  // 遍历所有父类字节码对象
            Field[] declaredFields = clazz.getDeclaredFields();
            fieldsList.addAll(Arrays.asList(declaredFields));  //将`Filed[]`数组转换为`List<>`然后再将其拼接至`ArrayList`上

            clazz = clazz.getSuperclass();  // 获得父类的字节码对象
        }

        for (int i = 0, len = fieldsList.size(); i < len; i++) {
            String varName = fieldsList.get(i).getName();
            try {
                // 获取原来的访问控制权限
                boolean accessFlag = fieldsList.get(i).isAccessible();
                // 修改访问控制权限
                fieldsList.get(i).setAccessible(true);
                // 获取在对象f中属性fields[i]对应的对象中的变量
                Object o = fieldsList.get(i).get(obj);
                if (o != null)
                    map.put(varName, o.toString());
                // System.out.println("传入的对象中包含一个如下的变量：" + varName + " = " + o);
                // 恢复访问控制权限
                fieldsList.get(i).setAccessible(accessFlag);
            } catch (IllegalArgumentException ex) {
                ex.printStackTrace();
            } catch (IllegalAccessException ex) {
                ex.printStackTrace();
            }
        }
        return map;
    }

    /**
     * 功能描述：转换LIST为String数组
     *
     * @param datas
     * @return 返回值
     * @throw 异常描述
     */
    public static String[] convertListToArray(List<Map<String, Object>> datas, boolean isTotal) {
        if (datas == null || datas.isEmpty()) {
            return new String[0];
        } else {
            String[] reportString = new String[datas.size()];
            int size = 0;
            StringBuilder sb = new StringBuilder();
            for (Map<String, Object> m : datas) {
                for (String key : m.keySet()) {
                    sb.append(getString(m, key)).append(",");
                }
                sb.append("\n");
                reportString[size] = sb.toString();
                sb.setLength(0);
                size++;
            }
            return addTotalInfoStr(datas, reportString, isTotal);
        }
    }

    /**
     * 功能描述：转换LIST为String数组(按照属性顺序)
     *
     * @param datas
     * @return 返回值
     * @throw 异常描述
     */
    public static String[] convertListToArray(List<Map<String, Object>> datas, boolean isTotal, String[] order) {
        if (datas == null || datas.isEmpty()) {
            return new String[0];
        } else {
            String[] reportString = new String[datas.size()];
            int size = 0;
            StringBuilder sb = new StringBuilder();
            for (Map<String, Object> m : datas) {
                for (int i = 0; i < order.length ; i++) {
                    sb.append(getString(m, order[i])).append(",");
                }
                sb.append("\n");
                reportString[size] = sb.toString();
                sb.setLength(0);
                size++;
            }
            return addTotalInfoStr(datas, reportString, isTotal);
        }
    }
    
    public static String[] addTotalInfoStr(List<Map<String, Object>> reportDataList, String[] reportStrDataArr,
                                           boolean isTotal) {
        int dataSize = reportDataList.size();
        if (isTotal) {
            reportStrDataArr[dataSize - 1] = TOTAL_INFO + reportStrDataArr[dataSize - 1];
        }
        return reportStrDataArr;
    }

    public static String getString(Map<String, Object> map, String key) {
        if (map == null || map.isEmpty()) {
            return null;
        }
        if (map.get(key) instanceof String || map.get(key) instanceof Number || map.get(key) instanceof Date) {
            return String.valueOf(map.get(key));
        }
        return null;
    }

}
