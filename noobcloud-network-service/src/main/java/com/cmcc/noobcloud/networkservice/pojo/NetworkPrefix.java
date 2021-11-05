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
public class NetworkPrefix implements Serializable{

  private static final long serialVersionUID = -6693319412286094609L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long prefixId;
  private Long networkId;
  private String sysname;
  private String prefix;
  private String createTime;
  private String updateTime;

}
