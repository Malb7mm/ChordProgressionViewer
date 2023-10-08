# ChordFinder

[→概要](../spec/chordfinder.md)

## 実装

### Chord クラス

あるコードの構成音とルート音を格納できる、構造体的なクラス

#### インスタンス変数

- (number Set) components
  - コードの構成音
- (number) root
  - コードのルート音

### ChordName クラス

コードネームとコードの優先度を格納できる、構造体的なクラス

#### インスタンス変数

- (string) name
  - コードネーム
- (number) priority
  - コードの優先度

### ChordFinder クラス

コードネームの検索機能と、それに関連する必要な機能を提供するクラス

#### 静的メソッド

- parse( (string) str )
  - 返り値：(Chord) コード構成音
  - str をコード構成音を表現する文字列として解析し、ソートされたコード構成音の配列とルート音を返す
  - 以下に示す表記を解析できる
    - CDEFGAB
    - ドレミファソラシ
    - どれみふぁそらし
    - イロハニホヘト
    - いろはにほへと
    - #、♯（シャープ記号として）
    - b、♭（フラット記号として）
- find( (Chord) chord )
  - 返り値：(ChordName array) コードネームの配列
  - 渡されたコード構成音とルート音から、該当する全てのコードネームの配列を返す
  - [アルゴリズム詳細](./chordfinder.find.md)
- degree( (string) chordName )
  - 返り値：(string) ディグリーネーム
  - コードネームをディグリー表記に変換する