<table>
	<thead>
    	<tr>
      		<th style="text-align:center"><a href="README.md">English</a></th>
      		<th style="text-align:center">日本語</th>
    	</tr>
  	</thead>
</table>

## name

青空コンバータ

## Overview

- フォルダ内の WAV ファイルを M4A に全変換します。
- 品質とサンプリングレートの指定が可能です。
- 予めffmpeg [ffmpeg download](https://www.ffmpeg.org/download.html).のインストールが必要です。

## Requirement

Windows10 ~

## Setting

### From souce

1. リリースから ZIP ファイルをダウンロードするか、リポジトリを pull します。
2. コマンドプロンプトを開き、解凍したフォルダか git フォルダ内に移動します。
   ```
   cd C:\home
   ```
3. 以下のコマンドを実行します。
   ```
   npm install
   npm start
   ```

- node.js の実行環境が必要です。

### From exe

1. リリースから EXE ファイルをダウンロードします。
2. ダウンロードした EXE ファイルを実行し、インストールします。

## Usage

1. 「フォルダ選択」を押して対象のフォルダを指定します。
2. 品質・サンプリング周波数を指定します。(標準 92kbps, 44100Hz)
3. 「ファイル変換」を押すと、resources/file/output に変換された m4a ファイルが保存されます。

## Features

- 「設定」ボタンを押して設定ページに移動し、「日本語」のチェックを外すことで英語になります。

## Author

N3-Uchimura

## Licence

[MIT](https://mit-license.org/)
