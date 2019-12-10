$(() => {
    function addFriend() {
        $.post('/ajax/user/follow', {id: $(this).attr('data-follow')}, (data) => {
            if (data.error) return createToast(data.error, 'MTGBuilder - ERROR', 2000)
            $(this).unbind()
                   .html('<i class="fas fa-user-check"></i>')
                   .attr('title', 'Follow Requested')
                   .tooltip('dispose')
                   .tooltip()
            createToast('Follow request sent', 'MTGBuilder', 2000)
        })
    }

    $('button#removeFriend').click(function() {
        let $btn = $(this)
        $.ajax({
            url: '/ajax/user/follow',
            type: 'DELETE',
            data: {to: $btn.data('follow')},
            success: function(data) {
                if (data.error) return createToast(data.error, 'MTGBuilder - ERROR', 2000)
                $btn.unbind()
                       .html('<i class="fas fa-user-plus"></i>')
                       .attr('title', 'Follow')
                       .tooltip('dispose')
                       .tooltip()
                $btn.click(addFriend)
                createToast('Unfollowed', 'MTGBuilder', 2000)
            }
        })
    })

    $('button#addFriend').click(addFriend)

    $('.copy-deck').each(function() {
        $(this).click(function() {
            let deck = $(this).data('deck')
            $(this).addClass('btn-warning')
                   .removeClass('btn-success')
                   .html('<span class="spinner-border spinner-border-sm" role="status"></span>')
                   .attr('data-original-title', 'Copying...')
            $.post(`/ajax/deck/${deck}`, {}, (data) => {
                if (data.error) {
                    $(this).addClass('btn-success')
                           .removeClass('btn-warning')
                           .html('<i class="far fa-copy"></i>')
                           .attr('data-original-title', 'Copy')
                    createToast(data.error, 'MTGBuilder - ERROR', 2000)
                } else
                    document.location.href = `/deck/${data.id}/edit`
            })
        })
    })
})