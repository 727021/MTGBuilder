$(() => {
    function toast(msg) {
        $('#followerToastContent').html(msg)
        $('#followerToast').toast('show')
    }

    function getDateString() {
        let now = new Date().toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'}).replace(',', '').split(' ')
        return `${now[1]} ${now[0]} ${now[2]}`

    }

    $('.accept-follow').click(function acceptFollow() {
        let $btn = $(this)
        let id = $btn.data('id')
        let follow = $btn.data('follow')
        // PUT /ajax/user/follow
        $.ajax({
            url: '/ajax/user/follow',
            method: 'PUT',
            data: {from: follow, to: id, status: 'accepted'},
            success: (data, status, xhr) => {
                if (data.error) return toast(data.error)
                $('[data-toggle="tooltip"]').tooltip('dispose')
                // Add row to #followers
                $('#followers').prepend(`<tr>
                <td class="align-middle">${$btn.parent().prev().prev().html()}</td>
                <td class="align-middle">${getDateString()}</td>
                </tr>`)
                // Increment followers count
                $('#followers-count').html(+$('#followers-count').html() + 1)
                // Conditionally remove tfoot from followers table
                if (+$('#followers-count').html() == 1) $('#followers').next().remove()
                // Remove request
                $btn.parent().parent().remove()
                // Decrement requests count
                $('#requests-count').html(+$('#requests-count').html() - 1)
                // Conditionally add tfoot to requests table
                if (+$('#requests-count').html() == 0) $('#requests').parent().append('<tfoot><tr><td colspan="2" class="text-center">No follow requests</td></tr></tfoot>')
                // Show toast
                toast('Follow request accepted')
            }
        })
    })

    $('.decline-follow').click(function declineFollow() {
        let $btn = $(this)
        let id = $btn.data('id')
        let follow = $btn.data('follow')
        // DELETE /ajax/user/follow
        $.ajax({
            url: '/ajax/user/follow',
            method: 'DELETE',
            data: {from: follow, to: id},
            success: (data, status, xhr) => {
                if (data.error) return toast(data.error)
                $('[data-toggle="tooltip"]').tooltip('dispose')
                $btn.parent().parent().remove()
                $('[data-toggle="tooltip"]').tooltip()
                $('#requests-count').html(Number($('#requests-count').html()) - 1)
                if (+$('#requests-count').html() == 0) $('#requests').parent().append('<tfoot><tr><td colspan="2" class="text-center">No follow requests</td></tr></tfoot>')
                toast('Follow request declined')
            }
        })
    })

    $('.unfollow').click(function unfollow() {
        let $btn = $(this)
        let id = $btn.attr('data-id')
        let follow = $btn.attr('data-follow')
        // DELETE /ajax/user/follow
        $.ajax({
            url: '/ajax/user/follow',
            method: 'DELETE',
            data: {from: id, to: follow},
            success: (data, status, xhr) => {
                if (data.error) return toast(data.error)
                $('[data-toggle="tooltip"]').tooltip('dispose')
                $btn.parent().parent().remove()
                $('[data-toggle="tooltip"]').tooltip()
                $('#followed-count').html(Number($('#followed-count').html()) - 1)
                if (+$('#followed-count').html() == 0) $('#followed').parent().append('<tfoot><tr><td colspan="2" class="text-center">No users followed</td></tr></tfoot>')
                toast('User unfollowed')
            }
        })
    })
})