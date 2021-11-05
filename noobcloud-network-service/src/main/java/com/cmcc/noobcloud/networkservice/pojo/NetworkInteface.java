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
public class NetworkInteface implements Serializable{

  private static final long serialVersionUID = 1650739642453795289L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long intefaceId;
  private Long networkId;
  private String sysname;
  private String inteface;
  private String createTime;
  private String updateTime;

}
