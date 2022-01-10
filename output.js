$(function() {
    var type_id;
    var eq_checked = [true, true, true, true, true, true];

    $.getJSON('data/equipments_table.json', function(data) {
        for(var i=0; i<data.length; i++) {
            $('#select-type').append('<option value="'+i+'">'+data[i].type+'</option>');
        }
        $('input[type=checkbox]').prop('disabled', true).prop('checked', true);
    });

    $('#select-type').change(function() {
        $('#equipment-table tbody').empty();
        $('input[type=checkbox]').prop('checked', true);
        for (var i=0; i<eq_checked.length; i++) {
            eq_checked[i] = true;
        }
        type_id = $(this).val();
        if (type_id < 0) {
            $('input[type=checkbox]').prop('disabled', true);
        } else {
            $('input[type=checkbox]').prop('disabled', false);
            $.getJSON('data/equipments_table.json', function(data) {
                for(var i=0; i<data[type_id].items.length; i++) {
                    var name = data[type_id].items[i].name;
                    var ship_id = 'ship_' + i;
                    $('#equipment-table tbody').append('<tr id="'+ship_id+'"></tr>')
                    $('#'+ship_id).append('<td><a href="https://wikiwiki.jp/kancolle/'+name+'" target="_blank">'+name+'</td>');
                    for(var j=0; j<data[type_id].items[i].eq.length; j++) {
                        var eq_class = 'col_eq' + j;
                        var eq_enable = data[type_id].items[i].eq[j];
                        $('#'+ship_id).append('<td class="cell '+eq_class+'">'+eq_enable+'</td>');
                    }
                }
            });
            }
    });

    $('input[type=checkbox]').change(function() {
        var value = $(this).val();
        var num = parseInt(value);
        if ($(this).is(':checked')) {
            $(`.col_eq${value}`).show();
            eq_checked[num] = true;
        } else {
            $(`.col_eq${value}`).hide();
            eq_checked[num] = false;
        }

        $.getJSON('data/equipments_table.json', function(data) {
            for (var i=0; i<data[type_id].items.length; i++) {
                var show_flag = false;
                for (var j=0; j<data[type_id].items[i].eq.length; j++) {
                    if (eq_checked[j] === false) {
                        continue;
                    }
                    if (data[type_id].items[i].eq[j] !== "") {
                        show_flag = true;
                        break;
                    }
                }
                if (show_flag === true) {
                    $('#ship_' + i).show();
                } else {
                    $('#ship_' + i).hide();
                }
            }
        });
    });
});
