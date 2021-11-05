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
public class NetworkBfd implements Serializable {

  private static final long serialVersionUID = 1875910039156153568L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long bfdId;
  private Long networkId;
  private String sysname;
  private String bfd;
  private String createTime;
  private String updateTime;


}
