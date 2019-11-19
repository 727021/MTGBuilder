$(() => {
    $('#btnLogin').click(() => {
        $('#invalidLogin').fadeOut()
        let user = $('#username').val().trim()
        let pass = $('#password').val().trim()

        if (user == '' || pass == '') {
            return $('#invalidLogin').fadeIn()
        }
        $.get('/ajax/login', {user: user, password: pass}, (data) => {
            console.log(data)
            if (data.error) return $('#invalidLogin').fadeIn()
            document.location.replace('/')
        })
    })
})