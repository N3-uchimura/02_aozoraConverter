<table>
	<thead>
    	<tr>
      		<th style="text-align:center">English</th>
      		<th style="text-align:center"><a href="README-ja.md">日本語</a></th>
    	</tr>
  	</thead>
</table>

## name

aozoraConverter

## Overview

- This is converter which convert wav to m4a.
- Quality and sampling rate are configurable.
- Ffmpeg [ffmpeg download](https://www.ffmpeg.org/download.html) should be installed.

## Requirement

Windows10 ~

## Setting

### From souce

1. Download zip or pull repository.
2. Execute below on cmd.
   ```
   npm install
   npm start
   ```

- node.js environment required.

### From exe

1. Download exe file from release.
2. DoubleClick on exe file and install.

## Usage

1. Press "Select Direcotry" button and select target directory.
2. Select "quality" and "sampling rate"(default 92kbps, 44100Hz)
3. Press "Convert" button.
4. converted m4a files are restored to resources/file/output.

## Features

- You can change default language to English by pressing "Config" button and check off "japanese".

## Author

N3-Uchimura

## Licence

[MIT](https://mit-license.org/)
