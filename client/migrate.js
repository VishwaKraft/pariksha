const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src/components/admin');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace MUI imports
  content = content.replace(/@material-ui\/core\/styles/g, '@mui/styles');
  content = content.replace(/@material-ui\/core/g, '@mui/material');
  content = content.replace(/@material-ui\/icons/g, '@mui/icons-material');
  content = content.replace(/@material-ui\/pickers/g, '@mui/x-date-pickers'); // if any
  
  // Replace React Router DOM
  content = content.replace(/import \{.*?withRouter.*?\} from ['"]react-router-dom['"];?/g, "import { withRouter } from 'next/router';\nimport Link from 'next/link';");
  content = content.replace(/import \{.*?withRouter.*?\} from ['"]react-router['"];?/g, "import { withRouter } from 'next/router';");
  content = content.replace(/import \{.*?Link.*?\} from ['"]react-router-dom['"];?/g, "import Link from 'next/link';");
  
  // Replace props.history.push with props.router.push
  content = content.replace(/props\.history\.push/g, 'props.router.push');
  
  // Add legacyBehavior to Link tags for Next.js 13+ compatibility if they wrap an a tag or component
  // Actually, Next.js 13+ Link works without legacyBehavior, but we are just replacing Link.
  
  fs.writeFileSync(file, content);
});

console.log('Admin components migration completed.');
