package com.cmcc.noobcloud.networkservice.pojo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.springframework.data.annotation.Id;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import java.io.Serializable;
import java.util.Date;

@Data
@ToString
@EqualsAndHashCode
public class Network implements Serializable{

  private static final long serialVersionUID = 8883228914572016917L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long networkId;
  private String assetCode;
  private String networkName;
  private String catogory;
  private String manageIp;
  private String site;
  private String room;
  private String location;
  private Long status;
  private String serviceField;
  private String manufacturer;
  private String city;
  private String loginInfo;
  private Long loginCatogory;
  private String supportStuff;
  private String supportTelephone;
  private String provChager;
  private String provTelephone;
  private String createTime;
  private String updateTime;
  private Long isRedirect;

}
