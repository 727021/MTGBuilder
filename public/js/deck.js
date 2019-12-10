$(() => {
    $('.searchName').each(function() {
        $(this).click(function() {
            let name = $(this).text()
            let img = $(this).data('img')
            $('#cardDetails').html(`<h1 class="display-5">${name}</h1>${img == '' ? '<br><br><p class="w-100 text-center">No card image available</p>' : `<img class="card mx-auto d-block mb-2" src="${img}">`}`)
        })
    })

    $('#copyDeck').click(function() {
        $(this).addClass('btn-warning')
               .removeClass('btn-success')
               .html('<span class="spinner-border spinner-border-sm" role="status"></span>')
               .attr('data-original-title', 'Copying...')
        let deck = $(this).data('deck')
        $.post(`/ajax/deck/${deck}`, {}, (data) => {
            if (data.error) {
                $(this).addClass('btn-success')
                       .removeClass('btn-warning')
                       .html('<i class="far fa-copy"></i>')
                       .attr('data-original-title', 'Copy')
                createToast(data.error, 'MTGBuilder - ERROR', 2000)
                return
            } else
                document.location.href = `/deck/${data.id}/edit`
        })
    })
})