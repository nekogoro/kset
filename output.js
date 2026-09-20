// エントリ: アプリの状態保持とイベント配線のみを担当する。
// データ取得は data.js、DOM 構築は render.js、絞り込みは filter.js、
// 値の整形は format.js に分離している。
import { fetchTableData } from './data.js';
import { applyFilter } from './filter.js';
import {
    buildEquipmentFilters,
    buildTableHeader,
    countCheckedEquipment,
    renderTableBody,
    setColumnVisibility,
    setEquipmentInputs,
    setShortenDisplay,
    showLoadError
} from './render.js';

document.addEventListener('DOMContentLoaded', function() {
    var tableData = null;
    var type_id = -1;
    var eq_checked = {};
    var all_color = "transparent";

    fetchTableData('data/equipments_table.json')
        .then(function(data) {
            tableData = data;
            buildEquipmentFilters(document.getElementById('equipment-filters'), data.equipments, eq_checked);
            buildTableHeader(document.getElementById('equipment-header'), data.equipments);
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
            showLoadError(document.querySelector('#equipment-table tbody'));
        });

    function output_table() {
        if (!tableData || type_id < 0 || type_id >= tableData.types.length) {
            return;
        }
        applyFilter(
            tableData.types[type_id].items,
            tableData.equipments,
            eq_checked,
            all_color,
            countCheckedEquipment()
        );
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
        renderTableBody(
            document.querySelector('#equipment-table tbody'),
            tableData.types[type_id].items,
            tableData.equipments
        );
    });

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
});
