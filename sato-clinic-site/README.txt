佐藤医院 学習用サンプルサイト

open-site.cmdをダブルクリックすると、トップページをブラウザーで開けます。
起動先はこのファイルと同じフォルダのindex.htmlなので、親フォルダの名前や配置を変更しても使えます。
index.htmlを直接ブラウザーで開くこともできます。
以前の二重階層（sato-clinic-site/sato-clinic-site/index.html）ではなく、現在はサイトフォルダ直下のindex.htmlがトップページです。
PCデザインの基準幅は1440pxです。320px以上の画面幅に対応しています。
HTML / CSS / JavaScriptで構成した静的サイトです。ビルドやサーバー側の処理は不要です。
1023px以下では、右上の三本線でメニューを開閉できます。背景画像は不透明度15％で画面に固定されます。

ページ構成
index.html：トップページ
news.html：お知らせ一覧
news-detail.html：インフルエンザ予防接種について
news-detail-2.html：年末年始の休診について
news-detail-3.html：健康診断のご案内
news-detail-4.html：新型コロナウイルス対策について
news-detail-5.html：オンライン診療の導入について
medical.html：診療内容
about.html：当院について
access.html：診療時間・所在地
faq.html：よくあるご質問
reservation.html：当日受付フォームと受付状況のデザイン見本
css/style.css：全ページ共通のスタイル
css/responsive.css：スマートフォン・タブレット向けのスタイル
assets/：支給された画像とフォント

Zen Kaku Gothic Newのフォントを同梱しています。ネット接続なしでも表示できます。
フォントの利用条件はassets/fonts/OFL.txtをご確認ください。
地図は上野駅周辺を表示するGoogleマップの埋め込みです。地図表示にはネット接続が必要です。
お知らせ一覧の「次のページ」は、追加記事がないため一覧ページ自身への仮リンクです。
全ページにnoindex, nofollowと学習用サンプルサイトの断り書きを設定しています。

GitHub Pagesでの公開
リポジトリ直下の.github/workflows/deploy-pages.ymlが、mainへのpush時にこのサイトフォルダを公開します。
GitHubのSettings > Pages > Build and deployment > SourceはGitHub Actionsを選択してください。
HTML・CSS・JavaScript・画像・フォントとワークフローを、新規ファイルも含めてコミット・pushしてください。
公開URLは https://tanaka120202.github.io/20260814_tanaka-kenta_edixworks/ です。
ワークフローはsato-clinic-siteフォルダの中身を公開するため、公開URLに/sato-clinic-site/は付けません。
HTML・CSSのリンクは相対パスなので、GitHub Pagesのリポジトリ配下でも参照できます。
Actionsの実行成功後、github-pages環境に表示されるURLで確認してください。
当日受付ページはデザインのみです。受付番号・案内中の番号・残りの順番は固定の表示例で、番号発行・状況更新・入力内容の送信は行いません。
公式手順：https://docs.github.com/ja/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

本サイトは職業訓練の学習用に制作した架空のサンプルサイトです。掲載している医院・人物・連絡先・所在地はすべて架空であり、実在のものとは関係ありません。
