$(() => {
    $('#loginForm').submit((e) => {
        e.preventDefault()
        $('#invalidLogin').slideUp()
        let user = $('#username').val().trim()
        let pass = $('#password').val().trim()

        if (user == '' || pass == '') {
            $('#password').val('')
            return $('#invalidLogin').slideDown() && false
        }
        $.get('/ajax/login', {user: user, password: pass}, (data) => {
            if (data.error) {
                $('#password').val('')
                return $('#invalidLogin').slideDown() && false
            }
            document.location.replace('/')
        })
        return false
    })
})