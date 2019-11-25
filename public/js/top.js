$(() => {
    const scrollPos = 50
    $('a[href="#top"]').click(function(e) {
        e.preventDefault()
        $('html, body').animate({scrollTop:0},'2000');
        return false
    })

    $(document).scroll(function(e) {
        if ($(document).scrollTop() >= scrollPos) {
            $('a[href="#top"]').fadeIn()
        } else {
            $('a[href="#top"]').fadeOut()
        }
    })

    if ($(document).scrollTop() >= scrollPos) {
        $('a[href="#top"]').show()
    }
})