package com.cmcc.noobcloud.networkservice.utils;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class FileUtil {

    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new FileReader(
                    "F:/JSNJ-NGN-CE35-HWNE40EX8202108102046513.txt"));
            String line = reader.readLine();
            while (line != null) {
                System.out.println(line);
                // read next line
                line = reader.readLine();
            }
            reader.close();
    }

}
