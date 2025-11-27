/**
 * ElFfmpeg.ts
 *
 * ElFfmpeg
 * ElFfmpeg operation for electron
 * updated: 2025/08/24
 **/

'use strict';

// define modules
import { statSync } from 'node:fs'; // file system
import { spawn, execFile, execSync } from "node:child_process";
import { promisify } from "util";

// ffmpeg class
class ElFfmpeg {
  static logger: any; // static logger
  static execFileAsync: any; // exec

  // construnctor
  constructor(logger: any) {
    // logger setting
    ElFfmpeg.logger = logger;
    // set exec
    ElFfmpeg.execFileAsync = promisify(execFile);
  }

  // merge audios
  mergeAudio(
    filePaths: string[],
    outputPath: string,
    timeout: number,
    maxBuffer: number
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // merge commands
        let finalFiles: string[] = [];
        let fileCommands: string[] = [];
        let outCommands: string = '';

        // loop for files
        filePaths.forEach((file: any) => {
          // file info
          const fileInfo: any = statSync(file);
          if (fileInfo.size > 0) {
            finalFiles.push(file);
          }
        });
        console.log(finalFiles);
        // file length
        const fileLength: number = finalFiles.length;

        // loop for files
        for (let i = 0; i < fileLength; i++) {
          // file info
          const fileInfo: any = statSync(finalFiles[i]);
          // filesize is over 0
          if (fileInfo.size > 0) {
            fileCommands.push("-i");
            fileCommands.push(finalFiles[i]);
            outCommands += `[${i}:a]`;
          }
        }
        outCommands += `concat=n=${fileLength}:v=0:a=1`;

        // arguments
        const args = [
          "-y",
          fileCommands,
          "-filter_complex",
          outCommands,
          outputPath,
        ];

        // exec conversion
        await ElFfmpeg.execFileAsync("ffmpeg", args.flat(), {
          timeout: timeout,
          maxBuffer: maxBuffer,
        });
        // finish
        resolve();

      } catch (e: any) {
        // error
        ElFfmpeg.logger.error(e);
        resolve();
      }
    });
  }

  // convert to m4a
  convertAudioToM4a(
    inputPath: string,
    outputPath: string,
    timeout: number,
    maxBuffer: number,
    quality: number,
    samplingrate: number,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // arguments
        const cmd = [
          'ffmpeg',
          "-y",
          "-i",
          inputPath,
          "-c:a",
          "aac",
          "-ar",
          `${samplingrate}`,
          "-b:a",
          `${quality}k`,
          outputPath,
        ];
        // exec conversion
        await ElFfmpeg.runCommandWithOutput(
          cmd,
          `Extracting chunk`
        );
        // finish
        resolve();

      } catch (e: any) {
        // error
        ElFfmpeg.logger.error(e);
        reject();
      }
    });
  }

  static runCommandWithOutput(
    cmd: string[],
    desc?: string
  ): Promise<void> {
    /**
     * Run a command and stream its output in real-time
     */
    if (desc) {
      console.log(`\n${desc}`);
    }

    return new Promise((resolve, reject) => {
      const process: any = spawn(cmd[0], cmd.slice(1), {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      process.stdout.on('data', (data: any) => {
        process.stdout.write(data.toString());
      });

      process.stderr.on('data', (data: any) => {
        process.stderr.write(data.toString());
      });

      process.on('close', (code: any) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });
    });
  }
}

// export module
export default ElFfmpeg;
