$(function() {
    var tableData = null;
    var type_id = -1;
    var eq_checked = {};
    var all_color = "transparent";

    $.getJSON('data/equipments_table.json', function(data) {
        tableData = data;
        buildEquipmentFilters(data.equipments);
        buildTableHeader(data.equipments);
        for (var i = 0; i < data.types.length; i++) {
            $('#select-type').append($('<option>').attr('value', i).text(data.types[i].type));
        }
        if (data.updated_at) {
            $('#updated-at').text(data.updated_at);
        }
        $('input[name=equipment]').prop('disabled', true).prop('checked', true);
    }).fail(function() {
        $('#equipment-table tbody').append('<tr><td>データの読み込みに失敗しました。</td></tr>');
    });

    function buildEquipmentFilters(equipments) {
        var container = $('#equipment-filters');
        container.empty();
        eq_checked = {};
        equipments.forEach(function(eq) {
            eq_checked[eq.id] = true;
            var label = $('<label>');
            var checkbox = $('<input>').attr({ type: 'checkbox', name: 'equipment', value: eq.id }).prop('checked', true);
            label.append(checkbox).append(document.createTextNode(eq.label));
            container.append(label);
        });
    }

    function buildTableHeader(equipments) {
        var headerRow = $('#equipment-header');
        headerRow.empty();
        headerRow.append($('<th>').text('艦名'));
        equipments.forEach(function(eq) {
            headerRow.append($('<th>').addClass('col_eq_' + eq.id).text(eq.label));
        });
    }

    $('#select-type').change(function() {
        if (!tableData) {
            return;
        }
        $('#equipment-table tbody').empty();
        $('input[name=equipment]').prop('checked', true);
        tableData.equipments.forEach(function(eq) {
            eq_checked[eq.id] = true;
            $('.col_eq_' + eq.id).show();
        });
        type_id = parseInt($(this).val(), 10);
        if (isNaN(type_id) || type_id < 0 || type_id >= tableData.types.length) {
            $('input[name=equipment]').prop('disabled', true);
            type_id = -1;
            return;
        }
        $('input[name=equipment]').prop('disabled', false);
        renderTableBody(tableData.types[type_id].items);
    });

    function renderTableBody(items) {
        var tbody = $('#equipment-table tbody');
        tbody.empty();
        for (var i = 0; i < items.length; i++) {
            var ship_id = 'ship_' + i;
            var row = $('<tr>').attr('id', ship_id);
            row.append(generate_ship_name_col(items[i].name));
            tableData.equipments.forEach(function(eq) {
                var value = items[i].eq[eq.id] || '';
                var cell = $('<td>').addClass('cell col_eq_' + eq.id);
                cell.append(shorten_eq_col(value));
                row.append(cell);
            });
            tbody.append(row);
        }
    }

    $(document).on('change', 'input[name=equipment]', function() {
        var id = $(this).val();
        if ($(this).is(':checked')) {
            $('.col_eq_' + id).show();
            eq_checked[id] = true;
        } else {
            $('.col_eq_' + id).hide();
            eq_checked[id] = false;
        }
        output_table();
    });

    $('button[id=reset_all_checks]').on('click', function() {
        if (!tableData) {
            return;
        }
        tableData.equipments.forEach(function(eq) {
            $('.col_eq_' + eq.id).hide();
            eq_checked[eq.id] = false;
        });
        $('input[name=equipment]').each(function() {
            this.checked = false;
        });
        output_table();
    });

    $('input[name=color]').change(function() {
        all_color = $(this).val();
        output_table();
    });

    $('input[name=shorten]').change(function() {
        if ($(this).is(':checked')) {
            $('.long').hide();
            $('.short').show();
        } else {
            $('.long').show();
            $('.short').hide();
        }
    });
    function output_table() {
        if (!tableData || type_id < 0 || type_id >= tableData.types.length) {
            return;
        }
        var items = tableData.types[type_id].items;
        for (var i = 0; i < items.length; i++) {
            var show_flag = false;
            var all_flag = true;
            var checked_num = $('input[name=equipment]:checked').length;
            for (var j = 0; j < tableData.equipments.length; j++) {
                var eq_id = tableData.equipments[j].id;
                if (eq_checked[eq_id] === false) {
                    continue;
                }
                if ((items[i].eq[eq_id] || '') !== '') {
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
    }
});

function generate_ship_name_col(ship_name) {
    var td = $('<td>');
    if (ship_name.indexOf('型') !== -1) {
        td.text(ship_name);
        return td;
    }
    var link = $('<a>')
        .attr('href', 'https://wikiwiki.jp/kancolle/' + encodeURIComponent(ship_name))
        .attr('target', '_blank')
        .text(ship_name);
    td.append(link);
    return td;
}

function shorten_eq_col(eq_col) {
    var BR = '<br/>';
    var COMMA = ',';

    if (!eq_col) {
        return document.createTextNode('');
    }
    if (eq_col.length === 1) {
        return document.createTextNode(eq_col);
    }
    if (eq_col.indexOf(COMMA) === -1) {
        return generate_eq_name(eq_col);
    }
    var array = eq_col.split(COMMA);
    var span = $('<span>');
    for (var i = 0; i < array.length; i++) {
        span.append(generate_eq_name(array[i]));
        if (i < array.length - 1) {
            span.append(BR);
        }
    }
    return span;
}

function generate_eq_name(eq_name) {
    var CLASS_L = 'long';
    var CLASS_S = 'short';

    var longSpan = $('<span>').addClass(CLASS_L).text(eq_name).hide();
    var shortSpan = $('<span>').addClass(CLASS_S).text(shorten_eq_name(eq_name));
    // NOTE: .long は stylesheet.css で display:none のため初期表示は短縮形。
    // 既存の挙動を維持している。将来的にはデフォルトで long を表示し、
    // 「簡易表示」チェックで short へ切替える形への修正を推奨。
    return [longSpan[0], shortSpan[0]];
}

function shorten_eq_name(eq_name) {
    switch(eq_name) {
        case '13号対空電探系':
            return '13号電探系';
        case '22号水上電探系':
            return '22号電探系';
        case '電探装備マスト(13号改＋22号電探改四)':
            return '電探マスト';
        case '精鋭水雷戦隊 司令部':
            return '水雷司令部';
        case '増加爆雷':
            return '爆雷';
        case '三式爆雷投射機系':
            return '爆雷投射機';
        default:
            return eq_name;
    }
}
