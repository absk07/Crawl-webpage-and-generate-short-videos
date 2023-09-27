const puppeteer = require('puppeteer');

async function scrapeProductDetails(keyword) {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(0);

        await page.goto(`https://www.alibaba.com/products/${keyword}.html`, { waitUntil: 'domcontentloaded' });

        // Click on the first 10 products
        const productLinks = await page.evaluate(() => {
            const productLinks = [];
            const productElements = document.querySelectorAll('.card-info h2 a');

            for (let i = 0; i < Math.min(productElements.length, 10); i++) {
                productLinks.push(productElements[i].href);
            }

            return productLinks;
        });
        
        // Extract data for the first 10 products
        const products = [];
        for (const productLink of productLinks) {
            const browser2 = await puppeteer.launch({ headless: 'new' });
            const productPage = await browser2.newPage();
            await productPage.goto(productLink, { waitUntil: 'domcontentloaded' });

            const videoContainer = await productPage.$('.react-dove-video');
            if (videoContainer) {
                await productPage.waitForSelector('.react-dove-video video');
            }

            const productData = await productPage.evaluate(async () => {
                const title = document.querySelector('.product-title h1')?.innerText.trim();
                let description = [];
                const tableRows = Array.from(document.querySelectorAll('.ife-detail-decorate-table table tbody tr'));
                tableRows.forEach(row => {
                    const item = row.querySelector('td:nth-child(1) div')?.innerText.trim();
                    const value = row.querySelector('td:nth-child(2) div')?.innerText.trim();
                    if (item && value) {
                        description.push(`${item}: ${value}`);
                    }
                });
    
                const images = Array.from(document.querySelectorAll('.detail-next-slick-slide img'))
                    .map(img => img.getAttribute('src'))
                    .filter(src => src.includes("100x100") && !src.includes("@img"))
                    .map(src => src.replace("100x100", "500x500"));
                const videoElement = document.querySelector('.react-dove-video video');
                const video = videoElement ? (videoElement.getAttribute('src')?.contains('https') ? videoElement.getAttribute('src') : `https:${videoElement.getAttribute('src')}`) : 'No video available';
    
                return { title, description, images, video };
            });

            products.push(productData);

            await browser2.close();
        }
        await browser.close();

        // console.log(products);
        return products;

    } catch (error) {
        throw Error(error);
    }
}

module.exports = scrapeProductDetails;