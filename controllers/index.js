const scrapeProductDetails = require('../helpers/crawler');
const { renderVideo, addTextToVideo } = require('../helpers/vid-generator');

const crawler = async (req, res) => {
    try {
        const keyword = req.body.keyword.replace(/[^\w\s]/gi, '');
        const products = await scrapeProductDetails(keyword);
        res.json({
            success: true,
            data: products
        });
    } catch (e) {
        console.log(e);
        res.json({
            error: true,
            message: e.message
        });
    }
}

const generator = async (req, res) => {
    try {
        const { images, texts, music } = req.body;
        const url = await renderVideo(images, texts, music);
        const response = await addTextToVideo(url, texts);
        res.json({
            success: true,
            data: { videoUrl: response }
        });
    } catch (e) {
        console.log(e);
        res.json({
            error: true,
            message: e.message
        });
    }
}

module.exports = { crawler, generator }