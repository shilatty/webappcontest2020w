'use strict';
const crypto = require('crypto');
const pug = require('pug');
const Cookies = require('cookies');
const moment = require('moment-timezone');
const util = require('./handler-util');
const Post = require('./post');

var latitude = 0;		// 緯度
var longitude = 0;		// 経度

const trackingIdKey = 'tracking_id';

const oneTimeTokenMap = new Map(); // キーをユーザー名、値をトークンとする連想配列




function handle(req, res) {
  const cookies = new Cookies(req, res);
  const trackingId = addTrackingCookie(cookies, req.user);
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      Post.findAll({ order: [['id', 'DESC']] }).then((posts) => {
        posts.forEach((post) => {
          post.content = post.content.replace(/\+/g, ' ');
          post.formattedCreatedAt = moment(post.createdAt).tz('Asia/Tokyo').format('YYYY年MM月DD日 HH時mm分ss秒');
        });
        const oneTimeToken = crypto.randomBytes(8).toString('hex');
        oneTimeTokenMap.set(req.user, oneTimeToken);
        res.end(pug.renderFile('./views/posts.pug', {
          posts: posts,
          user: req.user,
          oneTimeToken: oneTimeToken
        }));
        console.info(
          `閲覧されました: user: ${req.user}, ` +
          `trackinId: ${trackingId},` +
          `remoteAddress: ${req.connection.remoteAddress}, ` +
          `userAgent: ${req.headers['user-agent']} `
        );
      });
      break;
    case 'POST':
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        const matchResult = decoded.match(/content=(.*)&oneTimeToken=(.*)/);
        if (!matchResult) {
          util.handleBadRequest(req, res);
        } else {
          const content = matchResult[1];
          const requestedOneTimeToken = matchResult[2];

// scopeとかよくわからないってことを自覚した。この関数をどこかかっこいいところに置きたかった。
          function seekSpot() {
            let sumOfCharCode = 0;	// userNameの文字コードから生成した数字
            for (let i = 0; i < content.length; i++) {	// 全文字のコード番号を取得
              // userName === 太郎 の時と、userName === 郎太 の時で結果を変える処理
              sumOfCharCode = sumOfCharCode + content.charCodeAt(i) * 10 ** i + 1;
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
          seekSpot();

          if (oneTimeTokenMap.get(req.user) === requestedOneTimeToken) {
            console.info('投稿されました: ' + content);
            Post.create({
              // content: content,
              content: `私は${content}です。パワースポットの座標は 緯度：${latitude.toFixed(3)}、経度：${longitude.toFixed(3)}です。`,
              trackingCookie: trackingId,
              postedBy: req.user,
              // mapSrc: 'abcdef'
              mapSrc: `https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d14392.693440469557!2d${longitude}!3d${latitude}!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sja!2sjp!4v1596033220929!5m2!1sja!2sjp`
            }).then(() => {
              oneTimeTokenMap.delete(req.user);
              handleRedirectPosts(req, res);
            });
          } else {
            util.handleBadRequest(req, res);
          }
        }
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function handleDelete(req, res) {
  switch (req.method) {
    case 'POST':
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        const dataArray = decoded.split('&');
        const id = dataArray[0] ? dataArray[0].split('id=')[1] : '';
        const requestedOneTimeToken = dataArray[1] ? dataArray[1].split('oneTimeToken=')[1] : '';
        if (oneTimeTokenMap.get(req.user) === requestedOneTimeToken) {
          Post.findByPk(id).then((post) => {
            if (req.user === post.postedBy || req.user === 'admin') {
              post.destroy().then(() => {
                console.info(
                  `削除されました: user: ${req.user}, ` +
                  `remoteAddress: ${req.connection.remoteAddress}, ` +
                  `userAgent: ${req.headers['user-agent']} `
                );
                oneTimeTokenMap.delete(req.user);
                handleRedirectPosts(req, res);
              });
            }
          });
        } else {
          util.handleBadRequest(req, res);
        }
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

/**
 * Cookieに含まれているトラッキングIDに異常がなければその値を返し、
 * 存在しない場合や異常なものである場合には、再度作成しCookieに付与してその値を返す
 * @param {Cookeies} cookies
 * @param {String} userName
 * @return {String} トラッキングID
 */
function addTrackingCookie(cookies, userName) {
  const requestedTrackingId = cookies.get(trackingIdKey);
  if (isValidTrackingId(requestedTrackingId, userName)) {
    return requestedTrackingId;
  } else {
    const originalId = parseInt(crypto.randomBytes(8).toString('hex'), 16);
    const tomorrow = new Date(new Date().getTime() + (1000 * 60 * 60 * 24));
    const trackingId = originalId + '_' + createValidHash(originalId, userName);
    cookies.set(trackingIdKey, trackingId, { expires: tomorrow });
    return trackingId;
  }
}

function isValidTrackingId(trackingId, userName) {
  if (!trackingId) {
    return false;
  }
  const spilited = trackingId.split('_');
  const originalId = spilited[0];
  const requestedHash = spilited[1];
  return createValidHash(originalId, userName) === requestedHash;
}

const secretKey =
  '5a69bb55532235125986a0df24aca759f69bae045c7a66d6e2bc4652e3efb43da4' +
  'd1256ca5ac705b9cf0eb2c6abb4adb78cba82f20596985c5216647ec218e84905a' +
  '9f668a6d3090653b3be84d46a7a4578194764d8306541c0411cb23fbdbd611b5e0' +
  'cd8fca86980a91d68dc05a3ac5fb52f16b33a6f3260c5a5eb88ffaee07774fe2c0' +
  '825c42fbba7c909e937a9f947d90ded280bb18f5b43659d6fa0521dbc72ecc9b4b' +
  'a7d958360c810dbd94bbfcfd80d0966e90906df302a870cdbffe655145cc4155a2' +
  '0d0d019b67899a912e0892630c0386829aa2c1f1237bf4f63d73711117410c2fc5' +
  '0c1472e87ecd6844d0805cd97c0ea8bbfbda507293beebc5d9';

function createValidHash(originalId, userName) {
  const sha1sum = crypto.createHash('sha1');
  sha1sum.update(originalId + userName + secretKey);
  return sha1sum.digest('hex');
}

function handleRedirectPosts(req, res) {
  res.writeHead(303, {
    'Location': '/posts'
  });
  res.end();
}

module.exports = {
  handle,
  handleDelete
};
