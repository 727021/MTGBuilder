$(() => {
    var isLoading = false
    var userCount = 0
    function loading(done) {
        if (done) {
            isLoading = false
            $('#searchForm button[type="submit"]').removeAttr('disabled')
        } else {
            isLoading = true
            $('#searchForm button[type="submit"]').attr('disabled', '')
        }
    }

    function loadUsers() {
        loading()
        $('#tbody').empty()
        $('#tfoot').empty()
        let name = $('#userName').val()
        let type = $('#userType').val()
        let url = `/ajax/user?name=${name}&type=${type}`
        $.get(url, (data) => {
            if (data.error) $('#tfoot').html(`<tr><td colspan="5" class="align-middle text-center">${data.error}</td></tr>`)
            else {
                data.users.forEach(user => {
                    $('#tbody').append(`
                    <tr>
                        <td class="align-middle text-muted">${++userCount}</td>
                        <td class="align-middle"><span class="searchName"><a href="/user/${user.id}" class="text-reset text-decoration-none">${user.username}</a></span></td>
                        <td class="align-middle">${user.status}</td>
                        <td class="align-middle">${user.last_login}</td>
                        <td class="align-middle">${user.type[0].toUpperCase() + user.type.slice(1)}</td>
                    </tr>
                    `)
                })
            }
            loading(true)
        })
    }

    $('#searchForm').submit((e) => {
        e.preventDefault()
        if (isLoading) return false
        userCount = 0
        loadUsers()
        return false;
    })

    $('#searchForm button[type="reset"]').click((e) => {
        e.preventDefault()
        document.getElementById('searchForm').reset()
        $('#userName').val('')
        return false
    })

    loadUsers()
})