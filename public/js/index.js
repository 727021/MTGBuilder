$(() => {
    function loadDecks() {
        $.get('/ajax/deck/recent', (data) => {
            if (data.error) {
                $('#recentDecks tfoot').html(`<tr><td colspan="4" class="text-center">${data.error}<br/><button id="reloadDecks" class="btn btn-primary"><i class="fas fa-redo-alt"></i> Retry</button></td></tr>`)
                $('#reloadDecks').click(function() {
                    $('#reloadDecks').html('<span class="spinner-border spinner-border-sm"></span> Retry').attr('disabled', '')
                    loadDecks()
                })
                return
            }
            $('#recentDecks tfoot').empty()
            let i = 1
            data.decks.forEach(deck => {
                $('#recentDecks tbody').append(`
                <tr>
                    <td class="text-center align-middle text-muted">${i++}</td>
                    <td class="align-middle"><a class="hoverline" href="/deck/${deck.id}">${deck.title}</a></td>
                    <td class="align-middle"><a class="hoverline" href="/user/${deck.owner_id}">${deck.owner}</a></td>
                </tr>`)
            })
        })
    }
    loadDecks()

    function statusHeight() {
        $('#status')[0].style.height = ""
        $('#status')[0].style.height = ($('#status')[0].scrollHeight + 5) + 'px'
    }

    function loadStatus() {
        $.get('/ajax/user/recent', (data) => {
            if (data.error) {
                $('#statusUpdates').html('<button id="reloadStatus" class="btn btn-primary m-auto"><i class="fas fa-redo-alt"></i> Retry</button>')
                $('#reloadStatus').click(function() {
                    $('#reloadStatus').html('<span class="spinner-border spinner-border-sm"></span> Retry').attr('disabled', '')
                    loadStatus()
                })
                return
            }
            $('#statusUpdates').empty()
            data.users.forEach(user => {
                $('#statusUpdates').append(`
                <div>
                    <p class="m-0"><b><a href="/user/${user.account_id}" class="hoverline text-reset">${user.username}</a>:</b> <span class="text-muted">${user.status_date}</span></p>
                    <textarea rows="1" readonly class="pl-2 ml-2 mb-2 border-none border-left text-wrap noresize form-control-plaintext">${user.status}</textarea>
                </div>`)
            })
        })
    }
    loadStatus()
})