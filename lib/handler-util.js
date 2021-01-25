'use strict';
const fs = require('fs');

function handleLogout(req, res) {
  res.writeHead(401, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end('<!DOCTYPE html><html lang="jp"><body>' +
    '<h1>ログアウトしました</h1>' +
    '<a href="/posts">ログイン</h1>' +
    '</body></html>');
}

function handleNotFound(req, res) {
  res.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('ページがみつかりません');
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('未対応のリクエストです');
}

function handleFavicon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon'
  });
  const favicon = fs.readFileSync('img/favicon.ico');
  res.end(favicon);
}

function handleIcon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/png'
  });
  const icon = fs.readFileSync('img/search_mushimegane.png');
  res.end(icon);
}

function handleBgimg(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/png'
  });
  const bgimg = fs.readFileSync('img/sekaichizu.png');
  res.end(bgimg);
}
module.exports = {
  handleLogout,
  handleNotFound,
  handleBadRequest,
  handleFavicon,
  handleIcon,
  handleBgimg
};