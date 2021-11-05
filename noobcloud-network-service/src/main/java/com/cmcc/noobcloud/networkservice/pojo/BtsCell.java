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
public class BtsCell implements Serializable {

  private static final long serialVersionUID = -3629317757797491939L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long cellId;
  private Long gnodebId;
  private String ncgi;
  private Double radius;
  private Long cellMark;
  private String btsName;
  private String cellName;
  private String tac;
  private String pci;
  private Double longitude;
  private Double latitude;
  private Double bore;
  private Double high;
  private String manufaer;
  private String type;
  private String apart;
  private Integer leve;
  private String ip;
  private Double coverRate;


}
