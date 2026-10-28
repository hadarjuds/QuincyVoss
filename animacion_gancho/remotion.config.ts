import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);

// Si ya tienes un Chrome / Chromium headless instalado, puedes usarlo con
// REMOTION_CHROME=/ruta/al/chrome npm run render
if (process.env.REMOTION_CHROME) {
	Config.setBrowserExecutable(process.env.REMOTION_CHROME);
}
