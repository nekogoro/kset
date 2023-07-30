$(function() {
    var type_id;
    var eq_checked = [true, true, true, true, true, true, true, true];
    var checked_num = [8];
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
                    var ship_name = data[type_id].items[i].name;
                    var ship_id = 'ship_' + i;
                    $('#equipment-table tbody').append('<tr id="'+ship_id+'"></tr>')
                    $('#'+ship_id).append(generate_ship_name_col(ship_name));
                    for(var j=0; j<data[type_id].items[i].eq.length; j++) {
                        var eq_class = 'col_eq' + j;
                        var eq_enable = shorten_eq_col(data[type_id].items[i].eq[j]);
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

    $('input[name=shorten]').change(function() {
        if ($(this).is(':checked')) {
            $('.long').hide();
            $('.short').show();
        } else {
            $('.long').show();
            $('.short').hide();
        }
    })
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

function generate_ship_name_col(ship_name) {
    const TAG_TD_1 = '<td>';
    const TAG_TD_2 = '</td>';
    const TAG_LINK_1 = '<a href="https://wikiwiki.jp/kancolle/';
    const TAG_LINK_2 = '" target="_blank">';
    if (ship_name.indexOf("型") !== -1) {
        return TAG_TD_1 + ship_name + TAG_TD_2;
    }
    return TAG_TD_1 + TAG_LINK_1 + ship_name + TAG_LINK_2 + ship_name + TAG_TD_2;
}

function shorten_eq_col(eq_col) {
    const BR = '<br/>';
    const COMMA =',';

    if (eq_col.length === 1) {
        return eq_col;
    }
    if (eq_col.indexOf(COMMA) === -1) {
        return generate_eq_name(eq_col);
    }
    var array = eq_col.split(COMMA);
    var new_eq_col = '';
    for (var i=0; i<array.length; i++) {
        new_eq_col += generate_eq_name(array[i]) + BR;
    }
    return new_eq_col.slice(0, -5);
}

function generate_eq_name(eq_name) {
    const CLASS_1 = '<span class="';
    const CLASS_2 = '">';
    const CLASS_3 = '</span>'
    const CLASS_L = 'long';
    const CLASS_S = 'short';

    return CLASS_1 + CLASS_L + CLASS_2 + eq_name + CLASS_3
        + CLASS_1 + CLASS_S + CLASS_2 + shorten_eq_name(eq_name) + CLASS_3;

}

function shorten_eq_name(eq_name) {
    switch(eq_name) {
        case "13号対空電探系":
            return "13号電探系";
        case "22号水上電探系":
            return "22号電探系";
        case "電探装備マスト(13号改＋22号電探改四)":
            return "電探マスト";
        case "精鋭水雷戦隊 司令部":
            return "水雷司令部";
        case "増加爆雷":
            return "爆雷";
        case "強化型艦本式缶・新型高温高圧缶":
            return "強化缶・新型缶";
        default:
            return eq_name;
    }
}