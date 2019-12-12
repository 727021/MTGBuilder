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
                            return createToast(data.error, 'MTGBuilder - ERROR')
                        }
                        $btn.parent().parent().remove()
                        createToast(`Deleted <i>${data.delete}</i>`, 'MTGBuilder', 2000)
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

    $('#statusInput').keydown(function(e) {
        if (e.key == 'Enter' || e.key == '\\') {
            e.preventDefault()
            return $('#statusForm').submit()
        }
    })

    $('#statusInput').keyup(function(e) {
        let count = $(this).val().trim().length
        $('#charCount').html(count)
    })

    function statusHeight() {
        $('#status')[0].style.height = ""
        $('#status')[0].style.height = ($('#status')[0].scrollHeight + 5) + 'px'
    }
    statusHeight()
    $('#statusForm').submit(function(e) {
        e.preventDefault()
        let newStatus = $('#statusInput').val().trim()
        if (newStatus == '') return
        if (newStatus.length > 64) {
            createToast('Status is too long', 'MTGBuilder', 2000)
            $('#statusInput').val(newStatus.slice(0, 64)).attr('maxlength', '64')
            return false
        }

        $.ajax({
            url: `/ajax/user/${userID}`,
            data: JSON.parse(`{"status": "${newStatus}"}`),
            type: 'PUT',
            success: function(data, status, xhr) {
                if (data.error) {
                    createToast(data.error, `MTGBuilder${data.error == 'Database error' ? ' - ERROR' : ''}`, 2000)
                } else {
                    $('#statusInput').val('').blur()
                    $('#status').html(data.user.status)
                    $('#statusDate').html(data.user.status_date)
                    $('#charCount').html(0)
                    statusHeight()
                    createToast('Status updated', 'MTGBuilder', 2000)
                }
            }
        })

        return false
    })
})