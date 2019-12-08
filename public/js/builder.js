$(() => {
    const deckID = $('#saveStatus').attr('data-deck')

    //#region Saving
    var isSaving = false
    var needsSave = false
    function saving(done) {
        if (done) {
            isSaving = false
            $('#saveStatus').addClass('btn-success').removeClass('btn-warning').html('<i class="fas fa-check"></i>').attr('data-original-title', 'Saved')
        } else {
            isSaving = true
            $('#saveStatus').addClass('btn-warning').removeClass('btn-success').html('<span class="spinner-border spinner-border-sm" role="status"></span>').attr('data-original-title', 'Saving...')
        }
    }

    // Decks autosave, but sometimes it's nice to
    // be able to click 'save' way too often.
    $('#saveStatus').click(save)

    function save() {
        if (isSaving) return needsSave = true
        saving()
        let title = $('#deckTitle').val()
        if (title.trim() == '') title = 'Untitled'
        let visibility = +$('#deckVisibility').val()
        if (visibility < 3 || visibility > 5) visibility = 4
        console.log(`PUT /ajax/deck/${deckID}\n${JSON.stringify({title: title, cards: deck, view: visibility})}`)
        $.ajax({
            url: `/ajax/deck/${deckID}`,
            type: 'PUT',
            data: {title: title, cards: JSON.stringify(deck), view: visibility},
            success: (data) => {
                console.log(data)
                saving(true)
                // Make sure nothing gets missed
                // (This could be made more efficient)
                if (needsSave) {
                    needsSave = false
                    save()
                }
            }
        })
    }

    $('#deckTitle').blur(save)
    $('#deckVisibility').change(save)
    //#endregion

    //#region Card search
    var isLoading = true
    var cardCount = 0
    var page = 1
    var q = ''
    const cardTypes = ['artifact','conspiracy','creature','enchantment','hero','instant','land','phenomenon','plane','planeswalker','scheme','sorcery','summon','tribal','vanguard']
    var cardSets = []
    const cardRarities = ['common','uncommon','rare','mythic']

    function loading(showLoadMore, done) {
        if (done) {
            isLoading = false
            $('button#searchCards').removeAttr('disabled').html('Search Cards')
            if (showLoadMore) {
                $('#loadMore').removeAttr('disabled')
                $('#tfootSearchCards').show()
            }
            else $('#tfootSearchCards').hide()
        } else {
            isLoading = true
            $('button#searchCards').attr('disabled', 'disabled').html('<div class="spinner-border spinner-border-sm" role="status"></div> Loading...')
            $('#loadMore').attr('disabled', 'disabled')
        }
    }

    async function loadPage() {
        loading()
        let url = `${q}&page=${page++}`
        $.ajax({
            url: url,
            error: function(xhr, status, err) {
                console.error(status)
                $('#cardDetails').html('<h1 class="display-5">API Error</h1><br><br><p>Sorry, it looks like our card API is having some trouble. Please try again later.</p>')
                loading($('#tfootSearchCards').is(':visible'), true)
            },
            success: function(data, status, xhr) {
                data.cards.forEach(card => {
                    cardCount++
                    let names = (card.names && card.names.length > 0) ? card.names : null
                    if (names) names.splice(names.indexOf(card.name), 1)
                    $('#searchResults').append(`<tr><td class="align-middle p-0"><button class="btn btn-success add-card" data-card="${card.id}" data-name="${card.name}" data-img="${card.imageUrl || ''}"><i class="fas fa-plus"></i></button><span><span class="searchName" data-name="${card.name}" data-img="${card.imageUrl || ''}">${card.name}</span>${names ? '/' + names.join('/') : ''}</span></td></tr>`)
                })
                bindDetails()
                bindAddRemove()
                loading((cardCount < Number(xhr.getResponseHeader('total-count'))), true)
            }
        })
    }

    // Populate set select
    $.get('https://api.magicthegathering.io/v1/sets', (data) => {
        data.sets.forEach(set => {
            $('#cardSet').append(`<option value="${cardSets.length}">${set.code} - ${set.name}</option>`)
            cardSets.push(set.code)
        })
        loading(false, true)
    })

    $('form#cardSearch').submit(function(e) {
        e.preventDefault()
        if (isLoading) return false

        let name = $('#cardName').val()
        let type = Number($('#cardType').val()) == -1 ? '' : cardTypes[Number($('#cardType').val())]
        let set = Number($('#cardSet').val()) == -1 ? '' : cardSets[Number($('#cardSet').val())]
        let rarity = Number($('#cardRarity').val()) == -1 ? '' : cardRarities[Number($('#cardRarity').val())]

        $('#searchResults').empty()

        cardCount = 0
        page = 1
        q = `https://api.magicthegathering.io/v1/cards?name=${name}&type=${type}&set=${set}&rarity=${rarity}`
        loadPage()

        return false
    })

    $('#loadMore').click(loadPage)
    //#endregion

    function bindDetails() {
        $('.searchName').unbind()
        $('.searchName').each(function() {
            $(this).click(function() {
                let name = $(this).data('name')
                let img = $(this).data('img')
                $('#cardDetails').html(`<h1 class="display-5">${name}</h1>${img == '' ? '<br><br><p class="w-100 text-center">No card image available</p>' : `<img class="card mx-auto d-block mb-2" src="${img}">`}`)
            })
        })
    }

    //#region Deck management
    function bindAddRemove() {
        $('.add-card').unbind()
        $('.remove-card').unbind()
        $('.add-card').each(function() {
            $(this).click(function() { // Add card
                let $btn = $(this)
                let id = $btn.attr('data-card')
                if ($(`tr[data-card="${id}"]`).length > 0) { // Row already exists
                    deck[id].count++
                    $(`.cardCount[data-card="${id}"]`).html(deck[id].count)
                } else { // New row
                    deck[id] = {count: 1, name: $btn.attr('data-name'), img: $btn.attr('data-img')}
                    $('#deckCards').prepend(`<tr data-card="${id}">
                    <td class="align-middle p-0">
                    <button class="btn btn-danger remove-card" data-card="${id}"><i class="fas fa-minus"></i></button>
                    <button class="btn btn-dark cardCount" data-card="${id}" disabled>1</button>
                    <button class="btn btn-success add-card" data-card="${id}"><i class="fas fa-plus"></i></button>
                    <span class="searchName" data-img="${deck[id].img}" data-name="${deck[id].name}">${deck[id].name}</span>
                    </td>
                    </tr>`)
                    bindDetails()
                    bindAddRemove()
                }
                $('#totalCards').html(+$('#totalCards').html() + 1)
                console.log(deck)
                save()
            })
        })
        $('.remove-card').each(function() {
            $(this).click(function() { // Remove card
                let $btn = $(this)
                let id = $btn.attr('data-card')
                deck[id].count--
                $(`.cardCount[data-card="${id}"]`).html(deck[id].count)
                if (deck[id].count == 0) {
                    $btn.parent().parent().remove()
                    delete deck[id]
                }
                $('#totalCards').html(+$('#totalCards').html() - 1)
                console.log(deck)
                save()
            })
        })
    }

    /* Use bracket notation to store/access cards:
     * deck[cardID] = {count: cardCount, name: cardName, img: imageUrl}
     */
    var deck = {}
    $.get(`/ajax/deck/${$('#saveStatus').attr('data-deck')}`, (data) => {
        if (data.error) {
            return console.error(data.error)
        }
        let cards = JSON.parse(data.deck.cards)
        let cardCount = 0
        for (let cardID in cards) {
            if (cards.hasOwnProperty(cardID)) {
                if (cards[cardID].count > 0) {
                    deck[cardID] = cards[cardID]
                    cardCount += cards[cardID].count
                    $('#deckCards').append(`<tr data-card="${cardID}">
                    <td class="align-middle p-0">
                    <button class="btn btn-danger remove-card" data-card="${cardID}"><i class="fas fa-minus"></i></button>
                    <button class="btn btn-dark cardCount" data-card="${cardID}" disabled>${cards[cardID].count}</button>
                    <button class="btn btn-success add-card" data-card="${cardID}"><i class="fas fa-plus"></i></button>
                    <span class="searchName" data-img="${cards[cardID].img}" data-name="${cards[cardID].name}">${cards[cardID].name}</span>
                    </td>
                    </tr>`)
                }
            }
        }
        $('#totalCards').html(cardCount)
        bindDetails()
        bindAddRemove()
    })
    //#endregion
})