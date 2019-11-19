$(() => {
    $('#logout').click(() => {
        $.get('/ajax/logout', (data) => {
            if (data.success) {
                $('#userLink [data-toggle="tooltip"]').tooltip('dispose')
                $('#userLink').remove()
                $('#navbarCollapse').append('<a href="/login" role="button" class="btn btn-primary ml-1">Login</a>')
                $('#logoutToast').toast('show')
            }
        })
    })

    $('[data-toggle="tooltip"]').tooltip()

    $('.toast').toast()
})