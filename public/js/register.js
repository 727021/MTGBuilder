function showError(err) {
    $('#formError').text(err)
    $('#formError').slideDown()
}

function hideError() {
    $('#formError').slideUp()
}

$(() => {
    $('#registerForm').submit((e) => {
        e.preventDefault()



        $.post('/ajax/user', {user: 1, email: 2, password: 3, confirm: 4}, (err, data) => {

        })

        return false
    })
})