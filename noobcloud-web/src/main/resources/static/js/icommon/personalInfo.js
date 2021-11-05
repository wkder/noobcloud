/**
 * Created by Administrator on 2016/11/22.
 */
function onLoadBody(){
    var $personalInfo = $(".iMarket_PersonalInfo_EditHtml").find("div.personalInfo").clone();
    var $editPersonalInfoBtn = $personalInfo.find(".editPersonalInfoBtn");
    var $savePersonalInfoBtn = $personalInfo.find(".savePersonalInfoBtn");
    var $cancelPersonalInfoBtn = $personalInfo.find(".cancelPersonalInfoBtn");
    var $personalDetail = $personalInfo.find("div.personalDetail");
    var $userPassword = $personalDetail.find("div.editUserPassword");
    var $newUserPassword = $userPassword.find("input.newUserPassword.value");
    var $makeSureUserPassword = $userPassword.find("input.makeSureUserPassword.value");
    var $userName = $personalDetail.find("input.userName");
    var $userArea = $personalDetail.find("input.userArea");
    var $userPhone = $personalDetail.find("input.userPhone");
    var $email = $personalDetail.find("input.email");
    var $detailSegmentAuditUser = $personalDetail.find("div.detailSegmentAuditUser");
    //var $detailTagAuditUser = $personalDetail.find("div.detailTagAuditUser");
    var $segmentAuditUsersDetail = $detailSegmentAuditUser.find("input.segmentAuditUsersDetail");
    var $marketingAuditUsersDetail = $personalDetail.find("input.marketingAuditUsersDetail");
    //var $tagAuditUsersDetail = $detailTagAuditUser.find("input.tagAuditUsersDetail");
    var $remarks = $personalDetail.find("div.remarks");

    initPersonalInfo();
    initEvent();
    function initPersonalInfo(){
        globalRequest.queryPersonalBaseInfo(true,{},function(data){
            $userName.val(data.name);
            $userArea.val(data.areaName);
            $userPhone.val(data.telephone);
            $email.val(data.email?data.email:"空");
            $segmentAuditUsersDetail.val(data.segmentAuditUserNames?data.segmentAuditUserNames:"空");
            $marketingAuditUsersDetail.val(data.marketingAuditUserNames?data.marketingAuditUserNames:"空");
            //$tagAuditUsersDetail.val(data.tagAuditUserNames?data.tagAuditUserNames:"空");
            $remarks.html(data.remarks?data.remarks:"空");

            if (data.userType == 2){
                $detailSegmentAuditUser.remove();
                //$detailTagAuditUser.remove();
            }
            $("div.iMarket_PersonalInfo_Body div.personalInfoContent").empty().append($personalInfo);
        },function(){
            layer.alert("系统异常");
        });
    }

    function initEvent(){

        $editPersonalInfoBtn.click(function(){
            var $this = $(this);
            $this.hide();
            $savePersonalInfoBtn.show();
            $cancelPersonalInfoBtn.show();
            $userPassword.show().find("input.value").val("");
            $personalDetail.find("input.editAble").addClass("edit").removeAttr("readonly");
            $personalDetail.addClass("editing");
        });

        $cancelPersonalInfoBtn.click(function(){
            holdFinish();
        });

        $savePersonalInfoBtn.click(function(){

            if (!$newUserPassword.val()){
                layer.tips("请设置新密码",$newUserPassword);
                $newUserPassword.focus();
                return;
            }
            if (!$makeSureUserPassword.val()){
                layer.tips("请再次确认新密码",$makeSureUserPassword);
                $makeSureUserPassword.focus();
                return;
            }

            if ($newUserPassword.val() != $makeSureUserPassword.val()){
                layer.tips("两次密码不一致",$makeSureUserPassword);
                $makeSureUserPassword.focus();
                return;
            }

            var user = {};
            layer.prompt({
                formType: 1,
                title: '请输入登录密码'
            }, function(value, index, elem){
                utils.valid($userPassword.find("input.value"),utils.any,user,"password");
/*                utils.valid($email,utils.any,user,"email");
                utils.valid($userPhone,utils.any,user,"telephone");*/
                user["oldPwd"] = value;
                globalRequest.updatePersonalBaseInfo(true,user,function(data){
                    if(data.retValue === 0){
                        initPersonalInfo();
                        holdFinish();
                        //如果修改了密码，则需要重新登录
                        if (user["password"]){
                            globalRequest.loginOut(false,{},function(data){
                                layer.alert("信息修改成功,请重新登录！",{timeout:1000},function(){
                                    window.location.href = data.url;
                                });
                            });
                            return;
                        }
                    }else{
                        layer.alert("更新失败："+data.desc);
                    }
                },function(){
                    layer.alert("系统异常");
                });
            });
        });

        function holdFinish(){
            $editPersonalInfoBtn.show();
            $savePersonalInfoBtn.hide();
            $cancelPersonalInfoBtn.hide();
            $personalDetail.removeClass("editing");
            $userPassword.hide().find("input.val").val("");
            $personalDetail.find("input.editAble").removeClass("edit").attr("readonly","readonly");
        }
    }
}