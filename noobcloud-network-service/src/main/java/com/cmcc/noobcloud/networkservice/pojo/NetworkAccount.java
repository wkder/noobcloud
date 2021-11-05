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
public class NetworkAccount implements Serializable{

  private static final long serialVersionUID = -2529130821384765782L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long account_id;
  private Long network_id;
  private Long user_Id;
  private String account_4a;
  private String password_4a;
  private String account;
  private String password;
  private String login_code_4a;
  private String account_type;
  private String create_time;
  private String update_time;

}
