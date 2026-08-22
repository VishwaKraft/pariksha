function generateSiteMap(tests) {
  const baseUrl = 'https://pariksha-beta.vercel.app';
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${baseUrl}</loc>
     </url>
     ${tests
       .map(({ _id, title, updatedAt }) => {
         const testNameSlug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'test';
         return `
       <url>
           <loc>${baseUrl}/student/test/${testNameSlug}-${_id}-testid</loc>
           ${updatedAt ? `<lastmod>${new Date(updatedAt).toISOString()}</lastmod>` : ''}
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

export default function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  let tests = [];
  try {
    // Note: ensure process.env.NEXT_PUBLIC_API_URL is available in server-side Next.js
    // If not, we might need a fallback or hardcode it for production.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://pariksha-beta.vercel.app/api';
    const request = await fetch(apiUrl + '/public/tests');
    const response = await request.json();
    if (response && response.success && response.data) {
       tests = response.data;
    }
  } catch(e) {
    console.error("Error fetching public tests for sitemap", e);
  }

  const sitemap = generateSiteMap(tests);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}
