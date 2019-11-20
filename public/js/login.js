$(() => {
    $('#btnLogin').click(() => {
        $('#invalidLogin').slideUp()
        let user = $('#username').val().trim()
        let pass = $('#password').val().trim()

        if (user == '' || pass == '') {
            return $('#invalidLogin').slideDown()
        }
        $.get('/ajax/login', {user: user, password: pass}, (data) => {
            console.log(data)
            if (data.error) return $('#invalidLogin').slideDown()
            document.location.replace('/')
        })
    })
})