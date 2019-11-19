$(() => {
    $('#logout').click(() => {
        $.get('/ajax/logout', (data) => {
            if (data.success) {
                $('#userLink').remove()
                $('#navbarCollapse').append('<a href="/login" role="button" class="btn btn-primary ml-1">Login</a>')
            }
        })
    })

    $('[data-toggle="tooltip"]').tooltip()
})