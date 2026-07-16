const fs = require('fs');
const path = require('path');

function splitRoute(filename, routePath) {
  const filepath = path.join(__dirname, 'src/routes', filename);
  if (!fs.existsSync(filepath)) return;
  
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Extract the head block roughly
  const headMatch = content.match(/head:\s*\(\)\s*=>\s*\(\{\s*meta:\s*\[[\s\S]*?\],\s*\}\),/);
  const headCode = headMatch ? headMatch[0] : '';
  
  // Create eager file
  const eagerCode = `import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("${routePath}")({
  ${headCode}
});
`;

  // Create lazy file
  let lazyCode = content;
  
  // Update imports: change createFileRoute to createLazyFileRoute
  if (lazyCode.includes('createFileRoute')) {
      lazyCode = lazyCode.replace(/createFileRoute/g, 'createLazyFileRoute');
  } else {
      lazyCode = `import { createLazyFileRoute } from "@tanstack/react-router";\n` + lazyCode;
  }
  
  // Remove the head block from the lazy file
  if (headCode) {
    lazyCode = lazyCode.replace(headCode, '');
  }
  
  // Write the files
  fs.writeFileSync(filepath, eagerCode);
  fs.writeFileSync(filepath.replace('.tsx', '.lazy.tsx'), lazyCode);
  console.log(`Split ${filename}`);
}

splitRoute('admin.tsx', '/admin');
splitRoute('dashboard.tsx', '/dashboard');
splitRoute('auth.tsx', '/auth');
