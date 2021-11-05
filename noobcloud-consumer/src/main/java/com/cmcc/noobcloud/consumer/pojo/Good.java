package com.cmcc.noobcloud.consumer.pojo;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;

@Data
public class Good implements Serializable{

    private static final long serialVersionUID = -4749194389615395630L;
    /**
     * id
     */
    private Long id;
    /**
     * 商品编码
     */
    private String GOODS_CODE;
    /**
     * 图片URL
     */
    private String PICTURE_URL;
    /**
     * 公司编码
     */
    private String COMPANY_CODE;
    /**
     * 商品三级类目
     */
    private String GOODS_CATEGORY;
    /**
     * 商品三级类目名称
     */
    private String GOODS_CATEGORY_NAME;
    /**
     * 商品名称
     */
    private String GOODS_NAME;
    /**
     * 上架时间
     */
    private Date PUTON_TIME;
    /**
     * 销量
     */
    private Long SALES_VOLUME;
    /**
     * 浏览量
     */
    private Long PAGE_VIEW;
    /**
     * 0活动 1普通
     */
    private Integer TYPE;
    /**
     * 创建时间
     */
    private Date CREATE_TIME;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Good good = (Good) o;

        if (id != null ? !id.equals(good.id) : good.id != null) return false;
        if (GOODS_CODE != null ? !GOODS_CODE.equals(good.GOODS_CODE) : good.GOODS_CODE != null) return false;
        if (PICTURE_URL != null ? !PICTURE_URL.equals(good.PICTURE_URL) : good.PICTURE_URL != null) return false;
        if (COMPANY_CODE != null ? !COMPANY_CODE.equals(good.COMPANY_CODE) : good.COMPANY_CODE != null) return false;
        if (GOODS_CATEGORY != null ? !GOODS_CATEGORY.equals(good.GOODS_CATEGORY) : good.GOODS_CATEGORY != null)
            return false;
        if (GOODS_CATEGORY_NAME != null ? !GOODS_CATEGORY_NAME.equals(good.GOODS_CATEGORY_NAME) : good.GOODS_CATEGORY_NAME != null)
            return false;
        if (GOODS_NAME != null ? !GOODS_NAME.equals(good.GOODS_NAME) : good.GOODS_NAME != null) return false;
        if (PUTON_TIME != null ? !PUTON_TIME.equals(good.PUTON_TIME) : good.PUTON_TIME != null) return false;
        if (SALES_VOLUME != null ? !SALES_VOLUME.equals(good.SALES_VOLUME) : good.SALES_VOLUME != null) return false;
        if (PAGE_VIEW != null ? !PAGE_VIEW.equals(good.PAGE_VIEW) : good.PAGE_VIEW != null) return false;
        if (TYPE != null ? !TYPE.equals(good.TYPE) : good.TYPE != null) return false;
        return CREATE_TIME != null ? CREATE_TIME.equals(good.CREATE_TIME) : good.CREATE_TIME == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (GOODS_CODE != null ? GOODS_CODE.hashCode() : 0);
        result = 31 * result + (PICTURE_URL != null ? PICTURE_URL.hashCode() : 0);
        result = 31 * result + (COMPANY_CODE != null ? COMPANY_CODE.hashCode() : 0);
        result = 31 * result + (GOODS_CATEGORY != null ? GOODS_CATEGORY.hashCode() : 0);
        result = 31 * result + (GOODS_CATEGORY_NAME != null ? GOODS_CATEGORY_NAME.hashCode() : 0);
        result = 31 * result + (GOODS_NAME != null ? GOODS_NAME.hashCode() : 0);
        result = 31 * result + (PUTON_TIME != null ? PUTON_TIME.hashCode() : 0);
        result = 31 * result + (SALES_VOLUME != null ? SALES_VOLUME.hashCode() : 0);
        result = 31 * result + (PAGE_VIEW != null ? PAGE_VIEW.hashCode() : 0);
        result = 31 * result + (TYPE != null ? TYPE.hashCode() : 0);
        result = 31 * result + (CREATE_TIME != null ? CREATE_TIME.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Good{" +
                "id=" + id +
                ", GOODS_CODE='" + GOODS_CODE + '\'' +
                ", PICTURE_URL='" + PICTURE_URL + '\'' +
                ", COMPANY_CODE='" + COMPANY_CODE + '\'' +
                ", GOODS_CATEGORY='" + GOODS_CATEGORY + '\'' +
                ", GOODS_CATEGORY_NAME='" + GOODS_CATEGORY_NAME + '\'' +
                ", GOODS_NAME='" + GOODS_NAME + '\'' +
                ", PUTON_TIME=" + PUTON_TIME +
                ", SALES_VOLUME=" + SALES_VOLUME +
                ", PAGE_VIEW=" + PAGE_VIEW +
                ", TYPE=" + TYPE +
                ", CREATE_TIME=" + CREATE_TIME +
                '}';
    }
}
