var cardCount = 0
var page = 1
$(() => {
    var isLoading = false
    var q = `https://api.magicthegathering.io/v1/cards?name=${$('#query').attr('data-search')}`

    function loading(done) {
        if (done) {
            isLoading = false
            $('#searchForm button[type="submit"]').removeAttr('disabled')
            $('#btnLoadMore').removeAttr('disabled').html('Load More')
        } else {
            isLoading = true
            $('#searchForm button[type="submit"]').attr('disabled', '')
            $('#btnLoadMore').attr('disabled', '').html('<div class="spinner-border spinner-border-sm" role="status"></div> Loading...')
        }
    }

    async function loadPage() {
        loading(false)
        let url = q + `&page=${page++}`
        $.ajax({
            url: url,
            statusCode: {
                503: function() {
                    // TODO
                    console.error('503')
                }
            },
            success: function(data, status, jqXHR) {
                // Put the cards on the page
                data.cards.forEach(card => {
                    console.log(card)
                    let names = (card.names && card.names.length > 0) ? card.names : null
                    if (names) names.splice(names.indexOf(card.name), 1)
                    let cost = (card.manaCost || '').toLowerCase()
                    $('#tbody').append(`
                    <tr>
                        <td class="align-middle"><span class="text-muted">${++cardCount}</span></td>
                        <td class="align-middle"><i data-toggle="tooltip" data-placement="top" title="${card.setName}" class="ss ss-grad ss-2x ss-${card.set.toLowerCase() == 'tsb' ? 'tsp ss-timeshifted' : card.set.toLowerCase()} ss-${card.rarity.toLowerCase()}"></i></td>
                        <td class="align-middle"><span data-flavor="${htmlQuotes(card.flavor || '')}" data-rarity="${card.rarity.toLowerCase()}" data-set="${card.set.toLowerCase() == 'tsb' ? 'tsp ss-timeshifted' : card.set.toLowerCase()}|${card.setName}" data-cost="${cost}" data-pt="${(card.power && card.toughness) ? `${card.power}/${card.toughness}` : card.loyalty || ''}" data-text="${htmlQuotes(card.text || '')}" data-type="${card.type}" data-img="${card.imageUrl || ''}" class="searchName">${card.name}</span>${(names) ? '/' + names.join('/') + '<sup><a href="#note" class="text-reset text-decoration-none">&Dagger;</a></sup>' : ''}</td>
                        <td class="align-middle">${card.types.join(', ')}</td>
                        <td class="align-middle">${parseSymbols(cost)}</td>
                        <td class="align-middle">${(card.power && card.toughness) ? `${card.power}/${card.toughness}` : card.loyalty ? `<i class="ms ms-shadow ms-loyalty-start ms-loyalty-${card.loyalty.toLowerCase().replace('+', '-')}"></i><sup><sup><a href="#note" class="text-reset text-decoration-none">&dagger;</a></sup></sup>` : ''}</td>
                    </tr>
                    `)
                })
                // Finished loading
                loading(true)
                // Conditionally disable the 'load more' button
                if (cardCount >= Number(jqXHR.getResponseHeader('total-count'))) {
                    $('#btnLoadMore').attr('disabled', 'disabled')
                }
                $('[data-toggle="tooltip"]').tooltip()
                $('.searchName').unbind()
                $('.searchName').each(function() {
                    $(this).click(function() {
                        let img = $(this).attr('data-img')
                        let name = $(this).text()
                        let cost = parseSymbols($(this).attr('data-cost'))
                        let text = parseSymbols($(this).attr('data-text'))
                        let set = $(this).attr('data-set').split('|')
                        let rarity = $(this).attr('data-rarity')
                        let type = $(this).attr('data-type')
                        let flavor = parseSymbols($(this).attr('data-flavor'))

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
                                        <i class="ss ss-2x ss-grad ss-${set[0]} ss-${rarity}"></i>
                                    </div>
                                </div>
                                <div class="row${flavor ? ' border-bottom pb-1' : ''}">
                                    <div class="col">
                                        ${text}
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

    var cardTypes = ['artifact','conspiracy','creature','enchantment','hero','instant','land','phenomenon','plane','planeswalker','scheme','sorcery','summon','tribal','vanguard']
    var cardSets = []
    var cardRarities = ['common','uncommon','rare','mythic']
    // Populate set select
    $.get('https://api.magicthegathering.io/v1/sets', (data) => {
        data.sets.forEach(set => {
            $('#cardSet').append(`<option value="${cardSets.length}">${set.code} - ${set.name}</option>`)
            cardSets.push(set.code)
        })
    })

    $('#btnLoadMore').click(() => {
        loadPage()
    })

    $('#searchForm').submit((e) => {
        e.preventDefault()
        if (isLoading) return false

        let name = $('#cardName').val()
        let type = Number($('#cardType').val()) == -1 ? '' : cardTypes[Number($('#cardType').val())]
        let set = Number($('#cardSet').val()) == -1 ? '' : cardSets[Number($('#cardSet').val())]
        let rarity = Number($('#cardRarity').val()) == -1 ? '' : cardRarities[Number($('#cardRarity').val())]
        let colors = []
        if ($('#cardWhite')[0].checked) colors.push('white')
        if ($('#cardBlue')[0].checked) colors.push('blue')
        if ($('#cardBlack')[0].checked) colors.push('black')
        if ($('#cardRed')[0].checked) colors.push('red')
        if ($('#cardGreen')[0].checked) colors.push('green')

        $('#tbody').empty()

        cardCount = 0
        page = 1
        q = `https://api.magicthegathering.io/v1/cards?name=${name}&type=${type}&set=${set}&rarity=${rarity}&colors=${colors.join('|')}`
        console.log(q)
        loadPage()

        return false
    })

    $('#searchForm button[type="reset"]').click((e) => {
        e.preventDefault()
        document.getElementById('searchForm').reset()
        $('#cardName').val('')
        return false
    })

    // Load the first page of results
    loadPage()
})
