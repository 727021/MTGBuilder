$(() => {
    var isLoading = false
    var deckCount = 0
    function loading(done) {
        if (done) {
            isLoading = false
            $('#searchForm button[type="submit"]').removeAttr('disabled')
        } else {
            isLoading = true
            $('#searchForm button[type="submit"]').attr('disabled', '')
        }
    }

    function loadDecks() {
        loading()
        $('#tbody').empty()
        $('#tfoot').empty()
        let title = $('#deckTitle').val()
        let owner = $('#deckOwner').val()
        let url = `/ajax/deck?title=${title}&owner=${owner}`
        $.get(url, (data) => {
            if (data.error) $('#tfoot').html(`<tr><td colspan="4" class="text-center align-middle">${data.error}</td></tr>`)
            else {
                $('[data-toggle="tooltip"]').tooltip('dispose')
                data.decks.forEach(deck => {
                    $('#tbody').append(`
                    <tr>
                        <td class="align-middle text-muted">${++deckCount}</td>
                        <td class="align-middle">${deck.title}</td>
                        <td class="align-middle"><a class="hoverline" href="/user/${deck.owner}">${deck.owner_name}</a></td>
                        <td class="align-middle"><a href="/deck/${deck.id}" class="btn btn-success" role="button" data-toggle="tooltip" data-placement="right" title="Open"><i class="far fa-folder-open"></i></a></td>
                    </tr>`)
                })
                $('[data-toggle="tooltip"]').tooltip()
            }
            loading(true)
        })
    }

    $('#searchForm').submit((e) => {
        e.preventDefault()
        if (isLoading) return false
        deckCount = 0
        loadDecks()
        return false;
    })

    $('#searchForm button[type="reset"]').click((e) => {
        e.preventDefault()
        document.getElementById('searchForm').reset()
        $('#deckTitle').val('')
        return false
    })

    loadDecks()
})