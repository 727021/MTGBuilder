$(() => {
    $('.accept-follow').click(function() {
        let id = $(this).data('id')
        let follow = $(this).data('follow')
        // PUT /ajax/user/follow
        $.ajax({
            url: '/ajax/user/follow',
            method: 'PUT',
            data: {from: follow, to: id, status: 'accepted'},
            success: (data, status, xhr) => {
                console.log(data)
            }
        })
    })

    $('.decline-follow').click(function() {
        let id = $(this).data('id')
        let follow = $(this).data('follow')
        // DELETE /ajax/user/follow
        $.ajax({
            url: '/ajax/user/follow',
            method: 'DELETE',
            data: {from: follow, to: id},
            success: (data, status, xhr) => {
                console.log(data)
            }
        })
    })

    $('.unfollow').click(function() {
        let id = $(this).attr('data-id')
        let follow = $(this).attr('data-follow')
        // DELETE /ajax/user/follow
        $.ajax({
            url: '/ajax/user/follow',
            method: 'DELETE',
            data: {from: id, to: follow},
            success: (data, status, xhr) => {
                console.log(data)
            }
        })
    })
})