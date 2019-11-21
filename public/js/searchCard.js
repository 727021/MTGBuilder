var cardCount = 0
var page = 1
var q = ''
$(() => {
    q = $('#query').attr('data-search')
    async function loadPage() {
        let url = `https://api.magicthegathering.io/v1/cards?name=${q}&page=${page++}?pageSize=1`
        $.ajax({
            url: url,
            statusCode: {
                503: function() {
                    console.error('503')
                }
            },
            success: function(data, status, jqXHR) {
                console.log(data)
                // Put the cards on the page
                data.cards.forEach(card => {
                    let names = (card.names && card.names.length > 0) ? card.names : null
                    if (names) names.splice(names.indexOf(card.name), 1)
                    $('#tbody').append(`
                    <tr>
                        <td class="align-middle"><span class="text-muted">${++cardCount}</span></td>
                        <td class="align-middle"><i data-toggle="tooltip" data-placement="top" title="${card.setName}" class="ss ss-grad ss-2x ss-${card.set.toLowerCase()} ss-${card.rarity.toLowerCase()}"></i></td>
                        <td class="align-middle"><span data-img="${card.imageUrl || ''}" class="searchName">${card.name}</span>${(names) ? '/' + names.join('/') + '<sup><a href="#note" class="text-reset text-decoration-none">&Dagger;</a></sup>' : ''}</td>
                        <td class="align-middle">${card.types.join(', ')}</td>
                        <td class="align-middle">${(card.manaCost || '').toLowerCase().replace(/{/g, '<i class="ml-1 ms ms-cost ms-').replace(/}/g, '"></i>')}</td>
                        <td class="align-middle">${(card.power && card.toughness) ? `${card.power}/${card.toughness}` : card.loyalty ? `${card.loyalty}<sup><sup><a href="#note" class="text-reset text-decoration-none">&dagger;</a></sup></sup>` : ''}</td>
                    </tr>
                    `)
                })
                // Hide the loading animation
                $('#spnLoading').hide()
                // Show the 'load more' button
                $('#btnLoadMore').show()
                // Conditionally disable the 'load more' button
                if (cardCount >= Number(jqXHR.getResponseHeader('total-count'))) {
                    $('#btnLoadMore').attr('disabled', '')
                }
                $('[data-toggle="tooltip"]').tooltip()
                $('.searchName').unbind()
                $('.searchName').each(function() {
                    console.log($(this))
                    $(this).click(function() {
                        let img = $(this).attr('data-img')
                        let name = $(this).text()

                        $('#cardModalTitle').html(name)
                        $('#cardModalContent').html(`<img src="${img}" class="card img-fluid mx-auto">`)
                        $('#cardModal').modal('show')
                    })
                })
            }
        })
    }
    loadPage()

    $('#btnLoadMore').click(() => {
        $('#btnLoadMore').hide()
        $('#spnLoading').show()
        loadPage()
    })

    $('#searchForm').submit((e) => {

    })
})
