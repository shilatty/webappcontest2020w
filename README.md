# Name

パワースポット掲示板 / Power spot assessment BBS

投稿者のハンドルネームから、パワースポットを診断し自動で投稿する掲示板です
 
# DEMO

Herokuで公開しています
https://radiant-caverns-32702.herokuapp.com/posts
 
# Features
 
2020夏のコンテストでは、パワースポット診断を作りました。だんだん授業も難しくなってきましたが、今年の目標は「わからなくても最後までやる」なので、写経やお祈りでなんとか4章まで来ることができました。
冬のコンテストもなんとか提出したいと思い、2回めの座談会で、「一番しょぼい出し方は？」と質問したところ、授業の掲示板をちょっと変えるだけも良い、と先生におっしゃっていただいたので勇気づけられました。

夏より少しだけどできるようになってる、という思いを確認するために、夏にやったことをサーバーサイドに実装する、というのを目標にしました。

夏のコンテストで、自分で書いたコードを、先生方にレビューしてもらったという経験が大変嬉しく、レビューでコメントを頂いた箇所をひとつでも改善しようと思い、以下にチャレンジしました

・コメント
１） 文字連結が多い、テンプレートリテラルがおすすめ

・チャレンジ
１） テンプレートリテラルは授業でもおなじみになってきたので、使うことができました

 
・コメント
２） パワースポットの一にGoogleMapのポインタをつけることができそう、調べてみて

・チャレンジ
２） 夏に調べたときに、任意の座標につけることができない仕様のようだったので、CSSで地図の真ん中付近に★マークを重ねることにしました
 
# Requirement
 
Google Chromeで動作します
 
# Usage
 
DEMO用のID/PWは以下のとおりです

| ID | PW |
----|---- 
| admin | SW8fe?O_ |
| guest1 | Hi#+C7LK |
| guest2 | _AsU=h6g |

# Author
 
* 作成者： shilatty しらってぃー　飼い犬の名前です
* 所属：　 メカ系エンジニア 社会人20年生です。学生の頃から柔らかい系が苦手で、プログラミングの授業についていけませんでした。
         UNIXを使ってviでコードを書き、ftpで提出する、という授業で覚えたことは、ファイルをコピーして、ログイン履歴を改ざんして赤点から逃れる方法だけでした。
         仕事でもプログラムで自動化できたらなぁと思うことが多々あり勉強したい気持ちはありましたが、本を読んでもわからず20年間なにもできませんでしたがN予備校に出会って、
         はじめてプログラムで何かを作り、レビューしていただきどうにかゴールできそうです。
 
# License

Power spot assessment BBS is under [MIT license](https://en.wikipedia.org/wiki/MIT_License).
