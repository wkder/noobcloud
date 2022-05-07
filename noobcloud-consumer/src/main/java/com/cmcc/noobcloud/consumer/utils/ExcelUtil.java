package com.cmcc.noobcloud.consumer.utils;

import org.apache.poi.hssf.usermodel.*;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;


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

    /*public static List<Map<String, Object>> importExcel(File file, String sheetName) throws IOException, InvalidFormatException {
        String name = file.getName();
        Workbook workbook = null;
        List<Map<String, Object>> list = new ArrayList<>();
        try (InputStream is = new FileInputStream(file)) {
            // 创建excel操作对象
            if (name.contains(".xlsx") || name.contains(".xls")) {
                //使用工厂方法创建.
                workbook = WorkbookFactory.create(is);
            }
            Sheet sheet = workbook.getSheet(sheetName);
            //获得数据的总行数
            int totalRowNum = sheet.getLastRowNum();
            //获得总列数
            int cellLength = sheet.getRow(0).getPhysicalNumberOfCells();
            //获取表头
            Row firstRow = sheet.getRow(0);
            List<String> keys = new ArrayList<>();
            for (int i = 0; i < cellLength; i++) {
                Cell cell = firstRow.getCell(i);
                keys.add(String.valueOf(getCellValue(cell)));
            }
            //从第i行开始获取
            for (int i = 1; i <= totalRowNum; i++) {
                Map<String, Object> map = new LinkedHashMap<>();
                //获得第i行对象
                Row row = sheet.getRow(i);
                // 遇到空行则结束
                if (row == null) {
                    break;
                }
                //如果一行里的所有单元格都为空则不放进list里面
                int a = 0;
                for (int j = 0; j < cellLength; j++) {
                    Cell cell = row.getCell(j);
                    if (cell == null) {
                        continue;
                    }
                    // 获取列值
                    Object value = getCellValue(cell);
                    map.put(keys.get(j), value);
                }
                if (!checkNullMap(map)) {
                    list.add(map);
                }
            }
        } finally {
            if (workbook != null) {
                workbook.close();
            }
        }
        return list;
    }

    //如果map存储的value都是null返回true
    private static boolean checkNullMap(Map<String, Object> map) {
        for (Object value : map.values()) {
            if (Objects.nonNull(value))
                return false;
        }
        return true;
    }

    private static Object getCellValue(Cell cell) {
        CellType cellType = cell.getCellType();
        Object cellValue = null;

        if (cellType == CellType._NONE) {
            cellValue = null;
        } else if (cellType == CellType.NUMERIC) {
            // 数值型
            if (DateUtil.isCellDateFormatted(cell)) {
                // 日期类型
                Date d = cell.getDateCellValue();
                cellValue = dateTimeFormatter.format(LocalDateTime.ofInstant(d.toInstant(), ZoneId.systemDefault()));
            } else {
                double numericCellValue = cell.getNumericCellValue();
                BigDecimal bdVal = new BigDecimal(numericCellValue);
                if ((bdVal + ".0").equals(Double.toString(numericCellValue))) {
                    // 整型
                    cellValue = bdVal;
                } else if (String.valueOf(numericCellValue).contains("E10")) {
                    // 科学记数法
                    cellValue = new BigDecimal(numericCellValue).toPlainString();
                } else {
                    // 浮点型
                    cellValue = numericCellValue;
                }
            }
        } else if (cellType == CellType.STRING) {
            // 字符串型
            cellValue = cell.getStringCellValue();
            if (cellValue != null) {
                cellValue = cellValue.toString().trim();
            }
        } else if (cellType == CellType.FORMULA) {
            // 公式型
            cellValue = cell.getCellFormula();
        } else if (cellType == CellType.BLANK) {
            // 空值
            cellValue = "";
        } else if (cellType == CellType.BOOLEAN) {
            // 布尔型
            cellValue = cell.getBooleanCellValue();
        } else if (cellType == CellType.ERROR) {
            // 错误
            cellValue = cell.getErrorCellValue();
        }

        logger.info("cellType={}, cellValue={}", cellType.name(), cellValue);
        return cellValue;
    }*/

}
