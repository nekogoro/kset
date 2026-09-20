// データ取得層: 装備対照表 JSON の読み込みのみを担当する。
// DOM 操作やアプリの状態は持たない。
export function fetchTableData(url) {
    return fetch(url).then(function(response) {
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        return response.json();
    });
}
