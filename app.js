
//Đối tượng Validator 
function Validator(options) {

    var selectorRules = {};

    //Hàm thực hiện validate (kiểm tra nhập hay chưa)
    function validate(inputElement, rule) {
        var errorMessage;
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                 
        var rules = selectorRules[rule.selector];


        //Lặp qua từng rule và kiểm tra 
        //Nếu có lỗi thì dừng kiểm tra 
        for (var i = 0; i< rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid')
        } else {
            errorElement.innerText ='';
            inputElement.parentElement.classList.remove('invalid')
        }

        return !errorMessage;
    }
    //Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    
    if (formElement) {
        //Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            //Lặp qua từng rule và vadidate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if(isFormValid) {
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');

                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        return (values[input.name] = input.value) && values;
                    },{});
                    options.onSubmit(formValues);
                }
            }
        }

        //Lặp qua mỗi rule và xử lý
        options.rules.forEach(function (rule) {

            //Lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                //Xử lý trường hợp blur ra khỏi input
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }

                //Xử lý trường hợp khi uers nhập vào input
                inputElement.oninput  = function() {
                var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                    errorElement.innerText ='';
                    inputElement.parentElement.classList.remove('invalid')
                }
            }
        });
    }

}


//Định nghĩa rules 
// Nguyên tắc của các rules:
//1 Khi có lỗi => Trả ra message lỗi
//2. Khi hợp lệ => Không trả ra gì cả (undefined)
Validator.isRequired = function(selector, message) {
    return{
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập tên của bạn'
        }
    };
}

Validator.isEmail = function(selector, message) {
    return{
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Đây phải là email';
        }
    };
}
Validator.minLength = function(selector, min, message) {
    return{
        selector: selector,
        test: function(value) {
           
            return value.length >= min ? undefined : message || `Mật khẩu tối thiểu phải là ${min} ký tự`;
        }
    };
}


Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}