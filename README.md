# onyx_shaving
onyx_dでタイルの要らないデータを削除して配信するサーバ

[onyx](https://github.com/un-vector-tile-toolkit/onyx/blob/master/app.js)を簡略化した[onyx_d](https://github.com/mghs15/onyx_d)に[vtshaver](https://github.com/mapbox/vtshaver)でタイルデータを整理して配信できるようにしてみたもの。

作業フォルダなので、きちんとしたものではありません。

package.jsonはonyxのものにvtshaverを追加したものです。
（`name`や`description`はonyxのままになっていますので注意。）
`config/default.hjson`はonyx_dを参照。

```
npm install

# set style you want to use
mkdir style
touch ./style/test.json

mkdir htdocs
mkdir mbtiles
mkdir config
touch ./config/default.hjson
```

## 参考文献

* https://github.com/un-vector-tile-toolkit/onyx/blob/master/app.js
* https://github.com/mapbox/vtshaver

