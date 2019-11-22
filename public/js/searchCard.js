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
                    let cost = (card.manaCost || '').toLowerCase().replace(/{/g, '<i class="ml-1 ms ms-cost ms-').replace(/}/g, '"></i>')
                    $('#tbody').append(`
                    <tr>
                        <td class="align-middle"><span class="text-muted">${++cardCount}</span></td>
                        <td class="align-middle"><i data-toggle="tooltip" data-placement="top" title="${card.setName}" class="ss ss-grad ss-2x ss-${card.set.toLowerCase()} ss-${card.rarity.toLowerCase()}"></i></td>
                        <td class="align-middle"><span data-flavor="${card.flavor || ''}" data-rarity="${card.rarity.toLowerCase()}" data-set="${card.set.toLowerCase()}|${card.setName}" data-cost='${cost}' data-pt="${(card.power && card.toughness) ? `${card.power}/${card.toughness}` : card.loyalty || ''}" data-text="${card.text}" data-type="${card.type}" data-img="${card.imageUrl || ''}" class="searchName">${card.name}</span>${(names) ? '/' + names.join('/') + '<sup><a href="#note" class="text-reset text-decoration-none">&Dagger;</a></sup>' : ''}</td>
                        <td class="align-middle">${card.types.join(', ')}</td>
                        <td class="align-middle">${cost}</td>
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
                        let cost = $(this).attr('data-cost')
                        let text = $(this).attr('data-text')
                        let set = $(this).attr('data-set').split('|')
                        let rarity = $(this).attr('data-rarity')
                        let type = $(this).attr('data-type')
                        let flavor = $(this).attr('data-flavor').replace(/\\/g, '')
                        // cost pt text type img set rarity flavor

                        $('#cardModalTitle').html(name)
                        $('#cardModalContent').html(`
                        <div class="row">
                        ${img ? `<div class="col-12 col-md-6"><img src="${img}" class="card img-fluid float-md-left mx-auto"></div>` : ''}
	                    	<div class="col-12${img ? ' col-md-6' : ''}">
                                <div class="row border-bottom pb-1">
                                    <div class="col text-left">
                                        ${name}
                                    </div>
                                    <div class="col text-right">
                                        ${cost}
                                    </div>
                                </div>
                                <div class="row border-bottom pb-1">
                                    <div class="col text-left">
                                        ${type}
                                    </div>
                                    <div class="col text-right">
                                        <i class="ss ss-grad ss-${set[0]} ss-${rarity}"></i>
                                    </div>
                                </div>
                                <div class="row${flavor ? ' border-bottom pb-1' : ''}">
                                    <div class="col">
                                        ${text.replace(/{(\d)}/g, '<i class="ms ms-cost ms-$1"></i>').replace(/{[wbrgu]}/gi,(match) => {return match.toLowerCase()}).replace(/{([wbrgu])}/g, '<i class="ms ms-cost ms-$1"></i>').replace(/[\r\n]/g, '<br>').replace(/{T}/g, '<i class="ms ms-cost ms-tap"></i>').replace(/\[0\]/g, '<i class="ms ms-loyalty-zero ms-loyalty-0"></i>').replace(/\[\+(\d)\]/g, '<i class="ms ms-loyalty-up ms-loyalty-$1"></i>').replace(/\[−(\d+)\]/g, '<i class="ms ms-loyalty-down ms-loyalty-$1"></i>')}
                                    </div>
                                </div>
                                ${flavor ? `<div class="row"><div class="col"><i>${flavor}</i></div></div>` : ''}
                            </div>
	                    </div>
                        `)
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
