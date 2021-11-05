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
public class NetworkVpn implements Serializable{

  private static final long serialVersionUID = -7716422573441245066L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long vpnId;
  private Long networkId;
  private String sysname;
  private String vpn;
  private String createTime;
  private String updateTime;

}
