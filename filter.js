// 絞り込み層: チェック状態に応じた行の表示・強調を担当する。
// DOM の構築は行わず、引数で渡された項目にのみ作用する。
import { hasEq } from './format.js';

export function applyFilter(items, equipments, eq_checked, all_color, checked_num) {
    for (var i = 0; i < items.length; i++) {
        var show_flag = false;
        var all_flag = true;
        for (var j = 0; j < equipments.length; j++) {
            var eq_id = equipments[j].id;
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
        // 背景色は CSS 変数経由で渡す。既定色は stylesheet 側の
        // `#equipment-table tbody tr` が持つため、直接 backgroundColor を
        // 書き換える方式より詳細度競合に強い。
        if (all_flag === true && checked_num > 1) {
            row.style.setProperty('--row-bg', all_color);
        } else {
            row.style.setProperty('--row-bg', 'transparent');
        }
    }
}
