'use strict';
// HTMLのエレメントを取得
const userNameInput = document.getElementById('user-name');		// 名前を入力するテキストボックス
const seekButton = document.getElementById('seek-button');		// 診断ボタン
const resultDivided = document.getElementById('result-area');	// 結果表示エリアdiv
const mapDivided = document.getElementById('map-area');			// map表示エリアdiv
const coordinateDivided = document.getElementById('lat-long');	// map表示エリアdiv
// 変数の宣言と初期化
var userName = null;	// 診断する名前
var latitude = 0;		// 緯度
var longitude = 0;		// 経度

/**
 * ボタンを押した時の処理
 */
seekButton.onclick = () => {
	// テキストボックスに入力された名前を取得
	userName = userNameInput.value;
	if (userName.length === 0) {
		return;	// userNameが空のときは終了する
	}
	// パワースポットの緯度・経度を取得
	seekSpot();

	// 診断結果表示エリアを初期化
	removeAllChildren(resultDivided);
	// 診断結果表示エリアの作成
	createResultArea();

	// mapエリアの初期化
	removeAllChildren(mapDivided);
	// mapエリアの作成
	createMapArea();

	// 座標表示エリアを初期化
	removeAllChildren(coordinateDivided);
	// 座標表示エリアの作成
	createCoordinateArea();
};

/**
 * 指定した要素の子要素を全て削除する
 * @param {HTMLElement} element HTMLの要素
 */
function removeAllChildren(element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
};

/**
 * 診断結果表示エリアを作成する
 */
function createResultArea() {
	// userNameと案内文をresult-dividedのdivに入れる
	const header = document.createElement('h3');
	header.innerText = userName + 'さんのパワースポットはこの辺りです。';
	resultDivided.appendChild(header);
	const paragraph = document.createElement('p');
	paragraph.innerText = '何もなさそう？ 「ー」ボタンでズームアウトしてみよう';
	resultDivided.appendChild(paragraph);
};

/**
 * mapエリアを作成する
 */
function createMapArea() {
	// map埋め込み用のiframeタグの作成
	const mapFrame = document.createElement('iframe');
	// iframeの属性値を代入
	let srcValue =
		'https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d14392.693440469557!2d'
		+ longitude + '!3d' + latitude
		+ '!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sja!2sjp!4v1596033220929!5m2!1sja!2sjp';
	// 属性に値をセット
	mapFrame.setAttribute('src', srcValue);
	mapFrame.setAttribute('width', 480);
	mapFrame.setAttribute('height', 360);
	mapFrame.setAttribute('frameborder', 0);
	mapFrame.setAttribute('style', 'border:0;');
	mapFrame.setAttribute('allowfullscreen', '');
	mapFrame.setAttribute('aria-hidden', 'false');
	mapFrame.setAttribute('tabindex', 0);
	// map-areaのdivに入れる
	mapDivided.appendChild(mapFrame);
};

/**
 * 座標表示エリアを作成する
 */
function createCoordinateArea() {
	// 座標を文章にしてcoordinate-dividedのdivに入れる
	const coordinateP = document.createElement('p');
	coordinateP.innerText = 'パワースポットの座標は　緯度：' + latitude.toFixed(5) + '、経度：' + longitude.toFixed(5);
	coordinateDivided.appendChild(coordinateP);
};

/**
 * 名前の文字列から文字コードを取得し、文字コードから座標を作る関数
 */
function seekSpot() {
	let sumOfCharCode = 0;	// userNameの文字コードから生成した数字
	for (let i = 0; i < userName.length; i++) {	// 全文字のコード番号を取得
		// userName === 太郎 の時と、userName === 郎太 の時で結果を変える処理
		sumOfCharCode = sumOfCharCode + userName.charCodeAt(i) * 10 ** i + 1;
	}
	// 座標（緯度 -85 〜 85）
	let latIntegral = sumOfCharCode % 170 - 85;	// 整数部を作る。GoogleMapの表示範囲に収めるため -85 〜 85
	let latFractional = parseFloat("0."+(String(sumOfCharCode / 180)).split(".")[1]);	// 小数部を作る。なんとなく180で割り算して数字を長くする
	latitude = latIntegral + latFractional;	// 整数部と小数部の合体
	// 座標（経度 −180 〜 180）
	let longIntegral = sumOfCharCode % 360 - 180;
	let longFractional = parseFloat("0."+(String(sumOfCharCode / 360)).split(".")[1]);	// 小数部を作る。なんとなく180で割り算して数字を長くする
	longitude = longIntegral + longFractional; // 小数部を作る。なんとなく360で割り算して数字を長くする
};

// エンターキーでもOKにする
// macの日本語変換確定のエンターキーは無視する
userNameInput.onkeydown = event => {
	if (event.key === 'Enter') {
		if (!event.isComposing) {
			seekButton.onclick();
		}
	}
};
