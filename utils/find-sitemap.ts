import axios from 'axios';
import cheerio from 'cheerio';

// Function to fetch the sitemap URL from the robots.txt file
async function getSitemapFromRobotsTxt(websiteUrl: string) {
  try {
    const response = await axios.get(`${websiteUrl}/robots.txt`);
    const robotsTxt = response.data;
    const sitemapLine = robotsTxt
      .split('\n')
      .find((line: string) => line.startsWith('Sitemap:'));
    if (sitemapLine) {
      return sitemapLine.split(' ')[1];
    }
  } catch (error: any) {
    console.error('Error fetching robots.txt:', error?.message);
  }
  return null;
}

// Function to fetch the sitemap.xml file directly from the website root
async function getSitemapFromRoot(websiteUrl: string) {
  try {
    const response = await axios.get(`${websiteUrl}/sitemap.xml`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sitemap.xml:', error?.message);
  }
  return null;
}

// Main function to find the sitemap of a website
async function findSitemap(websiteUrl: string) {
  let origin = websiteUrl;
  try {
    origin = new URL(websiteUrl).origin;
  } catch {}

  // First, try to find the sitemap URL from the robots.txt file
  const sitemapUrl = await getSitemapFromRobotsTxt(origin);
  if (sitemapUrl) {
    console.log('Sitemap URL found in robots.txt:', sitemapUrl);
    return sitemapUrl;
  }

  // If not found in robots.txt, try to fetch the sitemap.xml file directly from the website root
  const sitemapXml = await getSitemapFromRoot(origin);
  if (sitemapXml) {
    console.log('Sitemap XML found at website root:', sitemapXml);
    return sitemapXml;
  }

  // If both methods fail, the sitemap could not be found
  console.log('Sitemap not found');
  return null;
}

export default findSitemap;