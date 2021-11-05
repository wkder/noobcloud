package com.cmcc.noobcloud.consumer.controller;

import com.cmcc.noobcloud.consumer.common.ResultMsg;
import com.cmcc.noobcloud.consumer.service.NetworkService;
import com.cmcc.noobcloud.consumer.utils.VerifyCodeUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


/**
 * 功能描述： 登录
 *
 * @author 作者 Frank
 */

@Slf4j
@RestController
public class LoginController {

    private final Logger logger = LogManager.getLogger(this.getClass());

    @Autowired
    private NetworkService networkService;

    @RequestMapping(value = "/loginByName.html",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    public ResultMsg LoginByName(HttpServletRequest request, @RequestBody Map<String,Object> paras){

        String userName = String.valueOf(paras.get("userName"));
        String password = String.valueOf(paras.get("password"));
        String vCode = String.valueOf(paras.get("vCode"));
        if (StringUtils.isEmpty(userName) || StringUtils.isEmpty(password)){
            ResultMsg.buildErrorMsg("failure","用户名或密码不能为空");
        }
        String code = (String)request.getSession(true).getAttribute("randomString");
        if (StringUtils.isEmpty(vCode)){
            ResultMsg.buildErrorMsg("failure","图片校验码加载失败");
        }
        if (!vCode.equals(code)){
            ResultMsg.buildErrorMsg("failure","图片校验码错误");
        }
        Map<String,Object> param = new HashMap<>();
        param.put("userName", userName);
        param.put("password", password);
        ResultMsg resultMsg = networkService.loginByName(param);
        request.getSession().setAttribute("UserInfo",resultMsg.getData());
        return resultMsg;
    }

    @RequestMapping(value = "/queryMainInfo.html",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    public ResultMsg queryMainInfo(HttpServletRequest request){
        return ResultMsg.buildSuccessMsg(request.getSession().getAttribute("UserInfo"));
    }

    @RequestMapping(value = "/getVerifyCode",method = RequestMethod.GET)
    @ResponseBody
    public void getVerifyCode(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        logger.info("Slf4j log test mark getVerifyCode");
        VerifyCodeUtil.outputCaptcha(request, response);
    }
}
