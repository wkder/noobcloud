package com.cmcc.noobcloud.goodservice.config;

import com.atomikos.jdbc.AtomikosDataSourceBean;
import com.mysql.jdbc.jdbc2.optional.MysqlXADataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.logging.Logger;

/**
 * 动态数据源及其事务配置
 * Created by Frank on 2018/8/11.
 */
@Configuration
public class DataSourceConfig {

    private Logger log = Logger.getLogger(DataSourceConfig.class.getName());

    @Autowired
    private FirstDataSouceProperty firstDataSouceProperty;

    @Autowired
    private SecondDataSouceProperty secondDataSouceProperty;

    //配置对应数据源及其事务
    @Bean(name = "firstDataSource")
    public DataSource firstDataSource() throws SQLException {
        log.info("first数据库连接池创建中");
        //return DataSourceBuilder.create().build();
        MysqlXADataSource mysqlXADataSource=new MysqlXADataSource();
        mysqlXADataSource.setUrl(firstDataSouceProperty.getJdbcUrl());
        mysqlXADataSource.setPinGlobalTxToPhysicalConnection(true);
        mysqlXADataSource.setPassword(firstDataSouceProperty.getPassword());
        mysqlXADataSource.setUser(firstDataSouceProperty.getUsername());
        mysqlXADataSource.setPinGlobalTxToPhysicalConnection(true);

        AtomikosDataSourceBean atomikosDataSourceBean=new AtomikosDataSourceBean();
        atomikosDataSourceBean.setXaDataSource(mysqlXADataSource);
        atomikosDataSourceBean.setUniqueResourceName("firstDataSource");
        atomikosDataSourceBean.setMinPoolSize(firstDataSouceProperty.getMinPoolSize());
        atomikosDataSourceBean.setMaxPoolSize(firstDataSouceProperty.getMaxPoolSize());
        atomikosDataSourceBean.setMaxLifetime(firstDataSouceProperty.getMaxLifetime());
        atomikosDataSourceBean.setBorrowConnectionTimeout(firstDataSouceProperty.getBorrowConnectionTimeout());
        atomikosDataSourceBean.setLoginTimeout(firstDataSouceProperty.getLoginTimeout());
        atomikosDataSourceBean.setMaintenanceInterval(firstDataSouceProperty.getMaintenanceInterval());
        atomikosDataSourceBean.setMaxIdleTime(firstDataSouceProperty.getMaxIdleTime());
        return atomikosDataSourceBean;
    }

    @Bean(name = "secondDataSource")
    public DataSource secondDataSource() throws SQLException {
        log.info("second数据库连接池创建中");
        //return DataSourceBuilder.create().build();
        MysqlXADataSource mysqlXADataSource=new MysqlXADataSource();
        mysqlXADataSource.setUrl(secondDataSouceProperty.getJdbcUrl());
        mysqlXADataSource.setPinGlobalTxToPhysicalConnection(true);
        mysqlXADataSource.setPassword(secondDataSouceProperty.getPassword());
        mysqlXADataSource.setUser(secondDataSouceProperty.getUsername());
        mysqlXADataSource.setPinGlobalTxToPhysicalConnection(true);

        AtomikosDataSourceBean atomikosDataSourceBean=new AtomikosDataSourceBean();
        atomikosDataSourceBean.setXaDataSource(mysqlXADataSource);
        atomikosDataSourceBean.setUniqueResourceName("secondDataSource");

        atomikosDataSourceBean.setMinPoolSize(secondDataSouceProperty.getMinPoolSize());
        atomikosDataSourceBean.setMaxPoolSize(secondDataSouceProperty.getMaxPoolSize());
        atomikosDataSourceBean.setMaxLifetime(secondDataSouceProperty.getMaxLifetime());
        atomikosDataSourceBean.setBorrowConnectionTimeout(secondDataSouceProperty.getBorrowConnectionTimeout());
        atomikosDataSourceBean.setLoginTimeout(secondDataSouceProperty.getLoginTimeout());
        atomikosDataSourceBean.setMaintenanceInterval(secondDataSouceProperty.getMaintenanceInterval());
        atomikosDataSourceBean.setMaxIdleTime(secondDataSouceProperty.getMaxIdleTime());
        return atomikosDataSourceBean;
    }

    /*@Bean
    public PlatformTransactionManager firstTransactionManager(@Qualifier("firstDataSource") DataSource firstDataSource) {
        return new DataSourceTransactionManager(firstDataSource);
    }

    @Bean
    public PlatformTransactionManager secondTransactionManager(@Qualifier("secondDataSource") DataSource secondDataSource) {
        return new DataSourceTransactionManager(secondDataSource);
    }*/
}
