
module.exports = {
    siteUrl:
        process.env.SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://example.com'),
    generateRobotsTxt: false,
}