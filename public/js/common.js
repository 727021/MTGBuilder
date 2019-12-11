$(() => {
    $('#logout').click(() => {
        $.get('/ajax/logout', (data) => {
            if (data.success) {
                $('#userLink [data-toggle="tooltip"]').tooltip('dispose')
                $('#userLink').remove()
                $('#navbarCollapse').append('<a href="/login" role="button" class="btn btn-primary ml-1">Login</a>')
                createToast('Log out successful', 'MTGBuilder', 2000)
                console.log(data)
                if (data.redirect !== false) { // Redirect if necessary
                    document.location.replace(data.redirect)
                }
            }
        })
    })

    $('#navbarSearchForm').submit((e) => {
        e.preventDefault()
        return false
    })

    $('#navbarSearchCards').click(() => {
        let name = $('#navbarSearch').val()
        document.location.replace(`/card${name.trim() === '' ? '' : `?name=${name}`}`)
    })

    $('#navbarSearchUsers').click(() => {
        let name = $('#navbarSearch').val()
        document.location.replace(`/user${name.trim() === '' ? '' : `?name=${name}`}`)
    })

    $('#navbarSearchDecks').click(() => {
        let name = $('#navbarSearch').val()
        document.location.replace(`/deck${name.trim() === '' ? '' : `?name=${name}`}`)
    })

    $('[data-toggle="tooltip"]').tooltip()
})

/**
 * Replace quotes with an html quote symbol
 * @param {string} text
 * @returns {string}
 */
function htmlQuotes(text) {
    return text.replace(/["\u0022\u201C\u201D]/g, '&quot;')
}

/**
 * Parse card symbols
 * @param {string} text The string to parse
 * @returns {text} A string with card symbols parsed into HTML
 */
function parseSymbols(text) {
    /**
     * Card Symbols:
     * n = any integer 0 <= n <= 20
     * c = any mana color
     *
     * {Hc} Half
     * {W} White
     * {B} Black
     * {R} Red
     * {G} Green
     * {U} Blue
     * {C} Colorless
     * {P} Phyrexian
     * {S} Snow
     * {X} X
     * {Y} Y
     * {Z} Z
     * {n} n Numbered Colorless
     *
     * {n/c} or {c/c} Hybrid
     *
     * {T} Tap
     * {Q} Untap
     *
     * {CHAOS} Chaos
     *
     * [0] Zero Loyalty
     * [+n] n Up Loyalty
     * [-n] n Down Loyalty
     */
    return text
        .replace(/["\u0022\u201C\u201D]/g, '&quot;')// " to &quot;
        .replace(/\\/g, '')// Remove backslashes
        .replace(/{CHAOS}/g, '<i class="ms ms-chaos"></i>')// Chaos symbol
        .replace(/{(\d+)}/g, '<i class="ms ms-cost ms-shadow ms-$1"></i>')// Colorless numbered mana
        .replace(/{[\dhwbrgucpsxyz]+(?:\/[wbrgucps])?}/gi,(match) => {return match.toLowerCase()})
        .replace(/{([wbrgucpsxyz])}/g, '<i class="ms ms-cost ms-shadow ms-$1"></i>')// Normal mana
        .replace(/{h([wbrgucpsxyz])}/g, '<i class="ms ms-cost ms-half ms-shadow ms-$1"></i>')// Half mana
        .replace(/{(\d|[wbrgucps])\/([wbrgucps])}/g, '<i class="ms ms-cost ms-shadow ms-$1$2"></i>')// Hybrid mana
        .replace(/[\r\n]/g, '<br>')// \n and \r to <br>
        .replace(/{T}/g, '<i class="ms ms-cost ms-shadow ms-tap"></i>')// Tap symbol
        .replace(/{Q}/g, '<i class="ms ms-cost ms-shadow ms-untap"></i>')// Untap symbol
        .replace(/{\u221E}/g, '<i class="ms ms-cost ms-shadow ms-infinity"></i>')// Infinity mana
        .replace(/{\u00BD}/g, '<i class="ms ms-cost ms-shadow ms-1-2"></i>')// 1/2 mana
        .replace(/\[0\]/g, '<i class="ms ms-loyalty-zero ms-loyalty-0"></i>')// Zero loyalty
        .replace(/\[\+(\d+)\]/g, '<i class="ms ms-loyalty-up ms-loyalty-$1"></i>')// Up loyalty
        .replace(/\[[-−](\d+)\]/g, '<i class="ms ms-loyalty-down ms-loyalty-$1"></i>')// Down loyalty
        .replace(/(\(.+\))/g, '<i>$1</i>')// Italicize help text
}

function createToast(msg, title, seconds) {
    let id = `toast${$('.toast').length}`
    $('#toastContainer').prepend(`
    <div class="toast" id="${id}" data-delay="${seconds}">
    <div class="toast-header"><strong class="mr-auto">${title}</strong></div>
    <div class="toast-body text-dark">${msg}</div>
    </div>`)
    $(`#${id}`).on('hidden.bs.toast', function() { $(this).remove() })
    $(`#${id}`).toast().toast('show')
}