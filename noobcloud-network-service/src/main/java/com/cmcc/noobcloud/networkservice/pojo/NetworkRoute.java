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
public class NetworkRoute implements Serializable{

  private static final long serialVersionUID = -2707118941002107074L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long routeId;
  private Long networkId;
  private String sysname;
  private String route;
  private String createTime;
  private String updateTime;

}
