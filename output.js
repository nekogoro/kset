document.addEventListener('DOMContentLoaded', function() {
    var tableData = null;
    var type_id = -1;
    var eq_checked = {};
    var all_color = "transparent";

    fetch('data/equipments_table.json')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            tableData = data;
            buildEquipmentFilters(data.equipments);
            buildTableHeader(data.equipments);
            var select = document.getElementById('select-type');
            for (var i = 0; i < data.types.length; i++) {
                var option = document.createElement('option');
                option.value = i;
                option.textContent = data.types[i].type;
                select.appendChild(option);
            }
            if (data.updated_at) {
                document.getElementById('updated-at').textContent = data.updated_at;
            }
            setEquipmentInputs(function(input) {
                input.disabled = true;
                input.checked = true;
            });
        })
        .catch(function() {
            var row = document.createElement('tr');
            var cell = document.createElement('td');
            cell.textContent = 'データの読み込みに失敗しました。';
            row.appendChild(cell);
            document.querySelector('#equipment-table tbody').appendChild(row);
        });

    function setEquipmentInputs(fn) {
        document.querySelectorAll('input[name=equipment]').forEach(fn);
    }

    function setColumnVisibility(eq_id, visible) {
        document.querySelectorAll('.col_eq_' + eq_id).forEach(function(el) {
            el.style.display = visible ? '' : 'none';
        });
    }

    function buildEquipmentFilters(equipments) {
        var container = document.getElementById('equipment-filters');
        container.textContent = '';
        eq_checked = {};
        equipments.forEach(function(eq) {
            eq_checked[eq.id] = true;
            var label = document.createElement('label');
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'equipment';
            checkbox.value = eq.id;
            checkbox.checked = true;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(eq.label));
            container.appendChild(label);
        });
    }

    function buildTableHeader(equipments) {
        var headerRow = document.getElementById('equipment-header');
        headerRow.textContent = '';
        var nameTh = document.createElement('th');
        nameTh.textContent = '艦名';
        headerRow.appendChild(nameTh);
        equipments.forEach(function(eq) {
            var th = document.createElement('th');
            th.className = 'col_eq_' + eq.id;
            th.textContent = eq.label;
            headerRow.appendChild(th);
        });
    }

    document.getElementById('select-type').addEventListener('change', function(event) {
        if (!tableData) {
            return;
        }
        document.querySelector('#equipment-table tbody').textContent = '';
        setEquipmentInputs(function(input) {
            input.checked = true;
        });
        tableData.equipments.forEach(function(eq) {
            eq_checked[eq.id] = true;
            setColumnVisibility(eq.id, true);
        });
        type_id = parseInt(event.target.value, 10);
        if (isNaN(type_id) || type_id < 0 || type_id >= tableData.types.length) {
            setEquipmentInputs(function(input) {
                input.disabled = true;
            });
            type_id = -1;
            return;
        }
        setEquipmentInputs(function(input) {
            input.disabled = false;
        });
        renderTableBody(tableData.types[type_id].items);
    });

    function renderTableBody(items) {
        var tbody = document.querySelector('#equipment-table tbody');
        tbody.textContent = '';
        for (var i = 0; i < items.length; i++) {
            var row = document.createElement('tr');
            row.id = 'ship_' + i;
            row.appendChild(generate_ship_name_col(items[i].name));
            tableData.equipments.forEach(function(eq) {
                var value = items[i].eq[eq.id];
                var cell = document.createElement('td');
                cell.className = 'cell col_eq_' + eq.id;
                appendEqValue(cell, value);
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        }
    }

    function appendEqValue(cell, value) {
        var node = shorten_eq_col(value);
        if (Array.isArray(node)) {
            cell.append.apply(cell, node);
        } else {
            cell.appendChild(node);
        }
    }

    document.addEventListener('change', function(event) {
        if (event.target.matches('input[name=equipment]')) {
            var id = event.target.value;
            if (event.target.checked) {
                setColumnVisibility(id, true);
                eq_checked[id] = true;
            } else {
                setColumnVisibility(id, false);
                eq_checked[id] = false;
            }
            output_table();
        } else if (event.target.matches('input[name=color]')) {
            all_color = event.target.value;
            output_table();
        } else if (event.target.matches('input[name=shorten]')) {
            setShortenDisplay(event.target.checked);
        }
    });

    function setShortenDisplay(shorten) {
        // .long は stylesheet でも display:none のため、通常表示時は
        // inline 指定で上書きする必要がある（jQuery .show() と同等）
        document.querySelectorAll('.long').forEach(function(el) {
            el.style.display = shorten ? 'none' : 'inline';
        });
        document.querySelectorAll('.short').forEach(function(el) {
            el.style.display = shorten ? '' : 'none';
        });
    }

    document.getElementById('reset_all_checks').addEventListener('click', function() {
        if (!tableData) {
            return;
        }
        tableData.equipments.forEach(function(eq) {
            setColumnVisibility(eq.id, false);
            eq_checked[eq.id] = false;
        });
        setEquipmentInputs(function(input) {
            input.checked = false;
        });
        output_table();
    });

    function output_table() {
        if (!tableData || type_id < 0 || type_id >= tableData.types.length) {
            return;
        }
        var items = tableData.types[type_id].items;
        for (var i = 0; i < items.length; i++) {
            var show_flag = false;
            var all_flag = true;
            var checked_num = document.querySelectorAll('input[name=equipment]:checked').length;
            for (var j = 0; j < tableData.equipments.length; j++) {
                var eq_id = tableData.equipments[j].id;
                if (eq_checked[eq_id] === false) {
                    continue;
                }
                if (hasEq(items[i].eq[eq_id])) {
                    show_flag = true;
                } else {
                    all_flag = false;
                }
                if (show_flag === true && all_flag === false) {
                    break;
                }
            }
            var row = document.getElementById('ship_' + i);
            row.style.display = show_flag === true ? '' : 'none';
            if (all_flag === true && checked_num > 1) {
                row.style.backgroundColor = all_color;
            } else {
                row.style.backgroundColor = 'transparent';
            }
        }
    }
});

function generate_ship_name_col(ship_name) {
    var td = document.createElement('td');
    if (ship_name.indexOf('型') !== -1) {
        td.textContent = ship_name;
        return td;
    }
    var link = document.createElement('a');
    link.href = 'https://wikiwiki.jp/kancolle/' + encodeURIComponent(ship_name);
    link.target = '_blank';
    link.textContent = ship_name;
    td.appendChild(link);
    return td;
}

function hasEq(value) {
    if (value === true) {
        return true;
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
}

function shorten_eq_col(eq_col) {
    var BR = 'br';

    if (eq_col === true) {
        return document.createTextNode('○');
    }
    if (!eq_col || (Array.isArray(eq_col) && eq_col.length === 0)) {
        return document.createTextNode('');
    }
    var array = Array.isArray(eq_col) ? eq_col : String(eq_col).split(',');
    if (array.length === 1) {
        return eq_col_name_node(array[0]);
    }
    var span = document.createElement('span');
    for (var i = 0; i < array.length; i++) {
        appendEqName(span, array[i]);
        if (i < array.length - 1) {
            span.appendChild(document.createElement(BR));
        }
    }
    return span;
}

function appendEqName(parent, eq_name) {
    var node = eq_col_name_node(eq_name);
    if (Array.isArray(node)) {
        parent.append.apply(parent, node);
    } else {
        parent.appendChild(node);
    }
}

function eq_col_name_node(eq_name) {
    if (eq_name.length === 1) {
        return document.createTextNode(eq_name);
    }
    return generate_eq_name(eq_name);
}

function generate_eq_name(eq_name) {
    var CLASS_L = 'long';
    var CLASS_S = 'short';

    var longSpan = document.createElement('span');
    longSpan.className = CLASS_L;
    longSpan.textContent = eq_name;
    longSpan.style.display = 'none';
    var shortSpan = document.createElement('span');
    shortSpan.className = CLASS_S;
    shortSpan.textContent = shorten_eq_name(eq_name);
    // NOTE: .long は stylesheet.css で display:none のため初期表示は短縮形。
    // 既存の挙動を維持している。将来的にはデフォルトで long を表示し、
    // 「簡易表示」チェックで short へ切替える形への修正を推奨。
    return [longSpan, shortSpan];
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
