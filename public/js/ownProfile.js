$(() => {
    const userID = Number($('#userID').html())
    // Populate deck list
    $.get('/ajax/deck', {owner: userID}, (data) => {
        if (data.error) {
            return $('#tfootDeckList').html(`<tr class="align-middle"><td colspan="2" class="text-center">${data.error}</td></tr>`)
        }
        if (data.decks.length == 0) {
            return $('#tfootDeckList').html(`<tr class="align-middle"><td colspan="2" class="text-center">No decks</td></tr>`)
        }
        data.decks.forEach(deck => {
            console.log(deck)
            $('#deckList').append(`<tr>
            <td class="align-middle py-2">${deck.title}</td>
            <td class="align-middle py-2">
            <a href="/deck/${deck.id}/edit" class="btn btn-primary" role="button"><i class="fas fa-edit"></i></a>
            <button class="btn btn-danger delete-deck" data-deck="${deck.id}"><i class="fas fa-trash"></i></button>
            </td>
            </tr>`)
        });
        $('.delete-deck').unbind()
        $('.delete-deck').each(function() {
            $(this).click(function() {
                $btn = $(this)
                let id = $btn.attr('data-deck')
                $.ajax({
                    url: `/ajax/deck/${id}`,
                    type: 'DELETE',
                    success: (data, status, xhr) => {
                        if (data.error) {
                            $('#deleteToastContent').html(data.error)
                            return $('#deleteToast').toast('show')
                        }
                        console.log(data)
                        $btn.parent().parent().remove()
                        $('#deleteToastContent').html(`Deleted <i>${data.delete}</i>`)
                        $('#deleteToast').toast('show')
                        if ($('#deckList').children().length == 0) $('#tfootDeckList').html('<tr><td colspan="2" class="text-center">No decks</td></tr>')
                    }
                })
            })
        })
    })

    function confirmDeck() {
        $('#createError').slideUp()
        // Show loading animation
        $('#cancelDeck').attr('disabled', '')
        $('#confirmDeck').attr('disabled', '').html('<span class="spinner-border spinner-border-sm"></span> Loading...')
        // Get data from modal form
        let title = $('#deckTitle').val()
        if (title.trim == '') title = 'Untitled'
        let visibility = $('#deckVisibility').val()
        // Create deck
        $.post('/ajax/deck/', {title: title, view: visibility}, (data) => {
            if (data.error) {
                $('#createError').html(data.error).slideDown()
                $('#cancelDeck').removeAttr('disabled')
                $('#confirmDeck').html('Create Deck').removeAttr('disabled')
                return
            }
            document.location.href = `/deck/${data.id}/edit`
        })
    }

    $('#confirmDeck').click(confirmDeck)

    $('#newDeckForm').submit(function(e) {
        e.preventDefault()
        confirmDeck()
        return false
    })

    $('#newDeckModal').on('show.bs.modal', function() {
        $('#createError').hide()
        $('#newDeckForm')[0].reset()
    })
})