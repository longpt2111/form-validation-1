// Constructor Function Validator
function Validator(options) {
    const selectorRules = {}

    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        const errorElement = inputElement.closest(options.formGroupSelector).querySelector(options.errorSelector)
        let errorMessage

        // Lấy ra các rules của selector
        const rules = selectorRules[rule.selector]

        // Lặp qua từng rule & kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (let i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            inputElement.closest(options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            inputElement.closest(options.formGroupSelector).classList.remove('invalid')
        }

        // Return giá trị boolean để xét valid cho từng input
        return !errorMessage
    }

    // Hàm loại bỏ error khi input
    function removeError(inputElement) {
        const errorElement = inputElement.closest(options.formGroupSelector).querySelector(options.errorSelector)

        errorElement.innerText = ''
        inputElement.closest(options.formGroupSelector).classList.remove('invalid')
    }

    // Lấy element của form group cần validate
    const formElement = document.querySelector(options.form)

    if (formElement) {
        // Lặp qua mỗi rule và xử lý sự kiện blur, input, ...
        options.rules.forEach(rule => {
            const inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(inputElement => {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }
                
                // Xử lý mỗi khi input được nhập
                inputElement.oninput = function() {
                    removeError(inputElement)
                }
            })
            
            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
        })

        // Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault()

            let isFormValid = true
            
            // Lặp qua từng rules và validate
            options.rules.forEach(rule => {
                const inputElement = formElement.querySelector(rule.selector)
                let isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })

            if (isFormValid) {
                // Trường hợp submit với javascript
                if (typeof options.onSubmit === 'function') {
                    const enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    const formValues = Array.from(enableInputs).reduce((values, enableInput) => {
                        switch (enableInput.type) {
                            case 'radio':
                                if (enableInput.matches(':checked')) {
                                    values[enableInput.name] = enableInput.value
                                }
                                break
                            case 'checkbox': 
                                if (enableInput.matches(':checked')) {
                                    if (Array.isArray(values[enableInput.name])) {
                                        values[enableInput.name].push(enableInput.value)
                                    } else {
                                        values[enableInput.name] = [enableInput.value]
                                    }
                                }
                                if (!values[enableInput.name]) {
                                    values[enableInput.name] = ''
                                }
                                break
                            case 'file':
                                values[enableInput.name] = enableInput.files
                                break
                            default:
                                values[enableInput.name] = enableInput.value
                        }
                        return values
                    }, {})
                    
                    options.onSubmit(formValues)
                }
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit()
                }
            } 
        } 
    }
}

// Định nghĩa rules
// Nguyên tắc của các rules
// 1. Khi có lỗi thì trả ra message lỗi
// 2. Khi hợp lệ thì trả ra undefined
Validator.isRequired = function(selector, message) {
    return {
        selector,
        test(value) {
            if (typeof value === 'string') {
                return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
            } else {
                return value ? undefined : message || 'Vui lòng nhập trường này'
            }
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector,
        test(value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

Validator.minLength = function(selector, min, message) {
    return {
        selector,
        test(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector,
        test(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}