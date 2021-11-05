package com.cmcc.noobcloud.consumer.common;


import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 处理结果封装
 */
@Data
@NoArgsConstructor
public class ResultMsg<T> implements Serializable {

    public static final int STATUS_SUCCESS = 1;

    public static final int STATUS_ERROR = 0;

    private static final long serialVersionUID = -8279492231544167516L;


    /**
     * 执行结果状态码
     * 0：执行失败 、1：执行成功
     */
    private int status;

    /**
     * 执行结果提示信息
     */
    private String msg;

    /**
     * 执行结果数据
     */
    private T data;

    private ResultMsg(int status, String msg, T data) {
        this.status = status;
        this.msg = msg;
        this.data = data;
    }

    public int getStatus() {
        return status;
    }

    public String getMsg() {
        return msg;
    }

    public T getData() {
        return data;
    }

    public static <T> ResultMsg<T> buildErrorMsg(String msg, T data) {
        return new ResultMsg<T>(STATUS_ERROR, msg, data);
    }

    public static <T> ResultMsg<T> buildErrorMsg(T data) {
        return new ResultMsg<T>(STATUS_ERROR, null, data);
    }

    public static <T> ResultMsg<T> buildErrorMsg(String msg) {
        return new ResultMsg<T>(STATUS_ERROR, msg, null);
    }

    public static <T> ResultMsg<T> buildSuccessMsg(T data) {
        return new ResultMsg<T>(STATUS_SUCCESS, null, data);
    }

    public static <T> ResultMsg<T> buildSuccessMsg() {
        return new ResultMsg<T>(STATUS_SUCCESS, null, null);
    }

    public static <T> ResultMsg<T> buildSuccessMsg(String msg) {
        return new ResultMsg<T>(STATUS_SUCCESS, msg, null
        );
    }

    public static <T> ResultMsg<T> buildSuccessMsg(String msg,T data){
        return new ResultMsg<T>(STATUS_SUCCESS,msg,data);
    }
}
