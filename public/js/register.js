function showError(err) {
    $('input:password').val('')
    $('#formError').text(err)
    $('#formError').slideDown()
    return false
}

function hideError() {
    $('#formError').slideUp()
    return $('#formError')
}

$(() => {
    $('#registerForm').submit((e) => {
        e.preventDefault()

        hideError()
        setTimeout(() => {
            let username = $('#username').val().trim()
            let email = $('#email').val().trim()
            let password = $('#password').val().trim()
            let confirm = $('#confirm').val().trim()

            if (username == '' || email == '' || password == '' || confirm == '') return showError('All fields are required')

            $.post('/ajax/user', {user: username, email: email, password: password, confirm: confirm}, (data) => {
                if (data.error) return showError(data.error)
                $('#regSuccess').slideDown()
                setTimeout(() => {
                    document.location.replace('/login')
                }, 1500)
            })
        }, 500)

        return false
    })
})