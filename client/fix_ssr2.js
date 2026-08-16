const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.js') && !fullPath.includes('_app.js') && !fullPath.includes('_document.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+['"](\.\.?\/.*?src\/components\/.*?)['"];/g;
            let hasChanges = false;
            let newImports = [];
            
            // Collect matches first to avoid index shifting issues
            const matches = [...content.matchAll(importRegex)];
            
            for (const match of matches) {
                hasChanges = true;
                const compName = match[1];
                const compPath = match[2];
                content = content.replace(match[0], '');
                newImports.push(`const ${compName} = dynamic(() => import('${compPath}'), { ssr: false });`);
            }
            
            if (hasChanges) {
                content = `${newImports.join('\n')}\n` + content;
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory('./pages');
