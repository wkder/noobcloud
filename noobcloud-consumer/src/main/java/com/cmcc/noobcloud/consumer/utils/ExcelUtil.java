package com.cmcc.noobcloud.consumer.utils;

import org.apache.poi.hssf.usermodel.*;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.List;
import java.util.Map;
import java.util.Set;


/**
 * @author Frank
 * @version 2.0
 * @date 2021/6/18 11:20
 **/
public class ExcelUtil {

    private static Logger logger = LoggerFactory.getLogger(ExcelUtil.class);

    public static HSSFWorkbook excelExport(String excelName, List<Map<String, Object>> list, HttpServletResponse response) {
        Map<String, Object> mapTop = list.get(0);
        Set<String> set = mapTop.keySet();
        String[] fields = new String[set.size()];
        for (String str : set) {
            String[] order = str.split("_");
            fields[Integer.parseInt(order[1])] = str;
        }
        // 创建workbook
        HSSFWorkbook workbook = new HSSFWorkbook();
        // 设置样式
        HSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(HSSFColor.HSSFColorPredefined.SKY_BLUE.getIndex());    //填充的背景颜色
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderLeft(BorderStyle.THIN);     //左边框
        style.setBorderRight(BorderStyle.THIN);    //右边框
        style.setBorderTop(BorderStyle.THIN);    //顶边框
        style.setBorderBottom(BorderStyle.THIN);    //顶边框
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        HSSFFont font = workbook.createFont();
        font.setFontName("宋体");
        font.setColor(HSSFColor.HSSFColorPredefined.BLACK.getIndex());
        font.setBold(true);
        font.setFontHeightInPoints((short) 10); // 字体
        style.setFont(font);

        // 创建sheet页
        HSSFSheet sheet = workbook.createSheet(excelName);
        HSSFRow row = sheet.createRow(0);
        for (int i = 0; i < fields.length; i++) {
            //创建单元格
            HSSFCell cell = row.createCell(i);
            cell.setCellValue(new HSSFRichTextString(fields[i].split("_")[0]));
            cell.setCellStyle(style);
        }
        // ----------------数据行--------------------------------------------
        if (null != list && list.size() > 0) {
            for (int i = 0; i < list.size(); i++) {
                Map<String, Object> rowData = list.get(i);
                HSSFRow temprow = sheet.createRow(i + 1);
                for (int j = 0; j < fields.length; j++) {
                    String value = "";
                    if (null != rowData.get(fields[j])) {
                        value = "" + rowData.get(fields[j]);
                    }
                    temprow.createCell(j).setCellValue(new HSSFRichTextString(value));
                    sheet.setColumnWidth(j, 4000);
                }
            }
            OutputStream out = null;
            try {
                out = response.getOutputStream();
                response.setContentType("application/vnd.ms-excel");
                excelName = URLEncoder.encode(excelName, "UTF-8");
                response.setHeader("content-disposition", "attachment;filename=" + excelName + ".xls");
                workbook.write(out);
            } catch (Exception e) {
                logger.error("导出数据异常：" + e.getMessage());
            } finally {
                if (out != null) {
                    try {
                        out.close();
                    } catch (IOException e) {
                        logger.error("导出数据异常：" + e.getMessage());
                    }
                }
            }
        }
        return workbook;
    }

}
