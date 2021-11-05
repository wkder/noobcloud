package com.cmcc.noobcloud.goodservice.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.util.logging.Logger;

/**
 * Created by Frank on 2018/8/11.
 */
@Configuration
@MapperScan(basePackages = {"com.cmcc.noobcloud.goodservice.mapper.firstDataSourse"},sqlSessionFactoryRef = "sqlSessionFactoryFirst")
public class FirstDataSouceConfig {

    private Logger log = Logger.getLogger(FirstDataSouceConfig.class.getName());

    @Autowired
    @Qualifier("firstDataSource")
    private DataSource firstDataSource;

    @Bean
    public SqlSessionFactory sqlSessionFactoryFirst(){
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(firstDataSource);
        try {
            return sqlSessionFactoryBean.getObject();
        } catch (Exception e) {
            log.info(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Bean
    public SqlSessionTemplate sqlSessionTemplateFirst(){
        SqlSessionTemplate sqlSessionTemplateFirst = new SqlSessionTemplate(sqlSessionFactoryFirst());
        return sqlSessionTemplateFirst;
    }

}
