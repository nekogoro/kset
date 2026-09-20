// 表示整形層: 状態を持たない純粋関数群。
// 値 (true / 配列 / 文字列) や艦名を DOM ノードに変換する。
export function hasEq(value) {
    if (value === true) {
        return true;
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
}

export function shorten_eq_name(eq_name) {
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

export function generate_ship_name_col(ship_name) {
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

// 単一ノードまたはノード配列を親に追加する。
export function appendNodes(parent, node) {
    if (Array.isArray(node)) {
        parent.append.apply(parent, node);
    } else {
        parent.appendChild(node);
    }
}

function generate_eq_name(eq_name) {
    var longSpan = document.createElement('span');
    longSpan.className = 'long';
    longSpan.textContent = eq_name;
    longSpan.style.display = 'none';
    var shortSpan = document.createElement('span');
    shortSpan.className = 'short';
    shortSpan.textContent = shorten_eq_name(eq_name);
    // NOTE: .long は stylesheet.css で display:none のため初期表示は短縮形。
    // 既存の挙動を維持している。将来的にはデフォルトで long を表示し、
    // 「簡易表示」チェックで short へ切替える形への修正を推奨。
    return [longSpan, shortSpan];
}

function eq_col_name_node(eq_name) {
    if (eq_name.length === 1) {
        return document.createTextNode(eq_name);
    }
    return generate_eq_name(eq_name);
}

export function shorten_eq_col(eq_col) {
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
        appendNodes(span, eq_col_name_node(array[i]));
        if (i < array.length - 1) {
            span.appendChild(document.createElement('br'));
        }
    }
    return span;
}
