$(() => {
    function toast(msg) {
        $('#friendToastContent').html(msg || '')
        $('#friendToast').toast('show')
    }

    $('button#removeFriend').click(function removeFriend() {
        $.ajax({
            url: '/ajax/user/follow',
            type: 'DELETE',
            data: {id: $(this).attr('data-follow')},
            success: (data) => {
                if (data.error) return toast(data.error)
                $(this).unbind()
                       .click(addFriend)
                       .html('<i class="fas fa-user-plus"></i>')
                       .attr('title', 'Follow')
                       .tooltip('dispose')
                       .tooltip()
                toast('Unfollowed')
            }
        })
    })

    $('button#addFriend').click(function addFriend() {
        $.post('/ajax/user/follow', {id: $(this).attr('data-follow')}, (data) => {
            if (data.error) return toast(data.error)
            $(this).unbind()
                   .html('<i class="fas fa-user-check"></i>')
                   .attr('title', 'Follow Requested')
                   .tooltip('dispose')
                   .tooltip()
            toast('Follow request sent')
        })
    })
})