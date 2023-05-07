$(function() {
    var type_id;
    var eq_checked = [true, true, true, true, true, true];
    var all_color = "transparent";

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
            $(`.col_eq${i}`).show();
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

    $('input[name=equipment]').change(function() {
        var value = $(this).val();
        var num = parseInt(value);
        if ($(this).is(':checked')) {
            $(`.col_eq${value}`).show();
            eq_checked[num] = true;
        } else {
            $(`.col_eq${value}`).hide();
            eq_checked[num] = false;
        }
        output_table(type_id, eq_checked, all_color);
    });

    $('input[name=color]').change(function() {
        all_color = $(this).val();
        output_table(type_id, eq_checked, all_color);
    });
});

function output_table(type_id, eq_checked, all_color) {
    $.getJSON('data/equipments_table.json', function(data) {
        for (var i=0; i<data[type_id].items.length; i++) {
            var show_flag = false;
            var all_flag = true;
            var checked_num = $('input[name=equipment]:checked').length;
            for (var j=0; j<data[type_id].items[i].eq.length; j++) {
                if (eq_checked[j] === false) {
                    continue;
                }
                if (data[type_id].items[i].eq[j] !== "") {
                    show_flag = true;
                } else {
                    all_flag = false;
                }
                if (show_flag === true && all_flag === false) {
                    break;
                }
            }
            if (show_flag === true) {
                $('#ship_' + i).show();
            } else {
                $('#ship_' + i).hide();
            }
            if (all_flag === true && checked_num > 1) {
                $('#ship_' + i).css('background-color', all_color);
            } else {
                $('#ship_' + i).css('background-color', 'transparent');
            }
        }
    });
}