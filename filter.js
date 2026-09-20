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
        if (all_flag === true && checked_num > 1) {
            row.style.backgroundColor = all_color;
        } else {
            row.style.backgroundColor = 'transparent';
        }
    }
}
