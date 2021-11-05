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
@MapperScan(basePackages = {"com.cmcc.noobcloud.goodservice.mapper.secondDataSourse"},sqlSessionFactoryRef = "sqlSessionFactorySecond")
public class SecondDataSouceConfig {

    private Logger log = Logger.getLogger(SecondDataSouceConfig.class.getName());

    @Autowired
    @Qualifier("secondDataSource")
    private DataSource secondDataSource;

    @Bean
    public SqlSessionFactory sqlSessionFactorySecond(){
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(secondDataSource);
        try {
            return sqlSessionFactoryBean.getObject();
        } catch (Exception e) {
            log.info(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Bean
    public SqlSessionTemplate sqlSessionTemplateSecond(){
        SqlSessionTemplate sqlSessionTemplateSecond = new SqlSessionTemplate(sqlSessionFactorySecond());
        return sqlSessionTemplateSecond;
    }

}