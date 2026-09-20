// DOM 構築層: テーブルやフィルタの生成・表示切替を担当する。
// アプリの状態 (選択中の艦種など) は持たず、引数で受け取る。
import { appendNodes, generate_ship_name_col, shorten_eq_col } from './format.js';

export function setEquipmentInputs(fn) {
    document.querySelectorAll('input[name=equipment]').forEach(fn);
}

export function countCheckedEquipment() {
    return document.querySelectorAll('input[name=equipment]:checked').length;
}

export function setColumnVisibility(eq_id, visible) {
    document.querySelectorAll('.col_eq_' + eq_id).forEach(function(el) {
        el.style.display = visible ? '' : 'none';
    });
}

export function setShortenDisplay(shorten) {
    // .long は stylesheet でも display:none のため、通常表示時は
    // inline 指定で上書きする必要がある
    document.querySelectorAll('.long').forEach(function(el) {
        el.style.display = shorten ? 'none' : 'inline';
    });
    document.querySelectorAll('.short').forEach(function(el) {
        el.style.display = shorten ? '' : 'none';
    });
}

export function buildEquipmentFilters(container, equipments, eq_checked) {
    container.textContent = '';
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

export function buildTableHeader(headerRow, equipments) {
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

export function renderTableBody(tbody, items, equipments) {
    tbody.textContent = '';
    for (var i = 0; i < items.length; i++) {
        var row = document.createElement('tr');
        row.id = 'ship_' + i;
        row.appendChild(generate_ship_name_col(items[i].name));
        equipments.forEach(function(eq) {
            var cell = document.createElement('td');
            cell.className = 'cell col_eq_' + eq.id;
            appendNodes(cell, shorten_eq_col(items[i].eq[eq.id]));
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    }
}

export function showLoadError(tbody) {
    var row = document.createElement('tr');
    var cell = document.createElement('td');
    cell.textContent = 'データの読み込みに失敗しました。';
    row.appendChild(cell);
    tbody.appendChild(row);
}
