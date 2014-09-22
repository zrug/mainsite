var modals = {
    'login': '<div class="md-modal md-effect-3 form-login from-dropdown" id="modal-login"> \
            <div class="md-content"> \
                <h3>登&nbsp;录</h3> \
                <div> \
                    <fieldset class="fieldset-username margin-bottom-30"> \
                        <label>用户名</label> \
                        <input type="text" class="login-input username"> \
                    </fieldset> \
                    <fieldset class="fieldset-password"> \
                        <label>密码</label> \
                        <input type="password" class="login-input password"> \
                    </fieldset> \
                    <div class="login-function"> \
                        <div class="remember-me-input"> \
                            <input type="checkbox" class="remember-me" name="remember-me"> \
                        </div> \
                        <label for="remember-me" class="remember-me-label">记住我</label> \
                        <div class="forget-password-input"> \
                            <input type="checkbox" class="forget-password" name="forget-password"> \
                        </div> \
                        <label for="forget-password" class="forget-password-label">密码找回</label> \
                    </div> \
                </div> \
                <button class="md-close sign-up md-trigger button button-rounded button-flat-caution" data-modal="modal-signup">注&nbsp;册</button> \
                <button class="md-close do-login button button-rounded button-flat-action">登&nbsp;录</button> \
            </div> \
        </div> ',
    'signup': '<div class="md-modal md-effect-1 form-signup from-dropdown" id="modal-signup"> \
            <div class="md-content"> \
                <h3>注&nbsp;册</h3> \
                <div> \
                    <fieldset class="fieldset-cellphone margin-bottom-10"> \
                        <label>手机号</label> \
                        <input type="text" class="login-input cellphone"> \
                    </fieldset> \
                    <fieldset class="fieldset-barcode margin-bottom-10"> \
                        <label>手机验证</label> \
                        <input type="text" class="login-input-half barcode"> \
                        <div class="button button-rounded button-flat-action do-resend-barcode">获取验证码</div> \
                    </fieldset> \
                    <fieldset class="fieldset-username margin-bottom-10"> \
                        <label>用户名</label> \
                        <input type="text" class="login-input username"> \
                    </fieldset> \
                    <fieldset class="fieldset-password margin-bottom-10"> \
                        <label>密码</label> \
                        <input type="password" class="login-input-half password"> \
                    </fieldset> \
                    <fieldset class="fieldset-confirm-password"> \
                        <label>重复密码</label> \
                        <input type="password" class="login-input-half confirm-password"> \
                    </fieldset> \
                    <div class="signup-function"> \
                        <div class="agreement-input"> \
                            <input type="checkbox" class="agreement" name="agreement"> \
                        </div> \
                        <label for="agreement" class="agreement-label">我已经阅读并同意条款</label> \
                    </div> \
                </div> \
                <button class="md-close do-cancel button button-rounded button-flat">取&nbsp;消</button> \
                <button class="md-close do-signup-next button button-rounded button-flat-caution">下一步</button> \
            </div> \
        </div>',
    'overlay': '<div class="md-overlay"></div>',
    'use': function () {
        var modalWrapper = $('.modals');
        if (modalWrapper.length == 0) return;

        for (var i=0; i<arguments.length; i++) {
            modalWrapper.append( this[ arguments[i] ] );
        }
        modalWrapper.append(this.overlay);

        // init icheck
        $('input').iCheck({
            checkboxClass: 'icheckbox_polaris',
            radioClass: 'iradio_polaris',
            increaseArea: '-10%' // optional
        });

    }
}
