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
public class NetworkCommand implements Serializable{

  private static final long serialVersionUID = 5394690600162068978L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long command_id;
  private Long network_id;
  private String command;
  private String command_type;
  private String create_time;
  private String update_time;

}
