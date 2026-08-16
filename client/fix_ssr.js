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
            
            // Find all relative imports of components (e.g., from '../../src/components/...')
            const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+['"](\.\.?\/.*?src\/components\/.*?)['"];/g;
            let hasChanges = false;
            let newImports = [];
            
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                hasChanges = true;
                const compName = match[1];
                const compPath = match[2];
                // Remove the original import
                content = content.replace(match[0], '');
                // Add to new dynamic imports
                newImports.push(`const ${compName} = dynamic(() => import('${compPath}'), { ssr: false });`);
            }
            
            if (hasChanges) {
                // Prepend dynamic import and new imports
                content = `import dynamic from 'next/dynamic';\n${newImports.join('\n')}\n` + content;
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory('./pages');
