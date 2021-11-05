package com.cmcc.noobcloud.networkservice.pojo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.springframework.data.annotation.Id;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import java.io.Serializable;

@Data
@ToString
@EqualsAndHashCode
public class NetworkLog implements Serializable{

  private static final long serialVersionUID = -4808927002761821475L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long logId;
  private Long networkId;
  private String sysname;
  private String log;
  private String createTime;
  private String updateTime;

}
