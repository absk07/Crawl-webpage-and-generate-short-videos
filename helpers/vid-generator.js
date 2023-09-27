require('dotenv').config();
const Shotstack = require('shotstack-sdk');
const wordwrap = require('./wordWrap');

const defaultClient = Shotstack.ApiClient.instance;
const DeveloperKey = defaultClient.authentications['DeveloperKey'];
const api = new Shotstack.EditApi();

let apiUrl = 'https://api.shotstack.io/stage';

defaultClient.basePath = apiUrl;
DeveloperKey.apiKey = process.env.shotstack_stage_api_key;

async function renderVideo(images, texts, music) {
    let clips = [];

    let start = 0;
    
    // console.log(totalVideoLength)
    const totalVideoLength = 3.0;

    let soundtrack = new Shotstack.Soundtrack;
    soundtrack.setSrc(music).setEffect('fadeInFadeOut');

    const effects = ['zoomIn', 'zoomOut', 'slideLeft', 'slideRight', 'slideUp', 'slideDown'];

    const getRandomEffect = () => {
        return effects[Math.floor(Math.random() * effects.length)]
    }

    images.forEach((image, index) => {
        let imageAsset = new Shotstack.ImageAsset;
        imageAsset.setSrc(image);

        let clip = new Shotstack.Clip;
        clip.setAsset(imageAsset)
            .setStart(start)
            .setLength(totalVideoLength)
            .setEffect(getRandomEffect());

        start = start + totalVideoLength;
        clips.push(clip);
    });
    // console.log(clips)

    let track = new Shotstack.Track;
    track.setClips(clips);

    let timeline = new Shotstack.Timeline;
    timeline.setBackground('#000000').setSoundtrack(soundtrack).setTracks([track]);

    let output = new Shotstack.Output;
    output.setFormat('mp4').setResolution('hd').setFps(30);
    

    let edit = new Shotstack.Edit;
    edit.setTimeline(timeline).setOutput(output);

    try {
        const { response: { message, id } } = await api.postRender(edit);
        let editId = id;
        console.log('Rendering initiated. Edit ID:', editId);

        let status = 'pending';
        while (status !== 'done') {
            const { response: { status: currentStatus, url } } = await api.getRender(editId, { data: false, merged: true });

            if (currentStatus === 'done') {
                console.log('>> Asset URL: ' + url);
                return url;
            } else if (currentStatus === 'failed') {
                console.log('>> Something went wrong, rendering has terminated and will not continue.');
                return "Something went wrong, rendering has terminated and will not continue.";
            } else {
                console.log('>> Rendering in progress, waiting...\n');
                // Wait for a while before checking again (e.g., every 5 seconds)
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            status = currentStatus;
        }
        return "Something went wrong, rendering has terminated and will not continue.";
    } catch (error) {
        console.error('Request failed: ', error);
        throw Error(error);
    }
}

async function addTextToVideo(url, texts) {
    let start = 0;
    const textDuration = 2;
    const delayBetweenTexts = 0.5;

    const numTexts = texts.length;

    const totalVideoLength = (numTexts * textDuration) + ((numTexts - 1) * delayBetweenTexts);
    // console.log(totalVideoLength)

    let videoAsset = new Shotstack.VideoAsset;
    videoAsset
        .setSrc(url)
        .setVolume(1);

    videoClip = new Shotstack.Clip;
    videoClip
        .setAsset(videoAsset)
        .setLength(totalVideoLength)
        .setStart(start);

    let clips = [];
    
    texts.forEach((caption, index) => {
        let captionAsset = new Shotstack.HtmlAsset;
        captionAsset
            .setType('html')
            .setHtml(`<p>${wordwrap(caption, 20)}</p>`)
            .setCss('p { font-size: 32px; font-weight: bold; color: white; text-shadow: 2px 2px 16px #000000; }')
            .setPosition('bottom')

        let clip = new Shotstack.Clip;
        clip
            .setAsset(captionAsset)
            .setLength(textDuration)
            .setStart(index * (textDuration + delayBetweenTexts));

        clips.push(clip);
    });
    // console.log(clips)

    let track1 = new Shotstack.Track;
    track1.setClips(clips);

    let track2 = new Shotstack.Track;
    track2.setClips([videoClip]);

    let timeline = new Shotstack.Timeline;
    timeline.setTracks([track1, track2]);
    // console.log(timeline)

    let output = new Shotstack.Output;
    output.setFormat('mp4').setAspectRatio('1:1').setResolution('hd').setFps(30);
    // console.log(output)

    let edit = new Shotstack.Edit;
    edit.setTimeline(timeline).setOutput(output);

    try {
        const { response: { message, id } } = await api.postRender(edit);
        editId = id;
        console.log('Rendering initiated. Edit ID:', editId);

        let status = 'pending';
        while (status !== 'done') {
            const { response: { status: currentStatus, url } } = await api.getRender(editId, { data: false, merged: true });

            if (currentStatus === 'done') {
                console.log('>> Asset URL: ' + url);
                return url;
            } else if (currentStatus === 'failed') {
                console.log('>> Something went wrong, rendering has terminated and will not continue.');
                return "Something went wrong, rendering has terminated and will not continue.";
            } else {
                console.log('>> Rendering in progress, waiting...\n');
                // Wait for a while before checking again (e.g., every 5 seconds)
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            status = currentStatus;
        }
        return "Something went wrong, rendering has terminated and will not continue.";
    } catch (error) {
        console.error('Request failed: ', error);
        throw Error(error);
    }
}

module.exports = { renderVideo, addTextToVideo };