$(() => {
    const userID = $('#userID').html()
    $('.editButton').each(function() {
        $(this).click(function() {
            let $btn = $(this)
            let col = $btn.data('column')
            $(`#editButtons[data-column="${col}"]`).show()
            $btn.hide()
            $(`#display[data-column="${col}"]`).hide()
            $(`input[data-column="${col}"]`).show()
        })
    })

    $('.discardButton').each(function() {
        $(this).click(function() {
            let col = $(this).data('column')
            $(`#editButtons[data-column="${col}"]`).hide()
            $(`.editButton[data-column="${col}"]`).show()
            $(`#display[data-column="${col}"]`).show()
            $(`input[data-column="${col}"]`).hide().val('').removeClass('is-invalid')
        })
    })

    $('.saveButton').each(function() {
        $(this).click(function() {
            let col = $(this).data('column')
            let $input = $(`input[data-column="${col}"]`)
            let val = $input.val().trim()
            // Validate input
            let invalid = false
            if (val == '') return
            switch (col) {
                case 'email':
                    break
                case 'password':
                    if (val.length < 8)
                        invalid = 'Password must be at least 8 characters long'
                    break
                default:
                    break
            }
            if (invalid) {
                $input.addClass('is-invalid').select()
                createToast(invalid, 'MTGBuilder', 2000)
                return
            }
            $input.attr('disabled', '')
            $(`button[data-column="${col}"]`).attr('disabled', '')
            $(`.saveButton[data-column="${col}"]`).html('<span class="spinner-border spinner-border-sm"></span>').tooltip('hide')
            // Send AJAX
            $.ajax({
                url: `/ajax/user/${userID}`,
                data: JSON.parse(`{"${col}": "${val}"}`),
                type: 'PUT',
                success: function(data, status, xhr) {
                    console.log(data)
                    if (data.error) {
                        if (data.error != 'Database error') {
                            $input.addClass('is-invalid').select()
                        }
                        createToast(data.error, `MTGBuilder${data.error == 'Database error' ? ' - ERROR' : ''}`, 2000)
                    } else {
                        $input.removeClass('is-invalid')
                        // Update page with new value
                        // (Display format depends on column)
                        switch (col) {
                            case 'email':
                                $(`#display[data-column="${col}"]`).html(data.user.email.replace(/^(.{3}).+(\@.+\..+)/, '$1*****$2'))
                                break
                            case 'password':
                                // Don't change
                                break
                            default:
                                $(`#display[data-column="${col}"]`).html(data.user[col])
                                break
                        }
                        // Toggle editor elements
                        $(`#editButtons[data-column="${col}"]`).hide()
                        $(`.editButton[data-column="${col}"]`).show()
                        $(`#display[data-column="${col}"]`).show()
                        $(`input[data-column="${col}"]`).hide().val('').removeClass('is-invalid')
                        // Display toast
                        createToast(`Updated ${col}`, 'MTGBuilder', 2000)
                    }
                    // Enable input and editor buttons
                    $input.removeAttr('disabled')
                    $(`button[data-column="${col}"]`).removeAttr('disabled')
                    $(`.saveButton[data-column="${col}"]`).html('<i class="fas fa-save"></i>')
                }
            })
        })
    })
})